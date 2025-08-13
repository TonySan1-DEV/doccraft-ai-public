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

import {
  SystemMode,
  ModeConfiguration,
  ModeTransitionPreferences,
  DEFAULT_MODE_CONFIGS,
} from './systemModes';

/**
 * AI communication tone options
 *
 * @description Controls how the AI assistant communicates with users
 * - friendly: Warm, conversational, approachable responses
 * - formal: Professional, structured, business-like communication
 * - concise: Brief, direct, to-the-point interactions
 */
export type AgentTone = 'friendly' | 'formal' | 'concise';

/**
 * Command display layout options
 *
 * @description Controls how commands and suggestions are displayed in the UI
 * - list: Linear command display (default)
 * - grid: Grid-based command layout
 */
export type CommandViewMode = 'list' | 'grid';

/**
 * Supported interface languages
 *
 * @description Language codes for interface and AI response localization
 * - en: English (default)
 * - es: Spanish
 * - fr: French
 * - de: German
 * - ja: Japanese
 * - zh: Chinese
 * - ko: Korean
 */
export type SupportedLanguage = 'en' | 'es' | 'fr' | 'de' | 'ja' | 'zh' | 'ko';

/**
 * Main agent preferences interface that controls AI behavior and user experience
 *
 * @description This interface defines all configurable preferences for the DocCraft-AI agent,
 * including communication style, language settings, feature toggles, and content preferences.
 *
 * @example
 * ```typescript
 * const prefs: AgentPrefs = {
 *   tone: 'friendly',
 *   language: 'en',
 *   copilotEnabled: true,
 *   memoryEnabled: true,
 *   defaultCommandView: 'list',
 *   lockedFields: [],
 *   genre: 'fantasy'
 * };
 * ```
 */
export interface AgentPrefs {
  /** AI communication style - affects response tone and personality */
  tone: AgentTone;

  /** Interface and response language preference */
  language: SupportedLanguage;

  /** Whether proactive AI suggestions are enabled */
  copilotEnabled: boolean;

  /** Whether conversation context is retained across sessions */
  memoryEnabled: boolean;

  /** Default UI layout for command display */
  defaultCommandView: CommandViewMode;

  /** Fields that cannot be modified due to admin policy */
  lockedFields: string[];

  /** Primary content genre for AI context and suggestions */
  genre?: string;

  /** Legacy memory setting - use memoryEnabled instead */
  memory?: boolean;

  /** Legacy copilot setting - use copilotEnabled instead */
  copilot?: boolean;

  // === UNIFIED MODE SYSTEM ===
  /** Current system mode for AI assistance */
  systemMode?: SystemMode;

  /** Configuration for the current mode */
  modeConfiguration?: ModeConfiguration;

  /** Customizations for each mode */
  modeCustomizations?: Record<SystemMode, Partial<ModeConfiguration>>;

  /** Whether to automatically switch modes based on context */
  autoModeSwitch?: boolean;

  /** Preferences for mode transitions */
  modeTransitionPreferences?: ModeTransitionPreferences;

  /** Last mode change timestamp */
  lastModeChange?: Date;

  /** Mode change history for analytics */
  modeChangeHistory?: Array<{
    fromMode: SystemMode;
    toMode: SystemMode;
    timestamp: Date;
    reason?: string;
    context?: string;
  }>;

  /** Whether the user has seen the mode onboarding */
  hasSeenModeOnboarding?: boolean;

  /** User's preferred writing style */
  writingStyle?: 'collaborative' | 'independent' | 'assisted';

  /** User's preferred collaboration level with AI */
  collaborationLevel?: 'low' | 'medium' | 'high' | 'very_high';
}

/**
 * Locked preferences configuration
 *
 * @description Defines which preference fields are locked and cannot be modified by users
 *
 * @example
 * ```typescript
 * const lockedPrefs: LockedPrefs = {
 *   fields: ['tone', 'language'],
 *   reason: 'Enterprise policy',
 *   adminOverride: false
 * };
 * ```
 */
export interface LockedPrefs {
  /** Array of preference field names that are locked */
  fields: (keyof AgentPrefs)[];

  /** Reason why these fields are locked */
  reason?: string;

  /** Whether admin can override these locks */
  adminOverride?: boolean;
}

/**
 * Individual preference update event
 *
 * @description Represents a single preference field update with metadata
 *
 * @example
 * ```typescript
 * const update: PreferenceUpdate = {
 *   field: 'tone',
 *   value: 'formal',
 *   timestamp: Date.now(),
 *   source: 'user'
 * };
 * ```
 */
export interface PreferenceUpdate {
  /** The preference field being updated */
  field: keyof AgentPrefs;

  /** New value for the preference field */
  value: any;

  /** Unix timestamp when update occurred */
  timestamp: number;

  /** Source of the preference update */
  source: 'user' | 'admin' | 'system';
}

/**
 * Admin policy for default agent preferences
 *
 * @description Defines default values and locked fields for agent preferences
 *
 * @example
 * ```typescript
 * const policy: AgentDefaultPolicy = {
 *   defaultTone: 'formal',
 *   defaultLanguage: 'en',
 *   defaultCopilotEnabled: true,
 *   defaultMemoryEnabled: true,
 *   defaultCommandView: 'list',
 *   lockedFields: ['tone'],
 *   policyReason: 'Enterprise security policy'
 * };
 * ```
 */
