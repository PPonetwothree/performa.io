import pytest
from app.services.data_service import data_service
from app.services.analytics_service import analytics_service
from app.services.diagnostic_service import diagnostic_service
from app.services.opportunity_service import opportunity_service
from app.services.report_service import report_service
from app.models.schemas import FilterParams

def test_data_service_loaded():
    assert data_service.df is not None
    assert len(data_service.df) > 0
    status = data_service.get_status()
    assert status.total_rows > 0
    assert status.total_revenue > 0
    assert status.overall_margin > 0

def test_kpi_calculation():
    kpis = analytics_service.calculate_kpis()
    assert kpis.revenue > 0
    assert kpis.orders > 0
    assert kpis.units > 0
    assert kpis.aov > 0
    assert kpis.sample_size == len(data_service.df)

def test_kpi_filtering():
    params = FilterParams(regions=["Central"])
    kpis = analytics_service.calculate_kpis(params)
    assert kpis.revenue > 0
    assert kpis.sample_size < len(data_service.df)

def test_breakdown():
    res = analytics_service.calculate_breakdown("category")
    assert len(res.items) > 0
    assert sum(item.revenue_share_pct for item in res.items) == pytest.approx(100.0, rel=1e-2)

def test_diagnostic_engine():
    res = diagnostic_service.diagnose("category", "Furniture")
    assert res.entity_name == "Furniture"
    assert res.status in ["critical", "underperforming", "watch", "strong"]
    assert len(res.metrics_comparison) > 0
    assert len(res.evidence) > 0

def test_opportunity_service():
    opps = opportunity_service.get_opportunities()
    assert opps.total_opportunities > 0
    assert opps.estimated_total_exposure > 0
    # Highest composite score should be first
    scores = [o.composite_score for o in opps.opportunities]
    assert scores == sorted(scores, reverse=True)

def test_report_service():
    rep = report_service.generate_report()
    assert rep.title != ""
    assert len(rep.executive_summary) > 50
    assert len(rep.key_findings) > 0
    assert len(rep.top_opportunities) > 0
