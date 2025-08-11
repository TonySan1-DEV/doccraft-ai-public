export const mcpContext = {
  file: 'modules/narrativeDashboard/SceneInspectorPanel.tsx',
  role: 'developer',
  allowedActions: ['refactor', 'type-harden', 'test'],
  contentSensitivity: 'low',
  theme: 'doccraft-ai',
};

import React from 'react';
import type { NarrativeSyncState } from '../shared/state/useNarrativeSyncContext';

export interface SceneInspectorPanelProps {
  narrativeSync?: NarrativeSyncState;
  showMetadata?: boolean;
  showEmotionalData?: boolean;
  showStructuralData?: boolean;
}

const SceneInspectorPanel: React.FC<SceneInspectorPanelProps> = ({
  narrativeSync,
  showMetadata = true,
  showEmotionalData = true,
  showStructuralData = true,
}) => (
  <section
    aria-label="Scene Inspector Panel"
    className="p-4 bg-gray-50 rounded shadow"
  >
    <h3 className="text-base font-semibold mb-2">Scene Inspector</h3>
    {narrativeSync ? (
      <div className="space-y-2 text-xs">
        {showMetadata && (
          <div>
            <div className="font-medium text-gray-700">Current Scene:</div>
            <div className="text-gray-500">
              {narrativeSync.currentSceneId || 'None selected'}
            </div>
          </div>
        )}
        {showStructuralData && (
          <div>
            <div className="font-medium text-gray-700">Active Framework:</div>
            <div className="text-gray-500">
              {narrativeSync.activePlotFramework || 'None selected'}
            </div>
          </div>
        )}
        {showEmotionalData && (
          <div>
            <div className="font-medium text-gray-700">Sync Status:</div>
            <div
              className={`font-medium ${narrativeSync.syncEnabled ? 'text-green-600' : 'text-red-600'}`}
            >
              {narrativeSync.syncEnabled ? 'Enabled' : 'Disabled'}
            </div>
          </div>
        )}
      </div>
    ) : (
      <div className="text-xs text-gray-500">
        [Scene metadata and emotional/structural info will appear here]
      </div>
    )}
  </section>
);

export default SceneInspectorPanel;
