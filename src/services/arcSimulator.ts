// MCP Context Block
/*
{
  file: "arcSimulator.ts",
  role: "analyzer",
  allowedActions: ["analyze", "simulate", "visualize", "suggest"],
  tier: "Pro",
  contentSensitivity: "medium",
  theme: "writing_suite"
}
*/

import { ArcSegment, ReaderSimResult, EmotionalArc } from '../types/EmotionalArc';
import { SceneEmotionData } from './emotionAnalyzer';

export interface TensionCurve {
  position: number;
  tension: number;
  empathy: number;
  engagement: number;
}

export interface ArcSimulationResult {
  tensionCurve: TensionCurve[];
  emotionalPeaks: number[];
  pacingAnalysis: {
    slowSections: number[];
    fastSections: number[];
    optimalPacing: number[];
  };
  readerEngagement: {
    predictedDrops: number[];
    highEngagementSections: number[];
    emotionalComplexity: number;
  };
}

// Generate normalized tension and empathy curves
export function generateArcSimulation(
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
    const tension = calculateSceneTension(scene);
    
    // Calculate empathy potential
    const empathy = calculateEmpathyPotential(scene, characterProfiles);
    
    // Calculate engagement (combination of tension and empathy)
    const engagement = (tension * 0.6) + (empathy * 0.4);
    
    tensionCurve.push({
      position,
      tension,
      empathy,
      engagement
    });
    
    // Identify emotional peaks (high tension or empathy)
    if (tension > 70 || empathy > 70) {
      emotionalPeaks.push(position);
    }
  });

  // Analyze pacing
  const pacingAnalysis = analyzePacing(tensionCurve);
  
  // Predict reader engagement
  const readerEngagement = predictReaderEngagement(tensionCurve);

  return {
    tensionCurve,
    emotionalPeaks,
    pacingAnalysis,
    readerEngagement
  };
}

function calculateSceneTension(scene: SceneEmotionData): number {
  const tensionEmotions = ['fear', 'anger', 'conflict', 'surprise'];
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

function calculateEmpathyPotential(
  scene: SceneEmotionData,
  characterProfiles?: Map<string, any>
): number {
  let totalEmpathy = 0;
  let characterCount = 0;
  
  scene.characterEmotions.forEach((emotion, characterId) => {
    const profile = characterProfiles?.get(characterId);
    const empathyPotential = profile?.empathyPotential || 50;
    
    // Empathy is higher for vulnerable emotions
    const vulnerableEmotions = ['sadness', 'fear', 'love', 'conflict'];
    const empathyMultiplier = vulnerableEmotions.includes(emotion.primaryEmotion) ? 1.2 : 0.8;
    
    totalEmpathy += (emotion.intensity * empathyMultiplier * empathyPotential) / 100;
    characterCount++;
  });
  
  return characterCount > 0 ? Math.min(100, totalEmpathy / characterCount) : 0;
}

function analyzePacing(tensionCurve: TensionCurve[]): {
  slowSections: number[];
  fastSections: number[];
  optimalPacing: number[];
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
  
  return { slowSections, fastSections, optimalPacing };
}

function predictReaderEngagement(tensionCurve: TensionCurve[]): {
  predictedDrops: number[];
  highEngagementSections: number[];
  emotionalComplexity: number;
} {
  const predictedDrops: number[] = [];
  const highEngagementSections: number[] = [];
  
  // Calculate emotional complexity
  const emotions = tensionCurve.map(curve => curve.tension);
  const emotionalComplexity = calculateEmotionalComplexity(emotions);
  
  // Identify engagement drops (low tension + low empathy)
  tensionCurve.forEach(curve => {
    if (curve.engagement < 30) {
      predictedDrops.push(curve.position);
    } else if (curve.engagement > 80) {
      highEngagementSections.push(curve.position);
    }
  });
  
  return {
    predictedDrops,
    highEngagementSections,
    emotionalComplexity
  };
}

function calculateEmotionalComplexity(emotions: number[]): number {
  if (emotions.length < 2) return 0;
  
  // Calculate variance in emotional intensity
  const mean = emotions.reduce((sum, emotion) => sum + emotion, 0) / emotions.length;
  const variance = emotions.reduce((sum, emotion) => sum + Math.pow(emotion - mean, 2), 0) / emotions.length;
  
  // Normalize to 0-100 scale
  return Math.min(100, Math.sqrt(variance) * 2);
}

// Generate arc segments for visualization
export function generateArcSegments(
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
    sceneIds: []
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
        feedback: generateSegmentFeedback(curve),
        characterIds: Array.from(scene.characterEmotions.keys()),
        sceneIds: [scene.sceneId]
      };
    } else {
      // Extend current segment
      currentSegment.end = curve.position;
      currentSegment.tensionLevel = Math.max(currentSegment.tensionLevel, curve.tension);
      currentSegment.sceneIds.push(scene.sceneId);
      currentSegment.characterIds.push(...Array.from(scene.characterEmotions.keys()));
    }
  });
  
  // Add final segment
  segments.push(currentSegment);
  
  return segments;
}

function generateSegmentFeedback(curve: TensionCurve): string[] {
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
  
  return feedback;
}

// Simulate reader response to emotional arcs
export function simulateReaderResponse(
  arc: EmotionalArc,
  readerProfile?: { empathyLevel: number; tensionTolerance: number }
): ReaderSimResult {
  const defaultProfile = { empathyLevel: 60, tensionTolerance: 70 };
  const profile = readerProfile || defaultProfile;
  
  const empathyScore = calculateReaderEmpathy(arc, profile);
  const predictedEngagementDrop = detectEngagementDrops(arc);
  const notes = generateReaderNotes(arc, profile);
  const emotionalPeaks = arc.beats
    .filter(beat => beat.intensity > 70)
    .map(beat => beat.narrativePosition);
  
  const tensionCurve = arc.segments.map(segment => ({
    position: (segment.start + segment.end) / 2,
    tension: segment.tensionLevel
  }));

  return {
    empathyScore,
    predictedEngagementDrop,
    notes,
    emotionalPeaks,
    tensionCurve
  };
}

function calculateReaderEmpathy(arc: EmotionalArc, profile: any): number {
  const vulnerabilityBeats = arc.beats.filter(beat => 
    ['sadness', 'fear', 'love', 'conflict'].includes(beat.emotion)
  );
  
  const empathyScore = vulnerabilityBeats.reduce((total, beat) => {
    return total + (beat.intensity * profile.empathyLevel) / 100;
  }, 0);
  
  return Math.min(100, empathyScore / Math.max(1, vulnerabilityBeats.length));
}

function detectEngagementDrops(arc: EmotionalArc): boolean {
  const lowTensionSegments = arc.segments.filter(segment => segment.tensionLevel < 30);
  const consecutiveLowTension = lowTensionSegments.length > 2;
  
  return consecutiveLowTension;
}

function generateReaderNotes(arc: EmotionalArc, profile: any): string[] {
  const notes: string[] = [];
  
  if (arc.overallTension > profile.tensionTolerance) {
    notes.push("Story may be too intense for some readers");
  }
  
  if (arc.emotionalComplexity > 80) {
    notes.push("Complex emotional landscape - consider simplifying");
  }
  
  if (arc.pacingScore < 40) {
    notes.push("Pacing may feel slow to readers");
  }
  
  return notes;
} 