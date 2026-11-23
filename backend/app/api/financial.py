from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.financial_service import get_financial_intelligence

router = APIRouter(prefix="/financial", tags=["Financial Intelligence"])

@router.get("/overview")
def financial_overview_endpoint(
    period: str = Query("30d", pattern="^(7d|30d|90d|12m)$"),
    category_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    return get_financial_intelligence(db, period=period, category_id=category_id)
