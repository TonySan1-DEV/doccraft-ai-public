// MCP Context Block
/*
{
  file: "AgentPreferencesContext.tsx",
  role: "frontend-developer",
  allowedActions: ["context", "preferences", "security"],
  tier: "Pro",
  contentSensitivity: "low",
  theme: "agent_preferences"
}
*/

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useState,
} from 'react';
import { AgentPrefs } from '../types/agentPreferences';
import { loadInitialPrefs } from '../utils/loadInitialPrefs';
import { useMCP } from '../useMCP';
import {
  preferenceVersionService,
  PreferenceVersion,
  CreateVersionOptions,
} from '../services/preferenceVersionService';
import {
  SystemMode,
  ModeConfiguration,
  ModeTransitionPreferences,
} from '../types/systemModes';

// Default preference values
const DEFAULT_PREFERENCES: AgentPrefs = {
  tone: 'friendly',
  language: 'en',
  copilotEnabled: true,
  memoryEnabled: true,
  defaultCommandView: 'list',
  lockedFields: [],

  // === UNIFIED MODE SYSTEM DEFAULTS ===
  systemMode: 'HYBRID',
  modeConfiguration: {
    mode: 'HYBRID',
    aiInitiativeLevel: 'RESPONSIVE',
    suggestionFrequency: 'CONTEXTUAL',
    userControlLevel: 70,
    interventionStyle: 'GENTLE',
    autoEnhancement: true,
    realTimeAnalysis: true,
    proactiveSuggestions: true,
  },
  modeCustomizations: {
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
  },
  autoModeSwitch: false,
  modeTransitionPreferences: {
    preserveSettings: true,
    adaptToContext: true,
    showTransitionGuide: true,
    rememberPerDocumentType: false,
  },

  // === ENHANCED MODE CONTROLLER ===
  hasSeenModeOnboarding: false,
  writingStyle: 'collaborative',
  collaborationLevel: 'medium',
};

// Context interface
interface AgentPreferencesContextType {
  preferences: AgentPrefs;
  updatePreferences: (
    updates: Partial<AgentPrefs>,
    options?: CreateVersionOptions
  ) => Promise<boolean>;
  resetToDefaults: () => Promise<void>;
  isFieldLocked: (field: keyof AgentPrefs) => boolean;
  onPreferencesChange?: () => void;
  // Version management
  createVersion: (
    options?: CreateVersionOptions
  ) => Promise<PreferenceVersion | null>;
  getCurrentVersion: () => Promise<PreferenceVersion | null>;
  getVersionHistory: () => Promise<PreferenceVersion[]>;
  restoreVersion: (
    versionId: string,
    options?: CreateVersionOptions
  ) => Promise<boolean>;
  deleteVersion: (versionId: string) => Promise<boolean>;
  updateVersionLabel: (versionId: string, label: string) => Promise<boolean>;
  // Version state
  versionHistory: PreferenceVersion[];
  isLoadingVersions: boolean;
  currentVersion: PreferenceVersion | null;
}

// Create context
const AgentPreferencesContext = createContext<
  AgentPreferencesContextType | undefined
>(undefined);

// Action types for reducer
type PreferenceAction =
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<AgentPrefs> }
  | { type: 'RESET_PREFERENCES' }
  | { type: 'SET_LOCKED_FIELDS'; payload: string[] };

// Reducer for managing preference state
function preferencesReducer(
  state: AgentPrefs,
  action: PreferenceAction
): AgentPrefs {
  switch (action.type) {
    case 'UPDATE_PREFERENCES':
      return {
        ...state,
        ...action.payload,
        // Preserve locked fields
        lockedFields: state.lockedFields,
      };
    case 'RESET_PREFERENCES':
      return DEFAULT_PREFERENCES;
    case 'SET_LOCKED_FIELDS':
      return {
        ...state,
        lockedFields: action.payload,
      };
    default:
      return state;
  }
}

// Provider component
interface AgentPreferencesProviderProps {
  children: React.ReactNode;
  onPreferencesChange?: () => void;
  initialPrefs?: Partial<AgentPrefs>;
}

