export const mcpContext = {
  file: 'modules/themeAnalysis/themeTypes.ts',
  role: 'developer',
  allowedActions: ['refactor', 'type-harden', 'test'],
  contentSensitivity: 'low',
  theme: 'doccraft-ai',
};

export type ThemeKeyword = string;

export type ThemeCategory =
  | 'identity'
  | 'belonging'
  | 'rebellion'
  | 'growth'
  | 'betrayal'
  | 'justice'
  | 'power'
  | 'moral_ambiguity'
  | 'love'
  | 'sacrifice'
  | 'jealousy'
  | 'forgiveness'
  | 'paranoia'
  | 'control'
  | 'loyalty'
  | 'truth'
  | 'redemption'
  | 'trust'
  | 'revenge'
  | 'hope'
  | 'fear'
  | 'courage'
  | 'loss'
  | 'duty'
  | 'family'
  | 'destiny';

export interface ThemeScore {
  category: ThemeCategory;
  confidence: number /* 0..100 */;
}

export type ThemeVector = {
  [K in ThemeCategory]?: number /* 0..1 normalized */;
};

export type ThematicSignal = {
  theme: ThemeKeyword;
  strength: number; // 0–1, clamped and validated
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
  coverageScore: number; // 0–100%, clamped and validated
  suggestions: string[];
};
