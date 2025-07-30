// MCP Context Block
/*
{
  file: "AgentBehaviorBridge.test.ts",
  role: "qa-engineer",
  allowedActions: ["test", "validate", "bridge"],
  tier: "Pro",
  contentSensitivity: "low",
  theme: "agent_testing"
}
*/

import { 
  initializeAgentBehaviorBridge, 
  AgentPrefs,

  AgentBridgeController 
} from '../AgentBehaviorBridge';

describe('AgentBehaviorBridge', () => {
  let bridge: AgentBridgeController;
  let onSyncPrompt: jest.MockedFunction<(tone: string, language: string) => void>;
  let onToggleCopilot: jest.MockedFunction<(enabled: boolean) => void>;
  let onToggleMemory: jest.MockedFunction<(enabled: boolean) => void>;
  
  const basePrefs: AgentPrefs = {
    tone: "friendly",
    language: "en",
    copilotEnabled: true,
    memoryEnabled: true,
    defaultCommandView: "list"
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create mocked sync handlers
    onSyncPrompt = jest.fn();
    onToggleCopilot = jest.fn();
    onToggleMemory = jest.fn();
  });

  describe('Bridge initialization and sync', () => {
    it('should call onSyncPrompt when tone or language changes', () => {
      // Initialize bridge
      bridge = initializeAgentBehaviorBridge(basePrefs, {
        onSyncPrompt,
        onToggleCopilot,
        onToggleMemory,
        debug: false
      });

      // Clear initial sync calls
      jest.clearAllMocks();

      // Test tone change
      bridge.update({ ...basePrefs, tone: 'formal' });
      expect(onSyncPrompt).toHaveBeenCalledWith('formal', 'en');
      expect(onToggleCopilot).not.toHaveBeenCalled();
      expect(onToggleMemory).not.toHaveBeenCalled();

      // Test language change
      jest.clearAllMocks();
      bridge.update({ ...basePrefs, language: 'es' });
      expect(onSyncPrompt).toHaveBeenCalledWith('friendly', 'es');
      expect(onToggleCopilot).not.toHaveBeenCalled();
      expect(onToggleMemory).not.toHaveBeenCalled();

      // Test both changes
      jest.clearAllMocks();
      bridge.update({ ...basePrefs, tone: 'concise', language: 'fr' });
      expect(onSyncPrompt).toHaveBeenCalledWith('concise', 'fr');
    });

    it('should call onToggleCopilot when copilotEnabled changes', () => {
      bridge = initializeAgentBehaviorBridge(basePrefs, {
        onSyncPrompt,
        onToggleCopilot,
        onToggleMemory,
        debug: false
      });

      jest.clearAllMocks();

      // Test copilot disable
      bridge.update({ ...basePrefs, copilotEnabled: false });
      expect(onToggleCopilot).toHaveBeenCalledWith(false);
      expect(onSyncPrompt).not.toHaveBeenCalled();
      expect(onToggleMemory).not.toHaveBeenCalled();

      // Test copilot enable
      jest.clearAllMocks();
      bridge.update({ ...basePrefs, copilotEnabled: true });
      expect(onToggleCopilot).toHaveBeenCalledWith(true);
    });

    it('should call onToggleMemory when memoryEnabled changes', () => {
      bridge = initializeAgentBehaviorBridge(basePrefs, {
        onSyncPrompt,
        onToggleCopilot,
        onToggleMemory,
        debug: false
      });

      jest.clearAllMocks();

      // Test memory disable
      bridge.update({ ...basePrefs, memoryEnabled: false });
      expect(onToggleMemory).toHaveBeenCalledWith(false);
      expect(onSyncPrompt).not.toHaveBeenCalled();
      expect(onToggleCopilot).not.toHaveBeenCalled();

      // Test memory enable
      jest.clearAllMocks();
      bridge.update({ ...basePrefs, memoryEnabled: true });
      expect(onToggleMemory).toHaveBeenCalledWith(true);
    });

    it('should not call anything when preferences are unchanged', () => {
      bridge = initializeAgentBehaviorBridge(basePrefs, {
        onSyncPrompt,
        onToggleCopilot,
        onToggleMemory,
        debug: false
      });

      jest.clearAllMocks();

      // Call update with identical preferences
      bridge.update(basePrefs);

      expect(onSyncPrompt).not.toHaveBeenCalled();
      expect(onToggleCopilot).not.toHaveBeenCalled();
      expect(onToggleMemory).not.toHaveBeenCalled();
    });
  });

  describe('Debug logging', () => {
    it('should log correct debug messages when debug is enabled', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      bridge = initializeAgentBehaviorBridge(basePrefs, {
        onSyncPrompt,
        onToggleCopilot,
        onToggleMemory,
        debug: true
      });

      jest.clearAllMocks();

      // Test tone change debug logging
      bridge.update({ ...basePrefs, tone: 'formal' });
      expect(consoleSpy).toHaveBeenCalledWith(
        '[AgentBridge] tone changed: friendly → formal'
      );

      // Test language change debug logging
      jest.clearAllMocks();
      bridge.update({ ...basePrefs, language: 'es' });
      expect(consoleSpy).toHaveBeenCalledWith(
        '[AgentBridge] language changed: en → es'
      );

      // Test copilot change debug logging
      jest.clearAllMocks();
      bridge.update({ ...basePrefs, copilotEnabled: false });
      expect(consoleSpy).toHaveBeenCalledWith(
        '[AgentBridge] copilotEnabled changed: true → false'
      );

      // Test memory change debug logging
      jest.clearAllMocks();
      bridge.update({ ...basePrefs, memoryEnabled: false });
      expect(consoleSpy).toHaveBeenCalledWith(
        '[AgentBridge] memoryEnabled changed: true → false'
      );

      consoleSpy.mockRestore();
    });

    it('should not log debug messages when debug is disabled', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      bridge = initializeAgentBehaviorBridge(basePrefs, {
        onSyncPrompt,
        onToggleCopilot,
        onToggleMemory,
        debug: false
      });

      jest.clearAllMocks();

      bridge.update({ ...basePrefs, tone: 'formal' });
      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('[AgentBridge]')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Sync statistics', () => {
    it('should return correct sync state via getSyncStats', () => {
      bridge = initializeAgentBehaviorBridge(basePrefs, {
        onSyncPrompt,
        onToggleCopilot,
        onToggleMemory,
        debug: false
      });

      // Get initial stats
      const initialStats = bridge.getSyncStats();
      expect(initialStats.totalUpdates).toBe(1); // Initial sync
      expect(initialStats.lastUpdate).toBeGreaterThan(0);

      // Make some changes
      bridge.update({ ...basePrefs, tone: 'formal' });
      bridge.update({ ...basePrefs, copilotEnabled: false });

      // Get updated stats
      const updatedStats = bridge.getSyncStats();
      expect(updatedStats.totalUpdates).toBe(3); // Initial + 2 updates
      expect(updatedStats.lastToneChange).toEqual({
        from: 'friendly',
        to: 'formal',
        timestamp: expect.any(Number)
      });
      expect(updatedStats.lastCopilotToggle).toEqual({
        enabled: false,
        timestamp: expect.any(Number)
      });
    });
  });

  describe('Bridge lifecycle', () => {
    it('should dispose and prevent further updates', () => {
      bridge = initializeAgentBehaviorBridge(basePrefs, {
        onSyncPrompt,
        onToggleCopilot,
        onToggleMemory,
        debug: false
      });

      jest.clearAllMocks();

      // Dispose the bridge
      bridge.dispose();

      // Attempt to update after disposal
      bridge.update({ ...basePrefs, tone: 'formal' });

      // Should not trigger any callbacks
      expect(onSyncPrompt).not.toHaveBeenCalled();
      expect(onToggleCopilot).not.toHaveBeenCalled();
      expect(onToggleMemory).not.toHaveBeenCalled();
    });

    it('should return null for last preferences after disposal', () => {
      bridge = initializeAgentBehaviorBridge(basePrefs, {
        onSyncPrompt,
        onToggleCopilot,
        onToggleMemory,
        debug: false
      });

      // Verify last preferences before disposal
      expect(bridge.getLastPrefs()).toEqual(basePrefs);

      // Dispose and verify
      bridge.dispose();
      expect(bridge.getLastPrefs()).toBeNull();
    });
  });

  describe('Error handling', () => {
    it('should handle invalid or partial preferences without crashing', () => {
      bridge = initializeAgentBehaviorBridge(basePrefs, {
        onSyncPrompt,
        onToggleCopilot,
        onToggleMemory,
        debug: false
      });

      jest.clearAllMocks();

      // Test null preferences
      expect(() => {
        bridge.update(null as any);
      }).not.toThrow();

      // Test undefined preferences
      expect(() => {
        bridge.update(undefined as any);
      }).not.toThrow();

      // Test partial preferences
      expect(() => {
        bridge.update({ tone: 'formal' } as any);
      }).not.toThrow();

      // Test malformed preferences
      expect(() => {
        bridge.update({
          tone: 'invalid-tone',
          language: 'invalid-lang',
          copilotEnabled: 'not-a-boolean',
          memoryEnabled: 'not-a-boolean'
        } as any);
      }).not.toThrow();

      // Verify no callbacks were triggered for invalid inputs
      expect(onSyncPrompt).not.toHaveBeenCalled();
      expect(onToggleCopilot).not.toHaveBeenCalled();
      expect(onToggleMemory).not.toHaveBeenCalled();
    });

    it('should handle callback errors gracefully', () => {
      // Create a callback that throws an error
      const errorCallback = jest.fn().mockImplementation(() => {
        throw new Error('Callback error');
      });

      bridge = initializeAgentBehaviorBridge(basePrefs, {
        onSyncPrompt: errorCallback,
        onToggleCopilot,
        onToggleMemory,
        debug: false
      });

      jest.clearAllMocks();

      // Should not crash when callback throws
      expect(() => {
        bridge.update({ ...basePrefs, tone: 'formal' });
      }).not.toThrow();
    });
  });

  describe('Multiple preference changes', () => {
    it('should handle multiple simultaneous preference changes', () => {
      bridge = initializeAgentBehaviorBridge(basePrefs, {
        onSyncPrompt,
        onToggleCopilot,
        onToggleMemory,
        debug: false
      });

      jest.clearAllMocks();

      // Update multiple preferences at once
      bridge.update({
        ...basePrefs,
        tone: 'formal' as const,
        language: 'es' as const,
        copilotEnabled: false,
        memoryEnabled: false
      });

      // Should call all relevant callbacks
      expect(onSyncPrompt).toHaveBeenCalledWith('formal', 'es');
      expect(onToggleCopilot).toHaveBeenCalledWith(false);
      expect(onToggleMemory).toHaveBeenCalledWith(false);
    });
  });

  describe('Bridge state validation', () => {
    it('should maintain consistent state across updates', () => {
      bridge = initializeAgentBehaviorBridge(basePrefs, {
        onSyncPrompt,
        onToggleCopilot,
        onToggleMemory,
        debug: false
      });

      // Verify initial state
      expect(bridge.getLastPrefs()).toEqual(basePrefs);

      // Update and verify state
      const newPrefs = { ...basePrefs, tone: 'formal' as const };
      bridge.update(newPrefs);
      expect(bridge.getLastPrefs()).toEqual(newPrefs);

      // Update again and verify
      const newerPrefs = { ...newPrefs, language: 'es' as const };
      bridge.update(newerPrefs);
      expect(bridge.getLastPrefs()).toEqual(newerPrefs);
    });
  });
}); 