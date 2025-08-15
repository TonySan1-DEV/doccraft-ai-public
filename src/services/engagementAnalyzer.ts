import { EngagementAnalysis } from '../types/EngagementAnalysis';
import { WriterProfile } from '../types/WriterProfile';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function analyzeEngagement(
  content: string,
  genre?: string,
  profile?: WriterProfile
): Promise<EngagementAnalysis> {
  if (!content || content.trim().length < 10) {
    return {
      engagementScore: 0,
      confidence: 0,
      summary: 'Not enough content to analyze.',
      tags: ['Too Short'],
      recommendations: ['Add more content for analysis.'],
    };
  }

  // Construct prompt
  const messages: Array<{ role: 'system' | 'user'; content: string }> = [
    {
      role: 'system',
      content:
        'You are a literary engagement analyst. Return structured JSON feedback on how engaging a piece of writing is.',
    },
    {
      role: 'user',
      content: `GENRE: ${genre || 'Unknown'}\n\nPROFILE:\n- Sentence Length: ${profile?.preferred_sentence_length ?? 'N/A'}\n- Vocabulary: ${profile?.vocabulary_complexity ?? 'N/A'}\n- Pacing: ${profile?.pacing_style ?? 'N/A'}\n- Specializations: ${(profile?.genre_specializations ?? []).join(', ') || 'N/A'}\n\nTEXT:\n"""\n${content}\n"""\n\nReturn a JSON object matching:\n{\n  engagementScore: number (0.0-1.0),\n  confidence: number (0.0-1.0),\n  summary: string,\n  tags: string[],\n  recommendations: string[],\n  matchedTrends?: string[]\n}`,
    },
  ];

  try {
    // Use GPT-4 via backend proxy or OpenAI SDK
    let response;
    if (typeof fetch !== 'undefined' && !OPENAI_API_KEY) {
      // Use backend proxy (browser)
      response = await fetch('http://localhost:3001/api/openai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4',
          messages,
          max_tokens: 500,
          temperature: 0.5,
        }),
      });
      if (!response.ok) throw new Error('Proxy API error');
      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || '';
      return parseEngagementJSON(text);
    } else if (OPENAI_API_KEY) {
      // Use OpenAI SDK (Node.js)

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { OpenAI } = await import('openai');
      const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages,
        max_tokens: 500,
        temperature: 0.5,
      });
      const text = completion.choices?.[0]?.message?.content || '';
      return parseEngagementJSON(text);
    } else {
      throw new Error('No OpenAI API key or proxy available');
    }
  } catch (err) {
    console.warn(
      '[EngagementAnalyzer] GPT-4 call failed:',
      (err as any)?.message || err
    );
    // Fallback response
    return {
      engagementScore: 0.5,
      confidence: 0.5,
      summary: 'Could not analyze engagement (AI service unavailable).',
      tags: ['AI Fallback'],
      recommendations: ['Try again later or check your connection.'],
    };
  }
}

function parseEngagementJSON(text: string): EngagementAnalysis {
  try {
    // Find first JSON object in the text
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('No JSON found in GPT response');
    const obj = JSON.parse(match[0]);
    // Validate and coerce fields
    return {
      engagementScore:
        typeof obj.engagementScore === 'number'
          ? Math.max(0, Math.min(1, obj.engagementScore))
          : 0.5,
      confidence:
        typeof obj.confidence === 'number'
          ? Math.max(0, Math.min(1, obj.confidence))
          : 0.5,
      summary: typeof obj.summary === 'string' ? obj.summary : '',
      tags: Array.isArray(obj.tags) ? obj.tags.map(String) : [],
      recommendations: Array.isArray(obj.recommendations)
        ? obj.recommendations.map(String)
        : [],
      matchedTrends: Array.isArray(obj.matchedTrends)
        ? obj.matchedTrends.map(String)
        : undefined,
    };
  } catch (err) {
    console.warn(
      '[EngagementAnalyzer] Failed to parse GPT response:',
      (err as any)?.message || err
    );
    return {
      engagementScore: 0.5,
      confidence: 0.5,
      summary: 'Could not parse AI response.',
      tags: ['Parse Error'],
      recommendations: ['Try again later or check your input.'],
    };
  }
}
