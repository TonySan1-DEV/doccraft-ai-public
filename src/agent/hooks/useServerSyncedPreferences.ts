// MCP Context Block
/*
{
  file: "useServerSyncedPreferences.ts",
  role: "frontend-developer",
  allowedActions: ["sync", "fetch", "manage"],
  tier: "Pro",
  contentSensitivity: "medium",
  theme: "agent_persistence"
}
*/

import { useState, useEffect, useCallback, useRef } from 'react';
import { AgentPrefs } from '../../types/agentPreferences';
import {
  fetchPreferencesFromServer,
  syncPreferencesToServer,
  fetchAdminDefaults,
  mergePreferences,
  hasServerPreferences
} from '../persistence/preferencesAPI';

export interface ServerSyncState {
  isSyncing: boolean;
  syncError: string | null;
  hasServerPrefs: boolean;
  lastSyncTime: number | null;
  syncAttempts: number;
}

export interface UseServerSyncedPreferencesReturn {
  // State
  preferences: AgentPrefs | null;
  syncState: ServerSyncState;
  
  // Actions
  syncToServer: (prefs: AgentPrefs) => Promise<boolean>;
  refreshFromServer: () => Promise<void>;
  clearSyncError: () => void;
  
  // Utilities
  isLoading: boolean;
  hasError: boolean;
}

/**
 * Hook for managing server-synced preferences
 * Handles loading, syncing, error states, and automatic retries
 */
