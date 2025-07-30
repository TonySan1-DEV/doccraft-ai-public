export type TrendType = 'topic' | 'tone' | 'structure' | 'theme';

export interface MarketTrend {
  id?: string;
  genre: string;
  trend_type: TrendType;
  label: string;
  score: number;
  examples?: string[];
  updated_at?: string;
}

export interface TrendMatchResult {
  trend: MarketTrend;
  matchScore: number;
  recommendation: string;
  confidence: number;
  evidence: string[];
  severity: 'high' | 'medium' | 'low';
}

export interface MarketAnalysis {
  genre: string;
  content: string;
  trends: MarketTrend[];
  matchResults: TrendMatchResult[];
  overallAlignment: number;
  topRecommendations: string[];
  marketOpportunities: string[];
  riskFactors: string[];
  summary: {
    totalTrends: number;
    highMatches: number;
    mediumMatches: number;
    lowMatches: number;
    averageAlignment: number;
  };
}

export interface TrendAnalysisRequest {
  content: string;
  genre: string;
  includeExamples?: boolean;
  maxResults?: number;
  minScore?: number;
}

export interface TrendAnalysisResponse {
  trends: MarketTrend[];
  matchResults: TrendMatchResult[];
  analysis: {
    overallAlignment: number;
    topRecommendations: string[];
    marketOpportunities: string[];
    riskFactors: string[];
  };
  metadata: {
    processingTime: number;
    trendsAnalyzed: number;
    confidence: number;
  };
}

export interface GenreTrendSummary {
  genre: string;
  topTrends: MarketTrend[];
  trendCounts: {
    topic: number;
    tone: number;
    structure: number;
    theme: number;
  };
  averageScore: number;
  lastUpdated: string;
}

export interface TrendRecommendation {
  type: 'alignment' | 'opportunity' | 'risk' | 'adjustment';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  actionableSteps: string[];
  relatedTrends: string[];
}

export interface MarketInsight {
  insightType: 'trend' | 'gap' | 'opportunity' | 'warning';
  title: string;
  description: string;
  evidence: string[];
  confidence: number;
  actionable: boolean;
  priority: 'high' | 'medium' | 'low';
}

export interface TrendFilter {
  genres?: string[];
  trendTypes?: TrendType[];
  minScore?: number;
  maxScore?: number;
  includeExamples?: boolean;
}

export interface MarketTrendState {
  trends: MarketTrend[];
  matchResults: TrendMatchResult[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  analysis: MarketAnalysis | null;
}

export interface TrendComparison {
  userContent: string;
  genre: string;
  userTrends: MarketTrend[];
  marketTrends: MarketTrend[];
  alignment: number;
  gaps: string[];
  opportunities: string[];
  recommendations: TrendRecommendation[];
}

export interface WriterProfileTrendUpdate {
  lastTrendMatchScore: number;
  topMisalignments: string[];
  genreTrendPreferences: {
    [genre: string]: {
      preferredTrends: string[];
      avoidedTrends: string[];
      alignmentScore: number;
    };
  };
  marketInsights: MarketInsight[];
} 