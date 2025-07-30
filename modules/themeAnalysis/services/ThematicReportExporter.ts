// MCP Context Block
/*
role: developer,
tier: Pro,
file: "modules/themeAnalysis/services/ThematicReportExporter.ts",
allowedActions: ["export", "report", "summarize"],
theme: "theme_reporting"
*/

import type { ThemeAlignmentReport, SceneThemeFingerprint, ThemeConflictReason } from '../themeTypes';
import yaml from 'js-yaml'; // Assume js-yaml is available for YAML export

export interface SceneMeta {
  sceneId: string;
  title: string;
  [key: string]: any;
}

export interface ThematicAuditOptions {
  genreTarget?: string;
  themePreset?: string;
  sectionOrder?: string[];
  topConflictThemes?: string[];
  exportFormat?: 'md' | 'txt' | 'json';
}

// Genre badge map for markdown and HTML
const genreBadgeMap: Record<string, { md: string; html: string; label: string; color: string; emoji: string }> = {
  noir:    { md: '🎭 *Noir Tone:*', html: '<span class="genre-label genre-noir" title="Noir Tone" data-mcp-source="genreToneOverlay">🎭 Noir Tone:</span>', label: 'Noir', color: 'gray', emoji: '🎭' },
  young_adult: { md: '💔 *YA Tone:*', html: '<span class="genre-label genre-ya" title="YA Tone" data-mcp-source="genreToneOverlay">💔 YA Tone:</span>', label: 'YA', color: 'purple', emoji: '💔' },
  literary: { md: '📘 *Literary Tone:*', html: '<span class="genre-label genre-literary" title="Literary Tone" data-mcp-source="genreToneOverlay">📘 Literary Tone:</span>', label: 'Literary', color: 'gold', emoji: '📘' },
  thriller: { md: '⚠ *Thriller Tone:*', html: '<span class="genre-label genre-thriller" title="Thriller Tone" data-mcp-source="genreToneOverlay">⚠ Thriller Tone:</span>', label: 'Thriller', color: 'red', emoji: '⚠' },
  romance:  { md: '💗 *Romance Tone:*', html: '<span class="genre-label genre-romance" title="Romance Tone" data-mcp-source="genreToneOverlay">💗 Romance Tone:</span>', label: 'Romance', color: 'pink', emoji: '💗' },
  historical: { md: '🏺 *Historical Tone:*', html: '<span class="genre-label genre-historical" title="Historical Tone" data-mcp-source="genreToneOverlay">🏺 Historical Tone:</span>', label: 'Historical', color: 'brown', emoji: '🏺' },
  speculative: { md: '👁️ *Speculative Tone:*', html: '<span class="genre-label genre-speculative" title="Speculative Tone" data-mcp-source="genreToneOverlay">👁️ Speculative Tone:</span>', label: 'Speculative', color: 'blue', emoji: '👁️' },
  satire: { md: '🃏 *Satire Tone:*', html: '<span class="genre-label genre-satire" title="Satire Tone" data-mcp-source="genreToneOverlay">🃏 Satire Tone:</span>', label: 'Satire', color: 'green', emoji: '🃏' },
  adventure: { md: '🧭 *Adventure Tone:*', html: '<span class="genre-label genre-adventure" title="Adventure Tone" data-mcp-source="genreToneOverlay">🧭 Adventure Tone:</span>', label: 'Adventure', color: 'teal', emoji: '🧭' },
  horror: { md: '🦇 *Horror Tone:*', html: '<span class="genre-label genre-horror" title="Horror Tone" data-mcp-source="genreToneOverlay">🦇 Horror Tone:</span>', label: 'Horror', color: 'black', emoji: '🦇' }
};
const getGenreBadge = (genre?: string, format: 'md' | 'html' = 'md') => {
  if (!genre) return format === 'md' ? '' : '';
  const g = genreBadgeMap[genre];
  return g ? (format === 'md' ? g.md : g.html) : '';
};

