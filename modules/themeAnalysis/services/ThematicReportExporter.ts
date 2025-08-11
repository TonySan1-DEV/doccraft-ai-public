export const mcpContext = {
  file: 'modules/themeAnalysis/services/ThematicReportExporter.ts',
  role: 'developer',
  allowedActions: ['refactor', 'type-harden', 'test'],
  contentSensitivity: 'low',
  theme: 'doccraft-ai',
};

import type { ThemeAlignmentReport } from '../themeTypes';
import {
  clamp01,
  clamp100,
  toPercentDisplay,
} from '../../emotionArc/utils/scaling';
import yaml from 'js-yaml'; // Assume js-yaml is available for YAML export

export interface SceneMeta {
  sceneId: string;
  title: string;
  [key: string]: unknown;
}

export interface ThematicAuditOptions {
  genreTarget?: string;
  themePreset?: string;
  sectionOrder?: string[];
  topConflictThemes?: string[];
  exportFormat?: 'md' | 'txt' | 'json';
}

// Genre badge map for markdown and HTML
const genreBadgeMap: Record<
  string,
  { md: string; html: string; label: string; color: string; emoji: string }
> = {
  noir: {
    md: '🎭 *Noir Tone:*',
    html: '<span class="genre-label genre-noir" title="Noir Tone" data-mcp-source="genreToneOverlay">🎭 Noir Tone:</span>',
    label: 'Noir',
    color: 'gray',
    emoji: '🎭',
  },
  young_adult: {
    md: '💔 *YA Tone:*',
    html: '<span class="genre-label genre-ya" title="YA Tone" data-mcp-source="genreToneOverlay">💔 YA Tone:</span>',
    label: 'YA',
    color: 'purple',
    emoji: '💔',
  },
  literary: {
    md: '📘 *Literary Tone:*',
    html: '<span class="genre-label genre-literary" title="Literary Tone" data-mcp-source="genreToneOverlay">📘 Literary Tone:</span>',
    label: 'Literary',
    color: 'gold',
    emoji: '📘',
  },
  thriller: {
    md: '⚠ *Thriller Tone:*',
    html: '<span class="genre-label genre-thriller" title="Thriller Tone" data-mcp-source="genreToneOverlay">⚠ Thriller Tone:</span>',
    label: 'Thriller',
    color: 'red',
    emoji: '⚠',
  },
  romance: {
    md: '💗 *Romance Tone:*',
    html: '<span class="genre-label genre-romance" title="Romance Tone" data-mcp-source="genreToneOverlay">💗 Romance Tone:</span>',
    label: 'Romance',
    color: 'pink',
    emoji: '💗',
  },
  historical: {
    md: '🏺 *Historical Tone:*',
    html: '<span class="genre-label genre-historical" title="Historical Tone" data-mcp-source="genreToneOverlay">🏺 Historical Tone:</span>',
    label: 'Historical',
    color: 'brown',
    emoji: '🏺',
  },
  speculative: {
    md: '👁️ *Speculative Tone:*',
    html: '<span class="genre-label genre-speculative" title="Speculative Tone" data-mcp-source="genreToneOverlay">👁️ Speculative Tone:</span>',
    label: 'Speculative',
    color: 'blue',
    emoji: '👁️',
  },
  satire: {
    md: '🃏 *Satire Tone:*',
    html: '<span class="genre-label genre-satire" title="Satire Tone" data-mcp-source="genreToneOverlay">🃏 Satire Tone:</span>',
    label: 'Satire',
    color: 'green',
    emoji: '🃏',
  },
  adventure: {
    md: '🧭 *Adventure Tone:*',
    html: '<span class="genre-label genre-adventure" title="Adventure Tone" data-mcp-source="genreToneOverlay">🧭 Adventure Tone:</span>',
    label: 'Adventure',
    color: 'teal',
    emoji: '🧭',
  },
  horror: {
    md: '🦇 *Horror Tone:*',
    html: '<span class="genre-label genre-horror" title="Horror Tone" data-mcp-source="genreToneOverlay">🦇 Horror Tone:</span>',
    label: 'Horror',
    color: 'black',
    emoji: '🦇',
  },
};

