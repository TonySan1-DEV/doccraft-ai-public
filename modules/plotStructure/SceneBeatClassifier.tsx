// MCP Context Block
/*
{
  file: "modules/plotStructure/SceneBeatClassifier.tsx",
  role: "developer",
  allowedActions: ["scaffold", "visualize", "connect"],
  tier: "Pro",
  contentSensitivity: "medium",
  theme: "story_engineering"
}
*/

import React from 'react';
import type { PlotBeat } from './initPlotEngine';

interface SceneBeatClassifierProps {
  sceneId: string;
  sceneText: string;
  beats: PlotBeat[];
  selectedBeatId?: string;
  onClassify: (sceneId: string, beatId: string) => void;
  className?: string;
  'aria-label'?: string;
}

export default function SceneBeatClassifier({
  sceneId,
  sceneText,
  beats,
  selectedBeatId,
  onClassify,
  className = '',
  'aria-label': ariaLabel = 'Scene Beat Classifier'
}: SceneBeatClassifierProps) {
  return (
    <div
      className={`w-full p-4 bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}
      role="region"
      aria-label={ariaLabel}
    >
      <h3 className="text-lg font-semibold mb-2">Classify Scene to Plot Beat</h3>
      <div className="mb-2 text-xs text-gray-500">Scene: <span className="font-mono text-gray-700">{sceneId}</span></div>
      <div className="mb-3 p-2 bg-gray-50 rounded text-xs text-gray-700 max-h-24 overflow-y-auto">{sceneText}</div>
      <div className="flex flex-wrap gap-2">
        {beats.map((beat) => (
          <button
            key={beat.id}
            onClick={() => onClassify(sceneId, beat.id)}
            className={`px-3 py-1 rounded text-xs font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              selectedBeatId === beat.id ? 'bg-blue-600 text-white border-blue-700' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-50'
            }`}
            aria-pressed={selectedBeatId === beat.id}
            aria-label={`Classify as ${beat.label}`}
            tabIndex={0}
          >
            {beat.label}
          </button>
        ))}
      </div>
    </div>
  );
} 