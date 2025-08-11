// MCP Context Block
/*
{
  file: "modules/emotionArc/services/arcSimulator.ts",
  role: "developer",
  allowedActions: ["generate", "analyze", "extract"],
  tier: "Pro",
  contentSensitivity: "medium",
  theme: "writing_suite"
}
*/

import {
  ArcSegment,
  ReaderSimResult,
  EmotionalArc,
  TensionCurve,
  ArcSimulationResult,
  SceneEmotionData,
  ReaderProfile,
} from '../types/emotionTypes';
import {
  TENSION_EMOTIONS,
  VULNERABILITY_EMOTIONS,
  ENGAGEMENT_THRESHOLDS,
} from '../constants/emotions';

export class ArcSimulator {
  private defaultReaderProfile: ReaderProfile;

  constructor(defaultReaderProfile?: Partial<ReaderProfile>) {
    this.defaultReaderProfile = {
      id: 'default-reader',
      preferences: [],
      emotionalSensitivity: 50,
      genrePreferences: [],
      empathyLevel: 60,
      tensionTolerance: 70,
      emotionalComplexity: 50,
      preferredGenres: [],
      readingSpeed: 'medium',
      attentionSpan: 45,
      ...defaultReaderProfile,
    };
  }

  /**
   * Generates arc simulation from scene data
   */
  generateArcSimulation(
    sceneData: SceneEmotionData[],
    characterProfiles?: Map<string, any>
  ): ArcSimulationResult {
    const tensionCurve: TensionCurve = [];
    const emotionalPeaks: number[] = [];

    // Normalize scene positions
    const totalScenes = sceneData.length;

    sceneData.forEach((scene, index) => {
      const position = index / (totalScenes - 1);

      // Calculate tension based on scene emotions
      const tension = this.calculateSceneTension(scene);

      // Calculate empathy potential
      const empathy = this.calculateEmpathyPotential(scene, characterProfiles);

      // Calculate engagement (combination of tension and empathy)
      const engagement = tension * 0.6 + empathy * 0.4;

      // Calculate emotional complexity
      const emotionalComplexity = this.calculateEmotionalComplexity(scene);

      tensionCurve.push({
        position,
        tension,
        empathy,
        engagement,
        emotionalComplexity,
      });

      // Identify emotional peaks (high tension or empathy)
      if (tension > 70 || empathy > 70) {
        emotionalPeaks.push(position);
      }
    });

    // Analyze pacing
    const pacingAnalysis = this.analyzePacing(tensionCurve);

    // Predict reader engagement
    const readerEngagement = this.predictReaderEngagement(tensionCurve);

    return {
      curve: tensionCurve,
      tensionCurve: tensionCurve, // For backward compatibility
      emotionalPeaks,
      pacingAnalysis,
      readerEngagement,
    };
  }

  /**
   * Generates arc segments for visualization
   */
  generateArcSegments(
    tensionCurve: TensionCurve,
    sceneData: SceneEmotionData[]
  ): ArcSegment[] {
    const segments: ArcSegment[] = [];

    // Group scenes into emotional segments
    let currentSegment: ArcSegment = {
      start: 0,
      end: 0,
      avgTension: 0,
      label: '',
      id: '',
      emotionalTheme: '',
      intensity: 0,
      tensionLevel: 0,
      sceneIds: [],
      characterIds: [],
      emotionalComplexity: 0,
    };

    tensionCurve.forEach((point, index) => {
      const scene = sceneData[index];

      // Determine if we should start a new segment
      const tensionChange =
        index > 0
          ? Math.abs(point.tension - tensionCurve[index - 1].tension)
          : 0;

      if (tensionChange > 25 || index === 0) {
        // End previous segment
        if (index > 0) {
          segments.push(currentSegment);
        }

        // Start new segment
        currentSegment = {
          start: point.position,
          end: point.position,
          avgTension: point.tension,
          label: scene.overallSentiment || 'neutral',
          id: `segment-${index}`,
          emotionalTheme: scene.overallSentiment || 'neutral',
          intensity: point.tension,
          tensionLevel: point.tension,
          sceneIds: [scene.sceneId],
          characterIds: Array.from(scene.characterEmotions?.keys() || []),
          emotionalComplexity: point.emotionalComplexity || 0,
        };
      } else {
        // Extend current segment
        currentSegment.end = point.position;
        currentSegment.avgTension = Math.max(
          currentSegment.avgTension || 0,
          point.tension
        );
        currentSegment.tensionLevel = Math.max(
          currentSegment.tensionLevel ?? currentSegment.avgTension ?? 0,
          point.tension
        );
        currentSegment.intensity = Math.max(
          currentSegment.intensity || 0,
          point.tension
        );
        if (scene.sceneId) {
          currentSegment.sceneIds?.push(scene.sceneId);
        }
        if (scene.characterEmotions) {
          currentSegment.characterIds?.push(
            ...Array.from(scene.characterEmotions.keys())
          );
        }
        currentSegment.emotionalComplexity = Math.max(
          currentSegment.emotionalComplexity || 0,
          point.emotionalComplexity || 0
        );
      }
    });

    // Add final segment
    segments.push(currentSegment);

    return segments;
  }

