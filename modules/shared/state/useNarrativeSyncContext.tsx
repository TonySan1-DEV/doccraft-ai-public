import { useState, useCallback } from 'react';

export interface ArcOverlayPoint {
  id: string;
  position: number;
  type: 'tension' | 'empathy' | 'conflict' | 'resolution';
  intensity: number;
  description: string;
  characterId?: string;
  sceneId?: string;
}

export interface PlotFramework {
  id: string;
  name: string;
  structure: string[];
  stages: Array<{
    id: string;
    name: string;
    description: string;
    position: number;
  }>;
}

export interface NarrativeSyncState {
  currentSceneId?: string;
  characterFocusId?: string;
  activePlotFramework?: string;
  arcOverlay?: ArcOverlayPoint[];
  plotFrameworks?: PlotFramework[];
  syncEnabled: boolean;
  lastSyncTimestamp?: number;
}

export interface UseNarrativeSyncReturn {
  state: NarrativeSyncState;
  setScene: (sceneId: string) => void;
  setCharacter: (characterId: string) => void;
  setFramework: (framework: string) => void;
  updateOverlay: (overlay: ArcOverlayPoint[]) => void;
  toggleSync: () => void;
  addPlotFramework: (framework: PlotFramework) => void;
}

export const useNarrativeSync = (): UseNarrativeSyncReturn => {
  const [state, setState] = useState<NarrativeSyncState>({
    syncEnabled: true,
    plotFrameworks: [],
  });

  const setScene = useCallback((sceneId: string) => {
    setState(prev => ({ ...prev, currentSceneId: sceneId }));
  }, []);

  const setCharacter = useCallback((characterId: string) => {
    setState(prev => ({ ...prev, characterFocusId: characterId }));
  }, []);

  const setFramework = useCallback((framework: string) => {
    setState(prev => ({ ...prev, activePlotFramework: framework }));
  }, []);

  const updateOverlay = useCallback((overlay: ArcOverlayPoint[]) => {
    setState(prev => ({ ...prev, arcOverlay: overlay }));
  }, []);

  const toggleSync = useCallback(() => {
    setState(prev => ({
      ...prev,
      syncEnabled: !prev.syncEnabled,
      lastSyncTimestamp: Date.now(),
    }));
  }, []);

  const addPlotFramework = useCallback((framework: PlotFramework) => {
    setState(prev => ({
      ...prev,
      plotFrameworks: [...(prev.plotFrameworks || []), framework],
    }));
  }, []);

  return {
    state,
    setScene,
    setCharacter,
    setFramework,
    updateOverlay,
    toggleSync,
    addPlotFramework,
  };
};
