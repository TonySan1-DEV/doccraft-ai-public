import React, { useState } from 'react';
import { useLiveSuggestions } from '../hooks/useLiveSuggestions';
import { Suggestion, SuggestionContext } from '../types/Suggestion';
import { WriterProfile } from '../types/WriterProfile';
import { FeedbackButtons } from './FeedbackButtons';
import { 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  XCircle, 
  Zap, 
  Eye, 
  EyeOff,
  RefreshCw,
  Brain,
  MessageSquare,
  TrendingUp,
  Sparkles,
  Target,
  BookOpen
} from 'lucide-react';

interface SuggestionPanelProps {
  text: string;
  profile: WriterProfile | null;
  context?: SuggestionContext;
  onSuggestionApply?: (suggestion: Suggestion) => void;
  className?: string;
  showSummary?: boolean;
  maxSuggestions?: number;
}

const SuggestionPanel: React.FC<SuggestionPanelProps> = ({
  text,
  profile,
  context,
  onSuggestionApply,
  className = '',
  showSummary = true,
  maxSuggestions = 10
}) => {
  const {
    suggestions,
    loading,
    error,
    summary,
    lastUpdated,
    applySuggestion,
    acceptSuggestion,
    rejectSuggestion,
    ignoreSuggestion,
    refreshSuggestions
  } = useLiveSuggestions({
    text,
    profile,
    context,
    debounceMs: 1000,
    minTextLength: 10
  });

  const [expandedSuggestion, setExpandedSuggestion] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(true);

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'style':
        return <Sparkles className="w-4 h-4" />;
      case 'tone':
        return <MessageSquare className="w-4 h-4" />;
      case 'clarity':
        return <BookOpen className="w-4 h-4" />;
      case 'pacing':
        return <TrendingUp className="w-4 h-4" />;
      case 'structure':
        return <Target className="w-4 h-4" />;
      case 'grammar':
        return <CheckCircle className="w-4 h-4" />;
      case 'engagement':
        return <Brain className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800';
      case 'info':
        return 'border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800';
      default:
        return 'border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 dark:text-green-400';
    if (confidence >= 0.6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  const handleApplySuggestion = async (suggestion: Suggestion) => {
    await applySuggestion(suggestion.id);
    if (onSuggestionApply) {
      onSuggestionApply(suggestion);
    }
  };

  if (error) {
    return (
      <div className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-2 text-red-700 dark:text-red-300">
          <AlertTriangle className="w-5 h-5" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span className="text-sm">Analyzing your writing...</span>
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className={`bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-2 text-green-700 dark:text-green-300">
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm">No suggestions found. Your writing looks great!</span>
        </div>
      </div>
    );
  }

  const displayedSuggestions = suggestions.slice(0, maxSuggestions);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with summary and controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            AI Writing Suggestions
          </h3>
          {summary && showSummary && (
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <span>{summary.totalSuggestions} suggestions</span>
              {summary.criticalCount > 0 && (
                <span className="text-red-600 dark:text-red-400">
                  {summary.criticalCount} critical
                </span>
              )}
              {summary.warningCount > 0 && (
                <span className="text-yellow-600 dark:text-yellow-400">
                  {summary.warningCount} warnings
                </span>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            title={showDetails ? 'Hide details' : 'Show details'}
          >
            {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            onClick={refreshSuggestions}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            title="Refresh suggestions"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Suggestions list */}
      <div className="space-y-3">
        {displayedSuggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className={`border rounded-lg p-4 transition-all ${getSeverityColor(suggestion.severity)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className="flex-shrink-0 mt-1">
                  {getSeverityIcon(suggestion.severity)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex items-center space-x-1">
                      {getSuggestionIcon(suggestion.type)}
                      <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                        {suggestion.type}
                      </span>
                    </div>
                    <span className={`text-xs font-medium ${getConfidenceColor(suggestion.confidence)}`}>
                      {Math.round(suggestion.confidence * 100)}% confidence
                    </span>
                  </div>

                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    {suggestion.comment}
                  </p>

                  {showDetails && (
                    <>
                      <button
                        onClick={() => setExpandedSuggestion(
                          expandedSuggestion === suggestion.id ? null : suggestion.id
                        )}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                      >
                        {expandedSuggestion === suggestion.id ? 'Hide details' : 'Show reasoning'}
                      </button>

                      {expandedSuggestion === suggestion.id && (
                        <div className="mt-3 p-3 bg-white dark:bg-gray-700 rounded-lg border">
                          <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                            AI Reasoning:
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                            {suggestion.reasoning}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {suggestion.basedOnPatterns.map((pattern, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs"
                              >
                                {pattern.replace(/_/g, ' ')}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-1 ml-4">
                {suggestion.suggestedText && (
                  <button
                    onClick={() => handleApplySuggestion(suggestion)}
                    className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                    title="Apply suggestion"
                  >
                    <Zap className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => acceptSuggestion(suggestion.id)}
                  className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                  title="Accept suggestion"
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => rejectSuggestion(suggestion.id)}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Reject suggestion"
                >
                  <XCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => ignoreSuggestion(suggestion.id)}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  title="Ignore suggestion"
                >
                  <EyeOff className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Feedback Buttons */}
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <FeedbackButtons
                sourcePrompt={`Suggestion: ${suggestion.comment} | Type: ${suggestion.type} | Severity: ${suggestion.severity}`}
                patternUsed={suggestion.basedOnPatterns.join(', ')}
                contentType="suggestion"
                contextData={{
                  suggestionId: suggestion.id,
                  suggestionType: suggestion.type,
                  suggestionSeverity: suggestion.severity,
                  suggestionConfidence: suggestion.confidence,
                  hasSuggestedText: !!suggestion.suggestedText
                }}
                size="sm"
                showLabels={false}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Footer with last updated info */}
      {lastUpdated && (
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      )}

      {suggestions.length > maxSuggestions && (
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Showing {maxSuggestions} of {suggestions.length} suggestions
        </div>
      )}
    </div>
  );
};

export default SuggestionPanel; 