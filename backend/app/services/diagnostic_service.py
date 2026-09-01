import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Any, Tuple
from app.config import THRESHOLDS
from app.services.data_service import data_service
from app.services.analytics_service import analytics_service
from app.models.schemas import (
    FilterParams, DiagnosticResult, BenchmarkMetric, BreakdownItem
)

class DiagnosticService:
    def diagnose(self, dimension: str, entity_name: str, params: Optional[FilterParams] = None) -> DiagnosticResult:
        df = analytics_service.filter_df(params)
        
        dim_map = {
            "region": "region",
            "state": "state",
            "category": "category",
            "sub_category": "sub_category",
            "segment": "segment"
        }
        col = dim_map.get(dimension.lower(), "sub_category")

        if df.empty or col not in df.columns:
            return self._empty_result(dimension, entity_name)

        # Entity slice
        entity_df = df[df[col].astype(str).str.lower() == str(entity_name).lower()]
        peer_df = df[df[col].astype(str).str.lower() != str(entity_name).lower()]

        entity_sample = len(entity_df)
        peer_sample = len(peer_df)

        if entity_sample < THRESHOLDS["min_sample_size_safe"]:
            return DiagnosticResult(
                dimension=dimension,
                entity_name=entity_name,
                status="insufficient_sample",
                severity="Low",
                primary_driver="Insufficient Sample Size",
                confidence="Low",
                sample_size=entity_sample,
                peer_sample_size=peer_sample,
                summary=f"Sample size ({entity_sample} records) is too small to construct a statistically sound peer benchmark comparison.",
                evidence=[f"Entity transactions: {entity_sample} (minimum threshold: {THRESHOLDS['min_sample_size_safe']})"],
                recommended_action="Gather additional transaction volume before implementing policy interventions.",
                metrics_comparison=[]
            )

        # Entity Metrics
        e_rev = float(entity_df["sales"].sum())
        e_prof = float(entity_df["profit"].sum())
        e_margin = (e_prof / e_rev) if e_rev > 0 else 0.0
        e_orders = int(entity_df["order_id"].nunique())
        e_units = int(entity_df["quantity"].sum())
        e_aov = (e_rev / e_orders) if e_orders > 0 else 0.0
        e_discount = float(entity_df["discount"].mean())
        e_rev_per_unit = (e_rev / e_units) if e_units > 0 else 0.0

        # Peer Metrics (If peer is empty, use entire portfolio as baseline)
        if peer_df.empty:
            peer_df = df

        # Peer average per entity (normalized for entity comparison)
        peer_entities = peer_df[col].nunique()
        peer_div = max(1, peer_entities)

        p_rev = float(peer_df["sales"].sum()) / peer_div
        p_prof = float(peer_df["profit"].sum()) / peer_div
        p_total_rev = float(peer_df["sales"].sum())
        p_total_prof = float(peer_df["profit"].sum())
        p_margin = (p_total_prof / p_total_rev) if p_total_rev > 0 else 0.0
        p_orders = float(peer_df["order_id"].nunique()) / peer_div
        p_aov = (p_total_rev / float(peer_df["order_id"].nunique())) if peer_df["order_id"].nunique() > 0 else 0.0
        p_discount = float(peer_df["discount"].mean())

        # Construct Benchmark Comparison Metrics
        metrics_comparison = [
            BenchmarkMetric(
                metric="profit_margin",
                label="Profit Margin",
                entity_value=round(e_margin * 100, 2),
                peer_value=round(p_margin * 100, 2),
                gap=round((e_margin - p_margin) * 100, 2),
                gap_pct=round(((e_margin - p_margin) / max(0.01, abs(p_margin))) * 100, 1),
                unit="%",
                is_favorable=(e_margin >= p_margin)
            ),
            BenchmarkMetric(
                metric="revenue",
                label="Total Revenue",
                entity_value=round(e_rev, 2),
                peer_value=round(p_rev, 2),
                gap=round(e_rev - p_rev, 2),
                gap_pct=round(((e_rev - p_rev) / max(1.0, p_rev)) * 100, 1),
                unit="$",
                is_favorable=(e_rev >= p_rev)
            ),
            BenchmarkMetric(
                metric="profit",
                label="Net Profit",
                entity_value=round(e_prof, 2),
                peer_value=round(p_prof, 2),
                gap=round(e_prof - p_prof, 2),
                gap_pct=round(((e_prof - p_prof) / max(1.0, abs(p_prof))) * 100, 1),
                unit="$",
                is_favorable=(e_prof >= p_prof)
            ),
            BenchmarkMetric(
                metric="avg_discount",
                label="Average Discount Rate",
                entity_value=round(e_discount * 100, 2),
                peer_value=round(p_discount * 100, 2),
                gap=round((e_discount - p_discount) * 100, 2),
                gap_pct=round(((e_discount - p_discount) / max(0.01, p_discount)) * 100, 1),
                unit="%",
                is_favorable=(e_discount <= p_discount)
            ),
            BenchmarkMetric(
                metric="aov",
                label="Average Order Value (AOV)",
                entity_value=round(e_aov, 2),
                peer_value=round(p_aov, 2),
                gap=round(e_aov - p_aov, 2),
                gap_pct=round(((e_aov - p_aov) / max(1.0, p_aov)) * 100, 1),
                unit="$",
                is_favorable=(e_aov >= p_aov)
            ),
            BenchmarkMetric(
                metric="orders",
                label="Total Orders",
                entity_value=round(float(e_orders), 1),
                peer_value=round(float(p_orders), 1),
                gap=round(float(e_orders) - float(p_orders), 1),
                gap_pct=round(((float(e_orders) - float(p_orders)) / max(1.0, float(p_orders))) * 100, 1),
                unit="orders",
                is_favorable=(e_orders >= p_orders)
            )
        ]

        # Rule-based Driver Engine
        margin_gap_pp = e_margin - p_margin
        discount_gap_pp = e_discount - p_discount
        rev_rel_gap = (e_rev - p_rev) / max(1.0, p_rev)
        orders_rel_gap = (e_orders - p_orders) / max(1.0, p_orders)
        aov_rel_gap = (e_aov - p_aov) / max(1.0, p_aov)

        evidence: List[str] = []
        status: str = "watch"
        severity: str = "Low"
        driver: str = ""
        action: str = ""
        summary: str = ""
        confidence: str = "High" if entity_sample >= THRESHOLDS["min_sample_size_robust"] else "Medium"

        # 1. Critical Loss Check
        if e_prof < 0:
            status = "critical"
            severity = "Critical"
            driver = "Severe Margin Deficit / Value Destruction"
            evidence.append(f"Operating at net negative profit of -${abs(e_prof):,.0f} ({e_margin*100:.1f}% margin).")
            if discount_gap_pp > 0.03:
                evidence.append(f"Excessive discount rate of {e_discount*100:.1f}% (+{discount_gap_pp*100:.1f} pp higher than peer benchmark).")
                action = f"Immediately impose strict discount caps on {entity_name} and conduct SKU-level floor pricing audit."
            else:
                evidence.append(f"Cost of goods or overhead exceeds generated revenue per unit.")
                action = f"Review vendor supplier costs and minimum order quantities for {entity_name}."
            summary = f"{entity_name} is generating direct financial losses totaling -${abs(e_prof):,.0f}. Immediate intervention required."

        # 2. Discount Pressure / Leakage
        elif discount_gap_pp >= THRESHOLDS["discount_excess_threshold"] and margin_gap_pp <= -THRESHOLDS["margin_gap_warning_pp"]:
            status = "underperforming"
            severity = "High"
            driver = "Discount Leakage"
            evidence.append(f"Average discount rate of {e_discount*100:.1f}% exceeds peer benchmark ({p_discount*100:.1f}%) by {discount_gap_pp*100:.1f} percentage points.")
            evidence.append(f"Profit margin is compressed at {e_margin*100:.1f}% (trailing peer benchmark of {p_margin*100:.1f}% by {abs(margin_gap_pp)*100:.1f} pp).")
            action = f"Implement tiered discounting approval workflow and eliminate unhedged promotional markdowns on {entity_name}."
            summary = f"Aggressive discounting is eroding margin without generating proportional volume lift."

        # 3. Product Mix Distortion (Strong revenue but compressed margin)
        elif rev_rel_gap >= 0 and margin_gap_pp <= -THRESHOLDS["margin_gap_warning_pp"]:
            status = "underperforming"
            severity = "Medium"
            driver = "Unfavorable Product Mix"
            evidence.append(f"Revenue is solid at ${e_rev:,.0f} (+{rev_rel_gap*100:.1f}% vs peer baseline), but margin is lagging by {abs(margin_gap_pp)*100:.1f} percentage points.")
            evidence.append(f"High-volume sales are concentrated in lower-margin sub-segments.")
            action = f"Shift commercial incentive structure to prioritize high-margin cross-sells and attach rates in {entity_name}."
            summary = f"Top-line scale is healthy, but the underlying product mix drags down profitability."

        # 4. Volume / Demand Weakness
        elif orders_rel_gap <= -THRESHOLDS["relative_deviation_threshold"] and rev_rel_gap <= -THRESHOLDS["relative_deviation_threshold"]:
            status = "underperforming"
            severity = "Medium"
            driver = "Volume & Demand Contraction"
            evidence.append(f"Order volume of {e_orders} trails peer baseline of {p_orders:.0f} by {abs(orders_rel_gap)*100:.1f}%.")
            evidence.append(f"Total revenue is lagging by {abs(rev_rel_gap)*100:.1f}%.")
            if e_margin >= p_margin:
                evidence.append(f"Profit margin remains healthy at {e_margin*100:.1f}%, indicating pricing integrity is intact.")
                action = f"Activate targeted customer re-engagement campaigns and distribution expansion for {entity_name}."
            else:
                action = f"Evaluate channel coverage, sales pipeline throughput, and competitive positioning for {entity_name}."
            summary = f"Underperformance is primarily driven by sluggish order acquisition and transaction volume."

        # 5. Basket / AOV Weakness
        elif aov_rel_gap <= -THRESHOLDS["relative_deviation_threshold"] and orders_rel_gap >= -0.05:
            status = "watch"
            severity = "Low"
            driver = "Low Basket Value (AOV Deficit)"
            evidence.append(f"Average order value of ${e_aov:.2f} trails peer benchmark (${p_aov:.2f}) by {abs(aov_rel_gap)*100:.1f}%.")
            evidence.append(f"Transaction frequency is steady ({e_orders} orders), but basket depth per order is below potential.")
            action = f"Deploy minimum order incentives, bundled multi-packs, and complementary SKU recommendations for {entity_name}."
            summary = f"Transaction flow is consistent, but low basket spend per transaction is dampening revenue realization."

        # 6. Strong Star Performer
        elif rev_rel_gap >= 0.05 and margin_gap_pp >= 0.02:
            status = "strong"
            severity = "None"
            driver = "High-Efficiency Market Leadership"
            evidence.append(f"Outperforming peer benchmark in both Revenue (+{rev_rel_gap*100:.1f}%) and Profit Margin (+{margin_gap_pp*100:.1f} pp).")
            evidence.append(f"Generated ${e_prof:,.0f} in net profit ({e_margin*100:.1f}% margin).")
            action = f"Protect market share, replicate operational practices across weaker units, and explore selective capacity expansion."
            summary = f"{entity_name} is an exceptional core profit driver delivering superior returns across all key metrics."

        # 7. Default Balanced Performance
        else:
            status = "watch"
            severity = "Low"
            driver = "Balanced / Market Parity"
            evidence.append(f"Profit margin ({e_margin*100:.1f}%) and revenue (${e_rev:,.0f}) are tracking in close alignment with peer benchmarks.")
            action = f"Continue monitoring operational performance and optimize inventory turn cycles."
            summary = f"{entity_name} is performing in line with peer baseline expectations."

        # Sub-breakdown if applicable (e.g. if diagnosing category or region, show constituent sub-units)
        sub_breakdown = None
        if dimension.lower() == "category":
            sub_breakdown = analytics_service.calculate_breakdown("sub_category", FilterParams(categories=[entity_name])).items
        elif dimension.lower() == "region":
            sub_breakdown = analytics_service.calculate_breakdown("state", FilterParams(regions=[entity_name]), limit=10).items

        return DiagnosticResult(
            dimension=dimension,
            entity_name=entity_name,
            status=status,  # type: ignore
            severity=severity,  # type: ignore
            primary_driver=driver,
            confidence=confidence,  # type: ignore
            sample_size=entity_sample,
            peer_sample_size=peer_sample,
            summary=summary,
            evidence=evidence,
            recommended_action=action,
            metrics_comparison=metrics_comparison,
            sub_breakdown=sub_breakdown
        )

    def _empty_result(self, dimension: str, entity_name: str) -> DiagnosticResult:
        return DiagnosticResult(
            dimension=dimension,
            entity_name=entity_name,
            status="insufficient_sample",
            severity="None",
            primary_driver="No Data",
            confidence="Low",
            sample_size=0,
            peer_sample_size=0,
            summary="No matching transaction data found for the selected entity.",
            evidence=[],
            recommended_action="Adjust global filter parameters to include transactions.",
            metrics_comparison=[]
        )

diagnostic_service = DiagnosticService()
