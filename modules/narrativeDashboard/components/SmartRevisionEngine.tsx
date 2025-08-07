// MCP Context Block
/*
role: frontend-developer,
tier: Pro,
file: "modules/narrativeDashboard/components/SmartRevisionEngine.tsx",
allowedActions: ["scaffold", "revise", "preview"],
theme: "revision_ai"
*/

import React, { useEffect, useState, useRef } from 'react';
import { useNarrativeSync } from '../../shared/state/useNarrativeSyncContext';
import type { OptimizationSuggestion } from '../../emotionArc/types/emotionTypes';
import { proposeEdit, SceneRevision } from '../services/revisionEngine';
import { diffHighlighter, DiffSegment } from '../utils/diffHighlighter';
import RevisionHistoryPanel from './RevisionHistoryPanel';
import { analyzeNarrativeStyle, compareToTargetStyle } from '../../styleProfile/services/styleProfiler';
import { stylePresets } from '../../styleProfile/configs/stylePresets';
import { analyzeThemeConsistency, ThemeAlignmentReport } from '../../themeAnalysis/initThemeEngine';

// Mock getSceneText (replace with real API/store)
async function getSceneText(sceneId: string): Promise<string> {
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
async function getStyleImpact(sceneId: string, genre: string): Promise<StyleImpactMeta> {
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
      toPacing: 0.4
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
      toPacing: 0.7
    };
  }
  if (sceneId === 'scene3') {
    return {
      driftFlags: ['pacing too fast', 'emotion density high'],
      recommendations: ['Add description or slow scene transitions.', 'Balance emotional content.'],
      summary: `Pacing tightened to match target range`,
      fromTone: 'tense',
      toTone: 'tense',
      fromVoice: 'intimate',
      toVoice: 'intimate',
      fromPacing: 0.95,
      toPacing: 0.8
    };
  }
  return {
    driftFlags: [],
    recommendations: [],
    summary: 'No style drift detected.'
  };
}

// Mock theme analysis for now
async function getThemeImpact(sceneId: string, sceneText: string): Promise<ThemeImpactMeta> {
  // Simulate a misalignment for scene1, aligned for others
  if (sceneId === 'scene1') {
    return {
      driftThemes: ['loyalty'],
      themeSuggestions: ['Reinforce loyalty theme in this scene.'],
      explanation: "Scene lacks loyalty theme despite being midpoint of trust arc."
    };
  }
  return {
    driftThemes: [],
    themeSuggestions: [],
    explanation: 'No theme drift detected.'
  };
}

// Local type for revision history entries with extra metadata
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
  { key: 'all', label: 'All AI Suggestions' },
  { key: 'emotion', label: 'Emotion-based' },
  { key: 'style', label: 'Style-based' },
  { key: 'theme', label: 'Theme-based' }
] as const;
type FilterKey = typeof FILTERS[number]['key'];

interface SmartRevisionEngineProps {
  sceneId: string;
  suggestion?: OptimizationSuggestion;
}

