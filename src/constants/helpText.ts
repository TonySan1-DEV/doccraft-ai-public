// MCP Context Block
/*
{
  file: "helpText.ts",
  role: "frontend-developer",
  allowedActions: ["ui", "accessibility"],
  tier: "Pro",
  contentSensitivity: "low",
  theme: "help_text"
}
*/

/**
 * Help text constants for tooltips and help content
 * Organized by component/feature for easy maintenance
 */

// Agent Preferences Panel
export const AGENT_PREFERENCES_HELP = {
  tone: {
    title: 'AI Tone',
    description: 'Controls how the AI assistant communicates with you. Friendly is warm and conversational, Formal is professional and structured, Concise is brief and direct.'
  },
  genre: {
    title: 'Primary Genre',
    description: 'Sets the primary content type for your writing. This helps the AI understand context and provide more relevant suggestions.'
  },
  copilot: {
    title: 'AI Copilot',
    description: 'When enabled, the AI will proactively suggest improvements and alternatives to your content. Disable for a more hands-off experience.'
  },
  memory: {
    title: 'Session Memory',
    description: 'When enabled, the AI remembers conversation context across your writing session. This helps maintain continuity in longer writing projects.'
  },
  language: {
    title: 'Interface Language',
    description: 'Sets the language for the user interface. The AI will also respond in this language when possible.'
  },
  commandView: {
    title: 'Command Display',
    description: 'Choose how commands and suggestions are displayed. List view is more compact, Grid view shows more options at once.'
  },
  preset: {
    title: 'Quick Preset',
    description: 'Quickly switch between predefined writing modes. Each preset is optimized for different writing scenarios. You can also save your current settings as a custom preset.'
  }
} as const;

// Prompt Preview Panel
export const PROMPT_PREVIEW_HELP = {
  patternUsed: {
    title: "Pattern Used",
    content: "Shows which prompt pattern is currently active for your genre and arc combination."
  },
  
  fallbackDiagnostics: {
    title: "Fallback Diagnostics",
    content: "Shows when the system uses fallback patterns due to missing specific templates."
  },
  
  currentConfiguration: {
    title: "Current Configuration",
    content: "Displays your current preference settings that affect prompt generation."
  }
} as const;

// Behavior Console
export const BEHAVIOR_CONSOLE_HELP = {
  persona: {
    title: "AI Persona",
    content: "Shows whether the AI is in copilot mode (proactive) or assistant mode (reactive)."
  },
  
  memory: {
    title: "Memory State",
    content: "Indicates whether conversation context is being retained across sessions."
  },
  
  promptModifiers: {
    title: "Active Prompt Modifiers",
    content: "Shows how your current settings modify the AI's prompt generation."
  },
  
  conflicts: {
    title: "Configuration Conflicts",
    content: "Highlights any issues with your current preference configuration."
  }
} as const;

// Onboarding
export const ONBOARDING_HELP = {
  tone: {
    title: "Choose Your AI's Tone",
    content: "How should your AI assistant communicate with you?",
    options: {
      friendly: "Warm and approachable - great for creative writing",
      formal: "Professional and structured - ideal for business content",
      concise: "Brief and direct - perfect for quick edits"
    }
  },
  
  genre: {
    title: "Select Your Primary Genre",
    content: "What type of content do you create most often?",
    options: {
      Adventure: "Action-packed stories with dynamic plots",
      Essay: "Academic and analytical writing",
      Romance: "Emotional and relationship-focused content",
      Mystery: "Suspense and detective stories",
      SciFi: "Futuristic and speculative fiction",
      General: "Versatile for any content type"
    }
  },
  
  copilot: {
    title: "Enable AI Copilot",
    content: "Should your AI actively suggest improvements and alternatives?",
    options: {
      enabled: "Get proactive suggestions and content improvements",
      disabled: "Only respond when explicitly asked"
    }
  },
  
  memory: {
    title: "Enable Memory",
    content: "Should your AI remember context from previous conversations?",
    options: {
      enabled: "Remember conversation context and build upon it",
      disabled: "Start fresh each time for stateless interactions"
    }
  }
} as const;

// General Help
export const GENERAL_HELP = {
  resetToDefaults: {
    title: "Reset to Defaults",
    content: "Restore all preferences to their original factory settings."
  },
  
  setupGuide: {
    title: "Setup Guide",
    content: "Re-run the initial setup process to configure your preferences."
  },
  
  copyPromptHeader: {
    title: "Copy Prompt Header",
    content: "Copy the current prompt configuration to clipboard for sharing or debugging."
  },
  
  refreshPreview: {
    title: "Refresh Preview",
    content: "Regenerate the prompt preview with current settings."
  }
} as const;

// Accessibility
export const ACCESSIBILITY_HELP = {
  tooltip: {
    title: "Help Information",
    content: "Press Tab to navigate, Enter to open help, Escape to close."
  },
  
  keyboard: {
    title: "Keyboard Navigation",
    content: "Use Tab to navigate between options, Enter to select, Escape to close dialogs."
  }
} as const;

// Export all help text for easy importing
export const HELP_TEXT = {
  agentPreferences: AGENT_PREFERENCES_HELP,
  promptPreview: PROMPT_PREVIEW_HELP,
  behaviorConsole: BEHAVIOR_CONSOLE_HELP,
  onboarding: ONBOARDING_HELP,
  general: GENERAL_HELP,
  accessibility: ACCESSIBILITY_HELP
} as const;

// Type definitions for better TypeScript support
export type HelpTextKey = keyof typeof HELP_TEXT;
export type AgentPreferencesHelpKey = keyof typeof AGENT_PREFERENCES_HELP;
export type PromptPreviewHelpKey = keyof typeof PROMPT_PREVIEW_HELP;
export type BehaviorConsoleHelpKey = keyof typeof BEHAVIOR_CONSOLE_HELP;
export type OnboardingHelpKey = keyof typeof ONBOARDING_HELP;
export type GeneralHelpKey = keyof typeof GENERAL_HELP; 