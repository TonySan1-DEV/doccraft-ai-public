export const mcpContext = {
  file: 'modules/narrativeDashboard/tabs/OptimizationTab.tsx',
  role: 'developer',
  allowedActions: ['refactor', 'type-harden', 'test'],
  contentSensitivity: 'low',
  theme: 'doccraft-ai',
};

import React, { useEffect, useState, Suspense } from 'react';
import type { NarrativeSyncState } from '../../shared/state/useNarrativeSyncContext';
import type { OptimizationSuggestion } from '../../emotionArc/types/emotionTypes';
import NarrativeScoreSummary from '../NarrativeScoreSummary';
import SceneInspectorPanel from '../components/SceneInspectorPanel';
import NarrativeOverlaySelector from '../NarrativeOverlaySelector';

// Mock OptimizationSuggestions component
interface OptimizationSuggestionsProps {
  suggestions: OptimizationSuggestion[];
  onSelect: (sceneId: string) => void;
  onApply: (id: string) => void;
  onDismiss: (id: string) => void;
  selectedId?: string;
}

const OptimizationSuggestions: React.FC<OptimizationSuggestionsProps> = ({
  suggestions,
  onSelect,
  onApply,
  onDismiss,
  selectedId,
}) => (
  <ul className="space-y-3">
    {suggestions.map(s => (
      <li
        key={s.id}
        className={`p-3 rounded border ${selectedId === s.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}
      >
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`px-2 py-0.5 rounded text-xs font-bold ${s.impact === 'high' ? 'bg-red-200 text-red-800' : s.impact === 'medium' ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800'}`}
          >
            {s.impact === 'high'
              ? 'High'
              : s.impact === 'medium'
                ? 'Medium'
                : 'Low'}
          </span>
          <span className="text-sm font-medium flex-1">{s.message}</span>
          <button
            className="text-xs text-blue-700 underline"
            onClick={() => onSelect(s.id || '')}
          >
            Focus
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-gray-200 rounded">
            <div
              className={`h-2 rounded ${s.impact === 'high' ? 'bg-red-400' : s.impact === 'medium' ? 'bg-yellow-400' : 'bg-green-400'}`}
              style={{
                width: `${s.impact === 'high' ? '90%' : s.impact === 'medium' ? '60%' : '30%'}`,
              }}
              aria-label={`Impact level: ${s.impact}`}
            />
          </div>
          <span className="text-xs text-gray-600">Impact: {s.impact}</span>
        </div>
        <div className="mt-1 text-xs text-blue-700">
          Suggested action: {s.specificChanges?.join(', ') || s.message}
        </div>
        <div className="flex gap-2 mt-2">
          <button
            className="px-2 py-1 text-xs rounded bg-green-100 text-green-800"
            onClick={() => onApply(s.id || '')}
          >
            Apply
          </button>
          <button
            className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-800"
            onClick={() => onDismiss(s.id || '')}
          >
            Dismiss
          </button>
        </div>
      </li>
    ))}
  </ul>
);

const mockFetchOptimizationSuggestions = async (): Promise<
  OptimizationSuggestion[]
> => {
  await new Promise(res => setTimeout(res, 900));
  return [
    {
      id: '1',
      message: 'Climax scene lacks emotional payoff.',
      impact: 'high',
      difficulty: 'medium',
      category: 'tension',
      confidence: 85,
      specificChanges: ['Increase stakes', 'Add a twist'],
    },
    {
      id: '2',
      message: 'Character arc incomplete.',
      impact: 'high',
      difficulty: 'hard',
      category: 'empathy',
      confidence: 70,
      specificChanges: ['Add character development scene'],
    },
    {
      id: '3',
      message: 'Pacing too slow in Act II.',
      impact: 'medium',
      difficulty: 'easy',
      category: 'pacing',
      confidence: 80,
      specificChanges: ['Remove unnecessary scenes'],
    },
  ];
};

export interface OptimizationTabProps {
  narrativeSync?: NarrativeSyncState;
}

export const OptimizationTab: React.FC<OptimizationTabProps> = ({
  narrativeSync,
}) => {
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSceneId, setSelectedSceneId] = useState<string>('');
  const [announce, setAnnounce] = useState<string>('');

  useEffect(() => {
    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const data = await mockFetchOptimizationSuggestions();
        setSuggestions(data);
      } catch (error) {
        console.error('Failed to fetch optimization suggestions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, []);

  const handleSelect = (sceneId: string): void => setSelectedSceneId(sceneId);
  const handleApply = (id: string): void =>
    setAnnounce(`Suggestion ${id} applied.`);
  const handleDismiss = (id: string): void =>
    setAnnounce(`Suggestion ${id} dismissed.`);

  return (
    <section
      className="w-full h-full grid grid-cols-1 lg:grid-cols-4 gap-4"
      aria-label="Optimization Tab"
    >
      {/* Main optimization suggestions */}
      <div className="lg:col-span-3 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold" id="optimization-heading">
            Optimization Suggestions
          </h2>
          <Suspense fallback={<div>Loading overlays...</div>}>
            <NarrativeOverlaySelector />
          </Suspense>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-500">
              Loading optimization suggestions...
            </div>
          </div>
        ) : (
          <OptimizationSuggestions
            suggestions={suggestions}
            onSelect={handleSelect}
            onApply={handleApply}
            onDismiss={handleDismiss}
            selectedId={selectedSceneId}
          />
        )}

        {announce && (
          <div
            className="px-4 py-2 rounded bg-blue-100 text-blue-800 text-sm"
            role="status"
            aria-live="polite"
          >
            {announce}
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-1 flex flex-col gap-4">
        <SceneInspectorPanel narrativeSync={narrativeSync} />
        <NarrativeScoreSummary narrativeSync={narrativeSync} />
      </div>
    </section>
  );
};

export default OptimizationTab;
