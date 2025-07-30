// MCP Context Block
/*
{
  file: "ContextualPromptEngine.fallback.test.ts",
  role: "test",
  allowedActions: ["test", "validate"],
  tier: "Pro",
  contentSensitivity: "low",
  theme: "testing"
}
*/

import { ContextualPromptEngine, logFallbackWarning, getDiagnostics } from '../ContextualPromptEngine';
import type { UserPrefs, DocumentContext } from '../ContextualPromptEngine';

// Mock the PromptPatternLibrary
jest.mock('../PromptPatternLibrary', () => ({
  PromptPatternLibrary: {
    getPattern: jest.fn()
  }
}));

import { PromptPatternLibrary } from '../PromptPatternLibrary';

const mockGetPattern = PromptPatternLibrary.getPattern as jest.MockedFunction<typeof PromptPatternLibrary.getPattern>;

describe('ContextualPromptEngine Fallback Diagnostics', () => {
  let engine: ContextualPromptEngine;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    engine = new ContextualPromptEngine({ debug: true, enableFallbackLogging: true });
    consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    mockGetPattern.mockReset();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    engine.clearFallbackLogs();
  });

  describe('logFallbackWarning', () => {
    it('should log warning when debug is enabled', () => {
      engine.logFallbackWarning('UnknownGenre', 'unknown', 'DEFAULT pattern', true);

      expect(consoleSpy).toHaveBeenCalledWith(
        '[PromptEngine] No pattern match for genre "UnknownGenre" + arc "unknown". Using fallback: [DEFAULT pattern]'
      );
    });

    it('should not log when debug is disabled', () => {
      const noDebugEngine = new ContextualPromptEngine({ debug: false });
      noDebugEngine.logFallbackWarning('UnknownGenre', 'unknown', 'DEFAULT pattern', false);

      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it('should prevent duplicate logging for same genre/arc/fallback combo', () => {
      engine.logFallbackWarning('UnknownGenre', 'unknown', 'DEFAULT pattern', true);
      engine.logFallbackWarning('UnknownGenre', 'unknown', 'DEFAULT pattern', true);

      expect(consoleSpy).toHaveBeenCalledTimes(1);
    });

    it('should allow logging for different fallbacks', () => {
      engine.logFallbackWarning('UnknownGenre', 'unknown', 'DEFAULT pattern', true);
      engine.logFallbackWarning('UnknownGenre', 'unknown', 'setup arc', true);

      expect(consoleSpy).toHaveBeenCalledTimes(2);
    });

    it('should add fallback to diagnostics log', () => {
      engine.logFallbackWarning('UnknownGenre', 'unknown', 'DEFAULT pattern', true);

      const diagnostics = engine.getDiagnostics();
      expect(diagnostics).toHaveLength(1);
      expect(diagnostics[0]).toMatchObject({
        genre: 'UnknownGenre',
        arc: 'unknown',
        usedFallback: 'DEFAULT pattern'
      });
    });
  });

  describe('getDiagnostics', () => {
    it('should return empty array when no fallbacks logged', () => {
      const diagnostics = engine.getDiagnostics();
      expect(diagnostics).toEqual([]);
    });

    it('should return all logged fallbacks', () => {
      engine.logFallbackWarning('Genre1', 'arc1', 'fallback1', true);
      engine.logFallbackWarning('Genre2', 'arc2', 'fallback2', true);

      const diagnostics = engine.getDiagnostics();
      expect(diagnostics).toHaveLength(2);
      expect(diagnostics[0].genre).toBe('Genre1');
      expect(diagnostics[1].genre).toBe('Genre2');
    });

    it('should include timestamp in diagnostics', () => {
      const beforeTime = Date.now();
      engine.logFallbackWarning('Genre1', 'arc1', 'fallback1', true);
      const afterTime = Date.now();

      const diagnostics = engine.getDiagnostics();
      expect(diagnostics[0].timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(diagnostics[0].timestamp).toBeLessThanOrEqual(afterTime);
    });
  });

  describe('clearFallbackLogs', () => {
    it('should clear all fallback logs', () => {
      engine.logFallbackWarning('Genre1', 'arc1', 'fallback1', true);
      engine.logFallbackWarning('Genre2', 'arc2', 'fallback2', true);

      expect(engine.getDiagnostics()).toHaveLength(2);

      engine.clearFallbackLogs();

      expect(engine.getDiagnostics()).toHaveLength(0);
    });

    it('should clear logged fallbacks memoization', () => {
      engine.logFallbackWarning('Genre1', 'arc1', 'fallback1', true);
      engine.clearFallbackLogs();

      // Should be able to log the same fallback again
      engine.logFallbackWarning('Genre1', 'arc1', 'fallback1', true);

      expect(consoleSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('getFallbackStats', () => {
    it('should return correct statistics', () => {
      engine.logFallbackWarning('Genre1', 'arc1', 'fallback1', true);
      engine.logFallbackWarning('Genre1', 'arc1', 'fallback1', true); // Duplicate
      engine.logFallbackWarning('Genre2', 'arc2', 'fallback2', true);

      const stats = engine.getFallbackStats();

      expect(stats.totalFallbacks).toBe(2); // Only unique combinations
      expect(stats.uniqueFallbacks).toBe(2);
      expect(stats.recentFallbacks).toHaveLength(2);
      expect(stats.mostCommonFallbacks).toHaveLength(2);
    });

    it('should return empty stats when no fallbacks', () => {
      const stats = engine.getFallbackStats();

      expect(stats.totalFallbacks).toBe(0);
      expect(stats.uniqueFallbacks).toBe(0);
      expect(stats.recentFallbacks).toHaveLength(0);
      expect(stats.mostCommonFallbacks).toHaveLength(0);
    });

    it('should sort most common fallbacks by count', () => {
      // Log multiple fallbacks for Genre1
      engine.logFallbackWarning('Genre1', 'arc1', 'fallback1', true);
      engine.logFallbackWarning('Genre1', 'arc1', 'fallback1', true);
      engine.logFallbackWarning('Genre1', 'arc1', 'fallback1', true);

      // Log one fallback for Genre2
      engine.logFallbackWarning('Genre2', 'arc2', 'fallback2', true);

      const stats = engine.getFallbackStats();

      expect(stats.mostCommonFallbacks[0].genre).toBe('Genre1');
      expect(stats.mostCommonFallbacks[0].count).toBe(3);
      expect(stats.mostCommonFallbacks[1].genre).toBe('Genre2');
      expect(stats.mostCommonFallbacks[1].count).toBe(1);
    });
  });

  describe('Fallback Detection in Pattern Generation', () => {
    it('should detect and log setup arc fallback', () => {
      // Mock no exact pattern found
      mockGetPattern.mockReturnValue(null);

      const prefs: UserPrefs = {
        tone: 'friendly',
        language: 'en',
        genre: 'Romance'
      };

      const context: DocumentContext = {
        scene: 'Test scene',
        arc: 'climax'
      };

      engine.buildContextualPromptHeader(prefs, context);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('setup arc for Romance')
      );
    });

    it('should detect and log DEFAULT pattern fallback', () => {
      // Mock no patterns found at all
      mockGetPattern.mockReturnValue(null);

      const prefs: UserPrefs = {
        tone: 'friendly',
        language: 'en',
        genre: 'UnknownGenre'
      };

      const context: DocumentContext = {
        scene: 'Test scene',
        arc: 'unknown' as any
      };

      engine.buildContextualPromptHeader(prefs, context);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('DEFAULT pattern for UnknownGenre / unknown')
      );
    });

    it('should not log when exact pattern is found', () => {
      // Mock exact pattern found
      mockGetPattern.mockReturnValue('Exact pattern found');

      const prefs: UserPrefs = {
        tone: 'friendly',
        language: 'en',
        genre: 'Romance'
      };

      const context: DocumentContext = {
        scene: 'Test scene',
        arc: 'setup'
      };

      engine.buildContextualPromptHeader(prefs, context);

      expect(consoleSpy).not.toHaveBeenCalled();
    });
  });

  describe('Configuration Options', () => {
    it('should respect enableFallbackLogging configuration', () => {
      const noLoggingEngine = new ContextualPromptEngine({ 
        debug: true, 
        enableFallbackLogging: false 
      });

      noLoggingEngine.logFallbackWarning('Genre1', 'arc1', 'fallback1', true);

      // Should still log to console
      expect(consoleSpy).toHaveBeenCalled();

      // But should not add to diagnostics
      const diagnostics = noLoggingEngine.getDiagnostics();
      expect(diagnostics).toHaveLength(0);
    });

    it('should respect debug configuration for logging', () => {
      const debugEngine = new ContextualPromptEngine({ debug: true });
      const noDebugEngine = new ContextualPromptEngine({ debug: false });

      debugEngine.logFallbackWarning('Genre1', 'arc1', 'fallback1');
      noDebugEngine.logFallbackWarning('Genre2', 'arc2', 'fallback2');

      expect(consoleSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Exported Functions', () => {
    it('should export logFallbackWarning function', () => {
      logFallbackWarning('Genre1', 'arc1', 'fallback1', true);

      expect(consoleSpy).toHaveBeenCalledWith(
        '[PromptEngine] No pattern match for genre "Genre1" + arc "arc1". Using fallback: [fallback1]'
      );
    });

    it('should export getDiagnostics function', () => {
      logFallbackWarning('Genre1', 'arc1', 'fallback1', true);

      const diagnostics = getDiagnostics();
      expect(diagnostics).toHaveLength(1);
      expect(diagnostics[0].genre).toBe('Genre1');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty strings in fallback logging', () => {
      engine.logFallbackWarning('', '', 'empty fallback', true);

      expect(consoleSpy).toHaveBeenCalledWith(
        '[PromptEngine] No pattern match for genre "" + arc "". Using fallback: [empty fallback]'
      );
    });

    it('should handle special characters in fallback logging', () => {
      engine.logFallbackWarning('Genre-With-Dashes', 'arc_with_underscores', 'fallback with spaces', true);

      expect(consoleSpy).toHaveBeenCalledWith(
        '[PromptEngine] No pattern match for genre "Genre-With-Dashes" + arc "arc_with_underscores". Using fallback: [fallback with spaces]'
      );
    });

    it('should maintain log size limit', () => {
      const largeLogEngine = new ContextualPromptEngine({ 
        debug: true, 
        enableFallbackLogging: true 
      });

      // Add more logs than the limit
      for (let i = 0; i < 1100; i++) {
        largeLogEngine.logFallbackWarning(`Genre${i}`, `arc${i}`, `fallback${i}`, true);
      }

      const diagnostics = largeLogEngine.getDiagnostics();
      expect(diagnostics.length).toBeLessThanOrEqual(1000);
    });
  });

  describe('Performance', () => {
    it('should handle rapid fallback logging efficiently', () => {
      const startTime = Date.now();

      for (let i = 0; i < 100; i++) {
        engine.logFallbackWarning(`Genre${i}`, `arc${i}`, `fallback${i}`, true);
      }

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second

      const diagnostics = engine.getDiagnostics();
      expect(diagnostics).toHaveLength(100);
    });

    it('should not create memory leaks with duplicate logging prevention', () => {
      const initialMemory = process.memoryUsage().heapUsed;

      for (let i = 0; i < 1000; i++) {
        engine.logFallbackWarning('Genre1', 'arc1', 'fallback1', true);
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be minimal due to duplicate prevention
      expect(memoryIncrease).toBeLessThan(1024 * 1024); // Less than 1MB
    });
  });
}); 