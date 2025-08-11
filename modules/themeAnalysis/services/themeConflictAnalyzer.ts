export const mcpContext = {
  file: 'modules/themeAnalysis/services/themeConflictAnalyzer.ts',
  role: 'developer',
  allowedActions: ['refactor', 'type-harden', 'test'],
  contentSensitivity: 'low',
  theme: 'doccraft-ai',
};

import { clamp100 } from '../../emotionArc/utils/scaling';

export interface SceneConflictContext {
  sceneId: string;
  position?: number;
  characterArc?: string;
  beatLabel?: string;
  emotionalOverlay?: string;
  styleTension?: string;
}

export interface ThemeConflictReason {
  theme: string;
  conflictWith: string;
  conflictReason: string;
}

/**
 * Generate editorial-ready reasoning for theme conflicts in a scene.
 * @param ctx Scene metadata and optional cross-engine context
 * @param expectedThemes Themes expected for this scene (from preset or user target)
 * @param detectedThemes Themes detected in the scene (from analysis)
 * @param conflictingThemes Themes detected as in conflict (from drift detection)
 * @param genre Optional genre for genre-aware phrasing
 * @returns Array of ThemeConflictReason objects
 */
export function generateConflictReason(
  ctx: SceneConflictContext,
  expectedThemes: string[],
  detectedThemes: string[],
  conflictingThemes: string[],
  genre?: string
): ThemeConflictReason[] {
  if (!expectedThemes.length || !conflictingThemes.length) return [];
  const reasons: ThemeConflictReason[] = [];

  // MCP-EDITORIAL-BLEND: Genre-aware phrasing logic
  const genreToneMap: Record<
    string,
    (theme: string, conflict: string) => string
  > = {
    noir: (_theme, _conflict) =>
      `${_theme} fractures under cynical pressure, hinting the protagonist was never clean.`,
    young_adult: (_theme, _conflict) =>
      `${_conflict} at the midpoint clouds emerging ${_theme.toLowerCase()}, confusing peer dynamics.`,
    literary: (_theme, _conflict) =>
      `Allegiances dissolve in emotional abstraction, ${_theme.toLowerCase()} becomes performative.`,
    thriller: (_theme, _conflict) =>
      `Unreliable ${_theme.toLowerCase()} destabilizes trust just as stakes begin to escalate.`,
    romance: (_theme, _conflict) =>
      `Emotional ${_conflict.toLowerCase()} disrupts romantic alignment and softens chemistry trajectory.`,
    historical: (_theme, _conflict) =>
      `Tradition is upended by a spark of defiance, echoing through generations.`,
    speculative: (_theme, _conflict) =>
      `The boundaries of reality blur as ${_conflict.toLowerCase()} undermines the world.`,
    satire: (_theme, _conflict) =>
      `Authority is lampooned, its seriousness undercut by biting subversion.`,
    adventure: (_theme, _conflict) =>
      `The call to adventure drowns out caution, propelling the hero into the unknown.`,
    horror: (_theme, _conflict) =>
      `A glimmer of hope is quickly suffocated by encroaching dread.`,
  };

  for (const theme of expectedThemes) {
    for (const conflict of conflictingThemes) {
      // Only reason if the conflict is not expected and is present
      if (
        !detectedThemes.includes(theme) &&
        detectedThemes.includes(conflict)
      ) {
        let reason = '';
        if (genre && genreToneMap[genre]) {
          reason = genreToneMap[genre](theme, conflict);
        } else {
          // Fallback: original editorial logic
          reason = `Scene is expected to reinforce "${theme}"`;
          if (ctx.beatLabel) {
            reason += ` during the "${ctx.beatLabel}" beat`;
          } else if (ctx.position !== undefined) {
            reason += ` at position ${clamp100(ctx.position)}`;
          }
          if (ctx.characterArc) {
            reason += ` in the character arc: ${ctx.characterArc}`;
          }
          reason += `, but "${conflict}" dominates the thematic/emotional tone`;
          if (ctx.emotionalOverlay) {
            reason += ` (emotion: ${ctx.emotionalOverlay})`;
          }
          if (ctx.styleTension) {
            reason += `, with a style marked by ${ctx.styleTension}`;
          }
          reason += ', disrupting expected narrative progression.';
        }
        reasons.push({
          theme,
          conflictWith: conflict,
          conflictReason: reason,
        });
      }
    }
  }
  return reasons;
}
