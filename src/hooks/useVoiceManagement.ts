// Advanced voice management hook with TypeScript features, state management, and error handling

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  VoiceId,
  VoiceConfig,
  VoiceSelectionState,
  VoiceSelectionError,
  VoiceSelectionResult,
  VoiceFilter,
  VoiceComparator,
  DEFAULT_VOICES,
} from '../types/voiceTypes';
import {
  validateVoiceConfig,
  createVoiceSelectionError,
} from '../utils/voiceValidation';

// ============================================================================
// HOOK STATE INTERFACES - Internal state management types
// ============================================================================

/**
 * Internal state for voice management
 */
interface VoiceManagementState extends VoiceSelectionState {
  readonly searchQuery: string;
  readonly sortBy: 'quality' | 'name' | 'language' | 'accent';
  readonly sortDirection: 'asc' | 'desc';
  readonly selectedCategory: string | null;
  readonly favorites: readonly VoiceId[];
  readonly recentlyUsed: readonly VoiceId[];
  readonly customFilters: readonly VoiceFilter[];
}

/**
 * Voice management actions and operations
 */
interface VoiceManagementActions {
  readonly selectVoice: (voiceId: VoiceId) => VoiceSelectionResult;
  readonly searchVoices: (query: string) => void;
  readonly sortVoices: (
    by: VoiceManagementState['sortBy'],
    direction?: 'asc' | 'desc'
  ) => void;
  readonly filterByCategory: (category: string | null) => void;
  readonly addCustomFilter: (filter: VoiceFilter) => void;
  readonly removeCustomFilter: (filterIndex: number) => void;
  readonly toggleFavorite: (voiceId: VoiceId) => void;
  readonly clearFilters: () => void;
  readonly resetToDefaults: () => void;
  readonly validateAndUpdateVoice: (
    voiceId: VoiceId,
    updates: Partial<VoiceConfig>
  ) => VoiceSelectionResult;
}

/**
 * Voice management hook return type
 */
interface UseVoiceManagementReturn
  extends VoiceManagementState,
    VoiceManagementActions {
  readonly isLoading: boolean;
  readonly error: VoiceSelectionError | null;
  readonly hasErrors: boolean;
  readonly hasWarnings: boolean;
  readonly totalVoices: number;
  readonly availableVoicesCount: number;
  readonly filteredVoicesCount: number;
  readonly getVoiceById: (voiceId: VoiceId) => VoiceConfig | undefined;
  readonly getVoiceMetadata: (
    voiceId: VoiceId
  ) => VoiceConfig['metadata'] | undefined;
  readonly isVoiceAvailable: (voiceId: VoiceId) => boolean;
  readonly isVoiceFavorite: (voiceId: VoiceId) => boolean;
  readonly getVoiceQuality: (voiceId: VoiceId) => number | undefined;
  readonly exportVoiceSelection: () => string;
  readonly importVoiceSelection: (data: string) => VoiceSelectionResult;
}

// ============================================================================
// UTILITY FUNCTIONS - Helper functions for voice operations
// ============================================================================

/**
 * Default voice comparator functions
 */
const voiceComparators: Record<
  VoiceManagementState['sortBy'],
  VoiceComparator
> = {
  quality: (a, b) => b.quality - a.quality,
  name: (a, b) => a.label.localeCompare(b.label),
  language: (a, b) => a.language.localeCompare(b.language),
  accent: (a, b) => a.accent.localeCompare(b.accent),
};

/**
 * Applies filters to voice list
 */
const applyFilters = (
  voices: readonly VoiceConfig[],
  searchQuery: string,
  category: string | null,
  customFilters: readonly VoiceFilter[]
): readonly VoiceConfig[] => {
  let filtered = voices;

  // Apply search filter
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(
      voice =>
        voice.label.toLowerCase().includes(query) ||
        voice.language.toLowerCase().includes(query) ||
        voice.accent.toLowerCase().includes(query)
    );
  }

  // Apply category filter
  if (category) {
    filtered = filtered.filter(voice => {
      // You can extend this with more sophisticated category logic
      return (
        voice.metadata.gender === category ||
        voice.metadata.ageRange === category ||
        voice.language.startsWith(category)
      );
    });
  }

  // Apply custom filters
  for (const filter of customFilters) {
    filtered = filtered.filter(filter);
  }

  return filtered;
};

/**
 * Sorts voices based on criteria and direction
 */
