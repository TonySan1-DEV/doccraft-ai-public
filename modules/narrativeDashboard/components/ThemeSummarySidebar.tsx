export const mcpContext = {
  file: 'modules/narrativeDashboard/components/ThemeSummarySidebar.tsx',
  role: 'developer',
  allowedActions: ['refactor', 'type-harden', 'test'],
  contentSensitivity: 'low',
  theme: 'doccraft-ai',
};

import React from 'react';

interface ThemeAlignmentReport {
  coverageScore: number;
  misalignedScenes: Array<{ sceneId: string; reason: string }>;
  primaryThemes: string[];
  conflictedThemes?: Array<{
    theme: string;
    conflictWith: string;
    conflictReason?: string;
  }>;
  genreTarget?: string;
}

interface ThemeSummarySidebarProps {
  report: ThemeAlignmentReport;
  onSelectTheme?: (theme: string) => void;
}

// Genre badge map for UI
const genreBadgeMap: Record<
  string,
  { label: string; color: string; className: string; emoji: string }
> = {
  noir: {
    label: 'Noir',
    color: 'bg-gray-700 text-white',
    className: 'ring-gray-500',
    emoji: '🎭',
  },
  young_adult: {
    label: 'YA',
    color: 'bg-purple-600 text-white',
    className: 'ring-purple-500',
    emoji: '💔',
  },
  literary: {
    label: 'Literary',
    color: 'bg-yellow-400 text-black',
    className: 'ring-yellow-400',
    emoji: '📘',
  },
  thriller: {
    label: 'Thriller',
    color: 'bg-red-600 text-white',
    className: 'ring-red-500',
    emoji: '⚠',
  },
  romance: {
    label: 'Romance',
    color: 'bg-pink-400 text-white',
    className: 'ring-pink-400',
    emoji: '💗',
  },
  historical: {
    label: 'Historical',
    color: 'bg-yellow-900 text-white',
    className: 'ring-yellow-900',
    emoji: '🏺',
  },
  speculative: {
    label: 'Speculative',
    color: 'bg-blue-700 text-white',
    className: 'ring-blue-700',
    emoji: '👁️',
  },
  satire: {
    label: 'Satire',
    color: 'bg-green-600 text-white',
    className: 'ring-green-600',
    emoji: '🃏',
  },
  adventure: {
    label: 'Adventure',
    color: 'bg-teal-500 text-white',
    className: 'ring-teal-500',
    emoji: '🧭',
  },
  horror: {
    label: 'Horror',
    color: 'bg-black text-white',
    className: 'ring-black',
    emoji: '🦇',
  },
};

const ThemeSummarySidebar: React.FC<ThemeSummarySidebarProps> = ({
  report,
  onSelectTheme,
}) => {
  const genre = report.genreTarget?.toLowerCase();
  return (
    <aside className="p-4" aria-label="Theme Summary Sidebar">
      <h2 className="text-lg font-bold mb-2">Theme Summary</h2>
      <div className="mb-2">
        Coverage: <span className="font-mono">{report.coverageScore}%</span>
      </div>
      <div className="mb-2">
        Conflicts:{' '}
        <span className="font-mono">{report.misalignedScenes.length}</span>
      </div>
      <div className="mb-2">Top Drifted Themes:</div>
      <ul className="list-disc list-inside text-xs">
        {report.primaryThemes.map((t, i) => (
          <li key={i}>
            <button
              className="underline text-blue-600"
              onClick={() => onSelectTheme?.(t)}
              data-mcp-action="selectTheme"
            >
              {t}
            </button>
          </li>
        ))}
      </ul>

      {/* Top Conflicts by Theme */}
      {report.conflictedThemes && report.conflictedThemes.length > 0 && (
        <div className="mt-4" aria-label="Top Conflicts by Theme">
          <h3 className="font-semibold text-sm mb-2">
            🔥 Top Conflicts by Theme
          </h3>
          <div className="space-y-2">
            {report.conflictedThemes.map((conflict, index) => {
              const badge =
                genre && genreBadgeMap[genre] ? genreBadgeMap[genre] : null;
              return (
                <div
                  key={index}
                  className="p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800 flex items-start gap-2"
                  data-mcp-action="viewConflictInsight"
                  data-mcp-source="genreToneOverlay"
                >
                  {badge && (
                    <span
                      className={`genre-badge inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold mt-0.5 ${badge.color}`}
                      role="presentation"
                      title={`${badge.label} Tone`}
                    >
                      <span aria-hidden="true">{badge.emoji}</span>{' '}
                      {badge.label}
                      <span className="sr-only">
                        {badge.label} tone influences this conflict explanation.
                      </span>
                    </span>
                  )}
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-red-800 dark:text-red-200">
                      {conflict.theme} → {conflict.conflictWith}{' '}
                      {badge ? `(${badge.label})` : ''}
                    </div>
                    <div className="text-xs text-red-700 dark:text-red-300 mt-1">
                      {conflict.conflictReason
                        ? conflict.conflictReason.length > 100
                          ? conflict.conflictReason.substring(0, 97) + '...'
                          : conflict.conflictReason
                        : 'No detailed reason available.'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* Genre legend */}
      <div
        className="mt-6 border-t pt-2 text-xs text-gray-500"
        data-mcp-source="genreToneOverlay"
      >
        <span className="font-semibold">Legend:</span> &nbsp;
        <span className="mr-2">🎭 Noir</span>
        <span className="mr-2">💔 YA</span>
        <span className="mr-2">📘 Literary</span>
        <span className="mr-2">⚠ Thriller</span>
        <span className="mr-2">💗 Romance</span>
        <span className="mr-2">🏺 Historical</span>
        <span className="mr-2">👁️ Speculative</span>
        <span className="mr-2">🦇 Horror</span>
        <span className="mr-2">🃏 Satire</span>
        <span className="mr-2">🧭 Adventure</span>
      </div>
    </aside>
  );
};

export default ThemeSummarySidebar;
