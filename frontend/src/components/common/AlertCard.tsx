import React from 'react';
import { AlertItem } from '../../types';
import { AlertOctagon, AlertTriangle, CheckCircle2, Info, ArrowRight } from 'lucide-react';

interface AlertCardProps {
  alert: AlertItem;
  onSelectEntity?: (entityType: string, entityName: string) => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({ alert, onSelectEntity }) => {
  const isCritical = alert.severity === 'critical';
  const isWarning = alert.severity === 'warning';
  const isPositive = alert.severity === 'positive';

  const borderClass = isCritical
    ? 'border-rose-500/40 bg-rose-950/20'
    : isWarning
    ? 'border-amber-500/40 bg-amber-950/20'
    : isPositive
    ? 'border-emerald-500/40 bg-emerald-950/20'
    : 'border-sky-500/40 bg-sky-950/20';

  const iconColor = isCritical
    ? 'text-rose-400'
    : isWarning
    ? 'text-amber-400'
    : isPositive
    ? 'text-emerald-400'
    : 'text-sky-400';

  const IconComponent = isCritical
    ? AlertOctagon
    : isWarning
    ? AlertTriangle
    : isPositive
    ? CheckCircle2
    : Info;

  return (
    <div className={`p-4 rounded-xl border ${borderClass} transition-all hover:border-opacity-80 flex flex-col justify-between`}>
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <IconComponent className={`w-4 h-4 shrink-0 ${iconColor}`} />
            <h4 className="text-xs font-bold text-white tracking-tight">
              {alert.title}
            </h4>
          </div>
          <span className="text-[11px] font-mono font-bold text-slate-300 px-2 py-0.5 rounded bg-slate-900/80 border border-slate-800">
            {alert.value}
          </span>
        </div>

        <p className="text-xs text-slate-300 mt-2 leading-relaxed">
          {alert.message}
        </p>
      </div>

      {alert.entity_name && alert.entity_type && onSelectEntity && (
        <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Target: <strong className="text-slate-200">{alert.entity_name}</strong>
          </span>
          <button
            onClick={() => onSelectEntity(alert.entity_type!, alert.entity_name!)}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <span>Diagnose Entity</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};
