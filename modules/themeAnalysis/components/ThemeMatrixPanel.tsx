// MCP Context Block
export const mcpContext = {
  file: 'modules/themeAnalysis/components/ThemeMatrixPanel.tsx',
  role: 'developer',
  allowedActions: ['refactor', 'type-harden', 'test'],
  contentSensitivity: 'low',
  theme: 'doccraft-ai',
};

import React, { useState } from 'react';
import type {
  SceneThemeFingerprint,
  ThemeKeyword,
  ThemeConflictReason,
} from '../themeTypes';
import { clamp01, toPercentDisplay } from '../../emotionArc/utils/scaling';

interface ThemeMatrixPanelProps {
  scenes: SceneThemeFingerprint[];
  themes: ThemeKeyword[];
  conflictedThemes?: ThemeConflictReason[];
}

interface ConflictTooltipProps {
  conflict: ThemeConflictReason;
  children: React.ReactNode;
}

// Accessible tooltip component
const ConflictTooltip: React.FC<ConflictTooltipProps> = ({
  conflict,
  children,
}) => {
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        onKeyDown={e => {
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
          <div className="text-xs">{conflict.conflictReason}</div>
        </div>
      )}
    </div>
  );
};

const ThemeMatrixPanel: React.FC<ThemeMatrixPanelProps> = ({
  scenes,
  themes,
  conflictedThemes = [],
}) => {
  // Mock filter state (future: add real filters)
  // const [activeThemes, setActiveThemes] = useState<ThemeKeyword[]>(themes);

  return (
    <div className="overflow-x-auto w-full" aria-label="Theme Matrix Panel">
      <table
        className="min-w-full border-collapse"
        role="table"
        aria-label="Scene x Theme Matrix"
      >
        <thead>
          <tr>
            <th
              className="p-2 text-xs font-semibold text-left bg-gray-100"
              role="columnheader"
            >
              Scene
            </th>
            {themes.map(theme => (
              <th
                key={theme}
                className="p-2 text-xs font-semibold text-center bg-gray-100"
                role="columnheader"
              >
                {theme}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {scenes.map(scene => (
            <tr key={scene.sceneId}>
              <td className="p-2 text-xs border-b border-gray-200">
                {scene.sceneId}
              </td>
              {themes.map(theme => {
                const themeSignal = scene.themes.find(t => t.theme === theme);
                const strength = themeSignal
                  ? clamp01(themeSignal.strength ?? 0)
                  : 0;
                const isConflicted = conflictedThemes.some(
                  c => c.theme === theme || c.conflictWith === theme
                );

                return (
                  <td
                    key={`${scene.sceneId}-${theme}`}
                    className={`p-2 text-xs text-center border-b border-gray-200 ${
                      strength > 0.7
                        ? 'bg-green-100'
                        : strength > 0.3
                          ? 'bg-yellow-100'
                          : 'bg-gray-50'
                    }`}
                  >
                    {isConflicted ? (
                      <ConflictTooltip
                        conflict={
                          conflictedThemes.find(
                            c => c.theme === theme || c.conflictWith === theme
                          ) ?? {
                            theme: '',
                            conflictWith: '',
                            conflictReason: 'Conflict detected',
                          }
                        }
                      >
                        <span className="text-red-600 font-semibold">
                          {toPercentDisplay(strength)}
                        </span>
                      </ConflictTooltip>
                    ) : (
                      <span className={strength > 0.5 ? 'font-semibold' : ''}>
                        {toPercentDisplay(strength)}
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ThemeMatrixPanel;
