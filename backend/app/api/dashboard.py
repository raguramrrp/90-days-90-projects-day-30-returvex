from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.schemas import (
    DashboardSummaryResponse, TrendPoint, ReasonBreakdown,
    TopProductSummary, RegionalReturnPoint, InsightFeedItem
)
from app.services.analytics_service import (
    get_dashboard_summary, get_return_trends, get_return_reasons,
    get_top_returning_products, get_regional_analysis, get_automated_insights
)

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary", response_model=DashboardSummaryResponse)
def summary_endpoint(
    period: str = Query("30d", pattern="^(7d|30d|90d|12m)$"),
    category_id: Optional[int] = None,
    region: Optional[str] = None,
    db: Session = Depends(get_db)
):
    return get_dashboard_summary(db, period=period, category_id=category_id, region=region)

@router.get("/trends", response_model=List[TrendPoint])
def trends_endpoint(
    period: str = Query("30d", pattern="^(7d|30d|90d|12m)$"),
    category_id: Optional[int] = None,
    region: Optional[str] = None,
    db: Session = Depends(get_db)
):
    return get_return_trends(db, period=period, category_id=category_id, region=region)

@router.get("/reasons", response_model=List[ReasonBreakdown])
def reasons_endpoint(
    period: str = Query("30d", pattern="^(7d|30d|90d|12m)$"),
    category_id: Optional[int] = None,
    region: Optional[str] = None,
    db: Session = Depends(get_db)
):
    return get_return_reasons(db, period=period, category_id=category_id, region=region)

@router.get("/products", response_model=List[TopProductSummary])
def products_endpoint(
    period: str = Query("30d", pattern="^(7d|30d|90d|12m)$"),
    limit: int = Query(5, ge=1, le=50),
    category_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    return get_top_returning_products(db, period=period, limit=limit, category_id=category_id)

@router.get("/regions", response_model=List[RegionalReturnPoint])
def regions_endpoint(
    period: str = Query("30d", pattern="^(7d|30d|90d|12m)$"),
    category_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    return get_regional_analysis(db, period=period, category_id=category_id)

@router.get("/insights", response_model=List[InsightFeedItem])
def insights_endpoint(
    period: str = Query("30d", pattern="^(7d|30d|90d|12m)$"),
    db: Session = Depends(get_db)
):
    return get_automated_insights(db, period=period)
