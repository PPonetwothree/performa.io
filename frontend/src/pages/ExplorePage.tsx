import React, { useState, useEffect, useMemo } from 'react';
import { useFilter } from '../context/FilterContext';
import { api } from '../lib/api';
import { BreakdownResponse, BreakdownItem } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { PageTab } from '../components/layout/Sidebar';
import {
  Compass,
  Search,
  ArrowUpDown,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

interface ExplorePageProps {
  onNavigate: (tab: PageTab, state?: any) => void;
}

export const ExplorePage: React.FC<ExplorePageProps> = ({ onNavigate }) => {
  const { filters } = useFilter();
  const [dimension, setDimension] = useState<string>('sub_category');
  const [breakdown, setBreakdown] = useState<BreakdownResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortField, setSortField] = useState<keyof BreakdownItem>('revenue');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.getBreakdown(dimension, filters, 100);
      setBreakdown(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load exploration data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [dimension, filters]);

  const handleSort = (field: keyof BreakdownItem) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const filteredItems = useMemo(() => {
    if (!breakdown) return [];
    let items = [...breakdown.items];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter((item) => item.name.toLowerCase().includes(q));
    }

    items.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (typeof aVal === 'string') {
        return sortAsc
          ? (aVal as string).localeCompare(bVal as string)
          : (bVal as string).localeCompare(aVal as string);
      }
      return sortAsc ? Number(aVal) - Number(bVal) : Number(bVal) - Number(aVal);
    });

    return items;
  }, [breakdown, searchQuery, sortField, sortAsc]);

  // Data for Pareto chart (Top 15 items by revenue)
  const paretoData = useMemo(() => {
    if (!breakdown) return [];
    return breakdown.items.slice(0, 15).map((item) => ({
      name: item.name,
      revenue: item.revenue,
      cumulative_pct: item.cumulative_revenue_pct,
    }));
  }, [breakdown]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* 1. Dimension Tabs & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold uppercase tracking-wider">
            <Compass className="w-4 h-4 text-emerald-400" />
            <span>Dimension:</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            {[
              { id: 'sub_category', label: 'Sub-Category' },
              { id: 'category', label: 'Category' },
              { id: 'region', label: 'Region' },
              { id: 'state', label: 'State' },
              { id: 'segment', label: 'Segment' },
              { id: 'product', label: 'Top Products' },
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => setDimension(d.id)}
                className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                  dimension === d.id
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={`Filter ${dimension.replace('_', ' ')}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-52"
          />
        </div>
      </div>

      {isLoading && <LoadingState message="Calculating Pareto distributions & multidimensional shares..." />}
      {error && <ErrorState error={error} onRetry={loadData} />}

      {!isLoading && !error && breakdown && (
        <>
          {/* 2. Pareto 80/20 Analysis Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  80/20 Pareto Concentration Curve ({dimension.replace('_', ' ').toUpperCase()})
                </h3>
                <p className="text-xs text-slate-400">
                  Bars represent volume; green line tracks cumulative revenue contribution toward 100%
                </p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={paretoData}
                  margin={{ top: 10, right: 10, left: 10, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={10}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
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
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
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
                      if (name === 'Cumulative Revenue %') return [`${Number(value).toFixed(1)}%`, name];
                      return [`$${Number(value).toLocaleString()}`, name];
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar
                    yAxisId="left"
                    dataKey="revenue"
                    name="Revenue ($)"
                    fill="#334155"
                    radius={[4, 4, 0, 0]}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="cumulative_pct"
                    name="Cumulative Revenue %"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#10b981' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 3. Granular Sortable Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Detailed Segment Performance Table
                </h3>
                <p className="text-xs text-slate-400">
                  Showing {filteredItems.length} entities • Click any column header to sort
                </p>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-slate-950 z-10 border-b border-slate-800 text-[11px] text-slate-400 font-semibold uppercase">
                  <tr>
                    <th
                      onClick={() => handleSort('name')}
                      className="py-3 px-4 cursor-pointer hover:text-white"
                    >
                      <div className="flex items-center gap-1">
                        <span>Entity</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('revenue')}
                      className="py-3 px-4 cursor-pointer hover:text-white"
                    >
                      <div className="flex items-center gap-1">
                        <span>Revenue</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('revenue_share_pct')}
                      className="py-3 px-4 cursor-pointer hover:text-white"
                    >
                      <div className="flex items-center gap-1">
                        <span>Share %</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('profit')}
                      className="py-3 px-4 cursor-pointer hover:text-white"
                    >
                      <div className="flex items-center gap-1">
                        <span>Net Profit</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('profit_margin')}
                      className="py-3 px-4 cursor-pointer hover:text-white"
                    >
                      <div className="flex items-center gap-1">
                        <span>Margin</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('avg_discount')}
                      className="py-3 px-4 cursor-pointer hover:text-white"
                    >
                      <div className="flex items-center gap-1">
                        <span>Avg Discount</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('aov')}
                      className="py-3 px-4 cursor-pointer hover:text-white"
                    >
                      <div className="flex items-center gap-1">
                        <span>AOV</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('orders')}
                      className="py-3 px-4 cursor-pointer hover:text-white"
                    >
                      <div className="flex items-center gap-1">
                        <span>Orders</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredItems.map((item) => (
                    <tr
                      key={item.name}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-bold text-white truncate max-w-[200px]">
                        {item.name}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-200">
                        ${item.revenue.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {item.revenue_share_pct.toFixed(1)}%
                      </td>
                      <td
                        className={`py-3 px-4 font-mono font-semibold ${
                          item.profit < 0 ? 'text-rose-400' : 'text-slate-200'
                        }`}
                      >
                        ${item.profit.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                            item.profit_margin < 0.05
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : item.profit_margin > 0.15
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {(item.profit_margin * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">
                        {(item.avg_discount * 100).toFixed(1)}%
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">
                        ${item.aov.toFixed(0)}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {item.orders.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={item.status || 'watch'} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-right">
                        {dimension !== 'product' && (
                          <button
                            onClick={() =>
                              onNavigate('diagnose', {
                                dimension: dimension,
                                entityName: item.name,
                              })
                            }
                            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 underline"
                          >
                            Diagnose
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
