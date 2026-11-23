# RETURVEX — System Architecture & Data Flow

## 1. High-Level Architecture Overview

RETURVEX uses a modern decoupled architecture:
- **Presentation Layer**: React 19, TypeScript, Vite, Tailwind CSS, Recharts, Lucide React, TanStack Query.
- **Application & API Layer**: Python FastAPI, Pydantic v2, SQLAlchemy 2.0 ORM.
- **Analytics & ML Inference Engine**: Scikit-learn (Random Forest champion & Logistic Regression baseline), Pandas, NumPy.
- **Reporting & Document Generation**: ReportLab PDF generator, streaming CSV exporter.
- **Storage Layer**: Relational database (SQLite local zero-config default; PostgreSQL ready).

```mermaid
graph TD
    UI["React 19 Frontend Workstation<br/>(Tailwind CSS, Recharts, TanStack Query)"]
    API["FastAPI REST Application Layer<br/>(Pydantic Validation, CORS, Endpoints)"]
    
    subgraph Services ["Core Analytical Services"]
        ANALYTICS["Analytics Service<br/>(KPIs, Trends, Regional Metrics)"]
        ML["ML Predictive Engine<br/>(Random Forest Pipeline, Joblib)"]
        ROOT["Root Cause Engine<br/>(Pareto 80/20, Diagnostics)"]
        FIN["Financial Service<br/>(Net Loss Accounting Formula)"]
        REPORT["Reporting Service<br/>(ReportLab PDF, CSV Streams)"]
        IMPORT["Data Ingestion Service<br/>(Inspect, Validate, Commit)"]
    end

    subgraph Storage ["Database & Artifacts Layer"]
        DB[("Relational Database<br/>(SQLite / PostgreSQL)")]
        MODELS["ML Model Artifacts<br/>(returvex_model.joblib, model_metrics.json)"]
    end

    UI <-->|HTTP / JSON REST API| API
    API --> ANALYTICS
    API --> ML
    API --> ROOT
    API --> FIN
    API --> REPORT
    API --> IMPORT

    ANALYTICS <--> DB
    ML <--> DB
    ML <--> MODELS
    ROOT <--> DB
    FIN <--> DB
    REPORT <--> DB
    IMPORT <--> DB
```

---

## 2. Database Relational Model

```mermaid
erDiagram
    CATEGORIES ||--o{ PRODUCTS : categorizes
    VENDORS ||--o{ PRODUCTS : supplies
    CUSTOMERS ||--o{ ORDERS : places
    ORDERS ||--o{ ORDER_ITEMS : contains
    PRODUCTS ||--o{ ORDER_ITEMS : ordered_in
    ORDERS ||--o{ RETURNS : results_in
    PRODUCTS ||--o{ RETURNS : returned_product
    CUSTOMERS ||--o{ RETURNS : requested_by

    PRODUCTS {
        int id PK
        string product_code
        string product_name
        int category_id FK
        string brand
        int vendor_id FK
        float selling_price
        datetime created_at
    }

    ORDERS {
        int id PK
        string order_number
        int customer_id FK
        datetime order_date
        string payment_method
        string shipping_state
        datetime delivery_date
        string order_status
        float total_amount
    }

    RETURNS {
        int id PK
        string return_number
        int order_id FK
        int customer_id FK
        int product_id FK
        datetime return_date
        string return_reason
        string return_status
        float refund_amount
        float reverse_logistics_cost
        float restocking_cost
        float write_off_cost
        float recoverable_value
    }
```

---

## 3. Financial Loss Formula Specification

RETURVEX enforces a rigorous accounting formula to distinguish customer cash refunds from net operational company loss:

$$\text{Total Net Return Cost} = \text{Gross Refund} + \text{Reverse Courier Logistics} + \text{Restocking / Inspection} + \text{Damage Write-Off} - \text{Recoverable Salvage Value}$$

Where:
- **Gross Refund**: Direct customer reimbursement outflow.
- **Reverse Courier Logistics**: Fixed or distance-weighted reverse freight fee.
- **Restocking / Inspection**: Warehouse receiving, unpacking, QA triage labor.
- **Damage Write-Off**: Valuation discount on unsalvageable or defective items.
- **Recoverable Salvage Value**: Inventory resale salvage credited back into working capital.

---

## 4. Machine Learning Pipeline Architecture

The supervised binary classification pipeline is designed with zero future target leakage:
1. **Chronological Sorting**: Transactions are sorted strictly by `order_date`.
2. **Pre-Dispatch Features**:
   - `category_name`, `selling_price`, `discount_amount`, `order_quantity`, `shipping_state`, `payment_method`.
   - `customer_order_count` (orders placed strictly prior to current order).
   - `customer_prior_return_rate` (prior returns / prior orders).
   - `estimated_delivery_days` (carrier SLA estimate at order time).
3. **Pipeline Transformers**:
   - `OneHotEncoder(handle_unknown="ignore")` for categorical dimensions.
   - `StandardScaler()` for continuous monetary and historical metrics.
4. **Champion Selection**: Model performance is evaluated on stratified test sets comparing Logistic Regression and Random Forest on F1-score and ROC-AUC.
