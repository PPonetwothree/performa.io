import React from 'react';
import {
  LayoutDashboard,
  Stethoscope,
  Compass,
  Target,
  FileText,
  TrendingUp,
  HelpCircle,
} from 'lucide-react';

export type PageTab = 'overview' | 'diagnose' | 'explore' | 'opportunities' | 'reports';

interface SidebarProps {
  activeTab: PageTab;
  onSelectTab: (tab: PageTab) => void;
  onOpenMethodology: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onOpenMethodology,
}) => {
  const navItems = [
    {
      id: 'overview' as PageTab,
      label: 'Executive Overview',
      subtitle: 'KPIs, trends & portfolio health',
      icon: LayoutDashboard,
    },
    {
      id: 'diagnose' as PageTab,
      label: 'Diagnose',
      subtitle: 'Peer benchmarks & root causes',
      icon: Stethoscope,
    },
    {
      id: 'explore' as PageTab,
      label: 'Explore',
      subtitle: 'Pareto & granular drill-down',
      icon: Compass,
    },
    {
      id: 'opportunities' as PageTab,
      label: 'Opportunities',
      subtitle: 'Ranked high-impact interventions',
      icon: Target,
    },
    {
      id: 'reports' as PageTab,
      label: 'Executive Briefing',
      subtitle: 'Management summary & print export',
      icon: FileText,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900/90 border-r border-slate-800 flex flex-col justify-between shrink-0 h-screen sticky top-0 no-print">
      {/* Brand Header */}
      <div>
        <div className="px-5 py-5 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
              Performa<span className="text-emerald-400">.io</span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium tracking-wide uppercase">
              Performance, Diagnosed.
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 mt-2">
          <div className="px-3 py-1.5 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
            Intelligence Flow
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg flex items-start gap-3 transition-all ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-medium shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon
                  className={`w-4 h-4 mt-0.5 shrink-0 ${
                    isActive ? 'text-emerald-400' : 'text-slate-400'
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold leading-tight truncate">
                    {item.label}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate leading-tight mt-0.5">
                    {item.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Actions */}
      <div className="p-3 border-t border-slate-800/80 space-y-1.5">
        <button
          onClick={onOpenMethodology}
          className="w-full px-3 py-2 text-left rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 text-xs flex items-center gap-2 transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          <span>Diagnostic Methodology</span>
        </button>

        <div className="px-3 py-2 bg-slate-950/60 rounded-md border border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
          <span>Rule Engine v1.0</span>
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
        </div>
      </div>
    </aside>
  );
};
