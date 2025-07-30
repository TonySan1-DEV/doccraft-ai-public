/**
 * @jest-environment node
 */

import { loadInitialPrefs } from '../../../utils/loadInitialPrefs';
import { AgentPrefs, AgentDefaultPolicy } from '../../../types/agentPreferences';

// Mock dependencies
jest.mock('../../../utils/loadInitialPrefs');
jest.mock('../../../lib/supabase');

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn()
};
Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock Supabase
const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn().mockReturnThis(),
  auth: {
    getUser: jest.fn()
  }
};

jest.mock('../../../lib/supabase', () => ({
  supabase: mockSupabase
}));

// Mock functions
const mockFetchPreferencesFromSupabase = jest.fn();
const mockGetDefaultPolicy = jest.fn();

// Test data
const validSupabasePrefs: AgentPrefs = {
  tone: 'friendly',
  language: 'en',
  copilotEnabled: true,
  memoryEnabled: true,
  defaultCommandView: 'list',
  lockedFields: []
};

const validLocalStoragePrefs: AgentPrefs = {
  tone: 'formal',
  language: 'es',
  copilotEnabled: false,
  memoryEnabled: false,
  defaultCommandView: 'grid',
  lockedFields: ['copilotEnabled']
};

const validAdminPolicy: AgentDefaultPolicy = {
  defaultTone: 'friendly',
  defaultLanguage: 'en',
  defaultCopilotEnabled: false,
  defaultMemoryEnabled: false,
  defaultCommandView: 'list',
  lockedFields: ['copilotEnabled', 'memoryEnabled'],
  policyReason: 'Test admin policy'
};

const staticDefaults: AgentPrefs = {
  tone: 'friendly',
  language: 'en',
  copilotEnabled: true,
  memoryEnabled: true,
  defaultCommandView: 'list',
  lockedFields: []
};

