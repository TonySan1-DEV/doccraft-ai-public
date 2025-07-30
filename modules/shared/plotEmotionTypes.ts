// MCP Context Block
/*
{
  file: "modules/shared/plotEmotionTypes.ts",
  role: "architect",
  allowedActions: ["scaffold", "define", "integrate"],
  tier: "Pro",
  contentSensitivity: "medium",
  theme: "cross_module"
}
*/

/**
 * PlotBeatAlignment
 * Maps a scene to its structural beat and expected emotional tone.
 */
export interface PlotBeatAlignment {
  sceneId: string;
  beatId: string;
  beatLabel: string;
  expectedEmotionalTone: string; // e.g. "tension", "relief", "joy"
  actualEmotionalTone?: string;
  alignmentScore?: number; // 0-100
}

/**
 * CharacterArcAlignment
 * Maps persona traits to plot progression (e.g., flaw, desire, arcType to beats).
 */
export interface CharacterArcAlignment {
  characterId: string;
  characterName: string;
  arcType: string;
  traitAlignments: Array<{
    beatId: string;
    beatLabel: string;
    trait: string;
    expectedValue: string;
    actualValue?: string;
    match: boolean;
    notes?: string;
  }>;
}

/**
 * NarrativeSceneMeta
 * Shared scene metadata for cross-module use.
 */
export interface NarrativeSceneMeta {
  sceneId: string;
  chapter: number;
  position: number; // 0-1 normalized
  arcTags: string[]; // e.g. ["inciting", "climax", "reversal"]
  title?: string;
  summary?: string;
}

/**
 * useNarrativeSync
 * React hook for accessing/updating shared story state across modules.
 */
import { useCallback } from 'react';
import { useNarrativeStore } from './narrativeStore';

export function useNarrativeSync() {
  const state = useNarrativeStore();

  // Example: update scene meta
  const updateSceneMeta = useCallback((sceneId: string, meta: Partial<NarrativeSceneMeta>) => {
    state.updateSceneMeta(sceneId, meta);
  }, [state]);

  // Example: get alignment for a character
  const getCharacterArcAlignment = useCallback((characterId: string): CharacterArcAlignment | undefined => {
    return state.characterArcAlignments.find(a => a.characterId === characterId);
  }, [state]);

  return {
    ...state,
    updateSceneMeta,
    getCharacterArcAlignment
  };
} 