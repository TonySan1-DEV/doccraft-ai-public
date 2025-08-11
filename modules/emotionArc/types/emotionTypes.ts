// Core emotion types
export type BasicEmotion =
  | 'joy'
  | 'sadness'
  | 'fear'
  | 'anger'
  | 'disgust'
  | 'surprise'
  | 'neutral';

/**
 * Canonical emotion analysis shape with 0-100 scale for all numeric values
 */
export interface EmotionAnalysis {
  /** Scene identifier */
  sceneId: string;
  /** Character identifier (optional for scene-level analysis) */
  characterId?: string;
  /** Primary emotion detected (canonical field name) */
  dominantEmotion: BasicEmotion;
  /** Legacy field for backward compatibility - use dominantEmotion */
  primaryEmotion?: string;
  /** Emotional intensity on 0-100 scale */
  intensity: number; // 0-100 scale
  /** Model confidence on 0-100 scale */
  confidence?: number; // 0-100 scale
  /** Context clues and evidence for emotion detection */
  contextClues?: string[];
  /** Secondary emotions detected */
  secondaryEmotions?: string[];
  /** Emotion distribution across all categories */
  distribution?: Record<string, number>;
  /** Processing time in milliseconds */
  processingTime?: number;
  /** Analysis notes and context */
  notes?: string[];
  /** Additional metadata */
  metadata?: Record<string, unknown>;
  /** Tags for categorization */
  tags?: string[];
  /** Tension curve data */
  tensionCurve?: TensionPoint[];
  /** Arc segments */
  segments?: ArcSegment[];
  /** Validation status */
  ok?: boolean;
  /** Validation errors */
  errors?: string[];
  /** Validation warnings */
  warnings?: string[];
  /** Validation suggestions */
  suggestions?: string[];
  /** Creation timestamp */
  createdAt?: string | number | Date;
  /** Last update timestamp */
  updatedAt?: string | number | Date;
  /** Optional emotion vector with scores for each emotion type */
  vector?: Partial<Record<BasicEmotion, number>>;
  /** Emotional arc classification */
  emotionalArc?: string;
  /** Tension score on 0-100 scale */
  tensionScore?: number;
  /** Empathy score on 0-100 scale */
  empathyScore?: number;
  /** Emotional complexity score on 0-100 scale */
  emotionalComplexity?: number;
  /** Model version used */
  modelVersion?: string;
  /** Analysis method identifier */
  analysisMethod?: string;
  /** Analysis timestamp */
  timestamp?: number;
}

// Backward compatibility alias
export type EmotionAnalysisResult = EmotionAnalysis;

/**
 * Tension curve point with 0-100 scale for all numeric values
 */
export interface TensionPoint {
  /** Position in narrative (0-1 normalized) */
  position: number; // 0-1 normalized
  /** Tension level on 0-100 scale */
  tension: number; // 0-100 scale
  /** Engagement level on 0-100 scale */
  engagement?: number; // 0-100 scale
  /** Empathy potential on 0-100 scale */
  empathy?: number; // 0-100 scale
  /** Emotional complexity on 0-100 scale */
  emotionalComplexity?: number; // 0-100 scale
  /** Optional label for this point */
  label?: string;
}

export type TensionCurve = TensionPoint[];

/**
 * Arc segment representing an emotional section
 */
export interface ArcSegment {
  /** Start position (0-1 normalized) */
  start: number;
  /** End position (0-1 normalized) */
  end: number;
  /** Average tension on 0-100 scale */
  avgTension: number; // 0-100 scale
  /** Segment label */
  label?: string;
  /** Tension level on 0-100 scale (fallback to avgTension) */
  tensionLevel?: number; // 0-100 scale
  /** Primary emotion in this segment */
  emotion?: string;
  /** Confidence level for this segment */
  confidence?: number;
  /** Segment identifier */
  id?: string;
  /** Start position (0-1 normalized) */
  startPosition?: number;
  /** End position (0-1 normalized) */
  endPosition?: number;
  /** Emotional theme */
  emotionalTheme?: string;
  /** Intensity on 0-100 scale */
  intensity?: number; // 0-100 scale
  /** Scene identifiers in this segment */
  sceneIds?: string[];
  /** Character identifiers in this segment */
  characterIds?: string[];
  /** Emotional complexity on 0-100 scale */
  emotionalComplexity?: number; // 0-100 scale
}