export function exportThematicAuditMarkdown(
  report: ThemeAlignmentReport,
  scenes: SceneMeta[],
  opts: ThematicAuditOptions = {}
): string {
  const sceneCount = scenes.length;
  const alignedScore = report.coverageScore;
  const misalignedCount = report.misalignedScenes.length;
  const genre = opts.genreTarget || 'N/A';
  const preset = opts.themePreset || 'N/A';
  const topConflicts = opts.topConflictThemes?.length ? opts.topConflictThemes.join(', ') : 'N/A';

  let md = `## 📘 Thematic Audit Report\n`;
  md += `- **Genre Target:** ${genre}\n`;
  md += `- **Theme Preset Used:** ${preset}\n`;
  md += `- **Scenes Analyzed:** ${sceneCount}\n`;
  md += `- **Primary Themes:** ${report.primaryThemes.join(', ')}\n`;
  md += `- **Alignment Score:** ${alignedScore}%\n`;
  md += `- **Misaligned Scenes:** ${misalignedCount}\n`;
  md += `- **Top Conflict Themes:** ${topConflicts}\n\n`;

  md += `### Scene Thematic Alignment\n`;
  md += `| Scene ID | Title | Aligned Themes | Conflicts | Suggested Fix |\n`;
  md += `|----------|-------|---------------|-----------|---------------|\n`;
  // Map sceneId to title for quick lookup
  const sceneTitleMap: Record<string, string> = Object.fromEntries(scenes.map(s => [s.sceneId, s.title]));
  // For each misaligned scene, render row
  report.misalignedScenes.forEach(scene => {
    const title = sceneTitleMap[scene.sceneId] || '';
    const aligned = scene.themes.map(t => t.theme).join(', ');
    // Find conflicts: missing any primary theme?
    const missing = report.primaryThemes.filter(pt => !scene.themes.some(t => t.theme.toLowerCase() === pt.toLowerCase()));
    const conflicts = missing.length ? missing.join(' missing') + ' missing' : '';
    // Find suggestion for this scene
    const suggestion = report.suggestions.find(s => s.includes(scene.sceneId)) || '';
    md += `| ${scene.sceneId} | ${title.replace(/\|/g, '')} | ${aligned} | ${conflicts} | ${suggestion.replace(/Scene [^:]+: /, '')} |\n`;
  });
  md += '\n';

  // Add conflict reasons if available
  if (report.conflictedThemes && report.conflictedThemes.length > 0) {
    md += `### ⚠️ Theme Conflicts\n`;
    report.conflictedThemes.forEach(conflict => {
      const genre = opts.genreTarget?.toLowerCase();
      const badge = getGenreBadge(genre, 'md');
      md += `${badge ? badge + ' ' : ''}> ${conflict.conflictReason || 'No detailed reason available.'}\n\n`;
    });
  }

  // --- Per-theme breakdown ---
  md += `## Per-Theme Breakdown\n`;
  for (const theme of report.primaryThemes) {
    // Find all scenes (in narrative order) where this theme appears
    const themeScenes = scenes.map(sceneMeta => {
      // Find theme signal in this scene (from misaligned or aligned)
      const misaligned = report.misalignedScenes.find(s => s.sceneId === sceneMeta.sceneId);
      const allSignals = misaligned ? misaligned.themes : [];
      const signal = allSignals.find(t => t.theme.toLowerCase() === theme.toLowerCase());
      return {
        sceneId: sceneMeta.sceneId,
        title: sceneMeta.title,
        strength: signal ? signal.strength : 0
      };
    });
    const present = themeScenes.filter(s => s.strength > 0);
    const strong = themeScenes.filter(s => s.strength > 0.8);
    const missing = themeScenes.filter(s => s.strength === 0);
    // Conflict: scenes where a clashing theme is present (e.g., betrayal for trust)
    // For simplicity, define some opposites
    const OPPOSITES: Record<string, string[]> = {
      trust: ['betrayal'],
      loyalty: ['betrayal'],
      identity: ['loss'],
      belonging: ['isolation'],
      love: ['hate'],
      hope: ['despair'],
      courage: ['fear'],
      peace: ['conflict'],
      forgiveness: ['revenge']
    };
    const opposites = OPPOSITES[theme.toLowerCase()] || [];
    const conflictAlerts = scenes.filter(sceneMeta => {
      const misaligned = report.misalignedScenes.find(s => s.sceneId === sceneMeta.sceneId);
      if (!misaligned) return false;
      return misaligned.themes.some(t => opposites.includes(t.theme.toLowerCase()));
    });
    // Suggestions for this theme
    const themeSuggestions = report.suggestions.filter(s => s.toLowerCase().includes(theme.toLowerCase()));
    // Conflict reasons for this theme
    const themeConflicts = report.conflictedThemes?.filter(c => c.theme.toLowerCase() === theme.toLowerCase()) || [];
    // Output section
    md += `\n### 🧭 Theme: ${theme}\n`;
    md += `- 📈 Appears in: ${present.length}/${scenes.length} scenes (${Math.round((present.length / scenes.length) * 100)}%)\n`;
    md += `- ✅ Strongest Scenes: ${strong.map(s => s.sceneId).join(', ') || 'None'}\n`;
    md += `- ❌ Missing From: ${missing.map(s => s.sceneId).join(', ') || 'None'}\n`;
    md += `- ⚠️ Conflict Alerts: ${conflictAlerts.map(s => s.sceneId).join(', ') || 'None'}\n`;
    md += `- 💡 Suggestions: ${themeSuggestions.length ? themeSuggestions.map(s => s.replace(/Scene [^:]+: /, '')).join('; ') : 'None'}\n`;
    // Add conflict reasons for this theme
    if (themeConflicts.length > 0) {
      md += `- 🔥 Conflicts:\n`;
      themeConflicts.forEach(conflict => {
        const genre = opts.genreTarget?.toLowerCase();
        const badge = getGenreBadge(genre, 'md');
        md += `  ${badge ? badge + ' ' : ''}> Scene ${conflict.conflictWith} → ${conflict.conflictReason || 'No detailed reason available.'}\n`;
      });
    }
  }
  md += '\n';
  return md;
}

