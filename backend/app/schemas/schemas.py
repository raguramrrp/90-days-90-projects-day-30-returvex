from datetime import datetime
from typing import Optional, Any, List, Dict
from pydantic import BaseModel, Field

# --- Dashboard Schemas ---
class KPIMetric(BaseModel):
    value: float
    previous_value: float
    change_pct: float
    trend: str  # "up", "down", "neutral"
    is_positive_improvement: bool

class DashboardSummaryResponse(BaseModel):
    return_rate: KPIMetric
    total_returns: KPIMetric
    return_cost: KPIMetric
    return_risk: KPIMetric
    total_orders: int
    total_refund_amount: float
    total_reverse_logistics: float
    total_restocking_cost: float
    total_write_off_cost: float
    total_recoverable_value: float
    net_loss: float
    currency_symbol: str = "₹"
    period_label: str

class TrendPoint(BaseModel):
    date: str
    total_orders: int
    returned_orders: int
    return_rate: float
    total_sales: float
    refund_amount: float

class ReasonBreakdown(BaseModel):
    reason: str
    count: int
    percentage: float
    refund_amount: float
    financial_cost: float

class TopProductSummary(BaseModel):
    id: int
    product_code: str
    product_name: str
    category_name: str
    brand: str
    selling_price: float
    orders_count: int
    return_count: int
    return_rate: float
    financial_impact: float
    risk_tier: str

class RegionalReturnPoint(BaseModel):
    state: str
    region: str
    total_orders: int
    returned_orders: int
    return_rate: float
    financial_impact: float

class InsightFeedItem(BaseModel):
    id: str
    title: str
    observation: str
    supporting_metric: str
    time_period: str
    severity: str  # "Critical", "Warning", "Info"
    link_page: str
    category: str

# --- Product Schemas ---
class ProductListItem(BaseModel):
    id: int
    product_code: str
    product_name: str
    category_id: int
    category_name: str
    brand: str
    vendor_name: str
    selling_price: float
    orders_count: int
    returns_count: int
    return_rate: float
    financial_cost: float
    risk_tier: str

class ProductDetailResponse(BaseModel):
    id: int
    product_code: str
    product_name: str
    category_name: str
    brand: str
    vendor_name: str
    selling_price: float
    created_at: datetime
    total_orders: int
    total_returns: int
    return_rate: float
    category_avg_return_rate: float
    benchmark_variance_pct: float
    refund_amount: float
    reverse_logistics_cost: float
    total_financial_loss: float
    risk_tier: str
    risk_explanation: str
    reasons_breakdown: List[ReasonBreakdown]
    regional_breakdown: List[RegionalReturnPoint]
    recent_returns: List[Dict[str, Any]]

# --- Returns Register Schemas ---
class ReturnListItem(BaseModel):
    id: int
    return_number: str
    order_id: int
    order_number: str
    customer_id: int
    customer_name: str
    customer_code: str
    product_id: int
    product_name: str
    product_code: str
    category_name: str
    return_reason: str
    return_date: datetime
    refund_amount: float
    reverse_logistics_cost: float
    total_cost: float
    return_status: str
    shipping_state: str

class ReturnDetailResponse(BaseModel):
    id: int
    return_number: str
    order_number: str
    order_date: datetime
    payment_method: str
    customer_name: str
    customer_code: str
    customer_segment: str
    region: str
    state: str
    product_name: str
    product_code: str
    category_name: str
    brand: str
    unit_price: float
    return_date: datetime
    return_reason: str
    return_status: str
    refund_amount: float
    reverse_logistics_cost: float
    restocking_cost: float
    write_off_cost: float
    recoverable_value: float
    net_loss: float
    related_orders_count: int
    customer_prior_returns_count: int

