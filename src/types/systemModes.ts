// MCP Context Block
/*
{
  file: "systemModes.ts",
  role: "typescript-developer",
  allowedActions: ["define", "type", "interface"],
  tier: "Pro",
  contentSensitivity: "low",
  theme: "system_modes"
}
*/

import { z } from 'zod';

/**
 * System Mode Types
 *
 * @description Defines the three distinct user experience modes for DocCraft-AI
 * - MANUAL: User has full control, AI only responds to explicit requests
 * - HYBRID: Collaborative mode with contextual suggestions and user choice
 * - FULLY_AUTO: AI takes proactive initiative with comprehensive assistance
 */
export type SystemMode = 'MANUAL' | 'HYBRID' | 'FULLY_AUTO';

/**
 * AI Initiative Level
 *
 * @description Controls how proactive the AI is in offering assistance
 * - MINIMAL: Only responds to direct requests
 * - RESPONSIVE: Offers help when context suggests it's needed
 * - PROACTIVE: Actively suggests improvements and enhancements
 */
export type AIInitiativeLevel = 'MINIMAL' | 'RESPONSIVE' | 'PROACTIVE';

/**
 * Suggestion Frequency
 *
 * @description How often the AI provides suggestions and insights
 * - NONE: No automatic suggestions
 * - ON_REQUEST: Only when user asks
 * - CONTEXTUAL: When writing context suggests it would be helpful
 * - CONTINUOUS: Real-time continuous analysis and suggestions
 */
export type SuggestionFrequency =
  | 'NONE'
  | 'ON_REQUEST'
  | 'CONTEXTUAL'
  | 'CONTINUOUS';

/**
 * Intervention Style
 *
 * @description How the AI presents its suggestions and interventions
 * - SILENT: Background analysis without visible interruption
 * - GENTLE: Subtle, non-intrusive suggestions
 * - ACTIVE: Visible, engaging assistance
 * - COMPREHENSIVE: Full-featured, detailed guidance
 */
export type InterventionStyle =
  | 'SILENT'
  | 'GENTLE'
  | 'ACTIVE'
  | 'COMPREHENSIVE';

/**
 * Writing Phase
 *
 * @description Represents the current phase of the writing process
 */
export type WritingPhase = 'planning' | 'drafting' | 'revising' | 'polishing';

/**
 * User Experience Level
 *
 * @description Represents the user's writing experience level
 */
export type UserExperience =
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'expert';

/**
 * Coordination Level
 *
 * @description Defines the level of coordination between modules
 */
export type CoordinationLevel = 'minimal' | 'moderate' | 'comprehensive';

/**
 * Mode Configuration Interface
 *
 * @description Comprehensive configuration for each system mode
 * that controls AI behavior, user experience, and feature availability
 */
export interface ModeConfiguration {
  /** Current system mode */
  mode: SystemMode;

  /** How proactive the AI should be */
  aiInitiativeLevel: AIInitiativeLevel;

  /** Frequency of AI suggestions */
  suggestionFrequency: SuggestionFrequency;

  /** User control level (0-100 percentage) */
  userControlLevel: number;

  /** How AI interventions are presented */
  interventionStyle: InterventionStyle;

  /** Whether automatic enhancements are enabled */
  autoEnhancement: boolean;

  /** Real-time analysis capabilities */
  realTimeAnalysis: boolean;

  /** Proactive suggestion system */
  proactiveSuggestions: boolean;
}

/**
 * Mode Transition Preferences
 *
 * @description User preferences for how mode changes are handled
 */
export interface ModeTransitionPreferences {
  /** Whether to preserve user settings when switching modes */
  preserveSettings: boolean;

  /** Whether to adapt mode behavior to current writing context */
  adaptToContext: boolean;

  /** Whether to show transition guide when switching modes */
  showTransitionGuide: boolean;

  /** Whether to remember mode preferences per document type */
  rememberPerDocumentType: boolean;
}

/**
 * Enhanced Agent Preferences Interface
 *
 * @description Extends the existing AgentPrefs interface with mode system capabilities
 * while maintaining backwards compatibility
 */
export interface EnhancedAgentPrefs {
  // Existing AgentPrefs properties (will be extended)
  // ... existing properties ...

  /** Current system mode */
  systemMode: SystemMode;

  /** Configuration for the current mode */
  modeConfiguration: ModeConfiguration;

  /** Customizations for each mode */
  modeCustomizations: Record<SystemMode, Partial<ModeConfiguration>>;

  /** Whether to automatically switch modes based on context */
  autoModeSwitch: boolean;

  /** Preferences for mode transitions */
  modeTransitionPreferences: ModeTransitionPreferences;

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
}

