// MCP Context Block
/*
role: frontend-developer,
tier: Pro,
file: "src/contexts/AgentContext.tsx",
allowedActions: ["scaffold", "provide", "integrate"],
theme: "agent"
*/

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AgentState {
  onboardingStep: string | null;
  chatHistory: Array<{ sender: 'user' | 'agent'; message: string }>;
  lastSuggestion?: string;
  workflowGuide?: string;
}

interface AgentContextType extends AgentState {
  askAgent: (query: string) => Promise<string>;
  showOnboarding: (flow: string) => void;
  suggestNextStep: (context: string) => void;
  explainFeature: (feature: string) => void;
  getWorkflowGuide: (workflow: string) => void;
  resetAgent: () => void;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export const DocCraftAgentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [onboardingStep, setOnboardingStep] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<AgentState['chatHistory']>([]);
  const [lastSuggestion, setLastSuggestion] = useState<string | undefined>(undefined);
  const [workflowGuide, setWorkflowGuide] = useState<string | undefined>(undefined);

  // Placeholder: Replace with LLM/knowledge base integration
  const askAgent = async (query: string) => {
    setChatHistory(h => [...h, { sender: 'user', message: query }]);
    // TODO: Integrate with LLM or knowledge base
    const response = `Agent response to: "${query}" (demo)`;
    setChatHistory(h => [...h, { sender: 'agent', message: response }]);
    return response;
  };

  const showOnboarding = (flow: string) => {
    setOnboardingStep(flow);
    setChatHistory([]);
  };

  const suggestNextStep = (context: string) => {
    setLastSuggestion(`Next step for: ${context}`);
  };

  const explainFeature = (feature: string) => {
    setChatHistory(h => [...h, { sender: 'agent', message: `Feature explanation for: ${feature}` }]);
  };

  const getWorkflowGuide = (workflow: string) => {
    setWorkflowGuide(`Workflow guide for: ${workflow}`);
  };

  const resetAgent = () => {
    setOnboardingStep(null);
    setChatHistory([]);
    setLastSuggestion(undefined);
    setWorkflowGuide(undefined);
  };

  return (
    <AgentContext.Provider value={{
      onboardingStep,
      chatHistory,
      lastSuggestion,
      workflowGuide,
      askAgent,
      showOnboarding,
      suggestNextStep,
      explainFeature,
      getWorkflowGuide,
      resetAgent
    }}>
      {children}
    </AgentContext.Provider>
  );
};

export function useDocCraftAgent() {
  const ctx = useContext(AgentContext);
  if (!ctx) throw new Error('useDocCraftAgent must be used within a DocCraftAgentProvider');
  return ctx;
} 