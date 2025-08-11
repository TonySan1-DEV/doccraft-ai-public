export const mcpContext = {
  file: 'modules/narrativeDashboard/NarrativeScoreSummary.tsx',
  role: 'developer',
  allowedActions: ['refactor', 'type-harden', 'test'],
  contentSensitivity: 'low',
  theme: 'doccraft-ai',
};

import React, { useMemo } from 'react';
import type { NarrativeSyncState } from '../shared/state/useNarrativeSyncContext';
import { clamp100, clamp01 } from '../emotionArc/utils/scaling';

export interface NarrativeScore {
  id: string;
  category: 'structure' | 'character' | 'theme' | 'pacing' | 'engagement';
  score: number; // 0-100, clamped and validated
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
  onScoreClick,
}) => {
  const overallScore = useMemo((): number => {
    if (!Array.isArray(scores) || scores.length === 0) return 0;

    const totalWeight = scores.reduce(
      (sum, score) => sum + clamp01(score.weight ?? 0),
      0
    );
    const weightedSum = scores.reduce(
      (sum, score) =>
        sum + clamp100(score.score ?? 0) * clamp01(score.weight ?? 0),
      0
    );

    return totalWeight > 0
      ? clamp100(Math.round(weightedSum / totalWeight))
      : 0;
  }, [scores]);

  const getScoreColor = (score: number): string => {
    const clampedScore = clamp100(score);
    if (clampedScore >= 80) return 'text-green-600';
    if (clampedScore >= 60) return 'text-yellow-600';
    if (clampedScore >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number): string => {
    const clampedScore = clamp100(score);
    if (clampedScore >= 80) return 'bg-green-100';
    if (clampedScore >= 60) return 'bg-yellow-100';
    if (clampedScore >= 40) return 'bg-orange-100';
    return 'bg-red-100';
  };

  const getCategoryIcon = (category: NarrativeScore['category']): string => {
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

  const getCategoryName = (category: NarrativeScore['category']): string => {
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
    const clampedScore = clamp100(score);
    if (clampedScore >= 90) return 'Excellent';
    if (clampedScore >= 80) return 'Very Good';
    if (clampedScore >= 70) return 'Good';
    if (clampedScore >= 60) return 'Fair';
    if (clampedScore >= 50) return 'Needs Work';
    return 'Poor';
  };

  const sortedScores = useMemo((): NarrativeScore[] => {
    if (!Array.isArray(scores)) return [];
    return [...scores].sort(
      (a, b) => clamp100(b.score ?? 0) - clamp100(a.score ?? 0)
    );
  }, [scores]);

  const topRecommendations = useMemo((): string[] => {
    if (!Array.isArray(scores)) return [];
    const allRecommendations = scores
      .filter(score => clamp100(score.score ?? 0) < 70)
      .flatMap(score =>
        Array.isArray(score.recommendations) ? score.recommendations : []
      )
      .slice(0, 5);

    return [...new Set(allRecommendations)]; // Remove duplicates
  }, [scores]);

  const lastUpdated = useMemo((): string => {
    if (!Array.isArray(scores) || scores.length === 0) return 'Never';
    const firstScore = scores[0];
    if (!firstScore?.lastUpdated) return 'Never';
    try {
      return new Date(firstScore.lastUpdated).toLocaleDateString();
    } catch {
      return 'Never';
    }
  }, [scores]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Narrative Score Summary</h3>
        <div className="text-sm text-gray-500">Last updated: {lastUpdated}</div>
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
              score.score ?? 0
            )}`}
            onClick={() => onScoreClick?.(score.id)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onScoreClick?.(score.id);
              }
            }}
            tabIndex={0}
            role="button"
            aria-label={`Score for ${getCategoryName(score.category)}: ${clamp100(score.score ?? 0)}%`}
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
                className={`text-lg font-bold ${getScoreColor(score.score ?? 0)}`}
              >
                {clamp100(score.score ?? 0)}
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {score.details ?? ''}
            </p>

            {showRecommendations &&
              Array.isArray(score.recommendations) &&
              score.recommendations.length > 0 && (
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
                {narrativeSync.currentSceneId ?? 'None selected'}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Active Framework:</span>
              <span className="ml-2 font-medium">
                {narrativeSync.activePlotFramework ?? 'None selected'}
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
      {(!Array.isArray(scores) || scores.length === 0) && (
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
