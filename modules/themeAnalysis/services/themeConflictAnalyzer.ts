// MCP Context Block
/*
role: developer,
tier: Pro,
file: "modules/themeAnalysis/services/themeConflictAnalyzer.ts",
allowedActions: ["generate", "analyze", "enrich"],
theme: "theme_diagnostics"
*/

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
  const genreToneMap: Record<string, (theme: string, conflict: string, ctx: SceneConflictContext) => string> = {
    noir: (theme, conflict, ctx) =>
      `${theme} fractures under cynical pressure, hinting the protagonist was never clean.`,
    young_adult: (theme, conflict, ctx) =>
      `${conflict} at the midpoint clouds emerging ${theme.toLowerCase()}, confusing peer dynamics.`,
    literary: (theme, conflict, ctx) =>
      `Allegiances dissolve in emotional abstraction, ${theme.toLowerCase()} becomes performative.`,
    thriller: (theme, conflict, ctx) =>
      `Unreliable ${theme.toLowerCase()} destabilizes trust just as stakes begin to escalate.`,
    romance: (theme, conflict, ctx) =>
      `Emotional ${conflict.toLowerCase()} disrupts romantic alignment and softens chemistry trajectory.`,
    historical: (theme, conflict, ctx) =>
      `Tradition is upended by a spark of defiance, echoing through generations.`,
    speculative: (theme, conflict, ctx) =>
      `The boundaries of reality blur as ${conflict.toLowerCase()} undermines the fragile order of this world.`,
    satire: (theme, conflict, ctx) =>
      `Authority is lampooned, its seriousness undercut by biting subversion.`,
    adventure: (theme, conflict, ctx) =>
      `The call to adventure drowns out caution, propelling the hero into the unknown.`,
    horror: (theme, conflict, ctx) =>
      `A glimmer of hope is quickly suffocated by encroaching dread.`
  };

  for (const theme of expectedThemes) {
    for (const conflict of conflictingThemes) {
      // Only reason if the conflict is not expected and is present
      if (!detectedThemes.includes(theme) && detectedThemes.includes(conflict)) {
        let reason = '';
        if (genre && genreToneMap[genre]) {
          reason = genreToneMap[genre](theme, conflict, ctx);
        } else {
          // Fallback: original editorial logic
          reason = `Scene is expected to reinforce "${theme}"`;
          if (ctx.beatLabel) {
            reason += ` during the "${ctx.beatLabel}" beat`;
          } else if (ctx.position !== undefined) {
            reason += ` at position ${ctx.position}`;
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
          conflictReason: reason
        });
      }
    }
  }
  // Fallback: if no detailed context, provide a generic reason
  if (!reasons.length && conflictingThemes.length) {
    for (const theme of expectedThemes) {
      for (const conflict of conflictingThemes) {
        if (!detectedThemes.includes(theme) && detectedThemes.includes(conflict)) {
          reasons.push({
            theme,
            conflictWith: conflict,
            conflictReason: `Scene is expected to reinforce "${theme}", but "${conflict}" is present, causing thematic conflict.`
          });
        }
      }
    }
  }
  return reasons;
} 