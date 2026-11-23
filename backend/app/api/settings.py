from datetime import datetime
from fastapi import APIRouter, Depends, Body, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.core.database import get_db, engine
from app.models.entities import SystemSetting, Order, Return, Product, Customer
from scripts.seed_data import generate_synthetic_data
from scripts.train_model import train_and_evaluate_models

router = APIRouter(prefix="/settings", tags=["Settings"])

@router.get("")
def get_settings_endpoint(db: Session = Depends(get_db)):
    settings_records = db.query(SystemSetting).all()
    res = {}
    for s in settings_records:
        res[s.key] = s.value

    # Database health stats
    orders_cnt = db.query(Order).count()
    returns_cnt = db.query(Return).count()
    prods_cnt = db.query(Product).count()
    custs_cnt = db.query(Customer).count()

    is_postgres = not str(engine.url).startswith("sqlite")
    
    return {
        "settings": {
            "currency_symbol": res.get("currency_symbol", "₹"),
            "reverse_logistics_fee": float(res.get("reverse_logistics_fee", 120.0)),
            "restocking_percent": float(res.get("restocking_percent", 0.05)),
            "write_off_percent": float(res.get("write_off_percent", 0.15)),
            "recoverable_percent": float(res.get("recoverable_percent", 0.80)),
            "risk_threshold_low": float(res.get("risk_threshold_low", 8.0)),
            "risk_threshold_moderate": float(res.get("risk_threshold_moderate", 15.0)),
            "risk_threshold_high": float(res.get("risk_threshold_high", 25.0)),
        },
        "database": {
            "engine": "PostgreSQL (Connected)" if is_postgres else "SQLite (Local Embedded)",
            "status": "Operational",
            "url_masked": str(engine.url).split("@")[-1] if "@" in str(engine.url) else "returvex.db",
            "total_orders": orders_cnt,
            "total_returns": returns_cnt,
            "total_products": prods_cnt,
            "total_customers": custs_cnt
        }
    }

@router.put("")
def update_settings_endpoint(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    for key, val in payload.items():
        setting = db.query(SystemSetting).filter(SystemSetting.key == key).first()
        if setting:
            setting.value = str(val)
            setting.updated_at = datetime.utcnow()
        else:
            db.add(SystemSetting(key=key, value=str(val), updated_at=datetime.utcnow()))
    db.commit()
    return {"message": "Settings updated successfully", "updated_keys": list(payload.keys())}

@router.post("/reseed")
def reseed_database_endpoint():
    try:
        generate_synthetic_data(num_customers=1000, num_products=100, num_orders=5000, seed=42)
        train_and_evaluate_models()
        return {"success": True, "message": "Database and ML models reseeded successfully with reproducible seed 42."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Reseed failed: {str(e)}")
