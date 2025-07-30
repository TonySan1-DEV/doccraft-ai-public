import React, { useState } from 'react';
import { useMarketTrends } from '../hooks/useMarketTrends';

import { WriterProfile } from '../types/WriterProfile';
import { useAuth } from '../contexts/AuthContext';
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Target,
  BarChart3,
  Lightbulb,
  AlertCircle,
  Star,
  Eye,
  EyeOff,
  RefreshCw,
  Zap,

} from 'lucide-react';

interface MarketTrendPanelProps {
  genre: string;
  content?: string;
  maxItems?: number;
  showSummary?: boolean;
  showRecommendations?: boolean;
  className?: string;
  profile?: WriterProfile;
}

const MarketTrendPanel: React.FC<MarketTrendPanelProps> = ({
  genre,
  content = '',
  maxItems = 5,
  showSummary = true,
  showRecommendations = true,
  className = '',
  profile
}) => {
  const { user } = useAuth();
  const tier = user?.tier || profile?.tier || 'Free';
  const isPro = tier === 'Pro' || tier === 'Admin';

  const {
    trends,
    matchResults,
    analysis,
    summary,
    recommendations,
    loading,
    error,
    lastUpdated,
    refreshTrends,

  } = useMarketTrends({
    genre,
    content,
    debounceMs: 2000,
    minContentLength: 20,
    autoAnalyze: true
  });


  const [showDetails, setShowDetails] = useState(true);
  const [showAllTrends, setShowAllTrends] = useState(false);

  const getTrendTypeIcon = (type: string) => {
    switch (type) {
      case 'topic':
        return <Target className="w-4 h-4" />;
      case 'tone':
        return <BarChart3 className="w-4 h-4" />;
      case 'structure':
        return <TrendingUp className="w-4 h-4" />;
      case 'theme':
        return <Lightbulb className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'low':
        return <Info className="w-4 h-4 text-blue-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 dark:text-green-400';
    if (score >= 0.6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  const getAlignmentColor = (alignment: number) => {
    if (alignment >= 0.7) return 'text-green-600 dark:text-green-400';
    if (alignment >= 0.4) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'alignment':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'opportunity':
        return <Zap className="w-4 h-4 text-blue-500" />;
      case 'risk':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'adjustment':
        return <Target className="w-4 h-4 text-yellow-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-red-600 dark:text-red-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'low':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  if (!isPro) {
    return (
      <div className={`bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-2 text-yellow-700 dark:text-yellow-300">
          <AlertTriangle className="w-5 h-5" />
          <span className="text-sm font-medium">
            Market trend analysis is a Pro feature. <a href="/settings#upgrade" className="underline text-blue-600 dark:text-blue-400">Upgrade to Pro</a> to unlock real-time market insights.
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-2 text-red-700 dark:text-red-300">
          <AlertCircle className="w-5 h-5" />
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
          <span className="text-sm">Analyzing market trends...</span>
        </div>
      </div>
    );
  }

  const displayedTrends = showAllTrends ? trends : trends.slice(0, maxItems);
  const displayedMatches = showAllTrends ? matchResults : matchResults.slice(0, maxItems);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Market Trends: {genre}
          </h3>
          {summary && showSummary && (
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <span>{summary.topTrends.length} trends</span>
              <span className={`font-medium ${getAlignmentColor(analysis?.overallAlignment || 0)}`}>
                {analysis ? `${Math.round(analysis.overallAlignment * 100)}% alignment` : 'Analyzing...'}
              </span>
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
            onClick={refreshTrends}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            title="Refresh trends"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Market Alignment Summary */}
      {analysis && showSummary && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900 dark:text-white">Market Alignment</h4>
            <span className={`text-lg font-bold ${getAlignmentColor(analysis.overallAlignment)}`}>
              {Math.round(analysis.overallAlignment * 100)}%
            </span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-green-600 dark:text-green-400">
                {analysis.summary.highMatches}
              </div>
              <div className="text-gray-600 dark:text-gray-400">High Matches</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-yellow-600 dark:text-yellow-400">
                {analysis.summary.mediumMatches}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Medium Matches</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-blue-600 dark:text-blue-400">
                {analysis.summary.lowMatches}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Low Matches</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-600 dark:text-gray-400">
                {analysis.summary.totalTrends}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Total Trends</div>
            </div>
          </div>
        </div>
      )}

      {/* Top Market Trends */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-900 dark:text-white">Top Market Trends</h4>
          <button
            onClick={() => setShowAllTrends(!showAllTrends)}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            {showAllTrends ? 'Show less' : 'Show all'}
          </button>
        </div>

        <div className="space-y-3">
          {displayedTrends.map((trend) => (
            <div
              key={trend.id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  {getTrendTypeIcon(trend.trend_type)}
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400 capitalize">
                    {trend.trend_type}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {trend.label}
                  </div>
                  {showDetails && trend.examples && trend.examples.length > 0 && (
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Examples: {trend.examples.slice(0, 2).join(', ')}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-semibold ${getScoreColor(trend.score)}`}>
                  {Math.round(trend.score * 100)}%
                </span>
                <Star className="w-4 h-4 text-yellow-500" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content Matches */}
      {content && matchResults.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Your Content Matches</h4>
          
          <div className="space-y-3">
            {displayedMatches.map((match) => (
              <div
                key={match.trend.id}
                className={`border rounded-lg p-3 ${
                  match.severity === 'high' 
                    ? 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800'
                    : match.severity === 'medium'
                    ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800'
                    : 'border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getSeverityIcon(match.severity)}
                      <span className="font-medium text-gray-900 dark:text-white">
                        {match.trend.label}
                      </span>
                      <span className={`text-xs font-medium ${getScoreColor(match.confidence)}`}>
                        {Math.round(match.confidence * 100)}% confidence
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      {match.recommendation}
                    </p>

                    {showDetails && match.evidence.length > 0 && (
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Evidence: {match.evidence.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Recommendations */}
      {showRecommendations && recommendations.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4">AI Recommendations</h4>
          
          <div className="space-y-3">
            {recommendations.map((recommendation, index) => (
              <div
                key={index}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-3"
              >
                <div className="flex items-start space-x-3">
                  {getRecommendationIcon(recommendation.type)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {recommendation.title}
                      </span>
                      <span className={`text-xs font-medium ${getImpactColor(recommendation.impact)}`}>
                        {recommendation.impact} impact
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      {recommendation.description}
                    </p>

                    {showDetails && recommendation.actionableSteps.length > 0 && (
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        <div className="font-medium mb-1">Actionable steps:</div>
                        <ul className="list-disc list-inside space-y-1">
                          {recommendation.actionableSteps.map((step, stepIndex) => (
                            <li key={stepIndex}>{step}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      {lastUpdated && (
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default MarketTrendPanel; 