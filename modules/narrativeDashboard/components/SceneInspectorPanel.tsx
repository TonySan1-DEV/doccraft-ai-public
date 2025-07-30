// MCP Context Block
/*
role: developer,
tier: Pro,
file: "modules/narrativeDashboard/components/SceneInspectorPanel.tsx",
allowedActions: ["connect", "suggest", "analyze"],
theme: "scene_inspection"
*/

import React, { useEffect, useState } from 'react';
// import { suggestionEngine } from '../../emotionArc/services/suggestionEngine';
// import type { OptimizationSuggestion } from '../../emotionArc/types/emotionTypes';

// Mock type for demonstration
export type OptimizationSuggestion = {
  id: string;
  message: string;
  severity: 'Low' | 'Medium' | 'High';
  impact: number; // 0-100
  action: string;
};

const mockFetchSuggestions = async (sceneId: string): Promise<OptimizationSuggestion[]> => {
  // Simulate async fetch
  await new Promise(res => setTimeout(res, 800));
  if (!sceneId) return [];
  return [
    {
      id: '1',
      message: 'Structural misalignment: Scene does not match expected plot beat.',
      severity: 'High',
      impact: 90,
      action: 'Reposition scene or adjust beat.'
    },
    {
      id: '2',
      message: 'Emotional pacing is flat; consider raising tension.',
      severity: 'Medium',
      impact: 65,
      action: 'Add a conflict or emotional reveal.'
    }
  ];
};

const severityColor = {
  High: 'bg-red-200 text-red-800',
  Medium: 'bg-yellow-200 text-yellow-800',
  Low: 'bg-green-200 text-green-800'
};

const SceneInspectorPanel: React.FC<{ narrativeSync: { currentSceneId?: string } }> = ({ narrativeSync }) => {
  const sceneId = narrativeSync.currentSceneId;
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [announce, setAnnounce] = useState('');

  useEffect(() => {
    let isMounted = true;
    if (!sceneId) {
      setSuggestions([]);
      setAnnounce('No scene selected.');
      return;
    }
    setLoading(true);
    setError(null);
    setAnnounce('Loading suggestions...');
    // Replace mockFetchSuggestions with suggestionEngine.generateSceneSuggestions(sceneId)
    mockFetchSuggestions(sceneId)
      .then(res => {
        if (isMounted) {
          setSuggestions(res);
          setAnnounce(res.length ? `${res.length} suggestions loaded.` : 'No suggestions for this scene.');
        }
      })
      .catch(() => {
        if (isMounted) {
          setError('Failed to load suggestions.');
          setAnnounce('Failed to load suggestions.');
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, [sceneId]);

  return (
    <section aria-label="Scene Inspector Panel" className="p-4 bg-gray-50 rounded shadow" aria-live="polite">
      <h3 className="text-base font-semibold mb-2">Scene Inspector</h3>
      <div className="sr-only" role="status">{announce}</div>
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="animate-spin inline-block w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full" />
          Loading suggestions...
        </div>
      ) : error ? (
        <div className="text-red-600 text-sm">{error}</div>
      ) : suggestions.length === 0 ? (
        <div className="text-gray-500 text-sm">No suggestions for this scene.</div>
      ) : (
        <ul className="space-y-3 mt-2">
          {suggestions.map(s => (
            <li key={s.id} className="p-2 bg-white rounded border border-gray-200">
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${severityColor[s.severity]}`}>{s.severity}</span>
                <span className="text-sm font-medium flex-1">{s.message}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-200 rounded">
                  <div
                    className={`h-2 rounded ${s.impact > 80 ? 'bg-red-400' : s.impact > 50 ? 'bg-yellow-400' : 'bg-green-400'}`}
                    style={{ width: `${s.impact}%` }}
                    aria-label={`Impact score: ${s.impact}`}
                  />
                </div>
                <span className="text-xs text-gray-600">Impact: {s.impact}</span>
              </div>
              <div className="mt-1 text-xs text-blue-700">Suggested action: {s.action}</div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default SceneInspectorPanel; 