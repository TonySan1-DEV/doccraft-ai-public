import { AuditLogger } from '../lib/audit/auditLogger';
import { MCPContext, AuditDetails } from '../types/domain';

const OPENAI_PROXY_URL = 'http://localhost:3001/api/openai/chat';

const actionPrompts = {
  rewrite:
    'Rewrite the following text clearly and concisely while maintaining the original meaning and tone:',
  summarize: 'Summarize the following text in a clear and concise manner:',
  suggest:
    'Give specific suggestions to improve the following text, focusing on clarity, structure, and effectiveness:',
};

export async function runAIAction(
  action: 'rewrite' | 'summarize' | 'suggest',
  text: string,
  userId: string,
  mcpContext: MCPContext
): Promise<string> {
  try {
    if (!text.trim()) return '';

    const prompt = `${actionPrompts[action]}\n\n${text}`;

    const response = await fetch(OPENAI_PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful writing assistant that provides clear, concise, and actionable feedback. Always respond with the improved or processed text directly, without additional explanations unless specifically requested.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) throw new Error('OpenAI proxy error');

    const completion = await response.json();
    const result = completion.choices[0]?.message?.content || '';

    // Log audit event for AI usage
    await AuditLogger.logAuditEvent({
      userId,
      action: `ai_${action}`,
      resource: 'ai_helper',
      details: {
        resourceType: 'ai_helper',
        parameters: {
          action,
          inputLength: text.length,
          outputLength: result.length,
          model: 'gpt-4',
          tokens: completion.usage?.total_tokens || 0,
        },
      } as AuditDetails,
      mcpContext,
    });

    return result;
  } catch (error) {
    console.error('AI helper service error:', error);

    // Log audit event for failed AI usage
    await AuditLogger.logAuditEvent({
      userId,
      action: `ai_${action}_failed`,
      resource: 'ai_helper',
      details: {
        resourceType: 'ai_helper',
        error: {
          code: 'AI_HELPER_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
        },
        parameters: {
          action,
          inputLength: text.length,
        },
      } as AuditDetails,
      mcpContext,
    });

    // Return original text on error to avoid breaking user experience
    return text;
  }
}
