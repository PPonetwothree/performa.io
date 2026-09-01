import React, { useState, useEffect } from 'react';
import { useFilter } from '../context/FilterContext';
import { api } from '../lib/api';
import { DiagnosticResult } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { BenchmarkCard } from '../components/common/BenchmarkCard';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { PageTab } from '../components/layout/Sidebar';
import {
  Stethoscope,
  ShieldAlert,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

interface DiagnosePageProps {
  initialDimension?: string;
  initialEntityName?: string;
  onNavigate: (tab: PageTab, state?: any) => void;
  onOpenMethodology: () => void;
}

export const DiagnosePage: React.FC<DiagnosePageProps> = ({
  initialDimension = 'sub_category',
  initialEntityName = 'Tables',
  onNavigate,
  onOpenMethodology,
}) => {
  const { filters, filterOptions } = useFilter();
  const [dimension, setDimension] = useState<string>(initialDimension);
  const [entityName, setEntityName] = useState<string>(initialEntityName);
  const [diagnostic, setDiagnostic] = useState<DiagnosticResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Sync initial props if passed from navigation
  useEffect(() => {
    if (initialDimension) setDimension(initialDimension);
    if (initialEntityName) setEntityName(initialEntityName);
  }, [initialDimension, initialEntityName]);

  // Available entities for selected dimension
  const entityOptions = React.useMemo(() => {
    if (!filterOptions) return [];
    if (dimension === 'region') return filterOptions.regions;
    if (dimension === 'category') return filterOptions.categories;
    if (dimension === 'sub_category') return filterOptions.sub_categories;
    if (dimension === 'segment') return filterOptions.segments;
    if (dimension === 'state') return filterOptions.states;
    return [];
  }, [dimension, filterOptions]);

  // Ensure selected entity belongs to available options
  useEffect(() => {
    if (entityOptions.length > 0 && !entityOptions.includes(entityName)) {
      setEntityName(entityOptions[0]);
    }
  }, [dimension, entityOptions]);

  const loadDiagnosticData = async () => {
    if (!dimension || !entityName) return;
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.getDiagnostics(dimension, entityName, filters);
      setDiagnostic(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load diagnostic data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDiagnosticData();
  }, [dimension, entityName, filters]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* 1. Selector Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold uppercase tracking-wider">
            <Stethoscope className="w-4 h-4 text-emerald-400" />
            <span>Target Dimension:</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            {[
              { id: 'sub_category', label: 'Sub-Category' },
              { id: 'category', label: 'Category' },
              { id: 'region', label: 'Region' },
              { id: 'state', label: 'State' },
              { id: 'segment', label: 'Segment' },
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

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Entity:</span>
            <select
              value={entityName}
              onChange={(e) => setEntityName(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-white text-xs rounded-lg px-3 py-1.5 font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {entityOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={onOpenMethodology}
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 font-medium underline underline-offset-4"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Benchmarking Rules</span>
        </button>
      </div>

      {isLoading && <LoadingState message={`Diagnosing root causes for ${entityName}...`} />}
      {error && <ErrorState error={error} onRetry={loadDiagnosticData} />}

      {!isLoading && !error && diagnostic && (
        <>
          {/* 2. Diagnostic Summary Banner */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md relative overflow-hidden">
            <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-800/80">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-extrabold text-white tracking-tight">
                    {diagnostic.entity_name}
                  </h2>
                  <StatusBadge status={diagnostic.status} size="md" />
                </div>
                <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                  <span>Dimension: <strong className="text-slate-300 capitalize">{diagnostic.dimension.replace('_', ' ')}</strong></span>
                  <span>•</span>
                  <span>Entity Transactions: <strong className="text-slate-300">{diagnostic.sample_size.toLocaleString()}</strong></span>
                  <span>•</span>
                  <span>Peer Sample: <strong className="text-slate-300">{diagnostic.peer_sample_size.toLocaleString()}</strong></span>
                </div>
              </div>

              {/* Confidence Badge */}
              <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-right">
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  Diagnostic Confidence
                </div>
                <div className="text-xs font-bold text-emerald-400 mt-0.5">
                  {diagnostic.confidence} Confidence ({diagnostic.sample_size >= 30 ? 'Robust N' : 'Standard N'})
                </div>
              </div>
            </div>

            {/* Root Cause Driver */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Primary Root-Cause Driver
                </div>
                <div className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
                  <span>{diagnostic.primary_driver}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pt-1">
                  {diagnostic.summary}
                </p>
              </div>

              {/* Severity Gauge Box */}
              <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Severity Level
                  </div>
                  <div
                    className={`text-base font-extrabold mt-1 ${
                      diagnostic.severity === 'Critical'
                        ? 'text-rose-400'
                        : diagnostic.severity === 'High'
                        ? 'text-amber-400'
                        : 'text-slate-200'
                    }`}
                  >
                    {diagnostic.severity} Severity
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 mt-2">
                  Benchmark: Peer Group average excluding {diagnostic.entity_name}
                </div>
              </div>
            </div>
          </div>

          {/* 3. Peer Benchmark Metrics Side-by-Side */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Peer Benchmark Metric Comparison
              </h3>
              <span className="text-[11px] text-slate-400">
                Green indicates favorable vs peer; Red indicates margin/volume drag
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {diagnostic.metrics_comparison.map((metric) => (
                <BenchmarkCard
                  key={metric.metric}
                  metric={metric}
                  entityName={diagnostic.entity_name}
                />
              ))}
            </div>
          </div>

          {/* 4. Evidence & Prescriptive Action */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Supporting Evidence */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Supporting Analytical Evidence
                </h3>
              </div>
              <ul className="space-y-2.5">
                {diagnostic.evidence.map((item, idx) => (
                  <li
                    key={idx}
                    className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 text-xs text-slate-300 leading-relaxed flex items-start gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommended Action */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    Recommended Management Action
                  </h3>
                </div>
                <div className="mt-3 p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 font-medium leading-relaxed">
                  {diagnostic.recommended_action}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Ready to prioritize this action?
                </span>
                <button
                  onClick={() => onNavigate('opportunities')}
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                >
                  <span>View Ranked Opportunities</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* 5. Sub-unit Contributor Breakdown (if Category or Region) */}
          {diagnostic.sub_breakdown && diagnostic.sub_breakdown.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-white tracking-tight mb-1">
                Internal Constituent Performance Breakdown
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Sub-unit margin variance and volume contribution within {diagnostic.entity_name}
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold text-[10px]">
                      <th className="py-2.5 px-3">Sub-Unit</th>
                      <th className="py-2.5 px-3">Revenue</th>
                      <th className="py-2.5 px-3">Profit</th>
                      <th className="py-2.5 px-3">Margin %</th>
                      <th className="py-2.5 px-3">Avg Discount</th>
                      <th className="py-2.5 px-3">Orders</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {diagnostic.sub_breakdown.map((item) => (
                      <tr key={item.name} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-white">{item.name}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-300">${item.revenue.toLocaleString()}</td>
                        <td className={`py-2.5 px-3 font-mono font-semibold ${item.profit < 0 ? 'text-rose-400' : 'text-slate-200'}`}>
                          ${item.profit.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[11px] font-mono font-bold ${
                              item.profit_margin < 0.05
                                ? 'bg-rose-500/20 text-rose-400'
                                : 'bg-emerald-500/20 text-emerald-400'
                            }`}
                          >
                            {(item.profit_margin * 100).toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-300">{(item.avg_discount * 100).toFixed(1)}%</td>
                        <td className="py-2.5 px-3 font-mono text-slate-400">{item.orders}</td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => {
                              setDimension(diagnostic.dimension === 'category' ? 'sub_category' : 'state');
                              setEntityName(item.name);
                            }}
                            className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 underline"
                          >
                            Deep-Dive
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
