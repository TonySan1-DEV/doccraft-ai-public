// MCP Context Block
/*
{
  file: "AgentBehaviorConsole.tsx",
  role: "frontend-developer",
  allowedActions: ["preferences", "ui", "accessibility", "diagnostics"],
  tier: "Pro",
  contentSensitivity: "low",
  theme: "agent_behavior"
}
*/

import { useState, useCallback, useEffect } from 'react';
import { useAgentPreferences } from '../contexts/AgentPreferencesContext';
import { getDiagnostics } from '../agent/ContextualPromptEngine';
import { PromptPatternLibrary } from '../agent/PromptPatternLibrary';
import type { DocumentContext } from '../agent/ContextualPromptEngine';

interface BehaviorState {
  persona: {
    active: boolean;
    mode: 'copilot' | 'assistant';
    description: string;
  };
  memory: {
    enabled: boolean;
    status: 'active' | 'disabled' | 'error';
    description: string;
  };
  promptModifiers: {
    tone: {
      value: string;
      status: 'valid' | 'warning' | 'error';
      description: string;
    };
    genre: {
      value: string;
      status: 'valid' | 'warning' | 'error';
      description: string;
    };
    arc: {
      value: string;
      status: 'valid' | 'warning' | 'error';
      description: string;
    };
  };
  diagnostics: {
    hasFallbacks: boolean;
    fallbackCount: number;
    recentWarnings: Array<{
      genre: string;
      arc: string;
      usedFallback: string;
      timestamp: number;
    }>;
  };
  conflicts: {
    hasConflicts: boolean;
    invalidArcTemplate: boolean;
    customPatternWithFallback: boolean;
    descriptions: string[];
  };
  lastUpdated: Date;
}

interface AgentBehaviorConsoleProps {
  className?: string;
  documentContext?: DocumentContext;
  showCopyButton?: boolean;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  refreshInterval?: number; // in milliseconds
}

