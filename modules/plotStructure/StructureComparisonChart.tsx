// MCP Context Block
/*
{
  file: "modules/plotStructure/StructureComparisonChart.tsx",
  role: "developer",
  allowedActions: ["scaffold", "visualize", "connect"],
  tier: "Pro",
  contentSensitivity: "medium",
  theme: "story_engineering"
}
*/

// React import removed - not used directly
import type { PlotBeat, PlotStructureAnalysis } from './initPlotEngine';
import type {
  ArcPlotOverlay,
  EmotionalGapAnalysis,
  EmotionalTensionAnalysis,
} from './structureSuggestionEngine';

interface StructureComparisonChartProps {
  frameworkBeats: PlotBeat[];
  storyBeats: PlotBeat[];
  analysis: PlotStructureAnalysis;
  emotionalOverlays?: ArcPlotOverlay[];
  emotionalGaps?: EmotionalGapAnalysis[];
  tensionAnalysis?: EmotionalTensionAnalysis[];
  className?: string;
  'aria-label'?: string;
}

export default function StructureComparisonChart({
  frameworkBeats,
  storyBeats,
  analysis,
  emotionalOverlays = [],
  emotionalGaps = [],
  tensionAnalysis = [],
  className = '',
  'aria-label': ariaLabel = 'Structure Comparison Chart',
}: StructureComparisonChartProps) {
  // For simplicity, render a horizontal bar for each beat, color-coded by match/mismatch
  const beatMap = new Map(storyBeats.map(b => [b.id, b]));

  // Create emotional overlay map
  const overlayMap = new Map(emotionalOverlays.map(o => [o.beatId, o]));

  return (
    <div
      className={`w-full p-4 bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}
      role="region"
      aria-label={ariaLabel}
    >
      <h3 className="text-lg font-semibold mb-2">Structure Comparison</h3>

      {/* Basic structure comparison */}
      <div className="flex flex-col space-y-1 mb-4">
        {frameworkBeats.map(beat => {
          const matched = beatMap.has(beat.id);
          const overlay = overlayMap.get(beat.id);

          return (
            <div key={beat.id} className="flex items-center">
              <div
                className={`w-32 text-xs font-medium ${matched ? 'text-green-700' : 'text-red-700'}`}
                aria-label={beat.label}
              >
                {beat.label}
              </div>
              <div
                className={`flex-1 h-3 ml-2 rounded ${matched ? 'bg-green-200' : 'bg-red-200'}`}
                title={matched ? 'Present in story' : 'Missing in story'}
                aria-label={matched ? 'Present' : 'Missing'}
              />
              {matched ? (
                <span className="ml-2 text-xs text-green-600">✓</span>
              ) : (
                <span className="ml-2 text-xs text-red-600">✗</span>
              )}

              {/* Emotional alignment indicator */}
              {overlay && (
                <div
                  className={`ml-2 px-2 py-1 rounded text-xs ${
                    overlay.alignment === 'strong'
                      ? 'bg-blue-100 text-blue-700'
                      : overlay.alignment === 'moderate'
                        ? 'bg-yellow-100 text-yellow-700'
                        : overlay.alignment === 'weak'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-red-100 text-red-700'
                  }`}
                >
                  {overlay.alignment}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Emotional analysis summary */}
      {emotionalOverlays.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded">
          <h4 className="text-sm font-medium mb-2">Emotional Alignment</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="font-medium">Strong:</span>{' '}
              {emotionalOverlays.filter(o => o.alignment === 'strong').length}
            </div>
            <div>
              <span className="font-medium">Mismatch:</span>{' '}
              {emotionalOverlays.filter(o => o.alignment === 'mismatch').length}
            </div>
            <div>
              <span className="font-medium">Avg Tension:</span>{' '}
              {Math.round(
                emotionalOverlays.reduce((sum, o) => sum + o.tensionLevel, 0) /
                  emotionalOverlays.length
              )}
            </div>
            <div>
              <span className="font-medium">Avg Engagement:</span>{' '}
              {Math.round(
                emotionalOverlays.reduce(
                  (sum, o) => sum + o.engagementLevel,
                  0
                ) / emotionalOverlays.length
              )}
            </div>
          </div>
        </div>
      )}

      {/* Emotional gaps */}
      {emotionalGaps.length > 0 && (
        <div className="mt-4 p-3 bg-red-50 rounded">
          <h4 className="text-sm font-medium mb-2 text-red-700">
            Emotional Gaps
          </h4>
          <div className="space-y-1">
            {emotionalGaps.map((gap, index) => (
              <div key={index} className="text-xs text-red-600">
                <span className="font-medium">{gap.gapType}:</span>{' '}
                {gap.description}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tension analysis */}
      {tensionAnalysis.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded">
          <h4 className="text-sm font-medium mb-2 text-blue-700">
            Tension Consistency
          </h4>
          <div className="space-y-1">
            {tensionAnalysis.map((analysis, index) => (
              <div key={index} className="text-xs">
                <span className="font-medium">{analysis.act}:</span>{' '}
                {analysis.consistency}({Math.round(analysis.actualTension)} vs{' '}
                {analysis.expectedTension})
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-2 text-xs text-gray-500">
        Green: Present in story. Red: Missing in story.
      </div>
    </div>
  );
}
