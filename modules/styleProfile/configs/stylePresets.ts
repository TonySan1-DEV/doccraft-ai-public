export const mcpContext = {
  file: 'modules/styleProfile/configs/stylePresets.ts',
  role: 'developer',
  allowedActions: ['refactor', 'type-harden', 'test'],
  contentSensitivity: 'low',
  theme: 'doccraft-ai',
};

import type { StyleTargetProfile } from '../types/styleTypes';
import {
  createStrictString,
  createPacingScore,
  createEmotionDensity,
} from '../types/styleTypes';

export const stylePresets: Record<string, StyleTargetProfile> = {
  Noir: {
    genre: createStrictString('Noir'),
    expectedTone: 'dark',
    targetVoice: 'intimate',
    pacingRange: [createPacingScore(0.3), createPacingScore(0.6)], // 0-1 range
    emotionDensityRange: [createEmotionDensity(0.2), createEmotionDensity(0.4)], // 0-1 range
  },
  YA: {
    genre: createStrictString('YA'),
    expectedTone: 'warm',
    targetVoice: 'casual',
    pacingRange: [createPacingScore(0.5), createPacingScore(0.8)], // 0-1 range
    emotionDensityRange: [createEmotionDensity(0.4), createEmotionDensity(0.7)], // 0-1 range
  },
  LiteraryFiction: {
    genre: createStrictString('Literary Fiction'),
    expectedTone: 'neutral',
    targetVoice: 'omniscient',
    pacingRange: [createPacingScore(0.2), createPacingScore(0.5)], // 0-1 range
    emotionDensityRange: [createEmotionDensity(0.3), createEmotionDensity(0.6)], // 0-1 range
  },
  Thriller: {
    genre: createStrictString('Thriller'),
    expectedTone: 'tense',
    targetVoice: 'intimate',
    pacingRange: [createPacingScore(0.7), createPacingScore(1.0)], // 0-1 range
    emotionDensityRange: [createEmotionDensity(0.2), createEmotionDensity(0.5)], // 0-1 range
  },
};
