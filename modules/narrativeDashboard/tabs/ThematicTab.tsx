// MCP Context Block
/*
role: frontend-developer,
tier: Pro,
file: "modules/narrativeDashboard/tabs/ThematicTab.tsx",
allowedActions: ["scaffold", "compose", "visualize"],
theme: "theme_dashboard"
*/

import React, { useState } from 'react';
import ThemeMatrixPanel from '../../themeAnalysis/components/ThemeMatrixPanel';
// Placeholder for ThemeSummarySidebar
const ThemeSummarySidebar: React.FC<any> = ({ report, onSelectTheme }) => (
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
      {report.primaryThemes.map((t: string, i: number) => (
        <li key={i}>
          <button
            className="underline text-blue-600"
            onClick={() => onSelectTheme?.(t)}
          >
            {t}
          </button>
        </li>
      ))}
    </ul>
  </aside>
);
import type {
  ThemeAlignmentReport,
  SceneThemeFingerprint,
  ThemeKeyword,
} from '../../themeAnalysis/themeTypes';

// Mock data for demo
const mockReport: ThemeAlignmentReport = {
  primaryThemes: ['loyalty', 'sacrifice', 'trust'],
  misalignedScenes: [
    {
      sceneId: 'scene2',
      themes: [
        { theme: 'loyalty', strength: 0.2, context: 'He hesitated.' },
        { theme: 'betrayal', strength: 0.7, context: 'She broke her promise.' },
      ],
    },
    {
      sceneId: 'scene3',
      themes: [
        {
          theme: 'betrayal',
          strength: 0.9,
          context: 'He turned against his ally.',
        },
      ],
    },
  ],
  coverageScore: 67,
  suggestions: [
    'Scene scene2: Add cues for loyalty or trust.',
    'Scene scene3: No trust signals present.',
  ],
};
const allScenes: SceneThemeFingerprint[] = [
  {
    sceneId: 'scene1',
    themes: [
      { theme: 'loyalty', strength: 0.8, context: 'He stood by his friend.' },
      { theme: 'sacrifice', strength: 0.7, context: 'She gave up her dream.' },
      { theme: 'trust', strength: 0.6, context: 'They confided.' },
    ],
  },
  ...mockReport.misalignedScenes,
];
const allThemes: ThemeKeyword[] = ['loyalty', 'sacrifice', 'trust', 'betrayal'];

const ThematicTab: React.FC = () => {
  const [view, setView] = useState<'matrix' | 'summary'>('matrix');
  const [selectedTheme, setSelectedTheme] = useState<ThemeKeyword | null>(null);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);
  // TODO: Replace with useNarrativeSync() and real ThemeAlignmentReport
  const report = mockReport;
  const scenes = allScenes;
  const themes = allThemes;

  // Anchor navigation to misaligned scenes
  const handleAnchor = (sceneId: string) => {
    const el = document.getElementById(`scene-${sceneId}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <section className="w-full h-full" aria-label="Thematic Analysis Tab">
      <div className="flex flex-col md:grid md:grid-cols-3 gap-4">
        {/* Main content */}
        <main
          className="md:col-span-2"
          aria-label="Theme Matrix or Summary"
          role="region"
        >
          <div className="flex items-center gap-4 mb-2">
            <button
              className={`px-3 py-1 rounded ${view === 'matrix' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              onClick={() => setView('matrix')}
              aria-pressed={view === 'matrix'}
            >
              Matrix View
            </button>
            <button
              className={`px-3 py-1 rounded ${view === 'summary' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              onClick={() => setView('summary')}
              aria-pressed={view === 'summary'}
            >
              Coverage Summary
            </button>
            <select
              className="ml-4 border rounded px-2 py-1 text-xs"
              aria-label="Select Theme Set"
              value={selectedTheme || ''}
              onChange={e => setSelectedTheme(e.target.value as ThemeKeyword)}
            >
              <option value="">All Themes</option>
              {themes.map(t => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          {loading ? (
            <div className="p-8 text-center text-gray-500" role="status">
              Loading thematic analysis…
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600" role="alert">
              {error}
            </div>
          ) : view === 'matrix' ? (
            <ThemeMatrixPanel
              scenes={
                selectedTheme
                  ? scenes.filter(s =>
                      s.themes.some(t => t.theme === selectedTheme)
                    )
                  : scenes
              }
              themes={selectedTheme ? [selectedTheme] : themes}
            />
          ) : (
            <div className="p-4" aria-label="Coverage Summary" role="region">
              <h2 className="text-lg font-bold mb-2">Coverage Summary</h2>
              <div className="mb-2">
                Coverage:{' '}
                <span className="font-mono">{report.coverageScore}%</span>
              </div>
              <div className="mb-2">
                Conflicts:{' '}
                <span className="font-mono">
                  {report.misalignedScenes.length}
                </span>
              </div>
              <div className="mb-2">Top Drifted Themes:</div>
              <ul className="list-disc list-inside text-xs mb-2">
                {report.primaryThemes.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
              <div className="mb-2">Suggestions:</div>
              <ul className="list-disc list-inside text-xs">
                {report.suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
              <div className="mt-4">
                <h3 className="font-semibold text-sm mb-1">
                  Jump to Misaligned Scene:
                </h3>
                {report.misalignedScenes.map(s => (
                  <button
                    key={s.sceneId}
                    className="underline text-blue-600 mr-2 text-xs"
                    onClick={() => handleAnchor(s.sceneId)}
                  >
                    {s.sceneId}
                  </button>
                ))}
              </div>
            </div>
          )}
        </main>
        {/* Sidebar */}
        <aside
          className="md:col-span-1 md:border-l border-gray-200 bg-gray-50"
          aria-label="Sidebar"
        >
          <ThemeSummarySidebar
            report={report}
            onSelectTheme={setSelectedTheme}
          />
        </aside>
      </div>
    </section>
  );
};

export default ThematicTab;
