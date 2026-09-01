import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  change?: number | null;
  changeLabel?: string;
  isFavorable?: boolean;
  prefix?: string;
  suffix?: string;
  icon?: React.ReactNode;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  change,
  changeLabel,
  isFavorable,
  icon,
}) => {
  const hasChange = change !== undefined && change !== null;
  const isPositive = hasChange && change > 0;
  const isNegative = hasChange && change < 0;

  let trendColor = 'text-slate-400 bg-slate-800/60 border-slate-700';
  if (hasChange) {
    if (isFavorable !== undefined) {
      trendColor = isFavorable
        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
        : 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    } else {
      trendColor = isPositive
        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
        : isNegative
        ? 'text-rose-400 bg-rose-500/10 border-rose-500/20'
        : 'text-slate-400 bg-slate-800/60 border-slate-700';
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-800/90 rounded-xl p-4 shadow-sm hover:border-slate-700 transition-colors">
      <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
        <span className="truncate">{title}</span>
        {icon && <span className="text-slate-400">{icon}</span>}
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <div className="text-2xl font-extrabold text-white tracking-tight font-mono">
          {value}
        </div>
      </div>

      <div className="mt-2.5 flex items-center justify-between text-xs">
        {hasChange ? (
          <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[11px] font-semibold ${trendColor}`}>
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : isNegative ? (
              <TrendingDown className="w-3 h-3" />
            ) : (
              <Minus className="w-3 h-3" />
            )}
            <span>
              {isPositive ? '+' : ''}
              {change}%
            </span>
          </div>
        ) : (
          <span className="text-[11px] text-slate-400 font-mono">Benchmark Metric</span>
        )}

        {(subtitle || changeLabel) && (
          <span className="text-[11px] text-slate-400 truncate max-w-[150px]">
            {subtitle || changeLabel}
          </span>
        )}
      </div>
    </div>
  );
};
