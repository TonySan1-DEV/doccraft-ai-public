export interface EngagementAnalysis {
  engagementScore: number;        // 0.0 - 1.0
  confidence: number;             // model confidence
  summary: string;                // brief headline feedback
  tags: string[];                 // e.g. ['Slow Hook', 'Low Emotional Stakes']
  recommendations: string[];      // AI-generated suggestions
  matchedTrends?: string[];       // Optional trend overlap (from MarketTrend)
} 