import {
  FilterParams,
  FilterOptions,
  KpiSummary,
  TrendResponse,
  BreakdownResponse,
  AlertItem,
  DiagnosticResult,
  OpportunityResponse,
  ExecutiveReport,
  DatasetStatus,
} from '../types';

// Default static demo dataset aggregated data for client-side fallback
export const clientDemoData = {
  status: {
    filename: 'sample_retail_data.csv',
    is_default: true,
    total_rows: 9994,
    date_min: '2023-01-01',
    date_max: '2024-12-31',
    total_revenue: 8246373.65,
    total_profit: 878240.61,
    overall_margin: 0.1065,
    columns_mapped: {
      order_id: 'Order ID',
      order_date: 'Order Date',
      customer: 'Customer',
      segment: 'Segment',
      region: 'Region',
      state: 'State',
      city: 'City',
      category: 'Category',
      sub_category: 'Sub-Category',
      product: 'Product',
      sales: 'Sales',
      quantity: 'Quantity',
      discount: 'Discount',
      profit: 'Profit',
    },
    quality_score: 98.5,
  } as DatasetStatus,

  filterOptions: {
    min_date: '2023-01-01',
    max_date: '2024-12-31',
    regions: ['Central', 'East', 'South', 'West'],
    categories: ['Furniture', 'Office Supplies', 'Technology'],
    segments: ['Consumer', 'Corporate', 'Home Office'],
    states: [
      'Arizona', 'California', 'Colorado', 'Florida', 'Georgia',
      'Illinois', 'Indiana', 'Massachusetts', 'Michigan', 'New Jersey',
      'New York', 'North Carolina', 'Ohio', 'Oregon', 'Pennsylvania',
      'Tennessee', 'Texas', 'Virginia', 'Washington', 'Wisconsin'
    ],
    sub_categories: [
      'Accessories', 'Appliances', 'Art', 'Binders', 'Bookcases',
      'Chairs', 'Copiers', 'Envelopes', 'Fasteners', 'Furnishings',
      'Labels', 'Machines', 'Paper', 'Phones', 'Storage', 'Supplies', 'Tables'
    ],
  } as FilterOptions,
};

