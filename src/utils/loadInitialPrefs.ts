// MCP Context Block
/*
{
  file: "loadInitialPrefs.ts",
  role: "utility-developer",
  allowedActions: ["load", "resolve", "fallback"],
  tier: "Pro",
  contentSensitivity: "low",
  theme: "agent_preferences"
}
*/

import {
  AgentPrefs,
  AgentDefaultPolicy,
  validatePreferences,
  SupportedLanguage,
  AgentTone,
  CommandViewMode,
} from '../types/agentPreferences';

// Default fallback values
const FALLBACK_PREFERENCES: AgentPrefs = {
  tone: 'friendly',
  language: 'en',
  copilotEnabled: true,
  memoryEnabled: true,
  defaultCommandView: 'list',
  lockedFields: [],
};

// Admin default policy (stub - would come from server)
const ADMIN_DEFAULT_POLICY: AgentDefaultPolicy = {
  defaultTone: 'friendly',
  defaultLanguage: 'en',
  defaultCopilotEnabled: true,
  defaultMemoryEnabled: true,
  defaultCommandView: 'list',
  lockedFields: [],
  policyReason: 'Default organization policy',
};

// Load preferences from localStorage
function loadFromLocalStorage(): Partial<AgentPrefs> | null {
  try {
    const stored = localStorage.getItem('agentPreferences');
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    const validation = validatePreferences(parsed);

    if (!validation.isValid) {
      console.warn('Invalid preferences in localStorage:', validation.errors);
      localStorage.removeItem('agentPreferences'); // Clean up invalid data
      return null;
    }

    return parsed;
  } catch (error) {
    console.warn('Failed to load preferences from localStorage:', error);
    return null;
  }
}

// Get admin default policy (stub for future server integration)
async function getAdminDefaultPolicy(): Promise<AgentDefaultPolicy> {
  try {
    // TODO: Fetch from server
    // const response = await fetch('/api/agent/default-policy');
    // if (response.ok) {
    //   return await response.json();
    // }

    return ADMIN_DEFAULT_POLICY;
  } catch (error) {
    console.warn('Failed to load admin default policy:', error);
    return ADMIN_DEFAULT_POLICY;
  }
}

// Detect browser language
function detectBrowserLanguage(): string {
  try {
    const browserLang = navigator.language || navigator.languages?.[0] || 'en';
    const langCode = browserLang.split('-')[0]; // Extract primary language code

    // Map to supported languages
    const supportedLanguages = ['en', 'es', 'fr', 'de', 'ja', 'zh', 'ko'];
    if (supportedLanguages.includes(langCode)) {
      return langCode;
    }

    return 'en'; // Default fallback
  } catch (error) {
    console.warn('Failed to detect browser language:', error);
    return 'en';
  }
}

// Resolve language preference with fallback
function resolveLanguage(
  userLanguage?: string,
  adminLanguage?: string,
  browserLanguage?: string
): string {
  if (
    userLanguage &&
    validatePreferences({ language: userLanguage as SupportedLanguage }).isValid
  ) {
    return userLanguage;
  }

  if (
    adminLanguage &&
    validatePreferences({ language: adminLanguage as SupportedLanguage })
      .isValid
  ) {
    return adminLanguage;
  }

  if (
    browserLanguage &&
    validatePreferences({ language: browserLanguage as SupportedLanguage })
      .isValid
  ) {
    return browserLanguage;
  }

  return 'en'; // Final fallback
}

// Main function to load initial preferences
export async function loadInitialPrefs(
  initialPrefs?: Partial<AgentPrefs>
): Promise<AgentPrefs> {
  try {
    // Priority 1: User-provided initial preferences
    if (initialPrefs) {
      const validation = validatePreferences(initialPrefs);
      if (validation.isValid) {
        return { ...FALLBACK_PREFERENCES, ...initialPrefs };
      } else {
        console.warn(
          'Invalid initial preferences provided:',
          validation.errors
        );
      }
    }

    // Priority 2: LocalStorage
    const localStoragePrefs = loadFromLocalStorage();
    if (localStoragePrefs) {
      return { ...FALLBACK_PREFERENCES, ...localStoragePrefs };
    }

    // Priority 3: Admin default policy
    const adminPolicy = await getAdminDefaultPolicy();
    const adminPrefs: Partial<AgentPrefs> = {
      tone: adminPolicy.defaultTone,
      language: adminPolicy.defaultLanguage,
      copilotEnabled: adminPolicy.defaultCopilotEnabled,
      memoryEnabled: adminPolicy.defaultMemoryEnabled,
      defaultCommandView: adminPolicy.defaultCommandView,
      lockedFields: adminPolicy.lockedFields,
    };

    // Resolve language with browser detection
    const browserLanguage = detectBrowserLanguage();
    const resolvedLanguage = resolveLanguage(
      undefined, // No user language yet
      adminPolicy.defaultLanguage,
      browserLanguage
    );

    const resolvedPrefs: AgentPrefs = {
      ...FALLBACK_PREFERENCES,
      ...adminPrefs,
      language: resolvedLanguage as SupportedLanguage,
    };

    return resolvedPrefs;
  } catch (error) {
    console.error('Failed to load initial preferences:', error);

    // Final fallback with browser language detection
    const browserLanguage = detectBrowserLanguage();
    return {
      ...FALLBACK_PREFERENCES,
      language: browserLanguage as SupportedLanguage,
    };
  }
}

// Utility to merge preferences with validation
export function mergePreferences(
  base: AgentPrefs,
  updates: Partial<AgentPrefs>
): AgentPrefs {
  const merged = { ...base, ...updates };
  const validation = validatePreferences(merged);

  if (!validation.isValid) {
    console.warn('Invalid merged preferences:', validation.errors);
    return base; // Return original if merge is invalid
  }

  return merged;
}

// Utility to check if preferences need migration
export function needsMigration(prefs: AgentPrefs): boolean {
  // Check for old preference format or missing fields
  const requiredFields: (keyof AgentPrefs)[] = [
    'tone',
    'language',
    'copilotEnabled',
    'memoryEnabled',
    'defaultCommandView',
    'lockedFields',
  ];

  return requiredFields.some(field => !(field in prefs));
}

// Migration utility for old preference formats
export function migratePreferences(
  oldPrefs: Record<string, unknown>
): AgentPrefs {
  const migrated: Partial<AgentPrefs> = {};

  // Map old field names to new ones if needed
  if (oldPrefs.agentTone) migrated.tone = oldPrefs.agentTone as AgentTone;
  if (oldPrefs.agentLanguage)
    migrated.language = oldPrefs.agentLanguage as SupportedLanguage;
  if (oldPrefs.autoSuggestions !== undefined)
    migrated.copilotEnabled = oldPrefs.autoSuggestions as boolean;
  if (oldPrefs.contextMemory !== undefined)
    migrated.memoryEnabled = oldPrefs.contextMemory as boolean;
  if (oldPrefs.commandDisplay)
    migrated.defaultCommandView = oldPrefs.commandDisplay as CommandViewMode;

  // Ensure all required fields are present
  return { ...FALLBACK_PREFERENCES, ...migrated };
}
