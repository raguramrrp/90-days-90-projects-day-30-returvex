from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.schemas import RootCauseOverview
from app.services.root_cause_service import get_root_causes_overview

router = APIRouter(prefix="/root-causes", tags=["Root Causes"])

@router.get("/overview", response_model=RootCauseOverview)
def root_causes_overview_endpoint(
    period: str = Query("30d", pattern="^(7d|30d|90d)$"),
    db: Session = Depends(get_db)
):
    return get_root_causes_overview(db, period=period)
