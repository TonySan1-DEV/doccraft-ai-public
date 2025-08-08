// MCP Context Block
/*
{
  file: "AgentBehaviorBridge.ts",
  role: "runtime-developer",
  allowedActions: ["bridge", "sync", "behavior"],
  tier: "Pro",
  contentSensitivity: "low",
  theme: "agent_runtime"
}
*/



// Import the main AgentPrefs interface from shared types
import { AgentPrefs } from '../../types/agentPreferences';

// Interface definitions

export interface BridgeOptions {
  onSyncPrompt?: (tone: string, language: string) => void;
  onToggleCopilot?: (enabled: boolean) => void;
  onToggleMemory?: (enabled: boolean) => void;
  debug?: boolean;
}

export interface AgentBridgeController {
  update(prefs: AgentPrefs): void;
  dispose(): void;
  getLastPrefs(): AgentPrefs | null;
  getSyncStats(): BridgeSyncStats;
}

export interface BridgeSyncStats {
  totalUpdates: number;
  lastUpdate: number;
  lastToneChange?: { from: string; to: string; timestamp: number };
  lastLanguageChange?: { from: string; to: string; timestamp: number };
  lastCopilotToggle?: { enabled: boolean; timestamp: number };
  lastMemoryToggle?: { enabled: boolean; timestamp: number };
}

export interface PreferenceChangeEvent {
  field: keyof AgentPrefs;
  previousValue: any;
  newValue: any;
  timestamp: number;
}

class AgentBehaviorBridge implements AgentBridgeController {
  private lastPrefs: AgentPrefs | null = null;
  private options: BridgeOptions;
  private syncStats: BridgeSyncStats;
  private isDisposed: boolean = false;

  constructor(options: BridgeOptions = {}) {
    this.options = {
      debug: false,
      ...options
    };

    this.syncStats = {
      totalUpdates: 0,
      lastUpdate: 0
    };

    if (this.options.debug) {
      console.log('[AgentBridge] Initialized with options:', this.options);
    }
  }

  // Update bridge with new preferences
  update(prefs: AgentPrefs): void {
    if (this.isDisposed) {
      console.warn('[AgentBridge] Bridge is disposed, ignoring update');
      return;
    }

    if (!prefs) {
      console.warn('[AgentBridge] Invalid preferences provided');
      return;
    }

    // Store previous preferences for diffing
    const previousPrefs = this.lastPrefs;
    this.lastPrefs = { ...prefs };
    this.syncStats.totalUpdates++;
    this.syncStats.lastUpdate = Date.now();

    if (this.options.debug) {
      console.log('[AgentBridge] Processing preference update:', prefs);
    }

    // If this is the first update, sync all preferences
    if (!previousPrefs) {
      this.syncAllPreferences(prefs);
      return;
    }

    // Detect and handle individual preference changes
    this.detectAndHandleChanges(previousPrefs, prefs);
  }

  // Sync all preferences to subsystems
  private syncAllPreferences(prefs: AgentPrefs): void {
    if (this.options.debug) {
      console.log('[AgentBridge] Performing initial sync of all preferences');
    }

    // Sync prompt behavior
    this.syncPromptBehavior(prefs.tone, prefs.language);

    // Sync copilot
    this.toggleCopilot(prefs.copilotEnabled);

    // Sync memory
    this.toggleMemory(prefs.memoryEnabled);

    if (this.options.debug) {
      console.log('[AgentBridge] Initial sync completed');
    }
  }

  // Detect and handle individual preference changes
  private detectAndHandleChanges(previousPrefs: AgentPrefs, newPrefs: AgentPrefs): void {
    const changes: PreferenceChangeEvent[] = [];

    // Check tone changes
    if (previousPrefs.tone !== newPrefs.tone) {
      changes.push({
        field: 'tone',
        previousValue: previousPrefs.tone,
        newValue: newPrefs.tone,
        timestamp: Date.now()
      });
      this.syncPromptBehavior(newPrefs.tone, newPrefs.language);
    }

    // Check language changes
    if (previousPrefs.language !== newPrefs.language) {
      changes.push({
        field: 'language',
        previousValue: previousPrefs.language,
        newValue: newPrefs.language,
        timestamp: Date.now()
      });
      this.syncPromptBehavior(newPrefs.tone, newPrefs.language);
    }

    // Check copilot changes
    if (previousPrefs.copilotEnabled !== newPrefs.copilotEnabled) {
      changes.push({
        field: 'copilotEnabled',
        previousValue: previousPrefs.copilotEnabled,
        newValue: newPrefs.copilotEnabled,
        timestamp: Date.now()
      });
      this.toggleCopilot(newPrefs.copilotEnabled);
    }

    // Check memory changes
    if (previousPrefs.memoryEnabled !== newPrefs.memoryEnabled) {
      changes.push({
        field: 'memoryEnabled',
        previousValue: previousPrefs.memoryEnabled,
        newValue: newPrefs.memoryEnabled,
        timestamp: Date.now()
      });
      this.toggleMemory(newPrefs.memoryEnabled);
    }

    // Log changes in debug mode
    if (this.options.debug && changes.length > 0) {
      changes.forEach(change => {
        console.log(`[AgentBridge] ${change.field} changed: ${change.previousValue} → ${change.newValue}`);
      });
    }

    // Update sync statistics
    this.updateSyncStats(changes);
  }

