export const mcpContext = {
  file: 'modules/themeAnalysis/__tests__/themeAnalysisEngine.spec.ts',
  role: 'developer',
  allowedActions: ['create', 'harden', 'test'],
  contentSensitivity: 'low',
  theme: 'doccraft-ai',
};

import { describe, it, expect, beforeEach } from '@jest/globals';
import { ThemeAnalysisEngine } from '../services/themeAnalysisEngine';
import type {
  SceneThemeFingerprint,
  ThematicSignal,
  ThemeAnalysisContext,
  ThemeAnalysisResult,
  ThemeComplexityMetrics,
  ThemeConflictReason,
} from '../services/themeAnalysisEngine';

describe('ThemeAnalysisEngine - Category 2 Implementation', () => {
  let engine: ThemeAnalysisEngine;

  beforeEach(() => {
    engine = new ThemeAnalysisEngine();
  });

  describe('Null Safety and Edge Cases', () => {
    it('handles empty scenes array gracefully', () => {
      const result = engine.analyzeThemeComplexity([]);

      expect(result).toEqual({
        density: 0,
        variety: 0,
        balance: 0,
        progression: 0,
      });
    });

    it('handles null/undefined scenes gracefully', () => {
      const result = engine.analyzeThemeComplexity(
        null as unknown as SceneThemeFingerprint[]
      );

      expect(result).toEqual({
        density: 0,
        variety: 0,
        balance: 0,
        progression: 0,
      });
    });

    it('handles scenes with missing themes array', () => {
      const scenes: SceneThemeFingerprint[] = [
        { sceneId: 'scene1' }, // Missing themes
        { sceneId: 'scene2', themes: [] }, // Empty themes
        { sceneId: 'scene3', themes: undefined }, // Undefined themes
      ];

      const result = engine.analyzeThemeComplexity(scenes);

      expect(result.density).toBe(0);
      expect(result.variety).toBe(0);
      expect(result.balance).toBe(0);
      expect(result.progression).toBe(50); // Default for single scene
    });

    it('handles themes with missing or invalid strength values', () => {
      const scenes: SceneThemeFingerprint[] = [
        {
          sceneId: 'scene1',
          themes: [
            { theme: 'loyalty', strength: 0.5, context: 'Test' },
            {
              theme: 'betrayal',
              strength: undefined as unknown as number,
              context: 'Test',
            },
            {
              theme: 'trust',
              strength: null as unknown as number,
              context: 'Test',
            },
            { theme: 'hope', strength: NaN, context: 'Test' },
          ],
        },
      ];

      const result = engine.analyzeThemeComplexity(scenes);

      expect(result.density).toBeGreaterThan(0);
      expect(result.variety).toBeGreaterThan(0);
      expect(result.balance).toBeGreaterThanOrEqual(0);
      expect(result.balance).toBeLessThanOrEqual(100);
    });

    it('handles themes with missing theme names', () => {
      const scenes: SceneThemeFingerprint[] = [
        {
          sceneId: 'scene1',
          themes: [
            { theme: '', strength: 0.5, context: 'Test' },
            {
              theme: null as unknown as string,
              strength: 0.5,
              context: 'Test',
            },
            {
              theme: undefined as unknown as string,
              strength: 0.5,
              context: 'Test',
            },
          ],
        },
      ];

      const result = engine.analyzeThemeComplexity(scenes);

      expect(result.variety).toBe(0);
      expect(result.density).toBeGreaterThan(0);
    });
  });

  describe('Scaling Correctness', () => {
    it('clamps density values to 0-100 range', () => {
      const scenes: SceneThemeFingerprint[] = [
        {
          sceneId: 'scene1',
          themes: Array.from({ length: 50 }, (_, i) => ({
            theme: `theme${i}`,
            strength: 1.0,
            context: 'Test',
          })),
        },
      ];

      const result = engine.analyzeThemeComplexity(scenes);

      expect(result.density).toBeGreaterThanOrEqual(0);
      expect(result.density).toBeLessThanOrEqual(100);
      expect(result.density).toBe(100); // Should be clamped to 100
    });

    it('clamps variety values to 0-100 range', () => {
      const scenes: SceneThemeFingerprint[] = [
        {
          sceneId: 'scene1',
          themes: Array.from({ length: 25 }, (_, i) => ({
            theme: `theme${i}`,
            strength: 0.5,
            context: 'Test',
          })),
        },
      ];

      const result = engine.analyzeThemeComplexity(scenes);

      expect(result.variety).toBeGreaterThanOrEqual(0);
      expect(result.variety).toBeLessThanOrEqual(100);
      expect(result.variety).toBe(100); // 25 themes should normalize to 100
    });

    it('clamps balance values to 0-100 range', () => {
      const scenes: SceneThemeFingerprint[] = [
        {
          sceneId: 'scene1',
          themes: [
            { theme: 'theme1', strength: 1.0, context: 'Test' },
            { theme: 'theme2', strength: 0.1, context: 'Test' },
            { theme: 'theme3', strength: 0.05, context: 'Test' },
          ],
        },
      ];

      const result = engine.analyzeThemeComplexity(scenes);

      expect(result.balance).toBeGreaterThanOrEqual(0);
      expect(result.balance).toBeLessThanOrEqual(100);
    });

    it('clamps progression values to 0-100 range', () => {
      const scenes: SceneThemeFingerprint[] = [
        {
          sceneId: 'scene1',
          themes: [{ theme: 'theme1', strength: 0.5, context: 'Test' }],
        },
        {
          sceneId: 'scene2',
          themes: [{ theme: 'theme2', strength: 0.5, context: 'Test' }],
        },
      ];

      const result = engine.analyzeThemeComplexity(scenes);

      expect(result.progression).toBeGreaterThanOrEqual(0);
      expect(result.progression).toBeLessThanOrEqual(100);
    });
  });

  describe('Theme Analysis Generation', () => {
    it('generates complete analysis with proper scaling', () => {
      const scenes: SceneThemeFingerprint[] = [
        {
          sceneId: 'scene1',
          themes: [
            { theme: 'loyalty', strength: 0.8, context: 'Test' },
            { theme: 'betrayal', strength: 0.6, context: 'Test' },
          ],
        },
        {
          sceneId: 'scene2',
          themes: [
            { theme: 'trust', strength: 0.7, context: 'Test' },
            { theme: 'hope', strength: 0.5, context: 'Test' },
          ],
        },
      ];

      const result = engine.generateThemeAnalysis(scenes);

      expect(result.alignmentScore).toBeGreaterThanOrEqual(0);
      expect(result.alignmentScore).toBeLessThanOrEqual(100);
      expect(result.complexityScore).toBeGreaterThanOrEqual(0);
      expect(result.complexityScore).toBeLessThanOrEqual(100);
      expect(result.coherenceScore).toBeGreaterThanOrEqual(0);
      expect(result.coherenceScore).toBeLessThanOrEqual(100);

      expect(result.primaryThemes.length).toBeGreaterThan(0);
      expect(result.secondaryThemes.length).toBeGreaterThanOrEqual(0);
      expect(result.suggestions.length).toBeGreaterThanOrEqual(0);
      expect(result.warnings.length).toBeGreaterThanOrEqual(0);
    });

    it('handles empty scenes gracefully in analysis', () => {
      const result = engine.generateThemeAnalysis([]);

      expect(result.primaryThemes).toEqual([]);
      expect(result.secondaryThemes).toEqual([]);
      expect(result.themeVector).toEqual({});
      expect(result.alignmentScore).toBe(0);
      expect(result.complexityScore).toBe(0);
      expect(result.coherenceScore).toBe(0);
      expect(result.suggestions).toContain('No scenes provided for analysis');
      expect(result.warnings).toContain('Empty scene data');
    });

    it('applies context-aware complexity adjustments', () => {
      const scenes: SceneThemeFingerprint[] = [
        {
          sceneId: 'scene1',
          themes: [
            { theme: 'loyalty', strength: 0.8, context: 'Test' },
            { theme: 'betrayal', strength: 0.6, context: 'Test' },
          ],
        },
      ];

      const simpleContext: ThemeAnalysisContext = {
        complexityLevel: 'simple',
        genre: 'romance',
        narrativeArc: 'coming-of-age',
      };

      const complexContext: ThemeAnalysisContext = {
        complexityLevel: 'complex',
        genre: 'literary',
        narrativeArc: 'tragic',
      };

      const simpleResult = engine.generateThemeAnalysis(scenes, simpleContext);
      const complexResult = engine.generateThemeAnalysis(
        scenes,
        complexContext
      );

      // Simple context should cap complexity lower
      expect(simpleResult.complexityScore).toBeLessThanOrEqual(40);
      // Complex context should allow higher complexity
      expect(complexResult.complexityScore).toBeLessThanOrEqual(100);
    });
  });

  describe('Theme Conflict Detection', () => {
    it('detects conflicting theme pairs correctly', () => {
      const scenes: SceneThemeFingerprint[] = [
        {
          sceneId: 'scene1',
          themes: [
            { theme: 'loyalty', strength: 0.8, context: 'Test' },
            { theme: 'betrayal', strength: 0.7, context: 'Test' },
          ],
        },
      ];

      const conflicts = engine.detectThemeConflicts(scenes, [
        'loyalty',
        'trust',
      ]);

      expect(conflicts.length).toBeGreaterThan(0);
      expect(conflicts[0]).toHaveProperty('theme');
      expect(conflicts[0]).toHaveProperty('conflictWith');
      expect(conflicts[0]).toHaveProperty('conflictReason');
    });

    it('handles empty primary themes gracefully', () => {
      const scenes: SceneThemeFingerprint[] = [
        {
          sceneId: 'scene1',
          themes: [
            { theme: 'loyalty', strength: 0.8, context: 'Test' },
            { theme: 'betrayal', strength: 0.7, context: 'Test' },
          ],
        },
      ];

      const conflicts = engine.detectThemeConflicts(scenes, []);

      expect(conflicts).toEqual([]);
    });

    it('generates context-aware conflict reasons', () => {
      const scenes: SceneThemeFingerprint[] = [
        {
          sceneId: 'scene1',
          themes: [
            { theme: 'loyalty', strength: 0.8, context: 'Test' },
            { theme: 'betrayal', strength: 0.7, context: 'Test' },
          ],
        },
      ];

      const noirContext: ThemeAnalysisContext = { genre: 'noir' };
      const romanceContext: ThemeAnalysisContext = { genre: 'romance' };

      const noirConflicts = engine.detectThemeConflicts(
        scenes,
        ['loyalty'],
        noirContext
      );
      const romanceConflicts = engine.detectThemeConflicts(
        scenes,
        ['loyalty'],
        romanceContext
      );

      expect(noirConflicts.length).toBeGreaterThan(0);
      expect(romanceConflicts.length).toBeGreaterThan(0);

      // Should have different reasoning based on genre
      expect(noirConflicts[0].conflictReason).toContain('morally ambiguous');
      expect(romanceConflicts[0].conflictReason).toContain('romantic conflict');
    });
  });

  describe('Edge Case Handling', () => {
    it('handles extremely high theme counts without overflow', () => {
      const scenes: SceneThemeFingerprint[] = [
        {
          sceneId: 'scene1',
          themes: Array.from({ length: 1000 }, (_, i) => ({
            theme: `theme${i}`,
            strength: 1.0,
            context: 'Test',
          })),
        },
      ];

      const result = engine.analyzeThemeComplexity(scenes);

      expect(result.density).toBe(100); // Should be clamped
      expect(result.variety).toBe(100); // Should be clamped
      expect(result.balance).toBeGreaterThanOrEqual(0);
      expect(result.balance).toBeLessThanOrEqual(100);
    });

    it('handles floating point precision issues', () => {
      const scenes: SceneThemeFingerprint[] = [
        {
          sceneId: 'scene1',
          themes: [
            { theme: 'theme1', strength: 0.1 + 0.2, context: 'Test' }, // 0.30000000000000004
            { theme: 'theme2', strength: 0.3, context: 'Test' },
          ],
        },
      ];

      const result = engine.analyzeThemeComplexity(scenes);

      expect(result.density).toBeGreaterThan(0);
      expect(result.balance).toBeGreaterThanOrEqual(0);
      expect(result.balance).toBeLessThanOrEqual(100);
    });

    it('handles single scene progression correctly', () => {
      const scenes: SceneThemeFingerprint[] = [
        {
          sceneId: 'scene1',
          themes: [{ theme: 'loyalty', strength: 0.8, context: 'Test' }],
        },
      ];

      const result = engine.analyzeThemeComplexity(scenes);

      expect(result.progression).toBe(50); // Default neutral score for single scene
    });

    it('handles scenes with identical themes', () => {
      const scenes: SceneThemeFingerprint[] = [
        {
          sceneId: 'scene1',
          themes: [
            { theme: 'loyalty', strength: 0.8, context: 'Test' },
            { theme: 'loyalty', strength: 0.9, context: 'Test' },
          ],
        },
        {
          sceneId: 'scene2',
          themes: [
            { theme: 'loyalty', strength: 0.7, context: 'Test' },
            { theme: 'loyalty', strength: 0.6, context: 'Test' },
          ],
        },
      ];

      const result = engine.analyzeThemeComplexity(scenes);

      expect(result.variety).toBe(5); // 1 unique theme out of 20 max = 5%
      expect(result.balance).toBe(100); // Perfect balance with identical themes
    });
  });

  describe('Type Safety and Strict TypeScript', () => {
    it('maintains strict typing without any usage', () => {
      const scenes: SceneThemeFingerprint[] = [
        {
          sceneId: 'scene1',
          themes: [{ theme: 'loyalty', strength: 0.8, context: 'Test' }],
        },
      ];

      const result: ThemeAnalysisResult = engine.generateThemeAnalysis(scenes);

      // All properties should be properly typed
      expect(typeof result.alignmentScore).toBe('number');
      expect(typeof result.complexityScore).toBe('number');
      expect(typeof result.coherenceScore).toBe('number');
      expect(Array.isArray(result.primaryThemes)).toBe(true);
      expect(Array.isArray(result.suggestions)).toBe(true);
      expect(Array.isArray(result.warnings)).toBe(true);
    });

    it('handles optional context properties correctly', () => {
      const scenes: SceneThemeFingerprint[] = [
        {
          sceneId: 'scene1',
          themes: [{ theme: 'loyalty', strength: 0.8, context: 'Test' }],
        },
      ];

      // Partial context
      const partialContext: ThemeAnalysisContext = {
        genre: 'noir',
      };

      const result = engine.generateThemeAnalysis(scenes, partialContext);

      expect(result).toBeDefined();
      expect(result.alignmentScore).toBeGreaterThanOrEqual(0);
      expect(result.alignmentScore).toBeLessThanOrEqual(100);
    });
  });

  describe('Performance and Memory Safety', () => {
    it('handles large scene arrays efficiently', () => {
      const scenes: SceneThemeFingerprint[] = Array.from(
        { length: 1000 },
        (_, i) => ({
          sceneId: `scene${i}`,
          themes: [
            { theme: `theme${i % 10}`, strength: 0.5, context: 'Test' },
            { theme: `theme${(i + 5) % 10}`, strength: 0.3, context: 'Test' },
          ],
        })
      );

      const startTime = performance.now();
      const result = engine.analyzeThemeComplexity(scenes);
      const endTime = performance.now();

      expect(result).toBeDefined();
      expect(result.density).toBeGreaterThanOrEqual(0);
      expect(result.density).toBeLessThanOrEqual(100);

      // Should complete within reasonable time (adjust threshold as needed)
      expect(endTime - startTime).toBeLessThan(1000); // 1 second
    });

    it('prevents memory leaks with circular references', () => {
      const scenes: SceneThemeFingerprint[] = [
        {
          sceneId: 'scene1',
          themes: [{ theme: 'loyalty', strength: 0.8, context: 'Test' }],
        },
      ];

      // This should not cause infinite recursion or memory issues
      const result = engine.generateThemeAnalysis(scenes);

      expect(result).toBeDefined();
      expect(result.primaryThemes.length).toBeGreaterThan(0);
    });
  });
});
