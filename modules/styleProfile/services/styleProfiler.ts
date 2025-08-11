export const mcpContext = {
  file: 'modules/styleProfile/services/styleProfiler.ts',
  role: 'developer',
  allowedActions: ['refactor', 'type-harden', 'test'],
  contentSensitivity: 'low',
  theme: 'doccraft-ai',
};

import type {
  NarrativeStyleProfile,
  StyleTargetProfile,
  StyleAlignmentReport,
  NonEmptyArray,
} from '../types/styleTypes';
import {
  createPacingScore,
  createEmotionDensity,
  createLexicalComplexity,
  createConfidenceScore,
  createStrictString,
} from '../types/styleTypes';
import { clamp01, clamp100 } from '../../emotionArc/utils/scaling';

// Simple emotion word list for density
const EMOTION_WORDS = [
  'love',
  'hate',
  'fear',
  'joy',
  'anger',
  'sad',
  'happy',
  'excited',
  'calm',
  'anxious',
  'hope',
  'despair',
  'surprise',
  'disgust',
  'trust',
  'anticipation',
  'conflict',
  'peace',
  'tension',
  'relief',
  'regret',
  'pride',
  'shame',
] as const;

function countEmotionWords(text: string): number {
  if (!text || typeof text !== 'string') return 0;
  const words = text.toLowerCase().split(/\W+/);
  return words.filter(w =>
    EMOTION_WORDS.includes(w as (typeof EMOTION_WORDS)[number])
  ).length;
}

function lexicalComplexity(text: string): number {
  if (!text || typeof text !== 'string') return 0;
  const words = text.split(/\W+/).filter(Boolean);
  const unique = new Set(words.map(w => w.toLowerCase()));
  return words.length ? clamp01(unique.size / words.length) : 0;
}

function sentenceVariance(text: string): number {
  if (!text || typeof text !== 'string') return 0;
  const sentences = text
    .split(/[.!?]/)
    .map(s => s.trim())
    .filter(Boolean);
  const lengths = sentences.map(s => s.split(/\s+/).length);
  if (lengths.length < 2) return 0;
  const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance =
    lengths.reduce((sum, l) => sum + Math.pow(l - mean, 2), 0) /
    (lengths.length - 1);
  return Math.sqrt(variance);
}

function extractAdjectives(text: string): string[] {
  if (!text || typeof text !== 'string') return [];
  // Simple heuristic: words ending in 'y', 'ful', 'ous', 'ive', 'al', 'ic', 'less', 'able', 'ible'
  return Array.from(
    new Set(
      text
        .split(/\W+/)
        .filter(w => /(?:y|ful|ous|ive|al|ic|less|able|ible)$/.test(w))
    )
  );
}

// Async-safe LLM call placeholder - removed unused function
// async function callLLMForStyle(
//   _input: string
// ): Promise<Partial<NarrativeStyleProfile> & { confidence: number }> {
//   // Simulate delay and return empty (ready for real LLM integration)
//   await new Promise(res => setTimeout(res, 50));
//   return { confidence: 0.5 };
// }

