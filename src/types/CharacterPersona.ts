import { CharacterPersonaExtension } from './psychologicalAnalysis';

export interface CharacterMemory {
  id: string;
  timestamp: number;
  type: 'interaction' | 'event' | 'relationship' | 'development';
  content: string;
  relatedCharacterId?: string;
  sceneId?: string;
  emotionalImpact: number;
  importance: 'low' | 'medium' | 'high';
}

export interface CharacterTrait {
  id: string;
  name: string;
  category: 'personality' | 'psychological' | 'social' | 'emotional';
  value: string;
  strength: number; // 0-10 scale
  description: string;
  mbtiType?: string;
  enneagramType?: string;
}

// Enhanced psychological analysis interfaces
export interface CognitiveTrait {
  trait: string;
  strength: number; // 0-1 scale
  flexibility: number; // 0-1 scale
  adaptability: number; // 0-1 scale
  cognitiveStyle:
    | 'analytical'
    | 'intuitive'
    | 'creative'
    | 'systematic'
    | 'holistic';
  learningPreference:
    | 'visual'
    | 'auditory'
    | 'kinesthetic'
    | 'reading'
    | 'social';
  problemSolvingApproach: string;
  decisionMakingStyle: string;
  cognitiveBiases: string[];
  strengths: string[];
  areasForGrowth: string[];
}

export interface EmotionalPattern {
  emotion: string;
  intensity: number; // 0-1 scale
  frequency: number; // 0-1 scale
  duration: number; // 0-1 scale
  triggers: string[];
  expressions: string[];
  physiologicalResponses: string[];
  cognitiveEffects: string[];
  behavioralConsequences: string[];
  regulationStrategies: string[];
  therapeuticInterventions: string[];
}

export interface MotivationalDriver {
  driver: string;
  strength: number; // 0-1 scale
  origin: string;
  sustainability: number; // 0-1 scale
  conflicts: string[];
  reinforcements: string[];
  obstacles: string[];
  strategies: string[];
  longTermImpact: string;
  therapeuticValue: number;
}

export interface CharacterPersona {
  id: string;
  name: string;
  description: string;
  personality: string[];
  goals: string[];
  conflicts: string[];
  arc: string;
  /** Character memory and development notes stored as structured data */
  memory?: CharacterMemory[];
  /** Character personality traits and psychological assessments */
  traits?: CharacterTrait[];
  developmentNotes?: string[];
  archetype?: string;
  voiceStyle?: string;
  worldview?: string;
  backstory?: string;
  knownConnections?: Array<{
    name: string;
    relationship: string;
    description?: string;
  }>;
  personalityDetails?: {
    traits: string[];
    strengths: string[];
    weaknesses: string[];
    fears: string[];
    desires: string[];
  };
  goalsDetails?: {
    primary: string;
    secondary: string[];
    internal: string;
    external: string;
  };
  relationships?: Array<{
    name: string;
    relationship: string;
    description?: string;
  }>;

  // Enhanced psychological analysis capabilities
  cognitiveTraits?: CognitiveTrait[];
  emotionalPatterns?: EmotionalPattern[];
  motivationalDrivers?: MotivationalDriver[];
  psychologicalFrameworks?: string[];
  traumaHistory?: string[];
  therapeuticApproaches?: string[];
  complexityScore?: number;
  psychologicalStability?: number;
  growthPotential?: number;

  // Advanced Character Psychology System integration
  psychologicalProfile?: CharacterPersonaExtension;
}

export interface CharacterProfile {
  id: string;
  persona: CharacterPersona;
  emotionalRange: string[];
  defaultEmotion: string;
  relationships: CharacterRelationship[];
}

export interface CharacterRelationship {
  targetCharacterId: string;
  relationshipType: string;
  description: string;
  tension: number;
}
