// MCP Context Block
/*
{
  file: "modules/emotionArc/components/__stories__/EmotionArcStories.tsx",
  role: "frontend-developer",
  allowedActions: ["scaffold", "visualize", "simulate", "accessibility"],
  tier: "Pro",
  contentSensitivity: "medium",
  theme: "emotional_modeling"
}
*/

import React from 'react';
import { Story, Meta } from '@storybook/react';
import { EmotionalBeat, SceneEmotionData, ArcSimulationResult, StoryOptimizationPlan } from '../../types/emotionTypes';

// Mock data for stories
const mockEmotionalBeats: EmotionalBeat[] = [
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

const mockSceneData: SceneEmotionData[] = [
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

const mockSimulation: ArcSimulationResult = {
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

const mockOptimizationPlan: StoryOptimizationPlan = {
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

// Storybook configuration
export default {
  title: 'EmotionArc/Components',
  parameters: {
    docs: {
      description: {
        component: 'Emotional Arc Modeling UI Components'
      }
    }
  }
} as Meta;

// EmotionTimelineChart Stories
export const EmotionTimelineChartDefault: Story = () => (
  <div className="p-6 bg-gray-50">
    <div className="max-w-4xl mx-auto">
      <h3 className="text-lg font-semibold mb-4">EmotionTimelineChart Component</h3>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
          <p className="text-gray-500">EmotionTimelineChart would render here</p>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p><strong>Props:</strong></p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>emotionalBeats: {mockEmotionalBeats.length} beats</li>
            <li>selectedCharacter: &quot;all&quot;</li>
            <li>simulation: tension curve data</li>
            <li>isLoading: false</li>
            <li>error: null</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);

export const EmotionTimelineChartLoading: Story = () => (
  <div className="p-6 bg-gray-50">
    <div className="max-w-4xl mx-auto">
      <h3 className="text-lg font-semibold mb-4">EmotionTimelineChart - Loading State</h3>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading emotional timeline...</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const EmotionTimelineChartError: Story = () => (
  <div className="p-6 bg-gray-50">
    <div className="max-w-4xl mx-auto">
      <h3 className="text-lg font-semibold mb-4">EmotionTimelineChart - Error State</h3>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-red-800 font-medium">Error loading emotional data</span>
          </div>
          <p className="text-red-700 mt-1 text-sm">Failed to analyze emotional content</p>
        </div>
      </div>
    </div>
  </div>
);

// TensionCurveViewer Stories
export const TensionCurveViewerDefault: Story = () => (
  <div className="p-6 bg-gray-50">
    <div className="max-w-4xl mx-auto">
      <h3 className="text-lg font-semibold mb-4">TensionCurveViewer Component</h3>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
          <p className="text-gray-500">TensionCurveViewer would render here</p>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p><strong>Props:</strong></p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>tensionCurve: {mockSimulation.tensionCurve.length} data points</li>
            <li>emotionalPeaks: {mockSimulation.emotionalPeaks.length} peaks</li>
            <li>readerEngagement: engagement analysis</li>
            <li>isLoading: false</li>
            <li>error: null</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);

// OptimizationSuggestions Stories
export const OptimizationSuggestionsDefault: Story = () => (
  <div className="p-6 bg-gray-50">
    <div className="max-w-4xl mx-auto">
      <h3 className="text-lg font-semibold mb-4">OptimizationSuggestions Component</h3>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="space-y-4">
          {mockOptimizationPlan.suggestions.map((suggestion, _index) => (
            <div key={suggestion.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">💡</span>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">{suggestion.title}</h4>
                    <p className="text-sm text-gray-600">{suggestion.description}</p>
                  </div>
                </div>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                  {suggestion.priority}
                </span>
              </div>
              <div className="mt-3 text-sm text-gray-600">
                <p><strong>Expected Impact:</strong></p>
                <div className="grid grid-cols-4 gap-2 mt-1">
                  <div>Tension: {suggestion.expectedImpact.tensionChange > 0 ? '+' : ''}{suggestion.expectedImpact.tensionChange}%</div>
                  <div>Empathy: +{suggestion.expectedImpact.empathyChange}%</div>
                  <div>Engagement: +{suggestion.expectedImpact.engagementChange}%</div>
                  <div>Complexity: {suggestion.expectedImpact.complexityChange > 0 ? '+' : ''}{suggestion.expectedImpact.complexityChange}%</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// SceneSentimentPanel Stories
export const SceneSentimentPanelDefault: Story = () => (
  <div className="p-6 bg-gray-50">
    <div className="max-w-4xl mx-auto">
      <h3 className="text-lg font-semibold mb-4">SceneSentimentPanel Component</h3>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="space-y-4">
          {mockSceneData.map((scene, _index) => (
            <div key={scene.sceneId} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Scene {scene.sceneId}</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {scene.processingMetadata.wordCount} words • {scene.processingMetadata.characterCount} characters
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                    {scene.overallSentiment}
                  </span>
                  <span className="text-xs font-medium text-red-600">
                    {Math.round(scene.tensionLevel)}% tension
                  </span>
                </div>
              </div>
              <div className="mt-3">
                <h5 className="text-xs font-medium text-gray-700 mb-2">Character Emotions</h5>
                <div className="flex flex-wrap gap-2">
                  {Array.from(scene.characterEmotions.entries()).map(([characterId, emotion]) => (
                    <div key={characterId} className="flex items-center space-x-1 px-2 py-1 text-xs bg-gray-100 rounded-full">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="font-medium">{characterId}</span>
                      <span className="text-gray-600">
                        {emotion.primaryEmotion} ({Math.round(emotion.intensity)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// CharacterArcSwitch Stories
export const CharacterArcSwitchDefault: Story = () => (
  <div className="p-6 bg-gray-50">
    <div className="max-w-4xl mx-auto">
      <h3 className="text-lg font-semibold mb-4">CharacterArcSwitch Component</h3>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">View:</span>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button className="px-3 py-1 text-xs font-medium rounded bg-white text-gray-900 shadow-sm">
              All Characters
            </button>
            <div className="relative">
              <button className="px-3 py-1 text-xs font-medium text-gray-600 bg-transparent border-none focus:outline-none">
                Individual
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-xs text-gray-500">(2 characters)</span>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p><strong>Props:</strong></p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>characterIds: [&quot;protagonist&quot;, &quot;antagonist&quot;]</li>
            <li>selectedCharacter: &quot;all&quot;</li>
            <li>isLoading: false</li>
            <li>disabled: false</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);

// EmotionalArcModule Stories
export const EmotionalArcModuleDefault: Story = () => (
  <div className="p-6 bg-gray-50">
    <div className="max-w-6xl mx-auto">
      <h3 className="text-lg font-semibold mb-4">EmotionalArcModule Component</h3>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Emotional Arc Analysis</h2>
              <p className="text-sm text-gray-600 mt-1">Test Story</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">View:</span>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button className="px-3 py-1 text-xs font-medium rounded bg-white text-gray-900 shadow-sm">
                    All Characters
                  </button>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div>Beats: 3</div>
                <div>Characters: 2</div>
                <div>Scenes: 2</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {['Timeline', 'Tension', 'Scenes', 'Suggestions'].map((tab, index) => (
              <button
                key={tab}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  index === 0 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
            <p className="text-gray-500">Component content would render here</p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span>Overall Tension: 70%</span>
              <span>Emotional Complexity: 65%</span>
              <span>Pacing Score: 75%</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>Model: gpt-4</span>
              <span>Analyzed: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Story configurations
EmotionTimelineChartDefault.storyName = 'EmotionTimelineChart - Default';
EmotionTimelineChartLoading.storyName = 'EmotionTimelineChart - Loading';
EmotionTimelineChartError.storyName = 'EmotionTimelineChart - Error';

TensionCurveViewerDefault.storyName = 'TensionCurveViewer - Default';

OptimizationSuggestionsDefault.storyName = 'OptimizationSuggestions - Default';

SceneSentimentPanelDefault.storyName = 'SceneSentimentPanel - Default';

CharacterArcSwitchDefault.storyName = 'CharacterArcSwitch - Default';

EmotionalArcModuleDefault.storyName = 'EmotionalArcModule - Default'; 