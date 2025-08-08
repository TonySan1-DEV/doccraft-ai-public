import React, { useMemo } from 'react';
import { NarrativeSyncState } from '../shared/state/useNarrativeSyncContext';

export interface NarrativeScore {
  id: string;
  category: 'structure' | 'character' | 'theme' | 'pacing' | 'engagement';
  score: number; // 0-100
  weight: number; // 0-1, importance of this score
  details: string;
  recommendations: string[];
  lastUpdated: string;
}

export interface NarrativeScoreSummaryProps {
  narrativeSync?: NarrativeSyncState;
  scores?: NarrativeScore[];
  showRecommendations?: boolean;
  showTrends?: boolean;
  onScoreClick?: (scoreId: string) => void;
}

const NarrativeScoreSummary: React.FC<NarrativeScoreSummaryProps> = ({
  narrativeSync,
  scores = [],
  showRecommendations = true,
  showTrends = true,
  onScoreClick,
}) => {
  const overallScore = useMemo(() => {
    if (scores.length === 0) return 0;

    const totalWeight = scores.reduce((sum, score) => sum + score.weight, 0);
    const weightedSum = scores.reduce(
      (sum, score) => sum + score.score * score.weight,
      0
    );

    return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
  }, [scores]);

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number): string => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    if (score >= 40) return 'bg-orange-100';
    return 'bg-red-100';
  };

  const getCategoryIcon = (category: string): string => {
    switch (category) {
      case 'structure':
        return '📐';
      case 'character':
        return '👤';
      case 'theme':
        return '🎭';
      case 'pacing':
        return '⏱️';
      case 'engagement':
        return '🎯';
      default:
        return '📊';
    }
  };

  const getCategoryName = (category: string): string => {
    switch (category) {
      case 'structure':
        return 'Plot Structure';
      case 'character':
        return 'Character Development';
      case 'theme':
        return 'Thematic Coherence';
      case 'pacing':
        return 'Pacing & Flow';
      case 'engagement':
        return 'Reader Engagement';
      default:
        return category;
    }
  };

  const getOverallScoreLabel = (score: number): string => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    if (score >= 50) return 'Needs Work';
    return 'Poor';
  };

  const sortedScores = useMemo(() => {
    return [...scores].sort((a, b) => b.score - a.score);
  }, [scores]);

  const topRecommendations = useMemo(() => {
    const allRecommendations = scores
      .filter(score => score.score < 70)
      .flatMap(score => score.recommendations)
      .slice(0, 5);

    return [...new Set(allRecommendations)]; // Remove duplicates
  }, [scores]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Narrative Score Summary</h3>
        <div className="text-sm text-gray-500">
          Last updated:{' '}
          {scores.length > 0
            ? new Date(scores[0].lastUpdated).toLocaleDateString()
            : 'Never'}
        </div>
      </div>

      {/* Overall Score */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <div className="text-center">
          <div className="text-4xl font-bold mb-2">
            <span className={getScoreColor(overallScore)}>{overallScore}</span>
            <span className="text-gray-400 text-2xl">/100</span>
          </div>
          <div className={`text-lg font-medium ${getScoreColor(overallScore)}`}>
            {getOverallScoreLabel(overallScore)}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            Overall Narrative Quality
          </div>
        </div>
      </div>

      {/* Category Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedScores.map(score => (
          <div
            key={score.id}
            className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${getScoreBackground(
              score.score
            )}`}
            onClick={() => onScoreClick?.(score.id)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">
                  {getCategoryIcon(score.category)}
                </span>
                <span className="font-medium">
                  {getCategoryName(score.category)}
                </span>
              </div>
              <div
                className={`text-lg font-bold ${getScoreColor(score.score)}`}
              >
                {score.score}
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {score.details}
            </p>

            {showRecommendations && score.recommendations.length > 0 && (
              <div className="space-y-1">
                <div className="text-xs font-medium text-gray-500">
                  Recommendations:
                </div>
                <ul className="text-xs space-y-1">
                  {score.recommendations.slice(0, 2).map((rec, index) => (
                    <li key={index} className="text-gray-600">
                      • {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Top Recommendations */}
      {showRecommendations && topRecommendations.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-3">
            Priority Recommendations
          </h4>
          <ul className="space-y-2">
            {topRecommendations.map((recommendation, index) => (
              <li
                key={index}
                className="text-sm text-blue-800 flex items-start gap-2"
              >
                <span className="text-blue-600 mt-0.5">•</span>
                <span>{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Sync Status */}
      {narrativeSync && (
        <div className="bg-gray-50 p-4 rounded-lg border">
          <h4 className="font-medium text-gray-900 mb-2">
            Narrative Sync Status
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Current Scene:</span>
              <span className="ml-2 font-medium">
                {narrativeSync.currentSceneId || 'None selected'}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Active Framework:</span>
              <span className="ml-2 font-medium">
                {narrativeSync.activePlotFramework || 'None selected'}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Sync Status:</span>
              <span
                className={`ml-2 font-medium ${
                  narrativeSync.syncEnabled ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {narrativeSync.syncEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Last Sync:</span>
              <span className="ml-2 font-medium">
                {narrativeSync.lastSyncTimestamp
                  ? new Date(
                      narrativeSync.lastSyncTimestamp
                    ).toLocaleTimeString()
                  : 'Never'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {scores.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-lg font-medium mb-2">No Scores Available</p>
          <p className="text-sm">
            Run a narrative analysis to generate scores.
          </p>
        </div>
      )}
    </div>
  );
};

export default NarrativeScoreSummary;
