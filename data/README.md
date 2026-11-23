# RETURVEX — Dataset & Synthetic Data Architecture

This directory contains reference schemas and sample CSV datasets for the **RETURVEX** E-Commerce Returns Intelligence Platform.

---

## 1. Overview of Demonstration Dataset

The RETURVEX demonstration database is populated using a deterministic synthetic generator (`backend/scripts/seed_data.py`) initialized with random seed `42`.

### Core Data Volume
- **Customers**: 1,000 synthetic consumer profiles across tier-1, tier-2, and tier-3 Indian cities.
- **Vendors**: 8 supplier partners across electronics, apparel, home, and accessories.
- **Categories**: 12 distinct merchandise categories.
- **Products**: 100 active SKUs with baseline pricing ranging from ₹299 to ₹89,999.
- **Orders**: 5,000 simulated historical orders placed over a 180-day window.
- **Returns**: 912 confirmed returns, yielding a realistic e-commerce return rate of **18.24%**.

---

## 2. Realistic Injected Business Patterns

To provide actionable signals for Root Cause Analysis and Machine Learning inference, the synthetic generation logic introduces three deliberate e-commerce phenomena:

1. **Category Sizing Variance in Footwear & Apparel**:
   - Footwear and ethnic apparel exhibit elevated return rates (~24%–32%), predominantly categorized under reason `"Size / Fit Issue"`.
   - Specific footwear SKUs (e.g., Running Shoes) feature a 1.6× higher return frequency due to inconsistent inner-sole sizing standards.

2. **Supplier Quality Spike (Nova Retail Defect Batch)**:
   - Vendor `"Nova Retail"` exhibits a sharp spike in `"Defective / Poor Quality"` returns between Day 60 and Day 90.
   - Electronics components manufactured by this vendor demonstrate premature audio driver and battery failures, enabling the Root Cause engine to flag vendor-level correlation.

3. **Geographic Courier Latency & Transit Damage**:
   - Deliveries to high-elevation or remote transit lanes (e.g., Assam, Bihar, East Uttar Pradesh) routed through low-tier logistics carriers experience a 2.3× higher rate of `"Transit Damaged"` and `"Late Delivery"` return claims.

---

## 3. Sample CSV File Specifications

The sample CSV files in this directory can be used to test the interactive 4-step CSV Import Pipeline (`/data-management` page):

### A. `sample_products.csv`
Used to import or update inventory catalog records.
- **Columns**: `sku`, `name`, `category`, `vendor`, `base_price`, `cost_of_goods`, `weight_kg`
- **Validation Rules**:
  - `sku`: String (unique identifier, e.g., `PRD-APP-001`).
  - `name`: Non-empty string.
  - `category`: Must match an active system category or will dynamically create one.
  - `base_price`: Decimal > 0.
  - `cost_of_goods`: Decimal > 0 (must not exceed `base_price`).

### B. `sample_orders.csv`
Used to record outbound customer purchases.
- **Columns**: `order_number`, `order_date`, `customer_id`, `state`, `city`, `channel`, `payment_method`, `total_amount`, `shipping_cost`, `sku`, `quantity`, `unit_price`
- **Validation Rules**:
  - `order_number`: String (unique identifier, e.g., `ORD-2026-1001`).
  - `order_date`: ISO 8601 Date (`YYYY-MM-DD`).
  - `payment_method`: One of `UPI`, `Credit Card`, `Debit Card`, `Net Banking`, `COD`.
  - `channel`: One of `Web`, `Mobile App`, `Marketplace`.

### C. `sample_returns.csv`
Used to log returned items, reverse logistics costs, and triage outcomes.
- **Columns**: `return_number`, `order_number`, `sku`, `return_date`, `reason`, `condition`, `disposition`, `refund_amount`, `reverse_shipping_cost`, `restocking_fee`
- **Validation Rules**:
  - `return_number`: String (unique identifier, e.g., `RET-2026-001`).
  - `order_number`: Foreign key linking to an existing completed order.
  - `reason`: Standardized enum (`Size / Fit Issue`, `Defective / Poor Quality`, `Transit Damaged`, `Wrong Item Delivered`, `Buyer Remorse`, `Late Delivery`).
  - `condition`: `Unopened`, `Opened / Like New`, `Minor Wear`, `Damaged / Defective`.
  - `disposition`: `Restock`, `Refurbish`, `Liquidation`, `Scrap / Write-off`.

---

## 4. How to Generate or Reset the Dataset

To re-seed the local SQLite database at any time:

```bash
# From workspace root
python backend/scripts/seed_data.py
```

To re-train the ML models on the newly seeded data:

```bash
python backend/scripts/train_model.py
```
