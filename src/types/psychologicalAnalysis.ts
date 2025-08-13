/**
 * Advanced Character Psychology System
 * Comprehensive interfaces for psychological analysis, character development,
 * and AI-powered character profiling.
 */

// ============================================================================
// CORE PSYCHOLOGICAL FRAMEWORKS
// ============================================================================

export type PsychologicalFramework =
  | 'CBT' // Cognitive Behavioral Therapy
  | 'Psychodynamic' // Psychodynamic Theory
  | 'Humanistic' // Humanistic Psychology
  | 'Behavioral' // Behavioral Psychology
  | 'Gestalt' // Gestalt Psychology
  | 'Existential' // Existential Psychology
  | 'TraumaInformed'; // Trauma-Informed Care

export interface FrameworkConfig {
  name: PsychologicalFramework;
  description: string;
  keyPrinciples: string[];
  applicationAreas: string[];
  strengths: string[];
  limitations: string[];
}

// ============================================================================
// CHARACTER PROMPTS AND ANALYSIS
// ============================================================================

export interface CharacterPrompt {
  id: string;
  framework: PsychologicalFramework;
  category:
    | 'personality'
    | 'motivation'
    | 'conflict'
    | 'growth'
    | 'relationship';
  prompt: string;
  followUpQuestions: string[];
  expectedInsights: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // in minutes
  tags: string[];
}

export interface PromptResponse {
  promptId: string;
  response: string;
  insights: string[];
  confidence: number; // 0-1
  followUpSuggestions: string[];
  timestamp: Date;
}

// ============================================================================
// PERSONALITY PATTERNS AND TRAITS
// ============================================================================

export interface PersonalityPattern {
  id: string;
  name: string;
  description: string;
  characteristics: string[];
  strengths: string[];
  challenges: string[];
  growthAreas: string[];
  compatibility: string[];
  framework: PsychologicalFramework;
  confidence: number;
  evidence: string[];
}

export interface CognitiveTrait {
  name: string;
  value: number; // 0-100
  description: string;
  implications: string[];
  developmentSuggestions: string[];
}

export interface EmotionalPattern {
  primaryEmotion: string;
  intensity: number; // 0-100
  triggers: string[];
  responses: string[];
  copingMechanisms: string[];
  growthPotential: number;
}

export interface MotivationalDriver {
  type: 'achievement' | 'affiliation' | 'power' | 'autonomy' | 'mastery';
  strength: number; // 0-100
  description: string;
  manifestations: string[];
  potentialConflicts: string[];
}

// ============================================================================
// CHARACTER DEVELOPMENT ARCS
// ============================================================================

export interface CharacterArc {
  id: string;
  name: string;
  description: string;
  stages: ArcStage[];
  psychologicalThemes: string[];
  growthMetrics: GrowthMetric[];
  estimatedDuration: number; // in story chapters/scenes
  complexity: 'simple' | 'moderate' | 'complex';
  emotionalIntensity: number; // 0-100
}

export interface ArcStage {
  name: string;
  description: string;
  psychologicalState: string;
  challenges: string[];
  growthOpportunities: string[];
  emotionalBeats: string[];
  duration: number; // relative to total arc
}

export interface GrowthMetric {
  aspect: string;
  startingValue: number;
  targetValue: number;
  currentValue: number;
  measurement: string;
  progress: number; // 0-100
}

// ============================================================================
// PSYCHOLOGICAL ANALYSIS RESULTS
// ============================================================================

export interface PsychologicalProfile {
  characterId: string;
  timestamp: Date;
  overallComplexity: number; // 0-100
  psychologicalDepth: number; // 0-100
  consistency: number; // 0-100
  growthPotential: number; // 0-100

  frameworks: {
    [key in PsychologicalFramework]: {
      score: number;
      insights: string[];
      recommendations: string[];
    };
  };

  patterns: PersonalityPattern[];
  cognitiveTraits: CognitiveTrait[];
  emotionalPatterns: EmotionalPattern[];
  motivationalDrivers: MotivationalDriver[];

  developmentArcs: CharacterArc[];
  promptHistory: PromptResponse[];

  analysis: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
    recommendations: string[];
  };
}

// ============================================================================
// ANALYSIS METRICS AND QUALITY ASSESSMENT
// ============================================================================

export interface AnalysisMetrics {
  executionTime: number; // in milliseconds
  memoryUsage?: number; // in MB (if available)
  qualityScore: number; // 0-100
  confidence: number; // 0-100
  consistency: number; // 0-100
  completeness: number; // 0-100
  errorRate: number; // 0-100
  userSatisfaction?: number; // 0-100
}

export interface PromptQualityMetrics {
  promptId: string;
  clarity: number; // 0-100
  relevance: number; // 0-100
  effectiveness: number; // 0-100
  userEngagement: number; // 0-100
  insightGeneration: number; // 0-100
  overallScore: number; // 0-100
  feedback: string[];
}

// ============================================================================
// INTEGRATION AND COMPATIBILITY
// ============================================================================

export interface CharacterPersonaExtension {
  psychologicalProfile: PsychologicalProfile;
  analysisMetrics: AnalysisMetrics;
  promptQualityMetrics: PromptQualityMetrics[];
  lastAnalysis: Date;
  analysisVersion: string;
  frameworkPreferences: PsychologicalFramework[];
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type AnalysisStatus = 'pending' | 'in_progress' | 'completed' | 'failed';
export type ComplexityLevel = 'low' | 'medium' | 'high' | 'expert';
export type GrowthDirection = 'positive' | 'negative' | 'neutral' | 'mixed';

export interface AnalysisRequest {
  characterId: string;
  frameworks: PsychologicalFramework[];
  depth: ComplexityLevel;
  includeArcs: boolean;
  includePrompts: boolean;
  priority: 'low' | 'normal' | 'high';
}

export interface AnalysisResponse {
  requestId: string;
  status: AnalysisStatus;
  profile?: PsychologicalProfile;
  metrics?: AnalysisMetrics;
  error?: string;
  estimatedCompletion?: Date;
  progress?: number; // 0-100
}
