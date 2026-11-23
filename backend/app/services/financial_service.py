from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.entities import Return, Product, Category, Customer, Order

def get_financial_intelligence(
    db: Session,
    period: str = "30d",
    category_id: Optional[int] = None
) -> Dict[str, Any]:
    now = datetime.utcnow()
    days = 30 if period == "30d" else (7 if period == "7d" else (90 if period == "90d" else 365))
    start_dt = now - timedelta(days=days)

    query = db.query(Return).filter(Return.return_date >= start_dt)
    if category_id:
        query = query.filter(Return.product.has(Product.category_id == category_id))

    returns = query.all()

    total_refund = sum(r.refund_amount for r in returns)
    total_logistics = sum(r.reverse_logistics_cost for r in returns)
    total_restocking = sum(r.restocking_cost for r in returns)
    total_writeoff = sum(r.write_off_cost for r in returns)
    total_recoverable = sum(r.recoverable_value for r in returns)
    total_net_loss = total_refund + total_logistics + total_restocking + total_writeoff - total_recoverable

    # Cost by category
    cat_map: Dict[str, Dict[str, float]] = {}
    for r in returns:
        cat_name = r.product.category.category_name if r.product and r.product.category else "Unassigned"
        if cat_name not in cat_map:
            cat_map[cat_name] = {"refund": 0.0, "logistics": 0.0, "restocking": 0.0, "writeoff": 0.0, "recoverable": 0.0, "count": 0}
        cat_map[cat_name]["refund"] += r.refund_amount
        cat_map[cat_name]["logistics"] += r.reverse_logistics_cost
        cat_map[cat_name]["restocking"] += r.restocking_cost
        cat_map[cat_name]["writeoff"] += r.write_off_cost
        cat_map[cat_name]["recoverable"] += r.recoverable_value
        cat_map[cat_name]["count"] += 1

    by_category = []
    for cat_name, d in sorted(cat_map.items(), key=lambda x: (x[1]["refund"] + x[1]["logistics"] - x[1]["recoverable"]), reverse=True):
        cost = d["refund"] + d["logistics"] + d["restocking"] + d["writeoff"] - d["recoverable"]
        by_category.append({
            "category": cat_name,
            "returns_count": d["count"],
            "refund_amount": round(d["refund"], 2),
            "logistics_cost": round(d["logistics"], 2),
            "restocking_cost": round(d["restocking"], 2),
            "write_off_cost": round(d["writeoff"], 2),
            "recoverable_value": round(d["recoverable"], 2),
            "net_loss": round(cost, 2)
        })

    # Cost by reason
    reason_map: Dict[str, Dict[str, float]] = {}
    for r in returns:
        rs = r.return_reason
        if rs not in reason_map:
            reason_map[rs] = {"refund": 0.0, "logistics": 0.0, "writeoff": 0.0, "recoverable": 0.0, "count": 0}
        reason_map[rs]["refund"] += r.refund_amount
        reason_map[rs]["logistics"] += r.reverse_logistics_cost
        reason_map[rs]["writeoff"] += r.write_off_cost
        reason_map[rs]["recoverable"] += r.recoverable_value
        reason_map[rs]["count"] += 1

    by_reason = []
    for rs, d in sorted(reason_map.items(), key=lambda x: d["refund"], reverse=True):
        cost = d["refund"] + d["logistics"] + d["writeoff"] - d["recoverable"]
        by_reason.append({
            "reason": rs,
            "returns_count": d["count"],
            "refund_amount": round(d["refund"], 2),
            "logistics_cost": round(d["logistics"], 2),
            "net_loss": round(cost, 2)
        })

    # Monthly financial trend (last 6 months)
    monthly_trend = []
    for m in range(5, -1, -1):
        m_start = (now.replace(day=1) - timedelta(days=m * 30)).replace(day=1)
        m_end = (m_start + timedelta(days=32)).replace(day=1)
        m_returns = db.query(Return).filter(Return.return_date >= m_start, Return.return_date < m_end).all()
        
        m_ref = sum(r.refund_amount for r in m_returns)
        m_log = sum(r.reverse_logistics_cost for r in m_returns)
        m_rec = sum(r.recoverable_value for r in m_returns)
        m_loss = m_ref + m_log - m_rec
        
        monthly_trend.append({
            "month": m_start.strftime("%b %Y"),
            "refund_amount": round(m_ref, 2),
            "logistics_cost": round(m_log, 2),
            "recoverable_value": round(m_rec, 2),
            "net_loss": round(m_loss, 2),
            "returns_count": len(m_returns)
        })

    return {
        "kpis": {
            "gross_refund_amount": round(total_refund, 2),
            "reverse_logistics_cost": round(total_logistics, 2),
            "restocking_cost": round(total_restocking, 2),
            "write_off_cost": round(total_writeoff, 2),
            "recoverable_value": round(total_recoverable, 2),
            "net_financial_loss": round(total_net_loss, 2),
            "average_return_refund": round(total_refund / max(1, len(returns)), 2),
            "returns_count": len(returns)
        },
        "by_category": by_category,
        "by_reason": by_reason,
        "monthly_trend": monthly_trend,
        "formula_documentation": {
            "formula": "Total Net Return Cost = Gross Refund + Reverse Logistics + Restocking + Write-off - Recoverable Salvage Value",
            "explanation": "Gross refund value is customer outflow; net loss accounts for logistics waste, restocking friction, product degradation, offset by recovered inventory resale value."
        }
    }
