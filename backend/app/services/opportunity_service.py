import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Any
from app.config import THRESHOLDS
from app.services.analytics_service import analytics_service
from app.services.diagnostic_service import diagnostic_service
from app.models.schemas import (
    FilterParams, OpportunityResponse, OpportunityItem
)

class OpportunityService:
    def get_opportunities(self, params: Optional[FilterParams] = None) -> OpportunityResponse:
        df = analytics_service.filter_df(params)
        if df.empty:
            return OpportunityResponse(
                total_opportunities=0,
                high_priority_count=0,
                estimated_total_exposure=0.0,
                opportunities=[]
            )

        total_rev = float(df["sales"].sum())
        total_prof = float(df["profit"].sum())
        overall_margin = (total_prof / total_rev) if total_rev > 0 else 0.0

        opportunities: List[OpportunityItem] = []

        # 1. Evaluate Sub-Categories
        sub_cats = df.groupby("sub_category").agg(
            revenue=("sales", "sum"),
            profit=("profit", "sum"),
            orders=("order_id", "nunique"),
            units=("quantity", "sum"),
            discount=("discount", "mean")
        ).reset_index()

        # Find max revenue/profit exposure across sub-categories to normalize
        max_exposure = max(1.0, float(sub_cats["revenue"].max() * 0.20))

        for _, row in sub_cats.iterrows():
            name = str(row["sub_category"])
            rev = float(row["revenue"])
            prof = float(row["profit"])
            margin = (prof / rev) if rev > 0 else 0.0
            disc = float(row["discount"])
            orders = int(row["orders"])

            # Diagnose sub-category
            diag = diagnostic_service.diagnose("sub_category", name, params)
            if diag.status in ["critical", "underperforming", "watch"] and diag.status != "insufficient_sample":
                
                # Check for specific opportunity types
                if prof < 0:
                    # Critical Margin Recovery Opportunity
                    opp_type = "Margin Recovery"
                    title = f"Eliminate Net Operating Losses in {name}"
                    problem = f"{name} is eroding ${abs(prof):,.0f} in bottom-line profit with an average discount of {disc*100:.1f}%."
                    annual_exposure = abs(prof) + (rev * 0.08)
                    
                    impact_score = min(100.0, (annual_exposure / max_exposure) * 100)
                    gap_score = min(100.0, max(20.0, abs(margin - overall_margin) * 300))
                    feasibility_score = 85.0  # Pricing/discount intervention is highly actionable
                    urgency_score = 95.0
                    priority = "High"

                    action = f"Cap maximum discount at 15% and establish minimum gross margin floor on all {name} SKUs."
                    steps = [
                        f"Conduct immediate SKU-level profitability audit for all {name} items.",
                        "Remove authorized discretionary discounts exceeding 15% from sales reps.",
                        "Renegotiate wholesale acquisition costs with manufacturers or discontinue negative-margin SKUs."
                    ]

                elif disc > (df["discount"].mean() + 0.04) and margin < overall_margin:
                    # Discount Leakage Remediation
                    opp_type = "Discount Governance"
                    title = f"Plug Discount Leakage in {name}"
                    excess_discount_dollars = rev * (disc - df["discount"].mean())
                    problem = f"Excess promotional discounting ({disc*100:.1f}%) is compressing gross margin ({margin*100:.1f}% vs {overall_margin*100:.1f}% avg)."
                    annual_exposure = excess_discount_dollars * 0.8
                    
                    impact_score = min(100.0, (annual_exposure / max_exposure) * 100)
                    gap_score = min(100.0, abs(margin - overall_margin) * 250)
                    feasibility_score = 90.0
                    urgency_score = 80.0
                    priority = "High" if impact_score > 50 else "Medium"

                    action = f"Calibrate discount thresholds and link promotional pricing to bulk quantity commitments."
                    steps = [
                        "Replace blanket percentage discounts with volume-tier quantity hurdles.",
                        "Establish manager sign-off requirement for any deal discounted above 20%.",
                        "Monitor weekly gross margin realization by sales territory."
                    ]

                elif margin > overall_margin and orders < (df["order_id"].nunique() / len(sub_cats) * 0.7):
                    # High-Margin Demand Expansion
                    opp_type = "Demand Acceleration"
                    title = f"Scale High-Margin Demand for {name}"
                    potential_rev_gain = rev * 0.35
                    annual_exposure = potential_rev_gain * margin
                    problem = f"{name} achieves high margin ({margin*100:.1f}%), but order volume ({orders}) is under-penetrated."
                    
                    impact_score = min(100.0, (annual_exposure / max_exposure) * 100)
                    gap_score = 65.0
                    feasibility_score = 70.0
                    urgency_score = 60.0
                    priority = "Medium"

                    action = f"Increase catalog prominence and bundle {name} with high-traffic anchor categories."
                    steps = [
                        f"Feature {name} as recommended add-ons during checkout in related workflows.",
                        "Incentivize commercial sales teams on {name} unit volume.",
                        "Create seasonal promotion packages highlighting {name} quality."
                    ]

                else:
                    # General Optimization
                    opp_type = "Assortment Optimization"
                    title = f"Optimize Assortment and Pricing for {name}"
                    annual_exposure = rev * 0.05
                    problem = f"Margin performance ({margin*100:.1f}%) trails potential by {(overall_margin - margin)*100:.1f} pp."
                    
                    impact_score = min(100.0, (annual_exposure / max_exposure) * 100)
                    gap_score = min(100.0, max(20.0, abs(margin - overall_margin) * 150))
                    feasibility_score = 75.0
                    urgency_score = 50.0
                    priority = "Medium" if impact_score > 40 else "Low"

                    action = f"Rationalize low-velocity SKUs and adjust list pricing on {name}."
                    steps = [
                        "Identify the bottom 20% lowest margin SKUs within {name}.",
                        "Adjust baseline list prices upward by 3-5% on inelastic products.",
                        "Re-evaluate supplier terms during next quarterly vendor review."
                    ]

                composite_score = (
                    THRESHOLDS["weight_business_impact"] * impact_score +
                    THRESHOLDS["weight_performance_gap"] * gap_score +
                    THRESHOLDS["weight_feasibility"] * feasibility_score +
                    THRESHOLDS["weight_urgency"] * urgency_score
                )

                if composite_score >= 70:
                    priority_label = "High"
                elif composite_score >= 50:
                    priority_label = "Medium"
                else:
                    priority_label = "Low"

                opportunities.append(OpportunityItem(
                    id=f"opp-subcat-{name.lower().replace(' ', '-')}",
                    dimension="sub_category",
                    entity_name=name,
                    title=title,
                    problem=problem,
                    primary_driver=diag.primary_driver,
                    opportunity_type=opp_type,
                    business_impact_score=round(impact_score, 1),
                    performance_gap_score=round(gap_score, 1),
                    feasibility_score=round(feasibility_score, 1),
                    urgency_score=round(urgency_score, 1),
                    composite_score=round(composite_score, 1),
                    priority=priority_label,  # type: ignore
                    estimated_annual_exposure=round(annual_exposure, 2),
                    evidence=diag.evidence,
                    recommended_action=action,
                    implementation_steps=steps,
                    confidence=diag.confidence
                ))

        # 2. Evaluate Regional Gaps
        regions = df.groupby("region").agg(
            revenue=("sales", "sum"),
            profit=("profit", "sum"),
            discount=("discount", "mean")
        ).reset_index()

        for _, row in regions.iterrows():
            reg_name = str(row["region"])
            reg_rev = float(row["revenue"])
            reg_prof = float(row["profit"])
            reg_margin = (reg_prof / reg_rev) if reg_rev > 0 else 0.0
            reg_disc = float(row["discount"])

            if reg_margin < (overall_margin - 0.03):
                margin_deficit = (overall_margin - reg_margin) * reg_rev
                diag = diagnostic_service.diagnose("region", reg_name, params)
                
                impact_score = min(100.0, (margin_deficit / max_exposure) * 100)
                gap_score = min(100.0, (overall_margin - reg_margin) * 350)
                feasibility_score = 75.0
                urgency_score = 85.0
                
                composite_score = (
                    THRESHOLDS["weight_business_impact"] * impact_score +
                    THRESHOLDS["weight_performance_gap"] * gap_score +
                    THRESHOLDS["weight_feasibility"] * feasibility_score +
                    THRESHOLDS["weight_urgency"] * urgency_score
                )

                opportunities.append(OpportunityItem(
                    id=f"opp-region-{reg_name.lower()}",
                    dimension="region",
                    entity_name=reg_name,
                    title=f"Regional Margin Turnaround: {reg_name}",
                    problem=f"{reg_name} region delivers {reg_margin*100:.1f}% margin vs {overall_margin*100:.1f}% portfolio average, resulting in a ${margin_deficit:,.0f} profit gap.",
                    primary_driver=diag.primary_driver,
                    opportunity_type="Regional Turnaround",
                    business_impact_score=round(impact_score, 1),
                    performance_gap_score=round(gap_score, 1),
                    feasibility_score=round(feasibility_score, 1),
                    urgency_score=round(urgency_score, 1),
                    composite_score=round(composite_score, 1),
                    priority="High" if composite_score >= 70 else "Medium",
                    estimated_annual_exposure=round(margin_deficit, 2),
                    evidence=diag.evidence,
                    recommended_action=f"Enforce standard pricing rules and eliminate outlier discount exceptions in {reg_name}.",
                    implementation_steps=[
                        f"Audit top 10 underperforming accounts in {reg_name}.",
                        "Standardize regional freight and handling pass-through charges.",
                        "Align regional sales leadership compensation with gross profit dollars rather than gross revenue."
                    ],
                    confidence=diag.confidence
                ))

        # Sort opportunities descending by composite score
        opportunities.sort(key=lambda x: x.composite_score, reverse=True)

        high_pri_count = sum(1 for o in opportunities if o.priority == "High")
        total_exp = sum(o.estimated_annual_exposure for o in opportunities)

        return OpportunityResponse(
            total_opportunities=len(opportunities),
            high_priority_count=high_pri_count,
            estimated_total_exposure=round(total_exp, 2),
            opportunities=opportunities
        )

opportunity_service = OpportunityService()
