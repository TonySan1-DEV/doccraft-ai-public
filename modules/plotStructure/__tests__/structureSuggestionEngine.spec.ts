// MCP Context Block
/*
{
  file: "modules/plotStructure/__tests__/structureSuggestionEngine.spec.ts",
  role: "qa",
  allowedActions: ["test", "validate", "mock"],
  theme: "emotional_alignment"
}
*/

import { describe, it, expect } from '@jest/globals';
import { StructureSuggestionEngine } from '../structureSuggestionEngine';
import { FrameworkConfigs } from '../frameworkConfigs';
import type {
  SceneEmotionData,
  EmotionalBeat,
} from '../../emotionArc/types/emotionTypes';

describe('StructureSuggestionEngine emotional integration', () => {
  const engine = new StructureSuggestionEngine();
  const frameworkBeats = FrameworkConfigs.HerosJourney;

  const mockSceneData: SceneEmotionData[] = [
    {
      sceneId: 'scene1',
      sceneText: 'Hero discovers the call to adventure',
      characterEmotions: new Map([
        [
          'hero',
          {
            primaryEmotion: 'fear',
            intensity: 70,
            confidence: 0.9,
            secondaryEmotions: ['uncertainty'],
            emotionalComplexity: 60,
            contextClues: ['hesitation', 'doubt'],
            modelConfidence: 0.85,
            processingTime: 100,
          },
        ],
      ]),
      overallSentiment: 'apprehensive',
      tensionLevel: 65,
      emotionalBeats: [],
      processingMetadata: {
        wordCount: 50,
        characterCount: 200,
        analysisTime: 150,
      },
    },
    {
      sceneId: 'scene2',
      sceneText: 'Hero faces the ultimate challenge',
      characterEmotions: new Map([
        [
          'hero',
          {
            primaryEmotion: 'determination',
            intensity: 90,
            confidence: 0.95,
            secondaryEmotions: ['courage'],
            emotionalComplexity: 80,
            contextClues: ['resolve', 'strength'],
            modelConfidence: 0.9,
            processingTime: 120,
          },
        ],
      ]),
      overallSentiment: 'resolute',
      tensionLevel: 85,
      emotionalBeats: [],
      processingMetadata: {
        wordCount: 60,
        characterCount: 250,
        analysisTime: 180,
      },
    },
  ];

  it('maps emotional beats to framework beats', () => {
    const overlays = engine.mapEmotionalBeatsToFramework(
      mockSceneData,
      frameworkBeats
    );

    expect(overlays).toHaveLength(2);
    expect(overlays[0]).toHaveProperty('sceneId', 'scene1');
    expect(overlays[0]).toHaveProperty('beatId');
    expect(overlays[0]).toHaveProperty('tensionLevel');
    expect(overlays[0]).toHaveProperty('alignment');
  });

  it('detects emotional gaps in story structure', () => {
    const overlays = engine.mapEmotionalBeatsToFramework(
      mockSceneData,
      frameworkBeats
    );
    const gaps = engine.detectEmotionalGaps(overlays, frameworkBeats);

    // Should detect gaps if tension is too low
    expect(Array.isArray(gaps)).toBe(true);
  });

  it('analyzes tension consistency across acts', () => {
    const overlays = engine.mapEmotionalBeatsToFramework(
      mockSceneData,
      frameworkBeats
    );
    const tensionAnalysis = engine.analyzeTensionConsistency(overlays);

    expect(Array.isArray(tensionAnalysis)).toBe(true);
    if (tensionAnalysis.length > 0) {
      expect(tensionAnalysis[0]).toHaveProperty('act');
      expect(tensionAnalysis[0]).toHaveProperty('actualTension');
      expect(tensionAnalysis[0]).toHaveProperty('expectedTension');
      expect(tensionAnalysis[0]).toHaveProperty('consistency');
    }
  });

  it('generates improvement suggestions for emotional misalignments', () => {
    const overlays = engine.mapEmotionalBeatsToFramework(
      mockSceneData,
      frameworkBeats
    );
    const gaps = engine.detectEmotionalGaps(overlays, frameworkBeats);
    const tensionAnalysis = engine.analyzeTensionConsistency(overlays);

    const suggestions = engine.generateEmotionalImprovements(
      overlays,
      gaps,
      tensionAnalysis
    );

    expect(Array.isArray(suggestions)).toBe(true);
  });

  it('calculates proper alignment between emotional intensity and beat type', () => {
    const overlays = engine.mapEmotionalBeatsToFramework(
      mockSceneData,
      frameworkBeats
    );

    overlays.forEach(overlay => {
      expect(['strong', 'moderate', 'weak', 'mismatch']).toContain(
        overlay.alignment
      );
      expect(overlay.tensionLevel).toBeGreaterThanOrEqual(0);
      expect(overlay.tensionLevel).toBeLessThanOrEqual(100);
      expect(overlay.engagementLevel).toBeGreaterThanOrEqual(0);
      expect(overlay.engagementLevel).toBeLessThanOrEqual(100);
    });
  });
});
