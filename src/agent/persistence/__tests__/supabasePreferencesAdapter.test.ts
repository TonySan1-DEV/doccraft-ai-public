// MCP Context Block
/*
{
  file: "supabasePreferencesAdapter.test.ts",
  role: "qa-engineer",
  allowedActions: ["test", "validate", "mock"],
  tier: "Pro",
  contentSensitivity: "low",
  theme: "data_persistence"
}
*/

import { AgentPrefs } from '../../../types/agentPreferences';
import {
  fetchPreferencesFromSupabase,
  syncPreferencesToSupabase,
  deletePreferencesFromSupabase,
  hasPreferencesInSupabase,
  getCurrentUserId,
  fetchCurrentUserPreferences,
  syncCurrentUserPreferences
} from '../supabasePreferencesAdapter';

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn()
        }))
      })),
      upsert: jest.fn(() => ({
        onConflict: jest.fn(() => ({
          ignoreDuplicates: jest.fn()
        }))
      })),
      delete: jest.fn(() => ({
        eq: jest.fn()
      }))
    })),
    auth: {
      getUser: jest.fn()
    }
  }))
}));

// Mock environment variables
const mockEnv = {
  REACT_APP_SUPABASE_URL: 'https://test.supabase.co',
  REACT_APP_SUPABASE_ANON_KEY: 'test-anon-key'
};

Object.defineProperty(process.env, 'REACT_APP_SUPABASE_URL', {
  value: mockEnv.REACT_APP_SUPABASE_URL,
  writable: true
});

Object.defineProperty(process.env, 'REACT_APP_SUPABASE_ANON_KEY', {
  value: mockEnv.REACT_APP_SUPABASE_ANON_KEY,
  writable: true
});

// Mock telemetry
const mockLogTelemetryEvent = jest.fn();
Object.defineProperty(window, 'logTelemetryEvent', {
  value: mockLogTelemetryEvent,
  writable: true
});

