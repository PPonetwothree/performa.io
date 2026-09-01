export interface FilterParams {
  start_date?: string;
  end_date?: string;
  regions?: string[];
  categories?: string[];
  segments?: string[];
  states?: string[];
  sub_categories?: string[];
}

export interface FilterOptions {
  min_date: string;
  max_date: string;
  regions: string[];
  categories: string[];
  segments: string[];
  states: string[];
  sub_categories: string[];
}

export interface KpiSummary {
  revenue: number;
  profit: number;
  profit_margin: number;
  orders: number;
  units: number;
  aov: number;
  avg_discount: number;
  rev_per_unit: number;
  revenue_growth_pct?: number | null;
  profit_growth_pct?: number | null;
  margin_gap_pp?: number | null;
  orders_growth_pct?: number | null;
  sample_size: number;
}

export interface TrendDataPoint {
  period: string;
  revenue: number;
  profit: number;
  profit_margin: number;
  orders: number;
  aov: number;
  avg_discount: number;
}

export interface TrendResponse {
  granularity: string;
  trends: TrendDataPoint[];
}

export interface BreakdownItem {
  dimension: string;
  name: string;
  revenue: number;
  profit: number;
  profit_margin: number;
  orders: number;
  units: number;
  aov: number;
  avg_discount: number;
  revenue_share_pct: number;
  profit_share_pct: number;
  cumulative_revenue_pct?: number;
  status?: 'critical' | 'underperforming' | 'watch' | 'strong';
}

export interface BreakdownResponse {
  dimension: string;
  items: BreakdownItem[];
}

export interface AlertItem {
  id: string;
  title: string;
  severity: 'critical' | 'warning' | 'info' | 'positive';
  message: string;
  metric: string;
  value: string;
  entity_name?: string;
  entity_type?: string;
}

export interface BenchmarkMetric {
  metric: string;
  label: string;
  entity_value: number;
  peer_value: number;
  gap: number;
  gap_pct: number;
  unit: string;
  is_favorable: boolean;
}

export interface DiagnosticResult {
  dimension: string;
  entity_name: string;
  status: 'critical' | 'underperforming' | 'watch' | 'strong' | 'insufficient_sample';
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'None';
  primary_driver: string;
  confidence: 'High' | 'Medium' | 'Low';
  sample_size: number;
  peer_sample_size: number;
  summary: string;
  evidence: string[];
  recommended_action: string;
  metrics_comparison: BenchmarkMetric[];
  sub_breakdown?: BreakdownItem[];
}

export interface OpportunityItem {
  id: string;
  dimension: string;
  entity_name: string;
  title: string;
  problem: string;
  primary_driver: string;
  opportunity_type: string;
  business_impact_score: number;
  performance_gap_score: number;
  feasibility_score: number;
  urgency_score: number;
  composite_score: number;
  priority: 'High' | 'Medium' | 'Low';
  estimated_annual_exposure: number;
  evidence: string[];
  recommended_action: string;
  implementation_steps: string[];
  confidence: 'High' | 'Medium' | 'Low';
}

export interface OpportunityResponse {
  total_opportunities: number;
  high_priority_count: number;
  estimated_total_exposure: number;
  opportunities: OpportunityItem[];
}

export interface ExecutiveReport {
  title: string;
  generated_at: string;
  filter_summary: string;
  executive_summary: string;
  kpis: KpiSummary;
  key_findings: string[];
  major_gaps: {
    entity: string;
    dimension: string;
    issue: string;
    primary_driver: string;
    severity: string;
  }[];
  driver_analysis: {
    driver: string;
    affected_entities_count: number;
    description: string;
  }[];
  top_opportunities: OpportunityItem[];
  action_plan: {
    phase: string;
    target: string;
    opportunity_type: string;
    recommended_action: string;
    key_steps: string[];
    financial_impact: string;
  }[];
}

export interface DatasetStatus {
  filename: string;
  is_default: boolean;
  total_rows: number;
  date_min: string;
  date_max: string;
  total_revenue: number;
  total_profit: number;
  overall_margin: number;
  columns_mapped: Record<string, string>;
  quality_score: number;
}
