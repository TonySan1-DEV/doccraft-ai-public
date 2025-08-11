// MCP Context Block
/*
{
  file: "modules/emotionArc/components/EmotionalArcModule.tsx",
  role: "frontend-developer",
  allowedActions: ["connect", "fetch", "analyze", "simulate", "suggest"],
  tier: "Pro",
  contentSensitivity: "medium",
  theme: "emotional_modeling"
}
*/

import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  EmotionalArc,
  SceneEmotionData,
  ArcSimulationResult,
  StoryOptimizationPlan,
  SceneInput,
} from '../types/emotionTypes';
import EmotionTimelineChart from './EmotionTimelineChart';
import TensionCurveViewer from './TensionCurveViewer';
import OptimizationSuggestions from './OptimizationSuggestions';
import SceneSentimentPanel from './SceneSentimentPanel';
import CharacterArcSwitch from './CharacterArcSwitch';
import { EmotionAnalyzer } from '../services/emotionAnalyzer';
import { ArcSimulator } from '../services/arcSimulator';
import { SuggestionEngine } from '../services/suggestionEngine';
import { useNarrativeSync } from '../../shared/state/useNarrativeSyncContext';

// Debounce utility
function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

interface EmotionalArcModuleProps {
  initialScenes?: SceneInput[];
  initialText?: string;
  isLoading?: boolean;
  error?: string | null;
  onCharacterSelect?: (characterId: string) => void;
  onSceneSelect?: (sceneId: string) => void;
  onSuggestionApply?: (suggestionId: string) => void;
  onSuggestionDismiss?: (suggestionId: string) => void;
  className?: string;
  'aria-label'?: string;
}

type TabType = 'timeline' | 'tension' | 'scenes' | 'suggestions';

