// MCP Context Block
/*
role: frontend-developer,
tier: Pro,
file: "modules/narrativeDashboard/components/SmartRevisionEngine.tsx",
allowedActions: ["scaffold", "revise", "preview"],
theme: "revision_ai"
*/

import React, { useEffect, useState, useRef } from 'react';
import type { OptimizationSuggestion } from '../../emotionArc/types/emotionTypes';
import { proposeEdit, SceneRevision } from '../services/revisionEngine';
import { diffHighlighter, DiffSegment } from '../utils/diffHighlighter';
import RevisionHistoryPanel from './RevisionHistoryPanel';

// Mock getSceneText (replace with real API/store)
async function getSceneText(sceneId: string): Promise<string> {
  if (!sceneId) return '';
  return `This is the original text of scene ${sceneId}.`;
}

interface StyleImpactMeta {
  driftFlags: string[];
  recommendations: string[];
  summary: string;
  fromTone?: string;
  toTone?: string;
  fromVoice?: string;
  toVoice?: string;
  fromPacing?: number;
  toPacing?: number;
}

interface ThemeImpactMeta {
  driftThemes: string[];
  themeSuggestions: string[];
  explanation: string;
}

// Mock style analysis for now
async function getStyleImpact(
  sceneId: string,
  genre: string
): Promise<StyleImpactMeta> {
  if (!sceneId || !genre) {
    return {
      driftFlags: [],
      recommendations: [],
      summary: 'No style analysis available.',
    };
  }

  // Use static values for demo
  if (sceneId === 'scene1') {
    return {
      driftFlags: ['tone is neutral, expected dark'],
      recommendations: ['Adjust tone toward dark.'],
      summary: `Tone shifted from 'neutral' → 'dark'`,
      fromTone: 'neutral',
      toTone: 'dark',
      fromVoice: 'omniscient',
      toVoice: 'intimate',
      fromPacing: 0.5,
      toPacing: 0.4,
    };
  }
  if (sceneId === 'scene2') {
    return {
      driftFlags: [],
      recommendations: [],
      summary: 'No style drift detected.',
      fromTone: 'warm',
      toTone: 'warm',
      fromVoice: 'casual',
      toVoice: 'casual',
      fromPacing: 0.7,
      toPacing: 0.7,
    };
  }
  if (sceneId === 'scene3') {
    return {
      driftFlags: ['pacing too fast', 'emotion density high'],
      recommendations: [
        'Add description or slow scene transitions.',
        'Balance emotional content.',
      ],
      summary: `Pacing tightened to match target range`,
      fromTone: 'tense',
      toTone: 'tense',
      fromVoice: 'intimate',
      toVoice: 'intimate',
      fromPacing: 0.95,
      toPacing: 0.8,
    };
  }
  return {
    driftFlags: [],
    recommendations: [],
    summary: 'No style drift detected.',
  };
}

// Mock theme analysis for now
async function getThemeImpact(
  sceneId: string,
  sceneText: string
): Promise<ThemeImpactMeta> {
  if (!sceneId || !sceneText) {
    return {
      driftThemes: [],
      themeSuggestions: [],
      explanation: 'No theme analysis available.',
    };
  }

  // Simulate a misalignment for scene1, aligned for others
  if (sceneId === 'scene1') {
    return {
      driftThemes: ['loyalty'],
      themeSuggestions: ['Reinforce loyalty theme in this scene.'],
      explanation:
        'Scene lacks loyalty theme despite being midpoint of trust arc.',
    };
  }
  return {
    driftThemes: [],
    themeSuggestions: [],
    explanation: 'No theme drift detected.',
  };
}

interface SceneRevisionWithMeta extends SceneRevision {
  originalText: string;
  timestamp: number;
  styleImpact?: string;
  styleSource?: string;
  themeImpact?: string;
  themeSource?: string;
  themeTag?: string;
}

const FILTERS = [
  { key: 'all', label: 'All Changes' },
  { key: 'emotion', label: 'Emotion-based' },
  { key: 'style', label: 'Style-based' },
  { key: 'theme', label: 'Theme-based' },
] as const;
type FilterKey = (typeof FILTERS)[number]['key'];

interface SmartRevisionEngineProps {
  sceneId: string;
  suggestion?: OptimizationSuggestion;
}

