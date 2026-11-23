from datetime import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc

from app.models.entities import Return, Order, Customer, Product, Category, OrderItem
from app.schemas.schemas import ReturnListItem, ReturnDetailResponse

def get_returns_list(
    db: Session,
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    product_id: Optional[int] = None,
    return_reason: Optional[str] = None,
    return_status: Optional[str] = None,
    shipping_state: Optional[str] = None,
    min_refund: Optional[float] = None,
    max_refund: Optional[float] = None,
    sort_by: str = "return_date",
    sort_order: str = "desc",
    page: int = 1,
    page_size: int = 20
) -> Dict[str, Any]:
    query = db.query(Return).join(Return.order).join(Return.customer).join(Return.product)

    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            (Return.return_number.ilike(search_fmt)) |
            (Order.order_number.ilike(search_fmt)) |
            (Customer.customer_name.ilike(search_fmt)) |
            (Customer.customer_code.ilike(search_fmt)) |
            (Product.product_name.ilike(search_fmt)) |
            (Product.product_code.ilike(search_fmt)) |
            (Return.return_reason.ilike(search_fmt))
        )

    if category_id:
        query = query.filter(Product.category_id == category_id)
    if product_id:
        query = query.filter(Return.product_id == product_id)
    if return_reason and return_reason.lower() != "all":
        query = query.filter(Return.return_reason == return_reason)
    if return_status and return_status.lower() != "all":
        query = query.filter(Return.return_status == return_status)
    if shipping_state and shipping_state.lower() != "all":
        query = query.filter(Customer.state == shipping_state)
    if min_refund is not None:
        query = query.filter(Return.refund_amount >= min_refund)
    if max_refund is not None:
        query = query.filter(Return.refund_amount <= max_refund)

    total_count = query.count()

    # Sorting
    if sort_by == "refund_amount":
        query = query.order_by(desc(Return.refund_amount) if sort_order == "desc" else asc(Return.refund_amount))
    elif sort_by == "return_number":
        query = query.order_by(desc(Return.return_number) if sort_order == "desc" else asc(Return.return_number))
    else:  # default return_date
        query = query.order_by(desc(Return.return_date) if sort_order == "desc" else asc(Return.return_date))

    offset = (page - 1) * page_size
    records = query.offset(offset).limit(page_size).all()

    items = []
    for r in records:
        total_cost = r.refund_amount + r.reverse_logistics_cost + r.restocking_cost + r.write_off_cost - r.recoverable_value
        items.append(ReturnListItem(
            id=r.id,
            return_number=r.return_number,
            order_id=r.order_id,
            order_number=r.order.order_number,
            customer_id=r.customer_id,
            customer_name=r.customer.customer_name,
            customer_code=r.customer.customer_code,
            product_id=r.product_id,
            product_name=r.product.product_name,
            product_code=r.product.product_code,
            category_name=r.product.category.category_name,
            return_reason=r.return_reason,
            return_date=r.return_date,
            refund_amount=round(r.refund_amount, 2),
            reverse_logistics_cost=round(r.reverse_logistics_cost, 2),
            total_cost=round(total_cost, 2),
            return_status=r.return_status,
            shipping_state=r.order.shipping_state
        ))

    return {
        "items": items,
        "total": total_count,
        "page": page,
        "page_size": page_size,
        "total_pages": max(1, (total_count + page_size - 1) // page_size)
    }

def get_return_detail(db: Session, return_id: int) -> Optional[ReturnDetailResponse]:
    r = db.query(Return).filter(Return.id == return_id).first()
    if not r:
        return None

    cust_prior_orders = db.query(Order).filter(Order.customer_id == r.customer_id).count()
    cust_prior_returns = db.query(Return).filter(Return.customer_id == r.customer_id).count()
    net_loss = r.refund_amount + r.reverse_logistics_cost + r.restocking_cost + r.write_off_cost - r.recoverable_value

    return ReturnDetailResponse(
        id=r.id,
        return_number=r.return_number,
        order_number=r.order.order_number,
        order_date=r.order.order_date,
        payment_method=r.order.payment_method,
        customer_name=r.customer.customer_name,
        customer_code=r.customer.customer_code,
        customer_segment=r.customer.customer_segment,
        region=r.customer.region,
        state=r.customer.state,
        product_name=r.product.product_name,
        product_code=r.product.product_code,
        category_name=r.product.category.category_name,
        brand=r.product.brand,
        unit_price=r.product.selling_price,
        return_date=r.return_date,
        return_reason=r.return_reason,
        return_status=r.return_status,
        refund_amount=round(r.refund_amount, 2),
        reverse_logistics_cost=round(r.reverse_logistics_cost, 2),
        restocking_cost=round(r.restocking_cost, 2),
        write_off_cost=round(r.write_off_cost, 2),
        recoverable_value=round(r.recoverable_value, 2),
        net_loss=round(net_loss, 2),
        related_orders_count=cust_prior_orders,
        customer_prior_returns_count=cust_prior_returns
    )
