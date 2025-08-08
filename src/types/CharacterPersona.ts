/** TEMP STUB — replace with real implementation */

export interface CharacterPersona {
  id: string;
  name: string;
  description: string;
  personality: string[];
  goals: string[];
  conflicts: string[];
  arc: string;
  // Additional properties expected by existing code
  /** Character memory and development notes stored as key-value pairs */
  memory?: Record<string, any>;
  /** Character personality traits and psychological assessments (MBTI, Enneagram, etc.) */
  traits?: Record<string, any>;
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