  /**
   * Simulates reader response to emotional arcs
   */
  simulateReaderResponse(
    arc: EmotionalArc,
    readerProfile?: ReaderProfile
  ): ReaderSimResult {
    const profile = readerProfile || this.defaultReaderProfile;

    const empathyScore = this.calculateReaderEmpathy(arc, profile);
    const predictedEngagementDrop = this.detectEngagementDrops(arc);

    const tensionCurve =
      arc.segments?.map(segment => ({
        position: (segment.start + segment.end) / 2,
        tension: segment.tensionLevel ?? segment.avgTension ?? 0,
      })) || [];

    const engagementDrops = this.identifyEngagementDrops(arc);
    const highEngagementSections = this.identifyHighEngagementSections(arc);

    return {
      emotionalResponse: 'neutral',
      engagement: empathyScore * 0.6 + (arc.overallTension || 0) * 0.4,
      empathy: empathyScore,
      empathyScore,
      predictedEngagementDrop,
      engagementDrops,
      highEngagementSections,
      tensionCurve,
    };
  }

  /**
   * Calculates scene tension level
   */
  private calculateSceneTension(scene: SceneEmotionData): number {
    const tensionEmotions = TENSION_EMOTIONS;
    let totalTension = 0;
    let emotionCount = 0;

    scene.characterEmotions?.forEach(emotion => {
      if (tensionEmotions.includes(emotion.primaryEmotion)) {
        totalTension += emotion.intensity * 0.8;
      } else {
        totalTension += emotion.intensity * 0.3;
      }
      emotionCount++;
    });

    return emotionCount > 0 ? Math.min(100, totalTension / emotionCount) : 0;
  }

  /**
   * Calculates empathy potential for a scene
   */
  private calculateEmpathyPotential(
    scene: SceneEmotionData,
    characterProfiles?: Map<string, any>
  ): number {
    let totalEmpathy = 0;
    let characterCount = 0;

    scene.characterEmotions?.forEach((emotion, characterId) => {
      const profile = characterProfiles?.get(characterId);
      const empathyPotential = profile?.empathyPotential || 50;

      // Empathy is higher for vulnerable emotions
      const empathyMultiplier = VULNERABILITY_EMOTIONS.includes(
        emotion.primaryEmotion
      )
        ? 1.2
        : 0.8;

      totalEmpathy += emotion.intensity * empathyMultiplier * empathyPotential;
      characterCount++;
    });

    return characterCount > 0
      ? Math.min(100, totalEmpathy / characterCount)
      : 0;
  }

  /**
   * Calculates emotional complexity for a scene
   */
  private calculateEmotionalComplexity(scene: SceneEmotionData): number {
    const emotions = Array.from(scene.characterEmotions?.values() || []);
    const uniqueEmotions = new Set(emotions.map(e => e.primaryEmotion));

    // Base complexity on number of unique emotions
    let complexity = (uniqueEmotions.size - 1) * 25;

    // Add complexity for emotional transitions
    if (emotions.length > 1) {
      const intensityChanges = emotions
        .slice(1)
        .map((emotion, index) =>
          Math.abs(emotion.intensity - emotions[index].intensity)
        );
      const avgChange =
        intensityChanges.reduce((sum, change) => sum + change, 0) /
        intensityChanges.length;
      complexity += Math.min(50, avgChange * 0.5);
    }

    return Math.min(100, complexity);
  }

  /**
   * Analyzes pacing of the tension curve
   */
  private analyzePacing(tensionCurve: TensionCurve): {
    slowSections: number[];
    fastSections: number[];
    optimalPacing: number[];
    pacingScore: number;
  } {
    const slowSections: number[] = [];
    const fastSections: number[] = [];
    const optimalPacing: number[] = [];

    // Analyze tension changes to determine pacing
    for (let i = 1; i < tensionCurve.length; i++) {
      const tensionChange =
        (tensionCurve[i]?.tension ?? 0) - (tensionCurve[i - 1]?.tension ?? 0);
      const position = tensionCurve[i].position;

      if (Math.abs(tensionChange) < 10) {
        slowSections.push(position ?? 0);
      } else if (Math.abs(tensionChange) > 30) {
        fastSections.push(position ?? 0);
      } else {
        optimalPacing.push(position ?? 0);
      }
    }

    // Calculate pacing score
    const totalSections =
      slowSections.length + fastSections.length + optimalPacing.length;
    const pacingScore =
      totalSections > 0 ? (optimalPacing.length / totalSections) * 100 : 50;

    return { slowSections, fastSections, optimalPacing, pacingScore };
  }

