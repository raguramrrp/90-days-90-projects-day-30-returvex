from typing import Optional
from fastapi import APIRouter, Depends, Query, Body
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.schemas import ReportGenerateRequest
from app.services.report_service import (
    generate_report_data, export_report_csv, export_report_pdf
)

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.post("/generate")
def generate_report_endpoint(
    request: ReportGenerateRequest,
    db: Session = Depends(get_db)
):
    return generate_report_data(
        db=db,
        report_type=request.report_type,
        period=request.period,
        category_id=request.category_id
    )

@router.get("/export-csv")
def export_csv_endpoint(
    report_type: str = Query("executive", pattern="^(executive|product|financial|regional)$"),
    period: str = Query("30d", pattern="^(7d|30d|90d|12m)$"),
    db: Session = Depends(get_db)
):
    return export_report_csv(db, report_type=report_type, period=period)

@router.get("/export-pdf")
def export_pdf_endpoint(
    report_type: str = Query("executive", pattern="^(executive|product|financial|regional)$"),
    period: str = Query("30d", pattern="^(7d|30d|90d|12m)$"),
    db: Session = Depends(get_db)
):
    return export_report_pdf(db, report_type=report_type, period=period)
