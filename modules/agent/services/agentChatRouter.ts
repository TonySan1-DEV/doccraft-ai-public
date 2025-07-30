// MCP Context Block
/*
role: ai-engineer,
tier: Pro,
file: "modules/agent/services/agentChatRouter.ts",
allowedActions: ["integrate", "fallback", "query"],
theme: "agent_llm"
*/

import { queryLLMFallback } from "./useLLMFallback";
import { enrichAgentMessage } from "./enrichAgentMessage";

// Mock implementations for missing dependencies
const getKBEntry = (query: string, role: string, tier: string) => {
  // Mock KB lookup - in real implementation, this would search the knowledge base
  const mockKB = [
    {
      id: 'kb-emotion-drift',
      content: 'To check for emotional drift, use the Emotion Timeline Chart in the dashboard.',
      mcp: { role: 'frontend-developer', tier: 'Pro', theme: 'emotion_analysis' }
    },
    {
      id: 'kb-theme-conflicts',
      content: 'Theme conflicts can be detected using the Theme Matrix Panel in the dashboard.',
      mcp: { role: 'frontend-developer', tier: 'Pro', theme: 'theme_analysis' }
    }
  ];
  
  return mockKB.filter(entry => 
    query.toLowerCase().includes('emotion') || 
    query.toLowerCase().includes('theme') ||
    query.toLowerCase().includes('drift')
  );
};

const OnboardingEngine = {
  startFlow: (flowId: string) => {
    console.log(`Starting onboarding flow: ${flowId}`);
  }
};

export type AgentMessage = {
  type: "user" | "agent" | "system";
  content: string;
  relatedStepId?: string;
  kbRef?: string;
  suggestedActions?: { label: string; action: string; targetStepId?: string }[];
  mcp?: { role: string; tier: string; theme?: string };
  llmFallback?: boolean;
  modelUsed?: string;
};

export async function agentChatRouter(
  input: string,
  userRole: string,
  tier: string,
  context?: {
    activeModule?: string;
    currentWorkflow?: string;
    recentActions?: string[];
  }
): Promise<AgentMessage> {
  let matchFound = false;
  let response: AgentMessage | null = null;

  // Command handling
  if (input.startsWith("/")) {
    if (input.startsWith("/onboarding")) {
      const [, flowId] = input.split(" ");
      if (flowId) {
        OnboardingEngine.startFlow(flowId);
        matchFound = true;
        response = {
          type: "agent",
          content: `Onboarding for ${flowId} started.`,
          relatedStepId: onboardingFlows.find(f => f.id === flowId)?.steps[0]?.id,
          suggestedActions: [{ label: "Resume Onboarding", action: "resumeOnboarding" }]
        };
      }
    }
    if (input.startsWith("/help")) {
      matchFound = true;
      response = {
        type: "agent",
        content: "How can I help? Try asking about features, exports, or workflows.",
        suggestedActions: [{ label: "Show Docs", action: "openDocs" }]
      };
    }
    if (input.startsWith("/export")) {
      matchFound = true;
      response = {
        type: "agent",
        content: "Export options available: JSON, Markdown, or CSV formats.",
        suggestedActions: [
          { label: "Export JSON", action: "exportJSON" },
          { label: "Export Markdown", action: "exportMarkdown" }
        ]
      };
    }
  }

  // KB lookup if no command match
  if (!matchFound) {
    const kbResults = getKBEntry(input, userRole, tier);
    if (kbResults.length > 0) {
      matchFound = true;
      const top = kbResults[0];
      response = {
        type: "agent",
        content: top.content,
        kbRef: top.id,
        suggestedActions: [
          { label: "Show Me", action: "showOnboarding", targetStepId: top.id },
          { label: "Open Docs", action: "openDocs" }
        ],
        mcp: top.mcp
      };
    }
  }

  // Onboarding step trigger (natural language)
  if (!matchFound) {
    const onboardingMatch = onboardingFlows
      .flatMap(f => f.steps)
      .find(step => input.toLowerCase().includes(step.title.toLowerCase()));
    if (onboardingMatch) {
      OnboardingEngine.startFlow(onboardingMatch.id);
      matchFound = true;
      response = {
        type: "agent",
        content: `Let's walk through "${onboardingMatch.title}".`,
        relatedStepId: onboardingMatch.id,
        suggestedActions: [{ label: "Start Walkthrough", action: "resumeOnboarding" }]
      };
    }
  }

  // LLM Fallback for unmatched queries
  if (!matchFound) {
    try {
      const llmResponse = await queryLLMFallback(input, {
        userRole,
        tier,
        activeModule: context?.activeModule,
        currentWorkflow: context?.currentWorkflow,
        recentActions: context?.recentActions
      });

      response = {
        type: "agent",
        content: llmResponse.content,
        suggestedActions: llmResponse.suggestedActions || [
          { label: "Suggest Next Step", action: "suggestNextStep" }
        ],
        llmFallback: true,
        modelUsed: llmResponse.modelUsed
      };
    } catch (error) {
      console.error('LLM fallback failed:', error);
      response = {
        type: "agent",
        content: "I'm having trouble processing that request. Could you try rephrasing or ask about a specific feature?",
        suggestedActions: [
          { label: "Show Help", action: "showHelp" },
          { label: "Try Again", action: "retry" }
        ]
      };
    }
  }

  // Enrich the response with additional context
  return enrichAgentMessage(response || {
    type: "agent",
    content: "I'm not sure how to help with that. Try asking about specific features or workflows.",
    suggestedActions: [{ label: "Suggest Next Step", action: "suggestNextStep" }]
  });
}

// Mock onboarding flows for now (should be imported from actual file)
const onboardingFlows = [
  {
    id: 'onboarding-theme',
    title: 'Theme Analysis Onboarding',
    steps: [
      {
        id: 'theme-step-1',
        title: 'Check for emotional drift',
        description: 'Learn how to detect emotional inconsistencies'
      }
    ]
  }
]; 