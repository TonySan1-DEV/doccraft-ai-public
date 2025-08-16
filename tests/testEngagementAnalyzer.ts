import {
  describe,
  it,
  expect,
  jest,
  beforeEach,
  afterEach,
} from '@jest/globals';
import { analyzeEngagement } from '../src/services/engagementAnalyzer';
import { EngagementAnalysis } from '../src/types/EngagementAnalysis';
import { WriterProfile } from '../src/types/WriterProfile';

const proProfile: WriterProfile = {
  user_id: 'user-1',
  preferred_sentence_length: 20,
  vocabulary_complexity: 'moderate',
  pacing_style: 'fast',
  genre_specializations: ['Romance'],
  successful_patterns: {},
};

describe('EngagementAnalyzer', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('returns low score for very short content', async () => {
    const result = await analyzeEngagement('Hi.');
    expect(result.engagementScore).toBe(0);
    expect(result.tags).toContain('Too Short');
  });

  it('returns moderate score for average content', async () => {
    const content =
      'This is a story. It has a beginning, middle, and end. The characters are interesting.';
    const result = await analyzeEngagement(content);
    expect(result.engagementScore).toBeGreaterThanOrEqual(0.4);
    expect(result.engagementScore).toBeLessThanOrEqual(0.7);
    expect(result.tags.length).toBeGreaterThanOrEqual(0);
  });

  it('returns higher score for strong hook', async () => {
    const content =
      'Suddenly, a twist! Danger loomed. Betrayal was in the air.';
    const result = await analyzeEngagement(content);
    expect(result.engagementScore).toBeGreaterThan(0.5);
    expect(result.tags).toContain('Strong Hook');
  });

  it('returns lower score for boring content', async () => {
    const content = 'This is a boring, dull, and routine day.';
    const result = await analyzeEngagement(content);
    expect(result.engagementScore).toBeLessThan(0.5);
    expect(result.tags).toContain('Low Stakes');
  });

  it('returns genre match tag for romance', async () => {
    const content = 'A story of love and passion.';
    const result = await analyzeEngagement(content, 'Romance');
    expect(result.tags).toContain('Genre Match');
  });

  it('returns pacing match tag for fast profile', async () => {
    const content = 'Quick action. Short sentences. Fast pace.';
    const result = await analyzeEngagement(content, 'Thriller', proProfile);
    expect(result.tags).toContain('Pacing Match');
  });

  it('returns fallback response on API error', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('API error'));
    const content = 'A story with a twist.';
    const result = await analyzeEngagement(content, 'Mystery');
    expect(result.summary).toMatch(/engage|engagement/i);
  });

  it('returns AI prompt structure (mocked)', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        engagementScore: 0.8,
        confidence: 0.95,
        summary: 'Strong opening. High engagement.',
        tags: ['Strong Hook'],
        recommendations: ['Keep up the tension!'],
        matchedTrends: ['Twist Ending'],
      }),
    });
    const content = 'A story with a twist.';
    const result = await analyzeEngagement(content, 'Mystery');
    expect(result.engagementScore).toBe(0.8);
    expect(result.tags).toContain('Strong Hook');
    expect(result.matchedTrends).toContain('Twist Ending');
  });
});
