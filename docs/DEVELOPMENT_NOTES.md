# RETURVEX — Engineering & Development Notes

This document provides architectural rationale, trade-off analyses, and design decisions recorded during the engineering of the **RETURVEX** platform.

---

## 1. Visual System & Reference Alignment

### A. Surface Palette Rationale
Rather than defaulting to generic dark themes or dense Bootstrap-style tables, RETURVEX implements a crisp, high-contrast, light-mode enterprise analytics aesthetic matching the provided design specification (`screenshots/dashboard.jpg`):
- **Background**: Soft blue-gray `#F3F6FA` reduces ocular fatigue during sustained analysis.
- **Surface Elevation**: Pure white `#FFFFFF` cards with fine `#DFE6EF` borders and subtle box-shadows (`rgba(0, 0, 0, 0.04)`).
- **KPI Card Pastels**:
  - *Return Rate*: Warm amber tint (`bg-amber-50`, border `border-amber-200`) symbolizing watchful operational metrics.
  - *Total Returns*: Lavender tint (`bg-purple-50`, border `border-purple-200`) reflecting volume aggregation.
  - *Return Cost*: Soft mint tint (`bg-emerald-50`, border `border-emerald-200`) for financial balance tracking.
  - *Return Risk*: Peach/coral tint (`bg-rose-50`, border `border-rose-200`) providing immediate visibility to elevated risk.
- **Interactive Sparklines**: Integrated inline SVG path sparklines within each KPI card to visualize 30-day velocity directly below the headline metric.

---

## 2. Machine Learning: Zero Target Leakage Discipline

### A. Pre-Dispatch vs. Post-Dispatch Feature Separation
In e-commerce return prediction, a critical pitfall is **target leakage** (training models on features only observable *after* a customer initiates a return, such as customer return complaints, courier return tracking status, or inspection tags).

RETURVEX enforces strict **zero target leakage**:
- **Allowed Features (Observable at Order Checkout)**:
  - `product_category`: Historical risk of the category.
  - `product_price`: High-ticket items have distinct buyer remorse curves.
  - `customer_prior_orders`: Total purchases by the buyer.
  - `customer_prior_returns`: Number of previously returned items.
  - `customer_return_rate`: Historical return propensity ($prior\_returns / prior\_orders$).
  - `order_quantity`: Multi-item orders of the same SKU frequently indicate "bracketing" (buying multiple sizes to return poor fits).
  - `payment_method`: Cash-on-Delivery (COD) vs. Prepaid (UPI/Cards) correlation with impulse buying and return friction.
  - `shipping_state`: Regional transit distance and tier-specific logistics risk.
- **Strictly Excluded Post-Order Features**:
  - `delivery_delay_days`, `package_damage_reported`, `return_reason_code`, `refund_status`.

### B. Algorithm Comparison & Champion Selection
1. **Logistic Regression (Baseline)**:
   - Evaluated for high interpretability and odds-ratio explainability.
   - Test F1-Score: **0.3033**, ROC-AUC: **0.5695**.
2. **Random Forest Classifier (Champion)**:
   - Configured with `n_estimators=100`, `max_depth=10`, `min_samples_split=5`, `random_state=42`.
   - Handles non-linear feature interactions (e.g., high item price + COD payment + first-time customer).
   - Test F1-Score: **0.3498**, ROC-AUC: **0.6168** on class-imbalanced 82/18 dataset.
   - Exported as active production model: `backend/models/returvex_model.joblib`.

---

## 3. Financial Loss Accounting Formula

Standard dashboards often equate Return Loss solely to the **Refund Amount**. However, reverse logistics economics are far more punitive. RETURVEX implements the full GAAP-compliant reverse logistics formula:

$$\text{Net Return Loss} = \text{Gross Refunds} + \text{Reverse Shipping} + \text{Restocking Labor} + \text{Inventory Write-Offs} - \text{Salvage Recovery}$$

Where:
- **Gross Refunds**: Financial capital returned to the customer.
- **Reverse Shipping**: 3PL carrier return freight charges (~₹120–₹350/parcel).
- **Restocking Labor**: Warehousing inspection, re-bagging, and QA labor fees (~₹50–₹100/unit).
- **Inventory Write-Offs**: Value lost on unsellable items damaged in transit or broken during inspection.
- **Salvage Recovery**: Secondary resale value recouped through B2B liquidation or clearance channels.

---

## 4. Root Cause Analysis: Causation vs. Correlation

The Root Cause Service (`backend/app/services/root_cause_service.py`) categorizes anomalies using evidence-backed criteria:
- **Pareto Principle (80/20 Rule)**: Identifies the 20% of return categories and vendor SKUs driving 80% of reverse logistics costs.
- **Correlation Guardrails**: Diagnostic cards explicitly separate *statistical correlation* (e.g., "Higher return rate in COD orders") from *verifiable root cause* (e.g., "Inner-sole dimension mismatch verified across 48 customer reviews for SKU PRD-FTW-004").

---

## 5. Local-First Engineering & Resilience

- **Zero Cloud / LLM Dependency**: All analytical aggregations, ML inferences, PDF report generations, and CSV exports execute 100% locally on standard CPU hardware without network egress.
- **ReportLab Native Generation**: PDF executive summaries are dynamically styled with standard vector typography, color-coded tabular summaries, and metadata headers without requiring external headless Chromium or Puppeteer.
- **Multi-Level Fallback**: SQLite local persistence enables instant one-click execution via `run.bat` while maintaining clean SQLAlchemy DDL ready for enterprise PostgreSQL migration via single `.env` connection string swap.
