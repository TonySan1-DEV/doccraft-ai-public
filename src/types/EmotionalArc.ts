// MCP Context Block
/*
{
  file: "EmotionalArc.ts",
  role: "analyzer",
  allowedActions: ["analyze", "simulate", "visualize", "suggest"],
  tier: "Pro",
  contentSensitivity: "medium",
  theme: "writing_suite"
}
*/

export type EmotionalBeat = {
  sceneId: string;
  characterId: string;
  emotion: string; // e.g. "joy", "fear", "conflict"
  intensity: number; // 0–100
  narrativePosition: number; // 0–1 (normalized)
  timestamp: number;
  context?: string;
};

export type ArcSegment = {
  start: number;
  end: number;
  tensionLevel: number;
  sentiment: string;
  feedback: string[];
  characterIds: string[];
  sceneIds: string[];
};

export type ReaderSimResult = {
  empathyScore: number;
  predictedEngagementDrop: boolean;
  notes: string[];
  emotionalPeaks: number[];
  tensionCurve: Array<{position: number, tension: number}>;
};

export type EmotionalArc = {
  id: string;
  title: string;
  beats: EmotionalBeat[];
  segments: ArcSegment[];
  readerSimulation: ReaderSimResult;
  overallTension: number;
  emotionalComplexity: number;
  pacingScore: number;
};

export type CharacterEmotionalProfile = {
  characterId: string;
  characterName: string;
  emotionalRange: string[];
  defaultEmotion: string;
  emotionalStability: number; // 0-100
  empathyPotential: number; // 0-100
  arcBeats: EmotionalBeat[];
};

export type StoryEmotionalMap = {
  storyId: string;
  title: string;
  characters: CharacterEmotionalProfile[];
  overallArc: EmotionalArc;
  chapterArcs: EmotionalArc[];
  tensionThresholds: {
    low: number;
    medium: number;
    high: number;
  };
}; 