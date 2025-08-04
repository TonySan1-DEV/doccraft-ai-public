// MCP Context Block
/*
role: frontend-developer,
tier: Pro,
file: "src/contexts/AgentContext.tsx",
allowedActions: ["scaffold", "provide", "integrate"],
theme: "agent"
*/

import React, { createContext, useContext, useState, ReactNode } from "react";

interface AgentState {
  onboardingStep: string | null;
  chatHistory: Array<{ sender: "user" | "agent"; message: string }>;
  lastSuggestion?: string;
  workflowGuide?: string;
}

interface AgentContextType extends AgentState {
  askAgent: (query: string) => Promise<string>;
  sendAgentGreeting: (message: string) => void;
  showOnboarding: (flow: string) => void;
  suggestNextStep: (context: string) => void;
  explainFeature: (feature: string) => void;
  getWorkflowGuide: (workflow: string) => void;
  resetAgent: () => void;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export const DocCraftAgentProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [onboardingStep, setOnboardingStep] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<AgentState["chatHistory"]>([]);
  const [lastSuggestion, setLastSuggestion] = useState<string | undefined>(
    undefined
  );
  const [workflowGuide, setWorkflowGuide] = useState<string | undefined>(
    undefined
  );

  // Placeholder: Replace with LLM/knowledge base integration
  const sendAgentGreeting = (message: string) => {
    setChatHistory((h) => [...h, { sender: "agent", message: message }]);
  };

  const askAgent = async (query: string) => {
    setChatHistory((h) => [...h, { sender: "user", message: query }]);

    // Demo-specific responses for better user experience
    let response = "";

    if (
      query.toLowerCase().includes("hello") ||
      query.toLowerCase().includes("hi")
    ) {
      response =
        "Hello! I'm your DocCraft-AI assistant. I'm here to help you explore our powerful features. You can ask me about document processing, AI enhancement, ebook analysis, character development, collaboration tools, analytics, and more. What would you like to know about?";
    } else if (
      query.toLowerCase().includes("demo") ||
      query.toLowerCase().includes("guide")
    ) {
      response =
        "Great! I'd be happy to guide you through the demo. Here's what you'll see:\n\n1. **Document Upload & Analysis** - Watch AI analyze document structure\n2. **AI Enhancement** - See intelligent content improvements\n3. **Ebook Analysis** - Discover insights from existing content\n4. **Character Development** - Create rich, complex characters\n5. **Collaboration** - Real-time teamwork features\n6. **Analytics** - Performance insights and metrics\n7. **Personalization** - AI adapting to your style\n\nClick 'Start Demo' to begin, and I'll explain each step as it happens!";
    } else if (
      query.toLowerCase().includes("feature") ||
      query.toLowerCase().includes("what can")
    ) {
      response =
        "DocCraft-AI offers several powerful features:\n\n• **Document Processing** - Upload and enhance any document\n• **AI Enhancement** - Intelligent suggestions and corrections\n• **Ebook Analysis** - Deep insights into existing content\n• **Character Development** - Create compelling characters\n• **Real-time Collaboration** - Work together seamlessly\n• **Advanced Analytics** - Track performance and engagement\n• **Personalized Experience** - AI learns your style\n\nWhich feature interests you most?";
    } else if (
      query.toLowerCase().includes("help") ||
      query.toLowerCase().includes("how")
    ) {
      response =
        "I'm here to help! You can:\n\n• Ask me about any feature in the demo\n• Get explanations of what's happening\n• Learn about DocCraft-AI capabilities\n• Get tips on using the platform\n\nJust ask me anything - I'm your AI guide through this demo!";
    } else {
      response = `I understand you're asking about: "${query}". In the full version of DocCraft-AI, I would provide detailed, contextual responses based on our knowledge base and your specific needs. For now, feel free to ask me about the demo features, and I'll guide you through them!`;
    }

    setChatHistory((h) => [...h, { sender: "agent", message: response }]);
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
    setChatHistory((h) => [
      ...h,
      { sender: "agent", message: `Feature explanation for: ${feature}` },
    ]);
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
    <AgentContext.Provider
      value={{
        onboardingStep,
        chatHistory,
        lastSuggestion,
        workflowGuide,
        askAgent,
        sendAgentGreeting,
        showOnboarding,
        suggestNextStep,
        explainFeature,
        getWorkflowGuide,
        resetAgent,
      }}
    >
      {children}
    </AgentContext.Provider>
  );
};

export function useDocCraftAgent() {
  const ctx = useContext(AgentContext);
  if (!ctx)
    throw new Error(
      "useDocCraftAgent must be used within a DocCraftAgentProvider"
    );
  return ctx;
}