// Simulation and validation result surfaces
export interface PacingAnalysis {
  slowSections: number[];
  fastSections: number[];
  optimalPacing: number[];
  pacingScore: number;
  avgPace?: number;
}

export interface ArcSimulationResult {
  curve: TensionCurve;
  segments?: ArcSegment[];
  pacingAnalysis?: PacingAnalysis;
  // Additional properties for backward compatibility
  emotionalArc?: string;
  tensionCurve?: TensionCurve; // Changed from number[] to TensionCurve
  empathyCurve?: number[];
  optimizationSuggestions?: OptimizationSuggestion[];
  readerEngagement?: {
    predictedDrops: number[];
    emotionalComplexity: number;
    highEngagementSections: number[];
    overallEngagement?: number;
  };
  // Additional properties used by components
  emotionalPeaks?: number[];
}

export interface ValidationResult {
  ok?: boolean;
  isValid?: boolean;
  issues?: string[];
  suggestions?: string[]; // add for callers that read suggestions
  errors?: string[];
  warnings?: string[];
}

// Suggestions and optimization
export type SuggestionImpact = 'low' | 'medium' | 'high';
export type SuggestionDifficulty = 'easy' | 'medium' | 'hard';

export interface OptimizationSuggestion {
  message: string;
  impact: SuggestionImpact;
  difficulty: SuggestionDifficulty;
  category:
    | 'pacing'
    | 'structure'
    | 'empathy'
    | 'cohesion'
    | 'tension'
    | 'engagement'
    | 'complexity'; // extend as needed
  confidence: number; // 0-100 scale
  specificChanges?: string[]; // allow optional per callers
  // Additional properties for backward compatibility
  id?: string;
  title?: string;
  description?: string;
  type?: 'tension' | 'empathy' | 'engagement' | 'complexity' | 'pacing';
  priority?: 'high' | 'medium' | 'low';
  expectedImpact?: {
    tensionChange: number;
    empathyChange: number;
    engagementChange: number;
    complexityChange?: number;
  };
  targetPositions?: number[];
  riskLevel?: 'low' | 'medium' | 'high';
  implementationDifficulty?: 'easy' | 'medium' | 'hard';
  estimatedTime?: number;
}

// Tiny helpers
export function isTensionPoint(x: unknown): x is TensionPoint {
  return (
    !!x && typeof x === 'object' && 'tension' in (x as Record<string, unknown>)
  );
}

export function asNumber(n: number | undefined, fallback = 0): number {
  return typeof n === 'number' ? n : fallback;
}

/**
 * Safely access emotion analysis with fallback for primaryEmotion -> dominantEmotion
 */
export function getDominantEmotion(analysis: EmotionAnalysis): BasicEmotion {
  return analysis.dominantEmotion || analysis.primaryEmotion || 'neutral';
}

/**
 * Safely get intensity with 0-100 scale validation
 */
export function getIntensity(analysis: EmotionAnalysis): number {
  const intensity = analysis.intensity ?? 0;
  return Math.max(0, Math.min(100, intensity));
}

/**
 * Safely get context clues with fallback
 */
export function getContextClues(analysis: EmotionAnalysis): string[] {
  return analysis.contextClues || [];
}

/**
 * Safely get secondary emotions with fallback
 */
export function getSecondaryEmotions(analysis: EmotionAnalysis): string[] {
  return analysis.secondaryEmotions || [];
}

/**
 * Safely get confidence with 0-100 scale validation
 */
export function getConfidence(analysis: EmotionAnalysis): number {
  const confidence = analysis.confidence ?? 0;
  return Math.max(0, Math.min(100, confidence));
}

