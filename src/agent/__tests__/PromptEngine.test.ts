// MCP Context Block
/*
{
  file: "PromptEngine.test.ts",
  role: "test",
  allowedActions: ["test", "validate"],
  tier: "Pro",
  contentSensitivity: "low",
  theme: "testing"
}
*/

import { logFallbackWarning, getDiagnostics } from '../ContextualPromptEngine';

// Jest types for TypeScript
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toHaveBeenCalledWith(...args: any[]): R;
      toHaveBeenCalledTimes(times: number): R;
      toHaveBeenNthCalledWith(n: number, ...args: any[]): R;
    }
  }
}

describe('PromptEngine Fallback Diagnostics', () => {
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    // Stub console.warn to capture log output without printing
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

    // Clear internal diagnostics/memo state between tests
    // Use unique values to ensure clean state
    logFallbackWarning('CLEAR_TEST_1', 'clear', 'clear', true);
    logFallbackWarning('CLEAR_TEST_2', 'clear', 'clear', true);
  });

  afterEach(() => {
    // Restore console.warn
    consoleWarnSpy.mockRestore();
  });

  describe('logFallbackWarning()', () => {
    describe('Debug Mode Behavior', () => {
      it('should call console.warn when debug === true', () => {
        logFallbackWarning('Romance', 'climax', 'setup arc for Romance', true);

        expect(consoleWarnSpy).toHaveBeenCalledWith(
          '[PromptEngine] No pattern match for genre "Romance" + arc "climax". Using fallback: [setup arc for Romance]'
        );
      });

      it('should not call console.warn when debug === false', () => {
        logFallbackWarning('Romance', 'climax', 'setup arc for Romance', false);

        expect(consoleWarnSpy).not.toHaveBeenCalled();
      });

      it('should not call console.warn when debug is undefined', () => {
        logFallbackWarning(
          'Romance',
          'climax',
          'setup arc for Romance',
          undefined
        );

        expect(consoleWarnSpy).not.toHaveBeenCalled();
      });

      it('should call console.warn when debug is explicitly true', () => {
        logFallbackWarning('Mystery', 'rising', 'DEFAULT pattern', true);

        expect(consoleWarnSpy).toHaveBeenCalledWith(
          '[PromptEngine] No pattern match for genre "Mystery" + arc "rising". Using fallback: [DEFAULT pattern]'
        );
      });
    });

    describe('Duplicate Prevention', () => {
      it('should not call console.warn for repeated identical calls', () => {
        logFallbackWarning('Thriller', 'resolution', 'custom fallback', true);
        logFallbackWarning('Thriller', 'resolution', 'custom fallback', true);
        logFallbackWarning('Thriller', 'resolution', 'custom fallback', true);

        expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          '[PromptEngine] No pattern match for genre "Thriller" + arc "resolution". Using fallback: [custom fallback]'
        );
      });

      it('should call console.warn for different fallbacks with same genre/arc', () => {
        logFallbackWarning('SciFi', 'setup', 'setup arc for SciFi', true);
        logFallbackWarning('SciFi', 'setup', 'DEFAULT pattern for SciFi', true);

        expect(consoleWarnSpy).toHaveBeenCalledTimes(2);
        expect(consoleWarnSpy).toHaveBeenNthCalledWith(
          1,
          '[PromptEngine] No pattern match for genre "SciFi" + arc "setup". Using fallback: [setup arc for SciFi]'
        );
        expect(consoleWarnSpy).toHaveBeenNthCalledWith(
          2,
          '[PromptEngine] No pattern match for genre "SciFi" + arc "setup". Using fallback: [DEFAULT pattern for SciFi]'
        );
      });

      it('should call console.warn for same fallback with different genre/arc', () => {
        logFallbackWarning('Romance', 'climax', 'DEFAULT pattern', true);
        logFallbackWarning('Action', 'resolution', 'DEFAULT pattern', true);

        expect(consoleWarnSpy).toHaveBeenCalledTimes(2);
      });

      it('should prevent duplicates across different debug values', () => {
        logFallbackWarning('Horror', 'setup', 'setup arc for Horror', true);
        logFallbackWarning('Horror', 'setup', 'setup arc for Horror', false);
        logFallbackWarning(
          'Horror',
          'setup',
          'setup arc for Horror',
          undefined
        );

        expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      });
    });

    describe('Message Format', () => {
      it('should format message with all parameters correctly', () => {
        logFallbackWarning(
          'Fantasy',
          'climax',
          'DEFAULT pattern for Fantasy / climax',
          true
        );

        expect(consoleWarnSpy).toHaveBeenCalledWith(
          '[PromptEngine] No pattern match for genre "Fantasy" + arc "climax". Using fallback: [DEFAULT pattern for Fantasy / climax]'
        );
      });

      it('should handle special characters in parameters', () => {
        logFallbackWarning(
          'Sci-Fi',
          'rising-action',
          'custom fallback (with parentheses)',
          true
        );

        expect(consoleWarnSpy).toHaveBeenCalledWith(
          '[PromptEngine] No pattern match for genre "Sci-Fi" + arc "rising-action". Using fallback: [custom fallback (with parentheses)]'
        );
      });

      it('should handle numbers in parameters', () => {
        logFallbackWarning('Action2', 'arc3', 'fallback4', true);

        expect(consoleWarnSpy).toHaveBeenCalledWith(
          '[PromptEngine] No pattern match for genre "Action2" + arc "arc3". Using fallback: [fallback4]'
        );
      });
    });
  });

  describe('getDiagnostics()', () => {
    describe('Return Value Structure', () => {
      it('should return an array of FallbackLog objects', () => {
        logFallbackWarning('Romance', 'climax', 'setup arc for Romance', true);

        const diagnostics = getDiagnostics();

        expect(Array.isArray(diagnostics)).toBe(true);
        expect(diagnostics.length).toBeGreaterThan(0);
      });

      it('should return FallbackLog objects with correct shape', () => {
        logFallbackWarning('Mystery', 'rising', 'DEFAULT pattern', true);

        const diagnostics = getDiagnostics();
        const logEntry = diagnostics.find(
          log =>
            log.genre === 'Mystery' &&
            log.arc === 'rising' &&
            log.usedFallback === 'DEFAULT pattern'
        );

        expect(logEntry).toBeDefined();
        expect(logEntry).toMatchObject({
          genre: 'Mystery',
          arc: 'rising',
          usedFallback: 'DEFAULT pattern',
        });
        expect(typeof logEntry!.timestamp).toBe('number');
        expect(logEntry!.timestamp).toBeGreaterThan(0);
      });

      it('should include timestamp in FallbackLog objects', () => {
        const beforeTime = Date.now();
        logFallbackWarning('Thriller', 'resolution', 'custom fallback', true);
        const afterTime = Date.now();

        const diagnostics = getDiagnostics();
        const logEntry = diagnostics.find(
          log => log.genre === 'Thriller' && log.arc === 'resolution'
        );

        expect(logEntry!.timestamp).toBeGreaterThanOrEqual(beforeTime);
        expect(logEntry!.timestamp).toBeLessThanOrEqual(afterTime);
      });
    });

    describe('Unique Fallback Tracking', () => {
      it('should return exactly one entry per unique fallback', () => {
        // Log same fallback multiple times
        logFallbackWarning('Romance', 'climax', 'setup arc for Romance', true);
        logFallbackWarning('Romance', 'climax', 'setup arc for Romance', true);
        logFallbackWarning('Romance', 'climax', 'setup arc for Romance', true);

        const diagnostics = getDiagnostics();
        const romanceLogs = diagnostics.filter(
          log =>
            log.genre === 'Romance' &&
            log.arc === 'climax' &&
            log.usedFallback === 'setup arc for Romance'
        );

        expect(romanceLogs).toHaveLength(1);
      });

      it('should track multiple unique fallbacks properly', () => {
        logFallbackWarning('Romance', 'climax', 'setup arc for Romance', true);
        logFallbackWarning('Mystery', 'rising', 'DEFAULT pattern', true);
        logFallbackWarning('Thriller', 'resolution', 'custom fallback', true);

        const diagnostics = getDiagnostics();
        const romanceLogs = diagnostics.filter(log => log.genre === 'Romance');
        const mysteryLogs = diagnostics.filter(log => log.genre === 'Mystery');
        const thrillerLogs = diagnostics.filter(
          log => log.genre === 'Thriller'
        );

        expect(romanceLogs).toHaveLength(1);
        expect(mysteryLogs).toHaveLength(1);
        expect(thrillerLogs).toHaveLength(1);
      });

      it('should track different fallbacks for same genre/arc as separate entries', () => {
        logFallbackWarning('SciFi', 'setup', 'setup arc for SciFi', true);
        logFallbackWarning('SciFi', 'setup', 'DEFAULT pattern for SciFi', true);

        const diagnostics = getDiagnostics();
        const scifiLogs = diagnostics.filter(
          log => log.genre === 'SciFi' && log.arc === 'setup'
        );

        expect(scifiLogs).toHaveLength(2);
        expect(scifiLogs[0].usedFallback).toBe('setup arc for SciFi');
        expect(scifiLogs[1].usedFallback).toBe('DEFAULT pattern for SciFi');
      });
    });

    describe('Diagnostics Persistence', () => {
      it('should maintain diagnostics across multiple getDiagnostics() calls', () => {
        logFallbackWarning('Romance', 'climax', 'setup arc for Romance', true);

        const diagnostics1 = getDiagnostics();
        const diagnostics2 = getDiagnostics();

        expect(diagnostics1).toEqual(diagnostics2);
        expect(diagnostics1.length).toBeGreaterThan(0);
      });

      it('should return a copy of diagnostics, not the original array', () => {
        logFallbackWarning('Mystery', 'rising', 'DEFAULT pattern', true);

        const diagnostics1 = getDiagnostics();
        const diagnostics2 = getDiagnostics();

        // Should be different array references
        expect(diagnostics1).not.toBe(diagnostics2);
        // But should have same content
        expect(diagnostics1).toEqual(diagnostics2);
      });
    });
  });

  describe('Edge Cases', () => {
    describe('Empty String Values', () => {
      it('should handle empty genre string as valid fallback key', () => {
        logFallbackWarning('', 'climax', 'DEFAULT pattern', true);

        expect(consoleWarnSpy).toHaveBeenCalledWith(
          '[PromptEngine] No pattern match for genre "" + arc "climax". Using fallback: [DEFAULT pattern]'
        );

        const diagnostics = getDiagnostics();
        const emptyGenreLog = diagnostics.find(
          log => log.genre === '' && log.arc === 'climax'
        );
        expect(emptyGenreLog).toBeDefined();
      });

      it('should handle empty arc string as valid fallback key', () => {
        logFallbackWarning('Romance', '', 'setup arc for Romance', true);

        expect(consoleWarnSpy).toHaveBeenCalledWith(
          '[PromptEngine] No pattern match for genre "Romance" + arc "". Using fallback: [setup arc for Romance]'
        );

        const diagnostics = getDiagnostics();
        const emptyArcLog = diagnostics.find(
          log => log.genre === 'Romance' && log.arc === ''
        );
        expect(emptyArcLog).toBeDefined();
      });

      it('should handle empty fallback string as valid fallback key', () => {
        logFallbackWarning('Mystery', 'rising', '', true);

        expect(consoleWarnSpy).toHaveBeenCalledWith(
          '[PromptEngine] No pattern match for genre "Mystery" + arc "rising". Using fallback: []'
        );

        const diagnostics = getDiagnostics();
        const emptyFallbackLog = diagnostics.find(
          log =>
            log.genre === 'Mystery' &&
            log.arc === 'rising' &&
            log.usedFallback === ''
        );
        expect(emptyFallbackLog).toBeDefined();
      });

      it('should handle all empty strings as valid fallback keys', () => {
        logFallbackWarning('', '', '', true);

        expect(consoleWarnSpy).toHaveBeenCalledWith(
          '[PromptEngine] No pattern match for genre "" + arc "". Using fallback: []'
        );

        const diagnostics = getDiagnostics();
        const allEmptyLog = diagnostics.find(
          log => log.genre === '' && log.arc === '' && log.usedFallback === ''
        );
        expect(allEmptyLog).toBeDefined();
      });
    });

    describe('Special Characters', () => {
      it('should handle special characters in genre names', () => {
        logFallbackWarning(
          'Sci-Fi & Fantasy',
          'climax',
          'custom fallback',
          true
        );

        expect(consoleWarnSpy).toHaveBeenCalledWith(
          '[PromptEngine] No pattern match for genre "Sci-Fi & Fantasy" + arc "climax". Using fallback: [custom fallback]'
        );

        const diagnostics = getDiagnostics();
        const specialCharLog = diagnostics.find(
          log => log.genre === 'Sci-Fi & Fantasy' && log.arc === 'climax'
        );
        expect(specialCharLog).toBeDefined();
      });

      it('should handle special characters in arc names', () => {
        logFallbackWarning(
          'Romance',
          'rising-action',
          'setup arc for Romance',
          true
        );

        expect(consoleWarnSpy).toHaveBeenCalledWith(
          '[PromptEngine] No pattern match for genre "Romance" + arc "rising-action". Using fallback: [setup arc for Romance]'
        );

        const diagnostics = getDiagnostics();
        const specialArcLog = diagnostics.find(
          log => log.genre === 'Romance' && log.arc === 'rising-action'
        );
        expect(specialArcLog).toBeDefined();
      });

      it('should handle special characters in fallback messages', () => {
        logFallbackWarning(
          'Mystery',
          'setup',
          'DEFAULT pattern (with parentheses)',
          true
        );

        expect(consoleWarnSpy).toHaveBeenCalledWith(
          '[PromptEngine] No pattern match for genre "Mystery" + arc "setup". Using fallback: [DEFAULT pattern (with parentheses)]'
        );

        const diagnostics = getDiagnostics();
        const specialFallbackLog = diagnostics.find(
          log =>
            log.genre === 'Mystery' &&
            log.arc === 'setup' &&
            log.usedFallback === 'DEFAULT pattern (with parentheses)'
        );
        expect(specialFallbackLog).toBeDefined();
      });
    });

    describe('Multiple Unique Fallbacks', () => {
      it('should track all unique fallbacks properly', () => {
        const testCases = [
          {
            genre: 'Romance',
            arc: 'climax',
            fallback: 'setup arc for Romance',
          },
          { genre: 'Mystery', arc: 'rising', fallback: 'DEFAULT pattern' },
          { genre: 'Thriller', arc: 'resolution', fallback: 'custom fallback' },
          { genre: 'SciFi', arc: 'setup', fallback: 'setup arc for SciFi' },
          {
            genre: 'Action',
            arc: 'climax',
            fallback: 'DEFAULT pattern for Action',
          },
        ];

        testCases.forEach(({ genre, arc, fallback }) => {
          logFallbackWarning(genre, arc, fallback, true);
        });

        const diagnostics = getDiagnostics();
        expect(diagnostics.length).toBeGreaterThanOrEqual(testCases.length);

        testCases.forEach(({ genre, arc, fallback }) => {
          const matchingLog = diagnostics.find(
            log =>
              log.genre === genre &&
              log.arc === arc &&
              log.usedFallback === fallback
          );
          expect(matchingLog).toBeDefined();
        });
      });

      it('should not duplicate identical fallbacks', () => {
        // Log same fallback multiple times
        for (let i = 0; i < 5; i++) {
          logFallbackWarning(
            'Romance',
            'climax',
            'setup arc for Romance',
            true
          );
        }

        const diagnostics = getDiagnostics();
        const romanceLogs = diagnostics.filter(
          log =>
            log.genre === 'Romance' &&
            log.arc === 'climax' &&
            log.usedFallback === 'setup arc for Romance'
        );

        expect(romanceLogs).toHaveLength(1);
      });
    });

    describe('Repeated Identical Calls', () => {
      it('should not duplicate diagnostics for repeated identical calls', () => {
        logFallbackWarning('Mystery', 'rising', 'DEFAULT pattern', true);
        logFallbackWarning('Mystery', 'rising', 'DEFAULT pattern', true);
        logFallbackWarning('Mystery', 'rising', 'DEFAULT pattern', true);

        const diagnostics = getDiagnostics();
        const mysteryLogs = diagnostics.filter(
          log =>
            log.genre === 'Mystery' &&
            log.arc === 'rising' &&
            log.usedFallback === 'DEFAULT pattern'
        );

        expect(mysteryLogs).toHaveLength(1);
        expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      });

      it('should not duplicate logs for repeated identical calls with different debug values', () => {
        logFallbackWarning('Thriller', 'resolution', 'custom fallback', true);
        logFallbackWarning('Thriller', 'resolution', 'custom fallback', false);
        logFallbackWarning(
          'Thriller',
          'resolution',
          'custom fallback',
          undefined
        );

        expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Integration Tests', () => {
    it('should maintain consistency between logging and diagnostics', () => {
      logFallbackWarning('Romance', 'climax', 'setup arc for Romance', true);
      logFallbackWarning('Mystery', 'rising', 'DEFAULT pattern', true);

      expect(consoleWarnSpy).toHaveBeenCalledTimes(2);

      const diagnostics = getDiagnostics();
      expect(diagnostics.length).toBeGreaterThanOrEqual(2);

      // Verify each logged message corresponds to a diagnostic entry
      const romanceLog = diagnostics.find(
        log => log.genre === 'Romance' && log.arc === 'climax'
      );
      const mysteryLog = diagnostics.find(
        log => log.genre === 'Mystery' && log.arc === 'rising'
      );

      expect(romanceLog).toBeDefined();
      expect(mysteryLog).toBeDefined();
    });

    it('should handle rapid successive calls efficiently', () => {
      const startTime = Date.now();

      // Make many rapid calls
      for (let i = 0; i < 50; i++) {
        logFallbackWarning(`Genre${i}`, `arc${i}`, `fallback${i}`, true);
      }

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second

      const diagnostics = getDiagnostics();
      expect(diagnostics.length).toBeGreaterThanOrEqual(50);
    });

    it('should maintain unique tracking across mixed debug values', () => {
      // Mix debug true/false calls
      logFallbackWarning('Genre1', 'arc1', 'fallback1', true);
      logFallbackWarning('Genre1', 'arc1', 'fallback1', false);
      logFallbackWarning('Genre2', 'arc2', 'fallback2', true);
      logFallbackWarning('Genre2', 'arc2', 'fallback2', undefined);

      expect(consoleWarnSpy).toHaveBeenCalledTimes(2); // Only true calls should log

      const diagnostics = getDiagnostics();
      const genre1Logs = diagnostics.filter(log => log.genre === 'Genre1');
      const genre2Logs = diagnostics.filter(log => log.genre === 'Genre2');

      expect(genre1Logs).toHaveLength(1);
      expect(genre2Logs).toHaveLength(1);
    });
  });
});
