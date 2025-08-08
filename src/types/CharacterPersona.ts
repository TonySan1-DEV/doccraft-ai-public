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
