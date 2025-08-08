// MCP Context Block
/*
role: developer,
tier: Pro,
file: "modules/narrativeDashboard/services/revisionEngine.ts",
allowedActions: ["generate", "revise", "propose"],
theme: "revision_ai"
*/

import type { OptimizationSuggestion } from '../../emotionArc/types/emotionTypes';

export type SceneRevision = {
  revisedText: string;
  changeSummary: string[];
  confidenceScore: number; // 0–1
  appliedSuggestionId: string;
};

// Mock function to fetch original scene text (replace with real store/API)
async function fetchOriginalSceneText(sceneId: string): Promise<string> {
  // TODO: Replace with real fetch
  return `This is the original text of scene ${sceneId}.`;
}

// Helper to build a targeted LLM prompt
function buildRevisionPrompt(
  original: string,
  suggestion: OptimizationSuggestion
): string {
  return `You are an expert fiction editor. Given the following scene and a targeted suggestion, rewrite the scene to address the suggestion while preserving the author's style and intent.\n\n---\nOriginal Scene:\n${original}\n\n---\nSuggestion:\n${suggestion.title}: ${suggestion.description}\nSpecific changes: ${suggestion.specificChanges?.join('; ') || 'No specific changes provided'}\n\nRewrite the scene accordingly. Return only the revised scene text.`;
}

// Main function: proposeEdit
export async function proposeEdit(
  sceneId: string,
  suggestion: OptimizationSuggestion
): Promise<SceneRevision> {
  try {
    const original = await fetchOriginalSceneText(sceneId);
    const prompt = buildRevisionPrompt(original, suggestion);
    // Call LLM endpoint (OpenAI, Claude, or local model)
    const res = await fetch('/api/gpt-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a helpful fiction editor.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1200,
      }),
    });
    if (!res.ok) throw new Error('LLM API error');
    const data = await res.json();
    const revisedText =
      data.choices?.[0]?.message?.content?.trim() || '[No revision produced]';
    // Simple change summary (could be improved with diffing or LLM)
    const changeSummary = [
      `Applied suggestion: ${suggestion.title}`,
      ...(suggestion.specificChanges || []),
    ];
    // Confidence: use LLM logprobs or set a default
    const confidenceScore =
      typeof data.choices?.[0]?.message?.confidence === 'number'
        ? data.choices[0].message.confidence
        : 0.85;
    return {
      revisedText,
      changeSummary,
      confidenceScore,
      appliedSuggestionId: suggestion.id,
    };
  } catch (err) {
    // Fallback: return original with a message
    return {
      revisedText: '[AI revision unavailable. Please try again later.]',
      changeSummary: ['AI service failed or is unavailable.'],
      confidenceScore: 0,
      appliedSuggestionId: suggestion.id,
    };
  }
}
