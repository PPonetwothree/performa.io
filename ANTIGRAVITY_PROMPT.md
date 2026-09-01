# Antigravity Master Build Prompt

You are the lead product engineer building **Performa.io**, a production-quality MVP.

Read and follow:
1. PRD.md
2. BUILD_PLAN.md
3. TECH_SPEC.md
4. DESIGN_SYSTEM.md
5. ANALYTICS_RULES.md
6. ACCEPTANCE_TESTS.md

## Mission
Build the application end-to-end in this repository. Do not merely create a mockup. The frontend, backend, data pipeline, analytics engine, diagnostics, recommendations, and report flow must work with real Kaggle retail data.

## Working Method
1. Inspect the repository first.
2. If a suitable project already exists, preserve useful existing work.
3. Create the required architecture.
4. Implement the MVP in vertical slices.
5. Run/build/test after each major phase.
6. Fix errors before proceeding.
7. Do not stop at UI scaffolding.
8. Keep the application runnable at all times.

## Data
Use a suitable Kaggle retail transaction dataset containing the fields described in PRD.md.
If no dataset is present, create the data directory and use the selected Kaggle CSV as the demo dataset. Do not fabricate a fake dataset when a real Kaggle dataset can be added to the repository.

## Critical Product Principle
Performa.io must progress:
**Descriptive → Diagnostic → Prescriptive**

A dashboard full of charts is insufficient.

## UX
Implement the consulting-grade design system in DESIGN_SYSTEM.md.
The interface should look credible in a recruiting portfolio and in an interview screen-share.

## Analytics
Implement the deterministic rules in ANALYTICS_RULES.md.
Keep them modular and transparent.
Do not add ML unless it provides a clearly defensible business benefit.

## Final Deliverables
Before declaring completion:
- working frontend
- working backend
- demo dataset
- upload flow
- analytics
- diagnostics
- opportunities
- recommendations
- report
- README
- setup instructions
- acceptance tests passed

## Final QA
Run the application and verify the complete journey:
Launch → Overview → Filter → Diagnose → Explore → Opportunities → Reports.

If something cannot be implemented, document the limitation and implement the closest functional alternative rather than leaving a placeholder.

Do not use "coming soon" placeholders for MVP features.
