export const mcpContext = {
  file: 'modules/narrativeDashboard/tabs/PlotViewTab.tsx',
  role: 'developer',
  allowedActions: ['refactor', 'type-harden', 'test'],
  contentSensitivity: 'low',
  theme: 'doccraft-ai',
};

import React, { Suspense, useMemo } from 'react';
import type { NarrativeSyncState } from '../../shared/state/useNarrativeSyncContext';
import { plotFrameworkPresets } from '../../plotStructure/configs/frameworkConfigs';
import type {
  PlotFramework,
  PlotBeat,
  PlotStructureAnalysis,
} from '../../plotStructure/initPlotEngine';
import { toDecimal } from '../../emotionArc/utils/scaling';

const PlotFrameworkTimeline = React.lazy(
  () => import('../../plotStructure/PlotFrameworkTimeline')
);
const StructureComparisonChart = React.lazy(
  () => import('../../plotStructure/StructureComparisonChart')
);
import SceneInspectorPanel from '../SceneInspectorPanel';
import NarrativeOverlaySelector from '../NarrativeOverlaySelector';

export interface PlotViewTabProps {
  narrativeSync?: NarrativeSyncState;
}

export const PlotViewTab: React.FC<PlotViewTabProps> = ({ narrativeSync }) => {
  const currentSceneId = narrativeSync?.currentSceneId;
  const activePlotFramework = narrativeSync?.activePlotFramework;

  // Map PlotFrameworkPreset to PlotFramework and PlotBeat[]
  const frameworkPreset = useMemo(
    () =>
      plotFrameworkPresets.find(f => f.id === activePlotFramework) ||
      plotFrameworkPresets[0],
    [activePlotFramework]
  );

  // For demo, convert preset beats to PlotBeat[] (mocked fields)
  const framework: PlotFramework = {
    id: frameworkPreset.id,
    name: frameworkPreset.name,
    description: frameworkPreset.name,
    genre: 'drama',
    complexity: 'moderate',
    beats: [],
  };

  const frameworkBeats: PlotBeat[] = frameworkPreset.beats.map(b => ({
    id: b.id,
    name: b.name,
    label: b.name,
    description: b.description,
    act: Math.floor(toDecimal(b.position) * 3) + 1,
    position: toDecimal(b.position),
    tensionLevel: 50,
    isStructural: true,
    framework,
  }));

  // TODO: Replace with real story beats and analysis
  const storyBeats: PlotBeat[] = frameworkBeats;
  const analysis: PlotStructureAnalysis = {
    missingBeats: [],
    extraScenes: [],
    structureScore: 75,
    actBreakdown: {
      act1: { scenes: 3, beats: 2, tension: 30 },
      act2: { scenes: 5, beats: 3, tension: 60 },
      act3: { scenes: 2, beats: 2, tension: 80 },
    },
    pacingIssues: [],
    characterArcAlignment: [],
  };

  return (
    <section
      className="w-full h-full grid grid-cols-1 lg:grid-cols-4 gap-4"
      aria-label="Plot View Tab"
    >
      {/* Main timeline and overlays */}
      <div className="lg:col-span-3 flex flex-col gap-4 relative">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold" id="plot-timeline-heading">
            Plot Timeline
          </h2>
          <Suspense fallback={<div>Loading overlays...</div>}>
            <NarrativeOverlaySelector />
          </Suspense>
        </div>
        <Suspense fallback={<div>Loading plot timeline...</div>}>
          <PlotFrameworkTimeline
            framework={framework}
            beats={frameworkBeats}
            currentSceneId={currentSceneId}
            aria-labelledby="plot-timeline-heading"
          />
        </Suspense>
        <Suspense fallback={<div>Loading structure comparison...</div>}>
          <StructureComparisonChart
            frameworkBeats={frameworkBeats}
            storyBeats={storyBeats}
            analysis={analysis}
          />
        </Suspense>
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-1 flex flex-col gap-4">
        <SceneInspectorPanel narrativeSync={narrativeSync} />
      </div>
    </section>
  );
};

export default PlotViewTab;
