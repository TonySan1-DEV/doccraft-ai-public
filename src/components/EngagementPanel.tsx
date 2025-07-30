import React from 'react';
import { useEngagement } from '../hooks/useEngagement';
import { WriterProfile } from '../types/WriterProfile';
import { useAuth } from '../contexts/AuthContext';
import { Gauge, Star, AlertTriangle } from 'lucide-react';

interface EngagementPanelProps {
  content: string;
  genre?: string;
  profile?: WriterProfile;
  compact?: boolean;
  className?: string;
}

const getScoreColor = (score: number) => {
  if (score >= 0.7) return 'text-green-600 dark:text-green-400';
  if (score >= 0.4) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
};

const EngagementPanel: React.FC<EngagementPanelProps> = ({
  content,
  genre,
  profile,

  className = ''
}) => {
  const { user } = useAuth();
  const tier = user?.tier || profile?.tier || 'Free';
  const isPro = tier === 'Pro' || tier === 'Admin';
  const { analysis, loading, error } = useEngagement({ content, genre, profile });

  if (!isPro) {
    return (
      <div className={`bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-2 text-yellow-700 dark:text-yellow-300">
          <AlertTriangle className="w-5 h-5" />
          <span className="text-sm font-medium">
            Reader engagement prediction is a Pro feature. <a href="/settings#upgrade" className="underline text-blue-600 dark:text-blue-400">Upgrade to Pro</a> to unlock predictive analytics.
          </span>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
          <Gauge className="w-5 h-5 animate-spin" />
          <span className="text-sm">Analyzing engagement...</span>
        </div>
      </div>
    );
  }

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

  if (!analysis) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center space-x-3">
        <Gauge className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Reader Engagement</h3>
        <span className={`text-lg font-bold ${getScoreColor(analysis.engagementScore)}`}>{Math.round(analysis.engagementScore * 100)}%</span>
        <span className="text-xs text-gray-500 dark:text-gray-400">Confidence: {Math.round(analysis.confidence * 100)}%</span>
      </div>
      <div className="text-sm text-gray-700 dark:text-gray-300 font-medium">{analysis.summary}</div>
      <div className="flex flex-wrap gap-2">
        {analysis.tags.map((tag, i) => (
          <span key={i} className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600">
            {tag}
          </span>
        ))}
      </div>
      <div>
        <div className="font-semibold text-gray-900 dark:text-white mb-1">AI Recommendations</div>
        <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300">
          {analysis.recommendations.map((rec, i) => (
            <li key={i}>{rec}</li>
          ))}
        </ul>
      </div>
      {analysis.matchedTrends && analysis.matchedTrends.length > 0 && (
        <div className="flex items-center space-x-2 mt-2">
          <Star className="w-4 h-4 text-yellow-500" />
          <span className="text-xs text-yellow-700 dark:text-yellow-300">
            Market alignment: {analysis.matchedTrends.join(', ')}
          </span>
        </div>
      )}
    </div>
  );
};

export default EngagementPanel; 