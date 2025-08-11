// MCP Context Block
/*
{
  file: "simulateSceneDialog.ts",
  role: "scene_simulator",
  allowedActions: ["dialogue", "simulate"],
  tier: "Pro",
  contentSensitivity: "medium",
  theme: "character_interaction"
}
*/

import { SceneConfig } from '../types/SceneConfig';

export interface SceneMessage {
  speakerName: string;
  text: string;
  memoryImpact?: Record<string, any>;
  timestamp?: number;
}

// Simulate the next message in a multi-character scene
export async function simulateSceneDialog(
  scene: SceneConfig,
  lastMessages: SceneMessage[]
): Promise<SceneMessage> {
  // Compose system prompt for GPT-4
  const participantSummaries = scene.participants
    .map(
      p =>
        `- ${p.name}: ${p.archetype}, ${p.personality}, ${p.voiceStyle}, ${p.worldview}`
    )
    .join('\n');
  const history = lastMessages
    .map(m => `${m.speakerName}: ${m.text}`)
    .join('\n');
  const systemPrompt = `
You are simulating a scene with multiple fictional characters. Each character has a distinct voice, personality, and memory. Never break character. Only output the next line of dialog for the most contextually appropriate character.

Scene: ${scene.title}\nSetting: ${scene.setting}\nTone: ${scene.tone || 'default'}\nObjective: ${scene.objective || 'N/A'}
Participants:\n${participantSummaries}

Conversation so far:\n${history}
`;

  const userPrompt = `Continue the scene. Output the next line of dialog as the character who would naturally speak next. Format: {speakerName}: {text}`;

  try {
    const res = await fetch('/api/gpt-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.9,
        max_tokens: 200,
      }),
    });
    if (!res.ok) throw new Error('LLM API error');
    const data = await res.json();
    // Parse response: expect format "Speaker: text"
    const content = data.choices?.[0]?.message?.content?.trim() || '';
    const match = content.match(/^([\w\s]+):\s*(.+)$/);
    if (match) {
      return {
        speakerName: match[1].trim(),
        text: match[2].trim(),
        timestamp: Date.now(),
      };
    } else {
      // Fallback: assign to first participant
      return {
        speakerName: scene.participants[0]?.name || 'Unknown',
        text: content || '[No reply]',
        timestamp: Date.now(),
      };
    }
  } catch (_err) {
    // Fallback: generic message
    return {
      speakerName: scene.participants[0]?.name || 'Unknown',
      text: '(The scene pauses as the AI is momentarily lost in thought.)',
      timestamp: Date.now(),
    };
  }
}
