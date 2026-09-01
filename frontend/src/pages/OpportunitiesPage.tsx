import React, { useState, useEffect, useMemo } from 'react';
import { useFilter } from '../context/FilterContext';
import { api } from '../lib/api';
import { OpportunityResponse, OpportunityItem } from '../types';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { PageTab } from '../components/layout/Sidebar';
import {
  Target,
  DollarSign,
  AlertOctagon,
  Sparkles,
  ListOrdered,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface OpportunitiesPageProps {
  onNavigate: (tab: PageTab, state?: any) => void;
  onOpenMethodology: () => void;
}

export const OpportunitiesPage: React.FC<OpportunitiesPageProps> = ({
  onNavigate,
  onOpenMethodology,
}) => {
  const { filters, resetFilters } = useFilter();
  const [data, setData] = useState<OpportunityResponse | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedOpp, setSelectedOpp] = useState<OpportunityItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadOpportunities = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.getOpportunities(filters);
      setData(res);
      if (res.opportunities.length > 0) {
        setSelectedOpp(res.opportunities[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load opportunities.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOpportunities();
  }, [filters]);

  const filteredOpportunities = useMemo(() => {
    if (!data) return [];
    if (priorityFilter === 'all') return data.opportunities;
    return data.opportunities.filter(
      (o) => o.priority.toLowerCase() === priorityFilter.toLowerCase()
    );
  }, [data, priorityFilter]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* 1. Header Summary Cards */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Total Opportunities</div>
              <div className="text-2xl font-extrabold text-white font-mono mt-0.5">
                {data.total_opportunities}
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">High Priority Interventions</div>
              <div className="text-2xl font-extrabold text-rose-400 font-mono mt-0.5">
                {data.high_priority_count}
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Total Quantifiable Exposure</div>
              <div className="text-2xl font-extrabold text-white font-mono mt-0.5">
                ${data.estimated_total_exposure.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Priority Filter Bar & Methodology Link */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Filter Priority:
          </span>
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            {['all', 'high', 'medium', 'low'].map((p) => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-3 py-1 rounded text-xs font-semibold uppercase tracking-wider transition-all ${
                  priorityFilter === p
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onOpenMethodology}
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 font-medium underline underline-offset-4"
        >
          <span>Multi-Factor Scoring Formula (40/30/20/10)</span>
        </button>
      </div>

      {isLoading && <LoadingState message="Ranking commercial opportunities and computing exposure..." />}
      {error && <ErrorState error={error} onRetry={loadOpportunities} />}

      {!isLoading && !error && filteredOpportunities.length === 0 && (
        <EmptyState onResetFilters={resetFilters} />
      )}

      {/* 3. Opportunities Master-Detail View */}
      {!isLoading && !error && filteredOpportunities.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Ranked List */}
          <div className="lg:col-span-5 space-y-3 max-h-[720px] overflow-y-auto pr-1">
            {filteredOpportunities.map((opp, idx) => {
              const isSelected = selectedOpp?.id === opp.id;
              const isHigh = opp.priority === 'High';

              return (
                <div
                  key={opp.id}
                  onClick={() => setSelectedOpp(opp)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-800/90 border-emerald-500 shadow-md ring-1 ring-emerald-500/30'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-950 flex items-center justify-center text-[10px] font-mono font-bold text-slate-400">
                        {idx + 1}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                          isHigh
                            ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {opp.priority} Priority
                      </span>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-mono font-extrabold text-white">
                        ${opp.estimated_annual_exposure.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </div>
                      <div className="text-[10px] text-slate-400">Exposure</div>
                    </div>
                  </div>

                  <h4 className="text-xs font-bold text-white mt-2 leading-tight">
                    {opp.title}
                  </h4>

                  <p className="text-[11px] text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                    {opp.problem}
                  </p>

                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span>
                      Score: <strong className="text-emerald-400 font-mono">{opp.composite_score}</strong>/100
                    </span>
                    <span className="text-slate-400 capitalize">
                      {opp.opportunity_type}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Selected Opportunity Action Brief */}
          {selectedOpp && (
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md flex flex-col justify-between space-y-6">
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                        {selectedOpp.dimension.replace('_', ' ')}:
                      </span>
                      <span className="text-xs font-bold text-emerald-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {selectedOpp.entity_name}
                      </span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {selectedOpp.opportunity_type}
                      </span>
                    </div>
                    <h3 className="text-lg font-extrabold text-white tracking-tight">
                      {selectedOpp.title}
                    </h3>
                  </div>

                  <div className="text-right">
                    <div className="text-xl font-mono font-extrabold text-emerald-400">
                      ${selectedOpp.estimated_annual_exposure.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">
                      Quantifiable Exposure
                    </div>
                  </div>
                </div>

                {/* Score Factor Breakdown */}
                <div className="mt-4 p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-300 mb-2">
                    <span>Multi-Factor Priority Score</span>
                    <span className="font-mono text-emerald-400 font-bold text-sm">
                      {selectedOpp.composite_score}/100
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-[10px] text-slate-400">
                    <div className="bg-slate-900 p-2 rounded border border-slate-800/80 text-center">
                      <div>Impact (40%)</div>
                      <div className="font-mono font-bold text-white text-xs mt-0.5">
                        {selectedOpp.business_impact_score}
                      </div>
                    </div>
                    <div className="bg-slate-900 p-2 rounded border border-slate-800/80 text-center">
                      <div>Gap (30%)</div>
                      <div className="font-mono font-bold text-white text-xs mt-0.5">
                        {selectedOpp.performance_gap_score}
                      </div>
                    </div>
                    <div className="bg-slate-900 p-2 rounded border border-slate-800/80 text-center">
                      <div>Feasibility (20%)</div>
                      <div className="font-mono font-bold text-white text-xs mt-0.5">
                        {selectedOpp.feasibility_score}
                      </div>
                    </div>
                    <div className="bg-slate-900 p-2 rounded border border-slate-800/80 text-center">
                      <div>Urgency (10%)</div>
                      <div className="font-mono font-bold text-white text-xs mt-0.5">
                        {selectedOpp.urgency_score}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Core Recommended Action */}
                <div className="mt-4 space-y-2">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Prescriptive Action</span>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-300 font-medium leading-relaxed">
                    {selectedOpp.recommended_action}
                  </div>
                </div>

                {/* Implementation Steps */}
                <div className="mt-4 space-y-2">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ListOrdered className="w-3.5 h-3.5 text-sky-400" />
                    <span>Structured Execution Roadmap</span>
                  </div>
                  <div className="space-y-2">
                    {selectedOpp.implementation_steps.map((step, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2.5"
                      >
                        <span className="w-5 h-5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-[10px] font-mono font-bold text-emerald-400 shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span className="leading-relaxed">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Supporting Analytical Evidence */}
                <div className="mt-4 space-y-2">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                    <span>Underlying Root-Cause Evidence</span>
                  </div>
                  <ul className="space-y-1.5">
                    {selectedOpp.evidence.map((ev, i) => (
                      <li
                        key={i}
                        className="text-xs text-slate-300 flex items-start gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                        <span>{ev}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Bottom Jump-to-Diagnose CTA */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Confidence Rating: <strong className="text-slate-200">{selectedOpp.confidence}</strong>
                </span>
                <button
                  onClick={() =>
                    onNavigate('diagnose', {
                      dimension: selectedOpp.dimension,
                      entityName: selectedOpp.entity_name,
                    })
                  }
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <span>Launch Deep-Dive Diagnosis</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
