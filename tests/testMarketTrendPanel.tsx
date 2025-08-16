import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MarketTrendPanel from '../src/components/MarketTrendPanel';
import { WriterProfile } from '../src/types/WriterProfile';
import * as useMarketTrendsModule from '../src/hooks/useMarketTrends';
import {
  MarketTrend,
  TrendMatchResult,
  MarketAnalysis,
  GenreTrendSummary,
  TrendRecommendation,
} from '../src/types/MarketTrend';

const mockTrends: MarketTrend[] = [
  {
    id: '1',
    genre: 'Romance',
    trend_type: 'tone',
    label: 'Enemies to Lovers',
    score: 0.91,
    examples: ['Pride and Prejudice'],
    updated_at: '2024-01-01',
  },
  {
    id: '2',
    genre: 'Romance',
    trend_type: 'structure',
    label: 'Slow Burn',
    score: 0.85,
    examples: ['The Hating Game'],
    updated_at: '2024-01-01',
  },
];
const mockMatchResults: TrendMatchResult[] = [
  {
    trend: mockTrends[0],
    matchScore: 0.75,
    recommendation: 'Emphasize rivalry',
    confidence: 0.8,
    evidence: ['Strong conflict setup'],
    severity: 'high',
  },
];
const mockAnalysis: MarketAnalysis = {
  genre: 'Romance',
  content: 'Outline text',
  trends: mockTrends,
  matchResults: mockMatchResults,
  overallAlignment: 0.75,
  topRecommendations: ['Emphasize rivalry'],
  marketOpportunities: [],
  riskFactors: [],
  summary: {
    totalTrends: 2,
    highMatches: 1,
    mediumMatches: 1,
    lowMatches: 0,
    averageAlignment: 0.75,
  },
};
const mockSummary: GenreTrendSummary = {
  genre: 'Romance',
  topTrends: mockTrends,
  trendCounts: { topic: 1, tone: 1, structure: 0, theme: 0 },
  averageScore: 0.91,
  lastUpdated: '2024-01-01',
};
const mockRecommendations: TrendRecommendation[] = [
  {
    type: 'alignment',
    title: 'Strong Alignment',
    description: 'You are on trend!',
    impact: 'high',
    confidence: 0.9,
    actionableSteps: ['Keep it up!'],
    relatedTrends: ['Slow Burn'],
  },
];

const proProfile: WriterProfile = {
  user_id: 'user-1',
  preferred_sentence_length: 20,
  vocabulary_complexity: 'moderate',
  pacing_style: 'moderate',
  genre_specializations: ['Romance'],
  successful_patterns: {},
  lastTrendMatchScore: 0.75,
  topMisalignments: ['Enemies to Lovers'],
};

describe('MarketTrendPanel', () => {
  beforeEach(() => {
    jest.spyOn(useMarketTrendsModule, 'useMarketTrends').mockReturnValue({
      trends: mockTrends,
      matchResults: mockMatchResults,
      analysis: mockAnalysis,
      summary: mockSummary,
      recommendations: mockRecommendations,
      loading: false,
      error: null,
      lastUpdated: new Date(),
      refreshTrends: jest.fn(),
      analyzeContent: jest.fn(),
      getRecommendations: jest.fn(),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders top market trends and match scores', () => {
    render(
      <MarketTrendPanel
        genre="Romance"
        content="Outline text"
        profile={proProfile}
      />
    );
    expect(screen.getByText('Market Trends: Romance')).toBeInTheDocument();
    expect(screen.getByText('Enemies to Lovers')).toBeInTheDocument();
    expect(screen.getByText('Slow Burn')).toBeInTheDocument();
    expect(screen.getByText('75% alignment')).toBeInTheDocument();
    expect(screen.getByText('Great alignment!')).toBeInTheDocument();
  });

  it('shows Pro gating for Free users', () => {
    render(<MarketTrendPanel genre="Romance" content="Outline text" />);
    expect(
      screen.getByText(/Market trend analysis is a Pro feature/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Upgrade to Pro/i)).toBeInTheDocument();
  });

  it('handles loading and error states', () => {
    jest.spyOn(useMarketTrendsModule, 'useMarketTrends').mockReturnValue({
      trends: [],
      matchResults: [],
      analysis: null,
      summary: null,
      recommendations: [],
      loading: true,
      error: null,
      lastUpdated: null,
      refreshTrends: jest.fn(),
      analyzeContent: jest.fn(),
      getRecommendations: jest.fn(),
    });
    render(
      <MarketTrendPanel
        genre="Romance"
        content="Outline text"
        profile={proProfile}
      />
    );
    expect(screen.getByText(/Analyzing market trends/i)).toBeInTheDocument();
  });

  it('handles null/empty trend states', () => {
    jest.spyOn(useMarketTrendsModule, 'useMarketTrends').mockReturnValue({
      trends: [],
      matchResults: [],
      analysis: null,
      summary: null,
      recommendations: [],
      loading: false,
      error: null,
      lastUpdated: null,
      refreshTrends: jest.fn(),
      analyzeContent: jest.fn(),
      getRecommendations: jest.fn(),
    });
    render(
      <MarketTrendPanel
        genre="Romance"
        content="Outline text"
        profile={proProfile}
      />
    );
    expect(screen.queryByText('Market Trends: Romance')).toBeInTheDocument();
    expect(screen.queryByText('Enemies to Lovers')).not.toBeInTheDocument();
  });
});
