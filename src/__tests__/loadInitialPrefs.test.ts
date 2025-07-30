// MCP Context Block
/*
{
  file: "loadInitialPrefs.test.ts",
  role: "test",
  allowedActions: ["test", "validate"],
  tier: "Pro",
  contentSensitivity: "low",
  theme: "testing"
}
*/

import { loadInitialPrefs } from '../utils/loadInitialPrefs';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

// Expected preference schema
interface ExpectedPrefs {
  tone: string;
  genre: string;
  arc: string;
  memory: boolean;
  copilot: boolean;
}

describe('loadInitialPrefs', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();
    mockLocalStorage.clear.mockClear();
  });

  describe('Valid localStorage values', () => {
    it('should load fully valid preference object', () => {
      const validPrefs: ExpectedPrefs = {
        tone: 'friendly',
        genre: 'Romance',
        arc: 'setup',
        memory: true,
        copilot: false,
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(validPrefs));

      const result = loadInitialPrefs();

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('agentPreferences');
      expect(result).toEqual(validPrefs);
    });

    it('should handle partial preferences with defaults', () => {
      const partialPrefs = {
        tone: 'formal',
        genre: 'Mystery',
        // Missing: arc, memory, copilot
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(partialPrefs));

      const result = loadInitialPrefs();

      expect(result).toMatchObject({
        tone: 'formal',
        genre: 'Mystery',
        arc: 'setup', // Default
        memory: false, // Default
        copilot: false, // Default
      });
    });

    it('should handle tone-only preferences', () => {
      const toneOnlyPrefs = {
        tone: 'casual',
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(toneOnlyPrefs));

      const result = loadInitialPrefs();

      expect(result).toMatchObject({
        tone: 'casual',
        genre: 'General', // Default
        arc: 'setup', // Default
        memory: false, // Default
        copilot: false, // Default
      });
    });

    it('should handle genre-only preferences', () => {
      const genreOnlyPrefs = {
        genre: 'SciFi',
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(genreOnlyPrefs));

      const result = loadInitialPrefs();

      expect(result).toMatchObject({
        tone: 'friendly', // Default
        genre: 'SciFi',
        arc: 'setup', // Default
        memory: false, // Default
        copilot: false, // Default
      });
    });
  });

  describe('Invalid localStorage values', () => {
    it('should return default preferences when localStorage is empty', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = await loadInitialPrefs();

      expect(result).toMatchObject({
        tone: 'friendly',
        language: 'en',
        copilotEnabled: true,
        memoryEnabled: true,
        defaultCommandView: 'list',
        lockedFields: []
      });
    });

    it('should load preferences from localStorage when available', async () => {
      const storedPrefs = {
        tone: 'formal',
        language: 'es',
        copilotEnabled: false,
        memoryEnabled: true,
        defaultCommandView: 'grid',
        lockedFields: ['tone']
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(storedPrefs));

      const result = await loadInitialPrefs();

      expect(result).toMatchObject(storedPrefs);
    });

    it('should merge initial preferences with stored preferences', async () => {
      const storedPrefs = {
        tone: 'formal' as const,
        language: 'es' as const,
        copilotEnabled: false
      };

      const initialPrefs = {
        memoryEnabled: true,
        defaultCommandView: 'list' as const
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(storedPrefs));

      const result = await loadInitialPrefs(initialPrefs);

      expect(result).toMatchObject({
        ...storedPrefs,
        ...initialPrefs
      });
    });

    it('should handle invalid JSON in localStorage', async () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json');

      const result = await loadInitialPrefs();

      expect(result).toMatchObject({
        tone: 'friendly',
        language: 'en',
        copilotEnabled: true,
        memoryEnabled: true,
        defaultCommandView: 'list',
        lockedFields: []
      });
    });

    it('should handle localStorage.getItem throwing an error', async () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      const result = await loadInitialPrefs();

      expect(result).toMatchObject({
        tone: 'friendly',
        language: 'en',
        copilotEnabled: true,
        memoryEnabled: true,
        defaultCommandView: 'list',
        lockedFields: []
      });
    });
  });

  describe('Schema validation', () => {
    it('should ensure output matches expected preference schema', async () => {
      const testCases = [
        {
          input: null,
          expected: {
            tone: 'friendly',
            language: 'en',
            copilotEnabled: true,
            memoryEnabled: true,
            defaultCommandView: 'list',
            lockedFields: []
          },
        },
        {
          input: { tone: 'formal' as const },
          expected: {
            tone: 'formal',
            language: 'en',
            copilotEnabled: true,
            memoryEnabled: true,
            defaultCommandView: 'list',
            lockedFields: []
          },
        },
        {
          input: { language: 'es' as const, copilotEnabled: false },
          expected: {
            tone: 'friendly',
            language: 'es',
            copilotEnabled: false,
            memoryEnabled: true,
            defaultCommandView: 'list',
            lockedFields: []
          },
        },
        {
          input: { memoryEnabled: true, copilotEnabled: true },
          expected: {
            tone: 'friendly',
            language: 'en',
            copilotEnabled: true,
            memoryEnabled: true,
            defaultCommandView: 'list',
            lockedFields: []
          },
        },
      ];

      for (const { input, expected } of testCases) {
        mockLocalStorage.getItem.mockReturnValue(input ? JSON.stringify(input) : null);

        const result = await loadInitialPrefs();

        expect(result).toMatchObject(expected);
        expect(result).toHaveProperty('tone');
        expect(result).toHaveProperty('language');
        expect(result).toHaveProperty('copilotEnabled');
        expect(result).toHaveProperty('memoryEnabled');
        expect(result).toHaveProperty('defaultCommandView');
        expect(typeof result.tone).toBe('string');
        expect(typeof result.language).toBe('string');
        expect(typeof result.copilotEnabled).toBe('boolean');
        expect(typeof result.memoryEnabled).toBe('boolean');
        expect(typeof result.defaultCommandView).toBe('string');
      }
    });

    it('should handle boolean values correctly', async () => {
      const booleanTestCases = [
        { memoryEnabled: true, copilotEnabled: false },
        { memoryEnabled: false, copilotEnabled: true },
        { memoryEnabled: true, copilotEnabled: true },
        { memoryEnabled: false, copilotEnabled: false },
      ];

      for (const { memoryEnabled, copilotEnabled } of booleanTestCases) {
        const input = { memoryEnabled, copilotEnabled };
        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(input));

        const result = await loadInitialPrefs();

        expect(result.memoryEnabled).toBe(memoryEnabled);
        expect(result.copilotEnabled).toBe(copilotEnabled);
        expect(typeof result.memoryEnabled).toBe('boolean');
        expect(typeof result.copilotEnabled).toBe('boolean');
      }
    });

    it('should handle string values correctly', async () => {
      const stringTestCases = [
        { tone: 'friendly' as const, language: 'en' as const },
        { tone: 'formal' as const, language: 'es' as const },
        { tone: 'concise' as const, language: 'fr' as const },
      ];

      for (const { tone, language } of stringTestCases) {
        const input = { tone, language };
        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(input));

        const result = await loadInitialPrefs();

        expect(result.tone).toBe(tone);
        expect(result.language).toBe(language);
        expect(typeof result.tone).toBe('string');
        expect(typeof result.language).toBe('string');
      }
    });
  });

  describe('Edge cases', () => {
    it('should handle localStorage.getItem throwing an error', async () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      const result = await loadInitialPrefs();

      expect(result).toMatchObject({
        tone: 'friendly',
        language: 'en',
        copilotEnabled: true,
        memoryEnabled: true,
        defaultCommandView: 'list',
        lockedFields: []
      });
    });

    it('should handle very large preference objects', async () => {
      const largePrefs = {
        tone: 'friendly' as const,
        language: 'en' as const,
        copilotEnabled: true,
        memoryEnabled: false,
        extraData: 'x'.repeat(10000), // Large extra data
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(largePrefs));

      const result = await loadInitialPrefs();

      expect(result).toMatchObject({
        tone: 'friendly',
        language: 'en',
        copilotEnabled: true,
        memoryEnabled: false,
        defaultCommandView: 'list',
        lockedFields: []
      });
      // Should not include extraData
      expect(result).not.toHaveProperty('extraData');
    });

    it('should handle nested objects in preferences', () => {
      const nestedPrefs = {
        tone: 'friendly',
        genre: 'Romance',
        arc: 'setup',
        memory: true,
        copilot: false,
        nested: { data: 'should be ignored' },
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(nestedPrefs));

      const result = loadInitialPrefs();

      expect(result).toMatchObject({
        tone: 'friendly',
        genre: 'Romance',
        arc: 'setup',
        memory: true,
        copilot: false,
      });
      // Should not include nested objects
      expect(result).not.toHaveProperty('nested');
    });

    it('should handle function values in preferences', () => {
      const functionPrefs = {
        tone: 'friendly',
        genre: 'Romance',
        arc: 'setup',
        memory: true,
        copilot: false,
        func: () => 'should be ignored',
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(functionPrefs));

      const result = loadInitialPrefs();

      expect(result).toMatchObject({
        tone: 'friendly',
        genre: 'Romance',
        arc: 'setup',
        memory: true,
        copilot: false,
      });
      // Should not include function
      expect(result).not.toHaveProperty('func');
    });
  });

  describe('Performance and reliability', () => {
    it('should handle rapid successive calls', () => {
      const testPrefs = {
        tone: 'friendly',
        genre: 'Romance',
        arc: 'setup',
        memory: true,
        copilot: false,
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(testPrefs));

      const startTime = Date.now();

      // Make many rapid calls
      for (let i = 0; i < 100; i++) {
        const result = loadInitialPrefs();
        expect(result).toMatchObject(testPrefs);
      }

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should not modify localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      loadInitialPrefs();

      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
      expect(mockLocalStorage.removeItem).not.toHaveBeenCalled();
      expect(mockLocalStorage.clear).not.toHaveBeenCalled();
    });

    it('should only call localStorage.getItem once per call', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      loadInitialPrefs();

      expect(mockLocalStorage.getItem).toHaveBeenCalledTimes(1);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('agentPreferences');
    });
  });

  describe('Various input combinations', () => {
    it('should handle various input combinations', async () => {
      const testCases = [
        {
          input: null,
          expected: {
            tone: 'friendly',
            language: 'en',
            copilotEnabled: true,
            memoryEnabled: true,
            defaultCommandView: 'list',
            lockedFields: []
          },
        },
        {
          input: {
            tone: 'formal' as const,
            language: 'es' as const,
            copilotEnabled: false,
            memoryEnabled: true,
            defaultCommandView: 'grid' as const,
            lockedFields: ['tone']
          },
          expected: {
            tone: 'formal',
            language: 'es',
            copilotEnabled: false,
            memoryEnabled: true,
            defaultCommandView: 'grid',
            lockedFields: ['tone']
          },
        },
      ];

      for (const { input, expected } of testCases) {
        mockLocalStorage.getItem.mockReturnValue(input ? JSON.stringify(input) : null);

        const result = await loadInitialPrefs();

        expect(result).toMatchObject(expected);
        expect(result).toHaveProperty('tone');
        expect(result).toHaveProperty('language');
        expect(result).toHaveProperty('copilotEnabled');
        expect(result).toHaveProperty('memoryEnabled');
        expect(result).toHaveProperty('defaultCommandView');
        expect(typeof result.tone).toBe('string');
        expect(typeof result.language).toBe('string');
        expect(typeof result.copilotEnabled).toBe('boolean');
        expect(typeof result.memoryEnabled).toBe('boolean');
        expect(typeof result.defaultCommandView).toBe('string');
      }
    });
  });
}); 