const getGenreBadge = (
  genre?: string,
  format: 'md' | 'html' = 'md'
): string => {
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
  const alignedScore = clamp100(report.coverageScore ?? 0);
  const misalignedCount = report.misalignedScenes.length;
  const genre = opts.genreTarget || 'N/A';
  const preset = opts.themePreset || 'N/A';
  const topConflicts = opts.topConflictThemes?.length
    ? opts.topConflictThemes.join(', ')
    : 'N/A';

  let md = `## 📘 Thematic Audit Report\n`;
  md += `- **Genre Target:** ${genre}\n`;
  md += `- **Theme Preset Used:** ${preset}\n`;
  md += `- **Scenes Analyzed:** ${sceneCount}\n`;
  md += `- **Primary Themes:** ${report.primaryThemes.join(', ')}\n`;
  md += `- **Alignment Score:** ${toPercentDisplay(alignedScore / 100)}\n`;
  md += `- **Misaligned Scenes:** ${misalignedCount}\n`;
  md += `- **Top Conflict Themes:** ${topConflicts}\n\n`;

  md += `### Scene Thematic Alignment\n`;
  md += `| Scene ID | Title | Aligned Themes | Conflicts | Suggested Fix |\n`;
  md += `|----------|-------|---------------|-----------|---------------|\n`;
  // Map sceneId to title for quick lookup
  const sceneTitleMap: Record<string, string> = Object.fromEntries(
    scenes.map(s => [s.sceneId, s.title])
  );
  // For each misaligned scene, render row
  report.misalignedScenes.forEach(scene => {
    const title = sceneTitleMap[scene.sceneId] || '';
    const aligned = scene.themes.map(t => t.theme).join(', ');
    // Find conflicts: missing any primary theme?
    const missing = report.primaryThemes.filter(
      pt => !scene.themes.some(t => t.theme.toLowerCase() === pt.toLowerCase())
    );
    const conflicts = missing.length
      ? missing.join(' missing') + ' missing'
      : '';
    // Find suggestion for this scene
    const suggestion =
      report.suggestions.find(s => s.includes(scene.sceneId)) || '';
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
    const themeScenes = scenes
      .map(sceneMeta => {
        // Find theme signal in this scene (from misaligned or aligned)
        const sceneFingerprint = report.misalignedScenes.find(
          s => s.sceneId === sceneMeta.sceneId
        );
        const themeSignal = sceneFingerprint?.themes.find(
          t => t.theme.toLowerCase() === theme.toLowerCase()
        );
        const strength = themeSignal ? clamp01(themeSignal.strength ?? 0) : 0;
        return {
          sceneId: sceneMeta.sceneId,
          title: sceneMeta.title,
          strength: toPercentDisplay(strength),
        };
      })
      .filter(s => parseFloat(s.strength) > 0);

    if (themeScenes.length > 0) {
      md += `### ${theme}\n`;
      md += `| Scene | Title | Strength |\n`;
      md += `|-------|-------|----------|\n`;
      themeScenes.forEach(s => {
        md += `| ${s.sceneId} | ${s.title.replace(/\|/g, '')} | ${s.strength} |\n`;
      });
      md += '\n';
    }
  }

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
    const missing = report.primaryThemes.filter(
      pt => !scene.themes.some(t => t.theme.toLowerCase() === pt.toLowerCase())
    );
    const conflicts = missing.length
      ? missing.join(' missing') + ' missing'
      : '';
    const suggestion =
      report.suggestions.find(s => s.includes(scene.sceneId)) || '';
    // Find conflict reason for this scene
    const conflictReason =
      report.conflictedThemes?.find(
        c => c.theme.toLowerCase() === scene.sceneId.toLowerCase()
      )?.conflictReason || '';
    const truncatedReason =
      conflictReason.length > 200
        ? conflictReason.substring(0, 197) + '...'
        : conflictReason;
    txt += `${scene.sceneId}\t${title}\t${aligned}\t${conflicts}\t${suggestion.replace(/Scene [^:]+: /, '')}\t${truncatedReason}\n`;
  });
  return txt;
}

export function exportThematicAuditJson(
  report: ThemeAlignmentReport,
  scenes: SceneMeta[],
  opts: ThematicAuditOptions = {}
): string {
  return JSON.stringify(
    {
      genreTarget: opts.genreTarget,
      themePreset: opts.themePreset,
      sceneCount: scenes.length,
      primaryThemes: report.primaryThemes,
      alignmentScore: report.coverageScore,
      misalignedScenes: report.misalignedScenes.map(scene => ({
        sceneId: scene.sceneId,
        title: scenes.find(s => s.sceneId === scene.sceneId)?.title || '',
        alignedThemes: scene.themes.map(t => t.theme),
        conflicts: report.primaryThemes.filter(
          pt =>
            !scene.themes.some(t => t.theme.toLowerCase() === pt.toLowerCase())
        ),
        suggestion:
          report.suggestions.find(s => s.includes(scene.sceneId)) || '',
      })),
      topConflictThemes: opts.topConflictThemes || [],
    },
    null,
    2
  );
}

export function exportThematicAuditYaml(
  report: ThemeAlignmentReport,
  scenes: SceneMeta[],
  opts: ThematicAuditOptions = {}
): string {
  const yamlData = report.misalignedScenes.map(scene => {
    const title = scenes.find(s => s.sceneId === scene.sceneId)?.title || '';
    const genre = opts.genreTarget || 'N/A';
    const conflicts = (report.conflictedThemes || []).filter(
      c => c.theme && c.conflictWith && c.conflictReason
    );
    return {
      scene: scene.sceneId,
      title,
      genre,
      alignedThemes: scene.themes.map(t => t.theme),
      conflicts: conflicts
        .filter(c => c.theme === scene.sceneId)
        .map(c => ({
          theme: c.theme,
          conflictWith: c.conflictWith,
          reason: c.conflictReason,
        })),
    };
  });
  return yaml.dump(yamlData, { noRefs: true, lineWidth: 120 });
}

// XLSX export stub (requires xlsx or exceljs package)
export function exportThematicAuditXlsx(
  _report: ThemeAlignmentReport,
  _scenes: SceneMeta[],
  _opts: ThematicAuditOptions = {}
): Blob | null {
  // TODO: Implement XLSX export using exceljs or xlsx package
  // Should include: scene, title, genre, alignedThemes, conflicts, reason
  return null;
}