const SmartRevisionEngine: React.FC<SmartRevisionEngineProps> = ({ sceneId, suggestion }) => {
  const narrativeSync = useNarrativeSync();
  const [original, setOriginal] = useState('');
  const [revision, setRevision] = useState<SceneRevision | null>(null);
  const [diff, setDiff] = useState<DiffSegment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<SceneRevisionWithMeta[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [editableText, setEditableText] = useState('');
  const [liveMsg, setLiveMsg] = useState('');
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
    return () => { cancelled = true; };
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
    return () => { cancelled = true; };
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
        if (styleImpact && styleImpact.recommendations.length) {
          mergedSuggestion = {
            ...suggestion,
            specificChanges: [
              ...suggestion.specificChanges,
              ...styleImpact.recommendations.slice(0, 2)
            ]
          };
        }
        if (themeImpact && themeImpact.themeSuggestions.length) {
          mergedSuggestion = {
            ...mergedSuggestion,
            specificChanges: [
              ...mergedSuggestion.specificChanges,
              ...themeImpact.themeSuggestions.slice(0, 2)
            ]
          };
        }
        const rev = await proposeEdit(sceneId, mergedSuggestion);
        if (cancelled) return;
        // Tag revision with style meta
        const styleMeta = styleImpact ? { styleImpact: styleImpact.summary, styleSource: styleImpact.driftFlags.length ? 'style' : 'structure' } : {};
        const themeMeta = themeImpact && themeImpact.driftThemes.length
          ? { themeImpact: themeImpact.explanation, themeSource: 'theme' }
          : {};
        setRevision({ ...rev, ...styleMeta, ...themeMeta });
        setEditableText(rev.revisedText);
        setHistory([{ ...rev, originalText: orig, timestamp: Date.now(), styleImpact: styleMeta.styleImpact, styleSource: styleMeta.styleSource, themeImpact: themeMeta.themeImpact, themeSource: themeMeta.themeSource, themeTag: themeImpact?.driftThemes?.[0] }]);
        setLiveMsg(`AI revision ready. Confidence: ${(rev.confidenceScore * 100).toFixed(0)}%.`);
      } catch (e: any) {
        setError(e.message || 'Failed to load revision.');
      } finally {
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [sceneId, suggestion, styleImpact, themeImpact]);

  // Compute diff
  useEffect(() => {
    if (original && revision) {
      // If themeImpact present, pass themeTag/explanation to diffHighlighter
      let themeTag = themeImpact && themeImpact.driftThemes.length ? themeImpact.driftThemes[0] : undefined;
      let themeExplanation = themeImpact && themeImpact.themeSuggestions.length ? themeImpact.themeSuggestions[0] : undefined;
      setDiff(diffHighlighter(original, revision.revisedText, themeTag ? { themeTag, themeExplanation } : undefined));
    }
  }, [original, revision, themeImpact]);

  // Accept action
  const handleAccept = () => {
    // Apply revised text to scene state (mock: just update history)
    if (revision) {
      setHistory(hist => [
        ...hist,
        { ...revision, originalText: original, timestamp: Date.now() }
      ]);
      setLiveMsg('Revision accepted and applied.');
    }
  };

  // Edit action
  const handleEdit = () => {
    setEditMode(true);
    setLiveMsg('Editing revision.');
  };
  const handleEditSave = () => {
    if (revision) {
      setRevision({ ...revision, revisedText: editableText });
      setDiff(diffHighlighter(original, editableText));
      setEditMode(false);
      setLiveMsg('Edited revision preview updated.');
    }
  };
  const handleEditCancel = () => {
    setEditableText(revision?.revisedText || '');
    setEditMode(false);
    setLiveMsg('Edit cancelled.');
  };

  // Dismiss action
  const handleDismiss = () => {
    setRevision(null);
    setDiff([]);
    setLiveMsg('Revision dismissed.');
  };

  // Undo via RevisionHistoryPanel
  const handleUndo = (rev: SceneRevision) => {
    setRevision(rev);
    setEditableText(rev.revisedText);
    setDiff(diffHighlighter(original, rev.revisedText));
    setLiveMsg('Revision undone.');
  };
  const handleRetry = async (rev: SceneRevision) => {
    if (suggestion) {
      setLoading(true);
      try {
        const newRev = await proposeEdit(sceneId, suggestion);
        setRevision(newRev);
        setEditableText(newRev.revisedText);
        setDiff(diffHighlighter(original, newRev.revisedText));
        setHistory(hist => [
          ...hist,
          { ...newRev, originalText: original, timestamp: Date.now() }
        ]);
        setLiveMsg('AI revision retried.');
      } catch (e: any) {
        setError(e.message || 'Failed to retry revision.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Keyboard focus management
  useEffect(() => {
    if (liveRegionRef.current) {
      liveRegionRef.current.focus();
    }
  }, [liveMsg]);

  return (
    <section
      className="w-full max-w-4xl mx-auto bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6 flex flex-col gap-6"
      aria-label="Smart Revision Engine"
      tabIndex={-1}
    >
      <header className="flex items-center gap-4 mb-2">
        <h2 className="font-bold text-xl flex-1">AI Revision Preview</h2>
      </header>
      <div
        ref={liveRegionRef}
        className="sr-only"
        aria-live="polite"
        tabIndex={-1}
      >
        {liveMsg}
      </div>
      {loading ? (
        <div className="text-center text-blue-600 dark:text-blue-300">Loading revision...</div>
      ) : error ? (
        <div className="text-center text-red-600 dark:text-red-400" role="alert">{error}</div>
      ) : revision ? (
        <>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1" aria-label="Original Scene Text">
              <h3 className="font-semibold mb-1">Original</h3>
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700 text-sm whitespace-pre-line">
                {original}
              </div>
            </div>
            <div className="flex-1" aria-label="AI-Revised Scene Text">
              <h3 className="font-semibold mb-1">AI Revision</h3>
              <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded border border-green-200 dark:border-green-700 text-sm whitespace-pre-line" role="region" aria-label="AI revision diff">
                <div className="flex gap-2 mb-2" role="tablist" aria-label="Diff Filter">
                  {FILTERS.map(f => (
                    <button
                      key={f.key}
                      className={`px-2 py-1 rounded text-xs ${diffFilter === f.key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                      onClick={() => setDiffFilter(f.key)}
                      aria-pressed={diffFilter === f.key}
                    >{f.label}</button>
                  ))}
                </div>
                {diff
                  .filter(seg => {
                    if (diffFilter === 'all') return seg.type !== 'unchanged';
                    if (diffFilter === 'emotion') return seg.semanticTag === 'emotion';
                    if (diffFilter === 'style') return seg.semanticTag === 'structure' || seg.semanticTag === 'pacing';
                    if (diffFilter === 'theme') return seg.semanticTag === 'theme';
                    return true;
                  })
                  .map((seg, idx) => (
                    <span
                      key={idx}
                      className={
                        seg.semanticTag === 'theme'
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
                          : seg.type !== 'unchanged' ? seg.type : undefined
                      }
                      title={
                        seg.semanticTag === 'theme'
                          ? `📘 Theme Reinforcement${seg.themeExplanation ? ': ' + seg.themeExplanation : ''}`
                          : undefined
                      }
                    >
                      {seg.semanticTag === 'theme' && <span role="img" aria-label="Theme Reinforcement">📘</span>}
                      {seg.text}
                    </span>
                  ))}
              </div>
              {styleImpact && (
                <div className="mt-2 text-xs text-purple-700 dark:text-purple-300" aria-live="polite">
                  <span className="font-semibold">Style Impact:</span> {styleImpact.summary}
                  {styleImpact.driftFlags.length > 0 && (
                    <ul className="list-disc list-inside mt-1">
                      {styleImpact.driftFlags.map((flag, i) => <li key={i}>{flag}</li>)}
                    </ul>
                  )}
                  {styleImpact.recommendations.length > 0 && (
                    <ul className="list-disc list-inside mt-1">
                      {styleImpact.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                    </ul>
                  )}
                </div>
              )}
              {themeImpact && (
                <div className="mt-2 text-xs text-indigo-700 dark:text-indigo-300" aria-live="polite">
                  <span className="font-semibold">Theme Impact:</span> {themeImpact.explanation}
                  {themeImpact.driftThemes.length > 0 && (
                    <ul className="list-disc list-inside mt-1">
                      {themeImpact.driftThemes.map((theme, i) => <li key={i}>Drift: {theme}</li>)}
                    </ul>
                  )}
                  {themeImpact.themeSuggestions.length > 0 && (
                    <ul className="list-disc list-inside mt-1">
                      {themeImpact.themeSuggestions.map((rec, i) => <li key={i}>{rec}</li>)}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-4 mt-4 items-start">
            <div className="flex-1 flex flex-col gap-2">
              <div className="text-xs text-zinc-500 dark:text-zinc-400" aria-live="polite">
                <span className="font-semibold">Summary:</span> {revision.changeSummary.join('; ')}
              </div>
              <div className="text-xs text-green-700 dark:text-green-200">
                <span className="font-semibold">Confidence:</span> {(revision.confidenceScore * 100).toFixed(0)}%
              </div>
              <div className="text-xs text-blue-700 dark:text-blue-200">
                <span className="font-semibold">Applied Suggestion:</span> {suggestion?.title}
              </div>
            </div>
            <div className="flex gap-2 mt-2 md:mt-0">
              <button
                className="px-3 py-1 rounded bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800 text-green-700 dark:text-green-200 focus:ring-2 focus:ring-green-400"
                onClick={handleAccept}
                aria-label="Accept revision"
              >
                Accept
              </button>
              <button
                className="px-3 py-1 rounded bg-yellow-100 dark:bg-yellow-900 hover:bg-yellow-200 dark:hover:bg-yellow-800 text-yellow-700 dark:text-yellow-200 focus:ring-2 focus:ring-yellow-400"
                onClick={handleEdit}
                aria-label="Edit revision"
              >
                Edit
              </button>
              <button
                className="px-3 py-1 rounded bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 text-red-700 dark:text-red-200 focus:ring-2 focus:ring-red-400"
                onClick={handleDismiss}
                aria-label="Dismiss revision"
              >
                Dismiss
              </button>
            </div>
          </div>
          {editMode && (
            <div className="mt-4" aria-label="Editable revision preview">
              <textarea
                className="w-full min-h-[120px] p-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm"
                value={editableText}
                onChange={e => setEditableText(e.target.value)}
                aria-label="Edit revised text"
              />
              <div className="flex gap-2 mt-2">
                <button
                  className="px-3 py-1 rounded bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 focus:ring-2 focus:ring-green-400"
                  onClick={handleEditSave}
                  aria-label="Save edited revision"
                >
                  Save
                </button>
                <button
                  className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 focus:ring-2 focus:ring-gray-400"
                  onClick={handleEditCancel}
                  aria-label="Cancel edit"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          <div className="mt-8">
            <RevisionHistoryPanel
              revisions={history}
              sceneId={sceneId}
              onUndo={handleUndo}
              onRetry={handleRetry}
            />
          </div>
        </>
      ) : (
        <div className="text-center text-zinc-500 dark:text-zinc-400">No revision to display.</div>
      )}
    </section>
  );
};

export default SmartRevisionEngine; 