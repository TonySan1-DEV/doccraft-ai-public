import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from '@jest/globals';
import {
  getTrendsByGenre,
  analyzeAgainstTrends,
  getMarketAnalysis,
  getGenreTrendSummary,
  generateTrendRecommendations,
} from '../src/services/trendAdvisor';
import { MarketTrend, TrendMatchResult } from '../src/types/MarketTrend';

// Mock Supabase client
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        order: jest.fn(() => ({
          data: [
            {
              id: 'trend-1',
              genre: 'Romance',
              trend_type: 'topic',
              label: 'Enemies to Lovers',
              score: 0.95,
              examples: ['Forced proximity', 'Workplace rivals'],
              updated_at: '2024-01-01T00:00:00Z',
            },
            {
              id: 'trend-2',
              genre: 'Romance',
              trend_type: 'tone',
              label: 'Slow Burn',
              score: 0.88,
              examples: ['Gradual emotional development', 'Building tension'],
              updated_at: '2024-01-01T00:00:00Z',
            },
          ],
          error: null,
        })),
      })),
    })),
  })),
};

// Mock the supabase import
jest.mock('../src/lib/supabase', () => ({
  supabase: mockSupabase,
}));

describe('Market Trend Integration System Tests', () => {
  const mockTrends: MarketTrend[] = [
    {
      id: 'trend-1',
      genre: 'Romance',
      trend_type: 'topic',
      label: 'Enemies to Lovers',
      score: 0.95,
      examples: [
        'Forced proximity',
        'Workplace rivals',
        'Academic competition',
      ],
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 'trend-2',
      genre: 'Romance',
      trend_type: 'tone',
      label: 'Slow Burn',
      score: 0.88,
      examples: [
        'Gradual emotional development',
        'Delayed gratification',
        'Building tension',
      ],
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 'trend-3',
      genre: 'Romance',
      trend_type: 'structure',
      label: 'Dual POV',
      score: 0.92,
      examples: ['Alternating perspectives', 'Both sides of the story'],
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 'trend-4',
      genre: 'Mystery',
      trend_type: 'topic',
      label: 'Small Town Secrets',
      score: 0.9,
      examples: ['Close-knit communities', 'Hidden pasts'],
      updated_at: '2024-01-01T00:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getTrendsByGenre Function', () => {
    it('should fetch trends for a specific genre', async () => {
      const result = await getTrendsByGenre('Romance');

      expect(result).toHaveLength(3);
      expect(result.every(trend => trend.genre === 'Romance')).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith('market_trends');
    });

    it('should return empty array for non-existent genre', async () => {
      // Mock empty result
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              data: [],
              error: null,
            })),
          })),
        })),
      });

      const result = await getTrendsByGenre('NonExistentGenre');

      expect(result).toEqual([]);
    });

    it('should handle database errors gracefully', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              data: null,
              error: { message: 'Database connection failed' },
            })),
          })),
        })),
      });

      await expect(getTrendsByGenre('Romance')).rejects.toThrow(
        'Failed to fetch market trends'
      );
    });

    it('should validate genre parameter', async () => {
      await expect(getTrendsByGenre('')).rejects.toThrow('Genre is required');
    });
  });

  describe('analyzeAgainstTrends Function', () => {
    it('should return empty results for empty content', async () => {
      const result = await analyzeAgainstTrends('', 'Romance');
      expect(result).toEqual([]);
    });

    it('should return empty results for short content', async () => {
      const result = await analyzeAgainstTrends('Hi', 'Romance');
      expect(result).toEqual([]);
    });

    it('should analyze content against trends', async () => {
      const content =
        'This is a romance story about enemies who become lovers through forced proximity in the workplace.';
      const result = await analyzeAgainstTrends(content, 'Romance');

      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('trend');
      expect(result[0]).toHaveProperty('matchScore');
      expect(result[0]).toHaveProperty('recommendation');
      expect(result[0]).toHaveProperty('confidence');
      expect(result[0]).toHaveProperty('evidence');
      expect(result[0]).toHaveProperty('severity');
    });

    it('should calculate match scores correctly', async () => {
      const content =
        'Enemies to lovers story with workplace rivals and forced proximity.';
      const result = await analyzeAgainstTrends(content, 'Romance');

      const enemiesToLoversMatch = result.find(
        r => r.trend.label === 'Enemies to Lovers'
      );
      expect(enemiesToLoversMatch).toBeDefined();
      expect(enemiesToLoversMatch!.matchScore).toBeGreaterThan(0.5);
    });

    it('should generate appropriate recommendations', async () => {
      const content = 'A slow burn romance with gradual emotional development.';
      const result = await analyzeAgainstTrends(content, 'Romance');

      const slowBurnMatch = result.find(r => r.trend.label === 'Slow Burn');
      expect(slowBurnMatch).toBeDefined();
      expect(slowBurnMatch!.recommendation).toContain('Slow Burn');
    });

    it('should find evidence in content', async () => {
      const content =
        'The story features forced proximity and workplace rivals.';
      const result = await analyzeAgainstTrends(content, 'Romance');

      const enemiesMatch = result.find(
        r => r.trend.label === 'Enemies to Lovers'
      );
      expect(enemiesMatch).toBeDefined();
      expect(enemiesMatch!.evidence.length).toBeGreaterThan(0);
    });

    it('should calculate confidence scores', async () => {
      const content = 'Enemies to lovers with forced proximity.';
      const result = await analyzeAgainstTrends(content, 'Romance');

      result.forEach(match => {
        expect(match.confidence).toBeGreaterThanOrEqual(0);
        expect(match.confidence).toBeLessThanOrEqual(1);
      });
    });

    it('should assign severity levels correctly', async () => {
      const content = 'Enemies to lovers story.';
      const result = await analyzeAgainstTrends(content, 'Romance');

      result.forEach(match => {
        expect(['high', 'medium', 'low']).toContain(match.severity);
      });
    });
  });

  describe('Genre-Specific Trend Lookup', () => {
    it('should return different trends for different genres', async () => {
      const romanceTrends = await getTrendsByGenre('Romance');
      const mysteryTrends = await getTrendsByGenre('Mystery');

      expect(romanceTrends.length).toBeGreaterThan(0);
      expect(mysteryTrends.length).toBeGreaterThan(0);
      expect(romanceTrends.every(t => t.genre === 'Romance')).toBe(true);
      expect(mysteryTrends.every(t => t.genre === 'Mystery')).toBe(true);
    });

    it('should handle case-insensitive genre matching', async () => {
      const result1 = await getTrendsByGenre('romance');
      const result2 = await getTrendsByGenre('ROMANCE');

      expect(result1.length).toBeGreaterThan(0);
      expect(result2.length).toBeGreaterThan(0);
    });
  });

  describe('Match Scoring Accuracy', () => {
    it('should score exact matches highly', async () => {
      const content = 'This is an enemies to lovers story.';
      const result = await analyzeAgainstTrends(content, 'Romance');

      const exactMatch = result.find(
        r => r.trend.label === 'Enemies to Lovers'
      );
      expect(exactMatch!.matchScore).toBeGreaterThan(0.3);
    });

    it('should score partial matches moderately', async () => {
      const content = 'A story about workplace rivals.';
      const result = await analyzeAgainstTrends(content, 'Romance');

      const partialMatch = result.find(
        r => r.trend.label === 'Enemies to Lovers'
      );
      expect(partialMatch!.matchScore).toBeGreaterThan(0.1);
    });

    it('should score no matches low', async () => {
      const content = 'A completely unrelated story about cooking.';
      const result = await analyzeAgainstTrends(content, 'Romance');

      if (result.length > 0) {
        result.forEach(match => {
          expect(match.matchScore).toBeLessThan(0.5);
        });
      }
    });

    it('should consider trend popularity in scoring', async () => {
      const content = 'Enemies to lovers story.';
      const result = await analyzeAgainstTrends(content, 'Romance');

      // High-scoring trends should appear first
      const highScoringTrends = result.filter(r => r.trend.score > 0.9);
      const lowScoringTrends = result.filter(r => r.trend.score < 0.8);

      if (highScoringTrends.length > 0 && lowScoringTrends.length > 0) {
        const highScore =
          highScoringTrends[0]?.matchScore * highScoringTrends[0]?.trend.score;
        const lowScore =
          lowScoringTrends[0]?.matchScore * lowScoringTrends[0]?.trend.score;
        expect(highScore).toBeGreaterThanOrEqual(lowScore);
      }
    });
  });

  describe('Fallback Logic', () => {
    it('should handle missing trend data gracefully', async () => {
      // Mock empty trends
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              data: [],
              error: null,
            })),
          })),
        })),
      });

      const result = await analyzeAgainstTrends('Some content', 'Romance');
      expect(result).toEqual([]);
    });

    it('should handle API failures gracefully', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              data: null,
              error: { message: 'API error' },
            })),
          })),
        })),
      });

      const result = await analyzeAgainstTrends('Some content', 'Romance');
      expect(result).toEqual([]);
    });
  });

  describe('Performance with Large Input', () => {
    it('should handle large content efficiently', async () => {
      const largeContent = 'A'.repeat(10000); // 10KB of content
      const startTime = Date.now();

      const result = await analyzeAgainstTrends(largeContent, 'Romance');
      const processingTime = Date.now() - startTime;

      expect(processingTime).toBeLessThan(5000); // Should complete within 5 seconds
      expect(result).toBeDefined();
    });

    it('should handle multiple concurrent requests', async () => {
      const promises = Array(5)
        .fill(null)
        .map(() => analyzeAgainstTrends('Test content', 'Romance'));

      const results = await Promise.all(promises);
      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(Array.isArray(result)).toBe(true);
      });
    });
  });

  describe('getMarketAnalysis Function', () => {
    it('should provide comprehensive market analysis', async () => {
      const content = 'Enemies to lovers story with slow burn romance.';
      const analysis = await getMarketAnalysis(content, 'Romance');

      expect(analysis).toHaveProperty('genre');
      expect(analysis).toHaveProperty('content');
      expect(analysis).toHaveProperty('trends');
      expect(analysis).toHaveProperty('matchResults');
      expect(analysis).toHaveProperty('overallAlignment');
      expect(analysis).toHaveProperty('topRecommendations');
      expect(analysis).toHaveProperty('marketOpportunities');
      expect(analysis).toHaveProperty('riskFactors');
      expect(analysis).toHaveProperty('summary');
    });

    it('should calculate overall alignment correctly', async () => {
      const content = 'Enemies to lovers story.';
      const analysis = await getMarketAnalysis(content, 'Romance');

      expect(analysis.overallAlignment).toBeGreaterThanOrEqual(0);
      expect(analysis.overallAlignment).toBeLessThanOrEqual(1);
    });

    it('should generate top recommendations', async () => {
      const content = 'A romance story.';
      const analysis = await getMarketAnalysis(content, 'Romance');

      expect(analysis.topRecommendations.length).toBeGreaterThan(0);
      analysis.topRecommendations.forEach(rec => {
        expect(typeof rec).toBe('string');
        expect(rec.length).toBeGreaterThan(0);
      });
    });

    it('should identify market opportunities', async () => {
      const content = 'A basic romance story.';
      const analysis = await getMarketAnalysis(content, 'Romance');

      expect(Array.isArray(analysis.marketOpportunities)).toBe(true);
    });

    it('should identify risk factors', async () => {
      const content = 'A romance story.';
      const analysis = await getMarketAnalysis(content, 'Romance');

      expect(Array.isArray(analysis.riskFactors)).toBe(true);
    });
  });

  describe('getGenreTrendSummary Function', () => {
    it('should provide genre trend summary', async () => {
      const summary = await getGenreTrendSummary('Romance');

      expect(summary).toHaveProperty('genre');
      expect(summary).toHaveProperty('topTrends');
      expect(summary).toHaveProperty('trendCounts');
      expect(summary).toHaveProperty('averageScore');
      expect(summary).toHaveProperty('lastUpdated');
    });

    it('should calculate trend counts correctly', async () => {
      const summary = await getGenreTrendSummary('Romance');

      expect(summary.trendCounts.topic).toBeGreaterThanOrEqual(0);
      expect(summary.trendCounts.tone).toBeGreaterThanOrEqual(0);
      expect(summary.trendCounts.structure).toBeGreaterThanOrEqual(0);
      expect(summary.trendCounts.theme).toBeGreaterThanOrEqual(0);
    });

    it('should calculate average score correctly', async () => {
      const summary = await getGenreTrendSummary('Romance');

      expect(summary.averageScore).toBeGreaterThanOrEqual(0);
      expect(summary.averageScore).toBeLessThanOrEqual(1);
    });
  });

  describe('generateTrendRecommendations Function', () => {
    it('should generate trend recommendations', async () => {
      const content = 'A romance story.';
      const recommendations = await generateTrendRecommendations(
        content,
        'Romance'
      );

      expect(Array.isArray(recommendations)).toBe(true);
      recommendations.forEach(rec => {
        expect(rec).toHaveProperty('type');
        expect(rec).toHaveProperty('title');
        expect(rec).toHaveProperty('description');
        expect(rec).toHaveProperty('impact');
        expect(rec).toHaveProperty('confidence');
        expect(rec).toHaveProperty('actionableSteps');
        expect(rec).toHaveProperty('relatedTrends');
      });
    });

    it('should include different types of recommendations', async () => {
      const content = 'A romance story.';
      const recommendations = await generateTrendRecommendations(
        content,
        'Romance'
      );

      const types = recommendations.map(r => r.type);
      expect(types).toContain('alignment');
      expect(types).toContain('opportunity');
    });
  });

  describe('Data Structure Validation', () => {
    it('should validate trend data structure', () => {
      mockTrends.forEach(trend => {
        expect(trend).toHaveProperty('id');
        expect(trend).toHaveProperty('genre');
        expect(trend).toHaveProperty('trend_type');
        expect(trend).toHaveProperty('label');
        expect(trend).toHaveProperty('score');
        expect(trend).toHaveProperty('examples');
        expect(trend).toHaveProperty('updated_at');

        expect(typeof trend.genre).toBe('string');
        expect(typeof trend.trend_type).toBe('string');
        expect(typeof trend.label).toBe('string');
        expect(typeof trend.score).toBe('number');
        expect(trend.score).toBeGreaterThanOrEqual(0);
        expect(trend.score).toBeLessThanOrEqual(1);
        expect(Array.isArray(trend.examples)).toBe(true);
      });
    });

    it('should validate match result structure', async () => {
      const content = 'Enemies to lovers story.';
      const results = await analyzeAgainstTrends(content, 'Romance');

      results.forEach(result => {
        expect(result).toHaveProperty('trend');
        expect(result).toHaveProperty('matchScore');
        expect(result).toHaveProperty('recommendation');
        expect(result).toHaveProperty('confidence');
        expect(result).toHaveProperty('evidence');
        expect(result).toHaveProperty('severity');

        expect(typeof result.matchScore).toBe('number');
        expect(typeof result.recommendation).toBe('string');
        expect(typeof result.confidence).toBe('number');
        expect(Array.isArray(result.evidence)).toBe(true);
        expect(['high', 'medium', 'low']).toContain(result.severity);
      });
    });
  });
});
