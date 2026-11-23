from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.entities import Category
from app.schemas.schemas import ProductDetailResponse
from app.services.product_service import get_products_list, get_product_detail

router = APIRouter(prefix="/products", tags=["Products"])

@router.get("")
def list_products(
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    brand: Optional[str] = None,
    risk_tier: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort_by: str = Query("return_rate", pattern="^(return_rate|orders|returns|financial_cost|price|id)$"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    sb = sort_by if isinstance(sort_by, str) else getattr(sort_by, "default", "return_rate")
    so = sort_order if isinstance(sort_order, str) else getattr(sort_order, "default", "desc")
    p = page if isinstance(page, int) else getattr(page, "default", 1)
    ps = page_size if isinstance(page_size, int) else getattr(page_size, "default", 20)

    return get_products_list(
        db=db,
        search=search,
        category_id=category_id,
        brand=brand,
        risk_tier=risk_tier,
        min_price=min_price,
        max_price=max_price,
        sort_by=sb,
        sort_order=so,
        page=p,
        page_size=ps
    )

@router.get("/categories")
def list_categories(db: Session = Depends(get_db)):
    cats = db.query(Category).order_by(Category.category_name.asc()).all()
    return [{"id": c.id, "name": c.category_name} for c in cats]

@router.get("/{id}", response_model=ProductDetailResponse)
def get_product(id: int, db: Session = Depends(get_db)):
    prod = get_product_detail(db, product_id=id)
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")
    return prod
