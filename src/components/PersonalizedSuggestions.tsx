import React, { useState, useEffect } from 'react';
import { useWriterProfile } from '../hooks/useWriterProfile';
import { PersonalizedSuggestion } from '../types/WriterProfile';
import { Brain, Lightbulb, TrendingUp, CheckCircle, XCircle, Sparkles } from 'lucide-react';

interface PersonalizedSuggestionsProps {
  context: string;
  currentContent?: string;
  onSuggestionAccepted?: (suggestion: PersonalizedSuggestion) => void;
  onSuggestionRejected?: (suggestion: PersonalizedSuggestion) => void;
}

const PersonalizedSuggestions: React.FC<PersonalizedSuggestionsProps> = ({
  context,
  currentContent,
  onSuggestionAccepted,
  onSuggestionRejected
}) => {
  const { getSuggestions, recordAction } = useWriterProfile();
  const [suggestions, setSuggestions] = useState<PersonalizedSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedSuggestion, setExpandedSuggestion] = useState<number | null>(null);

  useEffect(() => {
    loadSuggestions();
  }, [context, currentContent]);

  const loadSuggestions = async () => {
    setLoading(true);
    try {
      const userSuggestions = await getSuggestions(context, currentContent);
      setSuggestions(userSuggestions);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionAction = async (suggestion: PersonalizedSuggestion, action: 'accept' | 'reject') => {
    try {
      await recordAction(
        suggestion.type,
        context,
        action === 'accept' ? 'success' : 'failure'
      );

      if (action === 'accept' && onSuggestionAccepted) {
        onSuggestionAccepted(suggestion);
      } else if (action === 'reject' && onSuggestionRejected) {
        onSuggestionRejected(suggestion);
      }
    } catch (error) {
      console.error('Error recording suggestion action:', error);
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'outline':
        return <Brain className="w-4 h-4" />;
      case 'content':
        return <Lightbulb className="w-4 h-4" />;
      case 'style':
        return <Sparkles className="w-4 h-4" />;
      case 'structure':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 dark:text-green-400';
    if (confidence >= 0.6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High Confidence';
    if (confidence >= 0.6) return 'Medium Confidence';
    return 'Low Confidence';
  };

  if (loading) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 dark:border-blue-400 mr-3"></div>
          <span className="text-blue-700 dark:text-blue-300">Analyzing your writing style...</span>
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center">
        <Brain className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
        <p className="text-gray-600 dark:text-gray-400">
          No personalized suggestions available for this context.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center mb-4">
        <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Personalized AI Suggestions
        </h3>
        <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs">
          {suggestions.length} suggestions
        </span>
      </div>

      {suggestions.map((suggestion, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <div className="flex-shrink-0 mt-1">
                {getSuggestionIcon(suggestion.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {suggestion.type} Suggestion
                  </span>
                  <span className={`text-xs font-medium ${getConfidenceColor(suggestion.confidence)}`}>
                    {getConfidenceLabel(suggestion.confidence)}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {Math.round(suggestion.confidence * 100)}%
                  </span>
                </div>

                <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                  {suggestion.suggestion}
                </p>

                <button
                  onClick={() => setExpandedSuggestion(expandedSuggestion === index ? null : index)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  {expandedSuggestion === index ? 'Hide details' : 'Show reasoning'}
                </button>

                {expandedSuggestion === index && (
                  <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Based on your patterns:
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      {suggestion.reasoning}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {suggestion.based_on_patterns.map((pattern, patternIndex) => (
                        <span
                          key={patternIndex}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs"
                        >
                          {pattern.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={() => handleSuggestionAction(suggestion, 'accept')}
                className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                title="Accept suggestion"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleSuggestionAction(suggestion, 'reject')}
                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Reject suggestion"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}

      <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
        <Brain className="w-3 h-3 inline mr-1" />
        AI learns from your feedback to provide better suggestions
      </div>
    </div>
  );
};

export default PersonalizedSuggestions; 