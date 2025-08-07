// CharacterPersona interface for CCI module
export interface CharacterPersona {
  id: string;
  user_id: string;
  story_id?: string;
  name: string;
  archetype: string;
  goals: string; // Legacy field - kept for backwards compatibility
  voiceStyle: string;
  worldview: string;
  personality: string; // Legacy field - kept for backwards compatibility
  knownConnections: Array<{
    name: string;
    relationship: string;
    description?: string;
  }>;
  backstory?: string;
  traits?: Record<string, any>;
  memory?: Record<string, any>;
  created_at?: string;
  updated_at?: string;

  // TODO: Confirm this field structure with upstream schema
  // Extended fields to match actual usage patterns
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

  // TODO: Add developmentNotes field to match Character interface usage
  developmentNotes?: string[];
}
