import React from 'react';
import { X, BookOpen, ShieldCheck, Scale, Compass } from 'lucide-react';

interface MethodologyDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MethodologyDrawer: React.FC<MethodologyDrawerProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-xs no-print">
      <div className="bg-slate-900 border-l border-slate-800 w-full max-w-xl h-full overflow-y-auto p-6 shadow-2xl flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Analytical Methodology & Rules
                </h3>
                <p className="text-xs text-slate-400">
                  Deterministic, consulting-grade intelligence framework
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Core Content */}
          <div className="mt-6 space-y-6 text-xs text-slate-300">
            {/* Section 1: Benchmarking */}
            <div>
              <div className="flex items-center gap-2 font-bold text-white text-xs mb-2">
                <Scale className="w-4 h-4 text-emerald-400" />
                <span>1. Peer Benchmarking Logic</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Peer benchmarks calculate the weighted average of all peers within the same dimension level,{' '}
                <strong className="text-slate-200">strictly excluding the selected entity</strong> to avoid self-referential bias.
                If an entity has fewer than 10 transactions, the engine labels the comparison as{' '}
                <code className="text-amber-400 bg-slate-950 px-1 py-0.5 rounded">insufficient_sample</code>.
              </p>
            </div>

            {/* Section 2: Diagnostic Drivers */}
            <div>
              <div className="flex items-center gap-2 font-bold text-white text-xs mb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>2. Root-Cause Diagnostic Rules</span>
              </div>
              <div className="space-y-2 mt-2">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="font-semibold text-rose-400">Critical Operating Loss</div>
                  <div className="text-slate-400 mt-0.5">Net Profit &lt; 0. Unit revenue fails to cover fixed COGS and overhead.</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="font-semibold text-amber-400">Discount Leakage</div>
                  <div className="text-slate-400 mt-0.5">Average Discount &gt; Peer Benchmark AND Profit Margin &lt; Peer Benchmark. Excessive markdowns erode margin.</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="font-semibold text-sky-400">Product Mix Distortion</div>
                  <div className="text-slate-400 mt-0.5">Top-line Revenue is strong, but margin lags due to high concentration in low-margin sub-categories.</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="font-semibold text-indigo-400">Volume Weakness</div>
                  <div className="text-slate-400 mt-0.5">Orders &lt; Peer Benchmark AND Revenue &lt; Peer Benchmark with healthy underlying margin.</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="font-semibold text-emerald-400">Strong Star Performer</div>
                  <div className="text-slate-400 mt-0.5">Revenue &gt; 5% above peer benchmark AND Margin &gt; 2% points above benchmark.</div>
                </div>
              </div>
            </div>

            {/* Section 3: Opportunity Scoring */}
            <div>
              <div className="flex items-center gap-2 font-bold text-white text-xs mb-2">
                <Compass className="w-4 h-4 text-emerald-400" />
                <span>3. Multi-Factor Opportunity Scoring</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <div className="font-mono text-[11px] text-emerald-400 font-bold">
                  Score = 40% Impact + 30% Gap + 20% Feasibility + 10% Urgency
                </div>
                <ul className="list-disc list-inside text-slate-400 space-y-1 text-[11px]">
                  <li><strong className="text-slate-300">Business Impact (40%):</strong> Dollar exposure relative to portfolio scale.</li>
                  <li><strong className="text-slate-300">Performance Gap (30%):</strong> Absolute margin or volume deviation from peer benchmark.</li>
                  <li><strong className="text-slate-300">Feasibility (20%):</strong> Pricing & discount policies (High) vs structural expansion (Low).</li>
                  <li><strong className="text-slate-300">Urgency (10%):</strong> Negative profits and severe margin gaps trigger immediate high urgency.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Close Methodology
          </button>
        </div>
      </div>
    </div>
  );
};
