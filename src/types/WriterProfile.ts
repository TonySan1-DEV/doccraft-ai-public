export interface WriterProfile {
  id?: string;
  user_id: string;
  preferred_sentence_length: number;
  vocabulary_complexity: 'simple' | 'moderate' | 'advanced';
  pacing_style: 'fast' | 'moderate' | 'contemplative';
  genre_specializations: string[];
  successful_patterns: SuccessfulPatterns;
  updated_at?: string;
  lastTrendMatchScore?: number;
  topMisalignments?: string[];
  tier?: 'Free' | 'Pro' | 'Admin';
}

export interface SuccessfulPatterns {
  outline_styles?: {
    [genre: string]: {
      chapter_count: number;
      avg_chapter_length: number;
      preferred_structure: string[];
    };
  };
  writing_habits?: {
    preferred_session_length: number;
    most_productive_hours: string[];
    common_themes: string[];
  };
  ai_prompt_preferences?: {
    [feature: string]: {
      temperature: number;
      max_tokens: number;
      style_modifiers: string[];
    };
  };
  content_analysis?: {
    avg_paragraph_length: number;
    dialogue_usage: number; // percentage
    descriptive_ratio: number; // percentage
    action_ratio: number; // percentage
  };
}

export interface ProfileUpdateData {
  preferred_sentence_length?: number;
  vocabulary_complexity?: 'simple' | 'moderate' | 'advanced';
  pacing_style?: 'fast' | 'moderate' | 'contemplative';
  genre_specializations?: string[];
  successful_patterns?: Partial<SuccessfulPatterns>;
}

export interface ProfileAnalytics {
  total_outlines_generated: number;
  avg_outline_quality_score: number;
  most_used_genres: string[];
  writing_consistency_score: number;
  ai_suggestion_acceptance_rate: number;
  last_activity_date: string;
}

export interface PersonalizedSuggestion {
  type: 'outline' | 'content' | 'style' | 'structure';
  confidence: number;
  reasoning: string;
  suggestion: string;
  based_on_patterns: string[];
} 