/**
 * Mode Context Interface
 *
 * @description Context information used by the mode system to make decisions
 */
export interface WritingContext {
  /** Type of document being worked on */
  documentType: string;

  /** User's writing goals */
  userGoals: string[];

  /** Current writing phase */
  writingPhase: WritingPhase;

  /** User's experience level */
  userExperience: UserExperience;

  /** Current mode */
  currentMode: SystemMode;

  /** Writing session duration */
  sessionDuration: number;

  /** User interaction patterns */
  interactionPatterns: {
    frequentEdits: boolean;
    longWritingSessions: boolean;
    collaborativeWork: boolean;
    researchIntensive: boolean;
  };
}

/**
 * Mode Coordination Strategy
 *
 * @description Defines how modules coordinate their behavior based on the current mode
 */
export interface ModeCoordinationStrategy {
  /** Whether cross-module intelligence is enabled */
  crossModuleIntelligence: boolean;

  /** Level of real-time coordination */
  coordinationLevel: CoordinationLevel;

  /** Whether to preserve user work during mode transitions */
  preserveUserWork: boolean;

  /** Performance optimization settings */
  performanceSettings: {
    realTimeUpdates: boolean;
    backgroundProcessing: boolean;
    cacheResults: boolean;
  };
}

/**
 * Mode Transition Result
 *
 * @description Result of a mode transition operation
 */
export interface ModeTransitionResult {
  /** Whether the transition was successful */
  success: boolean;

  /** Error message if transition failed */
  error?: string;

  /** Previous mode before transition */
  previousMode: SystemMode;

  /** New mode after transition */
  newMode: SystemMode;

  /** Timestamp of the transition */
  timestamp: Date;

  /** Whether user work was preserved */
  workPreserved: boolean;

  /** Modules that were successfully updated */
  updatedModules: string[];

  /** Modules that failed to update */
  failedModules: string[];

  /** Recovery suggestions if transition failed */
  recoverySuggestions?: string[];
}

/**
 * Mode Validation Error
 *
 * @description Detailed error information for mode validation failures
 */
export interface ModeValidationError {
  /** Type of validation error */
  type:
    | 'invalid_mode'
    | 'incompatible_config'
    | 'module_error'
    | 'permission_error'
    | 'system_error';

  /** Error message */
  message: string;

  /** Field that failed validation */
  field?: string;

  /** Expected value */
  expected?: any;

  /** Actual value */
  actual?: any;

  /** Error code for programmatic handling */
  code: string;

  /** Whether the error is recoverable */
  recoverable: boolean;

  /** Suggested recovery actions */
  recoveryActions?: string[];

  /** Additional context */
  context?: Record<string, any>;
}

/**
 * Zod Schemas for Runtime Validation
 */

// System Mode Schema
export const SystemModeSchema = z.enum(['MANUAL', 'HYBRID', 'FULLY_AUTO']);

// AI Initiative Level Schema
export const AIInitiativeLevelSchema = z.enum([
  'MINIMAL',
  'RESPONSIVE',
  'PROACTIVE',
]);

// Suggestion Frequency Schema
export const SuggestionFrequencySchema = z.enum([
  'NONE',
  'ON_REQUEST',
  'CONTEXTUAL',
  'CONTINUOUS',
]);

// Intervention Style Schema
export const InterventionStyleSchema = z.enum([
  'SILENT',
  'GENTLE',
  'ACTIVE',
  'COMPREHENSIVE',
]);

// Writing Phase Schema
export const WritingPhaseSchema = z.enum([
  'planning',
  'drafting',
  'revising',
  'polishing',
]);

// User Experience Schema
export const UserExperienceSchema = z.enum([
  'beginner',
  'intermediate',
  'advanced',
  'expert',
]);

// Coordination Level Schema
export const CoordinationLevelSchema = z.enum([
  'minimal',
  'moderate',
  'comprehensive',
]);

// Mode Configuration Schema
export const ModeConfigurationSchema = z.object({
  mode: SystemModeSchema,
  aiInitiativeLevel: AIInitiativeLevelSchema,
  suggestionFrequency: SuggestionFrequencySchema,
  userControlLevel: z.number().min(0).max(100),
  interventionStyle: InterventionStyleSchema,
  autoEnhancement: z.boolean(),
  realTimeAnalysis: z.boolean(),
  proactiveSuggestions: z.boolean(),
});

// Mode Transition Preferences Schema
export const ModeTransitionPreferencesSchema = z.object({
  preserveSettings: z.boolean(),
  adaptToContext: z.boolean(),
  showTransitionGuide: z.boolean(),
  rememberPerDocumentType: z.boolean(),
});

