import { useState, useEffect, useCallback } from 'react';

import { 
  getTrendsByGenre, 
  analyzeAgainstTrends, 
  getMarketAnalysis,
  getGenreTrendSummary,
  generateTrendRecommendations
} from '../services/trendAdvisor';
import { 
  MarketTrend, 
  TrendMatchResult, 
  MarketAnalysis, 
  GenreTrendSummary,
  TrendRecommendation,
  MarketTrendState
} from '../types/MarketTrend';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface UseMarketTrendsProps {
  genre: string;
  content?: string;
  debounceMs?: number;
  minContentLength?: number;
  autoAnalyze?: boolean;
}

interface UseMarketTrendsReturn {
  trends: MarketTrend[];
  matchResults: TrendMatchResult[];
  analysis: MarketAnalysis | null;
  summary: GenreTrendSummary | null;
  recommendations: TrendRecommendation[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refreshTrends: () => Promise<void>;
  analyzeContent: (content: string) => Promise<void>;
  getRecommendations: () => Promise<void>;
}

export function useMarketTrends({
  genre,
  content = '',
  debounceMs = 2000,
  minContentLength = 20,
  autoAnalyze = true
}: UseMarketTrendsProps): UseMarketTrendsReturn {
  const { user } = useAuth();
  const [state, setState] = useState<MarketTrendState>({
    trends: [],
    matchResults: [],
    loading: false,
    error: null,
    lastUpdated: null,
    analysis: null
  });
  const [summary, setSummary] = useState<GenreTrendSummary | null>(null);
  const [recommendations, setRecommendations] = useState<TrendRecommendation[]>([]);

  // Debounce the content input
  const debouncedContent = useDebounce(content, debounceMs);

  // Check if user has access to market trends
  const hasAccess = user?.tier === 'Pro' || user?.tier === 'Admin';

  const loadTrends = useCallback(async () => {
    if (!hasAccess) {
      setState(prev => ({
        ...prev,
        error: 'Market trend analysis requires Pro or Admin tier. Please upgrade to access this feature.',
        loading: false
      }));
      return;
    }

    if (!genre) {
      setState(prev => ({
        ...prev,
        error: 'Genre is required for market trend analysis.',
        loading: false
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const [trendsData, summaryData] = await Promise.all([
        getTrendsByGenre(genre),
        getGenreTrendSummary(genre)
      ]);

      setState(prev => ({
        ...prev,
        trends: trendsData,
        loading: false,
        lastUpdated: new Date(),
        error: null
      }));

      setSummary(summaryData);

    } catch (error: any) {
      console.error('Error loading market trends:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to load market trends',
        lastUpdated: new Date()
      }));
    }
  }, [genre, hasAccess]);

  const analyzeContent = useCallback(async (contentToAnalyze: string) => {
    if (!hasAccess || !genre || !contentToAnalyze.trim() || contentToAnalyze.length < minContentLength) {
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const [matchResultsData, analysisData, recommendationsData] = await Promise.all([
        analyzeAgainstTrends(contentToAnalyze, genre),
        getMarketAnalysis(contentToAnalyze, genre),
        generateTrendRecommendations(contentToAnalyze, genre)
      ]);

      setState(prev => ({
        ...prev,
        matchResults: matchResultsData,
        analysis: analysisData,
        loading: false,
        lastUpdated: new Date(),
        error: null
      }));

      setRecommendations(recommendationsData);

      // Show summary toast for significant findings
      if (analysisData.overallAlignment > 0.7) {
        toast.success(`Strong market alignment: ${Math.round(analysisData.overallAlignment * 100)}%`);
      } else if (analysisData.overallAlignment < 0.3) {
        toast.error(`Low market alignment: ${Math.round(analysisData.overallAlignment * 100)}%`);
      }

    } catch (error: any) {
      console.error('Error analyzing content against trends:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to analyze content against trends',
        lastUpdated: new Date()
      }));
    }
  }, [genre, hasAccess, minContentLength]);

  const getRecommendations = useCallback(async () => {
    if (!hasAccess || !genre || !content.trim()) {
      return;
    }

    try {
      const recommendationsData = await generateTrendRecommendations(content, genre);
      setRecommendations(recommendationsData);
    } catch (error: any) {
      console.error('Error getting recommendations:', error);
      toast.error('Failed to generate recommendations');
    }
  }, [content, genre, hasAccess]);

  const refreshTrends = useCallback(async () => {
    await loadTrends();
  }, [loadTrends]);

  // Load trends when genre changes
  useEffect(() => {
    loadTrends();
  }, [loadTrends]);

  // Auto-analyze content when it changes
  useEffect(() => {
    if (autoAnalyze && debouncedContent) {
      analyzeContent(debouncedContent);
    }
  }, [debouncedContent, autoAnalyze, analyzeContent]);

  return {
    trends: state.trends,
    matchResults: state.matchResults,
    analysis: state.analysis,
    summary,
    recommendations,
    loading: state.loading,
    error: state.error,
    lastUpdated: state.lastUpdated,
    refreshTrends,
    analyzeContent,
    getRecommendations
  };
}

// Custom debounce hook (if not already available)
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Hook for accessing market trends with tier-based access control
export function useMarketTrendsWithAccess(genre: string, content?: string) {
  const { user } = useAuth();
  
  const hasAccess = user?.tier === 'Pro' || user?.tier === 'Admin';
  
  const marketTrends = useMarketTrends({
    genre,
    content,
    debounceMs: 2000,
    minContentLength: 20,
    autoAnalyze: true
  });

  if (!hasAccess) {
    return {
      ...marketTrends,
      trends: [],
      matchResults: [],
      analysis: null,
      summary: null,
      recommendations: [],
      error: 'Upgrade to Pro or Admin tier to access market trend analysis',
      loading: false
    };
  }

  return marketTrends;
}

// Hook for genre trend summary only
export function useGenreTrendSummary(genre: string) {
  const [summary, setSummary] = useState<GenreTrendSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = useCallback(async () => {
    if (!genre) return;

    setLoading(true);
    setError(null);

    try {
      const summaryData = await getGenreTrendSummary(genre);
      setSummary(summaryData);
    } catch (error: any) {
      console.error('Error loading genre trend summary:', error);
      setError(error.message || 'Failed to load trend summary');
    } finally {
      setLoading(false);
    }
  }, [genre]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  return {
    summary,
    loading,
    error,
    refreshSummary: loadSummary
  };
} 