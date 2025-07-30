/**
 * Image Suggester Service
 * Uses OpenAI to generate descriptive query strings for image content
 * MCP Actions: generate, rank
 */

/// <reference types="vite/client" />

const OPENAI_PROXY_URL = 'http://localhost:3001/api/openai/chat';

export async function suggestImageQuery(text: string): Promise<string> {
  try {
    const cleanedText = text.trim().substring(0, 1000);

    const messages = [
      {
        role: 'system',
        content: `You are an expert at creating image search queries. 
        Given a piece of text, generate a concise, descriptive query (2-5 words) 
        that would find the most relevant image to illustrate the content.
        Focus on visual elements, mood, and key concepts.
        Return only the query string, nothing else.`
      },
      {
        role: 'user',
        content: `Generate an image search query for this text: "${cleanedText}"`
      }
    ];

    const response = await fetch(OPENAI_PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages,
        max_tokens: 50,
        temperature: 0.7
      })
    });

    if (!response.ok) throw new Error(`OpenAI proxy error: ${response.status} ${response.statusText}`);

    const data = await response.json();
    const query = data.choices[0]?.message?.content?.trim();

    if (!query) throw new Error('No query generated from OpenAI');

    return query;
  } catch (error) {
    console.error('Error generating image query:', error);
    throw new Error(`Failed to generate image query: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 