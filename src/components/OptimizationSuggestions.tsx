// MCP Context Block
/*
{
  file: "OptimizationSuggestions.tsx",
  role: "developer",
  allowedActions: ["analyze", "simulate", "visualize", "suggest"],
  tier: "Pro",
  contentSensitivity: "medium",
  theme: "writing_suite"
}
*/

import { useState } from 'react';

interface OptimizationSuggestion {
  type: 'pacing' | 'tension' | 'empathy' | 'engagement' | 'complexity';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  specificChanges: string[];
  expectedImpact: {
    tensionChange: number;
    empathyChange: number;
    engagementChange: number;
  };
  targetPositions: number[];
}

interface StoryOptimizationPlan {
  suggestions: OptimizationSuggestion[];
  overallScore: number;
  implementationOrder: string[];
  riskAssessment: {
    highRisk: string[];
    mediumRisk: string[];
    lowRisk: string[];
  };
}

interface OptimizationSuggestionsProps {
  optimizationPlan?: StoryOptimizationPlan;
  onApplySuggestion?: (suggestionTitle: string) => void;
}

export default function OptimizationSuggestions({
  optimizationPlan,
  onApplySuggestion
}: OptimizationSuggestionsProps) {
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'pacing' | 'tension' | 'empathy' | 'engagement' | 'complexity'>('all');

  if (!optimizationPlan) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <p className="mt-2">No optimization suggestions available</p>
        </div>
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'pacing': return 'bg-blue-100 text-blue-800';
      case 'tension': return 'bg-red-100 text-red-800';
      case 'empathy': return 'bg-green-100 text-green-800';
      case 'engagement': return 'bg-purple-100 text-purple-800';
      case 'complexity': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactColor = (change: number) => {
    if (change > 10) return 'text-green-600';
    if (change < -10) return 'text-red-600';
    return 'text-gray-600';
  };

  const filteredSuggestions = optimizationPlan.suggestions.filter(suggestion => 
    filterType === 'all' || suggestion.type === filterType
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Optimization Suggestions</h3>
          <p className="text-sm text-gray-600">
            Overall optimization score: {optimizationPlan.overallScore}%
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Filter:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="text-sm border border-gray-300 rounded-md px-2 py-1"
          >
            <option value="all">All Types</option>
            <option value="pacing">Pacing</option>
            <option value="tension">Tension</option>
            <option value="empathy">Empathy</option>
            <option value="engagement">Engagement</option>
            <option value="complexity">Complexity</option>
          </select>
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm font-medium text-red-800">High Risk</span>
          </div>
          <div className="text-sm text-red-700">
            {optimizationPlan.riskAssessment.highRisk.length} suggestions
          </div>
        </div>
        
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-sm font-medium text-yellow-800">Medium Risk</span>
          </div>
          <div className="text-sm text-yellow-700">
            {optimizationPlan.riskAssessment.mediumRisk.length} suggestions
          </div>
        </div>
        
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-green-800">Low Risk</span>
          </div>
          <div className="text-sm text-green-700">
            {optimizationPlan.riskAssessment.lowRisk.length} suggestions
          </div>
        </div>
      </div>

      {/* Suggestions List */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-900">
          {filteredSuggestions.length} Suggestions
        </h4>
        
        <div className="space-y-3">
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedSuggestion === suggestion.title
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedSuggestion(
                selectedSuggestion === suggestion.title ? null : suggestion.title
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(suggestion.priority)}`}>
                      {suggestion.priority.toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(suggestion.type)}`}>
                      {suggestion.type}
                    </span>
                  </div>
                  
                  <h5 className="font-medium text-gray-900 mb-1">
                    {suggestion.title}
                  </h5>
                  
                  <p className="text-sm text-gray-600">
                    {suggestion.description}
                  </p>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onApplySuggestion?.(suggestion.title);
                  }}
                  className="px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                >
                  Apply
                </button>
              </div>

              {/* Impact Preview */}
              <div className="grid grid-cols-3 gap-4 mb-3">
                <div className="text-center">
                  <div className={`text-sm font-medium ${getImpactColor(suggestion.expectedImpact.tensionChange)}`}>
                    {suggestion.expectedImpact.tensionChange > 0 ? '+' : ''}{suggestion.expectedImpact.tensionChange}%
                  </div>
                  <div className="text-xs text-gray-500">Tension</div>
                </div>
                
                <div className="text-center">
                  <div className={`text-sm font-medium ${getImpactColor(suggestion.expectedImpact.empathyChange)}`}>
                    {suggestion.expectedImpact.empathyChange > 0 ? '+' : ''}{suggestion.expectedImpact.empathyChange}%
                  </div>
                  <div className="text-xs text-gray-500">Empathy</div>
                </div>
                
                <div className="text-center">
                  <div className={`text-sm font-medium ${getImpactColor(suggestion.expectedImpact.engagementChange)}`}>
                    {suggestion.expectedImpact.engagementChange > 0 ? '+' : ''}{suggestion.expectedImpact.engagementChange}%
                  </div>
                  <div className="text-xs text-gray-500">Engagement</div>
                </div>
              </div>

              {/* Expanded Details */}
              {selectedSuggestion === suggestion.title && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                  <div>
                    <h6 className="text-sm font-medium text-gray-900 mb-2">Specific Changes:</h6>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {suggestion.specificChanges.map((change, changeIndex) => (
                        <li key={changeIndex} className="flex items-start space-x-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>{change}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {suggestion.targetPositions.length > 0 && (
                    <div>
                      <h6 className="text-sm font-medium text-gray-900 mb-2">Target Positions:</h6>
                      <div className="flex flex-wrap gap-2">
                        {suggestion.targetPositions.map((position, posIndex) => (
                          <span
                            key={posIndex}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                          >
                            {Math.round(position * 100)}%
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Implementation Order */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Recommended Implementation Order</h4>
        <div className="space-y-2">
          {optimizationPlan.implementationOrder.slice(0, 5).map((title, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                {index + 1}
              </div>
              <span className="text-sm text-gray-700">{title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 