export interface PublishingTrend {
  genre: string;
  trend_type: 'topic' | 'tone' | 'structure' | 'theme';
  label: string;
  popularityScore: number; // 0.0 - 1.0 (may need normalization)
  exampleTitles: string[];
} 