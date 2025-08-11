export const mcpContext = {
  file: 'modules/narrativeDashboard/NarrativeCalibrationDashboard.tsx',
  role: 'developer',
  allowedActions: ['refactor', 'type-harden', 'test'],
  contentSensitivity: 'low',
  theme: 'doccraft-ai',
};

import React, { Suspense, lazy, useState } from 'react';
import { useNarrativeSync } from '../shared/state/useNarrativeSyncContext';
import ExportNarrativeInsights from './components/ExportNarrativeInsights';

// Lazy-load tab components for performance
const PlotViewTab = lazy(() => import('./tabs/PlotViewTab'));
const EmotionViewTab = lazy(() => import('./tabs/EmotionViewTab'));
const CharacterViewTab = lazy(() => import('./tabs/CharacterViewTab'));
const OptimizationTab = lazy(() => import('./tabs/OptimizationTab'));

// Core dashboard controls (placeholders for now)
const SceneInspectorPanel = lazy(() => import('./SceneInspectorPanel'));
const NarrativeScoreSummary = lazy(() => import('./NarrativeScoreSummary'));
const NarrativeOverlaySelector = lazy(
  () => import('./NarrativeOverlaySelector')
);

interface TabConfig {
  id: 'plot' | 'emotion' | 'character' | 'optimization';
  label: string;
  Component: React.LazyExoticComponent<React.ComponentType<any>>;
}

const TAB_CONFIG: TabConfig[] = [
  { id: 'plot', label: 'Plot View', Component: PlotViewTab },
  { id: 'emotion', label: 'Emotion View', Component: EmotionViewTab },
  { id: 'character', label: 'Character View', Component: CharacterViewTab },
  { id: 'optimization', label: 'Optimization', Component: OptimizationTab },
];

export interface NarrativeCalibrationDashboardProps {
  initialTab?: TabConfig['id'];
  showExportControls?: boolean;
  showSceneInspector?: boolean;
  showScoreSummary?: boolean;
}

export const NarrativeCalibrationDashboard: React.FC<
  NarrativeCalibrationDashboardProps
> = ({
  initialTab = 'plot',
  showExportControls = true,
  showSceneInspector = true,
  showScoreSummary = true,
}) => {
  const [activeTab, setActiveTab] = useState<TabConfig['id']>(initialTab);
  const narrativeSync = useNarrativeSync();
  const narrativeSyncState = narrativeSync.state;

  const currentTab =
    TAB_CONFIG.find(tab => tab.id === activeTab) ?? TAB_CONFIG[0];

  return (
    <main
      aria-label="Narrative Calibration Dashboard"
      className="w-full h-full flex flex-col bg-white dark:bg-neutral-900"
    >
      {/* Overlay selector and export controls */}
      {showExportControls && (
        <div className="flex flex-wrap items-center justify-between gap-2 p-2 border-b bg-neutral-50 dark:bg-neutral-800">
          <Suspense fallback={<div>Loading overlays...</div>}>
            <NarrativeOverlaySelector />
          </Suspense>
        </div>
      )}
      {/* Accessible Tabs */}
      <nav aria-label="Dashboard Views" className="flex border-b mb-2">
        {TAB_CONFIG.map(tab => (
          <button
            key={tab.id}
            aria-controls={`tab-panel-${tab.id}`}
            id={`tab-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            className={`px-4 py-2 focus:outline-none ${activeTab === tab.id ? 'border-b-2 border-blue-600 font-bold' : 'text-gray-600'}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      {/* Tab Panels */}
      <section
        className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 p-4"
        aria-live="polite"
      >
        <div className="md:col-span-2" id={`tab-panel-${activeTab}`}>
          <Suspense fallback={<div>Loading view...</div>}>
            {currentTab &&
              React.createElement(currentTab.Component, {
                narrativeSync: narrativeSyncState,
              })}
          </Suspense>
        </div>
        <aside
          className="md:col-span-1 flex flex-col gap-4"
          aria-label="Scene Inspector and Score"
        >
          {showSceneInspector && (
            <Suspense fallback={<div>Loading scene inspector...</div>}>
              <SceneInspectorPanel narrativeSync={narrativeSyncState} />
            </Suspense>
          )}
          {showScoreSummary && (
            <Suspense fallback={<div>Loading score summary...</div>}>
              <NarrativeScoreSummary narrativeSync={narrativeSyncState} />
            </Suspense>
          )}
        </aside>
      </section>
      {/* Floating Export Action Bar */}
      {showExportControls && (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
          <div className="bg-white dark:bg-neutral-900 shadow-lg rounded-lg p-3 border border-gray-200 flex items-center">
            <ExportNarrativeInsights />
          </div>
        </div>
      )}
    </main>
  );
};

export default NarrativeCalibrationDashboard;
