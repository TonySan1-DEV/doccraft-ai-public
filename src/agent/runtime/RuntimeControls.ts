// MCP Context Block
/*
{
  file: "RuntimeControls.ts",
  role: "runtime-developer",
  allowedActions: ["toggle", "control", "runtime"],
  tier: "Pro",
  contentSensitivity: "low",
  theme: "agent_runtime"
}
*/

import { copilotEngine } from '../../services/CopilotEngine';
import { sessionMemory } from '../../services/SessionMemory';

// Runtime state tracking
interface RuntimeState {
  copilotActive: boolean;
  memoryActive: boolean;
  lastCopilotToggle: number;
  lastMemoryToggle: number;
  debugMode: boolean;
}

// Status object for diagnostics/logging
export interface RuntimeStatus {
  copilotActive: boolean;
  memoryActive: boolean;
  updatedAt: string;
  lastCopilotToggle: string;
  lastMemoryToggle: string;
  debugMode: boolean;
}

// Global runtime state
let runtimeState: RuntimeState = {
  copilotActive: true,
  memoryActive: true,
  lastCopilotToggle: Date.now(),
  lastMemoryToggle: Date.now(),
  debugMode: false
};

// Debug logging utility
function logDebug(message: string, data?: any): void {
  if (runtimeState.debugMode) {
    console.log(`[RuntimeControls] ${message}`, data || '');
  }
}

// Telemetry logging utility
function logTelemetry(event: string, data: any): void {
  if (typeof window !== 'undefined' && (window as any).logTelemetryEvent) {
    (window as any).logTelemetryEvent(event, {
      ...data,
      timestamp: Date.now()
    });
  }
}

/**
 * Sync prompt behavior with tone and language settings
 */
export function syncPromptBehavior(tone: string, language: string): {
  header: string;
  injected: boolean;
  tone: string;
  language: string;
  reason?: string;
} {
  const validTones = ['friendly', 'formal', 'concise'];
  const validLanguages = ['en', 'es', 'fr', 'de', 'ja', 'zh', 'ko'];
  
  const validatedTone = validTones.includes(tone) ? tone : 'friendly';
  const validatedLanguage = validLanguages.includes(language) ? language : 'en';
  
  return {
    header: `/* Tone: ${validatedTone} | Language: ${validatedLanguage} */`,
    injected: true,
    tone: validatedTone,
    language: validatedLanguage
  };
}

/**
 * Toggle copilot suggestion engine modules
 * Controls SmartSuggestionsEngine, QuickRepliesGenerator, AutopilotPrompter
 */
