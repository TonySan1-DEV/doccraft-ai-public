// MCP Context Block
/*
role: ai-engineer,
tier: Pro,
file: "modules/agent/services/enrichAgentMessage.ts",
allowedActions: ["enrich", "suggest", "augment"],
theme: "agent_message_enrichment"
*/

import { AgentMessage } from './agentChatRouter';

/**
 * Enrich agent messages with context-aware suggested actions
 * @param message - The agent message to enrich
 * @param context - Optional context for feature-specific actions
 * @returns Enriched AgentMessage
 */
export function enrichAgentMessage(
  message: AgentMessage,
  context?: { feature?: string }
): AgentMessage {
  // Ensure non-destructive enrichment by preserving existing actions
  const existingActions = message.suggestedActions || [];

  // Add quick replies based on context
  if (message.relatedStepId) {
    message.suggestedActions = [
      ...existingActions,
      {
        label: 'Show Me',
        action: 'showOnboarding',
        targetStepId: message.relatedStepId,
      },
    ];
  }

  // Add doc-to-video specific actions if feature context is provided
  if (context?.feature === 'doc2video') {
    // Validate and attach doc2video-specific actions
    const doc2videoActions = [
      { label: 'Download PPT', action: 'exportPPT' },
      { label: 'Preview Narration', action: 'previewNarration' },
      { label: 'Play Voiceover', action: 'playVoiceover' },
      { label: 'Switch to Hybrid Mode', action: 'switchModeHybrid' },
    ];

    // Ensure actions are valid before attaching
    const validatedActions = doc2videoActions.filter(
      action =>
        action.label &&
        action.action &&
        typeof action.label === 'string' &&
        typeof action.action === 'string'
    );

    message.suggestedActions = [...existingActions, ...validatedActions];
  }

  // Add help action if no other actions present
  if (!message.suggestedActions || message.suggestedActions.length === 0) {
    message.suggestedActions = [{ label: 'Get Help', action: 'showHelp' }];
  }

  // Add retry action for LLM fallback responses
  if (message.llmFallback) {
    message.suggestedActions = [
      ...(message.suggestedActions || []),
      { label: 'Try Again', action: 'retry' },
    ];
  }

  // Add accessibility attributes
  // Note: aria-live and role are handled at the component level, not in the message object
  // if (message.type === 'agent') {
  //   message['aria-live'] = 'polite';
  //   message['role'] = 'dialog';
  // }

  // TODO: Future contextual expansion
  // - Add actions based on user tier (Premium users get more options)
  // - Show "Edit Slide 2" if Hybrid mode is active
  // - Add "Export Timeline" for advanced users
  // - Include "Share Presentation" for collaboration features

  return message;
}
