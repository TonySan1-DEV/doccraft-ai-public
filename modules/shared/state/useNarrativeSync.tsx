// MCP Context Block
/*
{
  file: "modules/shared/state/useNarrativeSync.ts",
  role: "frontend-developer",
  allowedActions: ["implement", "sync", "share"],
  tier: "Pro",
  contentSensitivity: "medium",
  theme: "state_management"
}
*/

import { createContext, useContext, useRef } from 'react';
import { create, StateCreator } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { PlotBeatAlignment } from '../plotEmotionTypes';

// --- Types ---
export interface NarrativeSyncState {
  currentSceneId: string | null;
  characterFocusId: string | null;
  activePlotFramework: string | null;
  arcOverlay: PlotBeatAlignment[];
  setScene: (sceneId: string) => void;
  setCharacter: (characterId: string) => void;
  setFramework: (framework: string) => void;
  updateOverlay: (overlay: PlotBeatAlignment[]) => void;
}

// --- Zustand Store Factory (SSR-safe) ---
const isClient = typeof window !== 'undefined';

const createStore: StateCreator<NarrativeSyncState> = set => ({
  currentSceneId: null,
  characterFocusId: null,
  activePlotFramework: null,
  arcOverlay: [],
  setScene: sceneId => set({ currentSceneId: sceneId }),
  setCharacter: characterId => set({ characterFocusId: characterId }),
  setFramework: framework => set({ activePlotFramework: framework }),
  updateOverlay: overlay => set({ arcOverlay: overlay }),
});

const useStore = isClient
  ? create<NarrativeSyncState>()(
      devtools(createStore, { name: 'NarrativeSyncStore' })
    )
  : create<NarrativeSyncState>()(createStore);

// --- Context Provider ---
const NarrativeSyncContext = createContext<ReturnType<typeof useStore> | null>(
  null
);

export const NarrativeSyncProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Ensure store is not recreated on every render
  const storeRef = useRef<ReturnType<typeof useStore>>();
  if (!storeRef.current) {
    storeRef.current = useStore;
  }
  return (
    <NarrativeSyncContext.Provider value={storeRef.current}>
      {children}
    </NarrativeSyncContext.Provider>
  );
};

// --- Hook ---
export function useNarrativeSync() {
  const store = useContext(NarrativeSyncContext);
  if (!store) {
    throw new Error(
      'useNarrativeSync must be used within a NarrativeSyncProvider'
    );
  }
  return store;
}
