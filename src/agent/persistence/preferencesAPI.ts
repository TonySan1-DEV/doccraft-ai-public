// MCP Context Block
/*
{
  file: "preferencesAPI.ts",
  role: "backend-developer",
  allowedActions: ["sync", "fetch", "persist"],
  tier: "Pro",
  contentSensitivity: "medium",
  theme: "agent_persistence"
}
*/

import { AgentPrefs } from '../../types/agentPreferences';
import { useMCP } from '../../useMCP';

// API configuration
const API_CONFIG = {
  baseUrl: process.env.REACT_APP_API_BASE_URL || '/api',
  endpoints: {
    preferences: '/user/preferences',
    adminDefaults: '/admin/defaults'
  },
  timeout: 10000, // 10 seconds
  retryAttempts: 3
};

// Response validation schema
const PREFERENCES_SCHEMA = {
  tone: ['friendly', 'formal', 'concise'],
  language: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh'],
  copilotEnabled: 'boolean',
  memoryEnabled: 'boolean',
  defaultCommandView: ['list', 'grid']
};

// Validation utilities
function validatePreferences(data: any): AgentPrefs | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  try {
    // Validate tone
    if (!PREFERENCES_SCHEMA.tone.includes(data.tone)) {
      data.tone = 'friendly'; // Default fallback
    }

    // Validate language
    if (!PREFERENCES_SCHEMA.language.includes(data.language)) {
      data.language = 'en'; // Default fallback
    }

    // Validate booleans
    if (typeof data.copilotEnabled !== 'boolean') {
      data.copilotEnabled = true;
    }
    if (typeof data.memoryEnabled !== 'boolean') {
      data.memoryEnabled = true;
    }

    // Validate command view
    if (!PREFERENCES_SCHEMA.defaultCommandView.includes(data.defaultCommandView)) {
      data.defaultCommandView = 'list';
    }

    // Ensure lockedFields is an array
    if (!Array.isArray(data.lockedFields)) {
      data.lockedFields = [];
    }

    return data as AgentPrefs;
  } catch (error) {
    console.error('[PreferencesAPI] Validation error:', error);
    return null;
  }
}

// Authentication utilities
async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  try {
    // Get MCP context for role-based headers
    const mcp = useMCP?.('preferencesAPI.ts') || { role: 'user', tier: 'Basic', allowedActions: [] };
    
    // Add MCP context to headers for server-side validation
    headers['X-MCP-Role'] = mcp.role;
    headers['X-MCP-Tier'] = mcp.tier || 'Basic';
    headers['X-MCP-Actions'] = mcp.allowedActions.join(',');
    
    // Add session token if available
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('sessionToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  } catch (error) {
    console.warn('[PreferencesAPI] Auth header error:', error);
    return headers;
  }
}

// Telemetry logging
function logTelemetryEvent(event: string, data: any): void {
  if (typeof window !== 'undefined' && (window as any).logTelemetryEvent) {
    (window as any).logTelemetryEvent(event, {
      ...data,
      timestamp: Date.now(),
      source: 'preferencesAPI'
    });
  }
}

/**
 * Fetch user preferences from server
 * Returns null if unauthorized, failed, or empty
 */
