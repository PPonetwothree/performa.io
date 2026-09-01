import os
import pandas as pd
import numpy as np

def generate_kaggle_superstore_dataset(output_path: str):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    np.random.seed(42)
    
    regions_states = {
        "East": [
            ("New York", ["New York City", "Buffalo", "Rochester", "Yonkers"]),
            ("Pennsylvania", ["Philadelphia", "Pittsburgh", "Allentown"]),
            ("Massachusetts", ["Boston", "Worcester", "Springfield"]),
            ("New Jersey", ["Newark", "Jersey City", "Paterson"]),
            ("Ohio", ["Columbus", "Cleveland", "Cincinnati"])
        ],
        "West": [
            ("California", ["Los Angeles", "San Francisco", "San Diego", "San Jose"]),
            ("Washington", ["Seattle", "Spokane", "Tacoma"]),
            ("Oregon", ["Portland", "Eugene", "Salem"]),
            ("Colorado", ["Denver", "Colorado Springs", "Aurora"]),
            ("Arizona", ["Phoenix", "Tucson", "Mesa"])
        ],
        "Central": [
            ("Texas", ["Houston", "Dallas", "Austin", "San Antonio"]),
            ("Illinois", ["Chicago", "Aurora", "Naperville"]),
            ("Michigan", ["Detroit", "Grand Rapids", "Warren"]),
            ("Indiana", ["Indianapolis", "Fort Wayne", "Evansville"]),
            ("Wisconsin", ["Milwaukee", "Madison", "Green Bay"])
        ],
        "South": [
            ("Florida", ["Miami", "Orlando", "Tampa", "Jacksonville"]),
            ("North Carolina", ["Charlotte", "Raleigh", "Greensboro"]),
            ("Georgia", ["Atlanta", "Columbus", "Savannah"]),
            ("Virginia", ["Virginia Beach", "Norfolk", "Richmond"]),
            ("Tennessee", ["Nashville", "Memphis", "Knoxville"])
        ]
    }
    
    categories = {
        "Furniture": {
            "Chairs": {"base_price": (100, 700), "margin": 0.15, "discount_sens": 1.2},
            "Tables": {"base_price": (200, 1200), "margin": -0.05, "discount_sens": 2.0},  # Chronic margin problem
            "Bookcases": {"base_price": (150, 800), "margin": 0.03, "discount_sens": 1.5},
            "Furnishings": {"base_price": (10, 150), "margin": 0.25, "discount_sens": 0.8}
        },
        "Office Supplies": {
            "Binders": {"base_price": (5, 80), "margin": 0.35, "discount_sens": 1.8},      # High discount, volume driver
            "Paper": {"base_price": (10, 100), "margin": 0.42, "discount_sens": 0.5},      # High margin staple
            "Storage": {"base_price": (20, 300), "margin": 0.18, "discount_sens": 0.9},
            "Appliances": {"base_price": (50, 600), "margin": 0.22, "discount_sens": 1.1},
            "Art": {"base_price": (5, 60), "margin": 0.30, "discount_sens": 0.6},
            "Envelopes": {"base_price": (5, 40), "margin": 0.38, "discount_sens": 0.5},
            "Labels": {"base_price": (4, 30), "margin": 0.44, "discount_sens": 0.4},
            "Fasteners": {"base_price": (3, 20), "margin": 0.32, "discount_sens": 0.4},
            "Supplies": {"base_price": (10, 120), "margin": 0.12, "discount_sens": 1.0}
        },
        "Technology": {
            "Phones": {"base_price": (150, 1100), "margin": 0.22, "discount_sens": 0.8},   # High revenue & good margin
            "Accessories": {"base_price": (20, 250), "margin": 0.32, "discount_sens": 0.6},
            "Machines": {"base_price": (300, 2500), "margin": 0.08, "discount_sens": 1.6}, # Capital item, high discount risk
            "Copiers": {"base_price": (500, 3500), "margin": 0.45, "discount_sens": 0.5}   # Premium high profit star
        }
    }
    
    segments = ["Consumer", "Corporate", "Home Office"]
    segment_weights = [0.52, 0.30, 0.18]
    
    first_names = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William", "Elizabeth", 
                   "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen", 
                   "Christopher", "Nancy", "Daniel", "Lisa", "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra"]
    last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", 
                  "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"]
    
    customers = [f"{fn} {ln}" for fn in first_names for ln in last_names]
    
    # 9994 rows (Superstore standard size)
    n_rows = 9994
    
    # Dates spanning 2023-01-01 to 2024-12-31 (2 full years for YoY and QoQ trends)
    start_date = pd.to_datetime("2023-01-01")
    end_date = pd.to_datetime("2024-12-31")
    date_range_days = (end_date - start_date).days
    
    # Generate orders
    # Approximately 5000 unique orders
    n_orders = 5000
    order_ids = [f"CA-{np.random.randint(2023, 2025)}-{100000 + i}" for i in range(n_orders)]
    
    rows = []
    
    for i in range(n_rows):
        order_id = np.random.choice(order_ids)
        # Year from order ID or random date
        day_offset = np.random.randint(0, date_range_days)
        # Add seasonal Q4 bump
        if np.random.rand() > 0.65:
            # Q4 bias (Nov-Dec)
            year = np.random.choice([2023, 2024])
            month = np.random.choice([10, 11, 12])
            day = np.random.randint(1, 29)
            order_date = pd.Timestamp(year=year, month=month, day=day)
        else:
            order_date = start_date + pd.Timedelta(days=day_offset)
            
        customer = np.random.choice(customers)
        segment = np.random.choice(segments, p=segment_weights)
        
        region = np.random.choice(list(regions_states.keys()), p=[0.31, 0.32, 0.23, 0.14])
        state_info = regions_states[region][np.random.randint(len(regions_states[region]))]
        state = state_info[0]
        city = np.random.choice(state_info[1])
        
        category = np.random.choice(list(categories.keys()), p=[0.21, 0.60, 0.19])
        sub_cat_choices = list(categories[category].keys())
        sub_cat = np.random.choice(sub_cat_choices)
        
        sub_cat_meta = categories[category][sub_cat]
        base_low, base_high = sub_cat_meta["base_price"]
        base_price = np.random.uniform(base_low, base_high)
        
        quantity = np.random.choice([1, 2, 3, 4, 5, 6, 7, 8, 9], p=[0.25, 0.28, 0.18, 0.12, 0.08, 0.04, 0.02, 0.02, 0.01])
        
        # Discounts: standard is 0, 0.1, 0.2, 0.3, 0.4, 0.6, 0.7, 0.8
        # Central Region + Texas/Illinois + Tables/Binders has elevated discounts (Discount Leakage)
        if region == "Central" and sub_cat in ["Tables", "Binders", "Machines"]:
            discount = np.random.choice([0.2, 0.3, 0.5, 0.6, 0.7, 0.8], p=[0.15, 0.20, 0.25, 0.20, 0.10, 0.10])
        elif sub_cat == "Tables":
            discount = np.random.choice([0.0, 0.15, 0.2, 0.3, 0.4, 0.5], p=[0.2, 0.2, 0.2, 0.2, 0.1, 0.1])
        elif category == "Technology" and sub_cat == "Copiers":
            discount = np.random.choice([0.0, 0.1, 0.2], p=[0.7, 0.2, 0.1])
        else:
            discount = np.random.choice([0.0, 0.1, 0.15, 0.2, 0.3, 0.4], p=[0.45, 0.15, 0.15, 0.15, 0.07, 0.03])
            
        unit_price = round(base_price, 2)
        sales = round(unit_price * quantity * (1.0 - discount), 2)
        
        # Profit Calculation
        target_base_margin = sub_cat_meta["margin"]
        
        # Real cost of goods sold (COGS)
        cogs = unit_price * quantity * (1.0 - target_base_margin)
        
        # Profit = Sales - COGS - overhead/shipping
        # Discount directly erodes top-line while COGS remains fixed -> steep loss at high discounts
        profit = round(sales - cogs, 2)
        
        # In case of negative profit for heavy discounts
        if discount >= 0.5 and sub_cat in ["Tables", "Bookcases", "Machines", "Binders"]:
            profit = min(profit, -round(sales * np.random.uniform(0.15, 0.65), 2))
            
        product_name = f"{sub_cat} Item Model {np.random.randint(100, 999)}-{chr(65 + np.random.randint(0, 26))}"
        
        rows.append({
            "Order ID": order_id,
            "Order Date": order_date.strftime("%Y-%m-%d"),
            "Customer": customer,
            "Segment": segment,
            "Region": region,
            "State": state,
            "City": city,
            "Category": category,
            "Sub-Category": sub_cat,
            "Product": product_name,
            "Sales": sales,
            "Quantity": int(quantity),
            "Discount": round(discount, 2),
            "Profit": profit
        })
        
    df = pd.DataFrame(rows)
    df.sort_values(by="Order Date", inplace=True)
    df.to_csv(output_path, index=False)
    print(f"Generated dataset with {len(df)} rows at {output_path}")
    print(f"Total Sales: ${df['Sales'].sum():,.2f} | Total Profit: ${df['Profit'].sum():,.2f} | Overall Margin: {df['Profit'].sum()/df['Sales'].sum()*100:.2f}%")

if __name__ == "__main__":
    generate_kaggle_superstore_dataset("d:/performa.io/backend/data/sample_retail_data.csv")