export const clientAnalytics = {
  getKpis: (_params?: FilterParams): KpiSummary => {
    return {
      revenue: 8246373.65,
      profit: 878240.61,
      profit_margin: 0.1065,
      orders: 4892,
      units: 27814,
      aov: 1685.68,
      avg_discount: 0.1582,
      rev_per_unit: 296.48,
      revenue_growth_pct: 4.8,
      profit_growth_pct: 7.2,
      margin_gap_pp: 0.24,
      orders_growth_pct: 3.1,
      sample_size: 9994,
    };
  },

  getTrends: (_params?: FilterParams, granularity: 'month' | 'quarter' = 'month'): TrendResponse => {
    if (granularity === 'quarter') {
      return {
        granularity: 'quarter',
        trends: [
          { period: '2023Q1', revenue: 910450.0, profit: 89200.0, profit_margin: 0.098, orders: 580, aov: 1569.74, avg_discount: 0.16 },
          { period: '2023Q2', revenue: 965200.0, profit: 104500.0, profit_margin: 0.108, orders: 610, aov: 1582.30, avg_discount: 0.15 },
          { period: '2023Q3', revenue: 1020400.0, profit: 111300.0, profit_margin: 0.109, orders: 645, aov: 1582.02, avg_discount: 0.16 },
          { period: '2023Q4', revenue: 1140600.0, profit: 122400.0, profit_margin: 0.107, orders: 710, aov: 1606.48, avg_discount: 0.16 },
          { period: '2024Q1', revenue: 945000.0, profit: 98700.0, profit_margin: 0.104, orders: 595, aov: 1588.24, avg_discount: 0.15 },
          { period: '2024Q2', revenue: 1015000.0, profit: 112000.0, profit_margin: 0.110, orders: 635, aov: 1598.43, avg_discount: 0.15 },
          { period: '2024Q3', revenue: 1080000.0, profit: 118500.0, profit_margin: 0.110, orders: 670, aov: 1611.94, avg_discount: 0.16 },
          { period: '2024Q4', revenue: 1169723.65, profit: 121640.61, profit_margin: 0.104, orders: 730, aov: 1602.36, avg_discount: 0.16 },
        ],
      };
    }

    // Default Monthly
    const months = [
      '2023-01', '2023-02', '2023-03', '2023-04', '2023-05', '2023-06',
      '2023-07', '2023-08', '2023-09', '2023-10', '2023-11', '2023-12',
      '2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06',
      '2024-07', '2024-08', '2024-09', '2024-10', '2024-11', '2024-12',
    ];

    return {
      granularity: 'month',
      trends: months.map((m, i) => {
        const baseRev = 310000 + (i * 4500) + ((i % 12 > 9) ? 65000 : 0);
        const margin = 0.095 + (i * 0.0008) + ((i % 4 === 0) ? 0.012 : 0);
        const profit = baseRev * margin;
        const orders = Math.round(baseRev / 1600);
        return {
          period: m,
          revenue: Math.round(baseRev),
          profit: Math.round(profit),
          profit_margin: Number(margin.toFixed(4)),
          orders,
          aov: Number((baseRev / orders).toFixed(2)),
          avg_discount: 0.155 + ((i % 3) * 0.005),
        };
      }),
    };
  },

  getBreakdown: (dimension: string): BreakdownResponse => {
    if (dimension === 'category') {
      return {
        dimension: 'category',
        items: [
          { dimension: 'category', name: 'Technology', revenue: 3584120.50, profit: 548230.10, profit_margin: 0.1530, orders: 1840, units: 6850, aov: 1947.89, avg_discount: 0.132, revenue_share_pct: 43.46, profit_share_pct: 62.42, status: 'strong' },
          { dimension: 'category', name: 'Office Supplies', revenue: 2654310.20, profit: 345120.40, profit_margin: 0.1300, orders: 2450, units: 14200, aov: 1083.39, avg_discount: 0.158, revenue_share_pct: 32.19, profit_share_pct: 39.30, status: 'strong' },
          { dimension: 'category', name: 'Furniture', revenue: 2007942.95, profit: -15109.89, profit_margin: -0.0075, orders: 1620, units: 6764, aov: 1239.47, avg_discount: 0.201, revenue_share_pct: 24.35, profit_share_pct: -1.72, status: 'critical' },
        ],
      };
    }

    if (dimension === 'region') {
      return {
        dimension: 'region',
        items: [
          { dimension: 'region', name: 'West', revenue: 2634890.10, profit: 342150.20, profit_margin: 0.1299, orders: 1540, units: 8850, aov: 1710.97, avg_discount: 0.141, revenue_share_pct: 31.95, profit_share_pct: 38.96, status: 'strong' },
          { dimension: 'region', name: 'East', revenue: 2548200.40, profit: 312450.80, profit_margin: 0.1226, orders: 1490, units: 8610, aov: 1710.20, avg_discount: 0.148, revenue_share_pct: 30.90, profit_share_pct: 35.58, status: 'strong' },
          { dimension: 'region', name: 'Central', revenue: 1895640.30, profit: 98450.10, profit_margin: 0.0519, orders: 1140, units: 6420, aov: 1662.84, avg_discount: 0.198, revenue_share_pct: 22.99, profit_share_pct: 11.21, status: 'underperforming' },
          { dimension: 'region', name: 'South', revenue: 1167642.85, profit: 125189.51, profit_margin: 0.1072, orders: 720, units: 3934, aov: 1621.73, avg_discount: 0.155, revenue_share_pct: 14.16, profit_share_pct: 14.25, status: 'watch' },
        ],
      };
    }

    // Default Sub-category
    return {
      dimension: 'sub_category',
      items: [
        { dimension: 'sub_category', name: 'Phones', revenue: 1420500.0, profit: 245100.0, profit_margin: 0.1725, orders: 880, units: 3200, aov: 1614.2, avg_discount: 0.12, revenue_share_pct: 17.23, profit_share_pct: 27.91, cumulative_revenue_pct: 17.23, status: 'strong' },
        { dimension: 'sub_category', name: 'Chairs', revenue: 1180200.0, profit: 142100.0, profit_margin: 0.1204, orders: 750, units: 2950, aov: 1573.6, avg_discount: 0.15, revenue_share_pct: 14.31, profit_share_pct: 16.18, cumulative_revenue_pct: 31.54, status: 'strong' },
        { dimension: 'sub_category', name: 'Storage', revenue: 890400.0, profit: 124500.0, profit_margin: 0.1398, orders: 620, units: 2450, aov: 1436.1, avg_discount: 0.14, revenue_share_pct: 10.80, profit_share_pct: 14.18, cumulative_revenue_pct: 42.34, status: 'strong' },
        { dimension: 'sub_category', name: 'Tables', revenue: 645200.0, profit: -68400.0, profit_margin: -0.1060, orders: 490, units: 1850, aov: 1316.7, avg_discount: 0.28, revenue_share_pct: 7.82, profit_share_pct: -7.79, cumulative_revenue_pct: 50.16, status: 'critical' },
        { dimension: 'sub_category', name: 'Binders', revenue: 610800.0, profit: 115200.0, profit_margin: 0.1886, orders: 580, units: 3800, aov: 1053.1, avg_discount: 0.22, revenue_share_pct: 7.41, profit_share_pct: 13.12, cumulative_revenue_pct: 57.57, status: 'strong' },
        { dimension: 'sub_category', name: 'Machines', revenue: 580400.0, profit: 32100.0, profit_margin: 0.0553, orders: 320, units: 820, aov: 1813.75, avg_discount: 0.24, revenue_share_pct: 7.04, profit_share_pct: 3.65, cumulative_revenue_pct: 64.61, status: 'underperforming' },
        { dimension: 'sub_category', name: 'Accessories', revenue: 560200.0, profit: 148900.0, profit_margin: 0.2658, orders: 480, units: 2100, aov: 1167.08, avg_discount: 0.11, revenue_share_pct: 6.79, profit_share_pct: 16.95, cumulative_revenue_pct: 71.40, status: 'strong' },
        { dimension: 'sub_category', name: 'Copiers', revenue: 540800.0, profit: 189200.0, profit_margin: 0.3498, orders: 240, units: 480, aov: 2253.33, avg_discount: 0.08, revenue_share_pct: 6.56, profit_share_pct: 21.54, cumulative_revenue_pct: 77.96, status: 'strong' },
        { dimension: 'sub_category', name: 'Bookcases', revenue: 420500.0, profit: 12400.0, profit_margin: 0.0295, orders: 310, units: 1200, aov: 1356.45, avg_discount: 0.21, revenue_share_pct: 5.10, profit_share_pct: 1.41, cumulative_revenue_pct: 83.06, status: 'underperforming' },
        { dimension: 'sub_category', name: 'Appliances', revenue: 390100.0, profit: 68400.0, profit_margin: 0.1753, orders: 310, units: 1350, aov: 1258.39, avg_discount: 0.13, revenue_share_pct: 4.73, profit_share_pct: 7.79, cumulative_revenue_pct: 87.79, status: 'strong' },
        { dimension: 'sub_category', name: 'Paper', revenue: 360400.0, profit: 124800.0, profit_margin: 0.3463, orders: 490, units: 2800, aov: 735.51, avg_discount: 0.09, revenue_share_pct: 4.37, profit_share_pct: 14.21, cumulative_revenue_pct: 92.16, status: 'strong' },
        { dimension: 'sub_category', name: 'Furnishings', revenue: 280200.0, profit: 45200.0, profit_margin: 0.1613, orders: 360, units: 1950, aov: 778.33, avg_discount: 0.14, revenue_share_pct: 3.40, profit_share_pct: 5.15, cumulative_revenue_pct: 95.56, status: 'strong' },
        { dimension: 'sub_category', name: 'Art', revenue: 190300.0, profit: 42100.0, profit_margin: 0.2212, orders: 340, units: 1600, aov: 559.71, avg_discount: 0.12, revenue_share_pct: 2.31, profit_share_pct: 4.79, cumulative_revenue_pct: 97.87, status: 'strong' },
        { dimension: 'sub_category', name: 'Envelopes', revenue: 98200.0, profit: 28400.0, profit_margin: 0.2892, orders: 190, units: 880, aov: 516.84, avg_discount: 0.10, revenue_share_pct: 1.19, profit_share_pct: 3.23, cumulative_revenue_pct: 99.06, status: 'strong' },
        { dimension: 'sub_category', name: 'Labels', revenue: 45200.0, profit: 16400.0, profit_margin: 0.3628, orders: 140, units: 720, aov: 322.86, avg_discount: 0.08, revenue_share_pct: 0.55, profit_share_pct: 1.87, cumulative_revenue_pct: 99.61, status: 'strong' },
        { dimension: 'sub_category', name: 'Supplies', revenue: 22100.0, profit: 1800.0, profit_margin: 0.0814, orders: 75, units: 280, aov: 294.67, avg_discount: 0.18, revenue_share_pct: 0.27, profit_share_pct: 0.20, cumulative_revenue_pct: 99.88, status: 'watch' },
        { dimension: 'sub_category', name: 'Fasteners', revenue: 9800.0, profit: 2600.0, profit_margin: 0.2653, orders: 60, units: 210, aov: 163.33, avg_discount: 0.10, revenue_share_pct: 0.12, profit_share_pct: 0.30, cumulative_revenue_pct: 100.0, status: 'strong' },
      ],
    };
  },

  getAlerts: (): AlertItem[] => {
    return [
      {
        id: 'alert-tables',
        title: 'Critical Margin Deficit in Tables',
        severity: 'critical',
        message: 'Tables is operating at a net loss (-$68,400 deficit) with an average discount rate of 28.0%. Immediate discount threshold review required.',
        metric: 'Margin / Profit Deficit',
        value: '-$68,400 (-10.6%)',
        entity_name: 'Tables',
        entity_type: 'sub_category',
      },
      {
        id: 'alert-central',
        title: 'Sub-Benchmark Profit Margin in Central Region',
        severity: 'warning',
        message: 'Central region delivers 5.2% profit margin, trailing portfolio benchmark of 10.7% by 5.5 percentage points.',
        metric: 'Margin Gap',
        value: '-5.5 pp',
        entity_name: 'Central',
        entity_type: 'region',
      },
      {
        id: 'alert-tech',
        title: 'High Margin Driver: Technology',
        severity: 'positive',
        message: 'Technology generates superior return at 15.3% margin, driving $548,230 in net profit (62.4% of total profit).',
        metric: 'Profit Contribution',
        value: '$548,230 (15.3% margin)',
        entity_name: 'Technology',
        entity_type: 'category',
      },
    ];
  },

  getDiagnostics: (dimension: string, entityName: string): DiagnosticResult => {
    const isTables = entityName.toLowerCase() === 'tables';
    const isCentral = entityName.toLowerCase() === 'central';

    if (isTables) {
      return {
        dimension: 'sub_category',
        entity_name: 'Tables',
        status: 'critical',
        severity: 'Critical',
        primary_driver: 'Severe Margin Deficit / Value Destruction',
        confidence: 'High',
        sample_size: 490,
        peer_sample_size: 9504,
        summary: 'Tables is generating direct operating losses totaling -$68,400 with chronic discount leakage averaging 28.0%. Immediate intervention required.',
        evidence: [
          'Operating at net negative profit of -$68,400 (-10.6% profit margin).',
          'Excessive discount rate of 28.0% (+12.8 pp higher than peer benchmark of 15.2%).',
          'Unit revenue fails to cover base supplier COGS under current promotional markdown structures.',
        ],
        recommended_action: 'Immediately impose strict discount caps at 15% on Tables and conduct SKU-level floor pricing audit.',
        metrics_comparison: [
          { metric: 'profit_margin', label: 'Profit Margin', entity_value: -10.6, peer_value: 12.4, gap: -23.0, gap_pct: -185.5, unit: '%', is_favorable: false },
          { metric: 'revenue', label: 'Total Revenue', entity_value: 645200.0, peer_value: 475073.0, gap: 170127.0, gap_pct: 35.8, unit: '$', is_favorable: true },
          { metric: 'profit', label: 'Net Profit', entity_value: -68400.0, peer_value: 59165.0, gap: -127565.0, gap_pct: -215.6, unit: '$', is_favorable: false },
          { metric: 'avg_discount', label: 'Average Discount Rate', entity_value: 28.0, peer_value: 15.2, gap: 12.8, gap_pct: 84.2, unit: '%', is_favorable: false },
          { metric: 'aov', label: 'Average Order Value (AOV)', entity_value: 1316.7, peer_value: 1708.2, gap: -391.5, gap_pct: -22.9, unit: '$', is_favorable: false },
          { metric: 'orders', label: 'Total Orders', entity_value: 490.0, peer_value: 275.0, gap: 215.0, gap_pct: 78.2, unit: 'orders', is_favorable: true },
        ],
      };
    }

    if (isCentral) {
      return {
        dimension: 'region',
        entity_name: 'Central',
        status: 'underperforming',
        severity: 'High',
        primary_driver: 'Discount Leakage',
        confidence: 'High',
        sample_size: 1140,
        peer_sample_size: 8854,
        summary: 'Central territory margin is compressed at 5.2% vs peer territory benchmark of 12.3% due to elevated regional discount authorizations.',
        evidence: [
          'Profit margin is compressed at 5.2% (trailing peer benchmark of 12.3% by 7.1 pp).',
          'Average discount rate of 19.8% exceeds peer benchmark (14.6%) by 5.2 percentage points.',
          'Elevated discount volume is concentrated in Illinois and Texas commercial accounts.',
        ],
        recommended_action: 'Enforce standard pricing rules and eliminate outlier discount exceptions in Central region.',
        metrics_comparison: [
          { metric: 'profit_margin', label: 'Profit Margin', entity_value: 5.2, peer_value: 12.3, gap: -7.1, gap_pct: -57.7, unit: '%', is_favorable: false },
          { metric: 'revenue', label: 'Total Revenue', entity_value: 1895640.3, peer_value: 2116911.1, gap: -221270.8, gap_pct: -10.5, unit: '$', is_favorable: false },
          { metric: 'profit', label: 'Net Profit', entity_value: 98450.1, peer_value: 259930.2, gap: -161480.1, gap_pct: -62.1, unit: '$', is_favorable: false },
          { metric: 'avg_discount', label: 'Average Discount Rate', entity_value: 19.8, peer_value: 14.6, gap: 5.2, gap_pct: 35.6, unit: '%', is_favorable: false },
          { metric: 'aov', label: 'Average Order Value (AOV)', entity_value: 1662.8, peer_value: 1693.2, gap: -30.4, gap_pct: -1.8, unit: '$', is_favorable: false },
          { metric: 'orders', label: 'Total Orders', entity_value: 1140.0, peer_value: 1250.0, gap: -110.0, gap_pct: -8.8, unit: 'orders', is_favorable: false },
        ],
      };
    }

    // Default Generic Diagnosis
    return {
      dimension,
      entity_name: entityName,
      status: 'strong',
      severity: 'None',
      primary_driver: 'High-Efficiency Market Leadership',
      confidence: 'High',
      sample_size: 1840,
      peer_sample_size: 8154,
      summary: `${entityName} is delivering strong positive returns with stable margin realization and disciplined discounting.`,
      evidence: [
        'Outperforming peer benchmark in profit margin and order conversion.',
        'Maintains healthy discount governance below portfolio average.',
      ],
      recommended_action: `Protect market share, replicate operational practices across weaker units, and explore selective capacity expansion in ${entityName}.`,
      metrics_comparison: [
        { metric: 'profit_margin', label: 'Profit Margin', entity_value: 15.3, peer_value: 10.2, gap: 5.1, gap_pct: 50.0, unit: '%', is_favorable: true },
        { metric: 'revenue', label: 'Total Revenue', entity_value: 3584120.5, peer_value: 2331126.6, gap: 1252993.9, gap_pct: 53.8, unit: '$', is_favorable: true },
        { metric: 'profit', label: 'Net Profit', entity_value: 548230.1, peer_value: 237805.2, gap: 310424.9, gap_pct: 130.5, unit: '$', is_favorable: true },
        { metric: 'avg_discount', label: 'Average Discount Rate', entity_value: 13.2, peer_value: 16.8, gap: -3.6, gap_pct: -21.4, unit: '%', is_favorable: true },
        { metric: 'aov', label: 'Average Order Value (AOV)', entity_value: 1947.9, peer_value: 1540.2, gap: 407.7, gap_pct: 26.5, unit: '$', is_favorable: true },
        { metric: 'orders', label: 'Total Orders', entity_value: 1840.0, peer_value: 1526.0, gap: 314.0, gap_pct: 20.6, unit: 'orders', is_favorable: true },
      ],
    };
  },

  getOpportunities: (): OpportunityResponse => {
    return {
      total_opportunities: 5,
      high_priority_count: 3,
      estimated_total_exposure: 314800.0,
      opportunities: [
        {
          id: 'opp-tables',
          dimension: 'sub_category',
          entity_name: 'Tables',
          title: 'Eliminate Net Operating Losses in Tables',
          problem: 'Tables is eroding $68,400 in bottom-line profit with an average discount of 28.0%.',
          primary_driver: 'Severe Margin Deficit / Value Destruction',
          opportunity_type: 'Margin Recovery',
          business_impact_score: 92.0,
          performance_gap_score: 95.0,
          feasibility_score: 85.0,
          urgency_score: 95.0,
          composite_score: 91.8,
          priority: 'High',
          estimated_annual_exposure: 120016.0,
          evidence: [
            'Operating at net negative profit of -$68,400 (-10.6% margin).',
            'Excessive discount rate of 28.0% (+12.8 pp higher than peer benchmark).',
          ],
          recommended_action: 'Cap maximum discount at 15% and establish minimum gross margin floor on all Tables SKUs.',
          implementation_steps: [
            'Conduct immediate SKU-level profitability audit for all Tables items.',
            'Remove authorized discretionary discounts exceeding 15% from sales reps.',
            'Renegotiate wholesale acquisition costs with manufacturers or discontinue negative-margin SKUs.',
          ],
          confidence: 'High',
        },
        {
          id: 'opp-central',
          dimension: 'region',
          entity_name: 'Central',
          title: 'Regional Margin Turnaround: Central Territory',
          problem: 'Central region delivers 5.2% margin vs 10.7% portfolio average, resulting in a $103,450 profit gap.',
          primary_driver: 'Discount Leakage',
          opportunity_type: 'Regional Turnaround',
          business_impact_score: 84.0,
          performance_gap_score: 78.0,
          feasibility_score: 75.0,
          urgency_score: 85.0,
          composite_score: 80.5,
          priority: 'High',
          estimated_annual_exposure: 103450.0,
          evidence: [
            'Central region profit margin is compressed at 5.2% (trailing portfolio by 5.5 pp).',
            'Average discount rate of 19.8% exceeds peer average by 5.2 pp.',
          ],
          recommended_action: 'Enforce standard pricing rules and eliminate outlier discount exceptions in Central region.',
          implementation_steps: [
            'Audit top 10 underperforming accounts in Central territory.',
            'Standardize regional freight and handling pass-through charges.',
            'Align regional sales leadership compensation with gross profit dollars rather than gross revenue.',
          ],
          confidence: 'High',
        },
        {
          id: 'opp-machines',
          dimension: 'sub_category',
          entity_name: 'Machines',
          title: 'Plug Discount Leakage in Machines',
          problem: 'Excess promotional discounting (24.0%) is compressing gross margin (5.5% vs 10.7% avg).',
          primary_driver: 'Discount Leakage',
          opportunity_type: 'Discount Governance',
          business_impact_score: 65.0,
          performance_gap_score: 62.0,
          feasibility_score: 90.0,
          urgency_score: 80.0,
          composite_score: 70.6,
          priority: 'High',
          estimated_annual_exposure: 42500.0,
          evidence: [
            'High capital hardware item with high discount sensitivity.',
            'Discount rate averaging 24.0% leads to 5.5% net margin.',
          ],
          recommended_action: 'Calibrate discount thresholds and link promotional pricing to multi-year service contracts.',
          implementation_steps: [
            'Require mandatory warranty attach rate on all discounted Machine deals.',
            'Establish VP sales sign-off on Machine discounts > 18%.',
            'Track realized transaction margin weekly by sales rep.',
          ],
          confidence: 'High',
        },
        {
          id: 'opp-bookcases',
          dimension: 'sub_category',
          entity_name: 'Bookcases',
          title: 'Optimize Assortment and Pricing for Bookcases',
          problem: 'Margin performance (3.0%) trails potential by 7.7 percentage points.',
          primary_driver: 'Unfavorable Product Mix',
          opportunity_type: 'Assortment Optimization',
          business_impact_score: 52.0,
          performance_gap_score: 58.0,
          feasibility_score: 75.0,
          urgency_score: 50.0,
          composite_score: 58.2,
          priority: 'Medium',
          estimated_annual_exposure: 28400.0,
          evidence: [
            'Low margin realization on bulky wood veneer SKUs.',
            'High shipping cost absorption eroding unit margins.',
          ],
          recommended_action: 'Rationalize low-velocity SKUs and adjust list pricing on Bookcases.',
          implementation_steps: [
            'Identify the bottom 20% lowest margin SKUs within Bookcases.',
            'Adjust baseline list prices upward by 4% on inelastic products.',
            'Re-evaluate packaging dimensions to lower logistics freight costs.',
          ],
          confidence: 'Medium',
        },
        {
          id: 'opp-paper',
          dimension: 'sub_category',
          entity_name: 'Paper',
          title: 'Scale High-Margin Demand for Paper',
          problem: 'Paper achieves 34.6% margin, but order volume is under-penetrated in Corporate accounts.',
          primary_driver: 'Demand Acceleration',
          opportunity_type: 'Demand Acceleration',
          business_impact_score: 48.0,
          performance_gap_score: 65.0,
          feasibility_score: 70.0,
          urgency_score: 60.0,
          composite_score: 58.7,
          priority: 'Medium',
          estimated_annual_exposure: 20434.0,
          evidence: [
            'Exceptional profitability (34.6% margin) with minimal discount friction.',
            'High re-order frequency potential.',
          ],
          recommended_action: 'Increase catalog prominence and bundle Paper with high-traffic Technology categories.',
          implementation_steps: [
            'Feature Paper auto-replenishment subscriptions for Corporate clients.',
            'Incentivize commercial sales reps on paper bundle attach rates.',
          ],
          confidence: 'Medium',
        },
      ],
    };
  },

  getReport: (): ExecutiveReport => {
    return {
      title: 'Performa.io — Executive Performance Briefing',
      generated_at: 'September 1, 2026 at 13:30 UTC',
      filter_summary: 'Full Dataset (All Regions, Categories, and Segments)',
      executive_summary: 'During the analyzed period, the business achieved total revenue of $8,246,373.65 generating $878,240.61 in operating profit across 4,892 distinct orders, yielding an overall profit margin of 10.7%. While top-line demand remains resilient with an Average Order Value of $1,685.68, profitability is constrained by discount leakage and category mix imbalances, with an estimated $314,800.00 in quantifiable margin recovery opportunity identified.',
      kpis: {
        revenue: 8246373.65,
        profit: 878240.61,
        profit_margin: 0.1065,
        orders: 4892,
        units: 27814,
        aov: 1685.68,
        avg_discount: 0.1582,
        rev_per_unit: 296.48,
        revenue_growth_pct: 4.8,
        profit_growth_pct: 7.2,
        margin_gap_pp: 0.24,
        orders_growth_pct: 3.1,
        sample_size: 9994,
      },
      key_findings: [
        'Core portfolio margin stands at 10.7%, supported by $296.48 revenue realized per unit sold.',
        'Identified 3 critical high-priority performance interventions totaling $314,800.00 in profit exposure.',
        'Revenue volume is led by Technology ($3,584,121 | 43.5% share), while highest margin efficiency is delivered by Technology (15.3% margin) and Office Supplies (13.0% margin).',
      ],
      major_gaps: [
        {
          entity: 'Tables',
          dimension: 'Sub-Category',
          issue: 'Net operating loss of -$68,400 (-10.6% margin)',
          primary_driver: 'Excess Discounting / Cost Exceeding Net Price',
          severity: 'Critical',
        },
        {
          entity: 'Central',
          dimension: 'Region',
          issue: 'Margin compression at 5.2% (trailing portfolio by 5.5 pp)',
          primary_driver: 'Discount Leakage / Territory Pricing Exceptions',
          severity: 'High',
        },
      ],
      driver_analysis: [
        {
          driver: 'Severe Margin Deficit / Value Destruction',
          affected_entities_count: 1,
          description: 'Identified as the root performance inhibitor across Tables sub-category.',
        },
        {
          driver: 'Discount Leakage',
          affected_entities_count: 2,
          description: 'Identified as the root performance inhibitor across Central region and Machines.',
        },
      ],
      top_opportunities: [
        {
          id: 'opp-tables',
          dimension: 'sub_category',
          entity_name: 'Tables',
          title: 'Eliminate Net Operating Losses in Tables',
          problem: 'Tables is eroding $68,400 in bottom-line profit with an average discount of 28.0%.',
          primary_driver: 'Severe Margin Deficit / Value Destruction',
          opportunity_type: 'Margin Recovery',
          business_impact_score: 92.0,
          performance_gap_score: 95.0,
          feasibility_score: 85.0,
          urgency_score: 95.0,
          composite_score: 91.8,
          priority: 'High',
          estimated_annual_exposure: 120016.0,
          evidence: ['Operating at net negative profit of -$68,400.'],
          recommended_action: 'Cap maximum discount at 15% and establish minimum gross margin floor on all Tables SKUs.',
          implementation_steps: ['Conduct immediate SKU-level profitability audit.'],
          confidence: 'High',
        },
        {
          id: 'opp-central',
          dimension: 'region',
          entity_name: 'Central',
          title: 'Regional Margin Turnaround: Central Territory',
          problem: 'Central region delivers 5.2% margin vs 10.7% portfolio average.',
          primary_driver: 'Discount Leakage',
          opportunity_type: 'Regional Turnaround',
          business_impact_score: 84.0,
          performance_gap_score: 78.0,
          feasibility_score: 75.0,
          urgency_score: 85.0,
          composite_score: 80.5,
          priority: 'High',
          estimated_annual_exposure: 103450.0,
          evidence: ['Central territory margin is compressed at 5.2%.'],
          recommended_action: 'Enforce standard pricing rules and eliminate outlier discount exceptions in Central region.',
          implementation_steps: ['Audit top 10 underperforming accounts in Central territory.'],
          confidence: 'High',
        },
      ],
      action_plan: [
        {
          phase: 'Priority 1',
          target: 'Tables (Sub Category)',
          opportunity_type: 'Margin Recovery',
          recommended_action: 'Cap maximum discount at 15% and establish minimum gross margin floor on all Tables SKUs.',
          key_steps: [
            'Conduct immediate SKU-level profitability audit.',
            'Remove authorized discretionary discounts exceeding 15%.',
          ],
          financial_impact: '$120,016.00',
        },
        {
          phase: 'Priority 2',
          target: 'Central (Region)',
          opportunity_type: 'Regional Turnaround',
          recommended_action: 'Enforce standard pricing rules and eliminate outlier discount exceptions in Central region.',
          key_steps: [
            'Audit top 10 underperforming accounts.',
            'Align sales compensation with gross profit dollars.',
          ],
          financial_impact: '$103,450.00',
        },
      ],
    };
  },
};
