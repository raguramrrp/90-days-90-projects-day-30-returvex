from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.schemas import (
    PredictionRequest, PredictionResponse, ModelPerformanceResponse
)
from app.services.ml_service import (
    predict_return_risk, get_prediction_history, get_model_performance
)

router = APIRouter(prefix="/predictions", tags=["Predictions"])

@router.post("/predict", response_model=PredictionResponse)
def predict_endpoint(request: PredictionRequest, db: Session = Depends(get_db)):
    return predict_return_risk(db, request)

@router.get("/history")
def history_endpoint(
    risk_tier: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    return get_prediction_history(db, risk_tier=risk_tier, page=page, page_size=page_size)

@router.get("/model-performance", response_model=ModelPerformanceResponse)
def model_performance_endpoint(db: Session = Depends(get_db)):
    return get_model_performance(db)
