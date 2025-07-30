// MCP Context Block
/*
{
  file: "ContextualPromptEngine.test.ts",
  role: "test",
  allowedActions: ["test", "validate"],
  tier: "Pro",
  contentSensitivity: "low",
  theme: "testing"
}
*/

import { ContextualPromptEngine, buildContextualPromptHeader } from '../ContextualPromptEngine';
import type { UserPrefs, DocumentContext, PromptHeader } from '../ContextualPromptEngine';

// Helper function to DRY up test inputs
function renderTestPromptHeader(prefs: UserPrefs, context: DocumentContext): PromptHeader {
  const engine = new ContextualPromptEngine({ debug: false });
  return engine.buildContextualPromptHeader(prefs, context);
}

// Test data matrices for comprehensive coverage
const TONE_MATRIX = ['friendly', 'formal', 'casual', 'professional', 'creative', 'dramatic'];
const LANGUAGE_MATRIX = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh'];
const GENRE_MATRIX = ['Romance', 'Sci-Fi', 'Mystery', 'Fantasy', 'Thriller', 'Horror', 'Comedy', 'Historical'];
const ARC_MATRIX = ['setup', 'rising', 'climax', 'resolution'];

describe('ContextualPromptEngine', () => {
  let engine: ContextualPromptEngine;

  beforeEach(() => {
    engine = new ContextualPromptEngine({ debug: false });
  });

  describe('buildContextualPromptHeader', () => {
    it('should generate header with basic preferences', () => {
      const prefs: UserPrefs = {
        tone: 'friendly',
        language: 'en',
        genre: 'Romance'
      };

      const context: DocumentContext = {
        scene: 'A coffee shop',
        arc: 'setup'
      };

      const result = engine.buildContextualPromptHeader(prefs, context);

      expect(result).toMatchObject({
        tone: 'friendly',
        language: 'en',
        genre: 'Romance',
        patternUsed: expect.stringContaining('Introduce')
      });

      expect(result.header).toContain('/* Tone: friendly | Language: en | Genre: Romance */');
      expect(result.header).toContain('/* Pattern:');
    });

    it('should inject character name into pattern', () => {
      const prefs: UserPrefs = {
        tone: 'formal',
        language: 'es',
        genre: 'Mystery'
      };

      const context: DocumentContext = {
        scene: 'A detective office',
        arc: 'climax',
        characterName: 'Detective Sarah'
      };

      const result = engine.buildContextualPromptHeader(prefs, context);

      expect(result.patternUsed).toContain('Detective Sarah');
      expect(result.patternUsed).not.toContain('[CHARACTER]');
    });

    it('should use fallback patterns for unknown genres', () => {
      const prefs: UserPrefs = {
        tone: 'casual',
        language: 'fr',
        genre: 'UnknownGenre'
      };

      const context: DocumentContext = {
        scene: 'A random place',
        arc: 'setup'
      };

      const result = engine.buildContextualPromptHeader(prefs, context);

      expect(result.genre).toBe('UnknownGenre');
      expect(result.patternUsed).toBeDefined();
      expect(result.patternUsed).toContain('Introduce');
    });

    it('should fallback to setup arc for unknown arcs', () => {
      const prefs: UserPrefs = {
        tone: 'dramatic',
        language: 'de',
        genre: 'Romance'
      };

      const context: DocumentContext = {
        scene: 'A dramatic scene',
        arc: 'unknown' as any
      };

      const result = engine.buildContextualPromptHeader(prefs, context);

      expect(result.patternUsed).toContain('Introduce');
    });

    it('should sanitize unsafe tone values', () => {
      const prefs: UserPrefs = {
        tone: 'unsafe_tone',
        language: 'en',
        genre: 'Sci-Fi'
      };

      const context: DocumentContext = {
        scene: 'A sci-fi scene',
        arc: 'setup'
      };

      const result = engine.buildContextualPromptHeader(prefs, context);

      expect(result.tone).toBe('friendly'); // Safe fallback
    });

    it('should sanitize unsafe language values', () => {
      const prefs: UserPrefs = {
        tone: 'formal',
        language: 'unsafe_lang',
        genre: 'Fantasy'
      };

      const context: DocumentContext = {
        scene: 'A fantasy scene',
        arc: 'setup'
      };

      const result = engine.buildContextualPromptHeader(prefs, context);

      expect(result.language).toBe('en'); // Safe fallback
    });

    // Matrix testing for comprehensive coverage
    describe('tone and language matrix', () => {
      TONE_MATRIX.forEach(tone => {
        LANGUAGE_MATRIX.forEach(language => {
          it(`should handle tone "${tone}" with language "${language}"`, () => {
            const prefs: UserPrefs = {
              tone,
              language,
              genre: 'Romance'
            };

            const context: DocumentContext = {
              scene: 'Test scene',
              arc: 'setup'
            };

            const result = renderTestPromptHeader(prefs, context);

            expect(result.tone).toBe(tone);
            expect(result.language).toBe(language);
            expect(result.header).toContain(`/* Tone: ${tone} | Language: ${language} | Genre: Romance */`);
          });
        });
      });
    });

    describe('genre and arc matrix', () => {
      GENRE_MATRIX.forEach(genre => {
        ARC_MATRIX.forEach(arc => {
          it(`should handle genre "${genre}" with arc "${arc}"`, () => {
            const prefs: UserPrefs = {
              tone: 'friendly',
              language: 'en',
              genre
            };

            const context: DocumentContext = {
              scene: 'Test scene',
              arc: arc as any
            };

            const result = renderTestPromptHeader(prefs, context);

            expect(result.genre).toBe(genre);
            expect(result.patternUsed).toBeDefined();
            expect(result.patternUsed).not.toBe('');
          });
        });
      });
    });

    // Specific genre pattern validation
    describe('genre-specific patterns', () => {
      it('should select Romance + Climax pattern correctly', () => {
        const result = renderTestPromptHeader(
          { tone: 'friendly', language: 'en', genre: 'Romance' },
          { scene: 'Test', arc: 'climax' }
        );

        expect(result.patternUsed).toContain('Reveal a secret');
        expect(result.patternUsed).toContain('must hide');
      });

      it('should select Sci-Fi + Rising pattern correctly', () => {
        const result = renderTestPromptHeader(
          { tone: 'professional', language: 'en', genre: 'Sci-Fi' },
          { scene: 'Test', arc: 'rising' }
        );

        expect(result.patternUsed).toContain('discovery');
        expect(result.patternUsed).toContain('understanding of reality');
      });

      it('should select Mystery + Setup pattern correctly', () => {
        const result = renderTestPromptHeader(
          { tone: 'formal', language: 'en', genre: 'Mystery' },
          { scene: 'Test', arc: 'setup' }
        );

        expect(result.patternUsed).toContain('unexplained event');
        expect(result.patternUsed).toContain('investigation');
      });

      it('should fallback to DEFAULT pattern for unknown genre', () => {
        const result = renderTestPromptHeader(
          { tone: 'friendly', language: 'en', genre: 'NonExistentGenre' },
          { scene: 'Test', arc: 'setup' }
        );

        expect(result.patternUsed).toContain('Introduce');
        expect(result.patternUsed).toContain('central conflict');
      });
    });

    // Character name injection comprehensive testing
    describe('character name injection', () => {
      it('should inject character name into [CHARACTER] placeholder', () => {
        const result = renderTestPromptHeader(
          { tone: 'friendly', language: 'en', genre: 'Romance' },
          { scene: 'Test', arc: 'setup', characterName: 'Emma' }
        );

        expect(result.patternUsed).toContain('Emma');
        expect(result.patternUsed).not.toContain('[CHARACTER]');
      });

      it('should inject character name into [OTHER] placeholder', () => {
        const result = renderTestPromptHeader(
          { tone: 'friendly', language: 'en', genre: 'Romance' },
          { scene: 'Test', arc: 'climax', characterName: 'Sarah' }
        );

        expect(result.patternUsed).toContain('Sarah');
        expect(result.patternUsed).toContain('another character');
      });

      it('should handle multiple character placeholders', () => {
        const result = renderTestPromptHeader(
          { tone: 'friendly', language: 'en', genre: 'Romance' },
          { scene: 'Test', arc: 'setup', characterName: 'Alex' }
        );

        expect(result.patternUsed).toContain('Alex');
        expect(result.patternUsed).not.toContain('[CHARACTER]');
        expect(result.patternUsed).not.toContain('[THEY]');
        expect(result.patternUsed).not.toContain('[THEIR]');
      });

      it('should skip injection when character name is undefined', () => {
        const result = renderTestPromptHeader(
          { tone: 'friendly', language: 'en', genre: 'Romance' },
          { scene: 'Test', arc: 'setup', characterName: undefined }
        );

        expect(result.patternUsed).toContain('Introduce');
        expect(result.patternUsed).not.toContain('[CHARACTER]');
      });

      it('should handle special characters in character names', () => {
        const specialNames = [
          'Dr. Sarah-Jane O\'Connor',
          'José María García',
          'Jean-Pierre Dubois',
          'Hans Müller-Schmidt',
          'Giovanni Rossi-Bianchi'
        ];

        specialNames.forEach(name => {
          const result = renderTestPromptHeader(
            { tone: 'friendly', language: 'en', genre: 'Romance' },
            { scene: 'Test', arc: 'setup', characterName: name }
          );

          expect(result.patternUsed).toContain(name);
          expect(result.patternUsed).not.toContain('[CHARACTER]');
        });
      });
    });

    // Return structure validation
    describe('return structure validation', () => {
      it('should return valid PromptHeader structure', () => {
        const result = renderTestPromptHeader(
          { tone: 'friendly', language: 'en', genre: 'Romance' },
          { scene: 'Test', arc: 'setup' }
        );

        expect(result).toHaveProperty('header');
        expect(result).toHaveProperty('tone');
        expect(result).toHaveProperty('language');
        expect(result).toHaveProperty('genre');
        expect(result).toHaveProperty('patternUsed');

        expect(typeof result.header).toBe('string');
        expect(typeof result.tone).toBe('string');
        expect(typeof result.language).toBe('string');
        expect(typeof result.genre).toBe('string');
        expect(typeof result.patternUsed).toBe('string');

        expect(result.header).toMatch(/^\/\* Tone: .* \| Language: .* \| Genre: .* \*\/\n\/\* Pattern: ".*" \*\/\n\n$/);
      });

      it('should always begin header with tone information', () => {
        const result = renderTestPromptHeader(
          { tone: 'formal', language: 'es', genre: 'Mystery' },
          { scene: 'Test', arc: 'climax' }
        );

        expect(result.header).toMatch(/^\/\* Tone: formal \| Language: es \| Genre: Mystery \*\//);
      });
    });
  });

  describe('memoization', () => {
    it('should return cached result for identical inputs', () => {
      const prefs: UserPrefs = {
        tone: 'friendly',
        language: 'en',
        genre: 'Romance'
      };

      const context: DocumentContext = {
        scene: 'A coffee shop',
        arc: 'setup'
      };

      const result1 = engine.buildContextualPromptHeader(prefs, context);
      const result2 = engine.buildContextualPromptHeader(prefs, context);

      expect(result1).toEqual(result2);
    });

    it('should not cache different inputs', () => {
      const prefs1: UserPrefs = {
        tone: 'friendly',
        language: 'en',
        genre: 'Romance'
      };

      const prefs2: UserPrefs = {
        tone: 'formal',
        language: 'en',
        genre: 'Romance'
      };

      const context: DocumentContext = {
        scene: 'A coffee shop',
        arc: 'setup'
      };

      const result1 = engine.buildContextualPromptHeader(prefs1, context);
      const result2 = engine.buildContextualPromptHeader(prefs2, context);

      expect(result1).not.toEqual(result2);
    });

    it('should clear memoization cache', () => {
      const prefs: UserPrefs = {
        tone: 'friendly',
        language: 'en',
        genre: 'Romance'
      };

      const context: DocumentContext = {
        scene: 'A coffee shop',
        arc: 'setup'
      };

      engine.buildContextualPromptHeader(prefs, context);
      
      const statsBefore = engine.getCacheStats();
      expect(statsBefore.size).toBeGreaterThan(0);

      engine.clearMemoizationCache();
      
      const statsAfter = engine.getCacheStats();
      expect(statsAfter.size).toBe(0);
    });

    it('should handle cache size limits', () => {
      const smallCacheEngine = new ContextualPromptEngine({ 
        enableMemoization: true, 
        maxMemoizedEntries: 2 
      });

      // Add 3 entries to test cache overflow
      for (let i = 0; i < 3; i++) {
        smallCacheEngine.buildContextualPromptHeader(
          { tone: 'friendly', language: 'en', genre: `Genre${i}` },
          { scene: 'Test', arc: 'setup' }
        );
      }

      const stats = smallCacheEngine.getCacheStats();
      expect(stats.size).toBeLessThanOrEqual(2);
    });
  });

  describe('debug mode', () => {
    it('should log debug information when enabled', () => {
      const debugEngine = new ContextualPromptEngine({ debug: true });
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const prefs: UserPrefs = {
        tone: 'friendly',
        language: 'en',
        genre: 'Romance'
      };

      const context: DocumentContext = {
        scene: 'A coffee shop',
        arc: 'setup'
      };

      debugEngine.buildContextualPromptHeader(prefs, context);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[PromptEngine]')
      );

      consoleSpy.mockRestore();
    });

    it('should log injected pattern when character name is provided', () => {
      const debugEngine = new ContextualPromptEngine({ debug: true });
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const prefs: UserPrefs = {
        tone: 'friendly',
        language: 'en',
        genre: 'Romance'
      };

      const context: DocumentContext = {
        scene: 'A coffee shop',
        arc: 'setup',
        characterName: 'Emma'
      };

      debugEngine.buildContextualPromptHeader(prefs, context);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Injected character name')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('configuration', () => {
    it('should update configuration', () => {
      engine.updateConfig({ debug: true });
      
      const prefs: UserPrefs = {
        tone: 'friendly',
        language: 'en',
        genre: 'Romance'
      };

      const context: DocumentContext = {
        scene: 'A coffee shop',
        arc: 'setup'
      };

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      engine.buildContextualPromptHeader(prefs, context);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[PromptEngine]')
      );

      consoleSpy.mockRestore();
    });

    it('should disable memoization when configured', () => {
      const noMemoEngine = new ContextualPromptEngine({ enableMemoization: false });
      
      const prefs: UserPrefs = {
        tone: 'friendly',
        language: 'en',
        genre: 'Romance'
      };

      const context: DocumentContext = {
        scene: 'A coffee shop',
        arc: 'setup'
      };

      const result1 = noMemoEngine.buildContextualPromptHeader(prefs, context);
      const result2 = noMemoEngine.buildContextualPromptHeader(prefs, context);

      // Should still work, but not cache
      expect(result1).toEqual(result2);
      
      const stats = noMemoEngine.getCacheStats();
      expect(stats.size).toBe(0);
    });
  });

  describe('exported function', () => {
    it('should work with default engine', () => {
      const prefs: UserPrefs = {
        tone: 'friendly',
        language: 'en',
        genre: 'Romance'
      };

      const context: DocumentContext = {
        scene: 'A coffee shop',
        arc: 'setup'
      };

      const result = buildContextualPromptHeader(prefs, context);

      expect(result).toMatchObject({
        tone: 'friendly',
        language: 'en',
        genre: 'Romance'
      });

      expect(result.header).toContain('/* Tone: friendly | Language: en | Genre: Romance */');
    });
  });

  describe('edge cases', () => {
    it('should handle empty scene', () => {
      const prefs: UserPrefs = {
        tone: 'friendly',
        language: 'en',
        genre: 'Romance'
      };

      const context: DocumentContext = {
        scene: '',
        arc: 'setup'
      };

      const result = engine.buildContextualPromptHeader(prefs, context);

      expect(result).toBeDefined();
      expect(result.header).toContain('/* Tone: friendly | Language: en | Genre: Romance */');
    });

    it('should handle undefined character name', () => {
      const prefs: UserPrefs = {
        tone: 'friendly',
        language: 'en',
        genre: 'Romance'
      };

      const context: DocumentContext = {
        scene: 'A scene',
        arc: 'setup',
        characterName: undefined
      };

      const result = engine.buildContextualPromptHeader(prefs, context);

      expect(result.patternUsed).not.toContain('[CHARACTER]');
      expect(result.patternUsed).toContain('Introduce');
    });

    it('should handle special characters in character name', () => {
      const prefs: UserPrefs = {
        tone: 'friendly',
        language: 'en',
        genre: 'Romance'
      };

      const context: DocumentContext = {
        scene: 'A scene',
        arc: 'setup',
        characterName: 'Dr. Sarah-Jane O\'Connor'
      };

      const result = engine.buildContextualPromptHeader(prefs, context);

      expect(result.patternUsed).toContain('Dr. Sarah-Jane O\'Connor');
    });

    it('should handle empty character name', () => {
      const prefs: UserPrefs = {
        tone: 'friendly',
        language: 'en',
        genre: 'Romance'
      };

      const context: DocumentContext = {
        scene: 'A scene',
        arc: 'setup',
        characterName: ''
      };

      const result = engine.buildContextualPromptHeader(prefs, context);

      expect(result.patternUsed).toContain('Introduce');
      expect(result.patternUsed).not.toContain('[CHARACTER]');
    });

    it('should handle null character name', () => {
      const prefs: UserPrefs = {
        tone: 'friendly',
        language: 'en',
        genre: 'Romance'
      };

      const context: DocumentContext = {
        scene: 'A scene',
        arc: 'setup',
        characterName: null as any
      };

      const result = engine.buildContextualPromptHeader(prefs, context);

      expect(result.patternUsed).toContain('Introduce');
      expect(result.patternUsed).not.toContain('[CHARACTER]');
    });
  });

  // Performance and stress testing
  describe('performance and stress testing', () => {
    it('should handle rapid successive calls', () => {
      const prefs: UserPrefs = {
        tone: 'friendly',
        language: 'en',
        genre: 'Romance'
      };

      const context: DocumentContext = {
        scene: 'A coffee shop',
        arc: 'setup'
      };

      const results = [];
      for (let i = 0; i < 100; i++) {
        results.push(engine.buildContextualPromptHeader(prefs, context));
      }

      // All results should be identical
      const firstResult = results[0];
      results.forEach(result => {
        expect(result).toEqual(firstResult);
      });
    });

    it('should handle large variety of inputs efficiently', () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 50; i++) {
        const prefs: UserPrefs = {
          tone: TONE_MATRIX[i % TONE_MATRIX.length],
          language: LANGUAGE_MATRIX[i % LANGUAGE_MATRIX.length],
          genre: GENRE_MATRIX[i % GENRE_MATRIX.length]
        };

        const context: DocumentContext = {
          scene: `Scene ${i}`,
          arc: ARC_MATRIX[i % ARC_MATRIX.length] as any,
          characterName: i % 2 === 0 ? `Character${i}` : undefined
        };

        const result = engine.buildContextualPromptHeader(prefs, context);
        expect(result).toBeDefined();
        expect(result.header).toContain('/* Tone:');
      }

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });
}); 