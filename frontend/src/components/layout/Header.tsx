import React from 'react';
import { useFilter } from '../../context/FilterContext';
import { api } from '../../lib/api';
import { Upload, RotateCcw, Database, Filter } from 'lucide-react';
import { PageTab } from './Sidebar';

interface HeaderProps {
  activeTab: PageTab;
  onOpenUpload: () => void;
  onOpenMethodology?: () => void;
}

const tabTitles: Record<PageTab, { title: string; subtitle: string }> = {
  overview: {
    title: 'Executive Performance Overview',
    subtitle: 'Comprehensive financial, margin, and volume telemetry with automated anomaly alerts.',
  },
  diagnose: {
    title: 'Entity Root Cause Diagnosis',
    subtitle: 'Evaluate specific regions, categories, or sub-categories against peer benchmarks.',
  },
  explore: {
    title: 'Multi-Dimensional Data Explorer',
    subtitle: 'Pareto concentration analysis, margin dispersion matrices, and granular transaction tables.',
  },
  opportunities: {
    title: 'Prioritized Value Creation Opportunities',
    subtitle: 'Ranked high-impact margin interventions scored by business impact, gap, and feasibility.',
  },
  reports: {
    title: 'Executive Performance Briefing',
    subtitle: 'Management-ready performance summary with structured findings, drivers, and next actions.',
  },
};

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenUpload,
  onOpenMethodology,
}) => {
  const { datasetStatus, activeFilterCount, resetFilters, refreshData } = useFilter();

  const handleResetData = async () => {
    if (window.confirm('Reset data back to the default Kaggle Superstore demo dataset?')) {
      try {
        await api.resetDataset();
        await refreshData();
      } catch (err) {
        alert('Failed to reset dataset: ' + String(err));
      }
    }
  };

  return (
    <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-800 px-6 py-3.5 sticky top-0 z-20 flex items-center justify-between no-print">
      {/* Title & Description */}
      <div>
        <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          {tabTitles[activeTab].title}
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          {tabTitles[activeTab].subtitle}
        </p>
      </div>

      {/* Dataset & Quick Action Controls */}
      <div className="flex items-center gap-2.5">
        {/* Active Filter Pill */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2.5 py-1 rounded-full text-xs font-medium">
            <Filter className="w-3 h-3" />
            <span>{activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active</span>
            <button
              onClick={resetFilters}
              className="ml-1 hover:text-emerald-200 text-emerald-400/80 font-bold text-[11px]"
              title="Reset all filters"
            >
              ×
            </button>
          </div>
        )}

        {/* Dataset Status Badge */}
        {datasetStatus && (
          <div className="hidden md:flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
            <Database className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-300 font-medium truncate max-w-[140px]">
              {datasetStatus.filename}
            </span>
            <span className="text-[11px] text-slate-400">
              ({datasetStatus.total_rows.toLocaleString()} rows)
            </span>
            {datasetStatus.is_default && (
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold px-1.5 py-0.2 rounded">
                Kaggle Demo
              </span>
            )}
          </div>
        )}

        {/* Upload Custom CSV */}
        <button
          onClick={onOpenUpload}
          className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-700 transition-colors"
        >
          <Upload className="w-3.5 h-3.5 text-slate-400" />
          <span>Upload CSV</span>
        </button>

        {/* Diagnostic Rules Button */}
        {onOpenMethodology && (
          <button
            onClick={onOpenMethodology}
            title="Diagnostic Methodology & Rules"
            className="flex items-center gap-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 px-2.5 py-1.5 rounded-lg text-xs border border-slate-700 transition-colors"
          >
            <span>Rules</span>
          </button>
        )}

        {/* Reset Dataset if custom loaded */}
        {datasetStatus && !datasetStatus.is_default && (
          <button
            onClick={handleResetData}
            title="Reset to default Kaggle dataset"
            className="flex items-center gap-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 px-2.5 py-1.5 rounded-lg text-xs border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3 h-3 text-slate-400" />
            <span>Reset Demo</span>
          </button>
        )}
      </div>
    </header>
  );
};