export function AgentPreferencesProvider({
  children,
  onPreferencesChange,
  initialPrefs,
}: AgentPreferencesProviderProps) {
  const mcp = useMCP('AgentPreferencesContext.tsx');
  const [preferences, dispatch] = useReducer(
    preferencesReducer,
    DEFAULT_PREFERENCES
  );

  // Version management state
  const [versionHistory, setVersionHistory] = useState<PreferenceVersion[]>([]);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);
  const [currentVersion, setCurrentVersion] =
    useState<PreferenceVersion | null>(null);

  // Load initial preferences on mount
  useEffect(() => {
    const loadPrefs = async () => {
      try {
        const initialPreferences = await loadInitialPrefs(initialPrefs);
        dispatch({ type: 'UPDATE_PREFERENCES', payload: initialPreferences });
      } catch (error) {
        console.warn('Failed to load agent preferences:', error);
        // Fall back to defaults
      }
    };

    loadPrefs();
  }, [initialPrefs]);

  // Load version history on mount
  useEffect(() => {
    const loadVersionHistory = async () => {
      setIsLoadingVersions(true);
      try {
        const history = await preferenceVersionService.getVersionHistory();
        setVersionHistory(history);

        const current = await preferenceVersionService.getCurrentVersion();
        setCurrentVersion(current);
      } catch (error) {
        console.warn('Failed to load version history:', error);
      } finally {
        setIsLoadingVersions(false);
      }
    };

    loadVersionHistory();
  }, []);

  // Check if user can update preferences
  const canUpdatePreferences = useCallback(() => {
    return mcp.allowedActions.includes('updatePrefs');
  }, [mcp.allowedActions]);

  // Secure preference update function with versioning
  const updatePreferences = useCallback(
    async (
      updates: Partial<AgentPrefs>,
      options: CreateVersionOptions = {}
    ): Promise<boolean> => {
      if (!canUpdatePreferences()) {
        console.warn('Agent preference update blocked by MCP policy');
        return false;
      }

      try {
        // Filter out locked fields
        const unlockedUpdates = Object.entries(updates).reduce(
          (acc, [key, value]) => {
            if (mcp.allowedActions.includes('updatePrefs')) {
              acc[key as keyof AgentPrefs] = value as any;
            }
            return acc;
          },
          {} as Partial<AgentPrefs>
        );

        if (Object.keys(unlockedUpdates).length === 0) {
          console.warn(
            'All requested preference fields are locked by admin policy'
          );
          return false;
        }

        // Update state
        const updatedPrefs = { ...preferences, ...unlockedUpdates };
        dispatch({ type: 'UPDATE_PREFERENCES', payload: unlockedUpdates });

        // Persist to localStorage
        localStorage.setItem('agentPreferences', JSON.stringify(updatedPrefs));

        // Create version if options provided
        if (options.label || options.reason) {
          await preferenceVersionService.createVersion(updatedPrefs, options);

          // Refresh version history
          const history = await preferenceVersionService.getVersionHistory();
          setVersionHistory(history);

          const current = await preferenceVersionService.getCurrentVersion();
          setCurrentVersion(current);
        }

        // Log telemetry if available
        if (window.logTelemetryEvent) {
          window.logTelemetryEvent('agent_pref_changed', {
            updatedFields: Object.keys(unlockedUpdates),
            timestamp: Date.now(),
            userTier: mcp.tier,
            versionCreated: !!(options.label || options.reason),
          });
        }

        // Call change listener
        onPreferencesChange?.();

        return true;
      } catch (error) {
        console.error('Failed to update agent preferences:', error);
        return false;
      }
    },
    [preferences, canUpdatePreferences, onPreferencesChange, mcp.tier]
  );

  // Reset to defaults
  const resetToDefaults = useCallback(async () => {
    if (!canUpdatePreferences()) {
      console.warn('Agent preference reset blocked by MCP policy');
      return;
    }

    try {
      dispatch({ type: 'RESET_PREFERENCES' });
      localStorage.removeItem('agentPreferences');

      // Create version for reset
      await preferenceVersionService.createVersion(DEFAULT_PREFERENCES, {
        label: 'Reset to Defaults',
        reason: 'User reset preferences to defaults',
      });

      // Refresh version history
      const history = await preferenceVersionService.getVersionHistory();
      setVersionHistory(history);

      const current = await preferenceVersionService.getCurrentVersion();
      setCurrentVersion(current);

      // Log telemetry
      if (window.logTelemetryEvent) {
        window.logTelemetryEvent('agent_pref_reset', {
          timestamp: Date.now(),
          userTier: mcp.tier,
        });
      }

      onPreferencesChange?.();
    } catch (error) {
      console.error('Failed to reset agent preferences:', error);
    }
  }, [canUpdatePreferences, onPreferencesChange, mcp.tier]);

  // Check if field is locked by admin policy
  const isFieldLocked = useCallback(
    (field: keyof AgentPrefs): boolean => {
      return preferences.lockedFields.includes(field);
    },
    [preferences.lockedFields]
  );

  // Version management functions
  const createVersion = useCallback(
    async (
      options?: CreateVersionOptions
    ): Promise<PreferenceVersion | null> => {
      try {
        const version = await preferenceVersionService.createVersion(
          preferences,
          options
        );
        if (version) {
          // Refresh version history
          const history = await preferenceVersionService.getVersionHistory();
          setVersionHistory(history);
          setCurrentVersion(version);
        }
        return version;
      } catch (error) {
        console.error('Failed to create version:', error);
        return null;
      }
    },
    [preferences]
  );

  const getCurrentVersion =
    useCallback(async (): Promise<PreferenceVersion | null> => {
      try {
        const version = await preferenceVersionService.getCurrentVersion();
        setCurrentVersion(version);
        return version;
      } catch (error) {
        console.error('Failed to get current version:', error);
        return null;
      }
    }, []);

  const getVersionHistory = useCallback(async (): Promise<
    PreferenceVersion[]
  > => {
    try {
      const history = await preferenceVersionService.getVersionHistory();
      setVersionHistory(history);
      return history;
    } catch (error) {
      console.error('Failed to get version history:', error);
      return [];
    }
  }, []);

  const restoreVersion = useCallback(
    async (versionId: string): Promise<boolean> => {
      try {
        const restoredPrefs =
          await preferenceVersionService.restoreVersion(versionId);
        if (restoredPrefs) {
          // Update local state with restored preferences
          dispatch({ type: 'UPDATE_PREFERENCES', payload: restoredPrefs });
          localStorage.setItem(
            'agentPreferences',
            JSON.stringify(restoredPrefs)
          );

          // Refresh version history
          const history = await preferenceVersionService.getVersionHistory();
          setVersionHistory(history);

          const current = await preferenceVersionService.getCurrentVersion();
          setCurrentVersion(current);

          // Call change listener
          onPreferencesChange?.();

          return true;
        }
        return false;
      } catch (error) {
        console.error('Failed to restore version:', error);
        return false;
      }
    },
    [onPreferencesChange]
  );

  const deleteVersion = useCallback(
    async (versionId: string): Promise<boolean> => {
      try {
        const success = await preferenceVersionService.deleteVersion(versionId);
        if (success) {
          // Refresh version history
          const history = await preferenceVersionService.getVersionHistory();
          setVersionHistory(history);
        }
        return success;
      } catch (error) {
        console.error('Failed to delete version:', error);
        return false;
      }
    },
    []
  );

  const updateVersionLabel = useCallback(
    async (versionId: string, label: string): Promise<boolean> => {
      try {
        const success = await preferenceVersionService.updateVersionLabel(
          versionId,
          label
        );
        if (success) {
          // Refresh version history
          const history = await preferenceVersionService.getVersionHistory();
          setVersionHistory(history);
        }
        return success;
      } catch (error) {
        console.error('Failed to update version label:', error);
        return false;
      }
    },
    []
  );

  const contextValue: AgentPreferencesContextType = {
    preferences,
    updatePreferences,
    resetToDefaults,
    isFieldLocked,
    onPreferencesChange,
    // Version management
    createVersion,
    getCurrentVersion,
    getVersionHistory,
    restoreVersion,
    deleteVersion,
    updateVersionLabel,
    // Version state
    versionHistory,
    isLoadingVersions,
    currentVersion,
  };

  return (
    <AgentPreferencesContext.Provider value={contextValue}>
      {children}
    </AgentPreferencesContext.Provider>
  );
}

// Hook for consuming components
export function useAgentPreferences() {
  const context = useContext(AgentPreferencesContext);
  if (context === undefined) {
    throw new Error(
      'useAgentPreferences must be used within an AgentPreferencesProvider'
    );
  }
  return context;
}

// Future server sync utility (stub for now)
export async function syncToServer(
  _updatedPrefs: AgentPrefs
): Promise<boolean> {
  try {
    // TODO: Implement server sync
    // const response = await fetch('/api/agent/preferences', {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(updatedPrefs)
    // });
    // return response.ok;

    console.log('Server sync not yet implemented');
    return true; // Stub success
  } catch (error) {
    console.error('Failed to sync preferences to server:', error);
    return false;
  }
}
