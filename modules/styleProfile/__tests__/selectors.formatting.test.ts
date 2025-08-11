// MCP: styleProfile/selectors - Tests for null-safety and percentage formatting
// Role: qa, allowedActions: [test, validate], theme: style_testing

import type {
  NarrativeStyleProfile,
  StyleTargetProfile,
  StyleAlignmentReport,
} from '../types/styleTypes';
import { selectPalettePercentages, selectReadabilityPercent, selectProfileById } from '../selectors';

// Test data
const mockProfile: NarrativeStyleProfile = {
  tone: 'neutral',
  voice: 'omniscient',
  pacingScore: 0.123 as any, // Test data may use 'as any'
  emotionDensity: 0.456 as any,
  lexicalComplexity: 0.999 as any,
  toneConfidence: 85.7,
  voiceConfidence: 92.3,
  pacingConfidence: 78.9,
  emotionConfidence: 95.1,
  lexicalConfidence: 67.4,
  varianceConfidence: 88.2,
  descriptorsConfidence: 73.6,
  targetProfile: {} as StyleTargetProfile,
  alignmentReport: {} as StyleAlignmentReport,
  lastUpdated: new Date(),
  version: '1.0.0',
};

const mockProfileWithId = { ...mockProfile, id: 'test-profile-1' };
const mockProfiles = [mockProfileWithId, { ...mockProfile, id: 'test-profile-2' }];

describe('styleProfile selectors', () => {
  describe('selectPalettePercentages', () => {
    it('returns safe defaults for null input', () => {
      const result = selectPalettePercentages(null);
      expect(result).toEqual({
        pacing: '0%',
        emotionDensity: '0%',
        lexicalComplexity: '0%',
      });
    });

    it('returns safe defaults for undefined input', () => {
      const result = selectPalettePercentages(undefined);
      expect(result).toEqual({
        pacing: '0%',
        emotionDensity: '0%',
        lexicalComplexity: '0%',
      });
    });

    it('converts 0-1 values to whole-number percentages', () => {
      const result = selectPalettePercentages(mockProfile);
      expect(result).toEqual({
        pacing: '12%',
        emotionDensity: '46%',
        lexicalComplexity: '100%',
      });
    });

    it('handles edge cases correctly', () => {
      const edgeProfile: NarrativeStyleProfile = {
        ...mockProfile,
        pacingScore: 0 as any,
        emotionDensity: 1 as any,
        lexicalComplexity: 0.5 as any,
      };
      
      const result = selectPalettePercentages(edgeProfile);
      expect(result).toEqual({
        pacing: '0%',
        emotionDensity: '100%',
        lexicalComplexity: '50%',
      });
    });
  });

  describe('selectReadabilityPercent', () => {
    it('returns safe defaults for null input', () => {
      const result = selectReadabilityPercent(null);
      expect(result).toEqual({
        toneConfidence: '0%',
        voiceConfidence: '0%',
        pacingConfidence: '0%',
        emotionConfidence: '0%',
        lexicalConfidence: '0%',
        varianceConfidence: '0%',
        descriptorsConfidence: '0%',
      });
    });

    it('returns safe defaults for undefined input', () => {
      const result = selectReadabilityPercent(undefined);
      expect(result).toEqual({
        toneConfidence: '0%',
        voiceConfidence: '0%',
        pacingConfidence: '0%',
        emotionConfidence: '0%',
        lexicalConfidence: '0%',
        varianceConfidence: '0%',
        descriptorsConfidence: '0%',
      });
    });

    it('converts confidence scores to whole-number percentages', () => {
      const result = selectReadabilityPercent(mockProfile);
      expect(result).toEqual({
        toneConfidence: '86%',
        voiceConfidence: '92%',
        pacingConfidence: '79%',
        emotionConfidence: '95%',
        lexicalConfidence: '67%',
        varianceConfidence: '88%',
        descriptorsConfidence: '74%',
      });
    });
  });

  describe('selectProfileById', () => {
    it('returns undefined for missing id', () => {
      const result = selectProfileById(mockProfiles, '');
      expect(result).toBeUndefined();
    });

    it('returns undefined for null profiles array', () => {
      const result = selectProfileById(null, 'test-profile-1');
      expect(result).toBeUndefined();
    });

    it('returns undefined for undefined profiles array', () => {
      const result = selectProfileById(undefined, 'test-profile-1');
      expect(result).toBeUndefined();
    });

    it('returns undefined for non-array profiles', () => {
      const result = selectProfileById('not-an-array' as any, 'test-profile-1');
      expect(result).toBeUndefined();
    });

    it('returns undefined for non-existent id', () => {
      const result = selectProfileById(mockProfiles, 'non-existent-id');
      expect(result).toBeUndefined();
    });

    it('returns profile for existing id', () => {
      const result = selectProfileById(mockProfiles, 'test-profile-1');
      expect(result).toBe(mockProfileWithId);
    });

    it('returns profile for different existing id', () => {
      const result = selectProfileById(mockProfiles, 'test-profile-2');
      expect(result).toBe(mockProfiles[1]);
    });
  });
});
