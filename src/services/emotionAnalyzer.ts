// MCP Context Block
/*
{
  file: "emotionAnalyzer.ts",
  role: "analyzer",
  allowedActions: ["analyze", "simulate", "visualize", "suggest"],
  tier: "Pro",
  contentSensitivity: "medium",
  theme: "writing_suite"
}
*/

import { EmotionalBeat } from '../types/EmotionalArc';

export interface EmotionAnalysisResult {
  primaryEmotion: string;
  intensity: number;
  confidence: number;
  secondaryEmotions: string[];
  emotionalComplexity: number;
  contextClues: string[];
}

export interface SceneEmotionData {
  sceneId: string;
  sceneText: string;
  characterEmotions: Map<string, EmotionAnalysisResult>;
  overallSentiment: string;
  tensionLevel: number;
  emotionalBeats: EmotionalBeat[];
}

// Emotion categories with intensity mappings
const EMOTION_CATEGORIES = {
  joy: ['happy', 'excited', 'elated', 'thrilled', 'content', 'pleased'],
  fear: ['afraid', 'terrified', 'anxious', 'worried', 'nervous', 'scared'],
  anger: ['angry', 'furious', 'irritated', 'annoyed', 'enraged', 'hostile'],
  sadness: ['sad', 'depressed', 'melancholy', 'grief', 'sorrow', 'despair'],
  surprise: ['shocked', 'amazed', 'astonished', 'stunned', 'bewildered'],
  disgust: ['disgusted', 'repulsed', 'revolted', 'appalled', 'sickened'],
  love: ['loving', 'affectionate', 'tender', 'passionate', 'devoted'],
  conflict: ['conflicted', 'torn', 'divided', 'uncertain', 'confused']
};

// NLP-based emotion extraction using keyword analysis and context
export async function analyzeEmotion(
  text: string,

): Promise<EmotionAnalysisResult> {
  const words = text.toLowerCase().split(/\s+/);
  const emotionScores: Record<string, number> = {};
  
  // Initialize emotion scores
  Object.keys(EMOTION_CATEGORIES).forEach(emotion => {
    emotionScores[emotion] = 0;
  });

  // Analyze text for emotional indicators
  words.forEach(word => {
    Object.entries(EMOTION_CATEGORIES).forEach(([emotion, indicators]) => {
      if (indicators.some(indicator => word.includes(indicator))) {
        emotionScores[emotion] += 1;
      }
    });
  });

  // Analyze punctuation and capitalization for intensity
  const exclamationCount = (text.match(/!/g) || []).length;
  const questionCount = (text.match(/\?/g) || []).length;
  const capsCount = (text.match(/[A-Z]/g) || []).length;
  
  const intensityModifier = Math.min(100, (exclamationCount * 10) + (capsCount * 2) + (questionCount * 5));

  // Find primary emotion
  const primaryEmotion = Object.entries(emotionScores)
    .sort(([,a], [,b]) => b - a)[0][0];
  
  const intensity = Math.min(100, emotionScores[primaryEmotion] * 15 + intensityModifier);
  
  // Calculate emotional complexity
  const nonZeroEmotions = Object.values(emotionScores).filter(score => score > 0);
  const emotionalComplexity = nonZeroEmotions.length > 1 ? 
    Math.min(100, (nonZeroEmotions.length - 1) * 25) : 0;

  // Get secondary emotions
  const secondaryEmotions = Object.entries(emotionScores)
    .filter(([, score]) => score > 0 && score < emotionScores[primaryEmotion])
    .sort(([,a], [,b]) => b - a)
    .slice(0, 2)
    .map(([emotion]) => emotion);

  // Context clues extraction
  const contextClues = extractContextClues(text);

  return {
    primaryEmotion,
    intensity: Math.round(intensity),
    confidence: Math.min(100, emotionScores[primaryEmotion] * 20),
    secondaryEmotions,
    emotionalComplexity,
    contextClues
  };
}

