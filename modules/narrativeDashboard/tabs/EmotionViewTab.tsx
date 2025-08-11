export const mcpContext = {
  file: 'modules/narrativeDashboard/tabs/EmotionViewTab.tsx',
  role: 'developer',
  allowedActions: ['refactor', 'type-harden', 'test'],
  contentSensitivity: 'low',
  theme: 'doccraft-ai',
};

import React, { Suspense, useMemo } from 'react';
import type { NarrativeSyncState } from '../../shared/state/useNarrativeSyncContext';
import type {
  TensionPoint,
  EmotionalBeat,
} from '../../emotionArc/types/emotionTypes';
import { clamp100 } from '../../emotionArc/utils/scaling';
import EmotionTimelineChart from '../../emotionArc/components/EmotionTimelineChart';
import TensionCurveViewer from '../../emotionArc/components/TensionCurveViewer';
import NarrativeOverlaySelector from '../NarrativeOverlaySelector';
import SceneInspectorPanel from '../SceneInspectorPanel';

export interface EmotionViewTabProps {
  narrativeSync?: NarrativeSyncState;
}

export const EmotionViewTab: React.FC<EmotionViewTabProps> = ({
  narrativeSync,
}) => {
  const characterFocusId = narrativeSync?.characterFocusId;

  // TODO: Replace with real async data from arcSimulator and emotionAnalyzer
  // const arcData = arcSimulator.getArcSimulation(currentSceneId, characterFocusId);
  // const emotionBeats = emotionAnalyzer.analyzeStoryEmotions(currentSceneId);
  // For now, use mock data
  const tensionCurve: TensionPoint[] = useMemo(
    () => [
      {
        position: 0.1,
        tension: clamp100(10),
        empathy: clamp100(20),
        engagement: clamp100(30),
      },
      {
        position: 0.3,
        tension: clamp100(30),
        empathy: clamp100(40),
        engagement: clamp100(50),
      },
      {
        position: 0.5,
        tension: clamp100(60),
        empathy: clamp100(50),
        engagement: clamp100(60),
      },
      {
        position: 0.7,
        tension: clamp100(40),
        empathy: clamp100(70),
        engagement: clamp100(40),
      },
      {
        position: 0.8,
        tension: clamp100(80),
        empathy: clamp100(60),
        engagement: clamp100(70),
      },
      {
        position: 1.0,
        tension: clamp100(50),
        empathy: clamp100(80),
        engagement: clamp100(80),
      },
    ],
    []
  );

  const emotionBeats: EmotionalBeat[] = useMemo(
    () => [
      {
        id: 'beat1',
        sceneId: 'scene1',
        characterId: 'char1',
        emotion: 'joy',
        intensity: clamp100(70),
        timestamp: Date.now(),
      },
      {
        id: 'beat2',
        sceneId: 'scene2',
        characterId: 'char2',
        emotion: 'fear',
        intensity: clamp100(50),
        timestamp: Date.now(),
      },
      {
        id: 'beat3',
        sceneId: 'scene3',
        characterId: 'char1',
        emotion: 'anger',
        intensity: clamp100(60),
        timestamp: Date.now(),
      },
      {
        id: 'beat4',
        sceneId: 'scene4',
        characterId: 'char2',
        emotion: 'sadness',
        intensity: clamp100(80),
        timestamp: Date.now(),
      },
      {
        id: 'beat5',
        sceneId: 'scene5',
        characterId: 'char1',
        emotion: 'anticipation',
        intensity: clamp100(40),
        timestamp: Date.now(),
      },
      {
        id: 'beat6',
        sceneId: 'scene6',
        characterId: 'char2',
        emotion: 'trust',
        intensity: clamp100(90),
        timestamp: Date.now(),
      },
    ],
    []
  );

  return (
    <section
      className="w-full h-full grid grid-cols-1 lg:grid-cols-4 gap-4"
      aria-label="Emotion View Tab"
    >
      {/* Main emotional arc and overlays */}
      <div className="lg:col-span-3 flex flex-col gap-4 relative">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold" id="emotion-timeline-heading">
            Emotional Arc
          </h2>
          <Suspense fallback={<div>Loading overlays...</div>}>
            <NarrativeOverlaySelector />
          </Suspense>
        </div>
        <Suspense fallback={<div>Loading emotion timeline...</div>}>
          <EmotionTimelineChart
            emotionalBeats={emotionBeats}
            selectedCharacter={characterFocusId || 'all'}
            aria-labelledby="emotion-timeline-heading"
          />
        </Suspense>
        <Suspense fallback={<div>Loading tension curve...</div>}>
          <TensionCurveViewer
            tensionCurve={tensionCurve}
            emotionalPeaks={[]}
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

export default EmotionViewTab;
