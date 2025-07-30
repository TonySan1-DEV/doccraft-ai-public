// MCP Context Block
/*
{
  file: "modules/emotionArc/types/emotionTypes.ts",
  role: "developer",
  allowedActions: ["scaffold", "structure", "define"],
  tier: "Pro",
  contentSensitivity: "medium",
  theme: "writing_suite"
}
*/

// Core Emotional Data Types
export type EmotionalBeat = {
  sceneId: string;
  characterId: string;
  emotion: string; // e.g. "joy", "fear", "conflict"
  intensity: number; // 0–100
  narrativePosition: number; // 0–1 (normalized)
  timestamp: number;
  context?: string;
  confidence?: number;
  secondaryEmotions?: string[];
};

export type ArcSegment = {
  start: number;
  end: number;
  tensionLevel: number;
  sentiment: string;
  feedback: string[];
  characterIds: string[];
  sceneIds: string[];
  emotionalComplexity: number;
};

export type ReaderSimResult = {
  empathyScore: number;
  predictedEngagementDrop: boolean;
  notes: string[];
  emotionalPeaks: number[];
  tensionCurve: Array<{position: number, tension: number}>;
  engagementDrops: number[];
  highEngagementSections: number[];
};

export type EmotionalArc = {
  id: string;
  title: string;
  beats: EmotionalBeat[];
  segments: ArcSegment[];
  readerSimulation: ReaderSimResult;
  overallTension: number;
  emotionalComplexity: number;
  pacingScore: number;
  metadata?: {
    totalScenes: number;
    totalCharacters: number;
    analysisTimestamp: number;
    modelUsed: string;
  };
};

export type CharacterEmotionalProfile = {
  characterId: string;
  characterName: string;
  emotionalRange: string[];
  defaultEmotion: string;
  emotionalStability: number; // 0-100
  empathyPotential: number; // 0-100
  arcBeats: EmotionalBeat[];
  dominantEmotions: Array<{emotion: string, frequency: number}>;
};

export type StoryEmotionalMap = {
  storyId: string;
  title: string;
  characters: CharacterEmotionalProfile[];
  overallArc: EmotionalArc;
  chapterArcs: EmotionalArc[];
  tensionThresholds: {
    low: number;
    medium: number;
    high: number;
  };
  readerProfile?: ReaderProfile;
};

// Analysis Result Types
export type EmotionAnalysisResult = {
  primaryEmotion: string;
  intensity: number;
  confidence: number;
  secondaryEmotions: string[];
  emotionalComplexity: number;
  contextClues: string[];
  modelConfidence: number;
  processingTime: number;
};

export type SceneEmotionData = {
  sceneId: string;
  sceneText: string;
  characterEmotions: Map<string, EmotionAnalysisResult>;
  overallSentiment: string;
  tensionLevel: number;
  emotionalBeats: EmotionalBeat[];
  processingMetadata: {
    wordCount: number;
    characterCount: number;
    analysisTime: number;
  };
};

// Simulation Types
export type TensionCurve = {
  position: number;
  tension: number;
  empathy: number;
  engagement: number;
  emotionalComplexity: number;
};

export type ArcSimulationResult = {
  tensionCurve: TensionCurve[];
  emotionalPeaks: number[];
  pacingAnalysis: {
    slowSections: number[];
    fastSections: number[];
    optimalPacing: number[];
    pacingScore: number;
  };
  readerEngagement: {
    predictedDrops: number[];
    highEngagementSections: number[];
    emotionalComplexity: number;
    overallEngagement: number;
  };
};

// Optimization Types
export type OptimizationSuggestion = {
  id: string;
  type: 'pacing' | 'tension' | 'empathy' | 'engagement' | 'complexity';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  specificChanges: string[];
  expectedImpact: {
    tensionChange: number;
    empathyChange: number;
    engagementChange: number;
    complexityChange: number;
  };
  targetPositions: number[];
  riskLevel: 'low' | 'medium' | 'high';
  implementationDifficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number; // minutes
};

export type StoryOptimizationPlan = {
  suggestions: OptimizationSuggestion[];
  overallScore: number;
  implementationOrder: string[];
  riskAssessment: {
    highRisk: string[];
    mediumRisk: string[];
    lowRisk: string[];
  };
  estimatedImprovement: {
    tension: number;
    empathy: number;
    engagement: number;
    overall: number;
  };
};

// Configuration Types
export type EmotionAnalyzerConfig = {
  modelProvider: ModelProvider;
  modelName: string;
  temperature: number;
  maxTokens: number;
  batchSize: number;
  enableCache: boolean;
  cacheExpiry: number; // seconds
  confidenceThreshold: number;
  maxRetries: number;
  timeout: number; // milliseconds
};

export type ModelProvider = 'openai' | 'anthropic' | 'local' | 'custom';

export type ReaderProfile = {
  empathyLevel: number; // 0-100
  tensionTolerance: number; // 0-100
  emotionalComplexity: number; // 0-100
  preferredGenres: string[];
  readingSpeed: 'slow' | 'medium' | 'fast';
  attentionSpan: number; // minutes
};

// Input/Output Types
export type SceneInput = {
  sceneId: string;
  text: string;
  characterIds: string[];
  metadata?: {
    chapter?: number;
    wordCount?: number;
    timestamp?: number;
  };
};

export type AnalysisRequest = {
  scenes: SceneInput[];
  config?: Partial<EmotionAnalyzerConfig>;
  readerProfile?: ReaderProfile;
  focusCharacter?: string;
};

export type AnalysisResponse = {
  emotionalArc: EmotionalArc;
  sceneData: SceneEmotionData[];
  simulation: ArcSimulationResult;
  optimizationPlan: StoryOptimizationPlan;
  processingTime: number;
  modelInfo: {
    provider: ModelProvider;
    modelName: string;
    version: string;
  };
};

// Error Types
export type EmotionAnalysisError = {
  code: 'MODEL_ERROR' | 'VALIDATION_ERROR' | 'TIMEOUT_ERROR' | 'RATE_LIMIT_ERROR';
  message: string;
  details?: any;
  retryable: boolean;
  suggestedAction?: string;
};

// Event Types
export type EmotionAnalysisEvent = {
  type: 'analysis_started' | 'analysis_completed' | 'analysis_failed' | 'optimization_suggested';
  timestamp: number;
  data: any;
  sessionId: string;
};

// Validation Types
export type ValidationResult = {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
};

// Cache Types
export type AnalysisCache = {
  key: string;
  result: AnalysisResponse;
  timestamp: number;
  expiry: number;
  metadata: {
    sceneCount: number;
    characterCount: number;
    modelUsed: string;
  };
}; 