# --- Root Cause Schemas ---
class RootCauseFinding(BaseModel):
    finding_id: str
    title: str
    dimension: str  # "Product", "Category", "Vendor", "Region"
    affected_entity: str
    return_count: int
    return_share_pct: float
    baseline_pct: float
    excess_ratio: float
    time_period: str
    evidence: str
    correlation_vs_causation_note: str
    recommendation: str
    severity: str

class ParetoPoint(BaseModel):
    reason: str
    count: int
    percentage: float
    cumulative_percentage: float

class ReasonTrendPoint(BaseModel):
    reason: str
    trend_status: str  # "Increasing", "Decreasing", "Stable"
    recent_period_count: int
    prior_period_count: int
    pct_change: float

class RootCauseOverview(BaseModel):
    findings: List[RootCauseFinding]
    pareto_data: List[ParetoPoint]
    reason_trends: List[ReasonTrendPoint]
    dominant_reason: str

# --- Prediction Schemas ---
class PredictionRequest(BaseModel):
    category_name: str
    selling_price: float
    discount_amount: float = 0.0
    customer_order_count: int = 1
    customer_prior_return_rate: float = 0.0
    estimated_delivery_days: int = 3
    shipping_state: str = "Maharashtra"
    order_quantity: int = 1
    payment_method: str = "UPI"
    product_name: Optional[str] = None
    order_reference: Optional[str] = None

class ContributingFactor(BaseModel):
    feature: str
    label: str
    impact: str  # "Increases Risk", "Decreases Risk", "Neutral"
    importance_weight: float

class PredictionResponse(BaseModel):
    order_reference: str
    predicted_probability: float
    predicted_class: int
    risk_tier: str  # "Low", "Moderate", "High", "Critical"
    top_contributing_factors: List[ContributingFactor]
    explanation: str
    actionable_recommendation: str
    model_version: str

class PredictionHistoryItem(BaseModel):
    id: int
    order_reference: str
    model_version: str
    predicted_probability: float
    predicted_class: int
    risk_tier: str
    actual_outcome: Optional[int]
    created_at: datetime
    input_features: Dict[str, Any]

class ModelPerformanceResponse(BaseModel):
    model_name: str
    version: str
    algorithm: str
    training_date: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    roc_auc: float
    confusion_matrix: Dict[str, int]
    classification_report: Dict[str, Any]
    feature_importances: List[Dict[str, Any]]
    class_distribution: Dict[str, Any]
    notes: str

# --- Report Schemas ---
class ReportGenerateRequest(BaseModel):
    report_type: str  # "executive", "product", "reasons", "regional", "financial", "predictions"
    period: str = "30d"  # "7d", "30d", "90d", "12m", "all"
    category_id: Optional[int] = None
    region: Optional[str] = None
    format: str = "json"  # "json", "csv", "pdf"

# --- Data Import Schemas ---
class ImportPreviewRow(BaseModel):
    row_number: int
    data: Dict[str, Any]

class ImportValidationResult(BaseModel):
    is_valid: bool
    total_rows: int
    valid_rows: int
    invalid_rows: int
    detected_columns: List[str]
    missing_required_columns: List[str]
    error_summary: List[Dict[str, Any]]
    preview_rows: List[Dict[str, Any]]

class ImportCommitRequest(BaseModel):
    source_type: str  # "orders", "products", "customers", "returns"
    file_token: str
    column_mapping: Dict[str, str]

class ImportJobResponse(BaseModel):
    id: int
    filename: str
    source_type: str
    total_records: int
    successful_records: int
    failed_records: int
    imported_at: datetime
    error_log: Optional[str]

# --- Settings Schemas ---
class SettingsPayload(BaseModel):
    currency_symbol: str = "₹"
    reverse_logistics_fee: float = 120.0
    restocking_percent: float = 0.05
    write_off_percent: float = 0.15
    recoverable_percent: float = 0.80
    risk_threshold_low: float = 8.0
    risk_threshold_moderate: float = 15.0
    risk_threshold_high: float = 25.0
