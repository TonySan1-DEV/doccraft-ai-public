import { useState, useEffect, useCallback } from 'react';

import { getSuggestions, recordSuggestionAction } from '../services/realtimeSuggestor';
import { Suggestion, SuggestionContext, LiveSuggestionState } from '../types/Suggestion';
import { WriterProfile } from '../types/WriterProfile';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface UseLiveSuggestionsProps {
  text: string;
  profile: WriterProfile | null;
  context?: SuggestionContext;
  debounceMs?: number;
  minTextLength?: number;
}

interface UseLiveSuggestionsReturn {
  suggestions: Suggestion[];
  loading: boolean;
  error: string | null;
  summary: LiveSuggestionState['summary'];
  lastUpdated: Date | null;
  applySuggestion: (suggestionId: string) => Promise<void>;
  acceptSuggestion: (suggestionId: string) => Promise<void>;
  rejectSuggestion: (suggestionId: string) => Promise<void>;
  ignoreSuggestion: (suggestionId: string) => Promise<void>;
  refreshSuggestions: () => Promise<void>;
}

export function useLiveSuggestions({
  text,
  profile,
  context,
  debounceMs = 1000,
  minTextLength = 10
}: UseLiveSuggestionsProps): UseLiveSuggestionsReturn {
  const { user } = useAuth();
  const [state, setState] = useState<LiveSuggestionState>({
    suggestions: [],
    loading: false,
    error: null,
    lastUpdated: null,
    summary: null
  });

  // Debounce the text input
  const debouncedText = useDebounce(text, debounceMs);

  // Check if user has access to suggestions
  const hasAccess = user?.tier === 'Pro' || user?.tier === 'Admin';

  const fetchSuggestions = useCallback(async () => {
    if (!hasAccess) {
      setState(prev => ({
        ...prev,
        error: 'Real-time suggestions require Pro or Admin tier. Please upgrade to access this feature.',
        loading: false
      }));
      return;
    }

    if (!profile) {
      setState(prev => ({
        ...prev,
        error: 'Writer profile not found. Please complete your profile setup.',
        loading: false
      }));
      return;
    }

    if (!debouncedText.trim() || debouncedText.length < minTextLength) {
      setState(prev => ({
        ...prev,
        suggestions: [],
        summary: null,
        loading: false,
        error: null
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await getSuggestions(debouncedText, profile, context);
      
      setState(prev => ({
        ...prev,
        suggestions: response.suggestions,
        summary: response.summary,
        loading: false,
        lastUpdated: new Date(),
        error: null
      }));

      // Show summary toast for significant suggestions
      if (response.summary.criticalCount > 0) {
        toast.error(`${response.summary.criticalCount} critical suggestions found`);
      } else if (response.summary.warningCount > 0) {
        toast(`${response.summary.warningCount} suggestions to review`);
      }

    } catch (error: any) {
      console.error('Error fetching suggestions:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to fetch suggestions',
        lastUpdated: new Date()
      }));
    }
  }, [debouncedText, profile, context, hasAccess, minTextLength]);

  // Fetch suggestions when debounced text changes
  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  const handleSuggestionAction = useCallback(async (
    suggestionId: string,
    action: 'accept' | 'reject' | 'apply' | 'ignore'
  ) => {
    if (!user?.id) {
      toast.error('You must be logged in to provide feedback');
      return;
    }

    try {
      await recordSuggestionAction(suggestionId, action, user.id);
      
      // Update local state to reflect the action
      setState(prev => ({
        ...prev,
        suggestions: prev.suggestions.map(suggestion => 
          suggestion.id === suggestionId 
            ? { ...suggestion, userAction: action }
            : suggestion
        )
      }));

      // Show feedback based on action
      switch (action) {
        case 'accept':
          toast.success('Suggestion accepted! AI will learn from your preference.');
          break;
        case 'reject':
          toast('Suggestion rejected. AI will adjust future recommendations.');
          break;
        case 'apply':
          toast.success('Suggestion applied to your text!');
          break;
        case 'ignore':
          toast('Suggestion ignored.');
          break;
      }

    } catch (error) {
      console.error('Error recording suggestion action:', error);
      toast.error('Failed to record feedback. Please try again.');
    }
  }, [user?.id]);

  const applySuggestion = useCallback(async (suggestionId: string) => {
    await handleSuggestionAction(suggestionId, 'apply');
  }, [handleSuggestionAction]);

  const acceptSuggestion = useCallback(async (suggestionId: string) => {
    await handleSuggestionAction(suggestionId, 'accept');
  }, [handleSuggestionAction]);

  const rejectSuggestion = useCallback(async (suggestionId: string) => {
    await handleSuggestionAction(suggestionId, 'reject');
  }, [handleSuggestionAction]);

  const ignoreSuggestion = useCallback(async (suggestionId: string) => {
    await handleSuggestionAction(suggestionId, 'ignore');
  }, [handleSuggestionAction]);

  const refreshSuggestions = useCallback(async () => {
    await fetchSuggestions();
  }, [fetchSuggestions]);

  return {
    suggestions: state.suggestions,
    loading: state.loading,
    error: state.error,
    summary: state.summary,
    lastUpdated: state.lastUpdated,
    applySuggestion,
    acceptSuggestion,
    rejectSuggestion,
    ignoreSuggestion,
    refreshSuggestions
  };
}

// Custom debounce hook
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

// Hook for accessing suggestions with tier-based access control
export function useSuggestionsWithAccess(text: string, profile: WriterProfile | null) {
  const { user } = useAuth();
  
  const hasAccess = user?.tier === 'Pro' || user?.tier === 'Admin';
  
  const suggestions = useLiveSuggestions({
    text,
    profile,
    debounceMs: 1000,
    minTextLength: 10
  });

  if (!hasAccess) {
    return {
      ...suggestions,
      suggestions: [],
      error: 'Upgrade to Pro or Admin tier to access real-time AI suggestions',
      loading: false
    };
  }

  return suggestions;
} 