export async function analyzeNarrativeStyle(
  input: string
): Promise<NarrativeStyleProfile> {
  // Fallback for unsupported/non-narrative text
  if (!input || input.trim().length < 20 || input.split(/[.!?]/).length < 2) {
    return {
      tone: 'neutral',
      voice: 'omniscient',
      pacingScore: createPacingScore(0.5),
      emotionDensity: createEmotionDensity(0),
      lexicalComplexity: createLexicalComplexity(0),
      sentenceVariance: 0,
      keyDescriptors: ['basic'],
      // Confidence fields - using proper scaling
      toneConfidence: createConfidenceScore(20),
      voiceConfidence: createConfidenceScore(20),
      pacingScoreConfidence: createConfidenceScore(20),
      emotionDensityConfidence: createConfidenceScore(20),
      lexicalComplexityConfidence: createConfidenceScore(20),
      sentenceVarianceConfidence: createConfidenceScore(20),
      keyDescriptorsConfidence: createConfidenceScore(20),
      warning: createStrictString(
        'Input too short or not narrative. Style analysis may be unreliable.'
      ),
    };
  }

  // Heuristic analysis (replace with LLM/NLP for production)
  const wordCount = input.split(/\W+/).filter(Boolean).length;
  const emotionCount = countEmotionWords(input);
  const emotionDensity = wordCount ? clamp01(emotionCount / wordCount) : 0;
  const complexity = clamp01(lexicalComplexity(input));
  const variance = sentenceVariance(input);
  const keyDescriptors = extractAdjectives(input);

  // Mock tone/voice detection
  let tone: NarrativeStyleProfile['tone'] = 'neutral';
  let toneConfidence = clamp100(70);
  if (/dark|gloomy|grim|bleak/.test(input)) {
    tone = 'dark';
    toneConfidence = clamp100(90);
  } else if (/warm|gentle|kind|hopeful/.test(input)) {
    tone = 'warm';
    toneConfidence = clamp100(90);
  } else if (/sarcastic|ironic|mock/.test(input)) {
    tone = 'sarcastic';
    toneConfidence = clamp100(80);
  } else if (emotionDensity > 0.1) {
    tone = 'emotive';
    toneConfidence = clamp100(80);
  }

  let voice: NarrativeStyleProfile['voice'] = 'omniscient';
  let voiceConfidence = clamp100(70);
  if (/I\s|my\s|me\s|mine\s/.test(input)) {
    voice = 'intimate';
    voiceConfidence = clamp100(90);
  } else if (/we\s|us\s|our\s/.test(input)) {
    voice = 'casual';
    voiceConfidence = clamp100(80);
  } else if (/thou|thee|thy|thine/.test(input)) {
    voice = 'formal';
    voiceConfidence = clamp100(80);
  }

  // Pacing: short sentences = fast, long = slow
  const pacingScore = clamp01(variance < 7 ? 1 : 0.3);
  const pacingScoreConfidence = clamp100(70);
  const emotionDensityConfidence = clamp100(70);
  const lexicalComplexityConfidence = clamp100(70);
  const sentenceVarianceConfidence = clamp100(70);
  const keyDescriptorsConfidence = clamp100(60);

  // Optionally, merge with LLM output
  // const llmResult = await callLLMForStyle(input);

  return {
    tone,
    voice,
    pacingScore: createPacingScore(pacingScore),
    emotionDensity: createEmotionDensity(emotionDensity),
    lexicalComplexity: createLexicalComplexity(complexity),
    sentenceVariance: variance,
    keyDescriptors:
      keyDescriptors.length > 0
        ? (keyDescriptors as NonEmptyArray<string>)
        : (['basic'] as NonEmptyArray<string>),
    // Confidence fields
    toneConfidence: createConfidenceScore(toneConfidence),
    voiceConfidence: createConfidenceScore(voiceConfidence),
    pacingScoreConfidence: createConfidenceScore(pacingScoreConfidence),
    emotionDensityConfidence: createConfidenceScore(emotionDensityConfidence),
    lexicalComplexityConfidence: createConfidenceScore(
      lexicalComplexityConfidence
    ),
    sentenceVarianceConfidence: createConfidenceScore(
      sentenceVarianceConfidence
    ),
    keyDescriptorsConfidence: createConfidenceScore(keyDescriptorsConfidence),
  };
}