describe('supabasePreferencesAdapter', () => {
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Get the mocked Supabase client
    const { createClient } = require('@supabase/supabase-js');
    mockSupabase = createClient();
  });

  describe('fetchPreferencesFromSupabase', () => {
    const testUserId = 'test-user-123';
    const validPreferences: AgentPrefs = {
      tone: 'friendly',
      language: 'en',
      copilotEnabled: true,
      memoryEnabled: true,
      defaultCommandView: 'list',
      lockedFields: []
    };

    it('should return parsed preferences when available', async () => {
      const mockData = {
        user_id: testUserId,
        tone: 'friendly',
        language: 'en',
        copilot_enabled: true,
        memory_enabled: true,
        default_command_view: 'list',
        locked_fields: []
      };

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: mockData,
        error: null
      });

      const result = await fetchPreferencesFromSupabase(testUserId);

      expect(result).toEqual(validPreferences);
      expect(mockSupabase.from).toHaveBeenCalledWith('user_preferences');
      expect(mockSupabase.from().select).toHaveBeenCalledWith('*');
      expect(mockSupabase.from().select().eq).toHaveBeenCalledWith('user_id', testUserId);
    });

    it('should return null if record does not exist', async () => {
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'No rows found' }
      });

      const result = await fetchPreferencesFromSupabase(testUserId);

      expect(result).toBeNull();
    });

    it('should handle fetch failure gracefully', async () => {
      const mockError = new Error('Network error');
      mockSupabase.from().select().eq().single.mockRejectedValue(mockError);

      const result = await fetchPreferencesFromSupabase(testUserId);

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        '[SupabaseAdapter] Fetch error:',
        mockError
      );
    });

    it('should sanitize and validate returned values', async () => {
      const invalidData = {
        user_id: testUserId,
        tone: 'invalid-tone', // Invalid tone
        language: 'invalid-lang', // Invalid language
        copilot_enabled: 'not-boolean', // Invalid boolean
        memory_enabled: true,
        default_command_view: 'invalid-view', // Invalid view
        locked_fields: 'not-array' // Invalid array
      };

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: invalidData,
        error: null
      });

      const result = await fetchPreferencesFromSupabase(testUserId);

      // Should fallback to valid defaults
      expect(result).toEqual({
        tone: 'friendly', // Fallback
        language: 'en', // Fallback
        copilotEnabled: true, // Fallback
        memoryEnabled: true, // Valid
        defaultCommandView: 'list', // Fallback
        lockedFields: [] // Fallback
      });
    });

    it('should handle null userId gracefully', async () => {
      const result = await fetchPreferencesFromSupabase(null as any);

      expect(result).toBeNull();
      expect(console.warn).toHaveBeenCalledWith(
        '[SupabaseAdapter] Invalid user ID provided'
      );
    });

    it('should log telemetry on error', async () => {
      const mockError = new Error('Test error');
      mockSupabase.from().select().eq().single.mockRejectedValue(mockError);

      await fetchPreferencesFromSupabase(testUserId);

      expect(mockLogTelemetryEvent).toHaveBeenCalledWith(
        'preferences_fetch_supabase_error',
        {
          userId: testUserId,
          error: 'Test error'
        }
      );
    });
  });

  describe('syncPreferencesToSupabase', () => {
    const testUserId = 'test-user-123';
    const testPreferences: AgentPrefs = {
      tone: 'formal',
      language: 'es',
      copilotEnabled: false,
      memoryEnabled: true,
      defaultCommandView: 'grid',
      lockedFields: ['copilotEnabled']
    };

    it('should send correct payload to Supabase upsert', async () => {
      mockSupabase.from().upsert().onConflict().ignoreDuplicates.mockResolvedValue({
        error: null
      });

      await syncPreferencesToSupabase(testUserId, testPreferences);

      expect(mockSupabase.from).toHaveBeenCalledWith('user_preferences');
      expect(mockSupabase.from().upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: testUserId,
          tone: 'formal',
          language: 'es',
          copilot_enabled: false,
          memory_enabled: true,
          default_command_view: 'grid',
          locked_fields: ['copilotEnabled']
        }),
        expect.objectContaining({
          onConflict: 'user_id',
          ignoreDuplicates: false
        })
      );
    });

    it('should handle Supabase errors gracefully', async () => {
      const mockError = new Error('Database error');
      mockSupabase.from().upsert().onConflict().ignoreDuplicates.mockResolvedValue({
        error: mockError
      });

      await expect(syncPreferencesToSupabase(testUserId, testPreferences))
        .rejects.toThrow('Database error');

      expect(console.error).toHaveBeenCalledWith(
        '[SupabaseAdapter] Sync error:',
        mockError
      );
    });

    it('should not throw if Supabase is unreachable', async () => {
      mockSupabase.from().upsert().onConflict().ignoreDuplicates.mockRejectedValue(
        new Error('Network unreachable')
      );

      await expect(syncPreferencesToSupabase(testUserId, testPreferences))
        .rejects.toThrow('Network unreachable');
    });

    it('should validate preferences before syncing', async () => {
      const invalidPreferences = {
        tone: 'invalid-tone' as any,
        language: 'en' as const,
        copilotEnabled: true,
        memoryEnabled: true,
        defaultCommandView: 'list' as const,
        lockedFields: []
      } as AgentPrefs;

      await expect(syncPreferencesToSupabase(testUserId, invalidPreferences))
        .rejects.toThrow('Preferences failed validation');
    });

    it('should handle null userId', async () => {
      await expect(syncPreferencesToSupabase(null as any, testPreferences))
        .rejects.toThrow('Invalid user ID provided');
    });

    it('should handle null preferences', async () => {
      await expect(syncPreferencesToSupabase(testUserId, null as any))
        .rejects.toThrow('Invalid preferences object provided');
    });

    it('should log telemetry on successful sync', async () => {
      mockSupabase.from().upsert().onConflict().ignoreDuplicates.mockResolvedValue({
        error: null
      });

      await syncPreferencesToSupabase(testUserId, testPreferences);

      expect(mockLogTelemetryEvent).toHaveBeenCalledWith(
        'preferences_sync_supabase_success',
        {
          userId: testUserId,
          fields: expect.arrayContaining([
            'tone', 'language', 'copilotEnabled', 'memoryEnabled', 
            'defaultCommandView', 'lockedFields'
          ])
        }
      );
    });
  });

  describe('deletePreferencesFromSupabase', () => {
    const testUserId = 'test-user-123';

    it('should delete user preferences successfully', async () => {
      mockSupabase.from().delete().eq.mockResolvedValue({
        error: null
      });

      await deletePreferencesFromSupabase(testUserId);

      expect(mockSupabase.from).toHaveBeenCalledWith('user_preferences');
      expect(mockSupabase.from().delete).toHaveBeenCalled();
      expect(mockSupabase.from().delete().eq).toHaveBeenCalledWith('user_id', testUserId);
    });

    it('should handle delete errors', async () => {
      const mockError = new Error('Delete failed');
      mockSupabase.from().delete().eq.mockResolvedValue({
        error: mockError
      });

      await expect(deletePreferencesFromSupabase(testUserId))
        .rejects.toThrow('Delete failed');
    });

    it('should handle null userId', async () => {
      await expect(deletePreferencesFromSupabase(null as any))
        .rejects.toThrow('Invalid user ID provided');
    });
  });

  describe('hasPreferencesInSupabase', () => {
    const testUserId = 'test-user-123';

    it('should return true when user has preferences', async () => {
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: { user_id: testUserId },
        error: null
      });

      const result = await hasPreferencesInSupabase(testUserId);

      expect(result).toBe(true);
    });

    it('should return false when user has no preferences', async () => {
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' }
      });

      const result = await hasPreferencesInSupabase(testUserId);

      expect(result).toBe(false);
    });

    it('should return false for null userId', async () => {
      const result = await hasPreferencesInSupabase(null as any);

      expect(result).toBe(false);
    });
  });

  describe('getCurrentUserId', () => {
    it('should return user ID when authenticated', async () => {
      const mockUser = { id: 'test-user-123' };
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const result = await getCurrentUserId();

      expect(result).toBe('test-user-123');
    });

    it('should return null when not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      });

      const result = await getCurrentUserId();

      expect(result).toBeNull();
    });

    it('should return null on auth error', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Auth error')
      });

      const result = await getCurrentUserId();

      expect(result).toBeNull();
    });
  });

  describe('fetchCurrentUserPreferences', () => {
    it('should fetch preferences for current user', async () => {
      const mockUser = { id: 'test-user-123' };
      const mockPreferences: AgentPrefs = {
        tone: 'friendly',
        language: 'en',
        copilotEnabled: true,
        memoryEnabled: true,
        defaultCommandView: 'list',
        lockedFields: []
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: {
          user_id: 'test-user-123',
          tone: 'friendly',
          language: 'en',
          copilot_enabled: true,
          memory_enabled: true,
          default_command_view: 'list',
          locked_fields: []
        },
        error: null
      });

      const result = await fetchCurrentUserPreferences();

      expect(result).toEqual(mockPreferences);
    });

    it('should return null when no authenticated user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      });

      const result = await fetchCurrentUserPreferences();

      expect(result).toBeNull();
      expect(console.warn).toHaveBeenCalledWith(
        '[SupabaseAdapter] No authenticated user found'
      );
    });
  });

  describe('syncCurrentUserPreferences', () => {
    const testPreferences: AgentPrefs = {
      tone: 'formal',
      language: 'es',
      copilotEnabled: true,
      memoryEnabled: false,
      defaultCommandView: 'grid',
      lockedFields: []
    };

    it('should sync preferences for current user', async () => {
      const mockUser = { id: 'test-user-123' };
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      mockSupabase.from().upsert().onConflict().ignoreDuplicates.mockResolvedValue({
        error: null
      });

      await syncCurrentUserPreferences(testPreferences);

      expect(mockSupabase.from().upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'test-user-123',
          tone: 'formal',
          language: 'es'
        }),
        expect.any(Object)
      );
    });

    it('should throw error when no authenticated user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      });

      await expect(syncCurrentUserPreferences(testPreferences))
        .rejects.toThrow('No authenticated user found');
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle malformed database responses', async () => {
      const testUserId = 'test-user-123';
      
      // Malformed data with missing fields
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: { user_id: testUserId }, // Missing other fields
        error: null
      });

      const result = await fetchPreferencesFromSupabase(testUserId);

      // Should return null due to validation failure
      expect(result).toBeNull();
    });

    it('should handle network timeouts', async () => {
      const testUserId = 'test-user-123';
      
      mockSupabase.from().select().eq().single.mockRejectedValue(
        new Error('Request timeout')
      );

      const result = await fetchPreferencesFromSupabase(testUserId);

      expect(result).toBeNull();
    });

    it('should handle database connection errors', async () => {
      const testUserId = 'test-user-123';
      
      mockSupabase.from().select().eq().single.mockRejectedValue(
        new Error('Connection refused')
      );

      const result = await fetchPreferencesFromSupabase(testUserId);

      expect(result).toBeNull();
    });
  });
}); 