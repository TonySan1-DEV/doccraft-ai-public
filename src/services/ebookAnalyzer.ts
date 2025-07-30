/**
 * eBook Section Analyzer Service
 * Analyzes text sections to extract metadata using OpenAI GPT-4
 * MCP Actions: summarize, tag, label
 */

/// <reference types="vite/client" />

export interface SectionAnalysis {
  titleSuggestion: string;
  summary: string;
  topics: string[];
  keywords: string[];
  sentiment: "positive" | "neutral" | "negative";
  readingLevel: "beginner" | "intermediate" | "advanced";
}

const OPENAI_PROXY_URL = 'http://localhost:3001/api/openai/chat';

/**
 * Analyzes a text section to extract meaningful metadata
 * @param text - The text section to analyze
 * @returns Promise<SectionAnalysis> - Structured analysis results
 */
export async function analyzeSection(text: string): Promise<SectionAnalysis> {
  try {
    const cleanedText = text.trim();
    if (!cleanedText || cleanedText.length < 10) {
      throw new Error('Text must be at least 10 characters long');
    }

    const truncatedText = cleanedText.length > 4000 
      ? cleanedText.substring(0, 4000) + '...'
      : cleanedText;

    const messages = [
      {
        role: 'system',
        content: `You are an expert eBook analyzer. Analyze the provided text section and return a JSON object with the following structure:
{
  "titleSuggestion": "A clear, descriptive title (3-8 words)",
  "summary": "A concise summary (1-2 sentences)",
  "topics": ["topic1", "topic2", "topic3"],
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4"],
  "sentiment": "positive|neutral|negative",
  "readingLevel": "beginner|intermediate|advanced"
}

Guidelines:
- Title: Be descriptive but concise
- Summary: Capture main points and purpose
- Topics: 3-5 broad themes or subjects
- Keywords: 3-5 specific terms for search/discovery
- Sentiment: Overall tone (positive/neutral/negative)
- Reading Level: Based on vocabulary and complexity

Return ONLY the JSON object, no additional text.`
      },
      {
        role: 'user',
        content: `Analyze this text section:\n\n${truncatedText}`
      }
    ];

    const response = await fetch(OPENAI_PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4',
        messages,
        max_tokens: 500,
        temperature: 0.3
      })
    });

    if (!response.ok) throw new Error(`OpenAI proxy error: ${response.status} ${response.statusText}`);

    const data = await response.json();
    const content = data.choices[0]?.message?.content?.trim();

    if (!content) throw new Error('No analysis content received from OpenAI');

    // Parse the JSON response
    const analysis = parseAnalysisResponse(content);

    // Validate and sanitize the analysis
    return validateAndSanitizeAnalysis(analysis);

  } catch (error) {
    console.error('Error analyzing section:', error);
    return getFallbackAnalysis(text);
  }
}

/**
 * Parses the OpenAI response into a SectionAnalysis object
 * @param content - Raw response content from OpenAI
 * @returns SectionAnalysis object
 */
function parseAnalysisResponse(content: string): SectionAnalysis {
  try {
    // Extract JSON from the response (handle cases where there's extra text)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    return {
      titleSuggestion: parsed.titleSuggestion || 'Untitled Section',
      summary: parsed.summary || 'No summary available',
      topics: Array.isArray(parsed.topics) ? parsed.topics : [],
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
      sentiment: parsed.sentiment || 'neutral',
      readingLevel: parsed.readingLevel || 'intermediate'
    };
  } catch (error) {
    console.error('Error parsing analysis response:', error);
    throw new Error('Failed to parse analysis response');
  }
}

/**
 * Validates and sanitizes the analysis results
 * @param analysis - Raw analysis object
 * @returns Validated SectionAnalysis
 */
function validateAndSanitizeAnalysis(analysis: SectionAnalysis): SectionAnalysis {
  return {
    titleSuggestion: analysis.titleSuggestion?.trim() || 'Untitled Section',
    summary: analysis.summary?.trim() || 'No summary available',
    topics: analysis.topics?.filter(topic => typeof topic === 'string' && topic.trim().length > 0) || [],
    keywords: analysis.keywords?.filter(keyword => typeof keyword === 'string' && keyword.trim().length > 0) || [],
    sentiment: ['positive', 'neutral', 'negative'].includes(analysis.sentiment) ? analysis.sentiment : 'neutral',
    readingLevel: ['beginner', 'intermediate', 'advanced'].includes(analysis.readingLevel) ? analysis.readingLevel : 'intermediate'
  };
}

/**
 * Provides fallback analysis when API is unavailable
 * @param text - The text to analyze
 * @returns SectionAnalysis with basic fallback values
 */
function getFallbackAnalysis(text: string): SectionAnalysis {
  const wordCount = text.split(/\s+/).length;
  const charCount = text.length;
  
  // Basic sentiment analysis based on positive/negative words
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'positive', 'success', 'happy'];
  const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'negative', 'failure', 'sad', 'problem'];
  
  const textLower = text.toLowerCase();
  const positiveCount = positiveWords.filter(word => textLower.includes(word)).length;
  const negativeCount = negativeWords.filter(word => textLower.includes(word)).length;
  
  let sentiment: "positive" | "neutral" | "negative" = "neutral";
  if (positiveCount > negativeCount) sentiment = "positive";
  else if (negativeCount > positiveCount) sentiment = "negative";
  
  // Estimate reading level based on text length and complexity
  let readingLevel: "beginner" | "intermediate" | "advanced" = "intermediate";
  if (wordCount < 50 || charCount < 300) readingLevel = "beginner";
  else if (wordCount > 200 || charCount > 1500) readingLevel = "advanced";
  
  // Extract basic topics from common words
  const commonTopics = ['technology', 'business', 'health', 'education', 'science', 'art', 'history', 'politics'];
  const topics = commonTopics.filter(topic => textLower.includes(topic)).slice(0, 3);
  
  // Generate basic keywords
  const words = text.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
  const wordFreq: Record<string, number> = {};
  words.forEach(word => {
    if (word.length > 3) wordFreq[word] = (wordFreq[word] || 0) + 1;
  });
  
  const keywords = Object.entries(wordFreq)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 4)
    .map(([word]) => word);

  return {
    titleSuggestion: `Section (${wordCount} words)`,
    summary: `This section contains ${wordCount} words covering various topics.`,
    topics: topics.length > 0 ? topics : ['general'],
    keywords: keywords.length > 0 ? keywords : ['content', 'information'],
    sentiment,
    readingLevel
  };
}

/**
 * Analyzes multiple sections in batch
 * @param sections - Array of text sections to analyze
 * @returns Promise<SectionAnalysis[]> - Array of analysis results
 */
export async function analyzeSections(sections: string[]): Promise<SectionAnalysis[]> {
  const analyses: SectionAnalysis[] = [];
  
  for (const section of sections) {
    try {
      const analysis = await analyzeSection(section);
      analyses.push(analysis);
    } catch (error) {
      console.error('Error analyzing section:', error);
      analyses.push(getFallbackAnalysis(section));
    }
  }
  
  return analyses;
}

/**
 * Gets a human-readable description of the analysis
 * @param analysis - The section analysis
 * @returns Formatted description string
 */
export function getAnalysisDescription(analysis: SectionAnalysis): string {
  return `"${analysis.titleSuggestion}" - ${analysis.summary} (${analysis.readingLevel} level, ${analysis.sentiment} sentiment)`;
} 