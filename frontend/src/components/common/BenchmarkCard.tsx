import React from 'react';
import { BenchmarkMetric } from '../../types';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface BenchmarkCardProps {
  metric: BenchmarkMetric;
  entityName: string;
}

export const BenchmarkCard: React.FC<BenchmarkCardProps> = ({ metric, entityName }) => {
  const isPositiveGap = metric.gap > 0;
  const isNegativeGap = metric.gap < 0;

  const formattedEntity =
    metric.unit === '$'
      ? `$${metric.entity_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : metric.unit === '%'
      ? `${metric.entity_value.toFixed(1)}%`
      : `${metric.entity_value.toLocaleString()} ${metric.unit}`;

  const formattedPeer =
    metric.unit === '$'
      ? `$${metric.peer_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : metric.unit === '%'
      ? `${metric.peer_value.toFixed(1)}%`
      : `${metric.peer_value.toLocaleString()} ${metric.unit}`;

  const formattedGap =
    metric.unit === '$'
      ? `${isPositiveGap ? '+' : ''}$${Math.abs(metric.gap).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : metric.unit === '%'
      ? `${isPositiveGap ? '+' : ''}${metric.gap.toFixed(1)} pp`
      : `${isPositiveGap ? '+' : ''}${metric.gap.toFixed(1)} ${metric.unit}`;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition-colors">
      <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
        <span>{metric.label}</span>
        <div
          className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border ${
            metric.is_favorable
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
          }`}
        >
          {isPositiveGap ? (
            <ArrowUpRight className="w-3 h-3" />
          ) : isNegativeGap ? (
            <ArrowDownRight className="w-3 h-3" />
          ) : (
            <Minus className="w-3 h-3" />
          )}
          <span>{formattedGap}</span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
        <div>
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider truncate">
            {entityName}
          </div>
          <div className="text-lg font-bold text-white font-mono mt-0.5">
            {formattedEntity}
          </div>
        </div>

        <div className="border-l border-slate-800/80 pl-3">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Peer Benchmark
          </div>
          <div className="text-lg font-bold text-slate-400 font-mono mt-0.5">
            {formattedPeer}
          </div>
        </div>
      </div>

      {/* Visual Relative Gap Progress */}
      <div className="mt-3">
        <div className="flex justify-between text-[10px] text-slate-400 mb-1">
          <span>Performance Differential</span>
          <span className="font-mono">{metric.gap_pct > 0 ? `+${metric.gap_pct}%` : `${metric.gap_pct}%`} vs peer</span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden flex">
          <div
            className={`h-full rounded-full transition-all ${
              metric.is_favorable ? 'bg-emerald-500' : 'bg-rose-500'
            }`}
            style={{
              width: `${Math.min(100, Math.max(10, Math.abs(metric.gap_pct)))}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};