export function toggleCopilot(enabled: boolean): RuntimeStatus {
  // Guard against redundant updates
  if (runtimeState.copilotActive === enabled) {
    logDebug(`Copilot already ${enabled ? 'enabled' : 'disabled'}, skipping redundant toggle`);
    return getRuntimeStatus();
  }

  try {
    if (enabled) {
      // Enable copilot functionality
      copilotEngine.enable();
      
      // Rehydrate suggestions immediately using current context
      // This would trigger immediate suggestion generation
      logDebug('Enabling copilot and rehydrating suggestions');
      
      // Notify UI components to show suggestion elements
      notifyUIComponents('copilot', 'show');
      
    } else {
      // Disable copilot functionality
      copilotEngine.disable();
      
      // Prevent all background suggestion calculations
      logDebug('Disabling copilot and stopping background calculations');
      
      // Notify UI components to hide suggestion elements
      notifyUIComponents('copilot', 'hide');
    }

    // Update runtime state
    runtimeState.copilotActive = enabled;
    runtimeState.lastCopilotToggle = Date.now();

    // Log telemetry
    logTelemetry('copilot_toggled', {
      enabled,
      previousState: !enabled,
      action: enabled ? 'enabled' : 'disabled'
    });

    logDebug(`Copilot ${enabled ? 'enabled' : 'disabled'} successfully`);

  } catch (error) {
    console.error('[RuntimeControls] Error toggling copilot:', error);
    logTelemetry('copilot_toggle_error', {
      enabled,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  return getRuntimeStatus();
}

/**
 * Toggle session memory modules
 * Controls SessionMemoryManager, ContextSnapshotEngine
 */
export function toggleMemory(enabled: boolean): RuntimeStatus {
  // Guard against redundant updates
  if (runtimeState.memoryActive === enabled) {
    logDebug(`Memory already ${enabled ? 'enabled' : 'disabled'}, skipping redundant toggle`);
    return getRuntimeStatus();
  }

  try {
    if (enabled) {
      // Enable memory functionality
      sessionMemory.enable();
      
      // Resume memory capture and prior context chaining
      logDebug('Enabling memory and resuming context capture');
      
      // Notify memory-dependent components
      notifyUIComponents('memory', 'show');
      
    } else {
      // Disable memory functionality
      sessionMemory.disable();
      
      // Immediately purge in-session memory state
      sessionMemory.clear();
      
      // Prevent further context accumulation
      logDebug('Disabling memory and purging session state');
      
      // Notify memory-dependent components
      notifyUIComponents('memory', 'hide');
    }

    // Update runtime state
    runtimeState.memoryActive = enabled;
    runtimeState.lastMemoryToggle = Date.now();

    // Log telemetry
    logTelemetry('memory_toggled', {
      enabled,
      previousState: !enabled,
      action: enabled ? 'enabled' : 'disabled'
    });

    logDebug(`Memory ${enabled ? 'enabled' : 'disabled'} successfully`);

  } catch (error) {
    console.error('[RuntimeControls] Error toggling memory:', error);
    logTelemetry('memory_toggle_error', {
      enabled,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  return getRuntimeStatus();
}

/**
 * Notify UI components of runtime state changes
 */
function notifyUIComponents(component: 'copilot' | 'memory', action: 'show' | 'hide'): void {
  // Dispatch custom events for UI components to listen to
  const event = new CustomEvent('runtimeStateChange', {
    detail: {
      component,
      action,
      timestamp: Date.now()
    }
  });

  if (typeof window !== 'undefined') {
    window.dispatchEvent(event);
  }

  logDebug(`Notified UI components: ${component} ${action}`);
}

/**
 * Get current runtime status for diagnostics/logging
 */
export function getRuntimeStatus(): RuntimeStatus {
  return {
    copilotActive: runtimeState.copilotActive,
    memoryActive: runtimeState.memoryActive,
    updatedAt: new Date().toISOString(),
    lastCopilotToggle: new Date(runtimeState.lastCopilotToggle).toISOString(),
    lastMemoryToggle: new Date(runtimeState.lastMemoryToggle).toISOString(),
    debugMode: runtimeState.debugMode
  };
}

/**
 * Enable debug mode for detailed logging
 */
export function enableDebugMode(): void {
  runtimeState.debugMode = true;
  logDebug('Debug mode enabled');
}

/**
 * Disable debug mode
 */
export function disableDebugMode(): void {
  runtimeState.debugMode = false;
  console.log('[RuntimeControls] Debug mode disabled');
}

/**
 * Reset runtime state to defaults
 */
export function resetRuntimeState(): void {
  runtimeState = {
    copilotActive: true,
    memoryActive: true,
    lastCopilotToggle: Date.now(),
    lastMemoryToggle: Date.now(),
    debugMode: false
  };

  // Reset engine states
  copilotEngine.enable();
  sessionMemory.enable();

  logDebug('Runtime state reset to defaults');
}

/**
 * Get detailed runtime statistics
 */
export function getRuntimeStats(): {
  copilotActive: boolean;
  memoryActive: boolean;
  copilotEngineEnabled: boolean;
  sessionMemoryEnabled: boolean;
  uptime: number;
  totalToggles: number;
} {
  return {
    copilotActive: runtimeState.copilotActive,
    memoryActive: runtimeState.memoryActive,
    copilotEngineEnabled: copilotEngine.isEnabled(),
    sessionMemoryEnabled: sessionMemory.isEnabled(),
    uptime: Date.now() - Math.min(runtimeState.lastCopilotToggle, runtimeState.lastMemoryToggle),
    totalToggles: (runtimeState.copilotActive ? 1 : 0) + (runtimeState.memoryActive ? 1 : 0)
  };
}

/**
 * Check if runtime controls are in a consistent state
 */
export function validateRuntimeState(): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Check if copilot state matches engine state
  if (runtimeState.copilotActive !== copilotEngine.isEnabled()) {
    issues.push('Copilot state mismatch between runtime and engine');
  }

  // Check if memory state matches engine state
  if (runtimeState.memoryActive !== sessionMemory.isEnabled()) {
    issues.push('Memory state mismatch between runtime and engine');
  }

  return {
    isValid: issues.length === 0,
    issues
  };
}

/**
 * Force sync runtime state with engine states
 */
export function syncRuntimeState(): void {
  const copilotEngineEnabled = copilotEngine.isEnabled();
  const sessionMemoryEnabled = sessionMemory.isEnabled();

  if (runtimeState.copilotActive !== copilotEngineEnabled) {
    logDebug(`Syncing copilot state: runtime=${runtimeState.copilotActive}, engine=${copilotEngineEnabled}`);
    runtimeState.copilotActive = copilotEngineEnabled;
  }

  if (runtimeState.memoryActive !== sessionMemoryEnabled) {
    logDebug(`Syncing memory state: runtime=${runtimeState.memoryActive}, engine=${sessionMemoryEnabled}`);
    runtimeState.memoryActive = sessionMemoryEnabled;
  }
}

// Export runtime state for external access
export { runtimeState }; 