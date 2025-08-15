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
import { useAgentPreferences } from '../../../src/contexts/AgentPreferencesContext';
import { ModeAwareAIService } from '../../../src/services/modeAwareAIService';
import { SystemMode, WritingContext } from '../../../src/types/systemModes';
import { moduleCoordinator } from '../../../src/services/moduleCoordinator';
import { ModeErrorBoundary } from '../../../src/components/ModeErrorBoundary';
import { runAIAction as aiHelperService } from '../../../src/services/aiHelperService';
import { mcpRegistry } from '../../../src/mcpRegistry';

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
  // --- ALL STATE VARIABLES DECLARED FIRST ---

  // UI state
  const [activeTab, setActiveTab] = useState<TabType>('timeline');
  const [storyText, _setStoryText] = useState<string>(initialText);

  // Data state
  const [sceneInputs, _setSceneInputs] = useState<SceneInput[]>(initialScenes);
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

  // --- Shared Narrative Sync ---
  const narrativeSync = useNarrativeSync();
  const { state, setScene, setCharacter } = narrativeSync || {
    state: {},
    setScene: () => {},
    setCharacter: () => {},
  };

  // --- UNIFIED MODE SYSTEM INTEGRATION ---
  const { preferences } = useAgentPreferences();
  const currentMode = preferences.systemMode || 'HYBRID';
  const _modeConfig = preferences.modeConfiguration;

  // Initialize mode-aware AI service
  const _modeAwareService = useMemo(
    () => new ModeAwareAIService(aiHelperService, mcpRegistry),
    []
  );

  // Register module with coordinator
  useEffect(() => {
    const moduleInterface = {
      moduleId: 'emotionArc',
      currentMode,
      adaptToMode: async (mode: SystemMode, strategy: any) => {
        // Adapt module behavior based on mode
        console.log(`EmotionArc module adapting to ${mode} mode`);
      },
      getModuleState: () => ({
        emotionalArc,
        sceneData,
        simulation,
        optimizationPlan,
      }),
      onModeTransition: async (fromMode: SystemMode, toMode: SystemMode) => {
        console.log(
          `EmotionArc module transitioning from ${fromMode} to ${toMode}`
        );
        // Handle mode transition logic
      },
      getCoordinationCapabilities: () => [
        'emotion_analysis',
        'arc_simulation',
        'optimization_suggestions',
      ],
    };

    moduleCoordinator.registerModule(moduleInterface);

    return () => {
      moduleCoordinator.unregisterModule('emotionArc');
    };
  }, [currentMode, emotionalArc, sceneData, simulation, optimizationPlan]);

  // Context-derived values
  const selectedCharacter = state.characterFocusId || 'all';
  const selectedSceneId = state.currentSceneId;
  const debouncedText = useDebouncedValue(storyText, 400);

  // === MODE-SPECIFIC ANALYSIS FUNCTIONS ===

  /**
   * Handle analysis in MANUAL mode - only when explicitly requested
   */
  const handleManualModeAnalysis = useCallback(async () => {
    if (!debouncedText && !sceneInputs.length) return;

    setLoading(true);
    setError(null);

    try {
      const _writingContext: WritingContext = {
        documentType: 'story',
        userGoals: ['emotional_engagement', 'character_development'],
        writingPhase: 'drafting',
        userExperience: 'intermediate',
        currentMode: 'MANUAL',
        sessionDuration: Date.now() - (window as any).sessionStartTime || 0,
        interactionPatterns: {
          frequentEdits: true,
          longWritingSessions: false,
          collaborativeWork: false,
          researchIntensive: false,
        },
      };

      // Basic analysis without proactive suggestions
      const analyzedScenes =
        await emotionAnalyzer.analyzeStoryEmotions(sceneInputs);
      const sim = arcSimulator.generateArcSimulation(analyzedScenes);

      // Build emotional arc with minimal processing
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
          sim.curve.reduce((sum, pt) => sum + pt.tension, 0) / sim.curve.length,
        emotionalComplexity:
          sim.curve.reduce(
            (sum, pt) => sum + (pt.emotionalComplexity || 0),
            0
          ) / sim.curve.length,
        pacingScore: sim.pacingAnalysis?.pacingScore || 0,
        metadata: {
          totalScenes: sceneInputs.length,
          totalCharacters: Array.from(new Set(allBeats.map(b => b.characterId)))
            .length,
          analysisTimestamp: Date.now(),
          modelUsed: 'gpt-4',
        },
      };

      setSceneData(analyzedScenes);
      setSimulation(sim);
      setEmotionalArc(arc);

      // No optimization plan in manual mode
      setOptimizationPlan(undefined);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze story');
    } finally {
      setLoading(false);
    }
  }, [debouncedText, sceneInputs, emotionAnalyzer, arcSimulator]);

  /**
   * Handle analysis in HYBRID mode - contextual suggestions with user choice
   */
  const handleHybridModeAnalysis = useCallback(async () => {
    if (!debouncedText && !sceneInputs.length) return;

    setLoading(true);
    setError(null);

    try {
      const _writingContext: WritingContext = {
        documentType: 'story',
        userGoals: ['emotional_engagement', 'character_development'],
        writingPhase: 'drafting',
        userExperience: 'intermediate',
        currentMode: 'HYBRID',
        sessionDuration: Date.now() - (window as any).sessionStartTime || 0,
        interactionPatterns: {
          frequentEdits: true,
          longWritingSessions: false,
          collaborativeWork: false,
          researchIntensive: false,
        },
      };

      // Enhanced analysis with contextual suggestions
      const analyzedScenes =
        await emotionAnalyzer.analyzeStoryEmotions(sceneInputs);
      const sim = arcSimulator.generateArcSimulation(analyzedScenes);

      // Build emotional arc with enhanced processing
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
          sim.curve.reduce((sum, pt) => sum + pt.tension, 0) / sim.curve.length,
        emotionalComplexity:
          sim.curve.reduce(
            (sum, pt) => sum + (pt.emotionalComplexity || 0),
            0
          ) / sim.curve.length,
        pacingScore: sim.pacingAnalysis?.pacingScore || 0,
        metadata: {
          totalScenes: sceneInputs.length,
          totalCharacters: Array.from(new Set(allBeats.map(b => b.characterId)))
            .length,
          analysisTimestamp: Date.now(),
          modelUsed: 'gpt-4',
        },
      };

      setSceneData(analyzedScenes);
      setSimulation(sim);
      setEmotionalArc(arc);

      // Generate suggestions requiring user approval
      const plan = suggestionEngine.generateOptimizationSuggestions(arc, sim);
      setOptimizationPlan(plan);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze story');
    } finally {
      setLoading(false);
    }
  }, [
    debouncedText,
    sceneInputs,
    emotionAnalyzer,
    arcSimulator,
    suggestionEngine,
  ]);

  /**
   * Handle analysis in FULLY_AUTO mode - proactive analysis with automatic insights
   */
  const handleAutoModeAnalysis = useCallback(async () => {
    if (!debouncedText && !sceneInputs.length) return;

    setLoading(true);
    setError(null);

    try {
      const _writingContext: WritingContext = {
        documentType: 'story',
        userGoals: ['emotional_engagement', 'character_development'],
        writingPhase: 'drafting',
        userExperience: 'intermediate',
        currentMode: 'FULLY_AUTO',
        sessionDuration: Date.now() - (window as any).sessionStartTime || 0,
        interactionPatterns: {
          frequentEdits: true,
          longWritingSessions: false,
          collaborativeWork: false,
          researchIntensive: false,
        },
      };

      // Comprehensive analysis with proactive enhancements
      const analyzedScenes =
        await emotionAnalyzer.analyzeStoryEmotions(sceneInputs);
      const sim = arcSimulator.generateArcSimulation(analyzedScenes);

      // Build emotional arc with comprehensive processing
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
          sim.curve.reduce((sum, pt) => sum + pt.tension, 0) / sim.curve.length,
        emotionalComplexity:
          sim.curve.reduce(
            (sum, pt) => sum + (pt.emotionalComplexity || 0),
            0
          ) / sim.curve.length,
        pacingScore: sim.pacingAnalysis?.pacingScore || 0,
        metadata: {
          totalScenes: sceneInputs.length,
          totalCharacters: Array.from(new Set(allBeats.map(b => b.characterId)))
            .length,
          analysisTimestamp: Date.now(),
          modelUsed: 'gpt-4',
        },
      };

      setSceneData(analyzedScenes);
      setSimulation(sim);
      setEmotionalArc(arc);

      // Generate comprehensive suggestions with auto-application
      const plan = suggestionEngine.generateOptimizationSuggestions(arc, sim);

      // Auto-apply high-confidence suggestions
      if (plan?.suggestions) {
        const autoSuggestions = plan.suggestions.filter(
          s => s.confidence > 0.8
        );
        if (autoSuggestions.length > 0) {
          console.log(
            'Auto-applying high-confidence suggestions:',
            autoSuggestions
          );
          // Here you could implement auto-application logic
        }
      }

      setOptimizationPlan(plan);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze story');
    } finally {
      setLoading(false);
    }
  }, [
    debouncedText,
    sceneInputs,
    emotionAnalyzer,
    arcSimulator,
    suggestionEngine,
  ]);

  // Effect: Analyze story when text or scenes change
  useEffect(() => {
    let _cancelled = false;
    async function analyzeAll() {
      // Mode-specific analysis behavior
      if (currentMode === 'MANUAL') {
        // Only analyze if explicitly requested
        if (!externalLoading) {
          setLoading(false);
          return;
        }
        await handleManualModeAnalysis();
        return;
      }

      if (currentMode === 'HYBRID') {
        await handleHybridModeAnalysis();
        return;
      }

      if (currentMode === 'FULLY_AUTO') {
        await handleAutoModeAnalysis();
        return;
      }
    }

    // Mode-aware analysis triggers
    if (currentMode === 'FULLY_AUTO') {
      // Continuous analysis in fully auto mode
      if (debouncedText || sceneInputs.length) {
        analyzeAll();
      }
    } else if (currentMode === 'HYBRID') {
      // Contextual analysis in hybrid mode
      if (debouncedText || sceneInputs.length) {
        analyzeAll();
      }
    } else {
      // Manual mode - only analyze when explicitly requested
      if (externalLoading && (debouncedText || sceneInputs.length)) {
        analyzeAll();
      } else if (!externalLoading) {
        setEmotionalArc(undefined);
        setSceneData([]);
        setSimulation(undefined);
        setOptimizationPlan(undefined);
      }
    }

    return () => {
      _cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    debouncedText,
    JSON.stringify(sceneInputs),
    currentMode,
    externalLoading,
  ]);

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

  // === MODE-SPECIFIC UI RENDERING ===

  /**
   * Render interface for MANUAL mode
   */
  const renderManualInterface = () => (
    <div className="manual-mode-interface p-4 bg-blue-50 border-b border-blue-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-blue-800 font-medium">Manual Mode</span>
          <span className="text-blue-600 text-sm">Full user control</span>
        </div>
        <button
          onClick={handleManualModeAnalysis}
          className="manual-analysis-button bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          disabled={!debouncedText && !sceneInputs.length}
        >
          <svg
            className="w-4 h-4 mr-2 inline"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          Analyze Emotional Arc
        </button>
      </div>
      {loading && (
        <div className="manual-analysis-status mt-3 text-blue-700 flex items-center">
          <svg
            className="animate-spin w-4 h-4 mr-2"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Analyzing emotional content...
        </div>
      )}
    </div>
  );

  /**
   * Render interface for HYBRID mode
   */
  const renderHybridInterface = () => (
    <div className="hybrid-mode-interface p-4 bg-green-50 border-b border-green-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-800 font-medium">Hybrid Mode</span>
          <span className="text-green-600 text-sm">
            Collaborative assistance
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {optimizationPlan?.suggestions && (
            <div className="suggestion-badge bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              {optimizationPlan.suggestions.length} suggestions available
            </div>
          )}
        </div>
      </div>
      {optimizationPlan?.suggestions && (
        <div className="contextual-suggestions mt-3">
          <div className="suggestion-preview bg-white p-3 rounded-lg border border-green-200">
            <h4 className="text-green-800 font-medium text-sm mb-1">
              AI Suggestions Available
            </h4>
            <p className="text-green-700 text-xs">
              Review and apply suggestions to improve your emotional arc
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              {optimizationPlan.suggestions
                .slice(0, 3)
                .map((suggestion, idx) => (
                  <span
                    key={idx}
                    className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs"
                  >
                    {suggestion.type}
                  </span>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  /**
   * Render interface for FULLY_AUTO mode
   */
  const renderAutoInterface = () => (
    <div className="auto-mode-interface p-4 bg-purple-50 border-b border-purple-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
          <span className="text-purple-800 font-medium">Auto Mode</span>
          <span className="text-purple-600 text-sm">Proactive assistance</span>
        </div>
        <div className="flex items-center space-x-2">
          {loading && (
            <div className="auto-analysis-status text-purple-700 flex items-center text-sm">
              <svg
                className="animate-spin w-4 h-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Continuously analyzing...
            </div>
          )}
        </div>
      </div>
      {optimizationPlan?.suggestions && (
        <div className="proactive-suggestions mt-3">
          <div className="auto-suggestion-preview bg-white p-3 rounded-lg border border-purple-200">
            <h4 className="text-purple-800 font-medium text-sm mb-1">
              Auto-Applied Enhancements
            </h4>
            <p className="text-purple-700 text-xs">
              AI is continuously improving your emotional arc
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              {optimizationPlan.suggestions
                .filter(s => s.confidence > 0.8)
                .slice(0, 3)
                .map((suggestion, idx) => (
                  <span
                    key={idx}
                    className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs flex items-center"
                  >
                    <svg
                      className="w-3 h-3 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {suggestion.type}
                  </span>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  /**
   * Main mode-aware interface renderer
   */
  const renderModeAwareInterface = () => {
    switch (currentMode) {
      case 'MANUAL':
        return renderManualInterface();
      case 'HYBRID':
        return renderHybridInterface();
      case 'FULLY_AUTO':
        return renderAutoInterface();
      default:
        return null;
    }
  };

  return (
    <ModeErrorBoundary
      fallbackMode="HYBRID"
      onError={(error, errorInfo) => {
        console.error('EmotionalArcModule error:', error, errorInfo);
        setError(error.message);
      }}
      onRecovery={recoveredMode => {
        console.log('EmotionalArcModule recovered to mode:', recoveredMode);
        setError(null);
      }}
    >
      <div
        className={`bg-white rounded-lg shadow-sm border border-gray-200 emotional-arc-module--${currentMode.toLowerCase()} ${className}`}
        role="region"
        aria-label={ariaLabel}
      >
        {/* Mode-aware interface */}
        {renderModeAwareInterface()}

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
              {/* Mode indicator */}
              <div className="flex items-center mt-2 space-x-2">
                <span className="text-xs text-gray-500">Mode:</span>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    currentMode === 'MANUAL'
                      ? 'bg-blue-100 text-blue-800'
                      : currentMode === 'HYBRID'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-purple-100 text-purple-800'
                  }`}
                >
                  {currentMode}
                </span>
              </div>
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
                      sceneData[Math.round(position * sceneData.length)]
                        ?.sceneId
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
                {currentMode === 'MANUAL'
                  ? 'Click "Analyze Emotional Arc" to begin analysis.'
                  : 'Start writing to see emotional insights.'}
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
                  Overall Tension:{' '}
                  {Math.round(emotionalArc.overallTension || 0)}%
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
    </ModeErrorBoundary>
  );
}
