# RETURVEX — User Guide & Operational Manual

This guide describes how to operate each analytical module within the **RETURVEX** platform.

---

## 1. Returns Intelligence Dashboard
The primary landing workspace reproduces the visual analytics interface:
- **Performance KPI Strip**:
  - **Return Rate**: Percentage of eligible shipments returned within the selected window, with previous-period comparison and sparkline.
  - **Total Returns**: Raw count of returned orders.
  - **Return Cost**: Calculated net company financial loss.
  - **Predicted Return Risk**: Proportion of orders flagged as elevated risk by the trained machine learning model.
- **Return Trends**:
  - Interactive multi-line area chart plotting total orders (blue) vs. returned orders (orange).
  - Toggle between time horizons (`7D`, `30D`, `90D`, `1Y`).
  - Hover over any point to inspect date-specific order volume and return counts.
- **Return Reasons**:
  - Doughnut visualization illustrating the distribution of return complaints with total returns displayed at its center.
  - Ranked legend displaying volume share percentages.
- **Top Returning Products**:
  - Highlights top SKUs with the highest return frequency, financial impact, and risk tier badges.
  - Click any row or click **View All &rarr;** to navigate to the Products workspace.
- **Region-wise Analysis**:
  - SVG vector India map highlighting top return states alongside ranked horizontal percentage bars.

---

## 2. Products Workspace
- **Catalog Filtering**: Search by product title, SKU code, or brand. Filter by category, price range, and risk tier (Low, Moderate, High, Critical).
- **Product Detail Drawer**:
  - Click on any product row to open the slide-out analytical drawer.
  - Compare the product's return rate directly against its **Category Benchmark** variance.
  - Review customer-stated return reasons, regional state distribution, and recent return authorizations.

---

## 3. Returns Register
- Operational returns table recording Return ID, Order Number, Customer, Product, Reason, Date, State, Refund Amount, and Status.
- Multi-dimensional filters: Filter by return reason (Size/Fit, Quality, Damaged, etc.), category, shipping state, or refund range.
- Click any record to inspect customer lifetime order and return history.

---

## 4. Root Cause Intelligence
- **Pareto 80/20 Analysis**: Evaluates return concentration to identify which 20% of return causes generate 80% of customer dissatisfaction.
- **Reason Velocity**: Identifies whether complaints like "Late Delivery" or "Size/Fit" are Increasing, Decreasing, or Stable.
- **Evidence-Backed Findings**: Review concrete diagnostic cards with statistical excess ratios, verifiable evidence, correlation vs. causation explanations, and recommended mitigations.

---

## 5. Predictive Analytics
- **Inference Sandbox**:
  - Input order characteristics (product category, price, discount, customer order history, customer prior return rate, transit days, payment method, state).
  - Click **Execute Return Risk Prediction**.
  - Review the estimated probability %, risk tier (Low, Moderate, High, Critical), key influencing factors, technical narrative, and actionable business recommendation.
- **Model Performance**:
  - Inspect test accuracy, precision, recall, F1-score, and ROC-AUC.
  - Review the confusion matrix (True Negatives, False Positives, False Negatives, True Positives) and top Gini feature importances.
- **Prediction Log**: View the historical audit log of simulated orders.

---

## 6. Financial Intelligence
- Comprehensive cost ledger breaking down gross refunds, reverse logistics shipping fees, restocking labor, product write-offs, and salvage recovery.
- Inspect cost impact by category, by return reason, and across a 6-month trend chart.

---

## 7. Reporting Centre
- Select between Executive Summary, Product Risk Register, Financial Recovery, and Regional Analysis.
- Export dynamically compiled CSV files or download professional multi-page ReportLab PDF briefs.

---

## 8. Data Management
- Ingest external CSV/XLSX files in a 4-step workflow:
  1. **Upload & Inspect**: Drag and drop file to inspect headers.
  2. **Map Columns**: Match file headers to required schema attributes.
  3. **Validate Records**: Automated scanner verifies required fields, numeric formats, and prevents duplicate IDs.
  4. **Commit to Database**: Transactional execution safely saves validated records.
- Download standard CSV templates for Products, Orders, and Returns.

---

## 9. Settings
- Update currency symbol (`₹`, `$`, `€`, `£`).
- Adjust accounting parameters (reverse logistics fee, restocking %, write-off %, salvage %).
- Customize risk threshold percent boundaries.
- Reset and reseed the synthetic dataset with reproducible seed 42.
