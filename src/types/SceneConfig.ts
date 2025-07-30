import { CharacterPersona } from './CharacterPersona';

export interface SceneConfig {
  id?: string;
  title: string;
  setting: string;
  tone?: string;
  objective?: string;
  participants: CharacterPersona[];
} 