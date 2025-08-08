/**
 * @fileoverview Narration Confirmation Dialog
 * @module src/components/ConfirmNarrationDialog
 *
 * MCP Context Block:
 * - role: "UI Component"
 * - tier: "Free"
 * - file: "src/components/ConfirmNarrationDialog.tsx"
 * - allowedActions: ["display", "interact", "validate"]
 * - theme: "confirmation_dialog"
 */

import React from 'react';

/**
 * Summary of narration settings to be confirmed
 */
interface NarrationSummary {
  /** Selected genre for narration */
  genre?: string;
  /** Selected voice for narration */
  voice?: string;
  /** Optional preview text */
  preview?: string;
  /** Narration duration estimate */
  duration?: string;
  /** Quality level of narration */
  quality?: 'standard' | 'premium' | 'ultra';
}

/**
 * Props for the ConfirmNarrationDialog component
 */
interface ConfirmNarrationDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when dialog is closed */
  onClose: () => void;
  /** Callback when narration is confirmed */
  onConfirm: () => void;
  /** Narration settings summary */
  summary: NarrationSummary;
  /** Dialog size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show a loading state */
  loading?: boolean;
  /** Custom title for the dialog */
  title?: string;
  /** Custom description for the dialog */
  description?: string;
}

/**
 * Accessible confirmation dialog for narration settings
 *
 * @remarks
 * - Provides a clear summary of genre, voice, and optional preview
 * - Supports keyboard navigation (Escape to close)
 * - Includes proper ARIA attributes for accessibility
 * - Responsive design with dark mode support
 * - Prevents event bubbling on backdrop clicks
 *
 * @example
 * ```tsx
 * <ConfirmNarrationDialog
 *   open={showDialog}
 *   onClose={() => setShowDialog(false)}
 *   onConfirm={handleConfirm}
 *   summary={{ genre: 'Fiction', voice: 'Emma' }}
 * />
 * ```
 */
export const ConfirmNarrationDialog: React.FC<ConfirmNarrationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  summary,
  size = 'md',
  loading = false,
  title = 'Confirm Narration Settings',
  description = 'Review your narration configuration before proceeding',
}) => {
  // Don't render if not open
  if (!open) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="narration-dialog-title"
      aria-describedby="narration-dialog-description"
    >
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl ${sizeClasses[size]} w-full mx-4 p-6`}
      >
        {/* Header */}
        <div className="mb-4">
          <h2
            id="narration-dialog-title"
            className="text-lg font-semibold text-gray-900 dark:text-white"
          >
            {title}
          </h2>
          <p
            id="narration-dialog-description"
            className="text-sm text-gray-600 dark:text-gray-400 mt-1"
          >
            {description}
          </p>
        </div>

        {/* Summary Content */}
        <div className="mb-6 space-y-3">
          {/* Genre and Voice Summary */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Narration Summary
            </h3>
            <div className="space-y-2 text-sm">
              {summary.genre && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Genre:
                  </span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {summary.genre}
                  </span>
                </div>
              )}
              {summary.voice && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Voice:
                  </span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {summary.voice}
                  </span>
                </div>
              )}
              {summary.duration && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Duration:
                  </span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {summary.duration}
                  </span>
                </div>
              )}
              {summary.quality && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Quality:
                  </span>
                  <span className="text-gray-900 dark:text-white font-medium capitalize">
                    {summary.quality}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Optional Preview */}
          {summary.preview && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                Script Preview
              </h4>
              <p className="text-sm text-blue-800 dark:text-blue-200 italic">
                &ldquo;{summary.preview}&rdquo;
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmNarrationDialog;
