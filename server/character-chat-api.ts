// MCP Context Block
/*
{
  file: "character-chat-api.ts",
  role: "developer",
  allowedActions: ["process", "simulate", "respond"],
  tier: "Pro",
  contentSensitivity: "medium",
  theme: "character_development"
}
*/

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.CHARACTER_CHAT_PORT || 3002;

app.use(cors());
app.use(express.json());

interface CharacterChatRequest {
  message: string;
  character: {
    name: string;
    archetype: string;
    personality: string;
    goals: string;
    voiceStyle: string;
    worldview: string;
    backstory?: string;
    knownConnections?: Array<{
      name: string;
      relationship: string;
      description?: string;
    }>;
  };
  context?: string;
  conversationHistory?: Array<{
    sender: 'user' | 'character';
    content: string;
    timestamp: string;
  }>;
}

interface CharacterChatResponse {
  response: string;
  emotion: string;
  intensity: number;
  context: string;
  timestamp: string;
}

// Character chat endpoint
app.post('/api/character-chat', async (req, res) => {
  try {
    const {
      message,
      character,
      context = '',
      conversationHistory = [],
    }: CharacterChatRequest = req.body;

    if (!message || !character) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Build system prompt for character role-playing
    const systemPrompt = `
You are role-playing as ${character.name}, a fictional character with the following profile:

PERSONALITY: ${character.personality}
ARCHETYPE: ${character.archetype}
GOALS: ${character.goals}
VOICE STYLE: ${character.voiceStyle}
WORLDVIEW: ${character.worldview}
${character.backstory ? `BACKSTORY: ${character.backstory}` : ''}

KNOWN CONNECTIONS:
${character.knownConnections?.map(conn => `- ${conn.relationship} of ${conn.name}${conn.description ? ` (${conn.description})` : ''}`).join('\n') || 'None specified'}

CONTEXT: ${context}

CONVERSATION HISTORY:
${conversationHistory
  .slice(-5)
  .map(
    msg => `${msg.sender === 'user' ? 'User' : character.name}: ${msg.content}`
  )
  .join('\n')}

Respond as ${character.name} would, maintaining their personality, speaking style, and worldview. Stay in character at all times. Keep responses natural and conversational, not overly formal. Respond in a way that feels authentic to this character.
`;

    // Call OpenAI API
    const openaiResponse = await fetch(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message },
          ],
          temperature: 0.8,
          max_tokens: 300,
          presence_penalty: 0.1,
          frequency_penalty: 0.1,
        }),
      }
    );

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json();
    const characterResponse =
      openaiData.choices?.[0]?.message?.content?.trim() ||
      `${character.name} seems lost in thought...`;

    // Simple emotion analysis
    const emotion = analyzeEmotion(characterResponse);
    const intensity = analyzeIntensity(characterResponse);

    const response: CharacterChatResponse = {
      response: characterResponse,
      emotion,
      intensity,
      context,
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Character chat error:', error);
    res.status(500).json({
      error: 'Failed to generate character response',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'character-chat-api' });
});

// Simple emotion analysis
function analyzeEmotion(text: string): string {
  const emotionKeywords = {
    joy: [
      'happy',
      'excited',
      'thrilled',
      'delighted',
      'joyful',
      'great',
      'wonderful',
      'amazing',
    ],
    anger: [
      'angry',
      'furious',
      'mad',
      'irritated',
      'frustrated',
      'upset',
      'annoyed',
    ],
    sadness: [
      'sad',
      'depressed',
      'melancholy',
      'sorrowful',
      'grief',
      'disappointed',
      'heartbroken',
    ],
    fear: [
      'afraid',
      'scared',
      'terrified',
      'anxious',
      'worried',
      'nervous',
      'frightened',
    ],
    surprise: [
      'surprised',
      'shocked',
      'amazed',
      'astonished',
      'stunned',
      'wow',
    ],
    disgust: ['disgusted', 'repulsed', 'revolted', 'appalled', 'gross'],
    trust: ['trusting', 'confident', 'assured', 'certain', 'sure', 'believe'],
    anticipation: [
      'eager',
      'hopeful',
      'optimistic',
      'expectant',
      'looking forward',
    ],
  };

  const lowerText = text.toLowerCase();

  for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      return emotion;
    }
  }

  return 'neutral';
}

// Simple intensity analysis
function analyzeIntensity(text: string): number {
  const intensityIndicators = {
    high: [
      '!',
      'very',
      'extremely',
      'absolutely',
      'completely',
      'totally',
      'really',
    ],
    medium: ['quite', 'rather', 'somewhat', 'fairly', 'pretty'],
    low: ['slightly', 'a bit', 'kind of', 'sort of', 'maybe'],
  };

  const lowerText = text.toLowerCase();
  const exclamationCount = (text.match(/!/g) || []).length;
  const capsCount = (text.match(/[A-Z]/g) || []).length;

  if (
    exclamationCount > 2 ||
    capsCount > text.length * 0.1 ||
    intensityIndicators.high.some(indicator => lowerText.includes(indicator))
  ) {
    return 0.8;
  } else if (
    intensityIndicators.medium.some(indicator => lowerText.includes(indicator))
  ) {
    return 0.6;
  } else if (
    intensityIndicators.low.some(indicator => lowerText.includes(indicator))
  ) {
    return 0.4;
  }

  return 0.5;
}

// Start server
app.listen(PORT, () => {
  console.log(`Character Chat API server running on port ${PORT}`);
});

export default app;
