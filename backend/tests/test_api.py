import pytest
from app.core.database import SessionLocal
from app.api.dashboard import summary_endpoint, trends_endpoint, reasons_endpoint, products_endpoint, regions_endpoint
from app.api.products import list_products, get_product
from app.api.returns import list_returns
from app.api.root_causes import root_causes_overview_endpoint
from app.api.financial import financial_overview_endpoint
from app.api.settings import get_settings_endpoint
from app.api.reports import generate_report_endpoint
from app.api.predictions import predict_endpoint, model_performance_endpoint
from app.schemas.schemas import PredictionRequest, ReportGenerateRequest

@pytest.fixture
def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def test_endpoint_dashboard_summary(db_session):
    data = summary_endpoint(period="30d", db=db_session)
    assert data.total_orders > 0
    assert data.return_rate.value >= 0.0
    assert data.total_returns.value >= 0

def test_endpoint_dashboard_trends(db_session):
    trends = trends_endpoint(period="30d", db=db_session)
    assert len(trends) > 0
    assert hasattr(trends[0], "total_orders")

def test_endpoint_products_list(db_session):
    res = list_products(page=1, page_size=10, db=db_session)
    assert "items" in res
    assert len(res["items"]) <= 10

def test_endpoint_product_detail(db_session):
    res = list_products(page=1, page_size=1, db=db_session)
    p_id = res["items"][0].id
    detail = get_product(id=p_id, db=db_session)
    assert detail.id == p_id
    assert detail.return_rate >= 0.0

def test_endpoint_returns_list(db_session):
    res = list_returns(page=1, page_size=10, db=db_session)
    assert "items" in res
    assert len(res["items"]) <= 10

def test_endpoint_root_causes(db_session):
    res = root_causes_overview_endpoint(period="30d", db=db_session)
    assert len(res.findings) > 0
    assert len(res.pareto_data) > 0

def test_endpoint_financial_overview(db_session):
    res = financial_overview_endpoint(period="30d", db=db_session)
    assert "kpis" in res
    assert res["kpis"]["gross_refund_amount"] >= 0

def test_endpoint_predictions_predict(db_session):
    req = PredictionRequest(
        category_name="Footwear",
        selling_price=3299.0,
        discount_amount=300.0,
        customer_order_count=2,
        customer_prior_return_rate=0.20,
        estimated_delivery_days=4,
        shipping_state="Delhi",
        order_quantity=1,
        payment_method="Cash on Delivery"
    )
    res = predict_endpoint(request=req, db=db_session)
    assert 0.0 <= res.predicted_probability <= 1.0
    assert res.risk_tier in ["Low", "Moderate", "High", "Critical"]

def test_endpoint_reports_generate(db_session):
    req = ReportGenerateRequest(report_type="executive", period="30d")
    res = generate_report_endpoint(request=req, db=db_session)
    assert "summary_kpis" in res
    assert "top_reasons" in res

def test_endpoint_settings(db_session):
    res = get_settings_endpoint(db=db_session)
    assert "settings" in res
    assert res["settings"]["currency_symbol"] == "₹"
