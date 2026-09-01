# Performa.io — Product Requirements Document

## 1. Product
Performa.io is a consulting-grade retail performance intelligence web application. It ingests a Kaggle retail transaction CSV and converts it into KPI analysis, performance diagnostics, driver analysis, prioritized opportunities, and actionable management recommendations.

Core question:
**What is happening → Where is performance weak → What is driving it → What should management do?**

This is NOT a generic BI dashboard and NOT an ML showcase.

## 2. Primary User
Business/operations manager or consultant who needs to identify performance gaps quickly.

## 3. MVP
Must include:
- Kaggle retail CSV bundled as demo data
- CSV upload
- Schema validation
- Data cleaning
- KPI calculations
- Executive Overview
- Diagnose page
- Explore page
- Opportunities page
- Reports page
- Interactive global filters
- Benchmarking
- Rule-based driver diagnosis
- Opportunity scoring
- Recommendation engine
- Responsive professional UI
- Exportable executive report

## 4. Required Dataset Schema
Preferred fields:
Order ID, Order Date, Customer, Segment, Region, State, City, Category, Sub-Category, Product, Sales, Quantity, Discount, Profit.

The application must also support reasonable column aliases where possible.

## 5. Derived Metrics
Calculate:
- Revenue = sum(Sales)
- Profit = sum(Profit)
- Profit Margin = Profit / Sales
- Orders = distinct Order ID
- Units = sum(Quantity)
- Average Order Value = Sales / Orders
- Average Discount = weighted or transaction-level average
- Revenue per Unit = Sales / Quantity
- Period growth when a prior period exists
- Revenue contribution
- Profit contribution
- Margin gap vs benchmark

## 6. Pages

### Overview
Show:
- Revenue
- Profit
- Profit Margin
- Orders
- Units
- Average Order Value
- Average Discount
- Revenue/profit trend
- Region performance
- Category performance
- Revenue vs profit matrix/scatter
- Automatically generated performance alerts

### Diagnose
Allow selection of Region, State, Category, Sub-category, Segment.
Show selected entity vs benchmark:
- Revenue
- Profit
- Margin
- Orders
- AOV
- Discount

Then show:
- Performance status
- Severity
- Primary driver
- Supporting evidence
- Recommended action
- Confidence

### Explore
Provide interactive breakdowns and tables:
- Region
- State
- Category
- Sub-category
- Segment
- Product
- Date

Include Pareto analysis and performance matrix.

### Opportunities
Rank opportunities using:
Opportunity Score = 40% Business Impact + 30% Performance Gap + 20% Feasibility + 10% Urgency.

Show:
- Opportunity
- Entity
- Problem
- Evidence
- Impact
- Urgency
- Feasibility
- Score
- Recommended action

### Reports
Generate a management-ready executive summary:
- Overall performance
- Key findings
- Major performance gaps
- Driver analysis
- Top opportunities
- Recommended actions
Allow export/print.

## 7. Diagnostic Logic

### Discount leakage
If discount is materially above benchmark AND margin is below benchmark:
Driver = Discount pressure.

### Volume problem
If revenue and orders are below benchmark:
Driver = Volume/demand weakness.

### Basket problem
If orders are reasonable but AOV is below benchmark:
Driver = Low basket value.

### Product mix
If revenue is strong but profit is weak and specific sub-categories have low margins:
Driver = Product mix.

### Strong performer
If revenue and margin are both above benchmark:
Status = Strong performer.

### Critical loss
If profit is negative:
Status = Critical intervention.

Rules must be transparent in the UI through a methodology/info panel.

## 8. Benchmarking
Default benchmark for an entity is the relevant peer population excluding the selected entity where practical.

Examples:
- Category benchmark = other categories
- Region benchmark = other regions
- State benchmark = other states
- Sub-category benchmark = other sub-categories

Avoid misleading benchmarks for tiny samples. Display sample size.

## 9. Recommendation Engine
Recommendations must be evidence-based and specific.

Examples:
- High discount + low margin → Review discount thresholds and low-margin SKUs.
- Strong revenue + weak margin → Prioritize margin recovery rather than acquisition.
- Low orders + healthy margin → Evaluate demand-generation or distribution opportunities.
- Low AOV → Investigate basket-building/cross-sell opportunities.
- Strong performer → Identify practices that can be replicated.

Never invent financial impact. If an impact estimate is not analytically defensible, label it qualitative.

## 10. Opportunity Scoring
Normalize each factor to 0–100.
Business Impact should consider absolute profit/revenue exposure.
Performance Gap should consider deviation from benchmark.
Feasibility and urgency can initially use transparent heuristic rules.
Display score methodology.

## 11. UI/UX
Design direction:
- Premium enterprise analytics
- Consulting-grade
- Dense but readable
- Desktop-first
- Responsive
- Minimal decorative elements
- Restrained use of color
- Strong typography
- Subtle borders
- Clear hierarchy
- No neon gradients
- No fake AI branding
- No unnecessary animations

Navigation:
Overview / Diagnose / Explore / Opportunities / Reports

Include:
- global date filter
- region filter
- category filter
- segment filter
- reset filters
- upload data control
- dataset status

## 12. Technical Architecture
Preferred stack:
Frontend:
- React
- TypeScript
- Vite
- Tailwind CSS
- Recharts or another lightweight charting library
- Lucide icons

Backend:
- Python
- FastAPI
- Pandas
- NumPy

Storage:
- CSV for MVP
- SQLite only if persistence is useful

Suggested:
frontend/ and backend/ directories.

API:
GET /api/health
POST /api/data/upload
GET /api/kpis
GET /api/trends
GET /api/performance
GET /api/diagnostics
GET /api/opportunities
GET /api/recommendations
GET /api/report

## 13. Data Flow
CSV → validation → cleaning → normalized dataframe → derived metrics → analytics engine → diagnostics → opportunity scoring → recommendations → API → React UI.

## 14. Error Handling
Show clear errors for:
- unsupported file
- missing required columns
- malformed dates
- non-numeric Sales/Profit/Quantity/Discount
- empty dataset

Do not crash the UI.

## 15. Performance
For a typical Kaggle retail dataset:
- initial load target <3 seconds after backend is ready
- filtering should not require full page reload
- cache/reuse computed aggregations where useful

## 16. Demo Experience
The repository should contain a demo dataset and launch with useful populated data.
The first screen must immediately communicate:
**Performance → Problems → Drivers → Actions.**

## 17. Out of Scope
- complex ML
- LLM chatbot
- authentication
- real-time streaming
- enterprise integrations
- multi-tenant infrastructure
- complex forecasting

## 18. Definition of Done
A new user can:
1. Launch the application.
2. See demo retail data.
3. Understand business performance in under 30 seconds.
4. Filter the data.
5. Select an underperforming entity.
6. See benchmark comparison and diagnosis.
7. Understand the likely driver.
8. See prioritized opportunities.
9. Review recommended actions.
10. Export/print an executive report.
