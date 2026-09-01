import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Calculating telemetry and diagnostics...',
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-16 text-center">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mb-3" />
      <div className="text-xs font-semibold text-slate-300">{message}</div>
      <div className="text-[11px] text-slate-400 mt-1">
        Evaluating peer benchmarks & profit elasticity
      </div>
    </div>
  );
};
