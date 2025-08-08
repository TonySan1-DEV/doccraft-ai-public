/*
role: ui-engineer,
tier: Free+,
file: "src/components/ProUpgradeNudge.tsx",
allowedActions: ["display", "prompt"],
theme: "upgrade_nudge"
*/

import React, { useState } from 'react';
import { Crown, Sparkles, Zap, ArrowRight } from 'lucide-react';
import { logTelemetryEvent } from '../utils/telemetryLogger';

interface ProUpgradeNudgeProps {
  message: string;
  feature?: string;
  userTier: 'Free' | 'Pro' | 'Enterprise' | undefined;
  onUpgrade?: () => void;
  onDismiss?: () => void;
  variant?: 'inline' | 'modal' | 'banner';
  className?: string;
}

interface UpgradeFeature {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

const upgradeFeatures: UpgradeFeature[] = [
  {
    icon: Crown,
    title: 'Unlimited Exports',
    description: 'Export to PDF, Markdown, and more formats without limits',
  },
  {
    icon: Sparkles,
    title: 'Advanced AI Features',
    description: 'Access to premium AI models and advanced generation options',
  },
  {
    icon: Zap,
    title: 'Priority Processing',
    description: 'Faster pipeline processing and priority queue access',
  },
];

export const ProUpgradeNudge: React.FC<ProUpgradeNudgeProps> = ({
  message,
  feature,
  userTier,
  onUpgrade,
  onDismiss,
  variant = 'inline',
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [showFeatures, setShowFeatures] = useState(false);

  const handleUpgrade = async () => {
    // Log upgrade nudge interaction
    await logTelemetryEvent('upgrade_nudge_clicked', {
      userTier,
      feature,
      message,
      variant,
    });

    if (onUpgrade) {
      onUpgrade();
    } else {
      // Default upgrade action - could open billing modal or redirect
      window.open('/upgrade', '_blank');
    }
  };

  const handleDismiss = async () => {
    // Log dismiss event
    await logTelemetryEvent('upgrade_nudge_dismissed', {
      userTier,
      feature,
      message,
      variant,
    });

    setIsVisible(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  const handleLearnMore = () => {
    setShowFeatures(!showFeatures);
  };

  if (!isVisible) return null;

  const baseClasses =
    'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 transition-all duration-300';

  if (variant === 'modal') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Crown className="w-6 h-6 text-yellow-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Upgrade to Pro
              </h3>
            </div>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <p className="text-gray-600 dark:text-gray-300 mb-4">{message}</p>

          <div className="space-y-3 mb-6">
            {upgradeFeatures.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <feature.icon className="w-5 h-5 text-blue-500" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                    {feature.title}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleUpgrade}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <span>Upgrade Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={`${baseClasses} ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Crown className="w-5 h-5 text-yellow-500" />
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {message}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleUpgrade}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-xs font-medium transition-colors"
            >
              Upgrade
            </button>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xs transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Inline variant (default)
  return (
    <div className={`${baseClasses} ${className}`}>
      <div className="flex items-start space-x-3">
        <Crown className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
            {message}
          </p>

          {showFeatures && (
            <div className="mt-3 space-y-2">
              {upgradeFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 text-xs"
                >
                  <feature.icon className="w-4 h-4 text-blue-500" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {feature.title}: {feature.description}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center space-x-3 mt-3">
            <button
              onClick={handleUpgrade}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center space-x-1"
            >
              <span>Upgrade to Pro</span>
              <ArrowRight className="w-3 h-3" />
            </button>
            <button
              onClick={handleLearnMore}
              className="text-blue-500 hover:text-blue-600 text-xs transition-colors"
            >
              {showFeatures ? 'Show Less' : 'Learn More'}
            </button>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xs transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProUpgradeNudge;