function extractContextClues(text: string): string[] {
  const clues: string[] = [];
  
  // Look for emotional context patterns
  const patterns = [
    /(?:feeling|felt|feels)\s+(\w+)/gi,
    /(?:was|is|am)\s+(\w+)/gi,
    /(?:very|really|extremely)\s+(\w+)/gi
  ];

  patterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      clues.push(...matches.slice(0, 3));
    }
  });

  return clues.slice(0, 5);
}

// Analyze a complete scene for emotional content
export async function analyzeSceneEmotions(
  sceneText: string,
  characterIds: string[],
  sceneId: string
): Promise<SceneEmotionData> {
  const characterEmotions = new Map<string, EmotionAnalysisResult>();
  
  // Split scene into character-specific sections
  const characterSections = splitSceneByCharacter(sceneText, characterIds);
  
  // Analyze each character's emotional state
  for (const [characterId, section] of characterSections) {
    const emotionResult = await analyzeEmotion(section);
    characterEmotions.set(characterId, emotionResult);
  }

  // Calculate overall scene sentiment
  const allEmotions = Array.from(characterEmotions.values());
  const overallSentiment = calculateOverallSentiment(allEmotions);
  const tensionLevel = calculateTensionLevel(allEmotions);

  // Generate emotional beats for the scene
  const emotionalBeats: EmotionalBeat[] = Array.from(characterEmotions.entries()).map(([characterId, emotion]) => ({
    sceneId,
    characterId,
    emotion: emotion.primaryEmotion,
    intensity: emotion.intensity,
    narrativePosition: 0.5, // Default to middle of scene
    timestamp: Date.now(),
    context: emotion.contextClues.join(', ')
  }));

  return {
    sceneId,
    sceneText,
    characterEmotions,
    overallSentiment,
    tensionLevel,
    emotionalBeats
  };
}

function splitSceneByCharacter(sceneText: string, characterIds: string[]): Map<string, string> {
  const sections = new Map<string, string>();
  
  // Simple character dialogue extraction
  characterIds.forEach(characterId => {
    const dialoguePattern = new RegExp(`(${characterId}[^.!?]*[.!?])`, 'gi');
    const matches = sceneText.match(dialoguePattern);
    if (matches) {
      sections.set(characterId, matches.join(' '));
    } else {
      // If no direct dialogue, assign general scene context
      sections.set(characterId, sceneText);
    }
  });

  return sections;
}

function calculateOverallSentiment(emotions: EmotionAnalysisResult[]): string {
  const emotionCounts: Record<string, number> = {};
  
  emotions.forEach(emotion => {
    emotionCounts[emotion.primaryEmotion] = (emotionCounts[emotion.primaryEmotion] || 0) + 1;
  });

  const dominantEmotion = Object.entries(emotionCounts)
    .sort(([,a], [,b]) => b - a)[0][0];
  
  return dominantEmotion;
}

function calculateTensionLevel(emotions: EmotionAnalysisResult[]): number {
  const tensionEmotions = ['fear', 'anger', 'conflict', 'surprise'];
  const tensionScore = emotions.reduce((total, emotion) => {
    if (tensionEmotions.includes(emotion.primaryEmotion)) {
      return total + (emotion.intensity * 0.8);
    }
    return total + (emotion.intensity * 0.3);
  }, 0);

  return Math.min(100, tensionScore / emotions.length);
}

// Batch analyze multiple scenes
export async function analyzeStoryEmotions(
  scenes: Array<{sceneId: string, text: string, characterIds: string[]}>
): Promise<SceneEmotionData[]> {
  const results: SceneEmotionData[] = [];
  
  for (const scene of scenes) {
    const sceneAnalysis = await analyzeSceneEmotions(
      scene.text,
      scene.characterIds,
      scene.sceneId
    );
    results.push(sceneAnalysis);
  }

  return results;
} 