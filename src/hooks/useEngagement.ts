import { useState, useEffect, useCallback } from 'react';
import { analyzeEngagement } from '../services/engagementAnalyzer';
import { EngagementAnalysis } from '../types/EngagementAnalysis';
import { WriterProfile } from '../types/WriterProfile';

interface UseEngagementOptions {
  content: string;
  genre?: string;
  profile?: WriterProfile;
  debounceMs?: number;
}

export function useEngagement({
  content,
  genre,
  profile,
  debounceMs = 1000
}: UseEngagementOptions) {
  const [analysis, setAnalysis] = useState<EngagementAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce content
  const [debouncedContent, setDebouncedContent] = useState(content);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedContent(content), debounceMs);
    return () => clearTimeout(handler);
  }, [content, debounceMs]);

  const runAnalysis = useCallback(async () => {
    if (!debouncedContent || debouncedContent.trim().length < 10) {
      setAnalysis(null);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeEngagement(debouncedContent, genre, profile);
      setAnalysis(result);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze engagement');
      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  }, [debouncedContent, genre, profile]);

  useEffect(() => {
    runAnalysis();
  }, [runAnalysis]);

  return {
    analysis,
    loading,
    error,
    refresh: runAnalysis
  };
} 