# RETURVEX — Quality Assurance & Testing Suite

This document outlines the testing architecture, automated test suites, execution commands, and verified test results for **RETURVEX**.

---

## 1. Test Architecture Overview

RETURVEX incorporates dual-layer automated quality assurance:
- **Backend Quality Assurance**: Pytest test suite validating API schemas, SQLAlchemy database transactions, ML inference consistency, and financial accounting formulas.
- **Frontend Quality Assurance**: Vitest and React Testing Library verifying component mount cycles, user navigation links, and KPI presentation metrics.

---

## 2. Automated Test Inventory (23 Total Automated Tests)

### A. Backend Test Suite (20 Tests — `backend/tests/`)

#### 1. API Endpoint Coverage (`backend/tests/test_api.py`)
- `test_health_check`: Validates system status returns HTTP 200 with active timestamp and database connection.
- `test_dashboard_summary`: Validates the 4 core KPI metrics (return rate, total returns, return cost, return risk) and sparkline arrays.
- `test_dashboard_trends`: Validates date-aggregated order volume and return volume series.
- `test_dashboard_reasons`: Validates top return reasons breakdown and percentage sum validation.
- `test_dashboard_top_products`: Validates top 5 high-impact returning SKUs.
- `test_dashboard_regions`: Validates state-level return rates and regional financial impact metrics.
- `test_products_catalog`: Validates multi-parameter product filtering, category isolation, and pagination.
- `test_product_detail`: Validates single SKU deep-dive metrics, benchmark variance, and customer reason distribution.
- `test_returns_list`: Validates returns register pagination and search filtering.
- `test_return_detail`: Validates single return audit breakdown, reverse shipping cost, and customer history.
- `test_root_causes_summary`: Validates Pareto 80/20 cost concentration and reason velocity trends.
- `test_predictions_list`: Validates persisted pre-dispatch order risk assessments.
- `test_predict_risk_simulation`: Validates real-time ML risk simulation endpoint with simulated order payload.
- `test_financial_summary`: Validates GAAP-style Net Return Loss formula calculations and category cost breakdowns.
- `test_export_csv`: Validates CSV streaming generation for products, orders, and returns.
- `test_system_settings`: Validates configuration retrieval (currency symbol, default cost parameters).

#### 2. Service & Calculation Unit Tests (`backend/tests/test_services.py`)
- `test_financial_accounting_formula`: Asserts that Net Return Loss exactly matches:
  $$\text{Refunds} + \text{Logistics} + \text{Restocking} + \text{Write-offs} - \text{Salvage}$$
- `test_ml_prediction_probabilities`: Asserts that ML probabilities are bounded strictly between $0.0$ and $1.0$, and risk tiers map accurately (`Low`, `Medium`, `High`, `Critical`).
- `test_root_cause_pareto_calculation`: Asserts that cumulative cost percentages monotonically increase to 100%.
- `test_data_import_validation_and_rollback`: Tests transactional integrity during CSV upload, verifying rollback on malformed records.

### B. Frontend Test Suite (3 Tests — `frontend/src/__tests__/`)
- `Header.test.tsx`: Asserts header renders "RETURVEX", "Returns Intelligence", Live Data badge, and user profile avatar.
- `Sidebar.test.tsx`: Asserts navigation links (Dashboard, Products, Returns, Root Causes, Predictions, Financial, Reports, Data Management, Settings) are present and clickable.
- `DashboardPage.test.tsx`: Asserts that all 4 KPI cards render with proper labels and tabular metrics.

---

## 3. How to Execute Tests

### Option 1: Automated Windows Batch Script
Execute the one-click test runner from the repository root:
```cmd
test.bat
```

### Option 2: Run Backend Tests Manually
```powershell
# In PowerShell from project root
python -m pytest backend/tests -v
```

### Option 3: Run Frontend Tests Manually
```powershell
# In PowerShell from frontend directory
cd frontend
npm test -- --run
```

---

## 4. Verified Execution Results

```text
============================= test session starts =============================
platform win32 -- Python 3.14.0a3, pytest-8.3.4, pluggy-1.5.0
rootdir: D:\90 days\90-days-90-projects-day-30-returvex
collected 20 items

backend/tests/test_api.py::test_health_check PASSED                      [  5%]
backend/tests/test_api.py::test_dashboard_summary PASSED                  [ 10%]
backend/tests/test_api.py::test_dashboard_trends PASSED                   [ 15%]
backend/tests/test_api.py::test_dashboard_reasons PASSED                  [ 20%]
backend/tests/test_api.py::test_dashboard_top_products PASSED             [ 25%]
backend/tests/test_api.py::test_dashboard_regions PASSED                  [ 30%]
backend/tests/test_api.py::test_products_catalog PASSED                   [ 35%]
backend/tests/test_api.py::test_product_detail PASSED                     [ 40%]
backend/tests/test_api.py::test_returns_list PASSED                       [ 45%]
backend/tests/test_api.py::test_return_detail PASSED                      [ 50%]
backend/tests/test_api.py::test_root_causes_summary PASSED               [ 55%]
backend/tests/test_api.py::test_predictions_list PASSED                   [ 60%]
backend/tests/test_api.py::test_predict_risk_simulation PASSED            [ 65%]
backend/tests/test_api.py::test_financial_summary PASSED                  [ 70%]
backend/tests/test_api.py::test_export_csv PASSED                         [ 75%]
backend/tests/test_api.py::test_system_settings PASSED                    [ 80%]
backend/tests/test_services.py::test_financial_accounting_formula PASSED  [ 85%]
backend/tests/test_services.py::test_ml_prediction_probabilities PASSED   [ 90%]
backend/tests/test_services.py::test_root_cause_pareto_calculation PASSED [ 95%]
backend/tests/test_services.py::test_data_import_validation_and_rollback PASSED [100%]

============================== 20 passed in 1.42s ==============================

✓ src/__tests__/Header.test.tsx (1 test)
✓ src/__tests__/Sidebar.test.tsx (1 test)
✓ src/__tests__/DashboardPage.test.tsx (1 test)

 Test Files  3 passed (3)
      Tests  3 passed (3)
   Duration  1.18s
```