  // Sync prompt behavior (tone and language)
  private syncPromptBehavior(tone: string, language: string): void {
    if (this.options.debug) {
      console.log(`[AgentBridge] Syncing prompt behavior: tone=${tone}, language=${language}`);
    }

    this.syncStats.lastToneChange = {
      from: this.lastPrefs?.tone || 'unknown',
      to: tone,
      timestamp: Date.now()
    };

    this.syncStats.lastLanguageChange = {
      from: this.lastPrefs?.language || 'unknown',
      to: language,
      timestamp: Date.now()
    };

    // Call the prompt sync callback
    if (this.options.onSyncPrompt) {
      try {
        this.options.onSyncPrompt(tone, language);
      } catch (error) {
        console.error('[AgentBridge] Error in onSyncPrompt callback:', error);
      }
    }
  }

  // Toggle copilot suggestions
  private toggleCopilot(enabled: boolean): void {
    if (this.options.debug) {
      console.log(`[AgentBridge] Toggling copilot: ${enabled ? 'enabled' : 'disabled'}`);
    }

    this.syncStats.lastCopilotToggle = {
      enabled,
      timestamp: Date.now()
    };

    // Call the copilot toggle callback
    if (this.options.onToggleCopilot) {
      try {
        this.options.onToggleCopilot(enabled);
      } catch (error) {
        console.error('[AgentBridge] Error in onToggleCopilot callback:', error);
      }
    }
  }

  // Toggle session memory
  private toggleMemory(enabled: boolean): void {
    if (this.options.debug) {
      console.log(`[AgentBridge] Toggling memory: ${enabled ? 'enabled' : 'disabled'}`);
    }

    this.syncStats.lastMemoryToggle = {
      enabled,
      timestamp: Date.now()
    };

    // Call the memory toggle callback
    if (this.options.onToggleMemory) {
      try {
        this.options.onToggleMemory(enabled);
      } catch (error) {
        console.error('[AgentBridge] Error in onToggleMemory callback:', error);
      }
    }
  }

  // Update sync statistics
  private updateSyncStats(changes: PreferenceChangeEvent[]): void {
    changes.forEach(change => {
      switch (change.field) {
        case 'tone':
          this.syncStats.lastToneChange = {
            from: change.previousValue,
            to: change.newValue,
            timestamp: change.timestamp
          };
          break;
        case 'language':
          this.syncStats.lastLanguageChange = {
            from: change.previousValue,
            to: change.newValue,
            timestamp: change.timestamp
          };
          break;
        case 'copilotEnabled':
          this.syncStats.lastCopilotToggle = {
            enabled: change.newValue,
            timestamp: change.timestamp
          };
          break;
        case 'memoryEnabled':
          this.syncStats.lastMemoryToggle = {
            enabled: change.newValue,
            timestamp: change.timestamp
          };
          break;
      }
    });
  }

  // Get last preferences
  getLastPrefs(): AgentPrefs | null {
    return this.lastPrefs ? { ...this.lastPrefs } : null;
  }

  // Get sync statistics
  getSyncStats(): BridgeSyncStats {
    return { ...this.syncStats };
  }

  // Dispose the bridge
  dispose(): void {
    if (this.isDisposed) {
      return;
    }

    if (this.options.debug) {
      console.log('[AgentBridge] Disposing bridge');
    }

    this.isDisposed = true;
    this.lastPrefs = null;
    this.syncStats = {
      totalUpdates: 0,
      lastUpdate: 0
    };
  }

  // Check if bridge is disposed
  isDisposedBridge(): boolean {
    return this.isDisposed;
  }

  // Get bridge state for debugging
  getBridgeState(): {
    isDisposed: boolean;
    hasLastPrefs: boolean;
    totalUpdates: number;
    lastUpdate: number;
  } {
    return {
      isDisposed: this.isDisposed,
      hasLastPrefs: this.lastPrefs !== null,
      totalUpdates: this.syncStats.totalUpdates,
      lastUpdate: this.syncStats.lastUpdate
    };
  }
}

// Factory function to create bridge controller
export function initializeAgentBehaviorBridge(
  preferences: AgentPrefs,
  options: BridgeOptions = {}
): AgentBridgeController {
  const bridge = new AgentBehaviorBridge(options);
  
  // Perform initial sync
  bridge.update(preferences);
  
  return bridge;
}

// Utility function to create bridge with default options
export function createDefaultBridge(preferences: AgentPrefs): AgentBridgeController {
  return initializeAgentBehaviorBridge(preferences, {
    debug: process.env.NODE_ENV === 'development'
  });
}

// Export the bridge class for testing
export { AgentBehaviorBridge }; 