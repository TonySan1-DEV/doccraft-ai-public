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
  EmotionalBeat,
  ArcSegment,
  ReaderSimResult,
  EmotionalArc,
  TensionCurve,
  ArcSimulationResult,
  SceneEmotionData,
  ReaderProfile
} from '../types/emotionTypes';
import { TENSION_EMOTIONS, VULNERABILITY_EMOTIONS, ENGAGEMENT_THRESHOLDS } from '../constants/emotions';

export class ArcSimulator {
  private defaultReaderProfile: ReaderProfile;

  constructor(defaultReaderProfile?: Partial<ReaderProfile>) {
    this.defaultReaderProfile = {
      empathyLevel: 60,
      tensionTolerance: 70,
      emotionalComplexity: 50,
      preferredGenres: [],
      readingSpeed: 'medium',
      attentionSpan: 45,
      ...defaultReaderProfile
    };
  }

  /**
   * Generates arc simulation from scene data
   */
  generateArcSimulation(
    sceneData: SceneEmotionData[],
    characterProfiles?: Map<string, any>
  ): ArcSimulationResult {
    const tensionCurve: TensionCurve[] = [];
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
      const engagement = (tension * 0.6) + (empathy * 0.4);
      
      // Calculate emotional complexity
      const emotionalComplexity = this.calculateEmotionalComplexity(scene);
      
      tensionCurve.push({
        position,
        tension,
        empathy,
        engagement,
        emotionalComplexity
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
      tensionCurve,
      emotionalPeaks,
      pacingAnalysis,
      readerEngagement
    };
  }

  /**
   * Generates arc segments for visualization
   */
  generateArcSegments(
    tensionCurve: TensionCurve[],
    sceneData: SceneEmotionData[]
  ): ArcSegment[] {
    const segments: ArcSegment[] = [];
    
    // Group scenes into emotional segments
    let currentSegment: ArcSegment = {
      start: 0,
      end: 0,
      tensionLevel: 0,
      sentiment: '',
      feedback: [],
      characterIds: [],
      sceneIds: [],
      emotionalComplexity: 0
    };
    
    tensionCurve.forEach((curve, index) => {
      const scene = sceneData[index];
      
      // Determine if we should start a new segment
      const tensionChange = index > 0 ? 
        Math.abs(curve.tension - tensionCurve[index - 1].tension) : 0;
      
      if (tensionChange > 25 || index === 0) {
        // End previous segment
        if (index > 0) {
          segments.push(currentSegment);
        }
        
        // Start new segment
        currentSegment = {
          start: curve.position,
          end: curve.position,
          tensionLevel: curve.tension,
          sentiment: scene.overallSentiment,
          feedback: this.generateSegmentFeedback(curve, scene),
          characterIds: Array.from(scene.characterEmotions.keys()),
          sceneIds: [scene.sceneId],
          emotionalComplexity: curve.emotionalComplexity
        };
      } else {
        // Extend current segment
        currentSegment.end = curve.position;
        currentSegment.tensionLevel = Math.max(currentSegment.tensionLevel, curve.tension);
        currentSegment.sceneIds.push(scene.sceneId);
        currentSegment.characterIds.push(...Array.from(scene.characterEmotions.keys()));
        currentSegment.emotionalComplexity = Math.max(currentSegment.emotionalComplexity, curve.emotionalComplexity);
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
    const notes = this.generateReaderNotes(arc, profile);
    const emotionalPeaks = arc.beats
      .filter(beat => beat.intensity > 70)
      .map(beat => beat.narrativePosition);
    
    const tensionCurve = arc.segments.map(segment => ({
      position: (segment.start + segment.end) / 2,
      tension: segment.tensionLevel
    }));

    const engagementDrops = this.identifyEngagementDrops(arc);
    const highEngagementSections = this.identifyHighEngagementSections(arc);

    return {
      empathyScore,
      predictedEngagementDrop,
      notes,
      emotionalPeaks,
      tensionCurve,
      engagementDrops,
      highEngagementSections
    };
  }

  /**
   * Calculates scene tension level
   */
  private calculateSceneTension(scene: SceneEmotionData): number {
    const tensionEmotions = TENSION_EMOTIONS;
    let totalTension = 0;
    let emotionCount = 0;
    
    scene.characterEmotions.forEach(emotion => {
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
    
    scene.characterEmotions.forEach((emotion, characterId) => {
      const profile = characterProfiles?.get(characterId);
      const empathyPotential = profile?.empathyPotential || 50;
      
      // Empathy is higher for vulnerable emotions
      const empathyMultiplier = VULNERABILITY_EMOTIONS.includes(emotion.primaryEmotion) ? 1.2 : 0.8;
      
      totalEmpathy += (emotion.intensity * empathyMultiplier * empathyPotential) / 100;
      characterCount++;
    });
    
    return characterCount > 0 ? Math.min(100, totalEmpathy / characterCount) : 0;
  }

  /**
   * Calculates emotional complexity for a scene
   */
  private calculateEmotionalComplexity(scene: SceneEmotionData): number {
    const emotions = Array.from(scene.characterEmotions.values());
    const uniqueEmotions = new Set(emotions.map(e => e.primaryEmotion));
    
    // Base complexity on number of unique emotions
    let complexity = (uniqueEmotions.size - 1) * 25;
    
    // Add complexity for emotional transitions
    if (emotions.length > 1) {
      const intensityChanges = emotions.slice(1).map((emotion, index) => 
        Math.abs(emotion.intensity - emotions[index].intensity)
      );
      const avgChange = intensityChanges.reduce((sum, change) => sum + change, 0) / intensityChanges.length;
      complexity += Math.min(50, avgChange * 0.5);
    }
    
    return Math.min(100, complexity);
  }

  /**
   * Analyzes pacing of the tension curve
   */
  private analyzePacing(tensionCurve: TensionCurve[]): {
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
      const tensionChange = tensionCurve[i].tension - tensionCurve[i-1].tension;
      const position = tensionCurve[i].position;
      
      if (Math.abs(tensionChange) < 10) {
        slowSections.push(position);
      } else if (Math.abs(tensionChange) > 30) {
        fastSections.push(position);
      } else {
        optimalPacing.push(position);
      }
    }
    
    // Calculate pacing score
    const totalSections = slowSections.length + fastSections.length + optimalPacing.length;
    const pacingScore = totalSections > 0 ? 
      (optimalPacing.length / totalSections) * 100 : 50;
    
    return { slowSections, fastSections, optimalPacing, pacingScore };
  }

  /**
   * Predicts reader engagement patterns
   */
  private predictReaderEngagement(tensionCurve: TensionCurve[]): {
    predictedDrops: number[];
    highEngagementSections: number[];
    emotionalComplexity: number;
    overallEngagement: number;
  } {
    const predictedDrops: number[] = [];
    const highEngagementSections: number[] = [];
    
    // Calculate emotional complexity
    const emotions = tensionCurve.map(curve => curve.tension);
    const emotionalComplexity = this.calculateEmotionalComplexityFromCurve(emotions);
    
    // Identify engagement drops (low tension + low empathy)
    tensionCurve.forEach(curve => {
      if (curve.engagement < ENGAGEMENT_THRESHOLDS.low_engagement) {
        predictedDrops.push(curve.position);
      } else if (curve.engagement > ENGAGEMENT_THRESHOLDS.high_engagement) {
        highEngagementSections.push(curve.position);
      }
    });
    
    // Calculate overall engagement
    const overallEngagement = tensionCurve.reduce((sum, curve) => sum + curve.engagement, 0) / tensionCurve.length;
    
    return {
      predictedDrops,
      highEngagementSections,
      emotionalComplexity,
      overallEngagement
    };
  }

  /**
   * Calculates emotional complexity from tension curve
   */
  private calculateEmotionalComplexityFromCurve(emotions: number[]): number {
    if (emotions.length < 2) return 0;
    
    // Calculate variance in emotional intensity
    const mean = emotions.reduce((sum, emotion) => sum + emotion, 0) / emotions.length;
    const variance = emotions.reduce((sum, emotion) => sum + Math.pow(emotion - mean, 2), 0) / emotions.length;
    
    // Normalize to 0-100 scale
    return Math.min(100, Math.sqrt(variance) * 2);
  }

  /**
   * Generates feedback for arc segments
   */
  private generateSegmentFeedback(curve: TensionCurve, scene: SceneEmotionData): string[] {
    const feedback: string[] = [];
    
    if (curve.tension > 80) {
      feedback.push("High tension - consider easing for reader relief");
    } else if (curve.tension < 20) {
      feedback.push("Low tension - may need more conflict or stakes");
    }
    
    if (curve.empathy > 80) {
      feedback.push("Strong emotional connection potential");
    } else if (curve.empathy < 30) {
      feedback.push("Consider adding character vulnerability");
    }
    
    if (curve.engagement < 40) {
      feedback.push("Risk of reader disengagement");
    }
    
    if (curve.emotionalComplexity > 80) {
      feedback.push("High emotional complexity - consider simplifying");
    }
    
    return feedback;
  }

  /**
   * Calculates reader empathy score
   */
  private calculateReaderEmpathy(arc: EmotionalArc, profile: ReaderProfile): number {
    const vulnerabilityBeats = arc.beats.filter(beat => 
      VULNERABILITY_EMOTIONS.includes(beat.emotion)
    );
    
    const empathyScore = vulnerabilityBeats.reduce((total, beat) => {
      return total + (beat.intensity * profile.empathyLevel) / 100;
    }, 0);
    
    return Math.min(100, empathyScore / Math.max(1, vulnerabilityBeats.length));
  }

  /**
   * Detects engagement drops in the arc
   */
  private detectEngagementDrops(arc: EmotionalArc): boolean {
    const lowTensionSegments = arc.segments.filter(segment => segment.tensionLevel < 30);
    const consecutiveLowTension = lowTensionSegments.length > 2;
    
    return consecutiveLowTension;
  }

  /**
   * Identifies specific engagement drop positions
   */
  private identifyEngagementDrops(arc: EmotionalArc): number[] {
    const drops: number[] = [];
    
    arc.segments.forEach(segment => {
      if (segment.tensionLevel < ENGAGEMENT_THRESHOLDS.low_engagement) {
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
    
    arc.segments.forEach(segment => {
      if (segment.tensionLevel > ENGAGEMENT_THRESHOLDS.high_engagement) {
        sections.push((segment.start + segment.end) / 2);
      }
    });
    
    return sections;
  }

  /**
   * Generates reader notes based on profile
   */
  private generateReaderNotes(arc: EmotionalArc, profile: ReaderProfile): string[] {
    const notes: string[] = [];
    
    if (arc.overallTension > profile.tensionTolerance) {
      notes.push("Story may be too intense for some readers");
    }
    
    if (arc.emotionalComplexity > profile.emotionalComplexity) {
      notes.push("Complex emotional landscape - consider simplifying");
    }
    
    if (arc.pacingScore < 40) {
      notes.push("Pacing may feel slow to readers");
    }
    
    if (profile.readingSpeed === 'slow' && arc.pacingScore > 80) {
      notes.push("Fast pacing may overwhelm slow readers");
    }
    
    if (profile.attentionSpan < 30 && arc.segments.length > 10) {
      notes.push("Long story may exceed reader attention span");
    }
    
    return notes;
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