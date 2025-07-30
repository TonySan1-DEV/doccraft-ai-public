export type NarrativeStyleProfile = {
  tone: "neutral" | "emotive" | "dark" | "warm" | "sarcastic" | string;
  voice: "formal" | "casual" | "omniscient" | "intimate" | "stream-of-consciousness";
  pacingScore: number;        // 0 (slow) – 1 (fast)
  emotionDensity: number;     // 0–1 ratio of emotional content
  lexicalComplexity: number;  // 0 (simple) – 1 (dense)
  sentenceVariance: number;   // Std deviation of sentence length
  keyDescriptors: string[];   // Extracted adjectives or tonal markers
  // Confidence fields
  toneConfidence: number;
  voiceConfidence: number;
  pacingScoreConfidence: number;
  emotionDensityConfidence: number;
  lexicalComplexityConfidence: number;
  sentenceVarianceConfidence: number;
  keyDescriptorsConfidence: number;
  warning?: string;
};

export type StyleTargetProfile = {
  genre: string;
  expectedTone: string;
  targetVoice: string;
  pacingRange: [number, number];
  emotionDensityRange: [number, number];
};

export type StyleAlignmentReport = {
  alignmentScore: number;     // 0–100
  driftFlags: string[];       // e.g., ["tone too formal", "emotion density low"]
  recommendations: string[];  // AI rewrite tips
  profile: NarrativeStyleProfile;
}; 