export function useServerSyncedPreferences(
  initialPrefs: AgentPrefs,
  options: {
    autoSync?: boolean;
    retryOnError?: boolean;
    syncInterval?: number; // milliseconds
  } = {}
): UseServerSyncedPreferencesReturn {
  const {
    autoSync = true,
    retryOnError = true,
    syncInterval = 30000 // 30 seconds
  } = options;

  // State
  const [preferences, setPreferences] = useState<AgentPrefs | null>(null);
  const [syncState, setSyncState] = useState<ServerSyncState>({
    isSyncing: false,
    syncError: null,
    hasServerPrefs: false,
    lastSyncTime: null,
    syncAttempts: 0
  });

  // Refs for cleanup and tracking
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  // Clear sync error
  const clearSyncError = useCallback(() => {
    setSyncState(prev => ({ ...prev, syncError: null }));
  }, []);

  // Fetch preferences from server
  const fetchFromServer = useCallback(async (): Promise<void> => {
    if (!mountedRef.current) return;

    setSyncState(prev => ({ ...prev, isSyncing: true, syncError: null }));

    try {
      // Check if user has server preferences
      const hasServer = await hasServerPreferences();
      
      if (hasServer) {
        // Try to fetch user preferences
        const serverPrefs = await fetchPreferencesFromServer();
        
        if (serverPrefs) {
          const mergedPrefs = mergePreferences(serverPrefs, initialPrefs);
          setPreferences(mergedPrefs);
          setSyncState(prev => ({
            ...prev,
            isSyncing: false,
            hasServerPrefs: true,
            lastSyncTime: Date.now(),
            syncAttempts: prev.syncAttempts + 1
          }));
          return;
        }
      }

      // Fallback to admin defaults
      const adminDefaults = await fetchAdminDefaults();
      if (adminDefaults) {
        const mergedPrefs = mergePreferences(adminDefaults, initialPrefs);
        setPreferences(mergedPrefs);
        setSyncState(prev => ({
          ...prev,
          isSyncing: false,
          hasServerPrefs: false,
          lastSyncTime: Date.now(),
          syncAttempts: prev.syncAttempts + 1
        }));
        return;
      }

      // Final fallback to initial preferences
      setPreferences(initialPrefs);
      setSyncState(prev => ({
        ...prev,
        isSyncing: false,
        hasServerPrefs: false,
        lastSyncTime: null,
        syncAttempts: prev.syncAttempts + 1
      }));

    } catch (error) {
      if (!mountedRef.current) return;

      console.error('[useServerSyncedPreferences] Fetch error:', error);
      setSyncState(prev => ({
        ...prev,
        isSyncing: false,
        syncError: error instanceof Error ? error.message : 'Failed to fetch preferences',
        syncAttempts: prev.syncAttempts + 1
      }));

      // Set initial preferences as fallback
      setPreferences(initialPrefs);
    }
  }, [initialPrefs]);

  // Sync preferences to server
  const syncToServer = useCallback(async (prefs: AgentPrefs): Promise<boolean> => {
    if (!mountedRef.current) return false;

    setSyncState(prev => ({ ...prev, isSyncing: true, syncError: null }));

    try {
      const success = await syncPreferencesToServer(prefs);
      
      if (success) {
        setSyncState(prev => ({
          ...prev,
          isSyncing: false,
          lastSyncTime: Date.now(),
          syncAttempts: prev.syncAttempts + 1
        }));
        return true;
      } else {
        setSyncState(prev => ({
          ...prev,
          isSyncing: false,
          syncError: 'Failed to sync preferences to server',
          syncAttempts: prev.syncAttempts + 1
        }));
        return false;
      }
    } catch (error) {
      if (!mountedRef.current) return false;

      console.error('[useServerSyncedPreferences] Sync error:', error);
      setSyncState(prev => ({
        ...prev,
        isSyncing: false,
        syncError: error instanceof Error ? error.message : 'Sync failed',
        syncAttempts: prev.syncAttempts + 1
      }));
      return false;
    }
  }, []);

  // Refresh preferences from server
  const refreshFromServer = useCallback(async (): Promise<void> => {
    await fetchFromServer();
  }, [fetchFromServer]);

  // Auto-sync functionality
  useEffect(() => {
    if (!autoSync || !preferences) return;

    const scheduleSync = () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }

      syncTimeoutRef.current = setTimeout(async () => {
        if (mountedRef.current && preferences) {
          await syncToServer(preferences);
        }
      }, syncInterval);
    };

    scheduleSync();

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [autoSync, preferences, syncInterval, syncToServer]);

  // Initial load
  useEffect(() => {
    fetchFromServer();

    return () => {
      mountedRef.current = false;
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [fetchFromServer]);

  // Retry on error
  useEffect(() => {
    if (retryOnError && syncState.syncError && syncState.syncAttempts < 3) {
      const retryTimeout = setTimeout(() => {
        if (mountedRef.current) {
          fetchFromServer();
        }
      }, Math.pow(2, syncState.syncAttempts) * 1000); // Exponential backoff

      return () => clearTimeout(retryTimeout);
    }
  }, [retryOnError, syncState.syncError, syncState.syncAttempts, fetchFromServer]);

  return {
    preferences,
    syncState,
    syncToServer,
    refreshFromServer,
    clearSyncError,
    isLoading: syncState.isSyncing,
    hasError: !!syncState.syncError
  };
}

/**
 * Simplified hook for basic server sync
 */
export function useSimpleServerSync(initialPrefs: AgentPrefs) {
  const [prefs, setPrefs] = useState<AgentPrefs>(initialPrefs);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadPrefs = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const serverPrefs = await fetchPreferencesFromServer();
        if (serverPrefs && mounted) {
          setPrefs(mergePreferences(serverPrefs, initialPrefs));
        } else if (mounted) {
          setPrefs(initialPrefs);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load preferences');
          setPrefs(initialPrefs);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadPrefs();

    return () => {
      mounted = false;
    };
  }, [initialPrefs]);

  const updatePrefs = useCallback(async (newPrefs: AgentPrefs) => {
    setPrefs(newPrefs);
    
    try {
      await syncPreferencesToServer(newPrefs);
    } catch (err) {
      console.error('Failed to sync preferences:', err);
      // Continue with local update even if sync fails
    }
  }, []);

  return {
    preferences: prefs,
    updatePreferences: updatePrefs,
    isLoading,
    error
  };
} 