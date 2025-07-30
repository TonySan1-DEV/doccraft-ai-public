// MCP Context Block
/*
role: frontend-developer,
tier: Pro,
file: "modules/themeAnalysis/components/ThemeMatrixPanel.tsx",
allowedActions: ["scaffold", "visualize", "align"],
theme: "theme_analysis"
*/

import React, { useState } from 'react';
import type { SceneThemeFingerprint, ThemeKeyword, ThemeConflictReason } from '../themeTypes';

interface ThemeMatrixPanelProps {
  scenes: SceneThemeFingerprint[];
  themes: ThemeKeyword[];
  conflictedThemes?: ThemeConflictReason[];
}

// Accessible tooltip component
const ConflictTooltip: React.FC<{ conflict: ThemeConflictReason; children: React.ReactNode }> = ({ conflict, children }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setShowTooltip(!showTooltip);
          }
        }}
        tabIndex={0}
        role="button"
        aria-describedby={`tooltip-${conflict.theme}-${conflict.conflictWith}`}
        data-mcp-action="viewConflictInsight"
      >
        {children}
      </div>
      {showTooltip && (
        <div
          id={`tooltip-${conflict.theme}-${conflict.conflictWith}`}
          className="absolute z-10 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg max-w-xs"
          role="tooltip"
          aria-live="polite"
        >
          <div className="font-semibold mb-1">
            {conflict.theme} vs {conflict.conflictWith}
          </div>
          <div className="text-xs">
            {conflict.conflictReason}
          </div>
        </div>
      )}
    </div>
  );
};

const ThemeMatrixPanel: React.FC<ThemeMatrixPanelProps> = ({ scenes, themes, conflictedThemes = [] }) => {
  // Mock filter state (future: add real filters)
  // const [activeThemes, setActiveThemes] = useState<ThemeKeyword[]>(themes);

  return (
    <div className="overflow-x-auto w-full" aria-label="Theme Matrix Panel">
      <table className="min-w-full border-collapse" role="table" aria-label="Scene x Theme Matrix">
        <thead>
          <tr>
            <th className="p-2 text-xs font-semibold text-left bg-gray-100" role="columnheader">Scene</th>
            {themes.map(theme => (
              <th key={theme} className="p-2 text-xs font-semibold text-center bg-gray-100" role="columnheader">{theme}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {scenes.map(scene => (
            <tr key={scene.sceneId}>
              <td className="p-2 text-xs font-mono bg-gray-50" role="rowheader">{scene.sceneId}</td>
              {themes.map(theme => {
                const signal = scene.themes.find(t => t.theme === theme);
                const present = !!signal;
                const strength = signal ? signal.strength : 0;
                const drift = present && strength < 0.3;
                // Check if this cell has a conflict
                const conflict = conflictedThemes.find(c => 
                  c.theme.toLowerCase() === theme.toLowerCase() && 
                  scene.sceneId.toLowerCase().includes(c.conflictWith.toLowerCase())
                );
                const cellContent = (
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                      conflict 
                        ? 'bg-red-300 text-red-900 border-2 border-red-500' 
                        : drift 
                        ? 'bg-red-200 text-red-800' 
                        : present 
                        ? 'bg-green-200 text-green-800' 
                        : 'text-gray-400'
                    }`}
                    title={conflict ? 'Theme conflict detected' : drift ? 'Theme drift' : present ? 'Theme present' : 'Theme absent'}
                  >
                    {present ? (
                      <>
                        {Math.round(strength * 100)}%
                        {drift && <span className="ml-1" role="img" aria-label="Drift">⚠️</span>}
                        {conflict && <span className="ml-1" role="img" aria-label="Conflict">🔥</span>}
                      </>
                    ) : (
                      <span className="text-gray-400 text-xs">–</span>
                    )}
                  </span>
                );
                return (
                  <td
                    key={theme}
                    className={`p-2 text-center align-middle ${drift ? 'bg-red-100' : present ? 'bg-green-50' : 'bg-gray-50'}`}
                    role="cell"
                    tabIndex={0}
                    aria-label={`Scene ${scene.sceneId}, Theme ${theme}, ${present ? `strength ${Math.round(strength * 100)}%` : 'absent'}${drift ? ', drift alert' : ''}${conflict ? ', conflict detected' : ''}`}
                  >
                    {conflict ? (
                      <ConflictTooltip conflict={conflict}>
                        {cellContent}
                      </ConflictTooltip>
                    ) : (
                      cellContent
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {/* Future: Add column filters, keyboard nav, and mobile layout */}
    </div>
  );
};

export default ThemeMatrixPanel; 