// Writing Context Schema
export const WritingContextSchema = z.object({
  documentType: z.string(),
  userGoals: z.array(z.string()),
  writingPhase: WritingPhaseSchema,
  userExperience: UserExperienceSchema,
  currentMode: SystemModeSchema,
  sessionDuration: z.number().min(0),
  interactionPatterns: z.object({
    frequentEdits: z.boolean(),
    longWritingSessions: z.boolean(),
    collaborativeWork: z.boolean(),
    researchIntensive: z.boolean(),
  }),
});

// Mode Coordination Strategy Schema
export const ModeCoordinationStrategySchema = z.object({
  crossModuleIntelligence: z.boolean(),
  coordinationLevel: CoordinationLevelSchema,
  preserveUserWork: z.boolean(),
  performanceSettings: z.object({
    realTimeUpdates: z.boolean(),
    backgroundProcessing: z.boolean(),
    cacheResults: z.boolean(),
  }),
});

// Mode Transition Result Schema
export const ModeTransitionResultSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
  previousMode: SystemModeSchema,
  newMode: SystemModeSchema,
  timestamp: z.date(),
  workPreserved: z.boolean(),
  updatedModules: z.array(z.string()),
  failedModules: z.array(z.string()),
  recoverySuggestions: z.array(z.string()).optional(),
});

// Mode Validation Error Schema
export const ModeValidationErrorSchema = z.object({
  type: z.enum([
    'invalid_mode',
    'incompatible_config',
    'module_error',
    'permission_error',
    'system_error',
  ]),
  message: z.string(),
  field: z.string().optional(),
  expected: z.any().optional(),
  actual: z.any().optional(),
  code: z.string(),
  recoverable: z.boolean(),
  recoveryActions: z.array(z.string()).optional(),
  context: z.record(z.any()).optional(),
});

/**
 * Type Guards for Runtime Validation
 */

/**
 * Check if a value is a valid SystemMode
 */
export function isSystemMode(value: any): value is SystemMode {
  return SystemModeSchema.safeParse(value).success;
}

/**
 * Check if a value is a valid ModeConfiguration
 */
export function isModeConfiguration(value: any): value is ModeConfiguration {
  return ModeConfigurationSchema.safeParse(value).success;
}

/**
 * Check if a value is a valid WritingContext
 */
export function isWritingContext(value: any): value is WritingContext {
  return WritingContextSchema.safeParse(value).success;
}

/**
 * Check if a value is a valid ModeTransitionResult
 */
export function isModeTransitionResult(
  value: any
): value is ModeTransitionResult {
  return ModeTransitionResultSchema.safeParse(value).success;
}

/**
 * Check if a value is a valid ModeValidationError
 */
export function isModeValidationError(
  value: any
): value is ModeValidationError {
  return ModeValidationErrorSchema.safeParse(value).success;
}

/**
 * Validation Functions
 */

/**
 * Validate a mode configuration
 */
export function validateModeConfiguration(config: any): {
  valid: boolean;
  errors: string[];
} {
  const result = ModeConfigurationSchema.safeParse(config);

  if (result.success) {
    return { valid: true, errors: [] };
  }

  const errors = result.error.issues.map(
    issue => `${issue.path.join('.')}: ${issue.message}`
  );

  return { valid: false, errors };
}

/**
 * Validate a writing context
 */
export function validateWritingContext(context: any): {
  valid: boolean;
  errors: string[];
} {
  const result = WritingContextSchema.safeParse(context);

  if (result.success) {
    return { valid: true, errors: [] };
  }

  const errors = result.error.issues.map(
    issue => `${issue.path.join('.')}: ${issue.message}`
  );

  return { valid: false, errors };
}

/**
 * Validate mode compatibility
 */
export function validateModeCompatibility(
  fromMode: SystemMode,
  toMode: SystemMode,
  context: WritingContext
): { compatible: boolean; warnings: string[]; errors: string[] } {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Check if modes are different
  if (fromMode === toMode) {
    return { compatible: true, warnings: [], errors: [] };
  }

  // Check for potential conflicts
  if (fromMode === 'FULLY_AUTO' && toMode === 'MANUAL') {
    warnings.push(
      'Switching from fully automatic to manual mode may result in loss of AI enhancements'
    );
  }

  if (fromMode === 'MANUAL' && toMode === 'FULLY_AUTO') {
    warnings.push(
      'Switching to fully automatic mode will enable proactive AI assistance'
    );
  }

  // Check context compatibility
  if (context.writingPhase === 'polishing' && toMode === 'MANUAL') {
    warnings.push(
      'Manual mode during polishing phase may limit AI assistance for final improvements'
    );
  }

  if (context.userExperience === 'beginner' && toMode === 'MANUAL') {
    warnings.push(
      'Manual mode may be challenging for beginners - consider starting with Hybrid mode'
    );
  }

  return { compatible: true, warnings, errors };
}

