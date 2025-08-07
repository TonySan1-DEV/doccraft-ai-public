// MCP Context Block
/*
{
  file: "preferencesAPI.test.ts",
  role: "qa-engineer",
  allowedActions: ["test", "validate", "security"],
  tier: "Pro",
  contentSensitivity: "low",
  theme: "agent_testing"
}
*/

import {
  fetchPreferencesFromServer,
  syncPreferencesToServer,
  fetchAdminDefaults,
  mergePreferences,
  hasServerPreferences,
  fetchPreferencesWithRetry,
  syncPreferencesWithRetry,
  API_CONFIG,
  PREFERENCES_SCHEMA,
} from '../preferencesAPI';

// Mock dependencies
jest.mock('../../useMCP', () => ({
  useMCP: jest.fn(),
}));

// Mock telemetry
const mockLogTelemetryEvent = jest.fn();
Object.defineProperty(window, 'logTelemetryEvent', {
  value: mockLogTelemetryEvent,
  writable: true,
});

// Mock localStorage and sessionStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
});

// Test data
const validPreferences = {
  tone: 'friendly' as const,
  language: 'en' as const,
  copilotEnabled: true,
  memoryEnabled: true,
  defaultCommandView: 'list' as const,
  lockedFields: [],
};

const invalidPreferences = {
  tone: 'invalid-tone' as any,
  language: 'invalid-lang' as any,
  copilotEnabled: 'not-a-boolean' as any,
  memoryEnabled: 'not-a-boolean' as any,
  defaultCommandView: 'invalid-view' as any,
  lockedFields: 'not-an-array' as any,
};

const partialPreferences = {
  tone: 'formal',
  language: 'es',
  // Missing other fields
};

