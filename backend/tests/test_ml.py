import pytest
from app.core.database import SessionLocal
from app.services.ml_service import (
    predict_return_risk, get_loaded_model, get_model_performance
)
from app.schemas.schemas import PredictionRequest

@pytest.fixture
def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def test_model_pipeline_loads():
    model = get_loaded_model()
    assert model is not None
    assert hasattr(model, "predict_proba")
    assert hasattr(model, "predict")

def test_prediction_inference(db_session):
    req = PredictionRequest(
        category_name="Apparel & Fashion",
        selling_price=2499.0,
        discount_amount=250.0,
        customer_order_count=3,
        customer_prior_return_rate=0.33,
        estimated_delivery_days=4,
        shipping_state="Maharashtra",
        order_quantity=1,
        payment_method="UPI"
    )
    res = predict_return_risk(db_session, req)
    assert res is not None
    assert 0.0 <= res.predicted_probability <= 1.0
    assert res.predicted_class in [0, 1]
    assert res.risk_tier in ["Low", "Moderate", "High", "Critical"]
    assert len(res.top_contributing_factors) > 0
    assert len(res.explanation) > 10
    assert len(res.actionable_recommendation) > 10

def test_model_performance_metrics(db_session):
    metrics = get_model_performance(db_session)
    assert metrics is not None
    assert metrics.accuracy > 0.5
    assert metrics.roc_auc > 0.5
    assert "true_positives" in metrics.confusion_matrix
    assert len(metrics.feature_importances) > 0
