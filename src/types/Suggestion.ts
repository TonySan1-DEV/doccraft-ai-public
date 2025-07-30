export type SuggestionType = 'style' | 'tone' | 'clarity' | 'pacing' | 'structure' | 'grammar' | 'engagement';

export type SuggestionSeverity = 'info' | 'warning' | 'critical';

export interface Suggestion {
  id: string;
  type: SuggestionType;
  comment: string;
  severity: SuggestionSeverity;
  start?: number;
  end?: number;
  confidence: number;
  category: string;
  suggestedText?: string;
  reasoning: string;
  basedOnPatterns: string[];
}

export interface SuggestionContext {
  text: string;
  genre?: string;
  tone?: string;
  targetAudience?: string;
  documentType?: 'outline' | 'chapter' | 'section';
  currentSection?: string;
}

export interface SuggestionRequest {
  text: string;
  context: SuggestionContext;
  profile: {
    preferred_sentence_length: number;
    vocabulary_complexity: 'simple' | 'moderate' | 'advanced';
    pacing_style: 'fast' | 'moderate' | 'contemplative';
    genre_specializations: string[];
  };
}

export interface SuggestionResponse {
  suggestions: Suggestion[];
  summary: {
    totalSuggestions: number;
    criticalCount: number;
    warningCount: number;
    infoCount: number;
    overallScore: number;
  };
  metadata: {
    processingTime: number;
    modelUsed: string;
    confidence: number;
  };
}

export interface LiveSuggestionState {
  suggestions: Suggestion[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  summary: SuggestionResponse['summary'] | null;
}

export interface SuggestionFilter {
  types?: SuggestionType[];
  severity?: SuggestionSeverity[];
  minConfidence?: number;
  categories?: string[];
}

export interface SuggestionAction {
  type: 'accept' | 'reject' | 'apply' | 'ignore';
  suggestionId: string;
  userFeedback?: string;
  timestamp: Date;
}

export interface SuggestionAnalytics {
  totalSuggestions: number;
  acceptedSuggestions: number;
  rejectedSuggestions: number;
  averageConfidence: number;
  mostCommonType: SuggestionType;
  improvementScore: number;
  lastActivity: Date;
} 