import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
DEFAULT_DATASET_PATH = DATA_DIR / "sample_retail_data.csv"

# Column aliases mapping
COLUMN_ALIASES = {
    "order_id": ["order id", "order_id", "orderid", "transaction id", "transaction_id", "id"],
    "order_date": ["order date", "order_date", "orderdate", "date", "transaction date", "transaction_date"],
    "customer": ["customer", "customer name", "customer_name", "client", "customer id", "customer_id"],
    "segment": ["segment", "customer segment", "customer_segment", "account type"],
    "region": ["region", "territory", "area", "zone"],
    "state": ["state", "province", "region_state"],
    "city": ["city", "town", "municipality"],
    "category": ["category", "product category", "product_category", "dept", "department"],
    "sub_category": ["sub-category", "sub category", "subcategory", "sub_category", "sub department", "class"],
    "product": ["product", "product name", "product_name", "item", "item description", "sku"],
    "sales": ["sales", "revenue", "amount", "order amount", "total sales", "turnover", "total_amount"],
    "quantity": ["quantity", "units", "qty", "volume", "count", "units sold"],
    "discount": ["discount", "discount rate", "discount_rate", "discount percentage", "discount_pct", "markdown"],
    "profit": ["profit", "net profit", "net_profit", "earnings", "margin amount", "contribution"]
}

REQUIRED_COLUMNS = [
    "order_id", "order_date", "sales", "quantity", "profit"
]

RECOMMENDED_COLUMNS = [
    "customer", "segment", "region", "state", "city", "category", "sub_category", "product", "discount"
]

# Diagnostic Thresholds
THRESHOLDS = {
    # 10% relative deviation or 2 percentage points for margin
    "margin_gap_warning_pp": 0.03,        # 3% margin point gap
    "margin_gap_critical_pp": 0.08,       # 8% margin point gap
    "relative_deviation_threshold": 0.10, # 10% relative variance
    "discount_excess_threshold": 0.05,    # 5 percentage points above peer average discount
    "min_sample_size_safe": 10,           # Insufficient sample threshold
    "min_sample_size_robust": 30,         # High confidence threshold
    
    # Opportunity Scoring Weights (Sum to 1.0)
    "weight_business_impact": 0.40,
    "weight_performance_gap": 0.30,
    "weight_feasibility": 0.20,
    "weight_urgency": 0.10
}
