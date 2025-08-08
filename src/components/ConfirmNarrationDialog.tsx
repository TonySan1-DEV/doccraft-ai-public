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

interface NarrationSummary {
  genre?: string;
  voice?: string;
  preview?: string;
}

interface ConfirmNarrationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  summary: NarrationSummary;
}

/**
 * Accessible confirmation dialog for narration settings
 * Provides a clear summary of genre, voice, and optional preview
 */
export const ConfirmNarrationDialog: React.FC<ConfirmNarrationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  summary,
}) => {
  // Don't render if not open
  if (!open) return null;

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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        {/* Header */}
        <div className="mb-4">
          <h2
            id="narration-dialog-title"
            className="text-lg font-semibold text-gray-900 dark:text-white"
          >
            Confirm Narration Settings
          </h2>
          <p
            id="narration-dialog-description"
            className="text-sm text-gray-600 dark:text-gray-400 mt-1"
          >
            Review your narration configuration before proceeding
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
            </div>
          </div>

          {/* Optional Preview */}
          {summary.preview && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                Script Preview
              </h4>
              <p className="text-sm text-blue-800 dark:text-blue-200 italic">
                "{summary.preview}"
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmNarrationDialog;
