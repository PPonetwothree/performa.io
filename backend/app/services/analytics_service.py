import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Any
from app.services.data_service import data_service
from app.models.schemas import (
    FilterParams, KpiSummary, TrendResponse, TrendDataPoint,
    BreakdownResponse, BreakdownItem, AlertItem
)

class AnalyticsService:
    def filter_df(self, params: Optional[FilterParams] = None) -> pd.DataFrame:
        df = data_service.df
        if df is None or df.empty:
            return pd.DataFrame()

        filtered = df.copy()

        if params:
            if params.start_date:
                filtered = filtered[filtered["order_date"] >= pd.to_datetime(params.start_date)]
            if params.end_date:
                filtered = filtered[filtered["order_date"] <= pd.to_datetime(params.end_date)]
            if params.regions and len(params.regions) > 0:
                filtered = filtered[filtered["region"].isin(params.regions)]
            if params.categories and len(params.categories) > 0:
                filtered = filtered[filtered["category"].isin(params.categories)]
            if params.segments and len(params.segments) > 0:
                filtered = filtered[filtered["segment"].isin(params.segments)]
            if params.states and len(params.states) > 0:
                filtered = filtered[filtered["state"].isin(params.states)]
            if params.sub_categories and len(params.sub_categories) > 0:
                filtered = filtered[filtered["sub_category"].isin(params.sub_categories)]

        return filtered

    def calculate_kpis(self, params: Optional[FilterParams] = None) -> KpiSummary:
        df = self.filter_df(params)
        if df.empty:
            return KpiSummary(
                revenue=0.0, profit=0.0, profit_margin=0.0, orders=0, units=0,
                aov=0.0, avg_discount=0.0, rev_per_unit=0.0, sample_size=0
            )

        revenue = float(df["sales"].sum())
        profit = float(df["profit"].sum())
        margin = (profit / revenue) if revenue > 0 else 0.0
        orders = int(df["order_id"].nunique())
        units = int(df["quantity"].sum())
        aov = (revenue / orders) if orders > 0 else 0.0
        
        # Weighted average discount
        avg_discount = float(df["discount"].mean())
        rev_per_unit = (revenue / units) if units > 0 else 0.0

        # Calculate period comparison if date range spans more than 60 days
        rev_growth = None
        prof_growth = None
        margin_gap = None
        orders_growth = None

        min_date = df["order_date"].min()
        max_date = df["order_date"].max()
        timespan_days = (max_date - min_date).days

        if timespan_days >= 60:
            midpoint = min_date + (max_date - min_date) / 2
            h1 = df[df["order_date"] <= midpoint]
            h2 = df[df["order_date"] > midpoint]

            if not h1.empty and not h2.empty:
                h1_rev = float(h1["sales"].sum())
                h2_rev = float(h2["sales"].sum())
                h1_prof = float(h1["profit"].sum())
                h2_prof = float(h2["profit"].sum())
                h1_ord = int(h1["order_id"].nunique())
                h2_ord = int(h2["order_id"].nunique())

                if h1_rev > 0:
                    rev_growth = round(((h2_rev - h1_rev) / h1_rev) * 100, 1)
                if h1_prof != 0:
                    prof_growth = round(((h2_prof - h1_prof) / abs(h1_prof)) * 100, 1)
                if h1_ord > 0:
                    orders_growth = round(((h2_ord - h1_ord) / h1_ord) * 100, 1)
                
                h1_margin = (h1_prof / h1_rev) if h1_rev > 0 else 0.0
                h2_margin = (h2_prof / h2_rev) if h2_rev > 0 else 0.0
                margin_gap = round((h2_margin - h1_margin) * 100, 2)

        return KpiSummary(
            revenue=round(revenue, 2),
            profit=round(profit, 2),
            profit_margin=round(margin, 4),
            orders=orders,
            units=units,
            aov=round(aov, 2),
            avg_discount=round(avg_discount, 4),
            rev_per_unit=round(rev_per_unit, 2),
            revenue_growth_pct=rev_growth,
            profit_growth_pct=prof_growth,
            margin_gap_pp=margin_gap,
            orders_growth_pct=orders_growth,
            sample_size=len(df)
        )

    def calculate_trends(self, params: Optional[FilterParams] = None, granularity: str = "month") -> TrendResponse:
        df = self.filter_df(params)
        if df.empty:
            return TrendResponse(granularity=granularity, trends=[])

        df = df.copy()
        if granularity == "quarter":
            df["period"] = df["order_date"].dt.to_period("Q").astype(str)
        else:
            df["period"] = df["order_date"].dt.to_period("M").astype(str)

        grouped = df.groupby("period").agg(
            revenue=("sales", "sum"),
            profit=("profit", "sum"),
            orders=("order_id", "nunique"),
            discount=("discount", "mean")
        ).reset_index()

        grouped["profit_margin"] = np.where(grouped["revenue"] > 0, grouped["profit"] / grouped["revenue"], 0.0)
        grouped["aov"] = np.where(grouped["orders"] > 0, grouped["revenue"] / grouped["orders"], 0.0)

        trends = []
        for _, row in grouped.iterrows():
            trends.append(TrendDataPoint(
                period=str(row["period"]),
                revenue=round(float(row["revenue"]), 2),
                profit=round(float(row["profit"]), 2),
                profit_margin=round(float(row["profit_margin"]), 4),
                orders=int(row["orders"]),
                aov=round(float(row["aov"]), 2),
                avg_discount=round(float(row["discount"]), 4)
            ))

        return TrendResponse(granularity=granularity, trends=trends)

    def calculate_breakdown(self, dimension: str, params: Optional[FilterParams] = None, limit: int = 50) -> BreakdownResponse:
        dim_map = {
            "region": "region",
            "state": "state",
            "category": "category",
            "sub_category": "sub_category",
            "segment": "segment",
            "product": "product"
        }

        col = dim_map.get(dimension.lower(), "category")
        df = self.filter_df(params)
        if df.empty or col not in df.columns:
            return BreakdownResponse(dimension=dimension, items=[])

        total_rev = float(df["sales"].sum())
        total_prof = float(df["profit"].sum())

        grouped = df.groupby(col).agg(
            revenue=("sales", "sum"),
            profit=("profit", "sum"),
            orders=("order_id", "nunique"),
            units=("quantity", "sum"),
            discount=("discount", "mean")
        ).reset_index()

        grouped["profit_margin"] = np.where(grouped["revenue"] > 0, grouped["profit"] / grouped["revenue"], 0.0)
        grouped["aov"] = np.where(grouped["orders"] > 0, grouped["revenue"] / grouped["orders"], 0.0)
        grouped["rev_share"] = np.where(total_rev > 0, (grouped["revenue"] / total_rev) * 100, 0.0)
        grouped["prof_share"] = np.where(total_prof != 0, (grouped["profit"] / abs(total_prof)) * 100, 0.0)

        # Sort descending by revenue
        grouped = grouped.sort_values(by="revenue", ascending=False).reset_index(drop=True)

        # Calculate cumulative revenue share for Pareto
        grouped["cum_rev"] = grouped["revenue"].cumsum()
        grouped["cum_rev_pct"] = np.where(total_rev > 0, (grouped["cum_rev"] / total_rev) * 100, 0.0)

        if limit > 0:
            grouped = grouped.head(limit)

        overall_margin = (total_prof / total_rev) if total_rev > 0 else 0.0

        items = []
        for _, row in grouped.iterrows():
            margin = float(row["profit_margin"])
            profit = float(row["profit"])

            if profit < 0:
                status = "critical"
            elif margin < (overall_margin - 0.04):
                status = "underperforming"
            elif margin > (overall_margin + 0.03):
                status = "strong"
            else:
                status = "watch"

            items.append(BreakdownItem(
                dimension=dimension,
                name=str(row[col]),
                revenue=round(float(row["revenue"]), 2),
                profit=round(float(row["profit"]), 2),
                profit_margin=round(margin, 4),
                orders=int(row["orders"]),
                units=int(row["units"]),
                aov=round(float(row["aov"]), 2),
                avg_discount=round(float(row["discount"]), 4),
                revenue_share_pct=round(float(row["rev_share"]), 2),
                profit_share_pct=round(float(row["prof_share"]), 2),
                cumulative_revenue_pct=round(float(row["cum_rev_pct"]), 2),
                status=status
            ))

        return BreakdownResponse(dimension=dimension, items=items)

    def generate_alerts(self, params: Optional[FilterParams] = None) -> List[AlertItem]:
        df = self.filter_df(params)
        if df.empty:
            return []

        alerts: List[AlertItem] = []
        total_rev = float(df["sales"].sum())
        total_prof = float(df["profit"].sum())
        overall_margin = (total_prof / total_rev) if total_rev > 0 else 0.0

        # Check sub-categories for negative profit / discount leakage
        sub_cats = df.groupby("sub_category").agg(
            revenue=("sales", "sum"),
            profit=("profit", "sum"),
            discount=("discount", "mean")
        ).reset_index()

        for _, row in sub_cats.iterrows():
            sub_name = str(row["sub_category"])
            sub_prof = float(row["profit"])
            sub_rev = float(row["revenue"])
            sub_disc = float(row["discount"])
            sub_margin = (sub_prof / sub_rev) if sub_rev > 0 else 0.0

            if sub_prof < 0:
                alerts.append(AlertItem(
                    id=f"alert-loss-{sub_name.lower().replace(' ', '-')}",
                    title=f"Critical Margin Deficit in {sub_name}",
                    severity="critical",
                    message=f"{sub_name} is operating at a net loss (${abs(sub_prof):,.0f} deficit) with an average discount rate of {sub_disc*100:.1f}%. Immediate discount threshold review required.",
                    metric="Margin / Profit Deficit",
                    value=f"-${abs(sub_prof):,.0f} ({sub_margin*100:.1f}%)",
                    entity_name=sub_name,
                    entity_type="sub_category"
                ))
            elif sub_disc > 0.25 and sub_margin < 0.08:
                alerts.append(AlertItem(
                    id=f"alert-leakage-{sub_name.lower().replace(' ', '-')}",
                    title=f"Discount Leakage Detected in {sub_name}",
                    severity="warning",
                    message=f"{sub_name} discount averaging {sub_disc*100:.1f}% is materially eroding margin ({sub_margin*100:.1f}% vs {overall_margin*100:.1f}% portfolio avg).",
                    metric="Avg Discount",
                    value=f"{sub_disc*100:.1f}%",
                    entity_name=sub_name,
                    entity_type="sub_category"
                ))

        # Check Regions for underperformance
        regions = df.groupby("region").agg(
            revenue=("sales", "sum"),
            profit=("profit", "sum"),
            discount=("discount", "mean")
        ).reset_index()

        for _, row in regions.iterrows():
            reg_name = str(row["region"])
            reg_prof = float(row["profit"])
            reg_rev = float(row["revenue"])
            reg_margin = (reg_prof / reg_rev) if reg_rev > 0 else 0.0

            if reg_margin < (overall_margin - 0.04):
                alerts.append(AlertItem(
                    id=f"alert-region-margin-{reg_name.lower()}",
                    title=f"Sub-Benchmark Profit Margin in {reg_name} Region",
                    severity="warning",
                    message=f"{reg_name} region delivers {reg_margin*100:.1f}% profit margin, trailing portfolio benchmark of {overall_margin*100:.1f}% by {(overall_margin - reg_margin)*100:.1f} percentage points.",
                    metric="Margin Gap",
                    value=f"-{(overall_margin - reg_margin)*100:.1f} pp",
                    entity_name=reg_name,
                    entity_type="region"
                ))

        # Check top performing positive star
        top_cats = df.groupby("category").agg(
            revenue=("sales", "sum"),
            profit=("profit", "sum")
        ).reset_index()

        for _, row in top_cats.iterrows():
            c_name = str(row["category"])
            c_rev = float(row["revenue"])
            c_prof = float(row["profit"])
            c_margin = (c_prof / c_rev) if c_rev > 0 else 0.0
            if c_margin > (overall_margin + 0.05) and (c_rev / total_rev) > 0.20:
                alerts.append(AlertItem(
                    id=f"alert-star-{c_name.lower().replace(' ', '-')}",
                    title=f"High Margin Driver: {c_name}",
                    severity="positive",
                    message=f"{c_name} generates superior return at {c_margin*100:.1f}% margin, driving ${(c_prof):,.0f} in net profit ({((c_prof/total_prof)*100 if total_prof else 0):.1f}% of total profit).",
                    metric="Profit Contribution",
                    value=f"${c_prof:,.0f} ({c_margin*100:.1f}% margin)",
                    entity_name=c_name,
                    entity_type="category"
                ))

        # Limit to top 5 most relevant alerts
        return alerts[:5]

analytics_service = AnalyticsService()
