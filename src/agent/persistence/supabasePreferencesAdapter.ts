// MCP Context Block
/*
{
  file: "supabasePreferencesAdapter.ts",
  role: "backend-developer",
  allowedActions: ["sync", "fetch", "persist"],
  tier: "Pro",
  contentSensitivity: "medium",
  theme: "data_persistence"
}
*/

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AgentPrefs, SupportedLanguage } from '../../types/agentPreferences';

// Supabase configuration
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

// Initialize Supabase client
const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Database schema for user_preferences table
interface UserPreferencesRow {
  user_id: string;
  tone: 'friendly' | 'formal' | 'concise';
  language: string;
  copilot_enabled: boolean;
  memory_enabled: boolean;
  default_command_view: 'list' | 'grid';
  locked_fields: string[];
  created_at: string;
  updated_at: string;
}

// Validation schema for preferences
const PREFERENCES_SCHEMA = {
  tone: ['friendly', 'formal', 'concise'],
  language: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh'],
  copilotEnabled: 'boolean',
  memoryEnabled: 'boolean',
  defaultCommandView: ['list', 'grid']
} as const;

/**
 * Validates preference data against schema
 */
function validatePreferences(data: any): AgentPrefs | null {
  try {
    // Check required fields
    if (!data || typeof data !== 'object') return null;

    const validated: AgentPrefs = {
      tone: PREFERENCES_SCHEMA.tone.includes(data.tone) ? data.tone : 'friendly',
      language: PREFERENCES_SCHEMA.language.includes(data.language) ? data.language : 'en',
      copilotEnabled: typeof data.copilot_enabled === 'boolean' ? data.copilot_enabled : true,
      memoryEnabled: typeof data.memory_enabled === 'boolean' ? data.memory_enabled : true,
      defaultCommandView: PREFERENCES_SCHEMA.defaultCommandView.includes(data.default_command_view) 
        ? data.default_command_view : 'list',
      lockedFields: Array.isArray(data.locked_fields) ? data.locked_fields : []
    };

    return validated;
  } catch (error) {
    console.error('[SupabaseAdapter] Validation error:', error);
    return null;
  }
}

/**
 * Converts AgentPrefs to database row format
 */
function preferencesToRow(prefs: AgentPrefs, userId: string): UserPreferencesRow {
  return {
    user_id: userId,
    tone: prefs.tone,
    language: prefs.language,
    copilot_enabled: prefs.copilotEnabled,
    memory_enabled: prefs.memoryEnabled,
    default_command_view: prefs.defaultCommandView,
    locked_fields: prefs.lockedFields,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

/**
 * Converts database row to AgentPrefs format
 */
function rowToPreferences(row: UserPreferencesRow): AgentPrefs {
  // Validate language value
  const validLanguages: SupportedLanguage[] = ['en', 'es', 'fr', 'de', 'ja', 'zh', 'ko'];
  const language = validLanguages.includes(row.language as SupportedLanguage) 
    ? row.language as SupportedLanguage 
    : 'en' as const;

  return {
    tone: row.tone,
    language,
    copilotEnabled: row.copilot_enabled,
    memoryEnabled: row.memory_enabled,
    defaultCommandView: row.default_command_view,
    lockedFields: row.locked_fields
  };
}

/**
 * Fetches user preferences from Supabase
 */
export async function fetchPreferencesFromSupabase(userId: string): Promise<AgentPrefs | null> {
  try {
    // Validate user ID
    if (!userId || typeof userId !== 'string') {
      console.warn('[SupabaseAdapter] Invalid user ID provided');
      return null;
    }

    // Query user preferences
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found - this is normal for new users
        console.log('[SupabaseAdapter] No preferences found for user:', userId);
        return null;
      }
      throw error;
    }

    // Validate and return preferences
    const validatedPrefs = validatePreferences(data);
    if (validatedPrefs) {
      console.log('[SupabaseAdapter] Successfully fetched preferences for user:', userId);
      return validatedPrefs;
    } else {
      console.error('[SupabaseAdapter] Invalid preference data received:', data);
      return null;
    }

  } catch (error) {
    console.error('[SupabaseAdapter] Fetch error:', error);
    
    // Log telemetry if available
    if (typeof window !== 'undefined' && (window as any).logTelemetryEvent) {
      (window as any).logTelemetryEvent('preferences_fetch_supabase_error', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    return null;
  }
}

/**
 * Syncs user preferences to Supabase
 */
export async function syncPreferencesToSupabase(userId: string, prefs: AgentPrefs): Promise<void> {
  try {
    // Validate inputs
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid user ID provided');
    }

    if (!prefs || typeof prefs !== 'object') {
      throw new Error('Invalid preferences object provided');
    }

    // Validate preferences against schema
    const validatedPrefs = validatePreferences(prefs);
    if (!validatedPrefs) {
      throw new Error('Preferences failed validation');
    }

    // Convert to database format
    const row = preferencesToRow(validatedPrefs, userId);

    // Upsert preferences (insert or update)
    const { error } = await supabase
      .from('user_preferences')
      .upsert(row, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      });

    if (error) {
      throw error;
    }

    console.log('[SupabaseAdapter] Successfully synced preferences for user:', userId);
    
    // Log telemetry if available
    if (typeof window !== 'undefined' && (window as any).logTelemetryEvent) {
      (window as any).logTelemetryEvent('preferences_sync_supabase_success', {
        userId,
        fields: Object.keys(validatedPrefs)
      });
    }

  } catch (error) {
    console.error('[SupabaseAdapter] Sync error:', error);
    
    // Log telemetry if available
    if (typeof window !== 'undefined' && (window as any).logTelemetryEvent) {
      (window as any).logTelemetryEvent('preferences_sync_supabase_error', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    throw error;
  }
}

/**
 * Deletes user preferences from Supabase
 */
export async function deletePreferencesFromSupabase(userId: string): Promise<void> {
  try {
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid user ID provided');
    }

    const { error } = await supabase
      .from('user_preferences')
      .delete()
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    console.log('[SupabaseAdapter] Successfully deleted preferences for user:', userId);

  } catch (error) {
    console.error('[SupabaseAdapter] Delete error:', error);
    throw error;
  }
}

/**
 * Checks if user has preferences in Supabase
 */
export async function hasPreferencesInSupabase(userId: string): Promise<boolean> {
  try {
    if (!userId || typeof userId !== 'string') {
      return false;
    }

    const { data, error } = await supabase
      .from('user_preferences')
      .select('user_id')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return false; // No preferences found
      }
      throw error;
    }

    return !!data;

  } catch (error) {
    console.error('[SupabaseAdapter] Has preferences check error:', error);
    return false;
  }
}

/**
 * Gets the current authenticated user ID from Supabase auth
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('[SupabaseAdapter] Auth error:', error);
      return null;
    }

    return user?.id || null;

  } catch (error) {
    console.error('[SupabaseAdapter] Get current user error:', error);
    return null;
  }
}

/**
 * Utility function to fetch preferences for current user
 */
export async function fetchCurrentUserPreferences(): Promise<AgentPrefs | null> {
  const userId = await getCurrentUserId();
  if (!userId) {
    console.warn('[SupabaseAdapter] No authenticated user found');
    return null;
  }

  return fetchPreferencesFromSupabase(userId);
}

/**
 * Utility function to sync preferences for current user
 */
export async function syncCurrentUserPreferences(prefs: AgentPrefs): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('No authenticated user found');
  }

  return syncPreferencesToSupabase(userId, prefs);
}

// Export types for external use
export type { UserPreferencesRow };
export { validatePreferences, preferencesToRow, rowToPreferences }; 