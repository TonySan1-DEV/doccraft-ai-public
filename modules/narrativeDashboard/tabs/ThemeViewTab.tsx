// MCP Context Block
/*
role: frontend-developer,
tier: Pro,
file: "modules/narrativeDashboard/tabs/ThemeViewTab.tsx",
allowedActions: ["scaffold", "visualize", "align"],
theme: "theme_analysis"
*/

import React, { useState, Suspense } from 'react';
import { useNarrativeSync } from '../../shared/state/useNarrativeSyncContext';
import ThemeMatrixPanel from '../../../modules/themeAnalysis/components/ThemeMatrixPanel';

const NarrativeOverlaySelector = React.lazy(
  () => import('../NarrativeOverlaySelector')
);
const SceneInspectorPanel = React.lazy(
  () => import('../components/SceneInspectorPanel')
);

// Mock data for now
const mockScenes = [
  {
    sceneId: 'scene1',
    themes: [
      { theme: 'identity', strength: 0.8, context: 'Who am I?' },
      { theme: 'belonging', strength: 0.5, context: 'I want to fit in.' },
    ],
  },
  {
    sceneId: 'scene2',
    themes: [{ theme: 'betrayal', strength: 0.7, context: 'He lied to me.' }],
  },
  {
    sceneId: 'scene3',
    themes: [
      {
        theme: 'love',
        strength: 0.9,
        context: 'I can’t stop thinking about her.',
      },
    ],
  },
];
const mockThemes = ['identity', 'belonging', 'betrayal', 'love'];

const ThemeViewTab: React.FC = () => {
  const narrativeSync = useNarrativeSync();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'matrix' | 'coverage'
  >('matrix');

  return (
    <section
      className="w-full flex flex-col md:flex-row gap-6 max-w-6xl mx-auto"
      aria-label="Theme View Tab"
    >
      <div className="flex-1 flex flex-col gap-4">
        <nav className="flex gap-2 mb-2" aria-label="Theme Tabs">
          <button
            id="tab-overview"
            className={`px-3 py-1 rounded ${activeTab === 'overview' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setActiveTab('overview')}
            tabIndex={activeTab === 'overview' ? 0 : -1}
          >
            Overview
          </button>
          <button
            id="tab-matrix"
            className={`px-3 py-1 rounded ${activeTab === 'matrix' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setActiveTab('matrix')}
            tabIndex={activeTab === 'matrix' ? 0 : -1}
          >
            Scene Matrix
          </button>
          <button
            id="tab-coverage"
            className={`px-3 py-1 rounded ${activeTab === 'coverage' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setActiveTab('coverage')}
            tabIndex={activeTab === 'coverage' ? 0 : -1}
          >
            Theme Coverage
          </button>
        </nav>
        <div
          className="mt-2"
        >
          {activeTab === 'matrix' && (
            <ThemeMatrixPanel scenes={mockScenes} themes={mockThemes} />
          )}
          {/* Future: Overview and Coverage panels */}
        </div>
        <Suspense
          fallback={
            <div className="text-center text-blue-600">Loading overlays...</div>
          }
        >
          <NarrativeOverlaySelector />
        </Suspense>
      </div>
      <aside
        className="w-full md:w-80 flex flex-col gap-4"
        aria-label="Scene Metadata Panel"
      >
        <Suspense
          fallback={
            <div className="text-center text-blue-600">
              Loading scene inspector...
            </div>
          }
        >
          <SceneInspectorPanel
            narrativeSync={{
              currentSceneId: narrativeSync.state.currentSceneId || undefined,
            }}
          />
        </Suspense>
      </aside>
    </section>
  );
};

export default ThemeViewTab;