describe('preferencesAPI', () => {
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockLogTelemetryEvent.mockImplementation(() => {});
    mockLocalStorage.getItem.mockReturnValue(null);
    mockSessionStorage.getItem.mockReturnValue(null);

    // Mock fetch
    fetchSpy = jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(validPreferences),
      } as Response)
    );
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  describe('fetchPreferencesFromServer', () => {
    it('should return preferences when API responds successfully', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(validPreferences),
      } as Response);

      const result = await fetchPreferencesFromServer();

      expect(result).toEqual(validPreferences);
      expect(fetchSpy).toHaveBeenCalledWith(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.preferences}`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should handle missing fields with default fallback', async () => {
      const incompletePrefs = {
        tone: 'formal',
        language: 'es',
        // Missing other required fields
      };

      fetchSpy.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(incompletePrefs),
      } as Response);

      const result = await fetchPreferencesFromServer();

      expect(result).toEqual({
        tone: 'formal',
        language: 'es',
        copilotEnabled: true, // Default fallback
        memoryEnabled: true, // Default fallback
        defaultCommandView: 'list', // Default fallback
        lockedFields: [], // Default fallback
      });
    });

    it('should return null if API returns 404', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response);

      const result = await fetchPreferencesFromServer();

      expect(result).toBeNull();
      expect(mockLogTelemetryEvent).toHaveBeenCalledWith(
        'preferences_fetch_not_found',
        { status: 404 }
      );
    });

    it('should return null if API returns 401', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      } as Response);

      const result = await fetchPreferencesFromServer();

      expect(result).toBeNull();
      expect(mockLogTelemetryEvent).toHaveBeenCalledWith(
        'preferences_fetch_unauthorized',
        { status: 401 }
      );
    });

    it('should return null if API returns 500', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);

      const result = await fetchPreferencesFromServer();

      expect(result).toBeNull();
      expect(mockLogTelemetryEvent).toHaveBeenCalledWith(
        'preferences_fetch_error',
        expect.objectContaining({
          error: 'HTTP 500: Internal Server Error',
        })
      );
    });

    it('should handle network errors gracefully', async () => {
      fetchSpy.mockRejectedValueOnce(new Error('Network error'));

      const result = await fetchPreferencesFromServer();

      expect(result).toBeNull();
      expect(mockLogTelemetryEvent).toHaveBeenCalledWith(
        'preferences_fetch_error',
        expect.objectContaining({
          error: 'Network error',
        })
      );
    });

    it('should handle invalid JSON responses', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.reject(new Error('Invalid JSON')),
      } as Response);

      const result = await fetchPreferencesFromServer();

      expect(result).toBeNull();
      expect(mockLogTelemetryEvent).toHaveBeenCalledWith(
        'preferences_fetch_error',
        expect.objectContaining({
          error: 'Invalid JSON',
        })
      );
    });

    it('should handle timeout errors', async () => {
      fetchSpy.mockRejectedValueOnce(new Error('Timeout'));

      const result = await fetchPreferencesFromServer();

      expect(result).toBeNull();
      expect(mockLogTelemetryEvent).toHaveBeenCalledWith(
        'preferences_fetch_error',
        expect.objectContaining({
          error: 'Timeout',
        })
      );
    });
  });

  describe('syncPreferencesToServer', () => {
    it('should send correct payload to API endpoint', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true }),
      } as Response);

      const result = await syncPreferencesToServer(validPreferences);

      expect(result).toBe(true);
      expect(fetchSpy).toHaveBeenCalledWith(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.preferences}`,
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify(validPreferences),
        })
      );
    });

    it('should include all expected fields in payload', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true }),
      } as Response);

      await syncPreferencesToServer(validPreferences);

      const callArgs = fetchSpy.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);

      expect(body).toHaveProperty('tone');
      expect(body).toHaveProperty('language');
      expect(body).toHaveProperty('copilotEnabled');
      expect(body).toHaveProperty('memoryEnabled');
      expect(body).toHaveProperty('defaultCommandView');
      expect(body).toHaveProperty('lockedFields');
    });

    it('should return false if server rejects request', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
      } as Response);

      const result = await syncPreferencesToServer(validPreferences);

      expect(result).toBe(false);
      expect(mockLogTelemetryEvent).toHaveBeenCalledWith(
        'preferences_sync_forbidden',
        { status: 403 }
      );
    });

    it('should return false if server returns 401', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      } as Response);

      const result = await syncPreferencesToServer(validPreferences);

      expect(result).toBe(false);
      expect(mockLogTelemetryEvent).toHaveBeenCalledWith(
        'preferences_sync_unauthorized',
        { status: 401 }
      );
    });

    it('should not throw or crash on network failure', async () => {
      fetchSpy.mockRejectedValueOnce(new Error('Network error'));

      const result = await syncPreferencesToServer(validPreferences);

      expect(result).toBe(false);
      expect(mockLogTelemetryEvent).toHaveBeenCalledWith(
        'preferences_sync_error',
        expect.objectContaining({
          error: 'Network error',
          prefs: validPreferences,
        })
      );
    });

    it('should validate preferences before sending', async () => {
      const result = await syncPreferencesToServer(null as any);

      expect(result).toBe(false);
      expect(fetchSpy).not.toHaveBeenCalled();
      expect(mockLogTelemetryEvent).toHaveBeenCalledWith(
        'preferences_sync_invalid',
        { prefs: invalidPreferences }
      );
    });
  });

  describe('Security & Sanity', () => {
    it('should strip unexpected values from fetched response', async () => {
      const responseWithExtraFields = {
        ...validPreferences,
        unexpectedField: 'should-be-removed',
        maliciousField: '<script>alert("xss")</script>',
      };

      fetchSpy.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(responseWithExtraFields),
      } as Response);

      const result = await fetchPreferencesFromServer();

      expect(result).toEqual(validPreferences);
      expect(result).not.toHaveProperty('unexpectedField');
      expect(result).not.toHaveProperty('maliciousField');
    });

    it('should validate tone values before applying', async () => {
      const invalidToneResponse = {
        ...validPreferences,
        tone: 'invalid-tone' as any,
      };

      fetchSpy.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(invalidToneResponse),
      } as Response);

      const result = await fetchPreferencesFromServer();

      expect(result?.tone).toBe('friendly'); // Default fallback
    });

    it('should validate language values before applying', async () => {
      const invalidLanguageResponse = {
        ...validPreferences,
        language: 'invalid-lang' as any,
      };

      fetchSpy.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(invalidLanguageResponse),
      } as Response);

      const result = await fetchPreferencesFromServer();

      expect(result?.language).toBe('en'); // Default fallback
    });

    it('should prevent sync if updatedPrefs is invalid', async () => {
      const result = await syncPreferencesToServer(null as any);

      expect(result).toBe(false);
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('should handle partial preferences gracefully', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(partialPreferences),
      } as Response);

      const result = await fetchPreferencesFromServer();

      expect(result).toEqual({
        ...partialPreferences,
        copilotEnabled: true, // Default
        memoryEnabled: true, // Default
        defaultCommandView: 'list', // Default
        lockedFields: [], // Default
      });
    });
  });

  describe('fetchAdminDefaults', () => {
    it('should fetch admin defaults successfully', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(validPreferences),
      } as Response);

      const result = await fetchAdminDefaults();

      expect(result).toEqual(validPreferences);
      expect(fetchSpy).toHaveBeenCalledWith(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.adminDefaults}`,
        expect.any(Object)
      );
    });

    it('should return null if admin defaults are not available', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response);

      const result = await fetchAdminDefaults();

      expect(result).toBeNull();
    });
  });

  describe('mergePreferences', () => {
    it('should merge server preferences with local preferences', () => {
      const serverPrefs = {
        tone: 'formal' as const,
        language: 'es' as const,
        copilotEnabled: false,
        memoryEnabled: true,
        defaultCommandView: 'grid' as const,
        lockedFields: ['tone'],
      };

      const localPrefs = {
        tone: 'friendly' as const,
        language: 'en' as const,
        copilotEnabled: true,
        memoryEnabled: false,
        defaultCommandView: 'list' as const,
        lockedFields: [],
      };

      const result = mergePreferences(serverPrefs, localPrefs);

      expect(result).toEqual({
        tone: 'formal', // Server takes priority
        language: 'es', // Server takes priority
        copilotEnabled: false, // Server takes priority
        memoryEnabled: true, // Server takes priority
        defaultCommandView: 'grid', // Server takes priority
        lockedFields: ['tone'], // Server takes priority
      });
    });

    it('should return local preferences when server prefs are null', () => {
      const localPrefs = validPreferences;
      const result = mergePreferences(null, localPrefs);

      expect(result).toEqual(localPrefs);
    });
  });

  describe('hasServerPreferences', () => {
    it('should return true when server has preferences', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        status: 200,
      } as Response);

      const result = await hasServerPreferences();

      expect(result).toBe(true);
      expect(fetchSpy).toHaveBeenCalledWith(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.preferences}`,
        expect.objectContaining({
          method: 'HEAD',
        })
      );
    });

    it('should return false when server has no preferences', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response);

      const result = await hasServerPreferences();

      expect(result).toBe(false);
    });
  });

  describe('Retry functionality', () => {
    it('should retry fetch on failure', async () => {
      // First call fails
      fetchSpy.mockRejectedValueOnce(new Error('Network error'));
      // Second call succeeds
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(validPreferences),
      } as Response);

      const result = await fetchPreferencesWithRetry();

      expect(result).toEqual(validPreferences);
      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });

    it('should retry sync on failure', async () => {
      // First call fails
      fetchSpy.mockRejectedValueOnce(new Error('Network error'));
      // Second call succeeds
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true }),
      } as Response);

      const result = await syncPreferencesWithRetry(validPreferences);

      expect(result).toBe(true);
      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('Authentication headers', () => {
    it('should include MCP context in headers', async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mockUseMCP = require('../../useMCP').useMCP;
      mockUseMCP.mockReturnValue({
        role: 'admin',
        tier: 'Pro',
        allowedActions: ['updatePrefs', 'readPrefs'],
      });

      fetchSpy.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(validPreferences),
      } as Response);

      await fetchPreferencesFromServer();

      const callArgs = fetchSpy.mock.calls[0];
      const headers = callArgs[1].headers;

      expect(headers['X-MCP-Role']).toBe('admin');
      expect(headers['X-MCP-Tier']).toBe('Pro');
      expect(headers['X-MCP-Actions']).toBe('updatePrefs,readPrefs');
    });

    it('should include auth token when available', async () => {
      mockLocalStorage.getItem.mockReturnValue('test-token');

      fetchSpy.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(validPreferences),
      } as Response);

      await fetchPreferencesFromServer();

      const callArgs = fetchSpy.mock.calls[0];
      const headers = callArgs[1].headers;

      expect(headers['Authorization']).toBe('Bearer test-token');
    });
  });

  describe('Configuration', () => {
    it('should use correct API configuration', () => {
      expect(API_CONFIG.baseUrl).toBe(
        process.env.REACT_APP_API_BASE_URL || '/api'
      );
      expect(API_CONFIG.endpoints.preferences).toBe('/user/preferences');
      expect(API_CONFIG.endpoints.adminDefaults).toBe('/admin/defaults');
      expect(API_CONFIG.timeout).toBe(10000);
      expect(API_CONFIG.retryAttempts).toBe(3);
    });

    it('should have correct preferences schema', () => {
      expect(PREFERENCES_SCHEMA.tone).toEqual([
        'friendly',
        'formal',
        'concise',
      ]);
      expect(PREFERENCES_SCHEMA.language).toContain('en');
      expect(PREFERENCES_SCHEMA.language).toContain('es');
      expect(PREFERENCES_SCHEMA.copilotEnabled).toBe('boolean');
      expect(PREFERENCES_SCHEMA.memoryEnabled).toBe('boolean');
      expect(PREFERENCES_SCHEMA.defaultCommandView).toEqual(['list', 'grid']);
    });
  });
});
