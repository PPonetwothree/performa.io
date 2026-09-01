from fastapi import APIRouter, UploadFile, File, HTTPException, Query, Body
from typing import Optional, List
from app.services.data_service import data_service
from app.services.analytics_service import analytics_service
from app.services.diagnostic_service import diagnostic_service
from app.services.opportunity_service import opportunity_service
from app.services.report_service import report_service
from app.models.schemas import (
    FilterParams, FilterOptions, DatasetStatus, KpiSummary,
    TrendResponse, BreakdownResponse, AlertItem,
    DiagnosticResult, OpportunityResponse, ExecutiveReport
)

router = APIRouter(prefix="/api")

@router.get("/health")
def health_check():
    return {"status": "ok", "app": "Performa.io", "version": "1.0.0"}

@router.get("/data/status", response_model=DatasetStatus)
def get_data_status():
    try:
        return data_service.get_status()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/data/upload")
async def upload_dataset(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Invalid file type. Only CSV files are supported.")
    
    # 50MB file size limit
    contents = await file.read()
    if len(contents) > 50 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Maximum CSV size is 50MB.")
        
    try:
        result = data_service.upload_csv(contents, file.filename)
        return result
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@router.post("/data/reset")
def reset_to_default_dataset():
    try:
        data_service.load_default_data()
        return {"success": True, "message": "Reset to default Kaggle Superstore retail dataset."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/filters/options", response_model=FilterOptions)
def get_filter_options():
    try:
        return data_service.get_filter_options()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/kpis", response_model=KpiSummary)
def get_kpis(params: Optional[FilterParams] = Body(None)):
    try:
        return analytics_service.calculate_kpis(params)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/trends", response_model=TrendResponse)
def get_trends(
    params: Optional[FilterParams] = Body(None),
    granularity: str = Query("month", pattern="^(month|quarter)$")
):
    try:
        return analytics_service.calculate_trends(params, granularity=granularity)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/breakdown", response_model=BreakdownResponse)
def get_breakdown(
    dimension: str = Query("category", pattern="^(region|state|category|sub_category|segment|product)$"),
    limit: int = Query(50, ge=1, le=200),
    params: Optional[FilterParams] = Body(None)
):
    try:
        return analytics_service.calculate_breakdown(dimension, params, limit=limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/alerts", response_model=List[AlertItem])
def get_alerts(params: Optional[FilterParams] = Body(None)):
    try:
        return analytics_service.generate_alerts(params)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/diagnose", response_model=DiagnosticResult)
def diagnose_entity(
    dimension: str = Query(..., pattern="^(region|state|category|sub_category|segment)$"),
    entity_name: str = Query(...),
    params: Optional[FilterParams] = Body(None)
):
    try:
        return diagnostic_service.diagnose(dimension, entity_name, params)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/opportunities", response_model=OpportunityResponse)
def get_opportunities(params: Optional[FilterParams] = Body(None)):
    try:
        return opportunity_service.get_opportunities(params)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/reports", response_model=ExecutiveReport)
def generate_report(params: Optional[FilterParams] = Body(None)):
    try:
        return report_service.generate_report(params)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
