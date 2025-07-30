// MCP Context Block
/*
{
  file: "PromptPreviewPane.tsx",
  role: "frontend-developer",
  allowedActions: ["preferences", "ui", "accessibility"],
  tier: "Pro",
  contentSensitivity: "low",
  theme: "prompt_preview"
}
*/

import { useState, useCallback, useEffect } from 'react';
import { useAgentPreferences } from '../contexts/AgentPreferencesContext';
import { PromptPatternLibrary } from '../agent/PromptPatternLibrary';
import { getDiagnostics } from '../agent/ContextualPromptEngine';
import type { DocumentContext } from '../agent/ContextualPromptEngine';

interface PromptPreviewPaneProps {
  className?: string;
  documentContext?: DocumentContext;
  showFallbackDiagnostics?: boolean;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

interface PromptPreviewState {
  currentPrompt: string;
  patternUsed: string;
  fallbackWarnings: Array<{
    genre: string;
    arc: string;
    usedFallback: string;
    timestamp: number;
  }>;
  isGenerating: boolean;
  lastGenerated: Date | null;
}

export function PromptPreviewPane({
  className = '',
  documentContext,
  showFallbackDiagnostics = true,
  collapsible = true,
  defaultCollapsed = false
}: PromptPreviewPaneProps) {
  const { preferences } = useAgentPreferences();
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [previewState, setPreviewState] = useState<PromptPreviewState>({
    currentPrompt: '',
    patternUsed: '',
    fallbackWarnings: [],
    isGenerating: false,
    lastGenerated: null,
  });

  // Default document context if not provided
  const defaultContext: DocumentContext = {
    scene: "Current writing session",
    arc: "setup",
    characterName: "Main Character"
  };

  const context = documentContext || defaultContext;

  // Generate prompt preview
  const generatePromptPreview = useCallback(async () => {
    setPreviewState(prev => ({ ...prev, isGenerating: true }));

    try {
      // Clear previous fallback warnings
      const diagnostics = getDiagnostics();
      const recentWarnings = diagnostics.filter(
        warning => Date.now() - warning.timestamp < 5000 // Last 5 seconds
      );

      // Generate prompt using current preferences
      const promptTemplate = PromptPatternLibrary.getPromptFor(
        preferences.genre || 'general',
        context.arc,
        {
          tone: preferences.tone,
          memory: preferences.memory,
          copilot: preferences.copilot,
          language: preferences.language,
        }
      );

      // Check if fallback was used
      const hasFallback = recentWarnings.some(
        warning => warning.genre === preferences.genre && warning.arc === context.arc
      );

      setPreviewState({
        currentPrompt: promptTemplate,
        patternUsed: hasFallback ? 'Fallback Pattern' : 'Primary Pattern',
        fallbackWarnings: recentWarnings,
        isGenerating: false,
        lastGenerated: new Date(),
      });
    } catch (error) {
      console.error('Failed to generate prompt preview:', error);
      setPreviewState(prev => ({
        ...prev,
        currentPrompt: 'Error generating prompt preview',
        patternUsed: 'Error',
        isGenerating: false,
        lastGenerated: new Date(),
      }));
    }
  }, [preferences, context]);

  // Auto-generate on preference changes
  useEffect(() => {
    if (!isCollapsed) {
      generatePromptPreview();
    }
  }, [preferences, context, isCollapsed, generatePromptPreview]);

  // Handle manual refresh
  const handleRefresh = useCallback(() => {
    generatePromptPreview();
  }, [generatePromptPreview]);

  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  // Get fallback warning message
  const getFallbackMessage = (warning: typeof previewState.fallbackWarnings[0]) => {
    return `No pattern match for genre "${warning.genre}" + arc "${warning.arc}". Using fallback: [${warning.usedFallback}]`;
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Prompt Preview
          </h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            disabled={previewState.isGenerating}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
            title="Refresh preview"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          
          {collapsible && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              title={isCollapsed ? 'Expand preview' : 'Collapse preview'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isCollapsed ? "M19 9l-7 7-7-7" : "M5 15l7-7 7 7"} />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="p-4 space-y-4">
          {/* Generation Status */}
          {previewState.isGenerating && (
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Generating preview...</span>
            </div>
          )}

          {/* Pattern Info */}
          {previewState.patternUsed && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Pattern Used:</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                previewState.patternUsed === 'Fallback Pattern'
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200'
                  : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
              }`}>
                {previewState.patternUsed}
              </span>
            </div>
          )}

          {/* Last Generated */}
          {previewState.lastGenerated && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Last updated: {previewState.lastGenerated.toLocaleTimeString()}
            </div>
          )}

          {/* Fallback Diagnostics */}
          {showFallbackDiagnostics && previewState.fallbackWarnings.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Fallback Diagnostics
              </h4>
              <div className="space-y-2">
                {previewState.fallbackWarnings.map((warning, index) => (
                  <div
                    key={index}
                    className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md"
                  >
                    <div className="flex items-start space-x-2">
                      <svg className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <div className="text-sm">
                        <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                          {getFallbackMessage(warning)}
                        </p>
                        <p className="text-yellow-700 dark:text-yellow-300 text-xs mt-1">
                          {formatTimestamp(warning.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prompt Preview */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              Generated Prompt Template
            </h4>
            <div className="relative">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="p-4 max-h-96 overflow-y-auto">
                  <pre className="text-sm font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">
                    {previewState.currentPrompt || 'No prompt generated yet...'}
                  </pre>
                </div>
              </div>
              
              {/* Copy Button */}
              {previewState.currentPrompt && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(previewState.currentPrompt);
                  }}
                  className="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  title="Copy to clipboard"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Current Preferences Summary */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              Current Configuration
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Genre:</span>
                <span className="font-medium">{preferences.genre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Tone:</span>
                <span className="font-medium">{preferences.tone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Arc:</span>
                <span className="font-medium">{context.arc}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Memory:</span>
                <span className="font-medium">{preferences.memory ? 'Enabled' : 'Disabled'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Copilot:</span>
                <span className="font-medium">{preferences.copilot ? 'Enabled' : 'Disabled'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Language:</span>
                <span className="font-medium">{preferences.language}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 