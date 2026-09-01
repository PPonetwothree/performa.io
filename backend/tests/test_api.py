import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"

def test_data_status():
    res = client.get("/api/data/status")
    assert res.status_code == 200
    data = res.json()
    assert data["total_rows"] > 0
    assert data["total_revenue"] > 0

def test_filter_options():
    res = client.get("/api/filters/options")
    assert res.status_code == 200
    data = res.json()
    assert len(data["regions"]) > 0
    assert len(data["categories"]) > 0

def test_kpis_endpoint():
    res = client.post("/api/kpis", json={})
    assert res.status_code == 200
    data = res.json()
    assert data["revenue"] > 0
    assert data["orders"] > 0

def test_trends_endpoint():
    res = client.post("/api/trends?granularity=month", json={})
    assert res.status_code == 200
    data = res.json()
    assert len(data["trends"]) > 0

def test_breakdown_endpoint():
    res = client.post("/api/breakdown?dimension=region", json={})
    assert res.status_code == 200
    data = res.json()
    assert len(data["items"]) > 0

def test_alerts_endpoint():
    res = client.post("/api/alerts", json={})
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)

def test_diagnose_endpoint():
    res = client.post("/api/diagnose?dimension=category&entity_name=Furniture", json={})
    assert res.status_code == 200
    data = res.json()
    assert data["entity_name"] == "Furniture"
    assert "primary_driver" in data

def test_opportunities_endpoint():
    res = client.post("/api/opportunities", json={})
    assert res.status_code == 200
    data = res.json()
    assert data["total_opportunities"] > 0

def test_reports_endpoint():
    res = client.post("/api/reports", json={})
    assert res.status_code == 200
    data = res.json()
    assert "executive_summary" in data
