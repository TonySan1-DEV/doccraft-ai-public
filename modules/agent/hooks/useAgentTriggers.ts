// MCP Context Block
/*
role: ai-engineer,
tier: Pro,
file: "modules/agent/hooks/useAgentTriggers.ts",
allowedActions: ["listen", "trigger", "sync"],
theme: "agent_triggers"
*/

import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useDocCraftAgent } from '../contexts/DocCraftAgentProvider';
import { docToVideoRouter } from '../services/docToVideoRouter';

interface UserAction {
  type: string;
  module: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface TriggerContext {
  userRole: string;
  tier: string;
  isAgentVisible: boolean;
  recentActions: UserAction[];
  currentModule: string;
  lastProactiveTip?: {
    type: string;
    timestamp: number;
  };
}

interface ProactiveTrigger {
  id: string;
  condition: (context: TriggerContext) => boolean;
  action: (context: TriggerContext) => void;
  cooldown: number; // milliseconds
  priority: 'low' | 'medium' | 'high';
  mcpRequired?: {
    roles?: string[];
    tiers?: string[];
  };
}

// Track user actions in memory
const userActionHistory: UserAction[] = [];
const MAX_ACTIONS = 10;

// Track last proactive tip to prevent spam
let lastProactiveTip: { type: string; timestamp: number } | null = null;

// Add action to history
export function trackUserAction(action: Omit<UserAction, 'timestamp'>) {
  const fullAction: UserAction = {
    ...action,
    timestamp: Date.now(),
  };

  userActionHistory.unshift(fullAction);
  if (userActionHistory.length > MAX_ACTIONS) {
    userActionHistory.pop();
  }
}

// Get recent actions for a specific module
export function getRecentActions(
  module?: string,
  timeWindow = 5 * 60 * 1000
): UserAction[] {
  const cutoff = Date.now() - timeWindow;
  return userActionHistory
    .filter(action => action.timestamp > cutoff)
    .filter(action => !module || action.module === module);
}

// Check if user has been inactive
export function isUserInactive(timeout = 2 * 60 * 1000): boolean {
  const lastAction = userActionHistory[0];
  if (!lastAction) return true;

  return Date.now() - lastAction.timestamp > timeout;
}

// Check MCP permissions for triggers
function hasTriggerPermission(
  trigger: ProactiveTrigger,
  context: TriggerContext
): boolean {
  if (!trigger.mcpRequired) return true;

  const { roles, tiers } = trigger.mcpRequired;

  if (roles && !roles.includes(context.userRole)) {
    return false;
  }

  if (tiers && !tiers.includes(context.tier)) {
    return false;
  }

  return true;
}

// Check if trigger is on cooldown
function isTriggerOnCooldown(trigger: ProactiveTrigger): boolean {
  if (!lastProactiveTip || lastProactiveTip.type !== trigger.id) {
    return false;
  }

  return Date.now() - lastProactiveTip.timestamp < trigger.cooldown;
}

// Sanitize context inputs for security
function sanitizeContext(_context: any): any {
  if (!_context || typeof _context !== 'object') {
    return {};
  }

  // Only allow safe properties
  const safeKeys = ['userId', 'userRole', 'tier', 'features', 'mode'];
  const sanitized: any = {};

  for (const key of safeKeys) {
    if (_context[key] !== undefined) {
      // Validate string values
      if (typeof _context[key] === 'string') {
        sanitized[key] = _context[key].replace(/[<>"'&]/g, '');
      } else {
        sanitized[key] = _context[key];
      }
    }
  }

  return sanitized;
}

// Define proactive triggers
const proactiveTriggers: ProactiveTrigger[] = [
  // Theme scan completion trigger
  {
    id: 'theme-scan-complete',
    condition: _context => {
      const recentActions = getRecentActions('themeAnalysis', 30 * 1000);
      return recentActions.some(
        action =>
          action.type === 'themeScanComplete' &&
          action.metadata?.conflictsFound > 0
      );
    },
    action: _context => {
      // This would call the agent's suggestNextStep method
      console.log('Proactive trigger: Theme scan completed with conflicts');
      // In real implementation: context.agent.suggestNextStep('export');
    },
    cooldown: 5 * 60 * 1000, // 5 minutes
    priority: 'medium',
    mcpRequired: { tiers: ['Pro', 'Admin'] },
  },

  // Revision engine usage trigger
  {
    id: 'revision-engine-help',
    condition: _context => {
      const recentActions = getRecentActions('revisionEngine', 2 * 60 * 1000);
      const dismissedCount = recentActions.filter(
        action => action.type === 'suggestionDismissed'
      ).length;

      return dismissedCount >= 3;
    },
    action: _context => {
      console.log('Proactive trigger: Many revision suggestions dismissed');
      // In real implementation: context.agent.explainFeature('revisionEngine');
    },
    cooldown: 10 * 60 * 1000, // 10 minutes
    priority: 'high',
    mcpRequired: { tiers: ['Pro', 'Admin'] },
  },

  // First-time dashboard visit
  {
    id: 'first-dashboard-visit',
    condition: _context => {
      const dashboardVisits = getRecentActions('dashboard').filter(
        action => action.type === 'pageView'
      );
      return dashboardVisits.length === 1;
    },
    action: _context => {
      console.log('Proactive trigger: First dashboard visit');
      // In real implementation: context.agent.showOnboarding('dashboard');
    },
    cooldown: 24 * 60 * 60 * 1000, // 24 hours
    priority: 'high',
    mcpRequired: { tiers: ['Pro', 'Admin'] },
  },

  // Inactivity trigger
  {
    id: 'user-inactivity',
    condition: _context => {
      return isUserInactive(2 * 60 * 1000) && !_context.isAgentVisible;
    },
    action: _context => {
      console.log('Proactive trigger: User inactive for 2 minutes');
      // In real implementation: context.agent.suggestNextStep('continue');
    },
    cooldown: 5 * 60 * 1000, // 5 minutes
    priority: 'low',
    mcpRequired: { tiers: ['Pro', 'Admin'] },
  },

  // Export suggestion after analysis
  {
    id: 'export-suggestion',
    condition: _context => {
      const recentActions = getRecentActions('analysis', 5 * 60 * 1000);
      const hasAnalysis = recentActions.some(
        action => action.type === 'analysisComplete'
      );
      const hasExport = recentActions.some(action => action.type === 'export');

      return hasAnalysis && !hasExport;
    },
    action: _context => {
      console.log('Proactive trigger: Analysis complete, suggest export');
      // In real implementation: context.agent.suggestNextStep('export');
    },
    cooldown: 3 * 60 * 1000, // 3 minutes
    priority: 'medium',
    mcpRequired: { tiers: ['Pro', 'Admin'] },
  },

  // Style drift detection
  {
    id: 'style-drift-alert',
    condition: _context => {
      const recentActions = getRecentActions('styleAnalysis', 60 * 1000);
      return recentActions.some(
        action =>
          action.type === 'styleDriftDetected' &&
          action.metadata?.driftScore > 0.7
      );
    },
    action: _context => {
      console.log('Proactive trigger: High style drift detected');
      // In real implementation: context.agent.explainFeature('styleCorrection');
    },
    cooldown: 15 * 60 * 1000, // 15 minutes
    priority: 'high',
    mcpRequired: { tiers: ['Pro', 'Admin'] },
  },
];

export function useAgentTriggers(
  userRole: string,
  tier: string,
  isAgentVisible: boolean,
  _agentActions: {
    suggestNextStep: (step: string) => void;
    explainFeature: (feature: string) => void;
    showOnboarding: (flow: string) => void;
  }
) {
  const location = useLocation();
  const currentModule = location.pathname.split('/')[1] || 'general';
  const triggerTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track page view
  useEffect(() => {
    trackUserAction({
      type: 'pageView',
      module: currentModule,
      metadata: { path: location.pathname },
    });
  }, [location.pathname, currentModule]);

  // Check triggers periodically
  const checkTriggers = useCallback(() => {
    const context: TriggerContext = {
      userRole,
      tier,
      isAgentVisible,
      recentActions: userActionHistory,
      currentModule,
      lastProactiveTip: lastProactiveTip || undefined,
    };

    // Sort triggers by priority (high first)
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const sortedTriggers = [...proactiveTriggers].sort(
      (a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]
    );

    // Find the first trigger that should fire
    for (const trigger of sortedTriggers) {
      if (
        hasTriggerPermission(trigger, context) &&
        !isTriggerOnCooldown(trigger) &&
        trigger.condition(context)
      ) {
        // Fire the trigger
        trigger.action(context);

        // Update last proactive tip
        lastProactiveTip = {
          type: trigger.id,
          timestamp: Date.now(),
        };

        // Don't fire multiple triggers at once
        break;
      }
    }
  }, [userRole, tier, isAgentVisible, currentModule]);

  // Set up periodic trigger checking
  useEffect(() => {
    // Check triggers every 30 seconds
    const interval = setInterval(checkTriggers, 30 * 1000);

    return () => {
      clearInterval(interval);
      if (triggerTimeoutRef.current) {
        clearTimeout(triggerTimeoutRef.current);
      }
    };
  }, [checkTriggers]);

  // Check triggers immediately when conditions change
  useEffect(() => {
    // Debounce trigger checking to avoid excessive calls
    if (triggerTimeoutRef.current) {
      clearTimeout(triggerTimeoutRef.current);
    }

    triggerTimeoutRef.current = setTimeout(checkTriggers, 1000);
  }, [userRole, tier, isAgentVisible, currentModule, checkTriggers]);

  // Return functions for manual action tracking
  return {
    trackAction: trackUserAction,
    clearHistory: () => {
      userActionHistory.length = 0;
      lastProactiveTip = null;
    },
  };
}

/**
 * Hook for doc-to-video pipeline triggers
 * Automatically reacts to mode and feature changes
 */
export function useDoc2VideoTriggers(context?: object) {
  const { doc2videoMode, doc2videoFeatures } = useDocCraftAgent();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Get userRole and tier from context or use defaults
  const userRole = (context as any)?.userRole || 'user';
  const tier = (context as any)?.tier || 'Basic';

  // Auto-trigger pipeline refresh based on mode and features
  useEffect(() => {
    // Clear existing debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Only auto-trigger in AUTO mode and for Pro tier users
    if (doc2videoMode === 'auto' && tier === 'Pro') {
      // Debounce to prevent spam when toggling features rapidly
      debounceRef.current = setTimeout(() => {
        const enabledFeatures = Object.keys(doc2videoFeatures)
          .filter(
            key => doc2videoFeatures[key as keyof typeof doc2videoFeatures]
          )
          .join(',');

        // Sanitize context inputs for security
        sanitizeContext({
          ...context,
          userRole,
          tier,
          features: enabledFeatures,
          mode: doc2videoMode,
          mcp: {
            role: 'ai-engineer',
            tier: 'Pro',
            theme: 'doc2video_triggers',
          },
        });

        // Auto-trigger pipeline refresh
        docToVideoRouter
          .executeCommand(
            `/doc2video auto features=${enabledFeatures}`,
            'Auto-triggered refresh based on mode/feature changes'
          )
          .then(response => {
            console.log('Doc2Video auto refresh:', response);

            // TODO: Persist the last auto-generated response in context for reuse
            // TODO: Update UI with new preview data
            // TODO: Add tier check: auto-trigger available for Pro tier only
          })
          .catch(err => {
            console.error('Doc2Video auto refresh failed:', err);
          });
      }, 2000); // 2 second debounce
    }

    // Cleanup on unmount
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [doc2videoMode, doc2videoFeatures, userRole, tier, context]);

  // Handle different modes
  useEffect(() => {
    switch (doc2videoMode) {
      case 'auto':
        // Auto mode: triggers handled above
        console.log('Doc2Video mode: Auto - automatic regeneration enabled');
        break;

      case 'hybrid':
        // Hybrid mode: TODO - future support for partial regeneration
        console.log('Doc2Video mode: Hybrid - partial regeneration (future)');
        // TODO: Add support for partial regeneration (e.g. only slides)
        break;

      case 'manual':
        // Manual mode: no auto-trigger
        console.log('Doc2Video mode: Manual - no automatic triggers');
        break;

      default:
        console.warn('Unknown doc2video mode:', doc2videoMode);
    }
  }, [doc2videoMode]);

  // Track mode and feature changes
  useEffect(() => {
    trackUserAction({
      type: 'doc2videoSettingsChanged',
      module: 'doc2video',
      metadata: {
        mode: doc2videoMode,
        features: doc2videoFeatures,
        userRole,
        tier,
      },
    });
  }, [doc2videoMode, doc2videoFeatures, userRole, tier]);

  return {
    currentMode: doc2videoMode,
    currentFeatures: doc2videoFeatures,
    isAutoMode: doc2videoMode === 'auto',
    isProTier: tier === 'Pro',
  };
}
