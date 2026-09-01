import React, { useState, useEffect } from 'react';
import { useFilter } from '../context/FilterContext';
import { api } from '../lib/api';
import {
  KpiSummary,
  TrendResponse,
  BreakdownResponse,
  AlertItem,
} from '../types';
import { KpiCard } from '../components/common/KpiCard';
import { AlertCard } from '../components/common/AlertCard';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { PageTab } from '../components/layout/Sidebar';
import {
  DollarSign,
  Percent,
  ShoppingCart,
  Layers,
  Sparkles,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';

interface OverviewPageProps {
  onNavigate: (tab: PageTab, state?: any) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ onNavigate }) => {
  const { filters, resetFilters } = useFilter();
  const [kpis, setKpis] = useState<KpiSummary | null>(null);
  const [trends, setTrends] = useState<TrendResponse | null>(null);
  const [regionBreakdown, setRegionBreakdown] = useState<BreakdownResponse | null>(null);
  const [catBreakdown, setCatBreakdown] = useState<BreakdownResponse | null>(null);
  const [subCatBreakdown, setSubCatBreakdown] = useState<BreakdownResponse | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [granularity, setGranularity] = useState<'month' | 'quarter'>('month');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadOverviewData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [kpiRes, trendRes, regRes, catRes, subRes, alertRes] = await Promise.all([
        api.getKpis(filters),
        api.getTrends(filters, granularity),
        api.getBreakdown('region', filters),
        api.getBreakdown('category', filters),
        api.getBreakdown('sub_category', filters),
        api.getAlerts(filters),
      ]);

      setKpis(kpiRes);
      setTrends(trendRes);
      setRegionBreakdown(regRes);
      setCatBreakdown(catRes);
      setSubCatBreakdown(subRes);
      setAlerts(alertRes);
    } catch (err: any) {
      setError(err.message || 'Failed to load overview data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOverviewData();
  }, [filters, granularity]);

  if (isLoading) {
    return <LoadingState message="Aggregating financial metrics & transaction trends..." />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={loadOverviewData} />;
  }

  if (!kpis || kpis.sample_size === 0) {
    return <EmptyState onResetFilters={resetFilters} />;
  }

  const handleAlertEntityClick = (entityType: string, entityName: string) => {
    onNavigate('diagnose', { dimension: entityType, entityName });
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* 1. Core KPIs Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <KpiCard
          title="Total Revenue"
          value={`$${kpis.revenue >= 1000000 ? (kpis.revenue / 1000000).toFixed(2) + 'M' : kpis.revenue.toLocaleString()}`}
          change={kpis.revenue_growth_pct}
          subtitle={`$${kpis.rev_per_unit.toFixed(2)}/unit`}
          icon={<DollarSign className="w-4 h-4 text-emerald-400" />}
        />
        <KpiCard
          title="Net Profit"
          value={`$${kpis.profit >= 1000000 ? (kpis.profit / 1000000).toFixed(2) + 'M' : kpis.profit.toLocaleString()}`}
          change={kpis.profit_growth_pct}
          isFavorable={kpis.profit > 0}
          icon={<TrendingUp className="w-4 h-4 text-sky-400" />}
        />
        <KpiCard
          title="Profit Margin"
          value={`${(kpis.profit_margin * 100).toFixed(1)}%`}
          change={kpis.margin_gap_pp}
          changeLabel="margin delta"
          isFavorable={kpis.profit_margin > 0.08}
          icon={<Percent className="w-4 h-4 text-indigo-400" />}
        />
        <KpiCard
          title="Orders"
          value={kpis.orders.toLocaleString()}
          change={kpis.orders_growth_pct}
          subtitle={`${kpis.sample_size.toLocaleString()} lines`}
          icon={<ShoppingCart className="w-4 h-4 text-purple-400" />}
        />
        <KpiCard
          title="Units Sold"
          value={kpis.units.toLocaleString()}
          subtitle="Volume throughput"
          icon={<Layers className="w-4 h-4 text-amber-400" />}
        />
        <KpiCard
          title="Avg Order Value"
          value={`$${kpis.aov.toFixed(0)}`}
          subtitle="Basket size"
          icon={<Sparkles className="w-4 h-4 text-teal-400" />}
        />
        <KpiCard
          title="Avg Discount"
          value={`${(kpis.avg_discount * 100).toFixed(1)}%`}
          isFavorable={kpis.avg_discount < 0.15}
          subtitle="Rate realization"
          icon={<Percent className="w-4 h-4 text-rose-400" />}
        />
      </div>

      {/* 2. Automated Diagnostic Alerts Banner */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <span>Automated Performance Alerts</span>
              <span className="bg-slate-800 text-slate-300 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                {alerts.length}
              </span>
            </h3>
            <button
              onClick={() => onNavigate('diagnose')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>View Deep-Dive Diagnostics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {alerts.slice(0, 3).map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onSelectEntity={handleAlertEntityClick}
              />
            ))}
          </div>
        </div>
      )}

      {/* 3. Trend & Temporal Performance Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Financial Trend & Margin Trajectory
            </h3>
            <p className="text-xs text-slate-400">
              Monthly revenue, operating profit, and profit margin evolution
            </p>
          </div>
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setGranularity('month')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                granularity === 'month'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setGranularity('quarter')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                granularity === 'quarter'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Quarterly
            </button>
          </div>
        </div>

        {trends && trends.trends.length > 0 ? (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={trends.trends}
                margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="period"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="left"
                  stroke="#64748b"
                  fontSize={11}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#10b981"
                  fontSize={11}
                  tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value: any, name: string) => {
                    if (name === 'Profit Margin') return [`${(Number(value) * 100).toFixed(1)}%`, name];
                    return [`$${Number(value).toLocaleString()}`, name];
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                />
                <Bar
                  yAxisId="left"
                  dataKey="revenue"
                  name="Revenue"
                  fill="#334155"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  yAxisId="left"
                  dataKey="profit"
                  name="Profit"
                  fill="#0284c7"
                  radius={[4, 4, 0, 0]}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="profit_margin"
                  name="Profit Margin"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#10b981' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState title="No Trend Data" message="Adjust filters to display trend data." />
        )}
      </div>

      {/* 4. Multi-Dimension Comparisons (Region, Category, Sub-Category Matrix) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Performance */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Category Margin & Revenue Share
              </h3>
              <p className="text-xs text-slate-400">
                Top-line volume vs bottom-line margin realization
              </p>
            </div>
            <button
              onClick={() => onNavigate('explore')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>Explore All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {catBreakdown?.items.map((cat) => (
              <div
                key={cat.name}
                onClick={() => onNavigate('diagnose', { dimension: 'category', entityName: cat.name })}
                className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg hover:border-slate-700 cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="font-bold text-white flex items-center gap-2">
                    <span>{cat.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                        cat.profit_margin < 0.05
                          ? 'bg-rose-500/20 text-rose-400'
                          : cat.profit_margin > 0.15
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {(cat.profit_margin * 100).toFixed(1)}% margin
                    </span>
                  </div>
                  <div className="font-mono text-slate-200 font-bold">
                    ${cat.revenue.toLocaleString()}
                  </div>
                </div>

                {/* Progress bar of revenue vs profit share */}
                <div className="mt-2.5 grid grid-cols-2 gap-3 text-[11px] text-slate-400">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Revenue Share</span>
                      <span className="font-mono">{cat.revenue_share_pct.toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-slate-400 rounded-full"
                        style={{ width: `${Math.min(100, cat.revenue_share_pct)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Profit Share</span>
                      <span className="font-mono">{cat.profit_share_pct.toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          cat.profit_share_pct > 0 ? 'bg-emerald-400' : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, cat.profit_share_pct))}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Region Performance */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Geographic Territory Efficiency
              </h3>
              <p className="text-xs text-slate-400">
                Performance by Regional commercial division
              </p>
            </div>
            <button
              onClick={() => onNavigate('diagnose', { dimension: 'region', entityName: 'Central' })}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>Diagnose Regions</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {regionBreakdown?.items.map((reg) => (
              <div
                key={reg.name}
                onClick={() => onNavigate('diagnose', { dimension: 'region', entityName: reg.name })}
                className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg hover:border-slate-700 cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="font-bold text-white flex items-center gap-2">
                    <span>{reg.name} Territory</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                        reg.profit_margin < 0.08
                          ? 'bg-rose-500/20 text-rose-400'
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {(reg.profit_margin * 100).toFixed(1)}% margin
                    </span>
                  </div>
                  <div className="font-mono text-slate-200 font-bold">
                    ${reg.revenue.toLocaleString()}
                  </div>
                </div>

                <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Net Profit: <strong className={reg.profit >= 0 ? 'text-slate-200' : 'text-rose-400'}>${reg.profit.toLocaleString()}</strong></span>
                  <span>Avg Discount: <strong className="text-slate-200">{(reg.avg_discount * 100).toFixed(1)}%</strong></span>
                  <span>AOV: <strong className="text-slate-200">${reg.aov.toFixed(0)}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Sub-Category Revenue vs Profit Scatter Matrix */}
      {subCatBreakdown && subCatBreakdown.items.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Sub-Category Portfolio Matrix (Revenue vs. Margin)
              </h3>
              <p className="text-xs text-slate-400">
                Identify Star Performers (Top Right) vs. Margin Drainers (Bottom Quadrant)
              </p>
            </div>
            <button
              onClick={() => onNavigate('opportunities')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>See Ranked Opportunities</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="h-64 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  type="number"
                  dataKey="revenue"
                  name="Revenue"
                  unit="$"
                  stroke="#64748b"
                  fontSize={11}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <YAxis
                  type="number"
                  dataKey="profit_margin"
                  name="Margin"
                  unit="%"
                  stroke="#64748b"
                  fontSize={11}
                  tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                />
                <ZAxis range={[60, 200]} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ payload }) => {
                    if (!payload || payload.length === 0) return null;
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg text-xs shadow-xl space-y-1">
                        <div className="font-bold text-white">{data.name}</div>
                        <div className="text-slate-300">Revenue: ${data.revenue.toLocaleString()}</div>
                        <div className="text-slate-300">Profit: ${data.profit.toLocaleString()}</div>
                        <div className="text-emerald-400 font-semibold">
                          Margin: {(data.profit_margin * 100).toFixed(1)}%
                        </div>
                        <div className="text-slate-400">Avg Discount: {(data.avg_discount * 100).toFixed(1)}%</div>
                      </div>
                    );
                  }}
                />
                <Scatter
                  name="Sub-Categories"
                  data={subCatBreakdown.items}
                  fill="#10b981"
                  onClick={(entry) => onNavigate('diagnose', { dimension: 'sub_category', entityName: entry.name })}
                  className="cursor-pointer"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
