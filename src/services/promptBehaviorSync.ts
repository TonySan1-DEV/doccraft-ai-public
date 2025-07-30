// MCP Context Block
/*
{
  file: "promptBehaviorSync.ts",
  role: "service-developer",
  allowedActions: ["sync", "format", "prompt"],
  tier: "Pro",
  contentSensitivity: "low",
  theme: "agent_prompt"
}
*/

import { AgentTone, SupportedLanguage, VALID_TONES, VALID_LANGUAGES } from '../types/agentPreferences';
import { promptBuilder } from './PromptBuilder';
import { logFallbackWarning } from '../agent/ContextualPromptEngine';

// Global state for tracking last injected header
interface LastInjectedHeader {
  header: string;
  tone: AgentTone;
  language: SupportedLanguage;
  timestamp: number;
}

let lastInjectedHeader: LastInjectedHeader | null = null;

/**
 * Validates if a tone string is a valid AgentTone
 * @param tone - The tone string to validate
 * @returns True if the tone is valid, false otherwise
 */
function isValidTone(tone: string): tone is AgentTone {
  return VALID_TONES.includes(tone as AgentTone);
}

/**
 * Validates if a language string is a valid SupportedLanguage
 * @param language - The language string to validate
 * @returns True if the language is valid, false otherwise
 */
function isValidLanguage(language: string): language is SupportedLanguage {
  return VALID_LANGUAGES.includes(language as SupportedLanguage);
}

/**
 * Generates a standardized header string for prompt injection
 * @param tone - The validated agent tone
 * @param language - The validated supported language
 * @returns A formatted header string with tone and language information
 */
function generateHeaderString(tone: AgentTone, language: SupportedLanguage): string {
  return `/* Tone: ${tone} | Language: ${language} */`;
}

/**
 * Checks if a header is already present in the prompt to avoid duplicate injection
 * @param prompt - The prompt text to check
 * @param header - The header string to look for
 * @returns True if the header is already present, false otherwise
 */
function isHeaderAlreadyPresent(prompt: string, header: string): boolean {
  const normalizedPrompt = prompt.toLowerCase();
  const normalizedHeader = header.toLowerCase();
  return normalizedPrompt.includes(normalizedHeader);
}

/**
 * Injects a header into a prompt at the optimal location
 * Attempts to place after MCP context blocks, falls back to beginning
 * @param prompt - The original prompt text
 * @param header - The header string to inject
 * @returns The prompt with the header injected
 */
function injectHeaderIntoPrompt(prompt: string, header: string): string {
  if (isHeaderAlreadyPresent(prompt, header)) {
    return prompt; // Header already present, no need to inject
  }

  // Find the best insertion point (after MCP context block if present)
  const mcpBlockEnd = prompt.indexOf('*/\n\n');
  if (mcpBlockEnd !== -1) {
    // Insert after MCP context block
    return prompt.slice(0, mcpBlockEnd + 4) + header + '\n' + prompt.slice(mcpBlockEnd + 4);
  } else {
    // Insert at the beginning
    return header + '\n' + prompt;
  }
}

/**
 * Main synchronization function that updates prompt behavior based on tone and language preferences
 * 
 * This function performs several key operations:
 * 1. Validates input parameters and falls back to defaults if invalid
 * 2. Generates a standardized header for prompt injection
 * 3. Checks for duplicate injections to prevent unnecessary updates
 * 4. Updates the PromptBuilder configuration with new settings
 * 5. Sets global prompt prefix if available in the window context
 * 6. Logs telemetry events for monitoring and debugging
 * 7. Integrates with fallback diagnostics via logFallbackWarning()
 * 
 * The function is designed to handle edge cases such as:
 * - Invalid input parameters (falls back to 'friendly' tone and 'en' language)
 * - PromptBuilder errors (logs error and continues)
 * - Global context unavailability (graceful degradation)
 * - Duplicate injection attempts (returns early with reason)
 * 
 * @param tone - The agent tone preference (e.g., 'friendly', 'formal', 'concise')
 * @param language - The language preference (e.g., 'en', 'es', 'fr')
 * @returns SyncResult object containing operation details and status
 * 
 * @example
 * ```typescript
 * const result = syncPromptBehavior('friendly', 'en');
 * if (result.injected) {
 *   console.log('Prompt behavior updated successfully');
 * } else {
 *   console.log('No injection needed:', result.reason);
 * }
 * ```
 */
