// MCP Context Block
/*
{
  file: "FeedbackAnalytics.tsx",
  role: "frontend-developer",
  allowedActions: ["ui", "analytics", "data"],
  tier: "Pro",
  contentSensitivity: "low",
  theme: "feedback_analytics"
}
*/

import { useState, useEffect } from "react";
import {
  feedbackService,
  FeedbackStats,
  PatternAnalytics,
} from "../services/feedbackService";

interface FeedbackAnalyticsProps {
  className?: string;
  showPatternAnalytics?: boolean;
  showUserStats?: boolean;
  timeRange?: "7 days" | "30 days" | "90 days";
}

export function FeedbackAnalytics({
  className = "",
  showPatternAnalytics = true,
  showUserStats = true,
  timeRange = "30 days",
}: FeedbackAnalyticsProps) {
  const [feedbackStats, setFeedbackStats] = useState<FeedbackStats[]>([]);
  const [patternAnalytics, setPatternAnalytics] = useState<PatternAnalytics[]>(
    []
  );
  const [userRecentFeedback, setUserRecentFeedback] = useState<
    Array<{
      id: string;
      user_id: string;
      feedback_type: string;
      rating: number;
      comment?: string;
      created_at: string;
    }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [stats, analytics, recent] = await Promise.all([
        feedbackService.getFeedbackStats(undefined, undefined, timeRange),
        showPatternAnalytics
          ? feedbackService.getPatternAnalytics(timeRange)
          : Promise.resolve([]),
        showUserStats
          ? feedbackService.getUserRecentFeedback(5)
          : Promise.resolve([]),
      ]);

      setFeedbackStats(stats);
      setPatternAnalytics(analytics);
      // Convert FeedbackEvent to expected format
      const convertedRecent = recent.map(feedback => ({
        id: feedback.id,
        user_id: feedback.user_id,
        feedback_type: feedback.feedback_type,
        rating: feedback.feedback_type === 'positive' ? 5 : 1,
        comment: feedback.source_prompt,
        created_at: feedback.timestamp,
      }));
      setUserRecentFeedback(convertedRecent);
    } catch (err) {
      console.error("Error loading feedback analytics:", err);
      setError("Failed to load analytics data");
    } finally {
      setIsLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return "📈";
      case "declining":
        return "📉";
      case "stable":
        return "➡️";
      default:
        return "❓";
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence < 5) return "text-green-600";
    if (confidence < 10) return "text-yellow-600";
    return "text-red-600";
  };

  if (isLoading) {
    return (
      <div className={`feedback-analytics ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`feedback-analytics ${className}`}>
        <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className={`feedback-analytics ${className}`}>
      {/* Pattern Performance */}
      {showPatternAnalytics && patternAnalytics.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Pattern Performance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {patternAnalytics.map((pattern) => (
              <div
                key={pattern.pattern_used}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {pattern.pattern_used}
                  </h4>
                  <span className="text-lg">
                    {getTrendIcon(pattern.trend_direction)}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Usage:
                    </span>
                    <span className="font-medium">{pattern.total_usage}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Positive Rate:
                    </span>
                    <span className="font-medium">
                      {pattern.positive_rate.toFixed(1)}%
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Confidence:
                    </span>
                    <span
                      className={`font-medium ${getConfidenceColor(
                        pattern.confidence_interval
                      )}`}
                    >
                      ±{pattern.confidence_interval.toFixed(1)}%
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Trend:
                    </span>
                    <span className="font-medium capitalize">
                      {pattern.trend_direction}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feedback Statistics */}
      {feedbackStats.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Feedback Statistics
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Pattern
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Positive
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Negative
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Rating
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {feedbackStats.map((stat) => (
                  <tr key={stat.pattern_used}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {stat.pattern_used}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {stat.total_feedback}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">
                      {stat.positive_feedback}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400">
                      {stat.negative_feedback}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {stat.positive_rate.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {stat.avg_rating.toFixed(1)}/5
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent User Feedback */}
      {showUserStats && userRecentFeedback.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Your Recent Feedback
          </h3>
          <div className="space-y-3">
            {userRecentFeedback.map((feedback) => (
              <div
                key={feedback.id}
                className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <span
                    className={`text-lg ${
                      feedback.feedback_type === "positive"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {feedback.feedback_type === "positive" ? "👍" : "👎"}
                  </span>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {feedback.feedback_type}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {feedback.comment?.substring(0, 50)}... •{" "}
                      {new Date(feedback.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(feedback.created_at).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {feedbackStats.length === 0 &&
        patternAnalytics.length === 0 &&
        userRecentFeedback.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 dark:text-gray-500 text-lg mb-2">
              📊
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Feedback Data Yet
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Start providing feedback on AI suggestions to see analytics here.
            </p>
          </div>
        )}

      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={loadAnalytics}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isLoading ? "Loading..." : "Refresh Analytics"}
        </button>
      </div>
    </div>
  );
}

// Hook for easy analytics integration
export function useFeedbackAnalytics() {
  const [stats, setStats] = useState<FeedbackStats[]>([]);
  const [analytics, setAnalytics] = useState<PatternAnalytics[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadStats = async (timeRange: string = "30 days") => {
    setIsLoading(true);
    try {
      const [feedbackStats, patternAnalytics] = await Promise.all([
        feedbackService.getFeedbackStats(undefined, undefined, timeRange),
        feedbackService.getPatternAnalytics(timeRange),
      ]);
      setStats(feedbackStats);
      setAnalytics(patternAnalytics);
    } catch (error) {
      console.error("Error loading feedback analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    stats,
    analytics,
    isLoading,
    loadStats,
  };
}