/**
 * Default Mode Configurations
 *
 * @description Pre-configured settings for each system mode
 */
export const DEFAULT_MODE_CONFIGS: Record<SystemMode, ModeConfiguration> = {
  MANUAL: {
    mode: 'MANUAL',
    aiInitiativeLevel: 'MINIMAL',
    suggestionFrequency: 'ON_REQUEST',
    userControlLevel: 100,
    interventionStyle: 'SILENT',
    autoEnhancement: false,
    realTimeAnalysis: false,
    proactiveSuggestions: false,
  },

  HYBRID: {
    mode: 'HYBRID',
    aiInitiativeLevel: 'RESPONSIVE',
    suggestionFrequency: 'CONTEXTUAL',
    userControlLevel: 70,
    interventionStyle: 'GENTLE',
    autoEnhancement: true,
    realTimeAnalysis: true,
    proactiveSuggestions: true,
  },

  FULLY_AUTO: {
    mode: 'FULLY_AUTO',
    aiInitiativeLevel: 'PROACTIVE',
    suggestionFrequency: 'CONTINUOUS',
    userControlLevel: 30,
    interventionStyle: 'COMPREHENSIVE',
    autoEnhancement: true,
    realTimeAnalysis: true,
    proactiveSuggestions: true,
  },
};

/**
 * Mode Descriptions for UI
 *
 * @description User-friendly descriptions of each mode
 */
export const MODE_DESCRIPTIONS: Record<SystemMode, string> = {
  MANUAL: 'Full control mode - AI only helps when you ask',
  HYBRID: 'Collaborative mode - AI suggests, you decide',
  FULLY_AUTO: 'Proactive mode - AI actively enhances your writing',
};

/**
 * Mode Icons for UI
 *
 * @description Icon identifiers for each mode
 */
export const MODE_ICONS: Record<SystemMode, string> = {
  MANUAL: 'hand',
  HYBRID: 'handshake',
  FULLY_AUTO: 'auto',
};

/**
 * Error Codes for Mode System
 */
export const MODE_ERROR_CODES = {
  INVALID_MODE: 'MODE_001',
  INCOMPATIBLE_CONFIG: 'MODE_002',
  MODULE_UPDATE_FAILED: 'MODE_003',
  PERMISSION_DENIED: 'MODE_004',
  SYSTEM_ERROR: 'MODE_005',
  VALIDATION_FAILED: 'MODE_006',
  TRANSITION_TIMEOUT: 'MODE_007',
  WORK_PRESERVATION_FAILED: 'MODE_008',
} as const;

/**
 * Recovery Actions for Common Mode Errors
 */
export const MODE_RECOVERY_ACTIONS = {
  [MODE_ERROR_CODES.INVALID_MODE]: [
    'Verify the mode name is correct',
    'Check if the mode is supported in your current tier',
    'Try refreshing the page and selecting the mode again',
  ],
  [MODE_ERROR_CODES.INCOMPATIBLE_CONFIG]: [
    'Reset mode configuration to defaults',
    'Check for conflicting user preferences',
    'Contact support if the issue persists',
  ],
  [MODE_ERROR_CODES.MODULE_UPDATE_FAILED]: [
    'Wait a moment and try switching modes again',
    'Check if all required modules are loaded',
    'Refresh the page to reload modules',
  ],
  [MODE_ERROR_CODES.PERMISSION_DENIED]: [
    'Verify your account tier supports this mode',
    'Check if you have the required permissions',
    'Contact your administrator for access',
  ],
  [MODE_ERROR_CODES.SYSTEM_ERROR]: [
    'Wait a moment and try again',
    'Check your internet connection',
    'Contact support if the issue persists',
  ],
  [MODE_ERROR_CODES.VALIDATION_FAILED]: [
    'Check your mode configuration settings',
    'Reset to default configuration',
    'Verify all required fields are set',
  ],
  [MODE_ERROR_CODES.TRANSITION_TIMEOUT]: [
    'Wait for the current operation to complete',
    'Try switching modes again',
    'Check if any background processes are running',
  ],
  [MODE_ERROR_CODES.WORK_PRESERVATION_FAILED]: [
    'Your work should be automatically saved',
    'Check the autosave folder',
    'Contact support for data recovery',
  ],
} as const;
