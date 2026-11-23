# RETURVEX — 90-Second Technical Demo Script

**Target Audience**: Technical Recruiters, Engineering Managers, Hackathon Judges, and E-Commerce Operators.  
**Demonstration Length**: 90–120 seconds.  
**Live URL**: `http://localhost:5173`

---

## Act 1: The Executive Problem & Visual Dashboard (00:00 – 00:30)

**Screen**: `http://localhost:5173/` (Returns Intelligence Dashboard)

**Visual Actions**:
1. Point to the top header: Orange shopping bag logo, **RETURVEX** brand, live data status, and "Last 30 Days" filter.
2. Hover over the 4 pastel KPI cards:
   - Return Rate (**6.8%**, down 1.2% with warm amber sparkline).
   - Total Returns (**18,420** units with lavender sparkline).
   - Return Cost (**₹24.7L** with emerald sparkline).
   - Return Risk (**2.3%** predicted pre-dispatch risk with peach sparkline).
3. Point out the interactive charts:
   - Two-toned Area Return Trends with 7D/30D/90D/1Y time toggles.
   - Return Reasons doughnut chart with the **18.4K** total returns center overlay.
   - State-level geographic breakdown showing India map and ranked state logistics bars.

**Spoken Narrative**:
> *"E-commerce returns drain billions annually, yet most merchants only look at gross refund numbers after the damage is done. Welcome to RETURVEX—a full-stack returns intelligence workstation designed to uncover root causes and predict return risk before dispatch. Modeled after commercial BI tools, our dashboard immediately surfaces return volume, financial leakage, reason distributions, and regional logistics hotspots across Indian distribution lanes."*

---

## Act 2: SKU Deep Dive & Root Cause Diagnostics (00:30 – 00:55)

**Screen**: Click `Products` in the left sidebar, then click on a footwear or electronics product (e.g., "Running Shoes").

**Visual Actions**:
1. Slide open the **Product Detail Drawer**.
2. Show the category benchmark variance (22.1% return rate vs. 14.5% category average).
3. Navigate to `Root Causes` in the sidebar:
   - Highlight the Pareto 80/20 cost concentration chart.
   - Point to the diagnostic cards separating correlation from root causation (e.g., vendor batch defects vs. sizing mismatches).

**Spoken Narrative**:
> *"Behind every return is a systemic driver. In the Products register, we track SKU-level return velocity against category benchmarks. Opening our Product Detail Drawer reveals that running shoes exhibit a 7.6% negative variance driven by sizing confusion. In our Root Causes engine, we apply Pareto 80/20 analysis and automated diagnostic cards to separate mere statistical correlations from actionable supplier quality defects."*

---

## Act 3: Pre-Dispatch ML Simulation & Financial Recovery (00:55 – 01:25)

**Screen**: Click `Predictions` in the sidebar, then test the **Order Risk Simulation Sandbox**.

**Visual Actions**:
1. Adjust the simulation parameters:
   - Category: `Footwear`
   - Price: `₹4,999`
   - Payment Method: `Cash on Delivery`
   - Prior Returns: `3`
2. Click **"Run Pre-Dispatch Risk Inference"**.
3. Watch the real-time probability gauge update to `High Risk (74.2%)` with automated mitigation guidance:
   - Suggesting size verification SMS, pre-dispatch fit confirmation, or requiring prepaid transition.
4. Jump to `Financials` to display the Net Return Loss formula:
   $$\text{Refunds} + \text{Logistics} + \text{Restocking} + \text{Write-offs} - \text{Salvage}$$
5. Click **"Export PDF"** to trigger instantaneous local ReportLab report generation.

**Spoken Narrative**:
> *"Rather than reacting post-return, RETURVEX stops returns before they ship. Using a zero-target-leakage Random Forest pipeline trained on pre-dispatch features, our simulation sandbox predicts return probability in real-time. For this high-risk cash-on-delivery order, the system recommends pre-dispatch size confirmation, saving ₹350 in reverse freight. Furthermore, our financial ledger accounts for true GAAP net return losses—including inspection and restocking labor—before exporting publication-quality ReportLab executive PDFs."*

---

## Act 4: Close & Technical Architecture (01:25 – 01:30)

**Spoken Narrative**:
> *"RETURVEX runs 100% locally with FastAPI, React, TypeScript, and scikit-learn, backed by a 23-test automated QA suite and deterministic seed datasets. Thank you!"*
