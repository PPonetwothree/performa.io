# Performa.io — Build Plan for Antigravity

## Objective
Build the complete MVP described in PRD.md. Work in vertical slices and keep the app runnable after every major step.

## Phase 1 — Scaffold
- Create React + TypeScript + Vite frontend.
- Create FastAPI backend.
- Add Tailwind and icons.
- Establish frontend/backend environment configuration.
- Create shared API client.
- Add clean application shell and navigation.

## Phase 2 — Data
- Add demo Kaggle CSV under backend/data/.
- Implement CSV loader.
- Implement schema alias mapping.
- Validate required columns.
- Clean dates and numeric fields.
- Add upload endpoint.
- Add dataset status endpoint.

## Phase 3 — Analytics Engine
Create modular Python functions:
- calculate_kpis()
- calculate_trends()
- calculate_performance_breakdown()
- calculate_benchmarks()
- diagnose_entity()
- score_opportunities()
- generate_recommendations()

Keep business logic out of route handlers.

## Phase 4 — Overview
Build:
- global filters
- KPI cards
- trend chart
- regional performance
- category performance
- revenue/profit matrix
- alert panel

## Phase 5 — Diagnose
Build:
- entity selector
- benchmark comparison
- performance status
- driver analysis
- evidence cards
- recommendation card
- confidence indicator

## Phase 6 — Explore
Build:
- dimension selector
- sortable data table
- Pareto chart
- performance matrix
- drill-down behavior

## Phase 7 — Opportunities
Build:
- opportunity scoring
- priority matrix
- ranked opportunity table
- detail drawer/card
- recommendations

## Phase 8 — Reports
Build:
- executive summary
- findings
- opportunities
- actions
- print-friendly report
- browser print/PDF support if practical

## Phase 9 — QA
Test:
- demo dataset
- uploaded valid CSV
- missing columns
- invalid numeric data
- invalid dates
- empty data
- filters
- zero sales
- negative profit
- tiny groups
- mobile layout
- API failures

## Phase 10 — Polish
- improve spacing and typography
- eliminate visual clutter
- ensure consistent chart labels
- add empty/loading/error states
- verify no console errors
- add README with setup/run instructions

## Important
Do not add new features until the MVP works end-to-end.
Prefer simple deterministic analytics over unnecessary ML.