describe('loadInitialPrefs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'test-user' } } });
  });

  describe('preference loading hierarchy', () => {
    it('should prioritize Supabase data when available', async () => {
      // Mock Supabase to return valid preferences
      mockFetchPreferencesFromSupabase.mockResolvedValue(validSupabasePrefs);
      
      // Mock admin policy (should be ignored)
      mockGetDefaultPolicy.mockReturnValue(validAdminPolicy);

      const result = await loadInitialPrefs();

      expect(result).toEqual(validSupabasePrefs);
      expect(mockFetchPreferencesFromSupabase).toHaveBeenCalled();
      expect(mockLocalStorage.getItem).not.toHaveBeenCalled(); // Should not check localStorage when Supabase has data
      expect(mockGetDefaultPolicy).not.toHaveBeenCalled(); // Should not check admin policy when Supabase has data
    });

    it('should fallback to LocalStorage when Supabase returns null', async () => {
      // Mock Supabase to return null
      mockFetchPreferencesFromSupabase.mockResolvedValue(null);
      
      // Mock localStorage to return valid preferences
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(validLocalStoragePrefs));
      
      // Mock admin policy (should be ignored)
      mockGetDefaultPolicy.mockReturnValue(validAdminPolicy);

      const result = await loadInitialPrefs();

      expect(result).toEqual(validLocalStoragePrefs);
      expect(mockFetchPreferencesFromSupabase).toHaveBeenCalled();
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('agentPreferences');
      expect(mockGetDefaultPolicy).not.toHaveBeenCalled(); // Should not check admin policy when localStorage has data
    });

    it('should fallback to admin policy when no Supabase or LocalStorage data', async () => {
      // Mock Supabase to return null
      mockFetchPreferencesFromSupabase.mockResolvedValue(null);
      
      // Mock localStorage to return null
      mockLocalStorage.getItem.mockReturnValue(null);
      
      // Mock admin policy to return valid preferences
      mockGetDefaultPolicy.mockReturnValue(validAdminPolicy);

      const result = await loadInitialPrefs();

      expect(result).toEqual(validAdminPolicy);
      expect(mockFetchPreferencesFromSupabase).toHaveBeenCalled();
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('agentPreferences');
      expect(mockGetDefaultPolicy).toHaveBeenCalled(); // Should check admin policy when no other data
    });

    it('should use static defaults when no data available anywhere', async () => {
      // Mock Supabase to return null
      mockFetchPreferencesFromSupabase.mockResolvedValue(null);
      
      // Mock localStorage to return null
      mockLocalStorage.getItem.mockReturnValue(null);
      
      // Mock admin policy to return null
      mockGetDefaultPolicy.mockReturnValue(null as any);

      const result = await loadInitialPrefs();

      expect(result).toEqual(staticDefaults);
      expect(mockFetchPreferencesFromSupabase).toHaveBeenCalled();
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('agentPreferences');
      expect(mockGetDefaultPolicy).toHaveBeenCalled();
    });
  });

  describe('secure merging and validation', () => {
    it('should merge partial Supabase data with admin policy defaults', async () => {
      // Mock Supabase to return partial data
      const partialSupabasePrefs = {
        tone: 'formal',
        language: 'es'
        // Missing other fields
      };
      mockFetchPreferencesFromSupabase.mockResolvedValue(partialSupabasePrefs as any);
      
      // Mock admin policy for missing fields
      mockGetDefaultPolicy.mockReturnValue(validAdminPolicy);

      const result = await loadInitialPrefs();

      expect(result).toEqual({
        tone: 'formal', // From Supabase
        language: 'es', // From Supabase
        copilotEnabled: false, // From admin policy
        memoryEnabled: false, // From admin policy
        defaultCommandView: 'list', // From admin policy
        lockedFields: ['copilotEnabled', 'memoryEnabled'] // From admin policy
      });
    });

    it('should merge partial LocalStorage data with admin policy defaults', async () => {
      // Mock Supabase to return null
      mockFetchPreferencesFromSupabase.mockResolvedValue(null);
      
      // Mock localStorage to return partial data
      const partialLocalStoragePrefs = {
        tone: 'concise',
        copilotEnabled: true
        // Missing other fields
      };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(partialLocalStoragePrefs));
      
      // Mock admin policy for missing fields
      mockGetDefaultPolicy.mockReturnValue(validAdminPolicy);

      const result = await loadInitialPrefs();

      expect(result).toEqual({
        tone: 'concise', // From localStorage
        language: 'en', // From admin policy
        copilotEnabled: true, // From localStorage
        memoryEnabled: false, // From admin policy
        defaultCommandView: 'list', // From admin policy
        lockedFields: ['copilotEnabled', 'memoryEnabled'] // From admin policy
      });
    });
  });

  describe('error handling', () => {
    it('should handle Supabase errors gracefully', async () => {
      mockFetchPreferencesFromSupabase.mockRejectedValue(new Error('Network error'));

      const result = await loadInitialPrefs();

      expect(result).toEqual(staticDefaults);
    });

    it('should handle localStorage errors gracefully', async () => {
      mockFetchPreferencesFromSupabase.mockResolvedValue(null);
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      const result = await loadInitialPrefs();

      expect(result).toEqual(staticDefaults);
    });

    it('should handle invalid JSON in localStorage', async () => {
      mockFetchPreferencesFromSupabase.mockResolvedValue(null);
      mockLocalStorage.getItem.mockReturnValue('invalid json');

      const result = await loadInitialPrefs();

      expect(result).toEqual(staticDefaults);
    });

    it('should handle admin policy errors gracefully', async () => {
      mockFetchPreferencesFromSupabase.mockResolvedValue(null);
      mockLocalStorage.getItem.mockReturnValue(null);
      mockGetDefaultPolicy.mockRejectedValue(new Error('Admin policy error'));

      const result = await loadInitialPrefs();

      expect(result).toEqual(staticDefaults);
    });
  });

  describe('validation', () => {
    it('should validate Supabase data before using', async () => {
      const invalidSupabasePrefs = {
        tone: 'invalid-tone',
        language: 'invalid-language'
      };
      mockFetchPreferencesFromSupabase.mockResolvedValue(invalidSupabasePrefs as any);

      const result = await loadInitialPrefs();

      expect(result).toEqual(staticDefaults);
    });

    it('should validate localStorage data before using', async () => {
      mockFetchPreferencesFromSupabase.mockResolvedValue(null);
      const invalidLocalStoragePrefs = {
        tone: 'invalid-tone',
        language: 'invalid-language'
      };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(invalidLocalStoragePrefs));

      const result = await loadInitialPrefs();

      expect(result).toEqual(staticDefaults);
    });
  });

  describe('performance', () => {
    it('should cache results appropriately', async () => {
      mockFetchPreferencesFromSupabase.mockResolvedValue(validSupabasePrefs);

      const result1 = await loadInitialPrefs();
      const result2 = await loadInitialPrefs();

      expect(result1).toEqual(result2);
      expect(mockFetchPreferencesFromSupabase).toHaveBeenCalledTimes(1); // Should be cached
    });

    it('should handle concurrent calls', async () => {
      mockFetchPreferencesFromSupabase.mockResolvedValue(validSupabasePrefs);

      const promises = [
        loadInitialPrefs(),
        loadInitialPrefs(),
        loadInitialPrefs()
      ];

      const results = await Promise.all(promises);

      expect(results[0]).toEqual(results[1]);
      expect(results[1]).toEqual(results[2]);
    });
  });
}); 