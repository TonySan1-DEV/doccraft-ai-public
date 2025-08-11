export const mcpContext = {
  file: 'modules/narrativeDashboard/services/revisionEngine.ts',
  role: 'developer',
  allowedActions: ['refactor', 'type-harden', 'test'],
  contentSensitivity: 'low',
  theme: 'doccraft-ai',
};

import type { OptimizationSuggestion } from '../../emotionArc/types/emotionTypes';
import { clamp01 } from '../../emotionArc/utils/scaling';

export interface SceneRevision {
  revisedText: string;
  changeSummary: string[];
  confidenceScore: number; // 0–1, clamped and validated
  appliedSuggestionId: string;
  timestamp: number; // Unix timestamp
  originalText?: string; // Optional original text for comparison
}

// Mock function to fetch original scene text (replace with real store/API)
async function fetchOriginalSceneText(sceneId: string): Promise<string> {
  if (!sceneId) return '';
  // TODO: Replace with real fetch
  return `This is the original text of scene ${sceneId}.`;
}

// Helper to build a targeted LLM prompt
function buildRevisionPrompt(
  original: string,
  suggestion: OptimizationSuggestion
): string {
  if (!original || !suggestion) {
    return 'Invalid input for revision prompt.';
  }

  const specificChanges = Array.isArray(suggestion.specificChanges)
    ? suggestion.specificChanges.join('; ')
    : 'No specific changes provided';

  return `You are an expert fiction editor. Given the following scene and a targeted suggestion, rewrite the scene to address the suggestion while preserving the author's style and intent.\n\n---\nOriginal Scene:\n${original}\n\n---\nSuggestion:\n${suggestion.title ?? 'Unknown'}: ${suggestion.description ?? 'No description provided'}\nSpecific changes: ${specificChanges}\n\nRewrite the scene accordingly. Return only the revised scene text.`;
}

// Main function: proposeEdit
export async function proposeEdit(
  sceneId: string,
  suggestion: OptimizationSuggestion
): Promise<SceneRevision> {
  if (!sceneId || !suggestion) {
    throw new Error('Invalid sceneId or suggestion provided');
  }

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
      `Applied suggestion: ${suggestion.title ?? 'Unknown'}`,
      ...(Array.isArray(suggestion.specificChanges)
        ? suggestion.specificChanges
        : []),
    ];
    // Confidence: use LLM logprobs or set a default
    const confidenceScore = clamp01(
      typeof data.choices?.[0]?.message?.confidence === 'number'
        ? data.choices[0].message.confidence
        : 0.85
    );
    return {
      revisedText,
      changeSummary,
      confidenceScore,
      appliedSuggestionId: suggestion.id ?? `suggestion-${Date.now()}`,
      timestamp: Date.now(),
      originalText: original,
    };
  } catch {
    // Fallback: return original with a message
    const original = await fetchOriginalSceneText(sceneId);
    return {
      revisedText: '[AI revision unavailable. Please try again later.]',
      changeSummary: ['AI service failed or is unavailable.'],
      confidenceScore: 0,
      appliedSuggestionId: suggestion.id ?? `suggestion-${Date.now()}`,
      timestamp: Date.now(),
      originalText: original,
    };
  }
}
