// MCP Context Block
/*
role: developer,
tier: Pro,
file: "modules/narrativeDashboard/tabs/OptimizationTab.tsx",
allowedActions: ["scaffold", "summarize", "visualize"],
theme: "optimization"
*/

import React, { useEffect, useState, Suspense } from 'react';
import { useNarrativeSync } from '../../shared/state/useNarrativeSyncContext';
// import { suggestionEngine } from '../../emotionArc/services/suggestionEngine';
// import type { OptimizationSuggestion } from '../../emotionArc/types/emotionTypes';
import NarrativeScoreSummary from '../NarrativeScoreSummary';
import SceneInspectorPanel from '../components/SceneInspectorPanel';
import NarrativeOverlaySelector from '../NarrativeOverlaySelector';

// Mock OptimizationSuggestions component
const OptimizationSuggestions: React.FC<{
  suggestions: OptimizationSuggestion[];
  onSelect: (sceneId: string) => void;
  onApply: (id: string) => void;
  onDismiss: (id: string) => void;
  selectedId?: string;
}> = ({ suggestions, onSelect, onApply, onDismiss, selectedId }) => (
  <ul className="space-y-3">
    {suggestions.map(s => (
      <li key={s.id} className={`p-3 rounded border ${selectedId === s.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}> 
        <div className="flex items-center gap-2 mb-1">
          <span className={`px-2 py-0.5 rounded text-xs font-bold ${s.severity === 'High' ? 'bg-red-200 text-red-800' : s.severity === 'Medium' ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800'}`}>{s.severity}</span>
          <span className="text-sm font-medium flex-1">{s.message}</span>
          <button className="text-xs text-blue-700 underline" onClick={() => onSelect(s.targetSceneId)}>Focus</button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-gray-200 rounded">
            <div className={`h-2 rounded ${s.impact > 80 ? 'bg-red-400' : s.impact > 50 ? 'bg-yellow-400' : 'bg-green-400'}`}
              style={{ width: `${s.impact}%` }}
              aria-label={`Impact score: ${s.impact}`}
            />
          </div>
          <span className="text-xs text-gray-600">Impact: {s.impact}</span>
        </div>
        <div className="mt-1 text-xs text-blue-700">Suggested action: {s.action}</div>
        <div className="flex gap-2 mt-2">
          <button className="px-2 py-1 text-xs rounded bg-green-100 text-green-800" onClick={() => onApply(s.id)}>Apply</button>
          <button className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-800" onClick={() => onDismiss(s.id)}>Dismiss</button>
        </div>
      </li>
    ))}
  </ul>
);

// Mock type for demonstration
export type OptimizationSuggestion = {
  id: string;
  message: string;
  severity: 'Low' | 'Medium' | 'High';
  impact: number; // 0-100
  action: string;
  type: 'structure' | 'emotion' | 'character';
  targetSceneId: string;
};

const mockFetchOptimizationSuggestions = async (): Promise<OptimizationSuggestion[]> => {
  await new Promise(res => setTimeout(res, 900));
  return [
    {
      id: '1',
      message: 'Climax scene lacks emotional payoff.',
      severity: 'High',
      impact: 95,
      action: 'Increase stakes or add a twist.',
      type: 'emotion',
      targetSceneId: 'scene5'
    },
    {
      id: '2',
      message: 'Protagonist arc incomplete in Act III.',
      severity: 'Medium',
      impact: 70,
      action: 'Add a resolution scene for the protagonist.',
      type: 'character',
      targetSceneId: 'scene7'
    },
    {
      id: '3',
      message: 'Pacing is uneven in Act II.',
      severity: 'Low',
      impact: 40,
      action: 'Trim or combine slow scenes.',
      type: 'structure',
      targetSceneId: 'scene3'
    }
  ];
};

export const OptimizationTab: React.FC<{ narrativeSync: ReturnType<typeof useNarrativeSync> }> = ({ narrativeSync }) => {
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSceneId, setSelectedSceneId] = useState<string | undefined>(narrativeSync.currentSceneId);
  const [announce, setAnnounce] = useState('');
  const [filter, setFilter] = useState<'all' | 'structure' | 'emotion' | 'character'>('all');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    setAnnounce('Loading optimization suggestions...');
    // Replace with suggestionEngine.generateOptimizationSuggestions()
    mockFetchOptimizationSuggestions()
      .then(res => {
        if (isMounted) {
          setSuggestions(res);
          setAnnounce(`${res.length} suggestions loaded.`);
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
  }, []);

  // Filtering and sorting
  const filtered = suggestions
    .filter(s => filter === 'all' || s.type === filter)
    .sort((a, b) => b.impact - a.impact || (b.severity > a.severity ? 1 : -1));

  // Handlers
  const handleSelect = (sceneId: string) => setSelectedSceneId(sceneId);
  const handleApply = (id: string) => setAnnounce(`Suggestion ${id} applied.`);
  const handleDismiss = (id: string) => setAnnounce(`Suggestion ${id} dismissed.`);

  return (
    <section className="w-full h-full grid grid-cols-1 lg:grid-cols-4 gap-4" aria-label="Optimization Tab" aria-live="polite">
      <div className="lg:col-span-3 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold" id="optimization-heading">Optimization Suggestions</h2>
          <NarrativeOverlaySelector />
          <div className="flex gap-2 ml-4">
            <button className={`px-2 py-1 rounded text-xs ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`} onClick={() => setFilter('all')}>All</button>
            <button className={`px-2 py-1 rounded text-xs ${filter === 'structure' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`} onClick={() => setFilter('structure')}>Structure</button>
            <button className={`px-2 py-1 rounded text-xs ${filter === 'emotion' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`} onClick={() => setFilter('emotion')}>Emotion</button>
            <button className={`px-2 py-1 rounded text-xs ${filter === 'character' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`} onClick={() => setFilter('character')}>Character</button>
          </div>
        </div>
        <div className="sr-only" role="status">{announce}</div>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="animate-spin inline-block w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full" />
            Loading suggestions...
          </div>
        ) : error ? (
          <div className="text-red-600 text-sm">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="text-gray-500 text-sm">No optimization suggestions found.</div>
        ) : (
          <OptimizationSuggestions
            suggestions={filtered}
            onSelect={handleSelect}
            onApply={handleApply}
            onDismiss={handleDismiss}
            selectedId={selectedSceneId}
          />
        )}
        <Suspense fallback={<div>Loading narrative score...</div>}>
          <NarrativeScoreSummary narrativeSync={narrativeSync} />
        </Suspense>
      </div>
      <aside className="lg:col-span-1 flex flex-col gap-4" aria-label="Scene Inspector">
        <Suspense fallback={<div>Loading scene inspector..."></div>}>
          <SceneInspectorPanel narrativeSync={{ ...narrativeSync, currentSceneId: selectedSceneId }} />
        </Suspense>
      </aside>
    </section>
  );
};

export default OptimizationTab; 