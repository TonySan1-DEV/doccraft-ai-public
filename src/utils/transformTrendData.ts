import { PublishingTrend } from '../types/PublishingTrend';
import { MarketTrend, TrendType } from '../types/MarketTrend';

const GENRE_WHITELIST = [
  'Romance', 'Mystery', 'Fantasy', 'Sci-Fi', 'Thriller', 'Historical Fiction', 'Non-Fiction'
];
const TREND_TYPE_WHITELIST: TrendType[] = ['topic', 'tone', 'structure', 'theme'];

export function transformPublishingToMarketTrend(source: PublishingTrend): MarketTrend | null {
  // Validate genre
  if (!GENRE_WHITELIST.includes(source.genre)) {
    console.warn(`Unrecognized genre: ${source.genre}`);
    return null;
  }
  // Validate trend_type
  if (!TREND_TYPE_WHITELIST.includes(source.trend_type)) {
    console.warn(`Unrecognized trend_type: ${source.trend_type}`);
    return null;
  }
  // Normalize score
  const score = Math.max(0, Math.min(1, source.popularityScore));
  // Clean label
  const label = source.label.trim().replace(/\s+/g, ' ');
  // Map exampleTitles to examples
  return {
    genre: source.genre,
    trend_type: source.trend_type,
    label,
    score,
    examples: source.exampleTitles,
    updated_at: new Date().toISOString()
  };
} 