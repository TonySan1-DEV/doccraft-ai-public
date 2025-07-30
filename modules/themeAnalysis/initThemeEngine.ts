// MCP Context Block
/*
role: developer,
tier: Pro,
file: "modules/themeAnalysis/initThemeEngine.ts",
allowedActions: ["scaffold", "analyze", "align"],
theme: "theme_analysis"
*/

import type {
  ThemeKeyword,
  ThematicSignal,
  SceneThemeFingerprint,
  ThemeAlignmentReport
} from './themeTypes';

// Placeholder: SceneMeta type for future integration
export type SceneMeta = {
  sceneId: string;
  text: string;
  characters?: string[];
  arcPosition?: number;
};

// Symbolic theme keyword set (expandable)
const THEME_KEYWORDS: ThemeKeyword[] = [
  'loyalty', 'betrayal', 'identity', 'justice', 'freedom', 'love', 'power', 'sacrifice', 'redemption', 'trust', 'revenge', 'hope', 'fear', 'courage', 'loss', 'forgiveness', 'truth', 'duty', 'family', 'destiny'
];

// Simple phrase mining for thematic signals
function extractThematicSignals(text: string): ThematicSignal[] {
  const signals: ThematicSignal[] = [];
  for (const theme of THEME_KEYWORDS) {
    const regex = new RegExp(theme, 'i');
    if (regex.test(text)) {
      // Naive strength: count occurrences / 3 (cap at 1)
      const count = (text.match(new RegExp(theme, 'gi')) || []).length;
      signals.push({
        theme,
        strength: Math.min(1, count / 3),
        context: text.split(/[.!?]/).find(line => regex.test(line)) || ''
      });
    }
  }
  return signals;
}

// Async-safe main analysis function
export async function analyzeThemeConsistency(
  sceneText: string,
  storyScope?: SceneMeta[]
): Promise<ThemeAlignmentReport> {
  // Placeholder: In production, call OpenAI/Claude for advanced theme mining
  // For now, use symbolic phrase mining
  const sceneId = storyScope && storyScope.length ? storyScope[0].sceneId : 'scene1';
  const signals = extractThematicSignals(sceneText);
  // Aggregate across storyScope if provided
  let allSignals: SceneThemeFingerprint[] = [
    { sceneId, themes: signals }
  ];
  if (storyScope && storyScope.length > 1) {
    allSignals = storyScope.map(meta => ({
      sceneId: meta.sceneId,
      themes: extractThematicSignals(meta.text)
    }));
  }
  // Determine primary themes (by frequency/strength)
  const themeCounts: Record<string, number> = {};
  allSignals.forEach(f => f.themes.forEach(sig => {
    themeCounts[sig.theme] = (themeCounts[sig.theme] || 0) + sig.strength;
  }));
  const sortedThemes = Object.entries(themeCounts).sort((a, b) => b[1] - a[1]);
  const primaryThemes = sortedThemes.slice(0, 2).map(([theme]) => theme);
  // Detect misaligned scenes (no strong signal for primary themes)
  const misalignedScenes = allSignals.filter(f =>
    !f.themes.some(sig => primaryThemes.includes(sig.theme) && sig.strength > 0.3)
  );
  // Coverage score: percent of scenes with at least one primary theme
  const coverageScore = allSignals.length
    ? Math.round(100 * (allSignals.length - misalignedScenes.length) / allSignals.length)
    : 100;
  // Suggestions
  const suggestions: string[] = [];
  if (misalignedScenes.length) {
    suggestions.push('Reinforce primary themes in misaligned scenes.');
    misalignedScenes.forEach(f => {
      suggestions.push(`Scene ${f.sceneId}: Add cues for ${primaryThemes.join(' or ')}.`);
    });
  } else {
    suggestions.push('All scenes align with primary themes.');
  }
  // Future: Integrate emotion arc, character persona, plot structure hooks
  // ...
  return {
    primaryThemes,
    misalignedScenes,
    coverageScore,
    suggestions
  };
}

// Export types for consumers
export type {
  ThemeKeyword,
  ThematicSignal,
  SceneThemeFingerprint,
  ThemeAlignmentReport
}; 