export default function EmotionalArcModule({
  initialScenes = [],
  initialText = '',
  isLoading: externalLoading = false,
  error: externalError = null,
  onCharacterSelect,
  onSceneSelect,
  onSuggestionApply,
  onSuggestionDismiss,
  className = '',
  'aria-label': ariaLabel = 'Emotional Arc Module',
}: EmotionalArcModuleProps) {
  // --- Shared Narrative Sync ---
  const narrativeSync = useNarrativeSync();
  const { state, setScene, setCharacter } = narrativeSync || {
    state: {},
    setScene: () => {},
    setCharacter: () => {},
  };

  // UI state
  const [activeTab, setActiveTab] = useState<TabType>('timeline');
  // Replace local state with context state
  const selectedCharacter = state.characterFocusId || 'all';
  const selectedSceneId = state.currentSceneId;
  const [storyText, _setStoryText] = useState<string>(initialText);
  const debouncedText = useDebouncedValue(storyText, 400);

  // Data state
  const [sceneInputs, setSceneInputs] = useState<SceneInput[]>(initialScenes);
  const [emotionalArc, setEmotionalArc] = useState<EmotionalArc | undefined>();
  const [sceneData, setSceneData] = useState<SceneEmotionData[]>([]);
  const [simulation, setSimulation] = useState<
    ArcSimulationResult | undefined
  >();
  const [optimizationPlan, setOptimizationPlan] = useState<
    StoryOptimizationPlan | undefined
  >();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Service instances
  const emotionAnalyzer = useMemo(() => new EmotionAnalyzer(), []);
  const arcSimulator = useMemo(() => new ArcSimulator(), []);
  const suggestionEngine = useMemo(() => new SuggestionEngine(), []);

  // Effect: Analyze story when text or scenes change
  useEffect(() => {
    let cancelled = false;
    async function analyzeAll() {
      setLoading(true);
      setError(null);
      try {
        // If scenes are not provided, split text into scenes (simple split by paragraphs)
        let scenes: SceneInput[] = sceneInputs;
        if (!scenes.length && debouncedText) {
          scenes = debouncedText
            .split(/\n{2,}/)
            .map((text, idx) => ({
              id: `scene${idx + 1}`,
              text: text.trim(),
              characters: [],
              context: 'Generated from text input',
            }))
            .filter(scene => scene.text.length > 0);
        }
        setSceneInputs(scenes);
        // 1. Analyze emotions
        const analyzedScenes =
          await emotionAnalyzer.analyzeStoryEmotions(scenes);
        if (cancelled) return;
        setSceneData(analyzedScenes);
        // 2. Simulate arc
        const sim = arcSimulator.generateArcSimulation(analyzedScenes);
        if (cancelled) return;
        setSimulation(sim);
        // 3. Build emotional arc (simple aggregation)
        const allBeats = analyzedScenes
          .flatMap(scene => scene.emotionalBeats || [])
          .filter(Boolean);
        const arc: EmotionalArc = {
          id: 'arc-1',
          name: 'Story Emotional Arc',
          title: 'Story Emotional Arc',
          beats: allBeats,
          analysis: analyzedScenes[0]?.analysis || {
            sceneId: 'arc-1',
            dominantEmotion: 'neutral',
            intensity: 0,
          },
          segments: arcSimulator.generateArcSegments(sim.curve, analyzedScenes),
          readerSimulation: arcSimulator.simulateReaderResponse({
            id: 'arc-1',
            name: 'Story Emotional Arc',
            title: 'Story Emotional Arc',
            beats: allBeats,
            analysis: analyzedScenes[0]?.analysis || {
              sceneId: 'arc-1',
              dominantEmotion: 'neutral',
              intensity: 0,
            },
            segments: [],
            overallTension: 0,
            emotionalComplexity: 0,
            pacingScore: 0,
          }),
          overallTension:
            sim.curve.reduce((sum, pt) => sum + pt.tension, 0) /
            sim.curve.length,
          emotionalComplexity:
            sim.curve.reduce(
              (sum, pt) => sum + (pt.emotionalComplexity || 0),
              0
            ) / sim.curve.length,
          pacingScore: sim.pacingAnalysis?.pacingScore || 0,
          metadata: {
            totalScenes: scenes.length,
            totalCharacters: Array.from(
              new Set(allBeats.map(b => b.characterId))
            ).length,
            analysisTimestamp: Date.now(),
            modelUsed: 'gpt-4',
          },
        };
        setEmotionalArc(arc);
        // 4. Get suggestions
        const plan = suggestionEngine.generateOptimizationSuggestions(arc, sim);
        if (cancelled) return;
        setOptimizationPlan(plan);
        setLoading(false);
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || 'Failed to analyze story');
          setLoading(false);
        }
      }
    }
    if (debouncedText || sceneInputs.length) {
      analyzeAll();
    } else {
      setEmotionalArc(undefined);
      setSceneData([]);
      setSimulation(undefined);
      setOptimizationPlan(undefined);
    }
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedText, JSON.stringify(sceneInputs)]);

  // Extract character IDs from emotional beats
  const characterIds = useMemo(() => {
    if (!emotionalArc?.beats) return [];
    return [...new Set(emotionalArc.beats.map(beat => beat.characterId))];
  }, [emotionalArc?.beats]);

  // Filter emotional beats based on selected character
  const filteredBeats = useMemo(() => {
    if (!emotionalArc?.beats) return [];
    if (selectedCharacter === 'all') return emotionalArc.beats;
    return emotionalArc.beats.filter(
      beat => beat.characterId === selectedCharacter
    );
  }, [emotionalArc?.beats, selectedCharacter]);

  const handleCharacterSwitch = useCallback(
    (characterId: string) => {
      setCharacter(characterId);
      onCharacterSelect?.(characterId);
      if (process.env.NODE_ENV === 'development') {
        console.log('[NarrativeSync] characterFocusId updated:', characterId);
      }
    },
    [onCharacterSelect, setCharacter]
  );

  const handleSceneSelect = useCallback(
    (sceneId: string) => {
      setScene(sceneId);
      onSceneSelect?.(sceneId);
      if (process.env.NODE_ENV === 'development') {
        console.log('[NarrativeSync] currentSceneId updated:', sceneId);
      }
    },
    [onSceneSelect, setScene]
  );

  const handleSuggestionApply = useCallback(
    (suggestionId: string) => {
      onSuggestionApply?.(suggestionId);
    },
    [onSuggestionApply]
  );

  const handleSuggestionDismiss = useCallback(
    (suggestionId: string) => {
      onSuggestionDismiss?.(suggestionId);
    },
    [onSuggestionDismiss]
  );

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

  const tabs: Array<{
    id: TabType;
    label: string;
    icon: string;
    description: string;
  }> = [
    {
      id: 'timeline',
      label: 'Timeline',
      icon: '📈',
      description: 'Character emotional arcs over time',
    },
    {
      id: 'tension',
      label: 'Tension',
      icon: '⚡',
      description: 'Reader engagement and tension curves',
    },
    {
      id: 'scenes',
      label: 'Scenes',
      icon: '🎭',
      description: 'Per-scene sentiment analysis',
    },
    {
      id: 'suggestions',
      label: 'Suggestions',
      icon: '💡',
      description: 'AI-powered optimization recommendations',
    },
  ];

  // Error state
  if (error || externalError) {
    return (
      <div
        className={`p-6 bg-red-50 border border-red-200 rounded-lg ${className}`}
        role="alert"
        aria-live="polite"
      >
        <div className="flex items-center">
          <svg
            className="w-6 h-6 text-red-400 mr-3"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <h3 className="text-lg font-medium text-red-800">Analysis Error</h3>
            <p className="text-red-700 mt-1">{error || externalError}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}
      role="region"
      aria-label={ariaLabel}
    >
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Emotional Arc Analysis
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {emotionalArc?.title || 'Story Analysis'}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Character Switch */}
            <CharacterArcSwitch
              characterIds={characterIds}
              selectedCharacter={selectedCharacter}
              onCharacterSwitch={handleCharacterSwitch}
              isLoading={loading || externalLoading}
              disabled={!emotionalArc}
            />

            {/* Analysis Stats */}
            {emotionalArc && (
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <span>Beats:</span>
                  <span className="font-medium">
                    {emotionalArc.beats.length}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>Characters:</span>
                  <span className="font-medium">{characterIds.length}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>Scenes:</span>
                  <span className="font-medium">{sceneData.length}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6" aria-label="Analysis tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`tab-panel-${tab.id}`}
              disabled={loading || externalLoading}
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Panels */}
      <div className="p-6">
        {/* Loading State */}
        {(loading || externalLoading) && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Analyzing emotional content...</p>
              <p className="text-sm text-gray-500 mt-2">
                This may take a few moments
              </p>
            </div>
          </div>
        )}

        {/* Timeline Tab */}
        {!loading && !externalLoading && activeTab === 'timeline' && (
          <div
            id="tab-panel-timeline"
            role="tabpanel"
            aria-labelledby="tab-timeline"
          >
            <EmotionTimelineChart
              emotionalBeats={filteredBeats}
              selectedCharacter={selectedCharacter}
              simulation={simulation}
              isLoading={loading}
              error={error}
              onBeatClick={beat => {
                // Could open a detail modal or navigate to specific scene
                setScene(beat.sceneId);
              }}
              aria-label="Emotional timeline chart"
            />
          </div>
        )}

        {/* Tension Tab */}
        {!loading &&
          !externalLoading &&
          activeTab === 'tension' &&
          simulation && (
            <div
              id="tab-panel-tension"
              role="tabpanel"
              aria-labelledby="tab-tension"
            >
              <TensionCurveViewer
                tensionCurve={simulation.curve}
                emotionalPeaks={simulation.emotionalPeaks || []}
                readerEngagement={simulation.readerEngagement}
                isLoading={loading}
                error={error}
                onPointClick={(position, _data) => {
                  // Could highlight corresponding scene or beat
                  setScene(
                    sceneData[Math.round(position * sceneData.length)]?.sceneId
                  );
                }}
                aria-label="Tension curve viewer"
              />
            </div>
          )}

        {/* Scenes Tab */}
        {!loading && !externalLoading && activeTab === 'scenes' && (
          <div
            id="tab-panel-scenes"
            role="tabpanel"
            aria-labelledby="tab-scenes"
          >
            <SceneSentimentPanel
              sceneData={sceneData}
              selectedSceneId={selectedSceneId}
              isLoading={loading}
              error={error}
              onSceneSelect={handleSceneSelect}
              onCharacterClick={handleCharacterSwitch}
              aria-label="Scene sentiment panel"
            />
          </div>
        )}

        {/* Suggestions Tab */}
        {!loading &&
          !externalLoading &&
          activeTab === 'suggestions' &&
          optimizationPlan && (
            <div
              id="tab-panel-suggestions"
              role="tabpanel"
              aria-labelledby="tab-suggestions"
            >
              <OptimizationSuggestions
                optimizationPlan={optimizationPlan}
                isLoading={loading}
                error={error}
                onSuggestionClick={_suggestion => {
                  // Could show detailed view or apply suggestion
                  // no-op for now
                }}
                onApplySuggestion={handleSuggestionApply}
                onDismissSuggestion={handleSuggestionDismiss}
                aria-label="Optimization suggestions"
              />
            </div>
          )}

        {/* Empty State */}
        {!loading && !externalLoading && !emotionalArc && !error && (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No analysis data
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Start by analyzing a story to see emotional insights.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      {emotionalArc && (
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span>
                Overall Tension: {Math.round(emotionalArc.overallTension || 0)}%
              </span>
              <span>
                Emotional Complexity:{' '}
                {Math.round(emotionalArc.emotionalComplexity || 0)}%
              </span>
              <span>
                Pacing Score: {Math.round(emotionalArc.pacingScore || 0)}%
              </span>
            </div>

            {emotionalArc.metadata && (
              <div className="flex items-center space-x-4">
                <span>Model: {emotionalArc.metadata.modelUsed}</span>
                <span>
                  Analyzed:{' '}
                  {new Date(
                    emotionalArc.metadata.analysisTimestamp
                  ).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
