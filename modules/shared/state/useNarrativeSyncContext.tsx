/** TEMP STUB — replace with real implementation */
import { useState, useCallback } from 'react';

interface NarrativeSyncState {
  currentSceneId?: string;
  characterFocusId?: string;
  activePlotFramework?: string;
  arcOverlay?: any[];
}

interface UseNarrativeSyncReturn {
  state: NarrativeSyncState;
  setScene: (sceneId: string) => void;
  setCharacter: (characterId: string) => void;
  setFramework: (framework: string) => void;
  updateOverlay: (overlay: any[]) => void;
}

export const useNarrativeSync = (): UseNarrativeSyncReturn => {
  const [state, setState] = useState<NarrativeSyncState>({});

  const setScene = useCallback((sceneId: string) => {
    setState(prev => ({ ...prev, currentSceneId: sceneId }));
  }, []);

  const setCharacter = useCallback((characterId: string) => {
    setState(prev => ({ ...prev, characterFocusId: characterId }));
  }, []);

  const setFramework = useCallback((framework: string) => {
    setState(prev => ({ ...prev, activePlotFramework: framework }));
  }, []);

  const updateOverlay = useCallback((overlay: any[]) => {
    setState(prev => ({ ...prev, arcOverlay: overlay }));
  }, []);

  return {
    state,
    setScene,
    setCharacter,
    setFramework,
    updateOverlay,
  };
};
