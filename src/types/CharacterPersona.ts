// CharacterPersona interface for CCI module
export interface CharacterPersona {
  id: string;
  user_id: string;
  story_id?: string;
  name: string;
  archetype: string;
  goals: string;
  voiceStyle: string;
  worldview: string;
  personality: string; // e.g. Big Five traits or summary
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
  // Optionally, add avatar or other fields as needed
}