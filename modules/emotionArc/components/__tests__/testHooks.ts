// MCP Context Block
/*
{
  file: "modules/emotionArc/components/__tests__/testHooks.ts",
  role: "frontend-developer",
  allowedActions: ["scaffold", "visualize", "simulate", "accessibility"],
  tier: "Pro",
  contentSensitivity: "medium",
  theme: "emotional_modeling"
}
*/

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EmotionalBeat, SceneEmotionData, ArcSimulationResult, StoryOptimizationPlan } from '../../types/emotionTypes';

// Mock data for testing
export const mockEmotionalBeats: EmotionalBeat[] = [
  {
    sceneId: 'scene1',
    characterId: 'protagonist',
    emotion: 'joy',
    intensity: 75,
    narrativePosition: 0.2,
    timestamp: Date.now(),
    context: 'Character achieves a goal',
    confidence: 85,
    secondaryEmotions: ['excitement']
  },
  {
    sceneId: 'scene2',
    characterId: 'protagonist',
    emotion: 'fear',
    intensity: 90,
    narrativePosition: 0.5,
    timestamp: Date.now(),
    context: 'Character faces danger',
    confidence: 92,
    secondaryEmotions: ['anxiety', 'panic']
  },
  {
    sceneId: 'scene3',
    characterId: 'antagonist',
    emotion: 'anger',
    intensity: 80,
    narrativePosition: 0.8,
    timestamp: Date.now(),
    context: 'Character confronts enemy',
    confidence: 88,
    secondaryEmotions: ['fury']
  }
];

export const mockSceneData: SceneEmotionData[] = [
  {
    sceneId: 'scene1',
    sceneText: 'Sarah felt deep joy as she finally achieved her goal. The sun shone brightly on her face.',
    characterEmotions: new Map([
      ['protagonist', {
        primaryEmotion: 'joy',
        intensity: 75,
        confidence: 85,
        secondaryEmotions: ['excitement'],
        emotionalComplexity: 30,
        contextClues: ['felt deep joy', 'sun shone brightly'],
        modelConfidence: 0.9,
        processingTime: 150
      }]
    ]),
    overallSentiment: 'positive',
    tensionLevel: 25,
    emotionalBeats: [mockEmotionalBeats[0]],
    processingMetadata: {
      wordCount: 15,
      characterCount: 1,
      analysisTime: 150
    }
  },
  {
    sceneId: 'scene2',
    sceneText: 'Fear gripped Sarah as she faced the unknown danger ahead.',
    characterEmotions: new Map([
      ['protagonist', {
        primaryEmotion: 'fear',
        intensity: 90,
        confidence: 92,
        secondaryEmotions: ['anxiety', 'panic'],
        emotionalComplexity: 85,
        contextClues: ['Fear gripped', 'unknown danger'],
        modelConfidence: 0.95,
        processingTime: 200
      }]
    ]),
    overallSentiment: 'negative',
    tensionLevel: 85,
    emotionalBeats: [mockEmotionalBeats[1]],
    processingMetadata: {
      wordCount: 12,
      characterCount: 1,
      analysisTime: 200
    }
  }
];

export const mockSimulation: ArcSimulationResult = {
  tensionCurve: [
    { position: 0.2, tension: 25, empathy: 60, engagement: 70, emotionalComplexity: 30 },
    { position: 0.5, tension: 85, empathy: 80, engagement: 90, emotionalComplexity: 85 },
    { position: 0.8, tension: 70, empathy: 75, engagement: 85, emotionalComplexity: 70 }
  ],
  emotionalPeaks: [0.5],
  pacingAnalysis: {
    slowSections: [0.1],
    fastSections: [0.5],
    optimalPacing: [0.3, 0.7],
    pacingScore: 75
  },
  readerEngagement: {
    predictedDrops: [0.1],
    highEngagementSections: [0.5],
    emotionalComplexity: 70,
    overallEngagement: 82
  }
};