export async function fetchPreferencesFromServer(): Promise<AgentPrefs | null> {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.preferences}`, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(API_CONFIG.timeout)
    });

    if (!response.ok) {
      if (response.status === 401) {
        logTelemetryEvent('preferences_fetch_unauthorized', { status: response.status });
        return null; // Unauthorized - fallback to local
      }
      if (response.status === 404) {
        logTelemetryEvent('preferences_fetch_not_found', { status: response.status });
        return null; // No server prefs - fallback to local
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const validatedPrefs = validatePreferences(data);

    if (validatedPrefs) {
      logTelemetryEvent('preferences_fetch_success', {
        hasServerPrefs: true,
        prefsCount: Object.keys(validatedPrefs).length
      });
      return validatedPrefs;
    } else {
      logTelemetryEvent('preferences_fetch_invalid', { rawData: data });
      return null;
    }

  } catch (error) {
    console.error('[PreferencesAPI] Fetch error:', error);
    logTelemetryEvent('preferences_fetch_error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return null;
  }
}

/**
 * Sync preferences to server
 * Logs error but does not crash if sync fails
 */
export async function syncPreferencesToServer(updatedPrefs: AgentPrefs): Promise<boolean> {
  try {
    // Validate preferences before sending
    const validatedPrefs = validatePreferences(updatedPrefs);
    if (!validatedPrefs) {
      console.error('[PreferencesAPI] Invalid preferences for sync:', updatedPrefs);
      logTelemetryEvent('preferences_sync_invalid', { prefs: updatedPrefs });
      return false;
    }

    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.preferences}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(validatedPrefs),
      signal: AbortSignal.timeout(API_CONFIG.timeout)
    });

    if (!response.ok) {
      if (response.status === 401) {
        logTelemetryEvent('preferences_sync_unauthorized', { status: response.status });
        return false;
      }
      if (response.status === 403) {
        logTelemetryEvent('preferences_sync_forbidden', { status: response.status });
        return false;
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    logTelemetryEvent('preferences_sync_success', {
      syncedFields: Object.keys(validatedPrefs),
      serverResponse: result
    });

    return true;

  } catch (error) {
    console.error('[PreferencesAPI] Sync error:', error);
    logTelemetryEvent('preferences_sync_error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      prefs: updatedPrefs
    });
    return false;
  }
}

/**
 * Fetch admin default preferences
 * Used as fallback when user has no server preferences
 */
export async function fetchAdminDefaults(): Promise<AgentPrefs | null> {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.adminDefaults}`, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(API_CONFIG.timeout)
    });

    if (!response.ok) {
      console.warn('[PreferencesAPI] Admin defaults not available:', response.status);
      return null;
    }

    const data = await response.json();
    const validatedPrefs = validatePreferences(data);

    if (validatedPrefs) {
      logTelemetryEvent('admin_defaults_fetch_success', {
        hasDefaults: true,
        defaultFields: Object.keys(validatedPrefs)
      });
      return validatedPrefs;
    }

    return null;

  } catch (error) {
    console.error('[PreferencesAPI] Admin defaults error:', error);
    logTelemetryEvent('admin_defaults_fetch_error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return null;
  }
}

/**
 * Merge server preferences with local preferences
 * Server preferences take priority, but local prefs fill gaps
 */
export function mergePreferences(serverPrefs: AgentPrefs | null, localPrefs: AgentPrefs): AgentPrefs {
  if (!serverPrefs) {
    return localPrefs;
  }

  return {
    ...localPrefs,
    ...serverPrefs,
    // Ensure lockedFields from server are preserved
    lockedFields: serverPrefs.lockedFields || localPrefs.lockedFields
  };
}

/**
 * Check if user has server preferences
 * Used to determine sync strategy
 */
export async function hasServerPreferences(): Promise<boolean> {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.preferences}`, {
      method: 'HEAD',
      headers,
      signal: AbortSignal.timeout(5000) // Shorter timeout for HEAD
    });

    return response.ok;
  } catch (error) {
    console.warn('[PreferencesAPI] Server check failed:', error);
    return false;
  }
}

/**
 * Retry wrapper for network operations
 */
async function withRetry<T>(
  operation: () => Promise<T>,
  maxAttempts: number = API_CONFIG.retryAttempts
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxAttempts) {
        throw lastError;
      }

      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }

  throw lastError!;
}

/**
 * Enhanced fetch with retry logic
 */
export async function fetchPreferencesWithRetry(): Promise<AgentPrefs | null> {
  return withRetry(async () => {
    return await fetchPreferencesFromServer();
  });
}

/**
 * Enhanced sync with retry logic
 */
export async function syncPreferencesWithRetry(updatedPrefs: AgentPrefs): Promise<boolean> {
  return withRetry(async () => {
    return await syncPreferencesToServer(updatedPrefs);
  });
}

// Export configuration for testing
export { API_CONFIG, PREFERENCES_SCHEMA }; 