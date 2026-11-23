from fastapi import APIRouter, Depends, UploadFile, File, Body, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.core.database import get_db
from app.services.import_service import (
    stage_file_upload, validate_staged_data, commit_staged_import,
    get_import_history, REQUIRED_COLUMNS_BY_TYPE
)

router = APIRouter(prefix="/import", tags=["Data Management"])

@router.post("/preview")
def preview_upload(file: UploadFile = File(...)):
    return stage_file_upload(file)

@router.post("/validate")
def validate_upload(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    token = payload.get("file_token")
    source_type = payload.get("source_type", "products")
    mapping = payload.get("mapping", {})
    if not token:
        raise HTTPException(status_code=400, detail="file_token is required")
    return validate_staged_data(db, token=token, source_type=source_type, mapping=mapping)

@router.post("/commit")
def commit_upload(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    token = payload.get("file_token")
    source_type = payload.get("source_type", "products")
    mapping = payload.get("mapping", {})
    if not token:
        raise HTTPException(status_code=400, detail="file_token is required")
    return commit_staged_import(db, token=token, source_type=source_type, mapping=mapping)

@router.get("/history")
def import_history_endpoint(db: Session = Depends(get_db)):
    return get_import_history(db)

@router.get("/template/{source_type}")
def get_sample_template(source_type: str):
    cols = REQUIRED_COLUMNS_BY_TYPE.get(source_type)
    if not cols:
        raise HTTPException(status_code=404, detail="Unknown source type template")
    csv_str = ",".join(cols) + "\n"
    return Response(
        content=csv_str,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=returvex_{source_type}_template.csv"}
    )