const sortVoices = (
  voices: readonly VoiceConfig[],
  sortBy: VoiceManagementState['sortBy'],
  direction: 'asc' | 'desc'
): readonly VoiceConfig[] => {
  const comparator = voiceComparators[sortBy];
  const sorted = [...voices].sort(comparator);

  return direction === 'desc' ? sorted.reverse() : sorted;
};

// ============================================================================
// MAIN HOOK IMPLEMENTATION - Core voice management logic
// ============================================================================

/**
 * Advanced voice management hook with comprehensive functionality
 */
export const useVoiceManagement = (
  initialVoices: readonly VoiceConfig[] = DEFAULT_VOICES,
  initialSelectedVoice?: VoiceId
): UseVoiceManagementReturn => {
  // ============================================================================
  // STATE MANAGEMENT - Core state variables
  // ============================================================================

  const [state, setState] = useState<VoiceManagementState>(() => {
    const defaultSelectedVoice = initialSelectedVoice || initialVoices[0]?.id;

    if (!defaultSelectedVoice) {
      throw new Error('No voices provided and no initial selection specified');
    }

    return {
      selectedVoice: defaultSelectedVoice,
      availableVoices: initialVoices,
      filteredVoices: initialVoices,
      isLoading: false,
      error: null,
      lastUpdated: Date.now(),
      searchQuery: '',
      sortBy: 'quality',
      sortDirection: 'desc',
      selectedCategory: null,
      favorites: [],
      recentlyUsed: [defaultSelectedVoice],
      customFilters: [],
    };
  });

  // Refs for performance optimization
  const voicesCache = useRef<Map<VoiceId, VoiceConfig>>(new Map());
  const filterCache = useRef<Map<string, readonly VoiceConfig[]>>(new Map());

  // ============================================================================
  // CACHE MANAGEMENT - Performance optimization
  // ============================================================================

  // Update cache when voices change
  useEffect(() => {
    voicesCache.current.clear();
    for (const voice of state.availableVoices) {
      voicesCache.current.set(voice.id, voice);
    }
  }, [state.availableVoices]);

  // Clear filter cache when dependencies change
  useEffect(() => {
    filterCache.current.clear();
  }, [state.searchQuery, state.selectedCategory, state.customFilters]);

  // ============================================================================
  // COMPUTED VALUES - Derived state and statistics
  // ============================================================================

  const computedValues = useMemo(() => {
    const totalVoices = state.availableVoices.length;
    const availableVoicesCount = state.availableVoices.filter(
      v => v.isAvailable
    ).length;
    const filteredVoicesCount = state.filteredVoices.length;
    const hasErrors = state.error !== null;
    const hasWarnings = false; // Could be extended with warning tracking

    return {
      totalVoices,
      availableVoicesCount,
      filteredVoicesCount,
      hasErrors,
      hasWarnings,
    };
  }, [state.availableVoices, state.filteredVoices, state.error]);

  // ============================================================================
  // CORE ACTIONS - Voice selection and management
  // ============================================================================

  const selectVoice = useCallback((voiceId: VoiceId): VoiceSelectionResult => {
    try {
      // Validate the voice ID
      if (!voicesCache.current.has(voiceId)) {
        const error = createVoiceSelectionError(
          'VOICE_NOT_FOUND',
          `Voice with ID "${voiceId}" not found`,
          { voiceId, availableVoices: Array.from(voicesCache.current.keys()) },
          false
        );

        setState(prev => ({ ...prev, error }));
        return { success: false, error };
      }

      const voice = voicesCache.current.get(voiceId)!;

      // Check availability
      if (!voice.isAvailable) {
        const error = createVoiceSelectionError(
          'VOICE_UNAVAILABLE',
          `Voice "${voice.label}" is not available`,
          { voiceId, voice },
          true
        );

        setState(prev => ({ ...prev, error }));
        return { success: false, error };
      }

      // Update state
      setState(prev => ({
        ...prev,
        selectedVoice: voiceId,
        error: null,
        recentlyUsed: [
          voiceId,
          ...prev.recentlyUsed.filter(id => id !== voiceId),
        ].slice(0, 10), // Keep only last 10
        lastUpdated: Date.now(),
      }));

      return { success: true, voice };
    } catch (error) {
      const selectionError = createVoiceSelectionError(
        'UNKNOWN_ERROR',
        `Failed to select voice: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { voiceId, originalError: error },
        true
      );

      setState(prev => ({ ...prev, error: selectionError }));
      return { success: false, error: selectionError };
    }
  }, []);

  // ============================================================================
  // SEARCH AND FILTERING - Advanced filtering capabilities
  // ============================================================================

  const searchVoices = useCallback((query: string) => {
    setState(prev => {
      const newState = { ...prev, searchQuery: query };

      // Apply filters and update filtered voices
      const filtered = applyFilters(
        newState.availableVoices,
        query,
        newState.selectedCategory,
        newState.customFilters
      );

      const sorted = sortVoices(
        filtered,
        newState.sortBy,
        newState.sortDirection
      );

      return {
        ...newState,
        filteredVoices: sorted,
        lastUpdated: Date.now(),
      };
    });
  }, []);

  const sortVoicesAction = useCallback(
    (
      by: VoiceManagementState['sortBy'],
      direction: 'asc' | 'desc' = 'desc'
    ) => {
      setState(prev => {
        const sorted = sortVoices(prev.filteredVoices, by, direction);

        return {
          ...prev,
          sortBy: by,
          sortDirection: direction,
          filteredVoices: sorted,
          lastUpdated: Date.now(),
        };
      });
    },
    []
  );

  const filterByCategory = useCallback((category: string | null) => {
    setState(prev => {
      const filtered = applyFilters(
        prev.availableVoices,
        prev.searchQuery,
        category,
        prev.customFilters
      );

      const sorted = sortVoices(filtered, prev.sortBy, prev.sortDirection);

      return {
        ...prev,
        selectedCategory: category,
        filteredVoices: sorted,
        lastUpdated: Date.now(),
      };
    });
  }, []);

  // ============================================================================
  // CUSTOM FILTERS - Advanced filtering system
  // ============================================================================

  const addCustomFilter = useCallback((filter: VoiceFilter) => {
    setState(prev => {
      const newFilters = [...prev.customFilters, filter];
      const filtered = applyFilters(
        prev.availableVoices,
        prev.searchQuery,
        prev.selectedCategory,
        newFilters
      );

      const sorted = sortVoices(filtered, prev.sortBy, prev.sortDirection);

      return {
        ...prev,
        customFilters: newFilters,
        filteredVoices: sorted,
        lastUpdated: Date.now(),
      };
    });
  }, []);

  const removeCustomFilter = useCallback((filterIndex: number) => {
    setState(prev => {
      const newFilters = prev.customFilters.filter(
        (_, index) => index !== filterIndex
      );
      const filtered = applyFilters(
        prev.availableVoices,
        prev.searchQuery,
        prev.selectedCategory,
        newFilters
      );

      const sorted = sortVoices(filtered, prev.sortBy, prev.sortDirection);

      return {
        ...prev,
        customFilters: newFilters,
        filteredVoices: sorted,
        lastUpdated: Date.now(),
      };
    });
  }, []);

  // ============================================================================
  // FAVORITES AND RECENT - User preference management
  // ============================================================================

  const toggleFavorite = useCallback((voiceId: VoiceId) => {
    setState(prev => ({
      ...prev,
      favorites: prev.favorites.includes(voiceId)
        ? prev.favorites.filter(id => id !== voiceId)
        : [...prev.favorites, voiceId],
      lastUpdated: Date.now(),
    }));
  }, []);

  // ============================================================================
  // UTILITY ACTIONS - Helper operations
  // ============================================================================

  const clearFilters = useCallback(() => {
    setState(prev => ({
      ...prev,
      searchQuery: '',
      selectedCategory: null,
      customFilters: [],
      filteredVoices: sortVoices(
        prev.availableVoices,
        prev.sortBy,
        prev.sortDirection
      ),
      lastUpdated: Date.now(),
    }));
  }, []);

  const resetToDefaults = useCallback(() => {
    setState(prev => ({
      ...prev,
      searchQuery: '',
      sortBy: 'quality',
      sortDirection: 'desc',
      selectedCategory: null,
      customFilters: [],
      favorites: [],
      filteredVoices: sortVoices(prev.availableVoices, 'quality', 'desc'),
      lastUpdated: Date.now(),
    }));
  }, []);

  // ============================================================================
  // VALIDATION AND UPDATES - Advanced validation system
  // ============================================================================

  const validateAndUpdateVoice = useCallback(
    (voiceId: VoiceId, updates: Partial<VoiceConfig>): VoiceSelectionResult => {
      try {
        const currentVoice = voicesCache.current.get(voiceId);
        if (!currentVoice) {
          return {
            success: false,
            error: createVoiceSelectionError(
              'VOICE_NOT_FOUND',
              `Voice with ID "${voiceId}" not found`,
              { voiceId }
            ),
          };
        }

        // Create updated voice config
        const updatedVoice = { ...currentVoice, ...updates };

        // Validate the updated config
        const validation = validateVoiceConfig(updatedVoice);
        if (!validation.isValid) {
          return {
            success: false,
            error: createVoiceSelectionError(
              'INVALID_VOICE_ID',
              'Voice validation failed',
              { validationErrors: validation.errors }
            ),
          };
        }

        // Update the voice in state
        setState(prev => ({
          ...prev,
          availableVoices: prev.availableVoices.map(v =>
            v.id === voiceId ? updatedVoice : v
          ),
          lastUpdated: Date.now(),
        }));

        return { success: true, voice: updatedVoice };
      } catch (error) {
        return {
          success: false,
          error: createVoiceSelectionError(
            'UNKNOWN_ERROR',
            `Failed to update voice: ${error instanceof Error ? error.message : 'Unknown error'}`,
            { voiceId, originalError: error }
          ),
        };
      }
    },
    []
  );

  // ============================================================================
  // UTILITY GETTERS - Convenience methods
  // ============================================================================

  const getVoiceById = useCallback(
    (voiceId: VoiceId): VoiceConfig | undefined => {
      return voicesCache.current.get(voiceId);
    },
    []
  );

  const getVoiceMetadata = useCallback((voiceId: VoiceId) => {
    return voicesCache.current.get(voiceId)?.metadata;
  }, []);

  const isVoiceAvailable = useCallback((voiceId: VoiceId): boolean => {
    return voicesCache.current.get(voiceId)?.isAvailable ?? false;
  }, []);

  const isVoiceFavorite = useCallback(
    (voiceId: VoiceId): boolean => {
      return state.favorites.includes(voiceId);
    },
    [state.favorites]
  );

  const getVoiceQuality = useCallback(
    (voiceId: VoiceId): number | undefined => {
      return voicesCache.current.get(voiceId)?.quality;
    },
    []
  );

  // ============================================================================
  // IMPORT/EXPORT - Data persistence
  // ============================================================================

  const exportVoiceSelection = useCallback((): string => {
    const exportData = {
      selectedVoice: state.selectedVoice,
      favorites: state.favorites,
      recentlyUsed: state.recentlyUsed,
      searchQuery: state.searchQuery,
      sortBy: state.sortBy,
      sortDirection: state.sortDirection,
      selectedCategory: state.selectedCategory,
      timestamp: Date.now(),
    };

    return JSON.stringify(exportData, null, 2);
  }, [state]);

  const importVoiceSelection = useCallback(
    (data: string): VoiceSelectionResult => {
      try {
        const importData = JSON.parse(data);

        // Validate imported data
        if (
          !importData.selectedVoice ||
          !voicesCache.current.has(importData.selectedVoice)
        ) {
          return {
            success: false,
            error: createVoiceSelectionError(
              'INVALID_VOICE_ID',
              'Imported data contains invalid voice selection',
              { importedData: importData }
            ),
          };
        }

        // Apply imported settings
        setState(prev => ({
          ...prev,
          selectedVoice: importData.selectedVoice,
          favorites: importData.favorites || [],
          recentlyUsed: importData.recentlyUsed || [],
          searchQuery: importData.searchQuery || '',
          sortBy: importData.sortBy || 'quality',
          sortDirection: importData.sortDirection || 'desc',
          selectedCategory: importData.selectedCategory || null,
          lastUpdated: Date.now(),
        }));

        return {
          success: true,
          voice: voicesCache.current.get(importData.selectedVoice)!,
        };
      } catch (error) {
        return {
          success: false,
          error: createVoiceSelectionError(
            'UNKNOWN_ERROR',
            `Failed to import voice selection: ${error instanceof Error ? error.message : 'Unknown error'}`,
            { originalError: error }
          ),
        };
      }
    },
    []
  );

  // ============================================================================
  // RETURN VALUE - Complete hook interface
  // ============================================================================

  return {
    // State
    ...state,
    ...computedValues,

    // Actions
    selectVoice,
    searchVoices,
    sortVoices: sortVoicesAction,
    filterByCategory,
    addCustomFilter,
    removeCustomFilter,
    toggleFavorite,
    clearFilters,
    resetToDefaults,
    validateAndUpdateVoice,

    // Utility getters
    getVoiceById,
    getVoiceMetadata,
    isVoiceAvailable,
    isVoiceFavorite,
    getVoiceQuality,

    // Import/Export
    exportVoiceSelection,
    importVoiceSelection,
  };
};

// ============================================================================
// EXPORT HOOK AND TYPES
// ============================================================================

export default useVoiceManagement;

export type {
  VoiceManagementState,
  VoiceManagementActions,
  UseVoiceManagementReturn,
};
