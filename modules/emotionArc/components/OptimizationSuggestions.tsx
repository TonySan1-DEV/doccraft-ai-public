// MCP Context Block
/*
{
  file: "modules/emotionArc/components/OptimizationSuggestions.tsx",
  role: "frontend-developer",
  allowedActions: ["scaffold", "visualize", "simulate", "accessibility"],
  tier: "Pro",
  contentSensitivity: "medium",
  theme: "emotional_modeling"
}
*/

import React, { useState, useMemo, useCallback } from 'react';
import { OptimizationSuggestion, StoryOptimizationPlan } from '../types/emotionTypes';

interface OptimizationSuggestionsProps {
  optimizationPlan: StoryOptimizationPlan;
  isLoading?: boolean;
  error?: string | null;
  onSuggestionClick?: (suggestion: OptimizationSuggestion) => void;
  onApplySuggestion?: (suggestionId: string) => void;
  onDismissSuggestion?: (suggestionId: string) => void;
  className?: string;
  'aria-label'?: string;
}

interface SuggestionCardProps {
  suggestion: OptimizationSuggestion;
  onApply: (suggestionId: string) => void;
  onDismiss: (suggestionId: string) => void;
  onClick: (suggestion: OptimizationSuggestion) => void;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({
  suggestion,
  onApply,
  onDismiss,
  onClick
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'hard': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pacing': return '⏱️';
      case 'tension': return '⚡';
      case 'empathy': return '💝';
      case 'engagement': return '🎯';
      case 'complexity': return '🧠';
      default: return '💡';
    }
  };

  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
      role="article"
      aria-labelledby={`suggestion-title-${suggestion.id}`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-lg" role="img" aria-label={`${suggestion.type} suggestion`}>
              {getTypeIcon(suggestion.type)}
            </span>
            <div className="flex-1">
              <button 
                id={`suggestion-title-${suggestion.id}`}
                className="text-sm font-semibold text-gray-900 cursor-pointer hover:text-blue-600 text-left w-full"
                onClick={() => onClick(suggestion)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick(suggestion);
                  }
                }}
                aria-expanded={isExpanded}
                aria-controls={`suggestion-details-${suggestion.id}`}
              >
                {suggestion.title}
              </button>
              <p className="text-sm text-gray-600 mt-1">{suggestion.description}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(suggestion.priority)}`}>
              {suggestion.priority}
            </span>
            <div className={`w-2 h-2 rounded-full ${getRiskColor(suggestion.riskLevel)}`} 
                 aria-label={`Risk level: ${suggestion.riskLevel}`} />
          </div>
        </div>
      </div>

      {/* Impact Score Bars */}
      <div className="p-4 border-b border-gray-100">
        <h5 className="text-xs font-medium text-gray-700 mb-3">Expected Impact</h5>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Tension</span>
            <div className="flex items-center space-x-2">
              <div className="w-20 bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    suggestion.expectedImpact.tensionChange > 0 ? 'bg-red-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.abs(suggestion.expectedImpact.tensionChange)}%` }}
                  role="progressbar"
                  aria-valuenow={Math.abs(suggestion.expectedImpact.tensionChange)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Tension change: ${suggestion.expectedImpact.tensionChange > 0 ? '+' : ''}${suggestion.expectedImpact.tensionChange}%`}
                />
              </div>
              <span className={`text-xs font-medium ${
                suggestion.expectedImpact.tensionChange > 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {suggestion.expectedImpact.tensionChange > 0 ? '+' : ''}{suggestion.expectedImpact.tensionChange}%
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Empathy</span>
            <div className="flex items-center space-x-2">
              <div className="w-20 bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-blue-500"
                  style={{ width: `${Math.abs(suggestion.expectedImpact.empathyChange)}%` }}
                  role="progressbar"
                  aria-valuenow={Math.abs(suggestion.expectedImpact.empathyChange)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Empathy change: +${suggestion.expectedImpact.empathyChange}%`}
                />
              </div>
              <span className="text-xs font-medium text-blue-600">
                +{suggestion.expectedImpact.empathyChange}%
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Engagement</span>
            <div className="flex items-center space-x-2">
              <div className="w-20 bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-green-500"
                  style={{ width: `${Math.abs(suggestion.expectedImpact.engagementChange)}%` }}
                  role="progressbar"
                  aria-valuenow={Math.abs(suggestion.expectedImpact.engagementChange)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Engagement change: +${suggestion.expectedImpact.engagementChange}%`}
                />
              </div>
              <span className="text-xs font-medium text-green-600">
                +{suggestion.expectedImpact.engagementChange}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Details */}
      <div className="p-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full text-sm text-gray-600 hover:text-gray-900"
          aria-expanded={isExpanded}
          aria-controls={`suggestion-details-${suggestion.id}`}
        >
          <span>View details</span>
          <svg 
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isExpanded && (
          <div 
            id={`suggestion-details-${suggestion.id}`}
            className="mt-4 space-y-4"
            role="region"
            aria-label="Suggestion details"
          >
            {/* Specific Changes */}
            <div>
              <h6 className="text-xs font-medium text-gray-700 mb-2">Specific Changes</h6>
              <ul className="space-y-1">
                {suggestion.specificChanges.map((change, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    {change}
                  </li>
                ))}
              </ul>
            </div>

            {/* Implementation Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-medium text-gray-700">Difficulty</span>
                <p className={`text-sm font-medium ${getDifficultyColor(suggestion.implementationDifficulty)}`}>
                  {suggestion.implementationDifficulty}
                </p>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-700">Estimated Time</span>
                <p className="text-sm text-gray-600">{suggestion.estimatedTime} minutes</p>
              </div>
            </div>

            {/* Target Positions */}
            {suggestion.targetPositions.length > 0 && (
              <div>
                <span className="text-xs font-medium text-gray-700">Target Positions</span>
                <p className="text-sm text-gray-600">
                  {suggestion.targetPositions.map(pos => `${Math.round(pos * 100)}%`).join(', ')}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-t border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onApply(suggestion.id)}
            className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label={`Apply suggestion: ${suggestion.title}`}
          >
            Apply
          </button>
          <button
            onClick={() => onDismiss(suggestion.id)}
            className="px-3 py-1 text-xs font-medium text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            aria-label={`Dismiss suggestion: ${suggestion.title}`}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default function OptimizationSuggestions({
  optimizationPlan,
  isLoading = false,
  error = null,
  onSuggestionClick,
  onApplySuggestion,
  onDismissSuggestion,
  className = '',
  'aria-label': ariaLabel = 'Optimization Suggestions'
}: OptimizationSuggestionsProps) {
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'impact' | 'difficulty'>('priority');

  const filteredSuggestions = useMemo(() => {
    let suggestions = optimizationPlan.suggestions;
    
    if (filter !== 'all') {
      suggestions = suggestions.filter(s => s.priority === filter);
    }
    
    switch (sortBy) {
      case 'priority': {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        suggestions.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
        break;
      }
      case 'impact':
        suggestions.sort((a, b) => b.expectedImpact.engagementChange - a.expectedImpact.engagementChange);
        break;
      case 'difficulty': {
        const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
        suggestions.sort((a, b) => difficultyOrder[a.implementationDifficulty] - difficultyOrder[b.implementationDifficulty]);
        break;
      }
    }
    
    return suggestions;
  }, [optimizationPlan.suggestions, filter, sortBy]);

  const handleApply = useCallback((suggestionId: string) => {
    onApplySuggestion?.(suggestionId);
  }, [onApplySuggestion]);

  const handleDismiss = useCallback((suggestionId: string) => {
    onDismissSuggestion?.(suggestionId);
  }, [onDismissSuggestion]);

  const handleSuggestionClick = useCallback((suggestion: OptimizationSuggestion) => {
    onSuggestionClick?.(suggestion);
  }, [onSuggestionClick]);

  // Error state
  if (error) {
    return (
      <div 
        className={`p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}
        role="alert"
        aria-live="polite"
      >
        <div className="flex items-center">
          <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="text-red-800 font-medium">Error loading suggestions</span>
        </div>
        <p className="text-red-700 mt-1 text-sm">{error}</p>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div 
        className={`flex items-center justify-center h-64 bg-gray-50 rounded-lg ${className}`}
        role="status"
        aria-live="polite"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Generating optimization suggestions...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`space-y-4 ${className}`}
      role="region"
      aria-label={ariaLabel}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Optimization Suggestions</h3>
          <p className="text-sm text-gray-600">
            {optimizationPlan.suggestions.length} suggestions • Overall score: {optimizationPlan.overallScore}%
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Filter:</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
              aria-label="Filter suggestions by priority"
            >
              <option value="all">All</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
              aria-label="Sort suggestions"
            >
              <option value="priority">By Priority</option>
              <option value="impact">By Impact</option>
              <option value="difficulty">By Difficulty</option>
            </select>
          </div>
        </div>
      </div>

      {/* Overall Improvement Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Expected Overall Improvement</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <span className="text-xs text-blue-700">Tension</span>
            <p className="text-lg font-bold text-blue-900">
              {optimizationPlan.estimatedImprovement.tension > 0 ? '+' : ''}{optimizationPlan.estimatedImprovement.tension}%
            </p>
          </div>
          <div>
            <span className="text-xs text-blue-700">Empathy</span>
            <p className="text-lg font-bold text-blue-900">
              +{optimizationPlan.estimatedImprovement.empathy}%
            </p>
          </div>
          <div>
            <span className="text-xs text-blue-700">Engagement</span>
            <p className="text-lg font-bold text-blue-900">
              +{optimizationPlan.estimatedImprovement.engagement}%
            </p>
          </div>
          <div>
            <span className="text-xs text-blue-700">Overall</span>
            <p className="text-lg font-bold text-blue-900">
              +{optimizationPlan.estimatedImprovement.overall}%
            </p>
          </div>
        </div>
      </div>

      {/* Risk Assessment */}
      {optimizationPlan.riskAssessment.highRisk.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-red-900 mb-2">⚠️ High Risk Suggestions</h4>
          <ul className="text-sm text-red-800 space-y-1">
            {optimizationPlan.riskAssessment.highRisk.map((risk, index) => (
              <li key={index} className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                {risk}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggestions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredSuggestions.map((suggestion) => (
          <SuggestionCard
            key={suggestion.id}
            suggestion={suggestion}
            onApply={handleApply}
            onDismiss={handleDismiss}
            onClick={handleSuggestionClick}
          />
        ))}
      </div>

      {/* Empty state */}
      {filteredSuggestions.length === 0 && (
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <p className="mt-2 text-gray-500">No suggestions match the current filter</p>
        </div>
      )}

      {/* Implementation Order */}
      {optimizationPlan.implementationOrder.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Recommended Implementation Order</h4>
          <ol className="space-y-2">
            {optimizationPlan.implementationOrder.map((title, index) => (
              <li key={index} className="flex items-center space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                  {index + 1}
                </span>
                <span className="text-sm text-gray-700">{title}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
} 