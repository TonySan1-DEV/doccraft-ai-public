import { PublishingTrend } from '../types/PublishingTrend';

// Optionally use real API if credentials are set
const PUBLISHING_API_KEY = process.env.PUBLISHING_API_KEY;

export async function fetchPublishingTrends(): Promise<PublishingTrend[]> {
  if (PUBLISHING_API_KEY) {
    // Example: fetch from a real publishing API (Amazon KDP, Goodreads, etc.)
    // This is a placeholder; replace with real API logic as needed
    try {
      const response = await fetch('https://api.example.com/publishing-trends', {
        headers: { 'Authorization': `Bearer ${PUBLISHING_API_KEY}` }
      });
      if (!response.ok) throw new Error('Failed to fetch publishing trends');
      const data = await response.json();
      // Assume data is already in PublishingTrend[] shape or map as needed
      return data as PublishingTrend[];
    } catch (err) {
      console.warn('Publishing API fetch failed, falling back to mock data:', err);
      return loadMockPublishingTrends();
    }
  } else {
    // No API key, use mock data
    return loadMockPublishingTrends();
  }
}

export async function loadMockPublishingTrends(): Promise<PublishingTrend[]> {
  // Generate 100+ mock entries across genres and trend types
  const genres = ['Romance', 'Mystery', 'Fantasy', 'Sci-Fi', 'Thriller', 'Historical Fiction', 'Non-Fiction'];
  const trendTypes = ['topic', 'tone', 'structure', 'theme'] as const;
  const mockTrends: PublishingTrend[] = [];
  let count = 0;
  for (const genre of genres) {
    for (const trend_type of trendTypes) {
      for (let i = 0; i < 4; i++) {
        mockTrends.push({
          genre,
          trend_type,
          label: `${genre} ${trend_type} Trend ${i + 1}`,
          popularityScore: Math.max(0.1, Math.min(1, Math.random() * 0.9 + 0.1)),
          exampleTitles: [
            `${genre} Example Book ${count + 1}`,
            `${genre} Example Book ${count + 2}`
          ]
        });
        count += 2;
      }
    }
  }
  return mockTrends;
} 