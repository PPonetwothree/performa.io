# Performa.io — Technical Specification

## Repository Structure

performa-io/
├── frontend/
├── backend/
├── data/
├── docs/
├── PRD.md
├── BUILD_PLAN.md
├── TECH_SPEC.md
├── DESIGN_SYSTEM.md
├── README.md
└── .gitignore

## Backend

Python FastAPI application.

Suggested:
backend/
├── app/
│   ├── main.py
│   ├── api/
│   ├── services/
│   │   ├── data_service.py
│   │   ├── analytics_service.py
│   │   ├── diagnostic_service.py
│   │   ├── opportunity_service.py
│   │   └── report_service.py
│   ├── models/
│   └── utils/
└── data/

Use Pydantic response models where practical.

## Frontend

frontend/src/
├── components/
├── pages/
├── layouts/
├── hooks/
├── lib/
├── types/
└── App.tsx

Use reusable components rather than page-specific duplication.

## API Response Principles
- JSON
- stable field names
- numeric values as numbers
- dates in ISO format
- include sample_size with benchmark comparisons
- include metadata describing active filters where useful

## Filtering
Global filters should be sent to API endpoints or applied through a centralized query state.
Do not duplicate filter logic across components.

## Analytics
Use Pandas vectorized operations.
Avoid row-by-row Python loops unless necessary.

## Benchmark Safety
For groups with insufficient sample size, return:
status = "insufficient_sample"
and avoid strong recommendations.

## Recommendation Output
Each recommendation should contain:
{
  "title": string,
  "problem": string,
  "evidence": string[],
  "action": string,
  "priority": "High" | "Medium" | "Low",
  "confidence": "High" | "Medium" | "Low"
}

## Security
For MVP:
- restrict upload type to CSV
- limit upload size
- sanitize filenames
- never execute uploaded content
