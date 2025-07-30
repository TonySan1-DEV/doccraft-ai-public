// MCP Context Block
/*
{
  file: "PromptPreviewPanel.tsx",
  role: "ui-component",
  allowedActions: ["display", "preview", "interact"],
  tier: "Pro",
  contentSensitivity: "low",
  theme: "usability"
}
*/

import React, { useState, useEffect, useMemo } from 'react';
import { buildContextualPromptHeader } from '../agent/ContextualPromptEngine';
import type { UserPrefs, DocumentContext, PromptHeader } from '../agent/ContextualPromptEngine';

// Icons
import { 
  Info, 
  ChevronDown, 
  ChevronUp,
  AlertTriangle,
  Code
} from 'lucide-react';

// Types
interface PromptPreviewPanelProps {
  doc: DocumentContext;
  className?: string;
  collapsible?: boolean;
  showPatternDetails?: boolean;
}

interface PreviewState {
  header: PromptHeader | null;
  isLoading: boolean;
  error: string | null;
  isFallback: boolean;
}

// Utility functions
function isFallbackPattern(_genre: string, _arc: string, patternUsed: string): boolean {
  // Check if we're using a fallback pattern
  const defaultPatterns = [
    'Introduce [CHARACTER] and establish the central conflict',
    'Create a challenge that [CHARACTER] must overcome',
    'Force [CHARACTER] to make a difficult choice',
    'Show [CHARACTER] dealing with the consequences of their choice'
  ];
  
  return defaultPatterns.some(defaultPattern => 
    patternUsed.includes(defaultPattern)
  );
}

function getFallbackReason(genre: string, arc: string): string {
  const reasons = [];
  
  // Check if genre is unknown
  const knownGenres = ['Romance', 'Sci-Fi', 'Mystery', 'Fantasy', 'Thriller', 'Horror', 'Comedy', 'Historical'];
  if (!knownGenres.includes(genre)) {
    reasons.push(`Unknown genre: "${genre}"`);
  }
  
  // Check if arc is unknown
  const knownArcs = ['setup', 'rising', 'climax', 'resolution'];
  if (!knownArcs.includes(arc)) {
    reasons.push(`Unknown arc: "${arc}"`);
  }
  
  return reasons.join(', ');
}

// Main component
export const PromptPreviewPanel: React.FC<PromptPreviewPanelProps> = ({
  doc,
  className = '',
  collapsible = true,
  showPatternDetails = true
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [previewState, setPreviewState] = useState<PreviewState>({
    header: null,
    isLoading: true,
    error: null,
    isFallback: false
  });

  // Mock user preferences - in real app, get from context
  const mockPrefs: UserPrefs = {
    tone: 'friendly',
    language: 'en',
    genre: 'Romance'
  };

  // Generate preview header
  const generatePreview = useMemo(() => {
    try {
      setPreviewState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const header = buildContextualPromptHeader(mockPrefs, doc);
      const isFallback = isFallbackPattern(mockPrefs.genre, doc.arc, header.patternUsed || '');
      
      setPreviewState({
        header,
        isLoading: false,
        error: null,
        isFallback
      });
    } catch (error) {
      setPreviewState({
        header: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to generate preview',
        isFallback: false
      });
    }
  }, [doc.scene, doc.arc, doc.characterName, mockPrefs.tone, mockPrefs.language, mockPrefs.genre]);

  // Auto-refresh on context changes
  useEffect(() => {
    generatePreview;
  }, [generatePreview]);

  // Handle collapse/expand
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Render fallback warning
  const renderFallbackWarning = () => {
    if (!previewState.isFallback || !previewState.header) return null;

    const reason = getFallbackReason(mockPrefs.genre, doc.arc);

    return (
      <div 
        className="flex items-center gap-2 p-3 mb-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
        role="alert"
        aria-live="polite"
      >
        <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            Using default fallback pattern
          </p>
          <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
            {reason}
          </p>
        </div>
      </div>
    );
  };

  // Render header preview
  const renderHeaderPreview = () => {
    if (previewState.isLoading) {
      return (
        <div className="flex items-center justify-center p-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
            Generating preview...
          </span>
        </div>
      );
    }

    if (previewState.error) {
      return (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">
            Error: {previewState.error}
          </p>
        </div>
      );
    }

    if (!previewState.header) {
      return (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            No preview available
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Header Preview */}
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Code className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              AI Prompt Header Preview
            </span>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <pre className="text-sm font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">
              {previewState.header.header}
            </pre>
          </div>
        </div>

        {/* Pattern Details */}
        {showPatternDetails && previewState.header.patternUsed && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-500 dark:text-blue-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Pattern Details
              </span>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <span className="font-medium">Selected Pattern:</span>
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1 font-mono">
                "{previewState.header.patternUsed}"
              </p>
            </div>
          </div>
        )}

        {/* Context Summary */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-green-500 dark:text-green-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Context Summary
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Tone:</span>
              <span className="ml-2 font-medium text-gray-700 dark:text-gray-300">
                {previewState.header.tone}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Language:</span>
              <span className="ml-2 font-medium text-gray-700 dark:text-gray-300">
                {previewState.header.language}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Genre:</span>
              <span className="ml-2 font-medium text-gray-700 dark:text-gray-300">
                {previewState.header.genre}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Arc:</span>
              <span className="ml-2 font-medium text-gray-700 dark:text-gray-300">
                {doc.arc}
              </span>
            </div>
            {doc.characterName && (
              <div className="col-span-2">
                <span className="text-gray-500 dark:text-gray-400">Character:</span>
                <span className="ml-2 font-medium text-gray-700 dark:text-gray-300">
                  {doc.characterName}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Code className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Prompt Preview
          </h3>
        </div>
        
        {collapsible && (
          <button
            onClick={toggleCollapse}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label={isCollapsed ? 'Expand preview' : 'Collapse preview'}
            aria-expanded={!isCollapsed}
          >
            {isCollapsed ? (
              <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            ) : (
              <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            )}
          </button>
        )}
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="p-4 space-y-4">
          {renderFallbackWarning()}
          {renderHeaderPreview()}
        </div>
      )}
    </div>
  );
};

// Hook for easy integration with contexts
export const usePromptPreview = (doc: DocumentContext) => {
  const [prefs, setPrefs] = useState<UserPrefs>({
    tone: 'friendly',
    language: 'en',
    genre: 'Romance'
  });

  const header = useMemo(() => {
    try {
      return buildContextualPromptHeader(prefs, doc);
    } catch (error) {
      return null;
    }
  }, [prefs, doc]);

  return {
    header,
    prefs,
    setPrefs,
    isFallback: header ? isFallbackPattern(prefs.genre, doc.arc, header.patternUsed || '') : false
  };
};

// Export types
export type { PromptPreviewPanelProps }; 