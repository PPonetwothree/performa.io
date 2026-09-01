import React, { useState } from 'react';
import { FilterProvider } from './context/FilterContext';
import { Sidebar, PageTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { FilterBar } from './components/common/FilterBar';
import { UploadModal } from './components/common/UploadModal';
import { MethodologyDrawer } from './components/common/MethodologyDrawer';
import { OverviewPage } from './pages/OverviewPage';
import { DiagnosePage } from './pages/DiagnosePage';
import { ExplorePage } from './pages/ExplorePage';
import { OpportunitiesPage } from './pages/OpportunitiesPage';
import { ReportsPage } from './pages/ReportsPage';

export const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PageTab>('overview');
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isMethodologyOpen, setIsMethodologyOpen] = useState<boolean>(false);

  // Cross-page navigation state (e.g. from Overview/Explore into Diagnose)
  const [diagnoseParams, setDiagnoseParams] = useState<{
    dimension?: string;
    entityName?: string;
  }>({
    dimension: 'sub_category',
    entityName: 'Tables',
  });

  const handleNavigate = (tab: PageTab, state?: any) => {
    if (tab === 'diagnose' && state) {
      setDiagnoseParams({
        dimension: state.dimension,
        entityName: state.entityName,
      });
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenMethodology={() => setIsMethodologyOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <Header
          activeTab={activeTab}
          onOpenUpload={() => setIsUploadOpen(true)}
          onOpenMethodology={() => setIsMethodologyOpen(true)}
        />

        <FilterBar />

        <main className="flex-1 pb-16">
          {activeTab === 'overview' && (
            <OverviewPage onNavigate={handleNavigate} />
          )}

          {activeTab === 'diagnose' && (
            <DiagnosePage
              initialDimension={diagnoseParams.dimension}
              initialEntityName={diagnoseParams.entityName}
              onNavigate={handleNavigate}
              onOpenMethodology={() => setIsMethodologyOpen(true)}
            />
          )}

          {activeTab === 'explore' && (
            <ExplorePage onNavigate={handleNavigate} />
          )}

          {activeTab === 'opportunities' && (
            <OpportunitiesPage
              onNavigate={handleNavigate}
              onOpenMethodology={() => setIsMethodologyOpen(true)}
            />
          )}

          {activeTab === 'reports' && <ReportsPage />}
        </main>
      </div>

      {/* Upload CSV Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />

      {/* Diagnostic Methodology Drawer */}
      <MethodologyDrawer
        isOpen={isMethodologyOpen}
        onClose={() => setIsMethodologyOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <FilterProvider>
      <AppContent />
    </FilterProvider>
  );
}
