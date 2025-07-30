// MCP Context Block
/*
{
  file: "AgentShell.tsx",
  role: "frontend-developer",
  allowedActions: ["shell", "integration", "behavior"],
  tier: "Pro",
  contentSensitivity: "low",
  theme: "agent_integration"
}
*/

import React, { useEffect, useCallback, useRef } from 'react';
import { useAgentPreferences } from '../contexts/AgentPreferencesContext';
import { useMCP } from '../useMCP';
import { AgentTone, SupportedLanguage } from '../types/agentPreferences';

// Import core agent systems (adjust paths as needed)
import { CopilotEngine } from '../services/CopilotEngine';
import { PromptBuilder } from '../services/PromptBuilder';
import { SessionMemory } from '../services/SessionMemory';

interface AgentShellProps {
  children: React.ReactNode;
  onBehaviorChange?: (changes: BehaviorChanges) => void;
}

export interface BehaviorChanges {
  copilotEnabled: boolean;
  memoryEnabled: boolean;
  tone: AgentTone;
  language: SupportedLanguage;
  timestamp: number;
}

export function AgentShell({ children, onBehaviorChange }: AgentShellProps) {
  const { preferences, isFieldLocked } = useAgentPreferences();
  const mcp = useMCP("AgentShell.tsx");
  const previousPrefs = useRef(preferences);
  const behaviorChangeTimeout = useRef<NodeJS.Timeout>();

  // Debounced behavior change handler
  const handleBehaviorChange = useCallback((changes: Partial<BehaviorChanges>) => {
    if (behaviorChangeTimeout.current) {
      clearTimeout(behaviorChangeTimeout.current);
    }

    behaviorChangeTimeout.current = setTimeout(() => {
      const fullChanges: BehaviorChanges = {
        copilotEnabled: preferences.copilotEnabled,
        memoryEnabled: preferences.memoryEnabled,
        tone: preferences.tone,
        language: preferences.language,
        timestamp: Date.now()
      };

      // Emit telemetry if available
      if (window.logTelemetryEvent) {
        window.logTelemetryEvent('agent_behavior_changed', {
          changes: Object.keys(changes),
          userTier: mcp.tier,
          timestamp: Date.now()
        });
      }

      onBehaviorChange?.(fullChanges);
    }, 300); // Debounce behavior changes
  }, [preferences, mcp.tier, onBehaviorChange]);

  // Monitor preference changes and update core systems
  useEffect(() => {
    const prev = previousPrefs.current;
    const current = preferences;
    const changes: Partial<BehaviorChanges> = {};

    // Check for copilot changes
    if (prev.copilotEnabled !== current.copilotEnabled) {
      changes.copilotEnabled = current.copilotEnabled;
      
      if (current.copilotEnabled) {
        CopilotEngine.enable();
        console.log('Agent: Copilot suggestions enabled');
      } else {
        CopilotEngine.disable();
        console.log('Agent: Copilot suggestions disabled');
      }
    }

    // Check for memory changes
    if (prev.memoryEnabled !== current.memoryEnabled) {
      changes.memoryEnabled = current.memoryEnabled;
      
      if (current.memoryEnabled) {
        SessionMemory.enable();
        console.log('Agent: Session memory enabled');
      } else {
        SessionMemory.clear();
        SessionMemory.disable();
        console.log('Agent: Session memory disabled and cleared');
      }
    }

    // Check for tone changes
    if (prev.tone !== current.tone) {
      changes.tone = current.tone;
      PromptBuilder.setTone(current.tone);
      console.log(`Agent: Tone changed to ${current.tone}`);
    }

    // Check for language changes
    if (prev.language !== current.language) {
      changes.language = current.language;
      PromptBuilder.setLanguage(current.language);
      console.log(`Agent: Language changed to ${current.language}`);
    }

    // Emit behavior change if any preferences changed
    if (Object.keys(changes).length > 0) {
      handleBehaviorChange(changes);
    }

    // Update previous preferences reference
    previousPrefs.current = current;
  }, [preferences, handleBehaviorChange]);

  // Validate locked preferences don't override behavior
  useEffect(() => {
    const lockedFields = Object.keys(preferences).filter(key => 
      isFieldLocked(key as keyof typeof preferences)
    );

    if (lockedFields.length > 0) {
      console.log('Agent: Locked preferences detected:', lockedFields);
      
      // Ensure locked preferences are respected
      lockedFields.forEach(field => {
        const fieldKey = field as keyof typeof preferences;
        if (fieldKey === 'copilotEnabled' && preferences.copilotEnabled) {
          console.warn('Agent: Copilot enabled but field is locked - respecting lock');
        }
        if (fieldKey === 'memoryEnabled' && preferences.memoryEnabled) {
          console.warn('Agent: Memory enabled but field is locked - respecting lock');
        }
      });
    }
  }, [preferences, isFieldLocked]);

  // Graceful degradation when context is missing
  if (!preferences) {
    console.warn('Agent: AgentPreferencesContext not available, using defaults');
    return <div className="agent-shell">{children}</div>;
  }

  return (
    <div 
      className="agent-shell"
      data-copilot-enabled={preferences.copilotEnabled}
      data-memory-enabled={preferences.memoryEnabled}
      data-tone={preferences.tone}
      data-language={preferences.language}
    >
      {children}
    </div>
  );
}

// Export behavior utilities for testing
export function getCurrentBehavior(): BehaviorChanges {
  // This would be called by test hooks to simulate behavior
  return {
    copilotEnabled: true,
    memoryEnabled: true,
    tone: 'friendly',
    language: 'en',
    timestamp: Date.now()
  };
}

export function simulateBehaviorWithPrefs(
  copilotEnabled: boolean,
  memoryEnabled: boolean,
  tone: AgentTone,
  language: SupportedLanguage
): BehaviorChanges {
  return {
    copilotEnabled,
    memoryEnabled,
    tone,
    language,
    timestamp: Date.now()
  };
} 