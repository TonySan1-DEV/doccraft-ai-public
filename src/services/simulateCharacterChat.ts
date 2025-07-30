// MCP Context Block
/*
{
  file: "simulateCharacterChat.ts",
  role: "actor",
  allowedActions: ["simulate", "respond", "character"],
  tier: "Pro",
  contentSensitivity: "medium",
  theme: "persona"
}
*/

import { CharacterPersona } from '../types/CharacterPersona';

export interface StoryContext {
  summary?: string;
  recentEvents?: string[];
  [key: string]: any;
}

export interface CharacterChatMessage {
  sender: 'user' | 'character';
  text: string;
  timestamp: number;
}

// Simulate a character-voiced reply using GPT-4
export async function simulateCharacterChat(
  input: string,
  persona: CharacterPersona,
  context?: StoryContext,
  history?: CharacterChatMessage[]
): Promise<string> {
  // Compose system prompt
  const systemPrompt = `
You are role-playing as ${persona.name}, a fictional character in a story.
Your role and personality are defined as follows:
- Archetype: ${persona.archetype}
- Personality: ${persona.personality}
- Speaking Style: ${persona.voiceStyle}
- Known connections: ${persona.knownConnections.map(c => `${c.relationship} of ${c.name}${c.description ? ` (${c.description})` : ''}`).join('; ')}
- Motivations: ${persona.goals}
${persona.backstory ? `- Backstory: ${persona.backstory}` : ''}
Never break character. Respond only as this persona would, even under pressure.
${context?.summary ? `Story so far: ${context.summary}` : ''}
`;

  const userPrompt = `
The author says: "${input}"
(Your reply should align with your speaking style and worldview.)
`;

  // Optionally, include recent chat history for memory
  let messages = [
    { role: 'system', content: systemPrompt },
    ...(history?.slice(-5).map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text
    })) || []),
    { role: 'user', content: userPrompt }
  ];

  try {
    // Call OpenAI proxy endpoint (replace with your actual endpoint)
    const res = await fetch('/api/gpt-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4',
        messages,
        temperature: 0.85,
        max_tokens: 300
      })
    });
    if (!res.ok) throw new Error('LLM API error');
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || '[No reply]';
  } catch (err) {
    // Fallback: return a generic in-character message
    return `(${persona.name} seems momentarily lost in thought, but soon regains composure.) "I apologize, could you repeat that?"`;
  }
}