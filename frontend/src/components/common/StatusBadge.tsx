import React from 'react';
import { AlertTriangle, AlertOctagon, CheckCircle2, Eye, HelpCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'critical' | 'underperforming' | 'watch' | 'strong' | 'insufficient_sample' | string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const normalized = status.toLowerCase();

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  };

  if (normalized === 'critical') {
    return (
      <span className={`inline-flex items-center rounded-full font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30 ${sizeClasses[size]}`}>
        <AlertOctagon className="w-3.5 h-3.5 shrink-0 text-rose-400" />
        <span>Critical Intervention</span>
      </span>
    );
  }

  if (normalized === 'underperforming') {
    return (
      <span className={`inline-flex items-center rounded-full font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 ${sizeClasses[size]}`}>
        <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
        <span>Underperforming</span>
      </span>
    );
  }

  if (normalized === 'strong') {
    return (
      <span className={`inline-flex items-center rounded-full font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 ${sizeClasses[size]}`}>
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
        <span>Strong Performer</span>
      </span>
    );
  }

  if (normalized === 'insufficient_sample') {
    return (
      <span className={`inline-flex items-center rounded-full font-semibold bg-slate-800 text-slate-400 border border-slate-700 ${sizeClasses[size]}`}>
        <HelpCircle className="w-3.5 h-3.5 shrink-0 text-slate-400" />
        <span>Insufficient Sample</span>
      </span>
    );
  }

  // Watch / Neutral default
  return (
    <span className={`inline-flex items-center rounded-full font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/30 ${sizeClasses[size]}`}>
      <Eye className="w-3.5 h-3.5 shrink-0 text-sky-400" />
      <span>Watch / Parity</span>
    </span>
  );
};
