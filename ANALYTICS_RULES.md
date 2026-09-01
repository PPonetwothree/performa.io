# Performa.io — Analytics Rules

## General
Use peer benchmarks and compare the selected entity to its relevant peer group.

## Thresholds
Default materiality threshold: 10% relative deviation where appropriate.
For percentage-point metrics such as margin, use a meaningful absolute gap.

Make thresholds configurable in one constants/config module.

## Status

### Critical
Profit < 0.

### Underperforming
Profit margin materially below benchmark OR revenue materially below benchmark.

### Watch
Performance within normal range but deteriorating trend.

### Strong
Revenue and margin above benchmark.

## Drivers

1. Discount pressure:
discount > peer benchmark AND margin < peer benchmark.

2. Volume weakness:
orders < peer benchmark AND revenue < peer benchmark.

3. Basket weakness:
AOV < peer benchmark while order count is not materially weak.

4. Product mix:
revenue >= benchmark but profit margin materially below benchmark, with concentrated weak sub-categories.

5. Positive performance:
revenue and margin both materially above benchmark.

## Opportunity Impact
Business impact should reflect absolute revenue/profit exposure, not only percentages.

## Urgency
High if:
- negative profit
- severe margin gap
- rapidly deteriorating trend

Medium if:
- material but non-critical gap

Low otherwise.

## Feasibility
Initial heuristic:
- pricing/discount adjustment = High
- staffing/process adjustment = Medium
- structural market expansion = Low

Keep this explicitly labelled as a heuristic.

## Confidence
High:
multiple supporting signals.

Medium:
one strong signal plus supporting evidence.

Low:
weak or insufficient evidence.

Never present heuristic confidence as statistical certainty.
