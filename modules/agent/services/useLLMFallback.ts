// MCP Context Block
/*
role: ai-engineer,
tier: Pro,
file: "modules/agent/services/useLLMFallback.ts",
allowedActions: ["integrate", "fallback", "query"],
theme: "agent_llm"
*/

interface LLMContext {
  userRole: string;
  tier: string;
  activeModule?: string;
  currentWorkflow?: string;
  recentActions?: string[];
}

interface LLMResponse {
  content: string;
  suggestedActions?: { label: string; action: string; targetStepId?: string }[];
  modelUsed: string;
}

// Rate limiting: 1 request per second per user
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_MS = 1000;

// Sanitize markdown to prevent XSS
function sanitizeMarkdown(content: string): string {
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

// Extract suggested actions from LLM response
function extractSuggestedActions(content: string): { content: string; suggestedActions: { label: string; action: string }[] } {
  const suggestedActions: { label: string; action: string }[] = [];
  
  // Look for button patterns like [Button Text] or [Action]
  const buttonRegex = /\[([^\]]+)\]/g;
  let match;
  let cleanedContent = content;
  
  while ((match = buttonRegex.exec(content)) !== null) {
    const buttonText = match[1];
    if (buttonText.length > 0 && buttonText.length < 50) { // Sanity check
      suggestedActions.push({
        label: buttonText,
        action: buttonText.toLowerCase().replace(/\s+/g, '_')
      });
    }
  }
  
  // Remove button syntax from content
  cleanedContent = content.replace(buttonRegex, '');
  
  return {
    content: cleanedContent.trim(),
    suggestedActions: suggestedActions.slice(0, 3) // Limit to 3 actions
  };
}

// Check if user has permission for suggested actions
function validateSuggestedActions(actions: { label: string; action: string }[], userTier: string): { label: string; action: string }[] {
  const tierRestrictedActions = ['exportJSON', 'exportMarkdown', 'advancedAnalytics', 'systemSettings'];
  
  return actions.filter(action => {
    if (tierRestrictedActions.includes(action.action) && userTier !== 'Admin') {
      return false;
    }
    return true;
  });
}

export async function queryLLMFallback(
  userQuery: string,
  context: LLMContext
): Promise<LLMResponse> {
  // Rate limiting check
  const userKey = `${context.userRole}-${context.tier}`;
  const now = Date.now();
  const lastRequest = rateLimitMap.get(userKey);
  
  if (lastRequest && (now - lastRequest) < RATE_LIMIT_MS) {
    throw new Error('Rate limit exceeded. Please wait a moment before trying again.');
  }
  
  rateLimitMap.set(userKey, now);

  // Build context-aware prompt
  const prompt = buildLLMPrompt(userQuery, context);
  
  try {
    // Try GPT-4 first, fallback to Claude-3, then local stub
    let response: LLMResponse;
    
    try {
      response = await queryGPT4(prompt, context);
    } catch (gptError) {
      console.warn('GPT-4 failed, trying Claude-3:', gptError);
      try {
        response = await queryClaude3(prompt, context);
      } catch (claudeError) {
        console.warn('Claude-3 failed, using local stub:', claudeError);
        response = await queryLocalStub(prompt, context);
      }
    }

    // Sanitize and process response
    const sanitizedContent = sanitizeMarkdown(response.content);
    const { content, suggestedActions } = extractSuggestedActions(sanitizedContent);
    const validatedActions = validateSuggestedActions(suggestedActions, context.tier);

    // Log metadata for debugging (no PII)
    console.log('LLM Fallback Query:', {
      queryLength: userQuery.length,
      userRole: context.userRole,
      tier: context.tier,
      activeModule: context.activeModule,
      modelUsed: response.modelUsed,
      responseLength: content.length,
      actionCount: validatedActions.length,
      timestamp: new Date().toISOString()
    });

    return {
      content,
      suggestedActions: validatedActions,
      modelUsed: response.modelUsed
    };

  } catch (error) {
    console.error('LLM fallback failed:', error);
    throw new Error('Unable to process your request. Please try again later.');
  }
}

function buildLLMPrompt(userQuery: string, context: LLMContext): string {
  const recentActionsText = context.recentActions?.length 
    ? `Recent actions: ${context.recentActions.slice(-3).join(', ')}`
    : '';

  return `You are DocCraft Agent, the in-app assistant for a professional writing intelligence platform.

User context:
- Role: ${context.userRole}
- Tier: ${context.tier}
- Current module: ${context.activeModule || 'General'}
- Current workflow: ${context.currentWorkflow || 'None'}
${recentActionsText ? `- ${recentActionsText}` : ''}

Query: "${userQuery}"

Your job is to guide, explain, or trigger actions using in-product concepts and workflows.
Always return structured markdown with optional button suggestions.

Available features:
- Narrative Calibration Dashboard
- Theme Analysis & Conflict Detection
- Style Profile Analysis
- Smart Revision Engine
- Export capabilities (JSON, Markdown, CSV)
- Onboarding flows for different modules

Respond in a helpful, professional tone. If suggesting actions, use button syntax like [Show Me] or [Run Analysis].
Keep responses concise but informative.`;
}

async function queryGPT4(prompt: string, context: LLMContext): Promise<LLMResponse> {
  const response = await fetch('/api/gpt-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are DocCraft Agent, a helpful writing assistant.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 500
    })
  });

  if (!response.ok) {
    throw new Error(`GPT-4 API error: ${response.status}`);
  }

  const data = await response.json();
  return {
    content: data.choices?.[0]?.message?.content || 'No response from GPT-4',
    modelUsed: 'gpt-4'
  };
}

async function queryClaude3(prompt: string, context: LLMContext): Promise<LLMResponse> {
  const response = await fetch('/api/claude-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-3-sonnet-20240229',
      messages: [
        { role: 'user', content: prompt }
      ],
      max_tokens: 500
    })
  });

  if (!response.ok) {
    throw new Error(`Claude-3 API error: ${response.status}`);
  }

  const data = await response.json();
  return {
    content: data.content?.[0]?.text || 'No response from Claude-3',
    modelUsed: 'claude-3-sonnet'
  };
}

async function queryLocalStub(prompt: string, context: LLMContext): Promise<LLMResponse> {
  // Local stub for development/testing
  const responses = [
    {
      content: `Based on your query about "${prompt.split('Query: "')[1]?.split('"')[0] || 'writing'}", here are some suggestions:

1. **Check the Narrative Dashboard** for overall story alignment
2. **Use Theme Analysis** to identify conflicts and gaps
3. **Review Style Profile** for consistency issues

Would you like me to help you with any of these areas?

[Show Dashboard] [Run Analysis] [Check Style]`,
      modelUsed: 'local-stub'
    },
    {
      content: `I can help you with that! Based on your ${context.tier} tier access, you have several options:

- **Smart Revision Engine** for AI-assisted editing
- **Theme Conflict Detection** for narrative consistency
- **Export Features** for sharing your analysis

What would you like to explore first?

[Start Revision] [Check Themes] [Export Data]`,
      modelUsed: 'local-stub'
    }
  ];

  // Return a random response for variety
  return responses[Math.floor(Math.random() * responses.length)];
} 