export function exportThematicAuditTxt(
  report: ThemeAlignmentReport,
  scenes: SceneMeta[],
  opts: ThematicAuditOptions = {}
): string {
  // Render as plain text (tab-separated)
  let txt = `Thematic Audit Report\n`;
  txt += `Genre Target: ${opts.genreTarget || 'N/A'}\n`;
  txt += `Theme Preset Used: ${opts.themePreset || 'N/A'}\n`;
  txt += `Scenes Analyzed: ${scenes.length}\n`;
  txt += `Primary Themes: ${report.primaryThemes.join(', ')}\n`;
  txt += `Alignment Score: ${report.coverageScore}%\n`;
  txt += `Misaligned Scenes: ${report.misalignedScenes.length}\n`;
  txt += `Top Conflict Themes: ${opts.topConflictThemes?.join(', ') || 'N/A'}\n\n`;
  txt += `Scene ID\tTitle\tAligned Themes\tConflicts\tSuggested Fix\tConflict Reason\n`;
  report.misalignedScenes.forEach(scene => {
    const title = scenes.find(s => s.sceneId === scene.sceneId)?.title || '';
    const aligned = scene.themes.map(t => t.theme).join(', ');
    const missing = report.primaryThemes.filter(pt => !scene.themes.some(t => t.theme.toLowerCase() === pt.toLowerCase()));
    const conflicts = missing.length ? missing.join(' missing') + ' missing' : '';
    const suggestion = report.suggestions.find(s => s.includes(scene.sceneId)) || '';
    // Find conflict reason for this scene
    const conflictReason = report.conflictedThemes?.find(c => c.theme.toLowerCase() === scene.sceneId.toLowerCase())?.conflictReason || '';
    const truncatedReason = conflictReason.length > 200 ? conflictReason.substring(0, 197) + '...' : conflictReason;
    txt += `${scene.sceneId}\t${title}\t${aligned}\t${conflicts}\t${suggestion.replace(/Scene [^:]+: /, '')}\t${truncatedReason}\n`;
  });
  return txt;
}

export function exportThematicAuditJson(
  report: ThemeAlignmentReport,
  scenes: SceneMeta[],
  opts: ThematicAuditOptions = {}
): string {
  return JSON.stringify({
    genreTarget: opts.genreTarget,
    themePreset: opts.themePreset,
    sceneCount: scenes.length,
    primaryThemes: report.primaryThemes,
    alignmentScore: report.coverageScore,
    misalignedScenes: report.misalignedScenes.map(scene => ({
      sceneId: scene.sceneId,
      title: scenes.find(s => s.sceneId === scene.sceneId)?.title || '',
      alignedThemes: scene.themes.map(t => t.theme),
      conflicts: report.primaryThemes.filter(pt => !scene.themes.some(t => t.theme.toLowerCase() === pt.toLowerCase())),
      suggestion: report.suggestions.find(s => s.includes(scene.sceneId)) || ''
    })),
    topConflictThemes: opts.topConflictThemes || []
  }, null, 2);
}

export function exportThematicAuditYaml(
  report: ThemeAlignmentReport,
  scenes: SceneMeta[],
  opts: ThematicAuditOptions = {}
): string {
  const yamlData = report.misalignedScenes.map(scene => {
    const title = scenes.find(s => s.sceneId === scene.sceneId)?.title || '';
    const genre = opts.genreTarget || 'N/A';
    const conflicts = (report.conflictedThemes || []).filter(c => c.theme && c.conflictWith && c.conflictReason);
    return {
      scene: scene.sceneId,
      title,
      genre,
      alignedThemes: scene.themes.map(t => t.theme),
      conflicts: conflicts.filter(c => c.theme === scene.sceneId).map(c => ({
        theme: c.theme,
        conflictWith: c.conflictWith,
        reason: c.conflictReason
      }))
    };
  });
  return yaml.dump(yamlData, { noRefs: true, lineWidth: 120 });
}

// XLSX export stub (requires xlsx or exceljs package)
export function exportThematicAuditXlsx(
  report: ThemeAlignmentReport,
  scenes: SceneMeta[],
  opts: ThematicAuditOptions = {}
): Blob | null {
  // TODO: Implement XLSX export using exceljs or xlsx package
  // Should include: scene, title, genre, alignedThemes, conflicts, reason
  return null;
} 