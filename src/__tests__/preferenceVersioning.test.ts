// MCP Context Block
/*
{
  file: "preferenceVersioning.test.ts",
  role: "test-developer",
  allowedActions: ["test", "validate"],
  tier: "Pro",
  contentSensitivity: "low",
  theme: "preference_versions"
}
*/

import { preferenceVersionService } from '../services/preferenceVersionService';
import { AgentPrefs } from '../types/agentPreferences';

// Mock Supabase
const mockSupabase = {
  auth: {
    getUser: jest.fn()
  },
  rpc: jest.fn(),
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    delete: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    upsert: jest.fn()
  }))
};

jest.mock('../lib/supabase', () => ({
  supabase: mockSupabase
}));

describe('Preference Versioning System', () => {
  const mockUser = { id: 'test-user-id' };
  const mockPreferences: AgentPrefs = {
    tone: 'friendly',
    language: 'en',
    copilotEnabled: true,
    memoryEnabled: true,
    defaultCommandView: 'list',
    lockedFields: []
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
  });

  describe('createVersion', () => {
    it('should create a new preference version successfully', async () => {
      const mockVersionId = 'version-123';
      mockSupabase.rpc.mockResolvedValue({
        data: mockVersionId,
        error: null
      });

      const result = await preferenceVersionService.createVersion(mockPreferences, {
        label: 'Test Version',
        reason: 'Testing version creation'
      });

      expect(mockSupabase.rpc).toHaveBeenCalledWith('create_preference_version', {
        user_uuid: mockUser.id,
        preference_data: mockPreferences,
        version_label: 'Test Version',
        version_metadata: expect.objectContaining({
          reason: 'Testing version creation',
          created_via: 'manual_update'
        })
      });

      expect(result).toBeDefined();
    });

    it('should handle creation errors gracefully', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      });

      const result = await preferenceVersionService.createVersion(mockPreferences);

      expect(result).toBeNull();
    });
  });

  describe('getCurrentVersion', () => {
    it('should return current version successfully', async () => {
      const mockCurrentVersion = {
        id: 'current-version-id',
        preferences: mockPreferences,
        label: 'Current Version',
        version_number: 5,
        created_at: '2024-01-15T10:30:00Z'
      };

      mockSupabase.rpc.mockResolvedValue({
        data: [mockCurrentVersion],
        error: null
      });

      const result = await preferenceVersionService.getCurrentVersion();

      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_current_preference_version', {
        user_uuid: mockUser.id
      });

      expect(result).toEqual({
        id: mockCurrentVersion.id,
        user_id: mockUser.id,
        created_at: mockCurrentVersion.created_at,
        preferences: mockCurrentVersion.preferences,
        label: mockCurrentVersion.label,
        version_number: mockCurrentVersion.version_number,
        is_current: true,
        metadata: {}
      });
    });

    it('should return null when no current version exists', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: [],
        error: null
      });

      const result = await preferenceVersionService.getCurrentVersion();

      expect(result).toBeNull();
    });
  });

  describe('getVersionHistory', () => {
    it('should return version history successfully', async () => {
      const mockHistory = [
        {
          id: 'version-1',
          preferences: mockPreferences,
          label: 'Version 1',
          version_number: 1,
          created_at: '2024-01-15T10:30:00Z',
          is_current: false,
          metadata: {}
        },
        {
          id: 'version-2',
          preferences: { ...mockPreferences, tone: 'formal' },
          label: 'Version 2',
          version_number: 2,
          created_at: '2024-01-15T11:30:00Z',
          is_current: true,
          metadata: {}
        }
      ];

      mockSupabase.rpc.mockResolvedValue({
        data: mockHistory,
        error: null
      });

      const result = await preferenceVersionService.getVersionHistory();

      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_preference_version_history', {
        user_uuid: mockUser.id,
        limit_count: 10
      });

      expect(result).toHaveLength(2);
      expect(result[0].version_number).toBe(2); // Should be sorted by version number desc
      expect(result[1].version_number).toBe(1);
    });

    it('should handle custom limit parameter', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: [],
        error: null
      });

      await preferenceVersionService.getVersionHistory({ limit: 5 });

      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_preference_version_history', {
        user_uuid: mockUser.id,
        limit_count: 5
      });
    });
  });

  describe('restoreVersion', () => {
    it('should restore version successfully', async () => {
      const restoredPreferences = { ...mockPreferences, tone: 'formal' };
      mockSupabase.rpc.mockResolvedValue({
        data: restoredPreferences,
        error: null
      });

      const result = await preferenceVersionService.restoreVersion('version-123');

      expect(mockSupabase.rpc).toHaveBeenCalledWith('restore_preference_version', {
        user_uuid: mockUser.id,
        version_id: 'version-123'
      });

      expect(result).toEqual(restoredPreferences);
    });

    it('should handle restoration errors', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Version not found' }
      });

      const result = await preferenceVersionService.restoreVersion('invalid-version');

      expect(result).toBeNull();
    });
  });

  describe('deleteVersion', () => {
    it('should delete version successfully', async () => {
      mockSupabase.from().delete().eq().eq.mockResolvedValue({
        error: null
      });

      const result = await preferenceVersionService.deleteVersion('version-123');

      expect(mockSupabase.from).toHaveBeenCalledWith('preference_versions');
      expect(result).toBe(true);
    });

    it('should handle deletion errors', async () => {
      mockSupabase.from().delete().eq().eq.mockResolvedValue({
        error: { message: 'Delete failed' }
      });

      const result = await preferenceVersionService.deleteVersion('version-123');

      expect(result).toBe(false);
    });
  });

  describe('updateVersionLabel', () => {
    it('should update version label successfully', async () => {
      mockSupabase.from().update().eq().eq.mockResolvedValue({
        error: null
      });

      const result = await preferenceVersionService.updateVersionLabel('version-123', 'New Label');

      expect(mockSupabase.from).toHaveBeenCalledWith('preference_versions');
      expect(result).toBe(true);
    });

    it('should handle label update errors', async () => {
      mockSupabase.from().update().eq().eq.mockResolvedValue({
        error: { message: 'Update failed' }
      });

      const result = await preferenceVersionService.updateVersionLabel('version-123', 'New Label');

      expect(result).toBe(false);
    });
  });

  describe('validation', () => {
    it('should validate required preference fields', async () => {
      const invalidPreferences = {
        tone: 'friendly' as any,
        // Missing required fields
      } as any;

      await expect(preferenceVersionService.createVersion(invalidPreferences)).rejects.toThrow();
    });

    it('should validate tone values', async () => {
      const invalidPreferences = {
        ...mockPreferences,
        tone: 'invalid-tone' as any
      } as any;

      await expect(preferenceVersionService.createVersion(invalidPreferences)).rejects.toThrow();
    });

    it('should validate language values', async () => {
      const invalidPreferences = {
        ...mockPreferences,
        language: 'invalid-language' as any
      } as any;

      await expect(preferenceVersionService.createVersion(invalidPreferences)).rejects.toThrow();
    });

    it('should validate boolean fields', async () => {
      const invalidPreferences = {
        ...mockPreferences,
        copilotEnabled: 'not-a-boolean' as any
      } as any;

      await expect(preferenceVersionService.createVersion(invalidPreferences)).rejects.toThrow();
    });
  });

  describe('getVersionStats', () => {
    it('should return version statistics', async () => {
      const mockStats = {
        totalVersions: 5,
        currentVersion: 5,
        oldestVersion: 1,
        newestVersion: 5
      };

      mockSupabase.from().select().eq().order.mockResolvedValue({
        data: [
          { version_number: 1, is_current: false },
          { version_number: 2, is_current: false },
          { version_number: 3, is_current: false },
          { version_number: 4, is_current: false },
          { version_number: 5, is_current: true }
        ],
        error: null
      });

      const result = await preferenceVersionService.getVersionStats();

      expect(result).toEqual(mockStats);
    });

    it('should handle empty version history', async () => {
      mockSupabase.from().select().eq().order.mockResolvedValue({
        data: [],
        error: null
      });

      const result = await preferenceVersionService.getVersionStats();

      expect(result).toEqual({
        totalVersions: 0,
        currentVersion: null,
        oldestVersion: null,
        newestVersion: null
      });
    });
  });
}); 