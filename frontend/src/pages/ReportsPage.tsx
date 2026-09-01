import React, { useState, useEffect } from 'react';
import { useFilter } from '../context/FilterContext';
import { api } from '../lib/api';
import { ExecutiveReport } from '../types';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import {
  FileText,
  Printer,
  TrendingUp,
  AlertTriangle,
  Target,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { filters, resetFilters } = useFilter();
  const [report, setReport] = useState<ExecutiveReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadReport = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.getReport(filters);
      setReport(res);
    } catch (err: any) {
      setError(err.message || 'Failed to generate executive report.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [filters]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return <LoadingState message="Synthesizing executive briefing and strategic recommendations..." />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={loadReport} />;
  }

  if (!report) {
    return <EmptyState onResetFilters={resetFilters} />;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Top Action Bar (hidden in print) */}
      <div className="flex items-center justify-between no-print bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">
            Executive Performance Briefing
          </h3>
          <p className="text-xs text-slate-400">
            Consulting-grade management summary formatted for distribution or PDF export.
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition-colors shadow-sm"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Export PDF</span>
        </button>
      </div>

      {/* Printable Report Document Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl space-y-8 print-card">
        {/* Document Header */}
        <div className="border-b border-slate-800 pb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>Performa.io Intelligence Briefing</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              {report.title}
            </h1>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>Generated: {report.generated_at}</span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Dataset Scope
            </div>
            <div className="text-xs font-medium text-slate-300 max-w-xs mt-0.5">
              {report.filter_summary}
            </div>
          </div>
        </div>

        {/* 1. Executive Summary Narrative */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>1. Executive Summary</span>
          </h2>
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
            {report.executive_summary}
          </div>
        </div>

        {/* 2. Core Macro KPIs Grid */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>2. Portfolio Financial Snapshot</span>
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div className="text-[10px] uppercase font-bold text-slate-400">Total Revenue</div>
              <div className="text-base font-extrabold font-mono text-white mt-1">
                ${report.kpis.revenue.toLocaleString()}
              </div>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div className="text-[10px] uppercase font-bold text-slate-400">Net Profit</div>
              <div className={`text-base font-extrabold font-mono mt-1 ${report.kpis.profit >= 0 ? 'text-white' : 'text-rose-400'}`}>
                ${report.kpis.profit.toLocaleString()}
              </div>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div className="text-[10px] uppercase font-bold text-slate-400">Profit Margin</div>
              <div className="text-base font-extrabold font-mono text-emerald-400 mt-1">
                {(report.kpis.profit_margin * 100).toFixed(1)}%
              </div>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div className="text-[10px] uppercase font-bold text-slate-400">Total Orders</div>
              <div className="text-base font-extrabold font-mono text-white mt-1">
                {report.kpis.orders.toLocaleString()}
              </div>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div className="text-[10px] uppercase font-bold text-slate-400">Avg Order Value</div>
              <div className="text-base font-extrabold font-mono text-white mt-1">
                ${report.kpis.aov.toFixed(0)}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Key Findings */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>3. Key Strategic Findings</span>
          </h2>
          <ul className="space-y-2">
            {report.key_findings.map((finding, idx) => (
              <li
                key={idx}
                className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span>{finding}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 4. Major Performance Gaps Table */}
        {report.major_gaps.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>4. Major Performance Gaps & Loss Areas</span>
            </h2>

            <div className="overflow-x-auto rounded-lg border border-slate-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Entity</th>
                    <th className="py-2.5 px-3">Dimension</th>
                    <th className="py-2.5 px-3">Observed Gap</th>
                    <th className="py-2.5 px-3">Root Cause</th>
                    <th className="py-2.5 px-3">Severity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                  {report.major_gaps.map((gap, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-3 font-bold text-white">{gap.entity}</td>
                      <td className="py-2.5 px-3 text-slate-400">{gap.dimension}</td>
                      <td className="py-2.5 px-3 text-slate-300">{gap.issue}</td>
                      <td className="py-2.5 px-3 text-amber-400 font-medium">{gap.primary_driver}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                            gap.severity === 'Critical'
                              ? 'bg-rose-500/20 text-rose-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}
                        >
                          {gap.severity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. Top Strategic Opportunities */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" />
            <span>5. Prioritized Value Creation Opportunities</span>
          </h2>

          <div className="space-y-3">
            {report.top_opportunities.map((opp, idx) => (
              <div
                key={opp.id}
                className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-[10px] font-mono font-bold text-emerald-400">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-white text-xs">{opp.title}</span>
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {opp.opportunity_type}
                    </span>
                  </div>
                  <div className="font-mono text-emerald-400 font-extrabold text-xs">
                    ${opp.estimated_annual_exposure.toLocaleString(undefined, { maximumFractionDigits: 0 })} Exposure
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed pl-7">
                  {opp.recommended_action}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 6. Execution Roadmap */}
        {report.action_plan.length > 0 && (
          <div className="space-y-3 print-page-break">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-400" />
              <span>6. Recommended Implementation Action Plan</span>
            </h2>

            <div className="overflow-x-auto rounded-lg border border-slate-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Priority</th>
                    <th className="py-2.5 px-3">Target Entity</th>
                    <th className="py-2.5 px-3">Intervention Action</th>
                    <th className="py-2.5 px-3">Est. Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                  {report.action_plan.map((act, idx) => (
                    <tr key={idx}>
                      <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                        {act.phase}
                      </td>
                      <td className="py-3 px-3 font-bold text-white">{act.target}</td>
                      <td className="py-3 px-3 text-slate-300 leading-relaxed">
                        {act.recommended_action}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-white">
                        {act.financial_impact}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Document Footer */}
        <div className="pt-6 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-400">
          <span>Performa.io Analytical Intelligence Engine</span>
          <span>Confidential • Prepared for Management Review</span>
        </div>
      </div>
    </div>
  );
};
