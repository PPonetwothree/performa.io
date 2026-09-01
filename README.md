# Performa.io

**Performance, diagnosed.**

Performa.io is a consulting-grade retail performance intelligence web application. It ingests retail transaction data (bundled Kaggle Superstore dataset or custom CSV upload) and converts it into KPI telemetry, deterministic peer-benchmark diagnostics, root-cause driver identification, prioritized opportunity scoring, and executive management briefings.

---

## Core Product Journey
$$\text{Descriptive (Overview)} \longrightarrow \text{Diagnostic (Diagnose)} \longrightarrow \text{Granular Drill-Down (Explore)} \longrightarrow \text{Prescriptive (Opportunities)} \longrightarrow \text{Management Briefing (Reports)}$$

---

## Architecture & Technology Stack

- **Backend**: Python 3.10+ / FastAPI / Vectorized Pandas & NumPy / Pydantic / Pytest
- **Frontend**: React 18 / TypeScript / Vite / Tailwind CSS / Lucide React / Recharts
- **Dataset**: Kaggle Superstore Retail Transactions (9,994 records across 4 Regions, 49 States, 3 Categories, 17 Sub-Categories, and 3 Customer Segments)

---

## Getting Started

### 1. Run the Backend API Server

```bash
# From workspace root
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Backend API will be live at `http://127.0.0.1:8000`. Interactive OpenAPI documentation available at `http://127.0.0.1:8000/docs`.

### 2. Run the Frontend Development Server

```bash
# In a second terminal
cd frontend
npm install
npm run dev
```

Frontend application will launch at `http://localhost:3000`.

---

## Running Automated Tests

Run backend unit and integration test suite:

```bash
# Run pytest with PYTHONPATH set to backend
$env:PYTHONPATH="backend"; python -m pytest backend/tests -v
```

Build the frontend production bundle:

```bash
cd frontend
npm run build
```

---

## Core Features & Analytical Engine

1. **Executive Overview**: Headline KPIs (Revenue, Profit, Margin %, Orders, Units, AOV, Avg Discount), period-over-period growth rates, automated performance anomaly alert banners, financial trend line/bar charts, category/regional share bars, and revenue vs profit quadrant matrix.
2. **Entity Root-Cause Diagnosis**:
   - Compares selected entities against dynamic **peer benchmarks** (strictly excluding the target entity).
   - Rule-based root causes: *Discount Leakage, Severe Margin Deficit / Value Destruction, Unfavorable Product Mix, Volume & Demand Contraction, Low Basket Value (AOV Deficit), High-Efficiency Market Leadership*.
   - Quantified supporting evidence bullets and actionable recommendations.
3. **Multi-Dimensional Explorer**: Pareto 80/20 concentration curve, sortable multi-column table, search filter, and instant drill-down.
4. **Prioritized Opportunities**:
   - Multi-factor scoring formula:
     $$\text{Score} = 0.40 \times \text{Impact} + 0.30 \times \text{Gap} + 0.20 \times \text{Feasibility} + 0.10 \times \text{Urgency}$$
   - Quantifiable annual profit exposure, priority badges (High, Medium, Low), and 3-step execution roadmaps.
5. **Executive Performance Briefing**: Management-ready briefing document with findings, root causes, prioritized interventions, action matrix, and print/PDF export styling.
6. **Dataset Management**: Drag-and-drop CSV ingestion with alias mapping, cleaning, error validation, and instant reset to default Kaggle demo data.

---

## Kaggle Dataset Attribution
- **Dataset**: Superstore Sales Retail Dataset (Kaggle)
- **Dimensions**: Order ID, Order Date, Customer, Segment, Region, State, City, Category, Sub-Category, Product, Sales, Quantity, Discount, Profit.