const SmartRevisionEngine: React.FC<SmartRevisionEngineProps> = ({
  sceneId,
  suggestion,
}) => {
  const [original, setOriginal] = useState<string>('');
  const [revision, setRevision] = useState<SceneRevision | null>(null);
  const [diff, setDiff] = useState<DiffSegment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<SceneRevisionWithMeta[]>([]);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editableText, setEditableText] = useState<string>('');
  const [liveMsg, setLiveMsg] = useState<string>('');
  const [styleImpact, setStyleImpact] = useState<StyleImpactMeta | null>(null);
  const [themeImpact, setThemeImpact] = useState<ThemeImpactMeta | null>(null);
  const liveRegionRef = useRef<HTMLDivElement>(null);
  const [diffFilter, setDiffFilter] = useState<FilterKey>('all');

  // Fetch style impact on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!sceneId) return;
      const genre = 'YA'; // or use a mapping
      const impact = await getStyleImpact(sceneId, genre);
      if (!cancelled) setStyleImpact(impact);
    })();
    return () => {
      cancelled = true;
    };
  }, [sceneId]);

  // Fetch theme impact on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!sceneId) return;
      const orig = await getSceneText(sceneId);
      const impact = await getThemeImpact(sceneId, orig);
      if (!cancelled) setThemeImpact(impact);
    })();
    return () => {
      cancelled = true;
    };
  }, [sceneId]);

  // Fetch original and revised text
  useEffect(() => {
    let cancelled = false;
    if (!sceneId || !suggestion) return;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const orig = await getSceneText(sceneId);
        if (cancelled) return;
        setOriginal(orig);
        // Merge top style recommendations into suggestion for proposeEdit
        let mergedSuggestion = suggestion;
        if (
          styleImpact &&
          Array.isArray(styleImpact.recommendations) &&
          styleImpact.recommendations.length > 0
        ) {
          mergedSuggestion = {
            ...suggestion,
            specificChanges: [
              ...(Array.isArray(suggestion.specificChanges)
                ? suggestion.specificChanges
                : []),
              ...styleImpact.recommendations.slice(0, 2),
            ],
          };
        }
        if (
          themeImpact &&
          Array.isArray(themeImpact.themeSuggestions) &&
          themeImpact.themeSuggestions.length > 0
        ) {
          mergedSuggestion = {
            ...mergedSuggestion,
            specificChanges: [
              ...(Array.isArray(mergedSuggestion.specificChanges)
                ? mergedSuggestion.specificChanges
                : []),
              ...themeImpact.themeSuggestions.slice(0, 2),
            ],
          };
        }
        const rev = await proposeEdit(sceneId, mergedSuggestion);
        if (cancelled) return;
        // Tag revision with style meta
        const styleMeta = styleImpact
          ? {
              styleImpact: styleImpact.summary,
              styleSource:
                Array.isArray(styleImpact.driftFlags) &&
                styleImpact.driftFlags.length > 0
                  ? 'style'
                  : 'structure',
            }
          : {};
        const themeMeta =
          themeImpact &&
          Array.isArray(themeImpact.driftThemes) &&
          themeImpact.driftThemes.length > 0
            ? { themeImpact: themeImpact.explanation, themeSource: 'theme' }
            : {};
        setRevision({ ...rev, ...styleMeta, ...themeMeta });
        setEditableText(rev.revisedText);
        setHistory([
          {
            ...rev,
            originalText: orig,
            timestamp: Date.now(),
            styleImpact: styleMeta.styleImpact,
            styleSource: styleMeta.styleSource,
            themeImpact: themeMeta.themeImpact,
            themeSource: themeMeta.themeSource,
            themeTag:
              Array.isArray(themeImpact?.driftThemes) &&
              themeImpact.driftThemes.length > 0
                ? themeImpact.driftThemes[0]
                : undefined,
          },
        ]);
        setLiveMsg(
          `AI revision ready. Confidence: ${(rev.confidenceScore * 100).toFixed(0)}%.`
        );
      } catch (e: unknown) {
        const errorMessage =
          e instanceof Error ? e.message : 'Failed to load revision.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sceneId, suggestion, styleImpact, themeImpact]);

  // Generate diff when original and revision are available
  useEffect(() => {
    if (original && revision) {
      // If themeImpact present, pass themeTag/explanation to diffHighlighter
      let themeTag: string | undefined;
      let themeExplanation: string | undefined;

      if (
        themeImpact &&
        Array.isArray(themeImpact.driftThemes) &&
        themeImpact.driftThemes.length > 0
      ) {
        themeTag = themeImpact.driftThemes[0];
      }
      if (
        themeImpact &&
        Array.isArray(themeImpact.themeSuggestions) &&
        themeImpact.themeSuggestions.length > 0
      ) {
        themeExplanation = themeImpact.themeSuggestions[0];
      }

      setDiff(
        diffHighlighter(
          original,
          revision.revisedText,
          themeTag ? { themeTag, themeExplanation } : undefined
        )
      );
    }
  }, [original, revision, themeImpact]);

  const handleAccept = (): void => {
    if (!revision) return;
    setHistory(hist => [
      ...hist,
      { ...revision, originalText: original, timestamp: Date.now() },
    ]);
    setLiveMsg('Revision accepted and applied.');
  };

  const handleEdit = (): void => {
    if (!revision) return;
    setEditMode(true);
    setEditableText(revision.revisedText);
  };

  const handleEditSave = (): void => {
    if (!revision) return;
    setRevision({ ...revision, revisedText: editableText });
    setEditMode(false);
    setLiveMsg('Revision edited and saved.');
  };

  const handleEditCancel = (): void => {
    if (!revision) return;
    setEditableText(revision.revisedText);
    setEditMode(false);
  };

  const handleDismiss = (): void => {
    setRevision(null);
    setDiff([]);
    setLiveMsg('Revision dismissed.');
  };

  const handleUndo = (rev: SceneRevision): void => {
    if (!rev) return;
    setHistory(hist => hist.filter(h => h.timestamp !== rev.timestamp));
    setLiveMsg('Revision undone.');
  };

  const handleRetry = async (rev: SceneRevision): Promise<void> => {
    if (!rev || !suggestion) return;
    setLoading(true);
    try {
      const newRev = await proposeEdit(sceneId, suggestion);
      setRevision(newRev);
      setHistory(hist => [
        ...hist,
        { ...newRev, originalText: original, timestamp: Date.now() },
      ]);
      setLiveMsg('AI revision retried.');
    } catch (e: unknown) {
      const errorMessage =
        e instanceof Error ? e.message : 'Failed to retry revision.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!sceneId) {
    return (
      <div className="text-center text-gray-500">
        No scene selected for revision.
      </div>
    );
  }

  return (
    <section
      className="w-full max-w-4xl mx-auto bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6"
      aria-label="Smart Revision Engine"
    >
      <div
        ref={liveRegionRef}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      >
        {liveMsg}
      </div>

      <header className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">AI Revision Engine</h2>
        <div className="flex gap-2">
          {revision && (
            <>
              <button
                onClick={handleAccept}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:ring-2 focus:ring-green-400"
              >
                Accept
              </button>
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:ring-2 focus:ring-blue-400"
              >
                Edit
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:ring-2 focus:ring-gray-400"
              >
                Dismiss
              </button>
            </>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex-1" aria-label="Original Scene Text">
          <h3 className="font-semibold mb-1">Original Scene</h3>
          <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded border border-gray-200 dark:border-zinc-700 text-sm whitespace-pre-line">
            {original || 'Loading original text...'}
          </div>
        </div>

        <div className="flex-1" aria-label="AI-Revised Scene Text">
          <h3 className="font-semibold mb-1">AI Revision</h3>
          {loading ? (
            <div className="text-center text-blue-600 dark:text-blue-300">
              Loading revision...
            </div>
          ) : error ? (
            <div
              className="text-center text-red-600 dark:text-red-400"
              role="alert"
            >
              {error}
            </div>
          ) : revision ? (
            <>
              <div
                className="p-3 bg-green-50 dark:bg-green-900/30 rounded border border-green-200 dark:border-green-700 text-sm whitespace-pre-line"
                role="region"
                aria-label="AI revision diff"
              >
                <div
                  className="flex gap-2 mb-2"
                  role="tablist"
                  aria-label="Diff Filter"
                >
                  {FILTERS.map(f => (
                    <button
                      key={f.key}
                      className={`px-2 py-1 text-xs rounded ${
                        diffFilter === f.key
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                      onClick={() => setDiffFilter(f.key)}
                      aria-pressed={diffFilter === f.key}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
                {diff
                  .filter(seg => {
                    if (diffFilter === 'all') return seg.type !== 'unchanged';
                    if (diffFilter === 'emotion')
                      return seg.semanticTag === 'emotion';
                    if (diffFilter === 'style')
                      return (
                        seg.semanticTag === 'structure' ||
                        seg.semanticTag === 'pacing'
                      );
                    if (diffFilter === 'theme')
                      return seg.semanticTag === 'theme';
                    return true;
                  })
                  .map((seg, idx) => (
                    <span
                      key={idx}
                      className={
                        seg.type === 'unchanged'
                          ? ''
                          : seg.semanticTag === 'theme'
                            ? 'bg-blue-200 dark:bg-blue-700/40 px-0.5 rounded border border-blue-400 dark:border-blue-600 font-semibold text-blue-900 dark:text-blue-100'
                            : seg.type === 'added'
                              ? 'bg-green-200 dark:bg-green-700/40 px-0.5 rounded'
                              : seg.type === 'removed'
                                ? 'bg-red-200 dark:bg-red-700/40 px-0.5 rounded line-through'
                                : seg.type === 'modified'
                                  ? 'bg-yellow-100 dark:bg-yellow-900/40 px-0.5 rounded'
                                  : ''
                      }
                      aria-label={
                        seg.semanticTag === 'theme'
                          ? `Theme-based addition: ${seg.themeTag || ''}`
                          : seg.type !== 'unchanged'
                            ? seg.type
                            : undefined
                      }
                      title={
                        seg.semanticTag === 'theme'
                          ? `Theme reinforcement: ${seg.themeExplanation || ''}`
                          : undefined
                      }
                    >
                      {seg.semanticTag === 'theme' && (
                        <span role="img" aria-label="Theme Reinforcement">
                          📘
                        </span>
                      )}
                      {seg.text}
                    </span>
                  ))}
              </div>
              {styleImpact && (
                <div
                  className="mt-2 text-xs text-purple-700 dark:text-purple-300"
                  aria-live="polite"
                >
                  <span className="font-semibold">Style Impact:</span>{' '}
                  {styleImpact.summary}
                  {Array.isArray(styleImpact.driftFlags) &&
                    styleImpact.driftFlags.length > 0 && (
                      <ul className="list-disc list-inside mt-1">
                        {styleImpact.driftFlags.map((flag, i) => (
                          <li key={i}>{flag}</li>
                        ))}
                      </ul>
                    )}
                  {Array.isArray(styleImpact.recommendations) &&
                    styleImpact.recommendations.length > 0 && (
                      <ul className="list-disc list-inside mt-1">
                        {styleImpact.recommendations.map((rec, i) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    )}
                </div>
              )}
              {themeImpact && (
                <div
                  className="mt-2 text-xs text-indigo-700 dark:text-indigo-300"
                  aria-live="polite"
                >
                  <span className="font-semibold">Theme Impact:</span>{' '}
                  {themeImpact.explanation}
                  {Array.isArray(themeImpact.driftThemes) &&
                    themeImpact.driftThemes.length > 0 && (
                      <ul className="list-disc list-inside mt-1">
                        {themeImpact.driftThemes.map((theme, i) => (
                          <li key={i}>Drift: {theme}</li>
                        ))}
                      </ul>
                    )}
                  {Array.isArray(themeImpact.themeSuggestions) &&
                    themeImpact.themeSuggestions.length > 0 && (
                      <ul className="list-disc list-inside mt-1">
                        {themeImpact.themeSuggestions.map((rec, i) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-zinc-500 dark:text-zinc-400">
              No revision to display.
            </div>
          )}
        </div>
      </div>

      {/* Revision History */}
      {Array.isArray(history) && history.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold mb-3">Revision History</h3>
          <RevisionHistoryPanel
            revisions={history}
            sceneId={sceneId}
            onUndo={handleUndo}
            onRetry={handleRetry}
          />
        </div>
      )}

      {/* Edit Mode */}
      {editMode && revision && (
        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-700">
          <h3 className="font-semibold mb-2">Edit Revision</h3>
          <textarea
            value={editableText}
            onChange={e => setEditableText(e.target.value)}
            className="w-full h-32 p-2 border rounded resize-none"
            aria-label="Edit revision text"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleEditSave}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Save
            </button>
            <button
              onClick={handleEditCancel}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Summary */}
      {revision && (
        <div className="flex flex-col md:flex-row gap-4 mt-4 items-start">
          <div className="flex-1 flex flex-col gap-2">
            <div
              className="text-xs text-zinc-500 dark:text-zinc-400"
              aria-live="polite"
            >
              <span className="font-semibold">Summary:</span>{' '}
              {Array.isArray(revision.changeSummary)
                ? revision.changeSummary.join('; ')
                : ''}
            </div>
            <div className="text-xs text-green-700 dark:text-green-200">
              <span className="font-semibold">Confidence:</span>{' '}
              {(revision.confidenceScore * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-blue-700 dark:text-blue-200">
              <span className="font-semibold">Applied Suggestion:</span>{' '}
              {suggestion?.title ?? 'Unknown'}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default SmartRevisionEngine;
