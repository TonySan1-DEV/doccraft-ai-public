export interface EmotionalBeat {
  id: string;
  sceneId: string;
  characterId: string;
  emotion: string;
  intensity: number;
  timestamp: number;
  // Additional properties used by components
  narrativePosition?: number;
  context?: string;
  confidence?: number;
  secondaryEmotions?: string[];
}

export interface EmotionTimeline {
  beats: EmotionalBeat[];
  tensionCurve: number[];
  empathyCurve: number[];
}

export interface EmotionAnalysis {
  dominantEmotion: string;
  emotionalArc: string;
  tensionScore: number;
  empathyScore: number;
}

export interface CharacterEmotionData {
  characterId: string;
  primaryEmotion: string;
  intensity: number;
  secondaryEmotions: string[];
  confidence: number;
  context: string;
}

export interface ProcessingMetadata {
  modelVersion: string;
  processingTime: number;
  confidence: number;
  analysisMethod: string;
  timestamp: number;
}

export interface SceneEmotionData {
  sceneId: string;
  emotions: EmotionalBeat[];
  analysis: EmotionAnalysis;
  // Additional properties used by components
  sceneText?: string;
  overallSentiment?: string;
  tensionLevel?: number;
  characterEmotions?: Map<string, CharacterEmotionData>;
  emotionalBeats?: EmotionalBeat[];
  processingMetadata?: ProcessingMetadata;
}

// Additional interfaces used by components
export interface OptimizationSuggestion {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  confidence: number;
  specificChanges?: string[];
}

export interface StoryOptimizationPlan {
  suggestions: OptimizationSuggestion[];
  priority: 'high' | 'medium' | 'low';
  estimatedImpact: number;
}

export interface ArcSimulationResult {
  emotionalArc: string;
  tensionCurve: number[];
  empathyCurve: number[];
  optimizationSuggestions: OptimizationSuggestion[];
}

export interface TensionCurve {
  points: number[];
  analysis: string;
}

export interface EmotionalArc {
  id: string;
  name: string;
  beats: EmotionalBeat[];
  analysis: EmotionAnalysis;
}

export interface ArcSegment {
  id: string;
  startPosition: number;
  endPosition: number;
  emotionalTheme: string;
  intensity: number;
}

export interface ReaderSimResult {
  emotionalResponse: string;
  engagement: number;
  empathy: number;
}

export interface CharacterEmotionalProfile {
  characterId: string;
  emotionalRange: string[];
  defaultEmotion: string;
  emotionalTriggers: string[];
}

export interface StoryEmotionalMap {
  scenes: SceneEmotionData[];
  overallArc: EmotionalArc;
  characterProfiles: CharacterEmotionalProfile[];
}

export interface EmotionAnalyzerConfig {
  model: string;
  sensitivity: number;
  contextWindow: number;
}

export interface ModelProvider {
  name: string;
  apiKey?: string;
  endpoint?: string;
}

export interface ReaderProfile {
  id: string;
  preferences: string[];
  emotionalSensitivity: number;
  genrePreferences: string[];
}

export interface SceneInput {
  id: string;
  text: string;
  characters: string[];
  context: string;
}

export interface AnalysisRequest {
  scenes: SceneInput[];
  readerProfile?: ReaderProfile;
  config?: EmotionAnalyzerConfig;
}

export interface AnalysisResponse {
  results: SceneEmotionData[];
  overallAnalysis: EmotionAnalysis;
  optimizationPlan?: StoryOptimizationPlan;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions?: string[];
}

export interface AnalysisCache {
  key: string;
  data: AnalysisResponse;
  timestamp: number;
  ttl: number;
}
