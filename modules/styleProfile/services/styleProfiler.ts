// MCP Context Block
/*
role: developer,
tier: Pro,
file: "modules/styleProfile/services/styleProfiler.ts",
allowedActions: ["scaffold", "analyze", "compare"],
theme: "style_analysis"
*/

import type { NarrativeStyleProfile, StyleTargetProfile, StyleAlignmentReport } from '../types/styleTypes';

// Simple emotion word list for density
const EMOTION_WORDS = [
  'love', 'hate', 'fear', 'joy', 'anger', 'sad', 'happy', 'excited', 'calm', 'anxious', 'hope', 'despair',
  'surprise', 'disgust', 'trust', 'anticipation', 'conflict', 'peace', 'tension', 'relief', 'regret', 'pride', 'shame'
];

function countEmotionWords(text: string): number {
  const words = text.toLowerCase().split(/\W+/);
  return words.filter(w => EMOTION_WORDS.includes(w)).length;
}

function lexicalComplexity(text: string): number {
  const words = text.split(/\W+/).filter(Boolean);
  const unique = new Set(words.map(w => w.toLowerCase()));
  return words.length ? Math.min(1, unique.size / words.length) : 0;
}

function sentenceVariance(text: string): number {
  const sentences = text.split(/[.!?]/).map(s => s.trim()).filter(Boolean);
  const lengths = sentences.map(s => s.split(/\s+/).length);
  if (lengths.length < 2) return 0;
  const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance = lengths.reduce((sum, l) => sum + Math.pow(l - mean, 2), 0) / (lengths.length - 1);
  return Math.sqrt(variance);
}

function extractAdjectives(text: string): string[] {
  // Simple heuristic: words ending in 'y', 'ful', 'ous', 'ive', 'al', 'ic', 'less', 'able', 'ible'
  return Array.from(new Set(
    text.split(/\W+/).filter(w => /(?:y|ful|ous|ive|al|ic|less|able|ible)$/.test(w))
  ));
}

// Async-safe LLM call placeholder
async function callLLMForStyle(input: string): Promise<Partial<NarrativeStyleProfile> & { confidence: number }> {
  // Simulate delay and return empty (ready for real LLM integration)
  await new Promise(res => setTimeout(res, 50));
  return { confidence: 0.5 };
}

export async function analyzeNarrativeStyle(input: string): Promise<NarrativeStyleProfile> {
  // Fallback for unsupported/non-narrative text
  if (!input || input.trim().length < 20 || input.split(/[.!?]/).length < 2) {
    return {
      tone: 'neutral',
      voice: 'omniscient',
      pacingScore: 0.5,
      emotionDensity: 0,
      lexicalComplexity: 0,
      sentenceVariance: 0,
      keyDescriptors: [],
      // Confidence fields
      toneConfidence: 0.2,
      voiceConfidence: 0.2,
      pacingScoreConfidence: 0.2,
      emotionDensityConfidence: 0.2,
      lexicalComplexityConfidence: 0.2,
      sentenceVarianceConfidence: 0.2,
      keyDescriptorsConfidence: 0.2,
      warning: 'Input too short or not narrative. Style analysis may be unreliable.'
    } as any;
  }

  // Heuristic analysis (replace with LLM/NLP for production)
  const wordCount = input.split(/\W+/).filter(Boolean).length;
  const emotionCount = countEmotionWords(input);
  const emotionDensity = wordCount ? Math.min(1, emotionCount / wordCount) : 0;
  const complexity = lexicalComplexity(input);
  const variance = sentenceVariance(input);
  const keyDescriptors = extractAdjectives(input);

  // Mock tone/voice detection
  let tone: NarrativeStyleProfile['tone'] = 'neutral';
  let toneConfidence = 0.7;
  if (/dark|gloomy|grim|bleak/.test(input)) { tone = 'dark'; toneConfidence = 0.9; }
  else if (/warm|gentle|kind|hopeful/.test(input)) { tone = 'warm'; toneConfidence = 0.9; }
  else if (/sarcastic|ironic|mock/.test(input)) { tone = 'sarcastic'; toneConfidence = 0.8; }
  else if (emotionDensity > 0.1) { tone = 'emotive'; toneConfidence = 0.8; }

  let voice: NarrativeStyleProfile['voice'] = 'omniscient';
  let voiceConfidence = 0.7;
  if (/I\s|my\s|me\s|mine\s/.test(input)) { voice = 'intimate'; voiceConfidence = 0.9; }
  else if (/we\s|us\s|our\s/.test(input)) { voice = 'casual'; voiceConfidence = 0.8; }
  else if (/thou|thee|thy|thine/.test(input)) { voice = 'formal'; voiceConfidence = 0.8; }

  // Pacing: short sentences = fast, long = slow
  const pacingScore = variance < 7 ? 1 : 0.3;
  const pacingScoreConfidence = 0.7;
  const emotionDensityConfidence = 0.7;
  const lexicalComplexityConfidence = 0.7;
  const sentenceVarianceConfidence = 0.7;
  const keyDescriptorsConfidence = 0.6;

  // Optionally, merge with LLM output
  // const llmResult = await callLLMForStyle(input);

  return {
    tone,
    voice,
    pacingScore,
    emotionDensity,
    lexicalComplexity: complexity,
    sentenceVariance: variance,
    keyDescriptors,
    // Confidence fields
    toneConfidence,
    voiceConfidence,
    pacingScoreConfidence,
    emotionDensityConfidence,
    lexicalComplexityConfidence,
    sentenceVarianceConfidence,
    keyDescriptorsConfidence
  };
}

