// MCP Context Block
/*
role: ai-engineer,
tier: Pro,
file: "modules/agent/services/enrichAgentMessage.ts",
allowedActions: ["integrate", "fallback", "query"],
theme: "agent_llm"
*/

import { AgentMessage } from './agentChatRouter';

export function enrichAgentMessage(msg: AgentMessage): AgentMessage {
  // Add quick replies based on context
  if (msg.relatedStepId) {
    msg.suggestedActions = [
      ...(msg.suggestedActions || []),
      { label: "Show Me", action: "showOnboarding", targetStepId: msg.relatedStepId }
    ];
  }

  // Add help action if no other actions present
  if (!msg.suggestedActions || msg.suggestedActions.length === 0) {
    msg.suggestedActions = [{ label: "Get Help", action: "showHelp" }];
  }

  // Add retry action for LLM fallback responses
  if (msg.llmFallback) {
    msg.suggestedActions = [
      ...(msg.suggestedActions || []),
      { label: "Try Again", action: "retry" }
    ];
  }

  // Add accessibility attributes
  if (msg.type === 'agent') {
    msg['aria-live'] = 'polite';
    msg['role'] = 'dialog';
  }

  return msg;
} 