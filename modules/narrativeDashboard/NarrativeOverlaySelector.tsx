// MCP Context Block
/*
role: frontend-developer,
tier: Pro,
file: "modules/narrativeDashboard/NarrativeOverlaySelector.tsx",
allowedActions: ["scaffold", "visualize"],
theme: "dashboard"
*/

import React from 'react';

const NarrativeOverlaySelector: React.FC = () => (
  <div aria-label="Narrative Overlay Selector" className="flex gap-2">
    <button className="px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs">Emotion Arc</button>
    <button className="px-2 py-1 rounded bg-green-100 text-green-800 text-xs">Beat Overlay</button>
    <button className="px-2 py-1 rounded bg-purple-100 text-purple-800 text-xs">POV Path</button>
  </div>
);

export default NarrativeOverlaySelector; 