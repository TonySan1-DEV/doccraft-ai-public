export const mcpContext = {
  file: 'modules/styleProfile/types/styleTypes.ts',
  role: 'developer',
  allowedActions: ['refactor', 'type-harden', 'test'],
  contentSensitivity: 'low',
  theme: 'doccraft-ai',
};

// Branded types for strict validation
export type ConfidenceScore = number & { readonly __brand: 'ConfidenceScore' };
export type PacingScore = number & { readonly __brand: 'PacingScore' };
export type EmotionDensity = number & { readonly __brand: 'EmotionDensity' };
export type LexicalComplexity = number & {
  readonly __brand: 'LexicalComplexity';
};

// Type guards for branded types
export const isValidConfidenceScore = (n: number): n is ConfidenceScore =>
  Number.isFinite(n) && n >= 0 && n <= 100;

export const isValidPacingScore = (n: number): n is PacingScore =>
  Number.isFinite(n) && n >= 0 && n <= 1;

export const isValidEmotionDensity = (n: number): n is EmotionDensity =>
  Number.isFinite(n) && n >= 0 && n <= 1;

export const isValidLexicalComplexity = (n: number): n is LexicalComplexity =>
  Number.isFinite(n) && n >= 0 && n <= 1;

// Factory functions for branded types
export const createConfidenceScore = (n: number): ConfidenceScore => {
  if (!isValidConfidenceScore(n)) {
    throw new Error(`Invalid confidence score: ${n}. Must be 0-100.`);
  }
  return n as ConfidenceScore;
};

export const createPacingScore = (n: number): PacingScore => {
  if (!isValidPacingScore(n)) {
    throw new Error(`Invalid pacing score: ${n}. Must be 0-1.`);
  }
  return n as PacingScore;
};

export const createEmotionDensity = (n: number): EmotionDensity => {
  if (!isValidEmotionDensity(n)) {
    throw new Error(`Invalid emotion density: ${n}. Must be 0-1.`);
  }
  return n as EmotionDensity;
};

export const createLexicalComplexity = (n: number): LexicalComplexity => {
  if (!isValidLexicalComplexity(n)) {
    throw new Error(`Invalid lexical complexity: ${n}. Must be 0-1.`);
  }
  return n as LexicalComplexity;
};

export const createStrictString = (s: string): StrictString => {
  if (typeof s !== 'string' || s.length === 0) {
    throw new Error(`Invalid strict string: ${s}`);
  }
  return s as StrictString;
};

// Utility types for strict validation
export type NonEmptyArray<T> = [T, ...T[]];
export type StrictString = string & { readonly __brand: 'StrictString' };

export type StyleDimension =
  | 'color'
  | 'typography'
  | 'tone'
  | 'spacing'
  | 'contrast';

export interface StyleScore {
  key: StyleDimension;
  value: number /* 0..100 */;
}

export interface StyleProfile {
  scores: StyleScore[];
  normalizedTone?: number /* 0..1 */;
}

// Strict tone and voice types with literal unions
export type NarrativeTone =
  | 'neutral'
  | 'emotive'
  | 'dark'
  | 'warm'
  | 'sarcastic'
  | 'tense'
  | 'melancholic'
  | 'optimistic';

export type NarrativeVoice =
  | 'formal'
  | 'casual'
  | 'omniscient'
  | 'intimate'
  | 'stream-of-consciousness'
  | 'conversational'
  | 'poetic';

export type NarrativeStyleProfile = {
  tone: NarrativeTone;
  voice: NarrativeVoice;
  pacingScore: PacingScore; // 0 (slow) – 1 (fast), clamped to 0-1
  emotionDensity: EmotionDensity; // 0–1 ratio of emotional content, clamped to 0-1
  lexicalComplexity: LexicalComplexity; // 0 (simple) – 1 (dense), clamped to 0-1
  sentenceVariance: number; // Std deviation of sentence length
  keyDescriptors: NonEmptyArray<string>; // Extracted adjectives or tonal markers, non-empty
  // Confidence fields - all clamped to 0-100
  toneConfidence: ConfidenceScore;
  voiceConfidence: ConfidenceScore;
  pacingScoreConfidence: ConfidenceScore;
  emotionDensityConfidence: ConfidenceScore;
  lexicalComplexityConfidence: ConfidenceScore;
  sentenceVarianceConfidence: ConfidenceScore;
  keyDescriptorsConfidence: ConfidenceScore;
  warning?: StrictString;
};

export type StyleTargetProfile = {
  genre: StrictString;
  expectedTone: NarrativeTone;
  targetVoice: NarrativeVoice;
  pacingRange: [PacingScore, PacingScore]; // 0-1 range
  emotionDensityRange: [EmotionDensity, EmotionDensity]; // 0-1 range
};

export type StyleAlignmentReport = {
  alignmentScore: ConfidenceScore; // 0–100, clamped and validated
  driftFlags: NonEmptyArray<string>; // e.g., ["tone too formal", "emotion density low"]
  recommendations: string[]; // AI rewrite tips
  profile: NarrativeStyleProfile;
};

// Advanced utility types for type-safe operations
export type StyleMetricKey = keyof Pick<
  NarrativeStyleProfile,
  'pacingScore' | 'emotionDensity' | 'lexicalComplexity' | 'sentenceVariance'
>;

export type ConfidenceMetricKey = keyof Pick<
  NarrativeStyleProfile,
  | 'toneConfidence'
  | 'voiceConfidence'
  | 'pacingScoreConfidence'
  | 'emotionDensityConfidence'
  | 'lexicalComplexityConfidence'
  | 'sentenceVarianceConfidence'
  | 'keyDescriptorsConfidence'
>;

// Type-safe style comparison result
export type StyleComparisonResult<T extends StyleMetricKey> = {
  metric: T;
  current: NarrativeStyleProfile[T];
  target: StyleTargetProfile;
  deviation: number;
  isAligned: boolean;
  recommendation: string;
};

// Generic constraint for style metrics
export type StyleMetricValue<T extends StyleMetricKey> =
  NarrativeStyleProfile[T] extends number ? number : never;