export function compareToTargetStyle(
  profile: NarrativeStyleProfile,
  target: StyleTargetProfile
): StyleAlignmentReport {
  if (!profile || !target) {
    return {
      alignmentScore: createConfidenceScore(0),
      driftFlags: [
        'Invalid profile or target provided',
      ] as NonEmptyArray<string>,
      recommendations: ['Please provide valid profile and target data'],
      profile: profile ?? {
        tone: 'neutral',
        voice: 'omniscient',
        pacingScore: createPacingScore(0.5),
        emotionDensity: createEmotionDensity(0),
        lexicalComplexity: createLexicalComplexity(0),
        sentenceVariance: 0,
        keyDescriptors: ['basic'],
        toneConfidence: createConfidenceScore(0),
        voiceConfidence: createConfidenceScore(0),
        pacingScoreConfidence: createConfidenceScore(0),
        emotionDensityConfidence: createConfidenceScore(0),
        lexicalComplexityConfidence: createConfidenceScore(0),
        sentenceVarianceConfidence: createConfidenceScore(0),
        keyDescriptorsConfidence: createConfidenceScore(0),
      },
    };
  }

  const driftFlags: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  // Tone
  if (profile.tone !== target.expectedTone) {
    driftFlags.push(
      `tone is ${profile.tone ?? 'unknown'}, expected ${target.expectedTone}`
    );
    recommendations.push(`Adjust tone toward ${target.expectedTone}.`);
    score -= 20;
  }
  // Voice
  if (profile.voice !== target.targetVoice) {
    driftFlags.push(
      `voice is ${profile.voice ?? 'unknown'}, expected ${target.targetVoice}`
    );
    recommendations.push(`Rewrite to use ${target.targetVoice} voice.`);
    score -= 20;
  }
  // Pacing
  const clampedPacingScore = clamp01(profile.pacingScore ?? 0);
  const pacingRange = target.pacingRange;
  if (Array.isArray(pacingRange) && pacingRange.length >= 2) {
    if (clampedPacingScore < clamp01(pacingRange[0])) {
      driftFlags.push('pacing too slow');
      recommendations.push('Shorten sentences or increase action.');
      score -= 15;
    } else if (clampedPacingScore > clamp01(pacingRange[1])) {
      driftFlags.push('pacing too fast');
      recommendations.push('Add description or slow scene transitions.');
      score -= 10;
    }
  }
  // Emotion density
  const clampedEmotionDensity = clamp01(profile.emotionDensity ?? 0);
  const emotionRange = target.emotionDensityRange;
  if (Array.isArray(emotionRange) && emotionRange.length >= 2) {
    if (clampedEmotionDensity < clamp01(emotionRange[0])) {
      driftFlags.push('emotion density low');
      recommendations.push('Add more emotional language.');
      score -= 10;
    } else if (clampedEmotionDensity > clamp01(emotionRange[1])) {
      driftFlags.push('emotion density high');
      recommendations.push('Balance emotional content.');
      score -= 10;
    }
  }
  // Lexical complexity (optional)
  if (clamp01(profile.lexicalComplexity ?? 0) < 0.2) {
    driftFlags.push('vocabulary too simple');
    recommendations.push('Use more varied vocabulary.');
    score -= 5;
  }
  // Clamp score
  score = clamp100(Math.max(0, Math.round(score)));

  return {
    alignmentScore: createConfidenceScore(score),
    driftFlags:
      driftFlags.length > 0
        ? (driftFlags as NonEmptyArray<string>)
        : (['no issues detected'] as NonEmptyArray<string>),
    recommendations,
    profile,
  };
}

// Type exports for consumers
export type { NarrativeStyleProfile, StyleTargetProfile, StyleAlignmentReport };

// Test stub functions
export async function testAnalyzeNarrativeStyle(): Promise<NarrativeStyleProfile> {
  return analyzeNarrativeStyle(
    'The night was dark and stormy. I felt a chill run down my spine.'
  );
}

export function testCompareToTargetStyle(): StyleAlignmentReport {
  const profile: NarrativeStyleProfile = {
    tone: 'dark',
    voice: 'intimate',
    pacingScore: createPacingScore(0.4),
    emotionDensity: createEmotionDensity(0.3),
    lexicalComplexity: createLexicalComplexity(0.5),
    sentenceVariance: 4,
    keyDescriptors: ['stormy', 'chilly'],
    toneConfidence: createConfidenceScore(90),
    voiceConfidence: createConfidenceScore(90),
    pacingScoreConfidence: createConfidenceScore(80),
    emotionDensityConfidence: createConfidenceScore(80),
    lexicalComplexityConfidence: createConfidenceScore(70),
    sentenceVarianceConfidence: createConfidenceScore(70),
    keyDescriptorsConfidence: createConfidenceScore(70),
  };
  const target: StyleTargetProfile = {
    genre: createStrictString('Noir'),
    expectedTone: 'dark',
    targetVoice: 'intimate',
    pacingRange: [createPacingScore(0.3), createPacingScore(0.6)],
    emotionDensityRange: [createEmotionDensity(0.2), createEmotionDensity(0.4)],
  };
  return compareToTargetStyle(profile, target);
}