export function compareToTargetStyle(
  profile: NarrativeStyleProfile,
  target: StyleTargetProfile
): StyleAlignmentReport {
  const driftFlags: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  // Tone
  if (profile.tone !== target.expectedTone) {
    driftFlags.push(`tone is ${profile.tone}, expected ${target.expectedTone}`);
    recommendations.push(`Adjust tone toward ${target.expectedTone}.`);
    score -= 20;
  }
  // Voice
  if (profile.voice !== target.targetVoice) {
    driftFlags.push(`voice is ${profile.voice}, expected ${target.targetVoice}`);
    recommendations.push(`Rewrite to use ${target.targetVoice} voice.`);
    score -= 20;
  }
  // Pacing
  if (profile.pacingScore < target.pacingRange[0]) {
    driftFlags.push('pacing too slow');
    recommendations.push('Shorten sentences or increase action.');
    score -= 15;
  } else if (profile.pacingScore > target.pacingRange[1]) {
    driftFlags.push('pacing too fast');
    recommendations.push('Add description or slow scene transitions.');
    score -= 10;
  }
  // Emotion density
  if (profile.emotionDensity < target.emotionDensityRange[0]) {
    driftFlags.push('emotion density low');
    recommendations.push('Add more emotional language.');
    score -= 10;
  } else if (profile.emotionDensity > target.emotionDensityRange[1]) {
    driftFlags.push('emotion density high');
    recommendations.push('Balance emotional content.');
    score -= 10;
  }
  // Lexical complexity (optional)
  if (profile.lexicalComplexity < 0.2) {
    driftFlags.push('vocabulary too simple');
    recommendations.push('Use more varied vocabulary.');
    score -= 5;
  }
  // Clamp score
  score = Math.max(0, Math.round(score));

  return {
    alignmentScore: score,
    driftFlags,
    recommendations,
    profile
  };
}

// Type exports for consumers
export type { NarrativeStyleProfile, StyleTargetProfile, StyleAlignmentReport };

// Test stub functions
export async function testAnalyzeNarrativeStyle() {
  return analyzeNarrativeStyle('The night was dark and stormy. I felt a chill run down my spine.');
}
export function testCompareToTargetStyle() {
  const profile: NarrativeStyleProfile = {
    tone: 'dark',
    voice: 'intimate',
    pacingScore: 0.4,
    emotionDensity: 0.3,
    lexicalComplexity: 0.5,
    sentenceVariance: 4,
    keyDescriptors: ['stormy', 'chilly'],
    toneConfidence: 0.9,
    voiceConfidence: 0.9,
    pacingScoreConfidence: 0.8,
    emotionDensityConfidence: 0.8,
    lexicalComplexityConfidence: 0.7,
    sentenceVarianceConfidence: 0.7,
    keyDescriptorsConfidence: 0.7
  };
  const target: StyleTargetProfile = {
    genre: 'Noir',
    expectedTone: 'dark',
    targetVoice: 'intimate',
    pacingRange: [0.3, 0.6],
    emotionDensityRange: [0.2, 0.4]
  };
  return compareToTargetStyle(profile, target);
} 