export const mockOptimizationPlan: StoryOptimizationPlan = {
  suggestions: [
    {
      id: 'suggestion-1',
      type: 'pacing',
      priority: 'high',
      title: 'Add Relief Moment',
      description: 'Consider adding a moment of relief after the high-tension scene',
      specificChanges: [
        'Add a scene where the protagonist finds temporary safety',
        'Include character bonding or reflection moments',
        'Reduce tension gradually rather than abruptly'
      ],
      expectedImpact: {
        tensionChange: -15,
        empathyChange: 20,
        engagementChange: 10,
        complexityChange: -5
      },
      targetPositions: [0.6],
      riskLevel: 'low',
      implementationDifficulty: 'medium',
      estimatedTime: 30
    },
    {
      id: 'suggestion-2',
      type: 'empathy',
      priority: 'medium',
      title: 'Enhance Character Vulnerability',
      description: 'Add more vulnerable moments to increase reader empathy',
      specificChanges: [
        'Show character internal struggles',
        'Add moments of doubt or weakness',
        'Include character backstory elements'
      ],
      expectedImpact: {
        tensionChange: 5,
        empathyChange: 30,
        engagementChange: 15,
        complexityChange: 10
      },
      targetPositions: [0.3, 0.7],
      riskLevel: 'low',
      implementationDifficulty: 'easy',
      estimatedTime: 20
    }
  ],
  overallScore: 85,
  implementationOrder: ['Add Relief Moment', 'Enhance Character Vulnerability'],
  riskAssessment: {
    highRisk: [],
    mediumRisk: [],
    lowRisk: ['Add Relief Moment', 'Enhance Character Vulnerability']
  },
  estimatedImprovement: {
    tension: -10,
    empathy: 50,
    engagement: 25,
    overall: 22
  }
};

// Test hooks for EmotionTimelineChart
export const useEmotionTimelineChartTest = () => {
  const renderChart = (props = {}) => {
    const defaultProps = {
      emotionalBeats: mockEmotionalBeats,
      selectedCharacter: 'all',
      isLoading: false,
      error: null,
      onBeatClick: jest.fn(),
      'aria-label': 'Test timeline chart'
    };

    return render(
      <div data-testid="emotion-timeline-chart">
        {/* Component would be imported and rendered here */}
        <div>EmotionTimelineChart Component</div>
      </div>
    );
  };

  const getChartElement = () => screen.getByTestId('emotion-timeline-chart');
  const getLoadingState = () => screen.queryByText('Loading emotional timeline...');
  const getErrorState = () => screen.queryByText(/Error loading emotional data/);
  const getEmptyState = () => screen.queryByText('No emotional data available');

  return {
    renderChart,
    getChartElement,
    getLoadingState,
    getErrorState,
    getEmptyState
  };
};

// Test hooks for TensionCurveViewer
export const useTensionCurveViewerTest = () => {
  const renderViewer = (props = {}) => {
    const defaultProps = {
      tensionCurve: mockSimulation.tensionCurve,
      emotionalPeaks: mockSimulation.emotionalPeaks,
      readerEngagement: mockSimulation.readerEngagement,
      isLoading: false,
      error: null,
      onPointClick: jest.fn(),
      'aria-label': 'Test tension viewer'
    };

    return render(
      <div data-testid="tension-curve-viewer">
        {/* Component would be imported and rendered here */}
        <div>TensionCurveViewer Component</div>
      </div>
    );
  };

  const getViewerElement = () => screen.getByTestId('tension-curve-viewer');
  const getLoadingState = () => screen.queryByText('Loading tension curve...');
  const getErrorState = () => screen.queryByText(/Error loading tension data/);
  const getEmptyState = () => screen.queryByText('No tension data available');

  return {
    renderViewer,
    getViewerElement,
    getLoadingState,
    getErrorState,
    getEmptyState
  };
};

// Test hooks for OptimizationSuggestions
export const useOptimizationSuggestionsTest = () => {
  const renderSuggestions = (props = {}) => {
    const defaultProps = {
      optimizationPlan: mockOptimizationPlan,
      isLoading: false,
      error: null,
      onSuggestionClick: jest.fn(),
      onApplySuggestion: jest.fn(),
      onDismissSuggestion: jest.fn(),
      'aria-label': 'Test optimization suggestions'
    };

    return render(
      <div data-testid="optimization-suggestions">
        {/* Component would be imported and rendered here */}
        <div>OptimizationSuggestions Component</div>
      </div>
    );
  };

  const getSuggestionsElement = () => screen.getByTestId('optimization-suggestions');
  const getLoadingState = () => screen.queryByText('Generating optimization suggestions...');
  const getErrorState = () => screen.queryByText(/Error loading suggestions/);
  const getEmptyState = () => screen.queryByText('No suggestions match the current filter');

  return {
    renderSuggestions,
    getSuggestionsElement,
    getLoadingState,
    getErrorState,
    getEmptyState
  };
};

// Test hooks for SceneSentimentPanel
export const useSceneSentimentPanelTest = () => {
  const renderPanel = (props = {}) => {
    const defaultProps = {
      sceneData: mockSceneData,
      selectedSceneId: undefined,
      isLoading: false,
      error: null,
      onSceneSelect: jest.fn(),
      onCharacterClick: jest.fn(),
      'aria-label': 'Test scene sentiment panel'
    };

    return render(
      <div data-testid="scene-sentiment-panel">
        {/* Component would be imported and rendered here */}
        <div>SceneSentimentPanel Component</div>
      </div>
    );
  };

  const getPanelElement = () => screen.getByTestId('scene-sentiment-panel');
  const getLoadingState = () => screen.queryByText('Analyzing scene emotions...');
  const getErrorState = () => screen.queryByText(/Error loading scene data/);
  const getEmptyState = () => screen.queryByText('No scenes match the current filter');

  return {
    renderPanel,
    getPanelElement,
    getLoadingState,
    getErrorState,
    getEmptyState
  };
};

