from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.entities import Return
from app.schemas.schemas import ReturnDetailResponse
from app.services.returns_service import get_returns_list, get_return_detail

router = APIRouter(prefix="/returns", tags=["Returns"])

@router.get("")
def list_returns(
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    product_id: Optional[int] = None,
    return_reason: Optional[str] = None,
    return_status: Optional[str] = None,
    shipping_state: Optional[str] = None,
    min_refund: Optional[float] = None,
    max_refund: Optional[float] = None,
    sort_by: str = Query("return_date", pattern="^(return_date|refund_amount|return_number)$"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    sb = sort_by if isinstance(sort_by, str) else getattr(sort_by, "default", "return_date")
    so = sort_order if isinstance(sort_order, str) else getattr(sort_order, "default", "desc")
    p = page if isinstance(page, int) else getattr(page, "default", 1)
    ps = page_size if isinstance(page_size, int) else getattr(page_size, "default", 20)

    return get_returns_list(
        db=db,
        search=search,
        category_id=category_id,
        product_id=product_id,
        return_reason=return_reason,
        return_status=return_status,
        shipping_state=shipping_state,
        min_refund=min_refund,
        max_refund=max_refund,
        sort_by=sb,
        sort_order=so,
        page=p,
        page_size=ps
    )

@router.get("/reasons")
def list_unique_reasons(db: Session = Depends(get_db)):
    reasons = db.query(Return.return_reason).distinct().all()
    return [r[0] for r in reasons if r[0]]

@router.get("/{id}", response_model=ReturnDetailResponse)
def get_return(id: int, db: Session = Depends(get_db)):
    ret = get_return_detail(db, return_id=id)
    if not ret:
        raise HTTPException(status_code=404, detail="Return record not found")
    return ret
