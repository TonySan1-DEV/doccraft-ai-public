// MCP Context Block
/*
role: developer,
tier: Pro,
file: "modules/styleProfile/configs/stylePresets.ts",
allowedActions: ["generate", "model", "define"],
theme: "style_presets"
*/

import type { StyleTargetProfile } from '../types/styleTypes';

export const stylePresets: Record<string, StyleTargetProfile> = {
  Noir: {
    genre: 'Noir',
    expectedTone: 'dark',
    targetVoice: 'intimate',
    pacingRange: [0.3, 0.6],
    emotionDensityRange: [0.2, 0.4],
  },
  YA: {
    genre: 'YA',
    expectedTone: 'warm',
    targetVoice: 'casual',
    pacingRange: [0.5, 0.8],
    emotionDensityRange: [0.4, 0.7],
  },
  LiteraryFiction: {
    genre: 'Literary Fiction',
    expectedTone: 'neutral',
    targetVoice: 'omniscient',
    pacingRange: [0.2, 0.5],
    emotionDensityRange: [0.3, 0.6],
  },
  Thriller: {
    genre: 'Thriller',
    expectedTone: 'tense',
    targetVoice: 'intimate',
    pacingRange: [0.7, 1.0],
    emotionDensityRange: [0.2, 0.5],
  },
}; 