// MCP Context Block
/*
role: developer,
tier: Pro,
file: "modules/themeAnalysis/themeTypes.ts",
allowedActions: ["define", "export"],
theme: "theme_analysis"
*/

export type ThemeKeyword = string;

export type ThematicSignal = {
  theme: ThemeKeyword;
  strength: number; // 0–1
  context: string; // extracted line or cue
};

export type SceneThemeFingerprint = {
  sceneId: string;
  themes: ThematicSignal[];
};

export type ThemeConflictReason = {
  theme: string;
  conflictWith: string;
  conflictReason: string;
};

export type ThemeAlignmentReport = {
  primaryThemes: ThemeKeyword[];
  misalignedScenes: SceneThemeFingerprint[];
  conflictedThemes?: ThemeConflictReason[];
  coverageScore: number; // 0–100%
  suggestions: string[];
}; 