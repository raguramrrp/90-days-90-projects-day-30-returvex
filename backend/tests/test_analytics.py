import pytest
from app.core.database import SessionLocal
from app.services.analytics_service import (
    get_dashboard_summary, get_return_trends, get_return_reasons,
    get_top_returning_products, get_regional_analysis
)
from app.services.financial_service import get_financial_intelligence

@pytest.fixture
def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def test_dashboard_summary_kpis(db_session):
    summary = get_dashboard_summary(db_session, period="30d")
    assert summary is not None
    assert summary.total_orders > 0
    assert summary.return_rate.value >= 0.0 and summary.return_rate.value <= 100.0
    assert summary.total_returns.value >= 0
    assert summary.net_loss >= 0.0
    assert summary.currency_symbol == "₹"

def test_financial_accounting_formula(db_session):
    fin = get_financial_intelligence(db_session, period="30d")
    kpis = fin["kpis"]
    # Verify: Net Loss = Refund + Logistics + Restocking + WriteOff - Recoverable
    expected_net = (
        kpis["gross_refund_amount"]
        + kpis["reverse_logistics_cost"]
        + kpis["restocking_cost"]
        + kpis["write_off_cost"]
        - kpis["recoverable_value"]
    )
    assert abs(kpis["net_financial_loss"] - expected_net) < 1.0

def test_return_reasons_distribution(db_session):
    reasons = get_return_reasons(db_session, period="30d")
    assert len(reasons) > 0
    total_pct = sum(r.percentage for r in reasons)
    assert abs(total_pct - 100.0) < 2.0  # rounding allowance

def test_top_products_ranking(db_session):
    prods = get_top_returning_products(db_session, period="30d", limit=5)
    assert len(prods) <= 5
    if len(prods) > 1:
        # verify sorted descending by return rate
        assert prods[0].return_rate >= prods[1].return_rate

def test_regional_analysis(db_session):
    regions = get_regional_analysis(db_session, period="30d")
    assert len(regions) > 0
    for r in regions:
        assert r.total_orders >= r.returned_orders
        assert r.return_rate >= 0.0 and r.return_rate <= 100.0
