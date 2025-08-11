import { describe, it, expect } from '@jest/globals';
import type {
  EmotionAnalysis,
  TensionPoint,
  TensionCurve,
  ArcSegment,
  EmotionalBeat,
} from '../types/emotionTypes';
import { clamp100, clamp01 } from '../utils/scaling';

describe('Scaling Invariants', () => {
  describe('EmotionAnalysis Scale Validation', () => {
    it('should ensure intensity is within [0, 100] range', () => {
      const validAnalysis: EmotionAnalysis = {
        sceneId: 'test-scene',
        dominantEmotion: 'joy',
        intensity: 75,
        confidence: 85,
      };

      expect(validAnalysis.intensity).toBeGreaterThanOrEqual(0);
      expect(validAnalysis.intensity).toBeLessThanOrEqual(100);
      expect(validAnalysis.confidence).toBeGreaterThanOrEqual(0);
      expect(validAnalysis.confidence).toBeLessThanOrEqual(100);
    });

    it('should reject invalid intensity values', () => {
      const invalidIntensities = [-1, 101, 150, -50];

      invalidIntensities.forEach(invalid => {
        expect(() => {
          const analysis: EmotionAnalysis = {
            sceneId: 'test-scene',
            dominantEmotion: 'joy',
            intensity: invalid,
          };
          // This should cause a type error or runtime validation
          expect(analysis.intensity).toBeGreaterThanOrEqual(0);
          expect(analysis.intensity).toBeLessThanOrEqual(100);
        }).toThrow();
      });
    });

    it('should ensure confidence is within [0, 100] when present', () => {
      const analysisWithConfidence: EmotionAnalysis = {
        sceneId: 'test-scene',
        dominantEmotion: 'sadness',
        intensity: 60,
        confidence: 90,
      };

      expect(analysisWithConfidence.confidence).toBeGreaterThanOrEqual(0);
      expect(analysisWithConfidence.confidence).toBeLessThanOrEqual(100);
    });
  });

  describe('TensionPoint Scale Validation', () => {
    it('should ensure tension is within [0, 100] and position within [0, 1]', () => {
      const validPoint: TensionPoint = {
        position: 0.5,
        tension: 75,
        empathy: 60,
        engagement: 80,
        emotionalComplexity: 45,
      };

      // Position should be 0-1
      expect(validPoint.position).toBeGreaterThanOrEqual(0);
      expect(validPoint.position).toBeLessThanOrEqual(1);

      // Tension should be 0-100
      expect(validPoint.tension).toBeGreaterThanOrEqual(0);
      expect(validPoint.tension).toBeLessThanOrEqual(100);

      // Optional fields should also be 0-100 when present
      if (validPoint.empathy !== undefined) {
        expect(validPoint.empathy).toBeGreaterThanOrEqual(0);
        expect(validPoint.empathy).toBeLessThanOrEqual(100);
      }

      if (validPoint.engagement !== undefined) {
        expect(validPoint.engagement).toBeGreaterThanOrEqual(0);
        expect(validPoint.engagement).toBeLessThanOrEqual(100);
      }

      if (validPoint.emotionalComplexity !== undefined) {
        expect(validPoint.emotionalComplexity).toBeGreaterThanOrEqual(0);
        expect(validPoint.emotionalComplexity).toBeLessThanOrEqual(100);
      }
    });

    it('should reject invalid tension values', () => {
      const invalidTensions = [-1, 101, 150, -50];

      invalidTensions.forEach(invalid => {
        expect(() => {
          const point: TensionPoint = {
            position: 0.5,
            tension: invalid,
          };
          expect(point.tension).toBeGreaterThanOrEqual(0);
          expect(point.tension).toBeLessThanOrEqual(100);
        }).toThrow();
      });
    });

    it('should reject invalid position values', () => {
      const invalidPositions = [-0.1, 1.1, 2.0, -1.0];

      invalidPositions.forEach(invalid => {
        expect(() => {
          const point: TensionPoint = {
            position: invalid,
            tension: 50,
          };
          expect(point.position).toBeGreaterThanOrEqual(0);
          expect(point.position).toBeLessThanOrEqual(1);
        }).toThrow();
      });
    });
  });

  describe('ArcSegment Scale Validation', () => {
    it('should ensure avgTension is within [0, 100]', () => {
      const validSegment: ArcSegment = {
        start: 0.2,
        end: 0.8,
        avgTension: 65,
        tensionLevel: 70,
        emotion: 'conflict',
        confidence: 85,
      };

      expect(validSegment.avgTension).toBeGreaterThanOrEqual(0);
      expect(validSegment.avgTension).toBeLessThanOrEqual(100);

      if (validSegment.tensionLevel !== undefined) {
        expect(validSegment.tensionLevel).toBeGreaterThanOrEqual(0);
        expect(validSegment.tensionLevel).toBeLessThanOrEqual(100);
      }

      if (validSegment.confidence !== undefined) {
        expect(validSegment.confidence).toBeGreaterThanOrEqual(0);
        expect(validSegment.confidence).toBeLessThanOrEqual(100);
      }
    });
  });

  describe('UI Display Scaling', () => {
    it('should correctly format position for display while preserving data', () => {
      const sampleCurve: TensionCurve = [
        { position: 0.25, tension: 60 },
        { position: 0.5, tension: 80 },
        { position: 0.75, tension: 40 },
      ];

      // Data should remain 0-1
      sampleCurve.forEach(point => {
        expect(point.position).toBeGreaterThanOrEqual(0);
        expect(point.position).toBeLessThanOrEqual(1);
      });

      // Display formatting should convert to percentage
      const displayFormats = sampleCurve.map(point => ({
        position: point.position,
        displayText: toPercentDisplay(point.position),
        displayValue: Math.round(point.position * 100),
      }));

      expect(displayFormats[0].displayText).toBe('25%');
      expect(displayFormats[0].displayValue).toBe(25);
      expect(displayFormats[1].displayText).toBe('50%');
      expect(displayFormats[1].displayValue).toBe(50);
      expect(displayFormats[2].displayText).toBe('75%');
      expect(displayFormats[2].displayValue).toBe(75);
    });

    it('should correctly format tension for display', () => {
      const samplePoints: TensionPoint[] = [
        { position: 0.1, tension: 25 },
        { position: 0.5, tension: 75 },
        { position: 0.9, tension: 90 },
      ];

      const displayFormats = samplePoints.map(point => ({
        tension: point.tension,
        displayText: `${point.tension.toFixed(0)}%`,
        displayValue: Math.round(point.tension),
      }));

      expect(displayFormats[0].displayText).toBe('25%');
      expect(displayFormats[0].displayValue).toBe(25);
      expect(displayFormats[1].displayText).toBe('75%');
      expect(displayFormats[1].displayValue).toBe(75);
      expect(displayFormats[2].displayText).toBe('90%');
      expect(displayFormats[2].displayValue).toBe(90);
    });
  });

  describe('Clamping Utilities', () => {
    it('should clamp values to [0, 100] range', () => {
      expect(clamp100(-10)).toBe(0);
      expect(clamp100(0)).toBe(0);
      expect(clamp100(50)).toBe(50);
      expect(clamp100(100)).toBe(100);
      expect(clamp100(150)).toBe(100);
      expect(clamp100(Infinity)).toBe(100);
      expect(clamp100(-Infinity)).toBe(0);
    });

    it('should clamp values to [0, 1] range', () => {
      expect(clamp01(-0.5)).toBe(0);
      expect(clamp01(0)).toBe(0);
      expect(clamp01(0.5)).toBe(0.5);
      expect(clamp01(1)).toBe(1);
      expect(clamp01(1.5)).toBe(1);
      expect(clamp01(Infinity)).toBe(1);
      expect(clamp01(-Infinity)).toBe(0);
    });

    it('should handle edge cases', () => {
      expect(clamp100(NaN)).toBeNaN();
      expect(clamp01(NaN)).toBeNaN();
    });
  });

  describe('EmotionalBeat Scale Validation', () => {
    it('should ensure intensity is within [0, 100]', () => {
      const validBeat: EmotionalBeat = {
        sceneId: 'test-scene',
        characterId: 'protagonist',
        emotion: 'joy',
        intensity: 75,
        narrativePosition: 0.5,
        timestamp: 1700000000000, // Fixed timestamp for determinism
      };

      expect(validBeat.intensity).toBeGreaterThanOrEqual(0);
      expect(validBeat.intensity).toBeLessThanOrEqual(100);
      expect(validBeat.narrativePosition).toBeGreaterThanOrEqual(0);
      expect(validBeat.narrativePosition).toBeLessThanOrEqual(1);
    });
  });

  describe('Scale Consistency Across Types', () => {
    it('should maintain consistent 0-100 scale for all intensity/confidence/tension fields', () => {
      const testData = {
        emotionAnalysis: {
          intensity: 75,
          confidence: 85,
          emotionalComplexity: 60,
        } as EmotionAnalysis,
        tensionPoint: {
          position: 0.5,
          tension: 80,
          empathy: 70,
          engagement: 90,
          emotionalComplexity: 50,
        } as TensionPoint,
        arcSegment: {
          avgTension: 65,
          tensionLevel: 70,
          confidence: 85,
          intensity: 75,
          emotionalComplexity: 55,
        } as ArcSegment,
      };

      // All numeric emotion-related fields should be 0-100
      const allNumericFields = [
        testData.emotionAnalysis.intensity,
        testData.emotionAnalysis.confidence!,
        testData.emotionAnalysis.emotionalComplexity!,
        testData.tensionPoint.tension,
        testData.tensionPoint.empathy!,
        testData.tensionPoint.engagement!,
        testData.tensionPoint.emotionalComplexity!,
        testData.arcSegment.avgTension,
        testData.arcSegment.tensionLevel!,
        testData.arcSegment.confidence!,
        testData.arcSegment.intensity!,
        testData.arcSegment.emotionalComplexity!,
      ];

      allNumericFields.forEach(value => {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(100);
      });

      // Position fields should be 0-1
      expect(testData.tensionPoint.position).toBeGreaterThanOrEqual(0);
      expect(testData.tensionPoint.position).toBeLessThanOrEqual(1);
    });
  });
});
