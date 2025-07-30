// MCP Context Block
/*
role: ai-engineer,
tier: Pro,
file: "modules/agent/contexts/DocCraftAgentProvider.tsx",
allowedActions: ["listen", "suggest", "trigger"],
theme: "agent_context"
*/

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAgentTriggers } from '../hooks/useAgentTriggers';

interface UserAction {
  type: string;
  module: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface AgentMessage {
  id: string;
  type: 'user' | 'agent' | 'system';
  content: string;
  timestamp: number;
  isProactive?: boolean;
  suggestedActions?: { label: string; action: string; targetStepId?: string }[];
  mcp?: { role: string; tier: string; theme?: string };
  llmFallback?: boolean;
  modelUsed?: string;
}

interface AgentState {
  onboardingStep: string | null;
  chatHistory: AgentMessage[];
  lastSuggestion?: string;
  workflowGuide?: string;
  isAgentVisible: boolean;
  userActions: UserAction[];
  lastProactiveTip?: {
    type: string;
    timestamp: number;
  };
}

interface AgentContextType extends AgentState {
  askAgent: (query: string) => Promise<string>;
  showOnboarding: (flow: string) => void;
  suggestNextStep: (context: string) => void;
  explainFeature: (feature: string) => void;
  getWorkflowGuide: (workflow: string) => void;
  resetAgent: () => void;
  toggleAgentVisibility: () => void;
  trackUserAction: (action: Omit<UserAction, 'timestamp'>) => void;
  addProactiveMessage: (message: Omit<AgentMessage, 'id' | 'timestamp'>) => void;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

interface DocCraftAgentProviderProps {
  children: ReactNode;
  userRole: string;
  tier: string;
}

export const DocCraftAgentProvider: React.FC<DocCraftAgentProviderProps> = ({ 
  children, 
  userRole, 
  tier 
}) => {
  const [onboardingStep, setOnboardingStep] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<AgentMessage[]>([]);
  const [lastSuggestion, setLastSuggestion] = useState<string | undefined>(undefined);
  const [workflowGuide, setWorkflowGuide] = useState<string | undefined>(undefined);
  const [isAgentVisible, setIsAgentVisible] = useState<boolean>(false);
  const [userActions, setUserActions] = useState<UserAction[]>([]);
  const [lastProactiveTip, setLastProactiveTip] = useState<{ type: string; timestamp: number } | undefined>(undefined);

  // Agent action handlers
  const agentActions = {
    suggestNextStep: (step: string) => {
      setLastSuggestion(`Next step: ${step}`);
      addProactiveMessage({
        type: 'agent',
        content: `💡 **Pro Tip:** ${step}`,
        isProactive: true,
        suggestedActions: [{ label: 'Show Me', action: 'showNextStep' }]
      });
    },
    explainFeature: (feature: string) => {
      addProactiveMessage({
        type: 'agent',
        content: `🔍 **Feature Guide:** Let me explain how ${feature} works...`,
        isProactive: true,
        suggestedActions: [{ label: 'Learn More', action: 'showFeatureGuide' }]
      });
    },
    showOnboarding: (flow: string) => {
      setOnboardingStep(flow);
      addProactiveMessage({
        type: 'agent',
        content: `🎯 **Getting Started:** Let's walk through ${flow} together!`,
        isProactive: true,
        suggestedActions: [{ label: 'Start Walkthrough', action: 'resumeOnboarding' }]
      });
    }
  };

  // Initialize agent triggers
  const { trackAction, getRecentActions, isUserInactive, clearHistory } = useAgentTriggers(
    userRole,
    tier,
    isAgentVisible,
    agentActions
  );

  // Track user actions in context state
  const trackUserAction = (action: Omit<UserAction, 'timestamp'>) => {
    const fullAction: UserAction = {
      ...action,
      timestamp: Date.now()
    };
    
    setUserActions(prev => {
      const updated = [fullAction, ...prev.slice(0, 9)]; // Keep last 10 actions
      return updated;
    });
    
    // Also track in the hook for trigger logic
    trackAction(action);
  };

  // Add proactive message to chat
  const addProactiveMessage = (message: Omit<AgentMessage, 'id' | 'timestamp'>) => {
    const fullMessage: AgentMessage = {
      ...message,
      id: `proactive-${Date.now()}`,
      timestamp: Date.now()
    };
    
    setChatHistory(prev => [...prev, fullMessage]);
    
    // Update last proactive tip
    setLastProactiveTip({
      type: message.content.split(':')[0] || 'general',
      timestamp: Date.now()
    });
  };

  // Placeholder: Replace with LLM/knowledge base integration
  const askAgent = async (query: string) => {
    const userMessage: AgentMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: query,
      timestamp: Date.now()
    };
    
    setChatHistory(prev => [...prev, userMessage]);
    
    // TODO: Integrate with LLM or knowledge base
    const response = `Agent response to: "${query}" (demo)`;
    
    const agentMessage: AgentMessage = {
      id: `agent-${Date.now()}`,
      type: 'agent',
      content: response,
      timestamp: Date.now(),
      suggestedActions: [{ label: 'Help', action: 'showHelp' }]
    };
    
    setChatHistory(prev => [...prev, agentMessage]);
    return response;
  };

