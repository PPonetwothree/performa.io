from typing import List, Dict, Any, Optional, Literal
from pydantic import BaseModel, Field

# Filter model
class FilterParams(BaseModel):
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    regions: Optional[List[str]] = None
    categories: Optional[List[str]] = None
    segments: Optional[List[str]] = None
    states: Optional[List[str]] = None
    sub_categories: Optional[List[str]] = None

class FilterOptions(BaseModel):
    min_date: str
    max_date: str
    regions: List[str]
    categories: List[str]
    segments: List[str]
    states: List[str]
    sub_categories: List[str]

# KPI Models
class KpiSummary(BaseModel):
    revenue: float
    profit: float
    profit_margin: float
    orders: int
    units: int
    aov: float
    avg_discount: float
    rev_per_unit: float
    # Growth metrics (vs prior period or baseline)
    revenue_growth_pct: Optional[float] = None
    profit_growth_pct: Optional[float] = None
    margin_gap_pp: Optional[float] = None
    orders_growth_pct: Optional[float] = None
    sample_size: int

class TrendDataPoint(BaseModel):
    period: str
    revenue: float
    profit: float
    profit_margin: float
    orders: int
    aov: float
    avg_discount: float

class TrendResponse(BaseModel):
    granularity: str
    trends: List[TrendDataPoint]

class BreakdownItem(BaseModel):
    dimension: str
    name: str
    revenue: float
    profit: float
    profit_margin: float
    orders: int
    units: int
    aov: float
    avg_discount: float
    revenue_share_pct: float
    profit_share_pct: float
    cumulative_revenue_pct: Optional[float] = None
    status: Optional[str] = None

class BreakdownResponse(BaseModel):
    dimension: str
    items: List[BreakdownItem]

class AlertItem(BaseModel):
    id: str
    title: str
    severity: Literal["critical", "warning", "info", "positive"]
    message: str
    metric: str
    value: str
    entity_name: Optional[str] = None
    entity_type: Optional[str] = None

class BenchmarkMetric(BaseModel):
    metric: str
    label: str
    entity_value: float
    peer_value: float
    gap: float
    gap_pct: float
    unit: str
    is_favorable: bool

class DiagnosticResult(BaseModel):
    dimension: str
    entity_name: str
    status: Literal["critical", "underperforming", "watch", "strong", "insufficient_sample"]
    severity: Literal["Critical", "High", "Medium", "Low", "None"]
    primary_driver: str
    confidence: Literal["High", "Medium", "Low"]
    sample_size: int
    peer_sample_size: int
    summary: str
    evidence: List[str]
    recommended_action: str
    metrics_comparison: List[BenchmarkMetric]
    sub_breakdown: Optional[List[BreakdownItem]] = None

class OpportunityItem(BaseModel):
    id: str
    dimension: str
    entity_name: str
    title: str
    problem: str
    primary_driver: str
    opportunity_type: str
    business_impact_score: float  # 0-100
    performance_gap_score: float  # 0-100
    feasibility_score: float      # 0-100
    urgency_score: float          # 0-100
    composite_score: float        # 0-100
    priority: Literal["High", "Medium", "Low"]
    estimated_annual_exposure: float
    evidence: List[str]
    recommended_action: str
    implementation_steps: List[str]
    confidence: Literal["High", "Medium", "Low"]

class OpportunityResponse(BaseModel):
    total_opportunities: int
    high_priority_count: int
    estimated_total_exposure: float
    opportunities: List[OpportunityItem]

class ExecutiveReport(BaseModel):
    title: str
    generated_at: str
    filter_summary: str
    executive_summary: str
    kpis: KpiSummary
    key_findings: List[str]
    major_gaps: List[Dict[str, Any]]
    driver_analysis: List[Dict[str, Any]]
    top_opportunities: List[OpportunityItem]
    action_plan: List[Dict[str, Any]]

class DatasetStatus(BaseModel):
    filename: str
    is_default: bool
    total_rows: int
    date_min: str
    date_max: str
    total_revenue: float
    total_profit: float
    overall_margin: float
    columns_mapped: Dict[str, str]
    quality_score: float
