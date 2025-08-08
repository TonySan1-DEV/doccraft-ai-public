// MCP Context Block
/*
{
  file: "modules/plotStructure/PlotSuggestionPanel.tsx",
  role: "developer",
  allowedActions: ["scaffold", "suggest", "visualize"],
  tier: "Pro",
  contentSensitivity: "medium",
  theme: "story_engineering"
}
*/

// React import removed - not used directly
import type { ScenePlacementSuggestion } from './initPlotEngine';

interface PlotSuggestionPanelProps {
  suggestions: ScenePlacementSuggestion[];
  isLoading?: boolean;
  error?: string | null;
  onSuggestionClick?: (suggestion: ScenePlacementSuggestion) => void;
  className?: string;
  'aria-label'?: string;
}

export default function PlotSuggestionPanel({
  suggestions,
  isLoading = false,
  error = null,
  onSuggestionClick,
  className = '',
  'aria-label': ariaLabel = 'Plot Suggestion Panel',
}: PlotSuggestionPanelProps) {
  return (
    <div
      className={`w-full p-4 bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}
      role="region"
      aria-label={ariaLabel}
    >
      <h3 className="text-lg font-semibold mb-2">AI Structural Suggestions</h3>
      {isLoading ? (
        <div className="text-blue-600">Analyzing structure...</div>
      ) : error ? (
        <div className="text-red-600" role="alert">
          {error}
        </div>
      ) : suggestions.length === 0 ? (
        <div className="text-gray-500">No suggestions available.</div>
      ) : (
        <ul className="space-y-2">
          {suggestions.map(s => (
            <li key={s.sceneId}>
              <button
                onClick={() => onSuggestionClick?.(s)}
                className="w-full text-left px-3 py-2 rounded hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label={`Suggestion for scene ${s.sceneId}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-800">
                    Scene {s.sceneId}
                  </span>
                  <span className="text-xs text-blue-600">
                    Act {s.recommendedAct} – {s.recommendedBeat}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Confidence: {Math.round(s.confidence * 100)}%
                </div>
                {s.notes && s.notes.length > 0 && (
                  <ul className="text-xs text-gray-400 mt-1 list-disc list-inside">
                    {s.notes.map((note, idx) => (
                      <li key={idx}>{note}</li>
                    ))}
                  </ul>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
