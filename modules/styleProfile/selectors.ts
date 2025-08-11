// MCP: styleProfile/selectors - Type-safe selectors for style profile data
// Role: developer, allowedActions: [select, transform], theme: doccraft-ai

import type { NarrativeStyleProfile } from './types/styleTypes';
import {
  toPercentDisplay as spToPercentDisplay,
  clamp100,
} from '../emotionArc/utils/scaling';

/**
 * Convert 0-1 values to whole-number percentage strings using scaling helper
 */
const percent0 = (n: number) =>
  typeof spToPercentDisplay === 'function'
    ? spToPercentDisplay(n)
    : `${Math.round(n * 100)}%`;

/**
 * Convert 0-100 values to whole-number percentage strings
 */
const percent100 = (n: number) => `${Math.round(clamp100(n))}%`;

/**
 * Convert 0-1 palette values to whole-number percentage display strings
 * @param profile - Style profile with 0-1 values or null/undefined
 * @returns Object with percentage strings for UI display
 */
export function selectPalettePercentages(
  profile: NarrativeStyleProfile | null | undefined
): { pacing: string; emotionDensity: string; lexicalComplexity: string } {
  if (!profile) {
    return { pacing: '0%', emotionDensity: '0%', lexicalComplexity: '0%' };
  }

  const convertToPercent = (value: number | undefined): string => {
    if (typeof value !== 'number' || isNaN(value)) return '0%';
    // Convert 0-1 to whole-number percentage using scaling helper
    return percent0(value);
  };

  return {
    pacing: convertToPercent(profile.pacingScore),
    emotionDensity: convertToPercent(profile.emotionDensity),
    lexicalComplexity: convertToPercent(profile.lexicalComplexity),
  };
}

/**
 * Extract confidence scores as whole-number percentage strings
 * @param profile - Style profile with confidence scores or null/undefined
 * @returns Object with confidence percentage strings
 */
export function selectReadabilityPercent(
  profile: NarrativeStyleProfile | null | undefined
): {
  toneConfidence: string;
  voiceConfidence: string;
  pacingConfidence: string;
  emotionConfidence: string;
  lexicalConfidence: string;
  varianceConfidence: string;
  descriptorsConfidence: string;
} {
  if (!profile) {
    return {
      toneConfidence: '0%',
      voiceConfidence: '0%',
      pacingConfidence: '0%',
      emotionConfidence: '0%',
      lexicalConfidence: '0%',
      varianceConfidence: '0%',
      descriptorsConfidence: '0%',
    };
  }

  const convertConfidenceToPercent = (value: number | undefined): string => {
    if (typeof value !== 'number' || isNaN(value)) return '0%';
    // Confidence values are already 0-100, use percent100 helper
    return percent100(value);
  };

  return {
    toneConfidence: convertConfidenceToPercent(profile.toneConfidence),
    voiceConfidence: convertConfidenceToPercent(profile.voiceConfidence),
    pacingConfidence: convertConfidenceToPercent(profile.pacingScoreConfidence),
    emotionConfidence: convertConfidenceToPercent(
      profile.emotionDensityConfidence
    ),
    lexicalConfidence: convertConfidenceToPercent(
      profile.lexicalComplexityConfidence
    ),
    varianceConfidence: convertConfidenceToPercent(
      profile.sentenceVarianceConfidence
    ),
    descriptorsConfidence: convertConfidenceToPercent(
      profile.keyDescriptorsConfidence
    ),
  };
}

/**
 * Find a profile by ID with safe array handling
 * @param profiles - Array of profiles with id property or null/undefined
 * @param id - ID to search for
 * @returns Profile with matching ID or undefined
 */
export function selectProfileById<T extends { id: string }>(
  profiles: ReadonlyArray<T> | null | undefined,
  id: string
): T | undefined {
  if (!Array.isArray(profiles) || !id) {
    return undefined;
  }

  return profiles.find(profile => profile.id === id);
}