// Legacy interfaces for backward compatibility
export interface EmotionalBeat {
  id: string;
  sceneId: string;
  characterId: string;
  emotion: string;
  /** Intensity on 0-100 scale */
  intensity: number; // 0-100 scale
  timestamp: number;
  // Additional properties used by components
  narrativePosition?: number;
  context?: string;
  /** Confidence on 0-100 scale */
  confidence?: number; // 0-100 scale
  secondaryEmotions?: string[];
}

export interface EmotionTimeline {
  beats: EmotionalBeat[];
  tensionCurve: TensionCurve;
  empathyCurve: number[];
}

export interface CharacterEmotionData {
  characterId: string;
  /** Primary emotion (legacy field, use dominantEmotion in EmotionAnalysis) */
  primaryEmotion: string;
  /** Dominant emotion (canonical field name) */
  dominantEmotion: string;
  /** Intensity on 0-100 scale */
  intensity: number; // 0-100 scale
  secondaryEmotions: string[];
  /** Confidence on 0-100 scale */
  confidence: number; // 0-100 scale
  context: string;
  // Additional properties used by components
  /** Emotional complexity on 0-100 scale */
  emotionalComplexity?: number; // 0-100 scale
  contextClues?: string[];
  /** Model confidence on 0-100 scale */
  modelConfidence?: number; // 0-100 scale
  processingTime?: number;
}

export interface ProcessingMetadata {
  modelVersion: string;
  processingTime: number;
  confidence: number;
  analysisMethod: string;
  timestamp: number;
  wordCount?: number;
  characterCount?: number;
  analysisTime?: number;
}

export interface SceneEmotionData {
  sceneId: string;
  sceneText: string;
  characterEmotions: Map<string, CharacterEmotionData>;
  overallSentiment: string;
  tensionLevel: number;
  emotionalBeats: EmotionalBeat[];
  processingMetadata: ProcessingMetadata;
  // Additional properties for backward compatibility
  emotions?: EmotionalBeat[];
  analysis?: EmotionAnalysis;
}

export interface StoryOptimizationPlan {
  suggestions: OptimizationSuggestion[];
  priority: 'high' | 'medium' | 'low';
  estimatedImpact: number;
  overallScore?: number;
  // Additional properties used by components
  estimatedImprovement?: {
    tension: number;
    empathy: number;
    engagement: number;
    overall: number;
  };
  riskAssessment?: {
    highRisk: string[];
    mediumRisk: string[];
    lowRisk: string[];
  };
  implementationOrder?: string[];
}

export interface EmotionalArc {
  id: string;
  name: string;
  beats: EmotionalBeat[];
  analysis: EmotionAnalysis;
  // Additional properties used by components
  title?: string;
  segments?: any[];
  overallTension?: number;
  emotionalComplexity?: number;
  pacingScore?: number;
  metadata?: {
    totalScenes: number;
    totalCharacters: number;
    analysisTimestamp: number;
    modelUsed: string;
  };
  readerSimulation?: ReaderSimResult;
}

export interface ReaderSimResult {
  emotionalResponse: string;
  engagement: number;
  empathy: number;
  empathyScore?: number;
  predictedEngagementDrop?: boolean;
  engagementDrops?: number[];
  highEngagementSections?: number[];
  tensionCurve?: TensionCurve;
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
  modelProvider?: string;
  enableCache?: boolean;
  cacheExpiry?: number;
  batchSize?: number;
  modelName?: string;
  temperature?: number;
  maxTokens?: number;
  confidenceThreshold?: number;
  maxRetries?: number;
  timeout?: number;
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
  empathyLevel?: number;
  tensionTolerance?: number;
  emotionalComplexity?: number;
  readingSpeed?: string;
  attentionSpan?: number;
  preferredGenres?: string[];
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

export interface AnalysisCache {
  key: string;
  data: AnalysisResponse;
  timestamp: number;
  ttl: number;
}

// Error types for backward compatibility
export interface EmotionAnalysisError {
  type: string;
  message: string;
  details?: any;
  retryable?: boolean;
  suggestedAction?: string;
}

export interface EmotionAnalysisEvent {
  type: string;
  timestamp: number;
  data?: any;
}
