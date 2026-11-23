export interface KPIMetric {
  value: number;
  previous_value: number;
  change_pct: number;
  trend: "up" | "down" | "neutral";
  is_positive_improvement: boolean;
}

export interface DashboardSummary {
  return_rate: KPIMetric;
  total_returns: KPIMetric;
  return_cost: KPIMetric;
  return_risk: KPIMetric;
  total_orders: number;
  total_refund_amount: number;
  total_reverse_logistics: number;
  total_restocking_cost: number;
  total_write_off_cost: number;
  total_recoverable_value: number;
  net_loss: number;
  currency_symbol: string;
  period_label: string;
}

export interface TrendPoint {
  date: string;
  total_orders: number;
  returned_orders: number;
  return_rate: number;
  total_sales: number;
  refund_amount: number;
}

export interface ReasonBreakdown {
  reason: string;
  count: number;
  percentage: number;
  refund_amount: number;
  financial_cost: number;
}

export interface TopProductSummary {
  id: number;
  product_code: string;
  product_name: string;
  category_name: string;
  brand: string;
  selling_price: number;
  orders_count: number;
  return_count: number;
  return_rate: number;
  financial_impact: number;
  risk_tier: string;
}

export interface RegionalReturnPoint {
  state: string;
  region: string;
  total_orders: number;
  returned_orders: number;
  return_rate: number;
  financial_impact: number;
}

export interface InsightFeedItem {
  id: string;
  title: string;
  observation: string;
  supporting_metric: string;
  time_period: string;
  severity: "Critical" | "Warning" | "Info";
  link_page: string;
  category: string;
}

export interface ProductListItem {
  id: number;
  product_code: string;
  product_name: string;
  category_id: number;
  category_name: string;
  brand: string;
  vendor_name: string;
  selling_price: number;
  orders_count: number;
  returns_count: number;
  return_rate: number;
  financial_cost: number;
  risk_tier: string;
}

export interface ProductDetail {
  id: number;
  product_code: string;
  product_name: string;
  category_name: string;
  brand: string;
  vendor_name: string;
  selling_price: number;
  created_at: string;
  total_orders: number;
  total_returns: number;
  return_rate: number;
  category_avg_return_rate: number;
  benchmark_variance_pct: number;
  refund_amount: number;
  reverse_logistics_cost: number;
  total_financial_loss: number;
  risk_tier: string;
  risk_explanation: string;
  reasons_breakdown: ReasonBreakdown[];
  regional_breakdown: RegionalReturnPoint[];
  recent_returns: Array<{
    return_number: string;
    order_number: string;
    customer_name: string;
    state: string;
    return_reason: string;
    return_date: string;
    refund_amount: number;
    return_status: string;
  }>;
}

export interface ReturnListItem {
  id: number;
  return_number: string;
  order_id: number;
  order_number: string;
  customer_id: number;
  customer_name: string;
  customer_code: string;
  product_id: number;
  product_name: string;
  product_code: string;
  category_name: string;
  return_reason: string;
  return_date: string;
  refund_amount: number;
  reverse_logistics_cost: number;
  total_cost: number;
  return_status: string;
  shipping_state: string;
}

export interface ReturnDetail {
  id: number;
  return_number: string;
  order_number: string;
  order_date: string;
  payment_method: string;
  customer_name: string;
  customer_code: string;
  customer_segment: string;
  region: string;
  state: string;
  product_name: string;
  product_code: string;
  category_name: string;
  brand: string;
  unit_price: number;
  return_date: string;
  return_reason: string;
  return_status: string;
  refund_amount: number;
  reverse_logistics_cost: number;
  restocking_cost: number;
  write_off_cost: number;
  recoverable_value: number;
  net_loss: number;
  related_orders_count: number;
  customer_prior_returns_count: number;
}

export interface RootCauseFinding {
  finding_id: string;
  title: string;
  dimension: string;
  affected_entity: string;
  return_count: number;
  return_share_pct: number;
  baseline_pct: number;
  excess_ratio: number;
  time_period: string;
  evidence: string;
  correlation_vs_causation_note: string;
  recommendation: string;
  severity: string;
}

export interface ParetoPoint {
  reason: string;
  count: number;
  percentage: number;
  cumulative_percentage: number;
}

export interface ReasonTrendPoint {
  reason: string;
  trend_status: "Increasing" | "Decreasing" | "Stable";
  recent_period_count: number;
  prior_period_count: number;
  pct_change: number;
}

export interface RootCauseOverview {
  findings: RootCauseFinding[];
  pareto_data: ParetoPoint[];
  reason_trends: ReasonTrendPoint[];
  dominant_reason: string;
}

export interface ContributingFactor {
  feature: string;
  label: string;
  impact: string;
  importance_weight: number;
}

export interface PredictionResult {
  order_reference: string;
  predicted_probability: number;
  predicted_class: number;
  risk_tier: "Low" | "Moderate" | "High" | "Critical";
  top_contributing_factors: ContributingFactor[];
  explanation: string;
  actionable_recommendation: string;
  model_version: string;
}

export interface ModelPerformance {
  model_name: string;
  version: string;
  algorithm: string;
  training_date: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  roc_auc: number;
  confusion_matrix: {
    true_negatives: number;
    false_positives: number;
    false_negatives: number;
    true_positives: number;
  };
  classification_report: Record<string, any>;
  feature_importances: Array<{ feature: string; importance: number }>;
  class_distribution: {
    total_orders: number;
    not_returned_count: number;
    returned_count: number;
    return_rate_pct: number;
  };
  notes: string;
}

export interface FinancialIntelligence {
  kpis: {
    gross_refund_amount: number;
    reverse_logistics_cost: number;
    restocking_cost: number;
    write_off_cost: number;
    recoverable_value: number;
    net_financial_loss: number;
    average_return_refund: number;
    returns_count: number;
  };
  by_category: Array<{
    category: string;
    returns_count: number;
    refund_amount: number;
    logistics_cost: number;
    restocking_cost: number;
    write_off_cost: number;
    recoverable_value: number;
    net_loss: number;
  }>;
  by_reason: Array<{
    reason: string;
    returns_count: number;
    refund_amount: number;
    logistics_cost: number;
    net_loss: number;
  }>;
  monthly_trend: Array<{
    month: string;
    refund_amount: number;
    logistics_cost: number;
    recoverable_value: number;
    net_loss: number;
    returns_count: number;
  }>;
  formula_documentation: {
    formula: string;
    explanation: string;
  };
}