export function syncPromptBehavior(tone: string, language: string): SyncResult {
  // Validate inputs with fallback to defaults
  const validatedTone: AgentTone = isValidTone(tone) ? tone : 'friendly';
  const validatedLanguage: SupportedLanguage = isValidLanguage(language) ? language : 'en';

  // Log fallback warning if validation failed
  if (!isValidTone(tone)) {
    logFallbackWarning('promptBehaviorSync', 'tone', `Invalid tone "${tone}", using "friendly"`);
  }
  if (!isValidLanguage(language)) {
    logFallbackWarning('promptBehaviorSync', 'language', `Invalid language "${language}", using "en"`);
  }

  // Generate header
  const header = generateHeaderString(validatedTone, validatedLanguage);

  // Check if this is a duplicate injection to prevent unnecessary updates
  const isDuplicate = lastInjectedHeader && 
    lastInjectedHeader.tone === validatedTone && 
    lastInjectedHeader.language === validatedLanguage;

  if (isDuplicate) {
    return {
      header,
      injected: false,
      tone: validatedTone,
      language: validatedLanguage,
      reason: 'duplicate'
    };
  }

  // Update PromptBuilder configuration with error handling
  try {
    promptBuilder.setTone(validatedTone);
    promptBuilder.setLanguage(validatedLanguage);
  } catch (error) {
    console.error('Failed to update PromptBuilder:', error);
    logFallbackWarning('promptBehaviorSync', 'promptBuilder', `Failed to update PromptBuilder: ${(error as Error).message}`);
    return {
      header,
      injected: false,
      tone: validatedTone,
      language: validatedLanguage,
      reason: 'promptBuilder_error',
      error: (error as Error).message
    };
  }

  // Update global prompt prefix if available in window context
  if (typeof window !== 'undefined' && (window as any).setPromptPrefix) {
    try {
      (window as any).setPromptPrefix(header);
    } catch (error) {
      console.warn('Failed to set global prompt prefix:', error);
      logFallbackWarning('promptBehaviorSync', 'globalPrefix', `Failed to set global prompt prefix: ${(error as Error).message}`);
    }
  }

  // Store last injected header for duplicate detection
  lastInjectedHeader = {
    header,
    tone: validatedTone,
    language: validatedLanguage,
    timestamp: Date.now()
  };

  // Log telemetry events for monitoring and debugging
  if (typeof window !== 'undefined' && (window as any).logTelemetryEvent) {
    (window as any).logTelemetryEvent('prompt_behavior_synced', {
      tone: validatedTone,
      language: validatedLanguage,
      header,
      timestamp: Date.now()
    });
  }

  return {
    header,
    injected: true,
    tone: validatedTone,
    language: validatedLanguage,
    reason: 'success'
  };
}

/**
 * Interface defining the result of a prompt behavior synchronization operation
 */
export interface SyncResult {
  /** The generated header string */
  header: string;
  /** Whether the header was actually injected into the prompt */
  injected: boolean;
  /** The validated tone that was used */
  tone: AgentTone;
  /** The validated language that was used */
  language: SupportedLanguage;
  /** The reason for the sync result (success, duplicate, or error) */
  reason: 'success' | 'duplicate' | 'promptBuilder_error';
  /** Error message if the sync failed */
  error?: string;
}

/**
 * Retrieves the current header that was last injected
 * Useful for debugging and state inspection
 * @returns The current header string or null if no header has been injected
 */
export function getCurrentHeader(): string | null {
  return lastInjectedHeader?.header || null;
}

/**
 * Checks if a header update is needed based on current tone and language
 * Compares against the last injected header to determine if a sync is necessary
 * @param tone - The tone to check
 * @param language - The language to check
 * @returns True if the header needs updating, false if it's already current
 */
export function needsHeaderUpdate(tone: string, language: string): boolean {
  if (!lastInjectedHeader) {
    return true;
  }

  const validatedTone: AgentTone = isValidTone(tone) ? tone : 'friendly';
  const validatedLanguage: SupportedLanguage = isValidLanguage(language) ? language : 'en';

  return lastInjectedHeader.tone !== validatedTone || lastInjectedHeader.language !== validatedLanguage;
}

/**
 * Clears the internal header cache
 * Useful for forcing a fresh sync or resetting the sync state
 * Should be called when switching between different contexts or users
 */
export function clearHeaderCache(): void {
  lastInjectedHeader = null;
}

/**
 * Retrieves synchronization statistics for monitoring and debugging
 * Provides insight into the sync service's current state and usage
 * @returns Object containing sync statistics
 */
export function getSyncStats(): {
  /** The last header that was injected */
  lastHeader: string | null;
  /** Timestamp of the last update */
  lastUpdate: number | null;
  /** Total number of headers injected (simplified counter) */
  totalInjected: number;
} {
  return {
    lastHeader: lastInjectedHeader?.header || null,
    lastUpdate: lastInjectedHeader?.timestamp || null,
    totalInjected: lastInjectedHeader ? 1 : 0 // Simplified for now
  };
}

/**
 * Formats an existing prompt with a header based on tone and language
 * This is a convenience function that combines sync and injection
 * @param prompt - The original prompt text
 * @param tone - The tone to use for header generation
 * @param language - The language to use for header generation
 * @returns The prompt with the appropriate header injected
 */
export function formatPromptWithHeader(prompt: string, tone: string, language: string): string {
  const result = syncPromptBehavior(tone, language);
  return injectHeaderIntoPrompt(prompt, result.header);
}

/**
 * Debug utility that logs the current state of the prompt sync system
 * Useful for troubleshooting and development
 * Outputs to console with grouped information about:
 * - Last injected header
 * - PromptBuilder configuration
 * - Sync statistics
 */
export function debugPromptSync(): void {
  console.group('Prompt Behavior Sync Debug');
  console.log('Last Injected Header:', lastInjectedHeader);
  console.log('PromptBuilder Config:', promptBuilder.getCurrentConfig());
  console.log('Sync Stats:', getSyncStats());
  console.groupEnd();
}

// Export validation functions for external use
export { isValidTone, isValidLanguage, generateHeaderString }; 