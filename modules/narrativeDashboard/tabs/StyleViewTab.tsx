// MCP Context Block
/*
role: frontend-developer,
tier: Pro,
file: "modules/narrativeDashboard/tabs/StyleViewTab.tsx",
allowedActions: ["scaffold", "visualize", "compare"],
theme: "style_dashboard"
*/

import React, { Suspense, useState } from 'react';
import { useNarrativeSync } from '../../shared/state/useNarrativeSyncContext';
import { stylePresets } from '../../styleProfile/configs/stylePresets';

// Lazy load StyleProfilePanel
const StyleProfilePanel = React.lazy(() => import('../../styleProfile/components/StyleProfilePanel'));
const NarrativeOverlaySelector = React.lazy(() => import('../NarrativeOverlaySelector'));
const SceneInspectorPanel = React.lazy(() => import('../components/SceneInspectorPanel'));

const StyleViewTab: React.FC = () => {
  const narrativeSync = useNarrativeSync();
  const { currentSceneId, characterFocusId } = narrativeSync.state;
  const [selectedPreset, setSelectedPreset] = useState<string>('Noir');
  const [devMode, setDevMode] = useState(false);
  const [driftWarnings, setDriftWarnings] = useState<string[]>([]);

  // Handle drift warnings from StyleProfilePanel
  const handleDriftUpdate = (drift: string[]) => {
    setDriftWarnings(drift);
  };

  return (
    <section
      className="w-full flex flex-col md:flex-row gap-6 max-w-6xl mx-auto"
      aria-label="Style View Tab"
      tabIndex={-1}
    >
      {/* Main column: Style profile and overlays */}
      <div className="flex-1 flex flex-col gap-4">
        <Suspense fallback={<div className="text-center text-blue-600">Loading style panel...</div>}>
          <StyleProfilePanel
            sceneId={currentSceneId || 'scene1'}
            target={stylePresets[selectedPreset]}
          />
        </Suspense>
        <Suspense fallback={<div className="text-center text-blue-600">Loading overlays...</div>}>
          {/* NarrativeOverlaySelector does not accept props; render as-is */}
          <NarrativeOverlaySelector />
        </Suspense>
        {devMode && (
          <div className="mt-2 p-2 bg-zinc-100 dark:bg-zinc-800 rounded text-xs text-zinc-600 dark:text-zinc-300">
            <strong>Dev Debug:</strong> Raw style scores and sync state:<br />
            <pre>{JSON.stringify(narrativeSync, null, 2)}</pre>
          </div>
        )}
      </div>
      {/* Side column: Scene metadata and drift warnings */}
      <aside className="w-full md:w-80 flex flex-col gap-4" aria-label="Scene Metadata Panel">
        <Suspense fallback={<div className="text-center text-blue-600">Loading scene inspector...</div>}>
          <SceneInspectorPanel narrativeSync={{ currentSceneId: currentSceneId || undefined }} />
        </Suspense>
        <div className="mt-2" aria-live="polite">
          {driftWarnings.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {driftWarnings.map((w, i) => (
                <span key={i} className="px-2 py-1 rounded bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs font-semibold" role="status">{w}</span>
              ))}
            </div>
          ) : (
            <span className="px-2 py-1 rounded bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs">No drift detected</span>
          )}
        </div>
        <button
          className="mt-4 px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-xs text-gray-700 dark:text-gray-200"
          onClick={() => setDevMode(d => !d)}
          aria-pressed={devMode}
        >
          {devMode ? 'Hide Dev Debug' : 'Show Dev Debug'}
        </button>
      </aside>
    </section>
  );
};

export default StyleViewTab; 