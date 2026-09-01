import datetime
import pandas as pd
from typing import Dict, List, Optional, Any
from app.services.analytics_service import analytics_service
from app.services.diagnostic_service import diagnostic_service
from app.services.opportunity_service import opportunity_service
from app.models.schemas import FilterParams, ExecutiveReport, KpiSummary

class ReportService:
    def generate_report(self, params: Optional[FilterParams] = None) -> ExecutiveReport:
        kpis: KpiSummary = analytics_service.calculate_kpis(params)
        df = analytics_service.filter_df(params)
        opps_response = opportunity_service.get_opportunities(params)
        
        # Build human-readable filter summary
        filters_applied = []
        if params:
            if params.start_date or params.end_date:
                filters_applied.append(f"Date: {params.start_date or 'Start'} to {params.end_date or 'Present'}")
            if params.regions:
                filters_applied.append(f"Regions: {', '.join(params.regions)}")
            if params.categories:
                filters_applied.append(f"Categories: {', '.join(params.categories)}")
            if params.segments:
                filters_applied.append(f"Segments: {', '.join(params.segments)}")

        filter_str = "; ".join(filters_applied) if filters_applied else "Full Dataset (All Regions, Categories, and Segments)"

        # Executive summary narrative
        margin_pct = kpis.profit_margin * 100
        rev_formatted = f"${kpis.revenue:,.2f}"
        prof_formatted = f"${kpis.profit:,.2f}"
        
        narrative = (
            f"During the analyzed period, the business achieved total revenue of {rev_formatted} "
            f"generating {prof_formatted} in operating profit across {kpis.orders:,} distinct orders, "
            f"yielding an overall profit margin of {margin_pct:.1f}%. "
        )

        if kpis.profit_growth_pct is not None:
            direction = "expanded" if kpis.profit_growth_pct >= 0 else "contracted"
            narrative += f"Comparing the latter half of the period against the baseline, profit {direction} by {abs(kpis.profit_growth_pct):.1f}%. "

        narrative += (
            f"While top-line demand remains resilient with an Average Order Value of ${kpis.aov:,.2f}, "
            f"profitability is constrained by discount leakage and category mix imbalances, "
            f"with an estimated ${opps_response.estimated_total_exposure:,.2f} in quantifiable margin recovery opportunity identified."
        )

        # Key Findings
        key_findings = []
        key_findings.append(f"Core portfolio margin stands at {margin_pct:.1f}%, supported by ${kpis.rev_per_unit:.2f} revenue realized per unit sold.")
        
        if opps_response.high_priority_count > 0:
            key_findings.append(f"Identified {opps_response.high_priority_count} critical high-priority performance interventions totaling ${opps_response.estimated_total_exposure:,.2f} in profit exposure.")
        
        # Check category performance
        cat_breakdown = analytics_service.calculate_breakdown("category", params).items
        if cat_breakdown:
            top_cat = max(cat_breakdown, key=lambda x: x.revenue)
            top_prof_cat = max(cat_breakdown, key=lambda x: x.profit_margin)
            key_findings.append(f"Revenue volume is led by {top_cat.name} (${top_cat.revenue:,.0f} | {top_cat.revenue_share_pct:.1f}% share), while highest margin efficiency is delivered by {top_prof_cat.name} ({top_prof_cat.profit_margin*100:.1f}% margin).")

        # Major Gaps
        major_gaps = []
        sub_breakdown = analytics_service.calculate_breakdown("sub_category", params).items
        for item in sub_breakdown:
            if item.profit < 0:
                major_gaps.append({
                    "entity": item.name,
                    "dimension": "Sub-Category",
                    "issue": f"Net operating loss of -${abs(item.profit):,.0f} ({item.profit_margin*100:.1f}% margin)",
                    "primary_driver": "Excess Discounting / Cost Exceeding Net Price",
                    "severity": "Critical"
                })
            elif item.profit_margin < (kpis.profit_margin - 0.05):
                major_gaps.append({
                    "entity": item.name,
                    "dimension": "Sub-Category",
                    "issue": f"Margin compression at {item.profit_margin*100:.1f}% (trailing portfolio by {(kpis.profit_margin - item.profit_margin)*100:.1f} pp)",
                    "primary_driver": "Product Mix / Pricing Friction",
                    "severity": "High"
                })

        # Driver Analysis summary
        driver_analysis = []
        drivers_counted: Dict[str, int] = {}
        for opp in opps_response.opportunities:
            drivers_counted[opp.primary_driver] = drivers_counted.get(opp.primary_driver, 0) + 1

        for driver_name, count in sorted(drivers_counted.items(), key=lambda x: x[1], reverse=True):
            driver_analysis.append({
                "driver": driver_name,
                "affected_entities_count": count,
                "description": f"Identified as the root performance inhibitor across {count} operating entities."
            })

        # Top 5 Opportunities
        top_opps = opps_response.opportunities[:5]

        # Action Plan Roadmap
        action_plan = []
        for i, opp in enumerate(top_opps, 1):
            action_plan.append({
                "phase": f"Priority {i}",
                "target": f"{opp.entity_name} ({opp.dimension.replace('_', ' ').title()})",
                "opportunity_type": opp.opportunity_type,
                "recommended_action": opp.recommended_action,
                "key_steps": opp.implementation_steps,
                "financial_impact": f"${opp.estimated_annual_exposure:,.2f}"
            })

        return ExecutiveReport(
            title="Performa.io — Executive Performance Briefing",
            generated_at=datetime.datetime.now().strftime("%B %d, %Y at %H:%M UTC"),
            filter_summary=filter_str,
            executive_summary=narrative,
            kpis=kpis,
            key_findings=key_findings,
            major_gaps=major_gaps,
            driver_analysis=driver_analysis,
            top_opportunities=top_opps,
            action_plan=action_plan
        )

report_service = ReportService()