  /**
   * Predicts reader engagement patterns
   */
  private predictReaderEngagement(tensionCurve: TensionCurve): {
    predictedDrops: number[];
    highEngagementSections: number[];
    emotionalComplexity: number;
    overallEngagement: number;
  } {
    const predictedDrops: number[] = [];
    const highEngagementSections: number[] = [];

    // Calculate emotional complexity
    const emotions = tensionCurve.map(point => point.tension);
    const emotionalComplexity = this.calculateEmotionalComplexityFromCurve(
      emotions.filter((e): e is number => e !== undefined)
    );

    // Identify engagement drops (low tension + low empathy)
    tensionCurve.forEach(point => {
      if ((point.engagement || 0) < ENGAGEMENT_THRESHOLDS.low_engagement) {
        predictedDrops.push(point.position);
      } else if (
        (point.engagement || 0) > ENGAGEMENT_THRESHOLDS.high_engagement
      ) {
        highEngagementSections.push(point.position);
      }
    });

    // Calculate overall engagement
    const overallEngagement =
      tensionCurve.reduce((sum, point) => sum + (point.engagement || 0), 0) /
      tensionCurve.length;

    return {
      predictedDrops,
      highEngagementSections,
      emotionalComplexity,
      overallEngagement,
    };
  }

  /**
   * Calculates emotional complexity from tension curve
   */
  private calculateEmotionalComplexityFromCurve(emotions: number[]): number {
    if (emotions.length < 2) return 0;

    // Calculate variance in emotional intensity
    const mean =
      emotions.reduce((sum, emotion) => sum + emotion, 0) / emotions.length;
    const variance =
      emotions.reduce((sum, emotion) => sum + Math.pow(emotion - mean, 2), 0) /
      emotions.length;

    // Normalize to 0-100 scale
    return Math.min(100, Math.sqrt(variance) * 2);
  }

  /**
   * Calculates reader empathy score
   */
  private calculateReaderEmpathy(
    arc: EmotionalArc,
    profile: ReaderProfile
  ): number {
    const vulnerabilityBeats = arc.beats.filter(beat =>
      VULNERABILITY_EMOTIONS.includes(beat.emotion)
    );

    const empathyScore = vulnerabilityBeats.reduce((total, beat) => {
      const empathyLevel = profile.empathyLevel || 60;
      return total + beat.intensity * empathyLevel;
    }, 0);

    return Math.min(100, empathyScore / Math.max(1, vulnerabilityBeats.length));
  }

  /**
   * Detects engagement drops in the arc
   */
  private detectEngagementDrops(arc: EmotionalArc): boolean {
    const lowTensionSegments =
      arc.segments?.filter(
        segment => (segment.tensionLevel ?? segment.avgTension ?? 0) < 30
      ) || [];
    const consecutiveLowTension = lowTensionSegments.length > 2;

    return consecutiveLowTension;
  }

  /**
   * Identifies specific engagement drop positions
   */
  private identifyEngagementDrops(arc: EmotionalArc): number[] {
    const drops: number[] = [];

    arc.segments?.forEach(segment => {
      if (
        (segment.tensionLevel ?? segment.avgTension ?? 0) <
        ENGAGEMENT_THRESHOLDS.low_engagement
      ) {
        drops.push((segment.start + segment.end) / 2);
      }
    });

    return drops;
  }

  /**
   * Identifies high engagement sections
   */
  private identifyHighEngagementSections(arc: EmotionalArc): number[] {
    const sections: number[] = [];

    arc.segments?.forEach(segment => {
      if (
        (segment.tensionLevel ?? segment.avgTension ?? 0) >
        ENGAGEMENT_THRESHOLDS.high_engagement
      ) {
        sections.push((segment.start + segment.end) / 2);
      }
    });

    return sections;
  }

  /**
   * Updates default reader profile
   */
  updateDefaultReaderProfile(profile: Partial<ReaderProfile>): void {
    this.defaultReaderProfile = { ...this.defaultReaderProfile, ...profile };
  }

  /**
   * Gets current default reader profile
   */
  getDefaultReaderProfile(): ReaderProfile {
    return { ...this.defaultReaderProfile };
  }
}
