// MCP Context Block
/*
role: frontend-developer,
tier: Pro,
file: "modules/narrativeDashboard/NarrativeOverlaySelector.tsx",
allowedActions: ["scaffold", "visualize"],
theme: "dashboard"
*/

export const mcpContext = {
  file: 'modules/narrativeDashboard/NarrativeOverlaySelector.tsx',
  role: 'developer',
  allowedActions: ['refactor', 'type-harden', 'test'],
  contentSensitivity: 'low',
  theme: 'doccraft-ai',
};

import React, { useState } from 'react';

export interface NarrativeOverlaySelectorProps {
  onOverlayChange?: (overlay: string) => void;
  selectedOverlay?: string;
  availableOverlays?: string[];
}

const NarrativeOverlaySelector: React.FC<NarrativeOverlaySelectorProps> = ({
  onOverlayChange,
  selectedOverlay = 'emotion-arc',
  availableOverlays = ['emotion-arc', 'beat-overlay', 'pov-path'],
}) => {
  const [activeOverlay, setActiveOverlay] = useState<string>(selectedOverlay);

  const handleOverlayChange = (overlay: string): void => {
    setActiveOverlay(overlay);
    onOverlayChange?.(overlay);
  };

  const getOverlayConfig = (overlay: string) => {
    switch (overlay) {
      case 'emotion-arc':
        return { label: 'Emotion Arc', className: 'bg-blue-100 text-blue-800' };
      case 'beat-overlay':
        return {
          label: 'Beat Overlay',
          className: 'bg-green-100 text-green-800',
        };
      case 'pov-path':
        return {
          label: 'POV Path',
          className: 'bg-purple-100 text-purple-800',
        };
      default:
        return { label: overlay, className: 'bg-gray-100 text-gray-800' };
    }
  };

  return (
    <div aria-label="Narrative Overlay Selector" className="flex gap-2">
      {availableOverlays.map(overlay => {
        const config = getOverlayConfig(overlay);
        const isActive = activeOverlay === overlay;
        return (
          <button
            key={overlay}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              isActive
                ? `${config.className} ring-2 ring-offset-2 ring-blue-400`
                : `${config.className} hover:opacity-80`
            }`}
            onClick={() => handleOverlayChange(overlay)}
            aria-pressed={isActive}
          >
            {config.label}
          </button>
        );
      })}
    </div>
  );
};

export default NarrativeOverlaySelector;
