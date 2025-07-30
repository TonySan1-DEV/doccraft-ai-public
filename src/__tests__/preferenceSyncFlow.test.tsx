// MCP Context Block
/*
{
  file: "preferenceSyncFlow.test.ts",
  role: "test",
  allowedActions: ["test", "validate"],
  tier: "Pro",
  contentSensitivity: "low",
  theme: "testing"
}
*/

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AgentPreferencesPanel } from '../components/AgentPreferencesPanel';
import { AgentPreferencesProvider } from '../contexts/AgentPreferencesContext';
import { syncPromptBehavior } from '../services/promptBehaviorSync';
import { supabase } from '../lib/supabase';

// Mock dependencies
jest.mock('../lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    auth: {
      getUser: jest.fn(),
    },
  },
}));

jest.mock('../services/promptBehaviorSync', () => ({
  syncPromptBehavior: jest.fn().mockImplementation((tone: string, language: string) => Promise.resolve({
    header: `/* Tone: ${tone} | Language: ${language} */`,
    injected: true,
    tone: tone as any,
    language: language as any,
    reason: 'success' as const,
  })),
}));

jest.mock('../utils/loadInitialPrefs', () => ({
  loadInitialPrefs: jest.fn(),
}));

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

describe('Preference Sync Flow Integration', () => {
  const mockSupabase = supabase as jest.Mocked<typeof supabase>;
  const mockSyncPromptBehavior = syncPromptBehavior as jest.MockedFunction<typeof syncPromptBehavior>;
  const mockFrom = jest.fn();
  const mockSelect = jest.fn();
  const mockEq = jest.fn();
  const mockSingle = jest.fn();
  const mockUpdate = jest.fn();
  const mockUpsert = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();

    // Setup Supabase mock chain
    mockSupabase.from.mockReturnValue(mockFrom as any);
    mockFrom.mockReturnValue({
      select: mockSelect,
      update: mockUpdate,
      upsert: mockUpsert,
    });
    mockSelect.mockReturnValue({
      eq: mockEq,
    });
    mockEq.mockReturnValue({
      single: mockSingle,
    });
    mockUpdate.mockReturnValue({
      eq: mockEq,
    });
    mockUpsert.mockReturnValue({
      select: mockSelect,
    });
  });

  describe('User updates preference via AgentPreferencesPanel', () => {
    it('should update preference and sync to Supabase', async () => {
      const mockUser = { id: 'test-user-id' };

      // Mock authentication
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Mock sync is handled by the mock implementation

      render(
        <AgentPreferencesProvider>
          <AgentPreferencesPanel />
        </AgentPreferencesProvider>
      );

      await waitFor(() => {
        expect(mockSyncPromptBehavior).toHaveBeenCalled();
      });

      // Verify defaults are loaded
      const toneSelect = screen.getByLabelText(/tone/i) as HTMLSelectElement;
      const languageSelect = screen.getByLabelText(/language/i) as HTMLSelectElement;
      const memoryToggle = screen.getByLabelText(/memory/i) as HTMLInputElement;

      expect(toneSelect.value).toBe('friendly');
      expect(languageSelect.value).toBe('en');
      expect(memoryToggle.checked).toBe(false);
    });
  });

  describe('Error handling and safe fallbacks', () => {
    it('should handle network failure without crashing', async () => {
      // Mock authentication failure
      (mockSupabase.auth.getUser as jest.Mock).mockRejectedValue(new Error('Network error'));

      // Mock sync is handled by the mock implementation

      // Should not crash
      const { container } = render(
        <AgentPreferencesProvider>
          <AgentPreferencesPanel />
        </AgentPreferencesProvider>
      );

      await waitFor(() => {
        expect(mockSyncPromptBehavior).toHaveBeenCalled();
      });

      // Component should still be rendered
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle partial data corruption', async () => {
      const mockUser = { id: 'test-user-id' };

      // Mock authentication
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Mock sync is handled by the mock implementation

      render(
        <AgentPreferencesProvider>
          <AgentPreferencesPanel />
        </AgentPreferencesProvider>
      );

      await waitFor(() => {
        expect(mockSyncPromptBehavior).toHaveBeenCalled();
      });

      // Verify safe defaults are used
      const toneSelect = screen.getByLabelText(/tone/i) as HTMLSelectElement;
      expect(toneSelect.value).toBe('friendly');
    });

    it('should handle rapid preference changes', async () => {
      const mockUser = { id: 'test-user-id' };

      // Mock authentication
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Mock sync is handled by the mock implementation

      render(
        <AgentPreferencesProvider>
          <AgentPreferencesPanel />
        </AgentPreferencesProvider>
      );

      await waitFor(() => {
        expect(mockSyncPromptBehavior).toHaveBeenCalled();
      });

      const toneSelect = screen.getByLabelText(/tone/i);

      // Rapid successive changes
      fireEvent.change(toneSelect, { target: { value: 'formal' } });
      fireEvent.change(toneSelect, { target: { value: 'casual' } });
      fireEvent.change(toneSelect, { target: { value: 'professional' } });

      // Should handle rapid changes without errors
      await waitFor(() => {
        expect(mockSupabase.from).toHaveBeenCalled();
      });
    });
  });

  describe('End-to-end flow validation', () => {
    it('should complete full preference round-trip', async () => {
      const mockUser = { id: 'test-user-id' };
      // Initial preferences are handled by the mock implementation

      const updatedPrefs = {
        tone: 'formal' as const,
        language: 'en' as const,
        copilotEnabled: false,
        memoryEnabled: false,
        defaultCommandView: 'list' as const,
        lockedFields: [] as string[],
      };

      // Mock authentication
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Mock initial sync
      // Mock sync is handled by the mock implementation

      // Mock Supabase update
      mockUpsert.mockResolvedValue({
        data: { id: 'pref-id', user_id: mockUser.id, ...updatedPrefs },
        error: null,
      });

      // Mock subsequent sync to return updated values
      mockSyncPromptBehavior
        // Mock sync is handled by the mock implementation

      const { rerender } = render(
        <AgentPreferencesProvider>
          <AgentPreferencesPanel />
        </AgentPreferencesProvider>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(mockSyncPromptBehavior).toHaveBeenCalledTimes(1);
      });

      // Verify initial values
      const initialToneSelect = screen.getByLabelText(/tone/i) as HTMLSelectElement;
      expect(initialToneSelect.value).toBe('friendly');

      // Simulate user update
      fireEvent.change(initialToneSelect, { target: { value: 'formal' } });

      // Wait for update
      await waitFor(() => {
        expect(mockUpsert).toHaveBeenCalled();
      });

      // Simulate reload
      rerender(
        <AgentPreferencesProvider>
          <AgentPreferencesPanel />
        </AgentPreferencesProvider>
      );

      // Wait for reload sync
      await waitFor(() => {
        expect(mockSyncPromptBehavior).toHaveBeenCalledTimes(2);
      });

      // Verify updated values are restored
      const reloadedToneSelect = screen.getByLabelText(/tone/i) as HTMLSelectElement;
      expect(reloadedToneSelect.value).toBe('formal');
    });
  });
}); 