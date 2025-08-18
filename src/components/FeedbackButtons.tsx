// MCP Context Block
/*
{
  file: "FeedbackButtons.tsx",
  role: "frontend-developer",
  allowedActions: ["ui", "feedback", "ux"],
  tier: "Pro",
  contentSensitivity: "low",
  theme: "feedback_ui"
}
*/

import React, { useState, useCallback, useEffect } from 'react';
import {
  feedbackService,
  FeedbackSubmissionOptions,
} from '../services/feedbackService';
import { useAgentPreferences } from '../contexts/AgentPreferencesContext';

interface FeedbackButtonsProps {
  sourcePrompt: string;
  patternUsed: string;
  contentType?:
    | 'suggestion'
    | 'rewrite'
    | 'preview'
    | 'completion'
    | 'correction';
  contextData?: Record<string, unknown>;
  sessionId?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  onFeedbackSubmitted?: (
    type: 'positive' | 'negative',
    success: boolean
  ) => void;
}

export function FeedbackButtons({
  sourcePrompt,
  patternUsed,
  contentType = 'suggestion',
  contextData = {},
  sessionId,
  className = '',
  size = 'md',
  showLabels = false,
  onFeedbackSubmitted,
}: FeedbackButtonsProps) {
  const { preferences } = useAgentPreferences();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedFeedback, setSubmittedFeedback] = useState<
    'positive' | 'negative' | null
  >(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Generate prompt hash for deduplication
  const promptHash: string = React.useMemo(() => {
    let hash = 0;
    for (let i = 0; i < sourcePrompt.length; i++) {
      const char = sourcePrompt.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }, [sourcePrompt]);

  // Check if feedback was already submitted
  useEffect(() => {
    const checkFeedbackStatus = async () => {
      const hasPositive = await feedbackService.hasSubmittedFeedback(
        promptHash,
        'positive'
      );
      const hasNegative = await feedbackService.hasSubmittedFeedback(
        promptHash,
        'negative'
      );

      if (hasPositive) setSubmittedFeedback('positive');
      else if (hasNegative) setSubmittedFeedback('negative');
    };

    checkFeedbackStatus();
  }, [promptHash]);

  // Handle feedback submission
  const handleFeedback = useCallback(
    async (feedbackType: 'positive' | 'negative') => {
      if (isSubmitting || submittedFeedback) return;

      setIsSubmitting(true);

      try {
        const options: FeedbackSubmissionOptions = {
          sessionId,
          contentType,
          contextData: {
            ...contextData,
            userPreferences: {
              tone: preferences.tone,
              genre: preferences.genre || 'general',
              copilotEnabled: preferences.copilotEnabled,
              memoryEnabled: preferences.memoryEnabled,
              defaultCommandView: preferences.defaultCommandView,
            },
          },
          promptHash: promptHash,
        };

        const result = await feedbackService.submitFeedback(
          feedbackType,
          sourcePrompt,
          patternUsed,
          options
        );

        if (result.success) {
          setSubmittedFeedback(feedbackType);
          setToastMessage('Feedback received – thank you!');
          setToastType('success');
          setShowToast(true);

          // Hide toast after 3 seconds
          setTimeout(() => setShowToast(false), 3000);

          onFeedbackSubmitted?.(feedbackType, true);
        } else {
          setToastMessage(result.error || 'Failed to submit feedback');
          setToastType('error');
          setShowToast(true);

          // Hide error toast after 5 seconds
          setTimeout(() => setShowToast(false), 5000);

          onFeedbackSubmitted?.(feedbackType, false);
        }
      } catch (error) {
        console.error('Error submitting feedback:', error);
        setToastMessage('Failed to submit feedback');
        setToastType('error');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 5000);

        onFeedbackSubmitted?.(feedbackType, false);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      sourcePrompt,
      patternUsed,
      contentType,
      contextData,
      sessionId,
      promptHash,
      preferences,
      submittedFeedback,
      isSubmitting,
      onFeedbackSubmitted,
    ]
  );

  // Size classes
  const sizeClasses = {
    sm: 'w-6 h-6 text-sm',
    md: 'w-8 h-8 text-base',
    lg: 'w-10 h-10 text-lg',
  };

  // Button base classes
  const buttonBaseClasses = `
    inline-flex items-center justify-center rounded-full border-2 transition-all duration-200 
    focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed
    ${sizeClasses[size]}
  `;

  // Positive button classes
  const positiveButtonClasses = `
    ${buttonBaseClasses}
    ${
      submittedFeedback === 'positive'
        ? 'bg-green-100 border-green-500 text-green-700 dark:bg-green-900 dark:border-green-400 dark:text-green-300'
        : 'bg-white border-gray-300 text-gray-400 hover:border-green-500 hover:text-green-600 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:border-green-400 dark:hover:text-green-300'
    }
    ${submittedFeedback === 'negative' ? 'opacity-50' : ''}
  `;

  // Negative button classes
  const negativeButtonClasses = `
    ${buttonBaseClasses}
    ${
      submittedFeedback === 'negative'
        ? 'bg-red-100 border-red-500 text-red-700 dark:bg-red-900 dark:border-red-400 dark:text-red-300'
        : 'bg-white border-gray-300 text-gray-400 hover:border-red-500 hover:text-red-600 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:border-red-400 dark:hover:text-red-300'
    }
    ${submittedFeedback === 'positive' ? 'opacity-50' : ''}
  `;

  return (
    <div className={`feedback-buttons ${className}`}>
      {/* Feedback Buttons */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => handleFeedback('positive')}
          disabled={isSubmitting || submittedFeedback === 'negative'}
          className={positiveButtonClasses}
          title="Was this suggestion helpful? 👍"
          aria-label="Mark as helpful"
        >
          👍
        </button>

        <button
          onClick={() => handleFeedback('negative')}
          disabled={isSubmitting || submittedFeedback === 'positive'}
          className={negativeButtonClasses}
          title="Was this suggestion helpful? 👎"
          aria-label="Mark as not helpful"
        >
          👎
        </button>

        {showLabels && (
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
            Was this suggestion helpful?
          </span>
        )}
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 z-50">
          <div
            className={`
            px-4 py-2 rounded-md shadow-lg text-sm font-medium
            ${
              toastType === 'success'
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border border-green-200 dark:border-green-700'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border border-red-200 dark:border-red-700'
            }
          `}
          >
            <div className="flex items-center space-x-2">
              <span
                className={
                  toastType === 'success' ? 'text-green-600' : 'text-red-600'
                }
              >
                {toastType === 'success' ? '✓' : '✗'}
              </span>
              <span>{toastMessage}</span>
            </div>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {isSubmitting && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="px-4 py-2 rounded-md shadow-lg bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-700">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm font-medium">
                Submitting feedback...
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Feedback wrapper component for different content types
interface FeedbackWrapperProps {
  children: React.ReactNode;
  sourcePrompt: string;
  patternUsed: string;
  contentType?:
    | 'suggestion'
    | 'rewrite'
    | 'preview'
    | 'completion'
    | 'correction';
  contextData?: Record<string, unknown>;
  sessionId?: string;
  showFeedback?: boolean;
  feedbackPosition?: 'top' | 'bottom' | 'inline';
  className?: string;
}

export function FeedbackWrapper({
  children,
  sourcePrompt,
  patternUsed,
  contentType = 'suggestion',
  contextData = {},
  sessionId,
  showFeedback = true,
  feedbackPosition = 'bottom',
  className = '',
}: FeedbackWrapperProps) {
  const handleFeedbackSubmitted = useCallback(
    (_type: 'positive' | 'negative', success: boolean) => {
      if (success) {
        // Feedback was submitted successfully
      }
    },
    []
  );

  if (!showFeedback) {
    return <div className={className}>{children}</div>;
  }

  const feedbackButtons = (
    <FeedbackButtons
      sourcePrompt={sourcePrompt}
      patternUsed={patternUsed}
      contentType={contentType}
      contextData={contextData}
      sessionId={sessionId}
      onFeedbackSubmitted={handleFeedbackSubmitted}
      className="mt-2"
    />
  );

  return (
    <div className={`feedback-wrapper ${className}`}>
      {feedbackPosition === 'top' && feedbackButtons}

      <div className="feedback-content">{children}</div>

      {feedbackPosition === 'bottom' && feedbackButtons}

      {feedbackPosition === 'inline' && (
        <div className="flex items-center justify-between mt-2">
          <div className="flex-1">{children}</div>
          {feedbackButtons}
        </div>
      )}
    </div>
  );
}

// Hook for easy feedback integration
export function useFeedback() {
  const submitFeedback = useCallback(
    async (
      feedbackType: 'positive' | 'negative',
      sourcePrompt: string,
      patternUsed: string,
      options: FeedbackSubmissionOptions = {}
    ) => {
      return await feedbackService.submitFeedback(
        feedbackType,
        sourcePrompt,
        patternUsed,
        options
      );
    },
    []
  );

  const hasSubmittedFeedback = useCallback(
    (promptHash: string, feedbackType: 'positive' | 'negative') => {
      return feedbackService.hasSubmittedFeedback(promptHash, feedbackType);
    },
    []
  );

  const clearFeedbackCache = useCallback(() => {
    feedbackService.clearFeedbackCache();
  }, []);

  return {
    submitFeedback,
    hasSubmittedFeedback,
    clearFeedbackCache,
  };
}
