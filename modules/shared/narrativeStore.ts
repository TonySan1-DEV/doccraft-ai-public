// MCP Context Block
/*
{
  file: "modules/shared/narrativeStore.ts",
  role: "architect",
  allowedActions: ["scaffold", "define", "integrate"],
  tier: "Pro",
  contentSensitivity: "medium",
  theme: "cross_module"
}
*/

import { create } from 'zustand';
import type {
  NarrativeSceneMeta,
  PlotBeatAlignment,
  CharacterArcAlignment,
} from './plotEmotionTypes';

interface NarrativeStoreState {
  sceneMeta: Record<string, NarrativeSceneMeta>;
  plotBeatAlignments: PlotBeatAlignment[];
  characterArcAlignments: CharacterArcAlignment[];
  updateSceneMeta: (sceneId: string, meta: Partial<NarrativeSceneMeta>) => void;
  setPlotBeatAlignments: (alignments: PlotBeatAlignment[]) => void;
  setCharacterArcAlignments: (alignments: CharacterArcAlignment[]) => void;
}

/**
 * Centralized Zustand store for narrative state
 * Used by Emotion Arc, Persona Builder, and Plot Engine modules
 */
export const useNarrativeStore = create<NarrativeStoreState>(set => ({
  sceneMeta: {},
  plotBeatAlignments: [],
  characterArcAlignments: [],
  updateSceneMeta: (sceneId: string, meta: Partial<NarrativeSceneMeta>) =>
    set((state: NarrativeStoreState) => ({
      sceneMeta: {
        ...state.sceneMeta,
        [sceneId]: {
          ...state.sceneMeta[sceneId],
          ...meta,
        },
      },
    })),
  setPlotBeatAlignments: (alignments: PlotBeatAlignment[]) =>
    set({ plotBeatAlignments: alignments }),
  setCharacterArcAlignments: (alignments: CharacterArcAlignment[]) =>
    set({ characterArcAlignments: alignments }),
}));