  const toggleAgentVisibility = () => {
    setIsAgentVisible(prev => !prev);
  };

  const resetAgent = () => {
    setOnboardingStep(null);
    setChatHistory([]);
    setLastSuggestion(undefined);
    setWorkflowGuide(undefined);
    setUserActions([]);
    setLastProactiveTip(undefined);
    clearHistory();
  };

  const getWorkflowGuide = (workflow: string) => {
    setWorkflowGuide(`Workflow guide for: ${workflow}`);
  };

  // Track page views and module changes
  useEffect(() => {
    const currentModule = window.location.pathname.split('/')[1] || 'general';
    trackUserAction({
      type: 'pageView',
      module: currentModule,
      metadata: { path: window.location.pathname }
    });
  }, []);

  // Provide context value
  const contextValue: AgentContextType = {
    onboardingStep,
    chatHistory,
    lastSuggestion,
    workflowGuide,
    isAgentVisible,
    userActions,
    lastProactiveTip,
    askAgent,
    showOnboarding: agentActions.showOnboarding,
    suggestNextStep: agentActions.suggestNextStep,
    explainFeature: agentActions.explainFeature,
    getWorkflowGuide,
    resetAgent,
    toggleAgentVisibility,
    trackUserAction,
    addProactiveMessage
  };

  return (
    <AgentContext.Provider value={contextValue}>
      {children}
    </AgentContext.Provider>
  );
};

export function useDocCraftAgent() {
  const ctx = useContext(AgentContext);
  if (!ctx) {
    throw new Error('useDocCraftAgent must be used within a DocCraftAgentProvider');
  }
  return ctx;
}

// Hook for tracking specific user actions
export function useActionTracker() {
  const { trackUserAction } = useDocCraftAgent();
  
  return {
    trackPageView: (module: string, metadata?: Record<string, any>) => {
      trackUserAction({
        type: 'pageView',
        module,
        metadata
      });
    },
    
    trackFeatureUsage: (feature: string, module: string, metadata?: Record<string, any>) => {
      trackUserAction({
        type: 'featureUsed',
        module,
        metadata: { feature, ...metadata }
      });
    },
    
    trackAnalysisComplete: (analysisType: string, module: string, results?: any) => {
      trackUserAction({
        type: 'analysisComplete',
        module,
        metadata: { analysisType, results }
      });
    },
    
    trackExport: (format: string, module: string) => {
      trackUserAction({
        type: 'export',
        module,
        metadata: { format }
      });
    },
    
    trackSuggestionDismissed: (module: string, suggestionType: string) => {
      trackUserAction({
        type: 'suggestionDismissed',
        module,
        metadata: { suggestionType }
      });
    }
  };
} 