// Test hooks for CharacterArcSwitch
export const useCharacterArcSwitchTest = () => {
  const renderSwitch = (props = {}) => {
    const defaultProps = {
      characterIds: ['protagonist', 'antagonist'],
      selectedCharacter: 'all',
      onCharacterSwitch: jest.fn(),
      isLoading: false,
      disabled: false,
      'aria-label': 'Test character arc switch'
    };

    return render(
      <div data-testid="character-arc-switch">
        {/* Component would be imported and rendered here */}
        <div>CharacterArcSwitch Component</div>
      </div>
    );
  };

  const getSwitchElement = () => screen.getByTestId('character-arc-switch');
  const getLoadingState = () => screen.queryByText('Loading...');
  const getDisabledState = () => screen.getByRole('button', { disabled: true });

  return {
    renderSwitch,
    getSwitchElement,
    getLoadingState,
    getDisabledState
  };
};

// Test hooks for EmotionalArcModule
export const useEmotionalArcModuleTest = () => {
  const renderModule = (props = {}) => {
    const defaultProps = {
      emotionalArc: {
        id: 'arc-1',
        title: 'Test Story',
        beats: mockEmotionalBeats,
        segments: [],
        readerSimulation: {
          empathyScore: 75,
          predictedEngagementDrop: false,
          notes: ['Good emotional progression'],
          emotionalPeaks: [0.5],
          tensionCurve: mockSimulation.tensionCurve,
          engagementDrops: [],
          highEngagementSections: [0.5]
        },
        overallTension: 70,
        emotionalComplexity: 65,
        pacingScore: 75,
        metadata: {
          totalScenes: 3,
          totalCharacters: 2,
          analysisTimestamp: Date.now(),
          modelUsed: 'gpt-4'
        }
      },
      sceneData: mockSceneData,
      simulation: mockSimulation,
      optimizationPlan: mockOptimizationPlan,
      isLoading: false,
      error: null,
      onCharacterSelect: jest.fn(),
      onSceneSelect: jest.fn(),
      onSuggestionApply: jest.fn(),
      onSuggestionDismiss: jest.fn(),
      'aria-label': 'Test emotional arc module'
    };

    return render(
      <div data-testid="emotional-arc-module">
        {/* Component would be imported and rendered here */}
        <div>EmotionalArcModule Component</div>
      </div>
    );
  };

  const getModuleElement = () => screen.getByTestId('emotional-arc-module');
  const getLoadingState = () => screen.queryByText('Analyzing emotional content...');
  const getErrorState = () => screen.queryByText(/Analysis Error/);
  const getEmptyState = () => screen.queryByText('No analysis data');

  return {
    renderModule,
    getModuleElement,
    getLoadingState,
    getErrorState,
    getEmptyState
  };
};

// Utility functions for testing
export const createMockEmotionalBeat = (overrides: Partial<EmotionalBeat> = {}): EmotionalBeat => ({
  sceneId: 'scene1',
  characterId: 'protagonist',
  emotion: 'joy',
  intensity: 75,
  narrativePosition: 0.2,
  timestamp: Date.now(),
  context: 'Test context',
  confidence: 85,
  secondaryEmotions: [],
  ...overrides
});

export const createMockSceneData = (overrides: Partial<SceneEmotionData> = {}): SceneEmotionData => ({
  sceneId: 'scene1',
  sceneText: 'Test scene text',
  characterEmotions: new Map(),
  overallSentiment: 'neutral',
  tensionLevel: 50,
  emotionalBeats: [],
  processingMetadata: {
    wordCount: 10,
    characterCount: 1,
    analysisTime: 100
  },
  ...overrides
});

export const createMockOptimizationSuggestion = (overrides: any = {}) => ({
  id: 'test-suggestion',
  type: 'pacing' as const,
  priority: 'medium' as const,
  title: 'Test Suggestion',
  description: 'Test description',
  specificChanges: ['Test change'],
  expectedImpact: {
    tensionChange: 10,
    empathyChange: 15,
    engagementChange: 20,
    complexityChange: 5
  },
  targetPositions: [0.5],
  riskLevel: 'low' as const,
  implementationDifficulty: 'easy' as const,
  estimatedTime: 30,
  ...overrides
}); 