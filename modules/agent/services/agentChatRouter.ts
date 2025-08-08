// MCP Context Block
/*
role: ai-engineer,
tier: Pro,
file: "modules/agent/services/agentChatRouter.ts",
allowedActions: ["integrate", "fallback", "query", "pipeline"],
theme: "agent_llm"
*/

import { queryLLMFallback } from './useLLMFallback';
import { enrichAgentMessage } from './enrichAgentMessage';
import { docToVideoRouter } from './docToVideoRouter';
import { getKBEntry } from './seedAgentKnowledgeBase';
import { onboardingEngine } from '../onboarding/onboardingEngine';

export type AgentMessage = {
  type: 'user' | 'agent' | 'system';
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
    genre?: string;
    genreContext?: {
      category: 'fiction' | 'nonfiction' | 'special';
      subgenre?: string;
      targetAudience?: string[];
    };
  }
): Promise<AgentMessage> {
  let matchFound = false;
  let response: AgentMessage | null = null;

  // Command handling
  if (input.startsWith('/')) {
    if (input.startsWith('/onboarding')) {
      const [, flowId] = input.split(' ');
      if (flowId) {
        onboardingEngine.startFlow(flowId);
        matchFound = true;
        response = {
          type: 'agent',
          content: `Onboarding for ${flowId} started.`,
          relatedStepId: onboardingFlows.find(f => f.id === flowId)?.steps[0]
            ?.id,
          suggestedActions: [
            { label: 'Resume Onboarding', action: 'resumeOnboarding' },
          ],
        };
      }
    }
    if (input.startsWith('/help')) {
      matchFound = true;
      response = {
        type: 'agent',
        content:
          'How can I help? Try asking about features, exports, or workflows.',
        suggestedActions: [{ label: 'Show Docs', action: 'openDocs' }],
      };
    }
    if (input.startsWith('/export')) {
      matchFound = true;
      response = {
        type: 'agent',
        content: 'Export options available: JSON, Markdown, or CSV formats.',
        suggestedActions: [
          { label: 'Export JSON', action: 'exportJSON' },
          { label: 'Export Markdown', action: 'exportMarkdown' },
        ],
      };
    }
    if (input.startsWith('/doc2video')) {
      matchFound = true;
      try {
        // Extract command mode (auto, scriptOnly, slidesOnly, voiceoverOnly)
        const [, _mode = 'auto'] = input.split(' ');

        // Example stubbed document for testing — in real use, this will come from file upload or user context
        const mockDocument = `
          Welcome to DocCraft-AI. This platform empowers creators to transform documents into dynamic video presentations.
          Our tools include eBook builders, AI character interaction, and now, full video pipelines.
          
          Key Features:
          - Document analysis and enhancement
          - AI-powered writing assistance
          - Real-time collaboration tools
          - Advanced analytics and insights
          
          Benefits:
          - 50% faster content creation
          - Improved content quality
          - Reduced revision cycles
          - Enhanced team productivity
        `;

        // TODO: Connect real document upload later
        // TODO: Allow hybrid/multi-step workflows

        const result = await docToVideoRouter.executeCommand(
          input,
          mockDocument
        );

        if (result.success) {
          const slideCount = result.slides?.length || 0;
          const wordCount = result.script?.wordCount || 0;
          const duration = result.script?.totalDuration || 0;

          response = {
            type: 'agent',
            content: `🎬 **Doc-to-Video Pipeline Complete!**
            
✅ **Generated ${slideCount} slides** with ${wordCount} words of narration
⏱️ **Total duration:** ${duration} seconds
🎤 **Audio timeline:** ${result.narration?.timeline?.length || 0} segments

**Available Actions:**
• Download PowerPoint presentation
• Preview narration audio
• Export timing data for video production
• Switch to Hybrid Mode for manual adjustments`,
            suggestedActions: [
              { label: 'Download PPT', action: 'downloadPowerPoint' },
              { label: 'Preview Narration', action: 'previewNarration' },
              { label: 'Export Timeline', action: 'exportTimeline' },
              { label: 'Switch to Hybrid', action: 'switchToHybrid' },
            ],
            mcp: {
              role: 'Document to Video Pipeline Orchestrator',
              tier: 'Premium',
              theme: 'Content Transformation',
            },
          };
        } else {
          response = {
            type: 'agent',
            content: `❌ **Pipeline Error:** ${result.error}
            
Please check your document content and try again.`,
            suggestedActions: [
              { label: 'Try Again', action: 'retry' },
              { label: 'Show Help', action: 'showHelp' },
            ],
          };
        }
      } catch (error) {
        response = {
          type: 'agent',
          content: `❌ **Pipeline Error:** ${error instanceof Error ? error.message : 'Unknown error'}
          
Please ensure you have valid document content and try again.`,
          suggestedActions: [
            { label: 'Try Again', action: 'retry' },
            { label: 'Show Help', action: 'showHelp' },
          ],
        };
      }
    }
  }

  // KB lookup if no command match
  if (!matchFound) {
    const kbResults = getKBEntry(input, userRole, tier);
    if (kbResults.length > 0) {
      matchFound = true;
      const top = kbResults[0];
      response = {
        type: 'agent',
        content: top.content,
        kbRef: top.id,
        suggestedActions: [
          { label: 'Show Me', action: 'showOnboarding', targetStepId: top.id },
          { label: 'Open Docs', action: 'openDocs' },
        ],
        mcp: top.mcp,
      };
    }
  }

  // Onboarding step trigger (natural language)
  if (!matchFound) {
    const onboardingMatch = onboardingFlows
      .flatMap(f => f.steps)
      .find(step => input.toLowerCase().includes(step.title.toLowerCase()));
    if (onboardingMatch) {
      onboardingEngine.startFlow(onboardingMatch.id);
      matchFound = true;
      response = {
        type: 'agent',
        content: `Let's walk through "${onboardingMatch.title}".`,
        relatedStepId: onboardingMatch.id,
        suggestedActions: [
          { label: 'Start Walkthrough', action: 'resumeOnboarding' },
        ],
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
        recentActions: context?.recentActions,
        genre: context?.genre,
        genreContext: context?.genreContext,
      });

      response = {
        type: 'agent',
        content: llmResponse.content,
        suggestedActions: llmResponse.suggestedActions || [
          { label: 'Suggest Next Step', action: 'suggestNextStep' },
        ],
        llmFallback: true,
        modelUsed: llmResponse.modelUsed,
      };
    } catch (error) {
      console.error('LLM fallback failed:', error);
      response = {
        type: 'agent',
        content:
          "I'm having trouble processing that request. Could you try rephrasing or ask about a specific feature?",
        suggestedActions: [
          { label: 'Show Help', action: 'showHelp' },
          { label: 'Try Again', action: 'retry' },
        ],
      };
    }
  }

  // Enrich the response with additional context
  return enrichAgentMessage(
    response || {
      type: 'agent',
      content:
        "I'm not sure how to help with that. Try asking about specific features or workflows.",
      suggestedActions: [
        { label: 'Suggest Next Step', action: 'suggestNextStep' },
      ],
    }
  );
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
        description: 'Learn how to detect emotional inconsistencies',
      },
    ],
  },
];