export function AgentBehaviorConsole({
  className = '',
  documentContext,
  showCopyButton = true,
  collapsible = true,
  defaultExpanded = true,
  refreshInterval = 5000 // 5 seconds
}: AgentBehaviorConsoleProps) {
  const { preferences } = useAgentPreferences();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [behaviorState, setBehaviorState] = useState<BehaviorState>({
    persona: { active: false, mode: 'assistant', description: '' },
    memory: { enabled: false, status: 'disabled', description: '' },
    promptModifiers: {
      tone: { value: '', status: 'valid', description: '' },
      genre: { value: '', status: 'valid', description: '' },
      arc: { value: '', status: 'valid', description: '' }
    },
    diagnostics: { hasFallbacks: false, fallbackCount: 0, recentWarnings: [] },
    conflicts: { hasConflicts: false, invalidArcTemplate: false, customPatternWithFallback: false, descriptions: [] },
    lastUpdated: new Date()
  });

  // Default document context
  const defaultContext: DocumentContext = {
    scene: "Current writing session",
    arc: "setup",
    characterName: "Main Character"
  };

  const context = documentContext || defaultContext;

  // Analyze behavior state
  const analyzeBehavior = useCallback(() => {
    const diagnostics = getDiagnostics();
    const recentWarnings = diagnostics.filter(
      warning => Date.now() - warning.timestamp < 30000 // Last 30 seconds
    );

    // Analyze persona
    const persona = {
      active: preferences.copilot,
      mode: preferences.copilot ? 'copilot' : 'assistant',
      description: preferences.copilot 
        ? 'AI will proactively suggest improvements and alternatives'
        : 'AI will only respond when explicitly asked'
    };

    // Analyze memory
    const memory = {
      enabled: preferences.memory,
      status: preferences.memory ? 'active' : 'disabled',
      description: preferences.memory
        ? 'Conversation context will be remembered across sessions'
        : 'Each interaction starts fresh without context memory'
    };

    // Analyze prompt modifiers
    const tone = {
      value: preferences.tone,
      status: 'valid' as const,
      description: `AI will use a ${preferences.tone} tone in responses`
    };

    const genre = {
      value: preferences.genre,
      status: 'valid' as const,
      description: `Optimized for ${preferences.genre} content`
    };

    const arc = {
      value: context.arc,
      status: 'valid' as const,
      description: `Current story arc: ${context.arc}`
    };

    // Check for conflicts
    const conflicts: BehaviorState['conflicts'] = {
      hasConflicts: false,
      invalidArcTemplate: false,
      customPatternWithFallback: false,
      descriptions: []
    };

    // Check if current genre/arc combination has a valid template
    try {
      const hasValidTemplate = PromptPatternLibrary.hasPatternFor(preferences.genre || '', context.arc || '');
      if (!hasValidTemplate) {
        conflicts.invalidArcTemplate = true;
        conflicts.hasConflicts = true;
        conflicts.descriptions.push(`No template found for ${preferences.genre || 'unknown'} + ${context.arc || 'unknown'}`);
      }
    } catch (error) {
      conflicts.invalidArcTemplate = true;
      conflicts.hasConflicts = true;
      conflicts.descriptions.push('Error checking template validity');
    }

    // Check if fallback is active but user has custom patterns
    if (recentWarnings.length > 0) {
      const hasCustomPatterns = false; // TODO: Implement custom pattern detection
      if (hasCustomPatterns) {
        conflicts.customPatternWithFallback = true;
        conflicts.hasConflicts = true;
        conflicts.descriptions.push('Custom patterns available but fallback was used');
      }
    }

    setBehaviorState({
      persona: {
        active: persona.active || false,
        mode: (persona.mode || 'assistant') as 'copilot' | 'assistant',
        description: persona.description || ''
      },
      memory: {
        enabled: memory.enabled || false,
        status: (memory.status || 'disabled') as 'active' | 'disabled' | 'error',
        description: memory.description || ''
      },
      promptModifiers: { 
        tone: {
          value: tone.value || '',
          status: tone.status || 'valid',
          description: tone.description || ''
        }, 
        genre: {
          value: genre.value || '',
          status: genre.status || 'valid',
          description: genre.description || ''
        }, 
        arc: {
          value: arc.value || '',
          status: arc.status || 'valid',
          description: arc.description || ''
        } 
      },
      diagnostics: {
        hasFallbacks: recentWarnings.length > 0,
        fallbackCount: recentWarnings.length,
        recentWarnings
      },
      conflicts,
      lastUpdated: new Date()
    });
  }, [preferences, context]);

  // Auto-refresh behavior analysis
  useEffect(() => {
    analyzeBehavior();
    
    const interval = setInterval(analyzeBehavior, refreshInterval);
    return () => clearInterval(interval);
  }, [analyzeBehavior, refreshInterval]);

  // Copy full prompt header
  const handleCopyPromptHeader = useCallback(() => {
    const header = `[Agent Config] Persona: ${behaviorState.persona.mode}, Memory: ${behaviorState.memory.status}, Tone: ${behaviorState.promptModifiers.tone.value}, Genre: ${behaviorState.promptModifiers.genre.value}, Arc: ${behaviorState.promptModifiers.arc.value}`;
    navigator.clipboard.writeText(header);
  }, [behaviorState]);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
      case 'active':
        return 'text-green-600 dark:text-green-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'error':
      case 'disabled':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
      case 'active':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
      case 'disabled':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Agent Behavior Console
          </h3>
          {behaviorState.conflicts.hasConflicts && (
            <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200 rounded-full">
              Conflicts
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {showCopyButton && (
            <button
              onClick={handleCopyPromptHeader}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              title="Copy prompt header"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          )}
          
          {collapsible && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              title={isExpanded ? 'Collapse console' : 'Expand console'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isExpanded ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Status Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Persona Status */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  AI Persona
                </h4>
                <div className={`flex items-center space-x-1 ${getStatusColor(behaviorState.persona.active ? 'active' : 'disabled')}`}>
                  {getStatusIcon(behaviorState.persona.active ? 'active' : 'disabled')}
                  <span className="text-xs font-medium capitalize">
                    {behaviorState.persona.mode}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {behaviorState.persona.description}
              </p>
            </div>

            {/* Memory Status */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Memory State
                </h4>
                <div className={`flex items-center space-x-1 ${getStatusColor(behaviorState.memory.status)}`}>
                  {getStatusIcon(behaviorState.memory.status)}
                  <span className="text-xs font-medium capitalize">
                    {behaviorState.memory.status}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {behaviorState.memory.description}
              </p>
            </div>
          </div>

          {/* Prompt Modifiers */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              Active Prompt Modifiers
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {Object.entries(behaviorState.promptModifiers).map(([key, modifier]) => (
                <div key={key} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 capitalize">
                      {key}
                    </span>
                    <div className={`flex items-center space-x-1 ${getStatusColor(modifier.status)}`}>
                      {getStatusIcon(modifier.status)}
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {modifier.value}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {modifier.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Diagnostics */}
          {behaviorState.diagnostics.hasFallbacks && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Fallback Diagnostics
              </h4>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <svg className="w-4 h-4 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    {behaviorState.diagnostics.fallbackCount} fallback(s) detected
                  </span>
                </div>
                <div className="space-y-1">
                  {behaviorState.diagnostics.recentWarnings.map((warning, index) => (
                    <div key={index} className="text-xs text-yellow-700 dark:text-yellow-300">
                      • No pattern for "{warning.genre}" + "{warning.arc}" → using [{warning.usedFallback}]
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Conflicts */}
          {behaviorState.conflicts.hasConflicts && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Configuration Conflicts
              </h4>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 10-2 0 1 1 0 012 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-red-800 dark:text-red-200">
                    Configuration Issues Detected
                  </span>
                </div>
                <div className="space-y-1">
                  {behaviorState.conflicts.descriptions.map((description, index) => (
                    <div key={index} className="text-xs text-red-700 dark:text-red-300">
                      • {description}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Last Updated */}
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Last updated: {behaviorState.lastUpdated.toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  );
} 