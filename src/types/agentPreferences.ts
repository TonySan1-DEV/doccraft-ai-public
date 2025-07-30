// MCP Context Block
/*
{
  file: "agentPreferences.ts",
  role: "typescript-developer",
  allowedActions: ["define", "type", "interface"],
  tier: "Pro",
  contentSensitivity: "low",
  theme: "agent_preferences"
}
*/

// Core preference types
export type AgentTone = 'friendly' | 'formal' | 'concise';
export type CommandViewMode = 'list' | 'grid';
export type SupportedLanguage = 'en' | 'es' | 'fr' | 'de' | 'ja' | 'zh' | 'ko';

// Main preferences interface
export interface AgentPrefs {
  tone: AgentTone;
  language: SupportedLanguage;
  copilotEnabled: boolean;
  memoryEnabled: boolean;
  defaultCommandView: CommandViewMode;
  lockedFields: string[]; // Fields locked by admin policy
  genre?: string;
  memory?: boolean;
  copilot?: boolean;
}

// Locked preferences interface
export interface LockedPrefs {
  fields: (keyof AgentPrefs)[];
  reason?: string;
  adminOverride?: boolean;
}

// Preference update interface
export interface PreferenceUpdate {
  field: keyof AgentPrefs;
  value: any;
  timestamp: number;
  source: 'user' | 'admin' | 'system';
}

// Admin policy interface
export interface AgentDefaultPolicy {
  defaultTone: AgentTone;
  defaultLanguage: SupportedLanguage;
  defaultCopilotEnabled: boolean;
  defaultMemoryEnabled: boolean;
  defaultCommandView: CommandViewMode;
  lockedFields: string[];
  policyReason?: string;
}

// Telemetry event types
export interface PreferenceChangeEvent {
  updatedFields: string[];
  timestamp: number;
  userTier: string;
  previousValues?: Partial<AgentPrefs>;
}

export interface PreferenceResetEvent {
  timestamp: number;
  userTier: string;
  resetToDefaults: boolean;
}

// Validation schemas
export const VALID_TONES: AgentTone[] = ['friendly', 'formal', 'concise'];
export const VALID_LANGUAGES: SupportedLanguage[] = ['en', 'es', 'fr', 'de', 'ja', 'zh', 'ko'];
export const VALID_COMMAND_VIEWS: CommandViewMode[] = ['list', 'grid'];

// Utility types for validation
export type ValidPreferenceField = keyof AgentPrefs;
export type PreferenceValue = AgentPrefs[ValidPreferenceField];

// Type guards for runtime validation
export function isValidTone(tone: string): tone is AgentTone {
  return VALID_TONES.includes(tone as AgentTone);
}

export function isValidLanguage(lang: string): lang is SupportedLanguage {
  return VALID_LANGUAGES.includes(lang as SupportedLanguage);
}

export function isValidCommandView(view: string): view is CommandViewMode {
  return VALID_COMMAND_VIEWS.includes(view as CommandViewMode);
}

// Preference validation function
export function validatePreferences(prefs: Partial<AgentPrefs>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (prefs.tone && !isValidTone(prefs.tone)) {
    errors.push(`Invalid tone: ${prefs.tone}`);
  }

  if (prefs.language && !isValidLanguage(prefs.language)) {
    errors.push(`Invalid language: ${prefs.language}`);
  }

  if (prefs.defaultCommandView && !isValidCommandView(prefs.defaultCommandView)) {
    errors.push(`Invalid command view: ${prefs.defaultCommandView}`);
  }

  if (prefs.copilotEnabled !== undefined && typeof prefs.copilotEnabled !== 'boolean') {
    errors.push('copilotEnabled must be a boolean');
  }

  if (prefs.memoryEnabled !== undefined && typeof prefs.memoryEnabled !== 'boolean') {
    errors.push('memoryEnabled must be a boolean');
  }

  if (prefs.lockedFields && !Array.isArray(prefs.lockedFields)) {
    errors.push('lockedFields must be an array');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
} 