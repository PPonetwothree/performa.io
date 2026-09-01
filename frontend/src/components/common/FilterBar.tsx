import React from 'react';
import { useFilter } from '../../context/FilterContext';
import { Filter, Calendar, RotateCcw } from 'lucide-react';

export const FilterBar: React.FC = () => {
  const {
    filters,
    filterOptions,
    updateFilter,
    toggleMultiFilter,
    resetFilters,
    activeFilterCount,
  } = useFilter();

  if (!filterOptions) {
    return null;
  }

  return (
    <div className="bg-slate-900 border-b border-slate-800 px-6 py-2.5 flex flex-wrap items-center gap-3 text-xs no-print">
      <div className="flex items-center gap-1.5 text-slate-400 font-semibold uppercase tracking-wider text-[10px] shrink-0">
        <Filter className="w-3.5 h-3.5 text-emerald-400" />
        <span>Filters</span>
      </div>

      {/* Date Range Selector */}
      <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800 text-slate-300">
        <Calendar className="w-3.5 h-3.5 text-slate-400" />
        <input
          type="date"
          min={filterOptions.min_date}
          max={filterOptions.max_date}
          value={filters.start_date || filterOptions.min_date}
          onChange={(e) => updateFilter('start_date', e.target.value)}
          className="bg-transparent border-none text-xs text-slate-200 focus:outline-none cursor-pointer"
        />
        <span className="text-slate-400">→</span>
        <input
          type="date"
          min={filterOptions.min_date}
          max={filterOptions.max_date}
          value={filters.end_date || filterOptions.max_date}
          onChange={(e) => updateFilter('end_date', e.target.value)}
          className="bg-transparent border-none text-xs text-slate-200 focus:outline-none cursor-pointer"
        />
      </div>

      {/* Region Multi-Select Buttons */}
      <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
        <span className="px-2 text-[11px] text-slate-400 font-medium">Region:</span>
        {filterOptions.regions.map((reg) => {
          const isSelected = filters.regions?.includes(reg) ?? false;
          return (
            <button
              key={reg}
              onClick={() => toggleMultiFilter('regions', reg)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                isSelected
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {reg}
            </button>
          );
        })}
      </div>

      {/* Category Multi-Select Buttons */}
      <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
        <span className="px-2 text-[11px] text-slate-400 font-medium">Category:</span>
        {filterOptions.categories.map((cat) => {
          const isSelected = filters.categories?.includes(cat) ?? false;
          return (
            <button
              key={cat}
              onClick={() => toggleMultiFilter('categories', cat)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                isSelected
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Segment Multi-Select Buttons */}
      <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
        <span className="px-2 text-[11px] text-slate-400 font-medium">Segment:</span>
        {filterOptions.segments.map((seg) => {
          const isSelected = filters.segments?.includes(seg) ?? false;
          return (
            <button
              key={seg}
              onClick={() => toggleMultiFilter('segments', seg)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                isSelected
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {seg}
            </button>
          );
        })}
      </div>

      {/* Clear/Reset Filters Button */}
      {activeFilterCount > 0 && (
        <button
          onClick={resetFilters}
          className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-rose-400 px-2 py-1 rounded hover:bg-slate-800 transition-colors ml-auto"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Clear All ({activeFilterCount})</span>
        </button>
      )}
    </div>
  );
};