export interface AgentDefaultPolicy {
  /** Default AI communication tone */
  defaultTone: AgentTone;

  /** Default interface language */
  defaultLanguage: SupportedLanguage;

  /** Default copilot feature state */
  defaultCopilotEnabled: boolean;

  /** Default memory feature state */
  defaultMemoryEnabled: boolean;

  /** Default command view layout */
  defaultCommandView: CommandViewMode;

  /** Fields that should be locked by default */
  lockedFields: string[];

  /** Reason for the policy implementation */
  policyReason?: string;
}

/**
 * Telemetry event for preference changes
 *
 * @description Tracks preference updates for analytics and debugging
 *
 * @example
 * ```typescript
 * const changeEvent: PreferenceChangeEvent = {
 *   updatedFields: ['tone', 'genre'],
 *   timestamp: Date.now(),
 *   userTier: 'Pro',
 *   previousValues: { tone: 'formal', genre: 'mystery' }
 * };
 * ```
 */
export interface PreferenceChangeEvent {
  /** Array of field names that were updated */
  updatedFields: string[];

  /** Unix timestamp when change occurred */
  timestamp: number;

  /** User tier when change occurred */
  userTier: string;

  /** Previous values before the change */
  previousValues?: Partial<AgentPrefs>;
}

/**
 * Telemetry event for preference resets
 *
 * @description Tracks when preferences are reset to defaults
 *
 * @example
 * ```typescript
 * const resetEvent: PreferenceResetEvent = {
 *   timestamp: Date.now(),
 *   userTier: 'Pro',
 *   resetToDefaults: true
 * };
 * ```
 */
export interface PreferenceResetEvent {
  /** Unix timestamp when reset occurred */
  timestamp: number;

  /** User tier when reset occurred */
  userTier: string;

  /** Whether reset was to default values */
  resetToDefaults: boolean;
}

/**
 * Valid tone values for agent preferences
 */
export const VALID_TONES: AgentTone[] = ['friendly', 'formal', 'concise'];

/**
 * Valid language codes for agent preferences
 */
export const VALID_LANGUAGES: SupportedLanguage[] = [
  'en',
  'es',
  'fr',
  'de',
  'ja',
  'zh',
  'ko',
];

/**
 * Valid command view modes for agent preferences
 */
export const VALID_COMMAND_VIEWS: CommandViewMode[] = ['list', 'grid'];

/**
 * Type for valid preference field names
 */
export type ValidPreferenceField = keyof AgentPrefs;

/**
 * Type for preference field values
 */
export type PreferenceValue = AgentPrefs[ValidPreferenceField];

/**
 * Type guard to validate tone values
 *
 * @param tone - String to validate as a tone
 * @returns True if the string is a valid tone
 *
 * @example
 * ```typescript
 * if (isValidTone(userInput)) {
 *   // userInput is now typed as AgentTone
 *   setTone(userInput);
 * }
 * ```
 */
export function isValidTone(tone: string): tone is AgentTone {
  return VALID_TONES.includes(tone as AgentTone);
}

/**
 * Type guard to validate language values
 *
 * @param lang - String to validate as a language code
 * @returns True if the string is a valid language code
 *
 * @example
 * ```typescript
 * if (isValidLanguage(userInput)) {
 *   // userInput is now typed as SupportedLanguage
 *   setLanguage(userInput);
 * }
 * ```
 */
export function isValidLanguage(lang: string): lang is SupportedLanguage {
  return VALID_LANGUAGES.includes(lang as SupportedLanguage);
}

/**
 * Type guard to validate command view values
 *
 * @param view - String to validate as a command view mode
 * @returns True if the string is a valid command view mode
 *
 * @example
 * ```typescript
 * if (isValidCommandView(userInput)) {
 *   // userInput is now typed as CommandViewMode
 *   setCommandView(userInput);
 * }
 * ```
 */
export function isValidCommandView(view: string): view is CommandViewMode {
  return VALID_COMMAND_VIEWS.includes(view as CommandViewMode);
}

/**
 * Validates agent preferences object
 *
 * @description Comprehensive validation for all preference fields with detailed error reporting
 *
 * @param prefs - Partial preferences object to validate
 * @returns Validation result with success status and error messages
 *
 * @example
 * ```typescript
 * const validation = validatePreferences({
 *   tone: 'friendly',
 *   language: 'en',
 *   copilotEnabled: true
 * });
 *
 * if (!validation.isValid) {
 *   console.error('Validation errors:', validation.errors);
 * } else {
 *   // Preferences are valid
 *   savePreferences(prefs);
 * }
 * ```
 */
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

  if (
    prefs.defaultCommandView &&
    !isValidCommandView(prefs.defaultCommandView)
  ) {
    errors.push(`Invalid command view: ${prefs.defaultCommandView}`);
  }

  if (
    prefs.copilotEnabled !== undefined &&
    typeof prefs.copilotEnabled !== 'boolean'
  ) {
    errors.push('copilotEnabled must be a boolean');
  }

  if (
    prefs.memoryEnabled !== undefined &&
    typeof prefs.memoryEnabled !== 'boolean'
  ) {
    errors.push('memoryEnabled must be a boolean');
  }

  if (prefs.lockedFields && !Array.isArray(prefs.lockedFields)) {
    errors.push('lockedFields must be an array');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
