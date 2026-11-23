from datetime import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, asc

from app.models.entities import (
    Product, Category, Vendor, Order, OrderItem, Return, Customer
)
from app.schemas.schemas import (
    ProductListItem, ProductDetailResponse, ReasonBreakdown, RegionalReturnPoint
)

def get_products_list(
    db: Session,
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    brand: Optional[str] = None,
    risk_tier: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort_by: str = "return_rate",
    sort_order: str = "desc",
    page: int = 1,
    page_size: int = 20
) -> Dict[str, Any]:
    query = db.query(Product)

    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            (Product.product_name.ilike(search_fmt)) |
            (Product.product_code.ilike(search_fmt)) |
            (Product.brand.ilike(search_fmt))
        )
    if category_id:
        query = query.filter(Product.category_id == category_id)
    if brand:
        query = query.filter(Product.brand.ilike(f"%{brand}%"))
    if min_price is not None:
        query = query.filter(Product.selling_price >= min_price)
    if max_price is not None:
        query = query.filter(Product.selling_price <= max_price)

    all_prods = query.all()

    # Calculate statistics for each product
    items = []
    for p in all_prods:
        orders_cnt = db.query(OrderItem).filter(OrderItem.product_id == p.id).count()
        returns_list = db.query(Return).filter(Return.product_id == p.id).all()
        ret_cnt = len(returns_list)
        ret_rate = (ret_cnt / orders_cnt * 100) if orders_cnt > 0 else 0.0
        fin_cost = sum(
            r.refund_amount + r.reverse_logistics_cost + r.restocking_cost + r.write_off_cost - r.recoverable_value
            for r in returns_list
        )

        if ret_rate < 8.0:
            tier = "Low"
        elif ret_rate < 16.0:
            tier = "Moderate"
        elif ret_rate < 26.0:
            tier = "High"
        else:
            tier = "Critical"

        if risk_tier and risk_tier.lower() != "all" and tier.lower() != risk_tier.lower():
            continue

        items.append(ProductListItem(
            id=p.id,
            product_code=p.product_code,
            product_name=p.product_name,
            category_id=p.category_id,
            category_name=p.category.category_name,
            brand=p.brand,
            vendor_name=p.vendor.vendor_name,
            selling_price=p.selling_price,
            orders_count=orders_cnt,
            returns_count=ret_cnt,
            return_rate=round(ret_rate, 2),
            financial_cost=round(fin_cost, 2),
            risk_tier=tier
        ))

    # Sorting
    reverse = (sort_order.lower() == "desc")
    if sort_by == "return_rate":
        items.sort(key=lambda x: x.return_rate, reverse=reverse)
    elif sort_by == "orders":
        items.sort(key=lambda x: x.orders_count, reverse=reverse)
    elif sort_by == "returns":
        items.sort(key=lambda x: x.returns_count, reverse=reverse)
    elif sort_by == "financial_cost":
        items.sort(key=lambda x: x.financial_cost, reverse=reverse)
    elif sort_by == "price":
        items.sort(key=lambda x: x.selling_price, reverse=reverse)
    else:
        items.sort(key=lambda x: x.id, reverse=reverse)

    total_count = len(items)
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    paged_items = items[start_idx:end_idx]

    return {
        "items": paged_items,
        "total": total_count,
        "page": page,
        "page_size": page_size,
        "total_pages": max(1, (total_count + page_size - 1) // page_size)
    }

def get_product_detail(db: Session, product_id: int) -> Optional[ProductDetailResponse]:
    prod = db.query(Product).filter(Product.id == product_id).first()
    if not prod:
        return None

    orders_cnt = db.query(OrderItem).filter(OrderItem.product_id == prod.id).count()
    returns = db.query(Return).filter(Return.product_id == prod.id).all()
    returns_cnt = len(returns)
    ret_rate = (returns_cnt / orders_cnt * 100) if orders_cnt > 0 else 0.0

    # Category benchmark
    cat_prods = db.query(Product).filter(Product.category_id == prod.category_id).all()
    cat_p_ids = [p.id for p in cat_prods]
    cat_orders = db.query(OrderItem).filter(OrderItem.product_id.in_(cat_p_ids)).count()
    cat_returns = db.query(Return).filter(Return.product_id.in_(cat_p_ids)).count()
    cat_avg_rate = (cat_returns / cat_orders * 100) if cat_orders > 0 else 0.0
    benchmark_variance = ret_rate - cat_avg_rate

    refund_amt = sum(r.refund_amount for r in returns)
    logistics_cost = sum(r.reverse_logistics_cost for r in returns)
    restocking_cost = sum(r.restocking_cost for r in returns)
    write_off_cost = sum(r.write_off_cost for r in returns)
    recoverable = sum(r.recoverable_value for r in returns)
    net_loss = refund_amt + logistics_cost + restocking_cost + write_off_cost - recoverable

    if ret_rate < 8.0:
        tier = "Low"
        explanation = "This product performs consistently well with a return rate well below the category benchmark. Customer satisfaction metrics are healthy."
    elif ret_rate < 16.0:
        tier = "Moderate"
        explanation = "Return frequency is in line with broader e-commerce industry averages. Routine sizing or minor expectation mismatches observed."
    elif ret_rate < 26.0:
        tier = "High"
        explanation = "Elevated return velocity exceeding normal thresholds. Requires catalog review, enhanced sizing guidance, or inspection of batch consistency."
    else:
        tier = "Critical"
        explanation = f"Critical return anomaly detected. Return rate ({ret_rate:.1f}%) is {benchmark_variance:+.1f}% above the {prod.category.category_name} benchmark. High financial impact requires immediate vendor quality audit or packaging intervention."

    # Reasons breakdown
    reasons_counts: Dict[str, Dict[str, float]] = {}
    for r in returns:
        rs = r.return_reason
        if rs not in reasons_counts:
            reasons_counts[rs] = {"count": 0, "refund": 0.0, "cost": 0.0}
        reasons_counts[rs]["count"] += 1
        reasons_counts[rs]["refund"] += r.refund_amount
        cost = r.refund_amount + r.reverse_logistics_cost + r.restocking_cost + r.write_off_cost - r.recoverable_value
        reasons_counts[rs]["cost"] += cost

    reasons_breakdown = []
    for rs, data in sorted(reasons_counts.items(), key=lambda x: x[1]["count"], reverse=True):
        cnt = int(data["count"])
        pct = (cnt / returns_cnt * 100) if returns_cnt > 0 else 0.0
        reasons_breakdown.append(ReasonBreakdown(
            reason=rs,
            count=cnt,
            percentage=round(pct, 2),
            refund_amount=round(data["refund"], 2),
            financial_cost=round(data["cost"], 2)
        ))

    # Regional breakdown
    state_map: Dict[str, Dict[str, Any]] = {}
    for r in returns:
        st = r.customer.state if r.customer else "Unknown"
        reg = r.customer.region if r.customer else "Unknown"
        if st not in state_map:
            state_map[st] = {"region": reg, "returns": 0, "impact": 0.0}
        state_map[st]["returns"] += 1
        state_map[st]["impact"] += (r.refund_amount + r.reverse_logistics_cost - r.recoverable_value)

    reg_points = []
    for st, d in sorted(state_map.items(), key=lambda x: x[1]["returns"], reverse=True):
        reg_points.append(RegionalReturnPoint(
            state=st,
            region=d["region"],
            total_orders=orders_cnt,
            returned_orders=d["returns"],
            return_rate=round(d["returns"] / max(1, orders_cnt) * 100, 2),
            financial_impact=round(d["impact"], 2)
        ))

    # Recent return records
    recent_records = []
    for r in sorted(returns, key=lambda x: x.return_date, reverse=True)[:10]:
        recent_records.append({
            "return_number": r.return_number,
            "order_number": r.order.order_number if r.order else "N/A",
            "customer_name": r.customer.customer_name if r.customer else "N/A",
            "state": r.customer.state if r.customer else "N/A",
            "return_reason": r.return_reason,
            "return_date": r.return_date.strftime("%Y-%m-%d"),
            "refund_amount": r.refund_amount,
            "return_status": r.return_status
        })

    return ProductDetailResponse(
        id=prod.id,
        product_code=prod.product_code,
        product_name=prod.product_name,
        category_name=prod.category.category_name,
        brand=prod.brand,
        vendor_name=prod.vendor.vendor_name,
        selling_price=prod.selling_price,
        created_at=prod.created_at,
        total_orders=orders_cnt,
        total_returns=returns_cnt,
        return_rate=round(ret_rate, 2),
        category_avg_return_rate=round(cat_avg_rate, 2),
        benchmark_variance_pct=round(benchmark_variance, 2),
        refund_amount=round(refund_amt, 2),
        reverse_logistics_cost=round(logistics_cost, 2),
        total_financial_loss=round(net_loss, 2),
        risk_tier=tier,
        risk_explanation=explanation,
        reasons_breakdown=reasons_breakdown,
        regional_breakdown=reg_points,
        recent_returns=recent_records
    )
