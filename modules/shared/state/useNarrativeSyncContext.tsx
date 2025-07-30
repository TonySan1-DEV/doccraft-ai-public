// MCP Context Block
/*
{
  file: "modules/shared/state/useNarrativeSyncContext.tsx",
  role: "frontend-developer",
  allowedActions: ["implement", "share", "sync"],
  tier: "Pro",
  contentSensitivity: "medium",
  theme: "state_management"
}
*/

import React, { createContext, useContext, useReducer, useMemo, useCallback, ReactNode } from 'react';
import type { PlotBeatAlignment } from '../plotEmotionTypes';

// --- Types ---
export interface NarrativeSyncState {
  currentSceneId: string | null;
  characterFocusId: string | null;
  activePlotFramework: string | null;
  arcOverlay: PlotBeatAlignment[];
}

export type NarrativeSyncAction =
  | { type: 'setScene'; sceneId: string }
  | { type: 'setCharacter'; characterId: string }
  | { type: 'setFramework'; framework: string }
  | { type: 'updateOverlay'; overlay: PlotBeatAlignment[] };

const initialState: NarrativeSyncState = {
  currentSceneId: null,
  characterFocusId: null,
  activePlotFramework: null,
  arcOverlay: []
};

function narrativeSyncReducer(state: NarrativeSyncState, action: NarrativeSyncAction): NarrativeSyncState {
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log('[NarrativeSync] Action:', action, 'PrevState:', state);
  }
  switch (action.type) {
    case 'setScene':
      return { ...state, currentSceneId: action.sceneId };
    case 'setCharacter':
      return { ...state, characterFocusId: action.characterId };
    case 'setFramework':
      return { ...state, activePlotFramework: action.framework };
    case 'updateOverlay':
      return { ...state, arcOverlay: action.overlay };
    default:
      return state;
  }
}

const NarrativeSyncContext = createContext<{
  state: NarrativeSyncState;
  setScene: (sceneId: string) => void;
  setCharacter: (characterId: string) => void;
  setFramework: (framework: string) => void;
  updateOverlay: (overlay: PlotBeatAlignment[]) => void;
} | null>(null);

export const NarrativeSyncProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(narrativeSyncReducer, initialState);

  // Memoize setters for performance
  const setScene = useCallback((sceneId: string) => dispatch({ type: 'setScene', sceneId }), []);
  const setCharacter = useCallback((characterId: string) => dispatch({ type: 'setCharacter', characterId }), []);
  const setFramework = useCallback((framework: string) => dispatch({ type: 'setFramework', framework }), []);
  const updateOverlay = useCallback((overlay: PlotBeatAlignment[]) => dispatch({ type: 'updateOverlay', overlay }), []);

  const value = useMemo(() => ({ state, setScene, setCharacter, setFramework, updateOverlay }), [state]);

  return (
    <NarrativeSyncContext.Provider value={value}>
      {children}
    </NarrativeSyncContext.Provider>
  );
};

export function useNarrativeSync() {
  const ctx = useContext(NarrativeSyncContext);
  if (!ctx) {
    throw new Error('useNarrativeSync must be used within a NarrativeSyncProvider');
  }
  return ctx;
}

// Tree-shakable wrapper for modular use
export const WithNarrativeSync: React.FC<{ children: ReactNode }> = ({ children }) => (
  <NarrativeSyncProvider>{children}</NarrativeSyncProvider>
); 