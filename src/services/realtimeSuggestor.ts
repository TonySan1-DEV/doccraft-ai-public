import { Suggestion, SuggestionRequest, SuggestionResponse, SuggestionContext } from '../types/Suggestion';
import { WriterProfile } from '../types/WriterProfile';

export async function getSuggestions(
  input: string, 
  profile: WriterProfile, 
  context?: SuggestionContext,
  topMisalignments?: string[]
): Promise<SuggestionResponse> {
  try {
    if (!input.trim()) {
      return {
        suggestions: [],
        summary: {
          totalSuggestions: 0,
          criticalCount: 0,
          warningCount: 0,
          infoCount: 0,
          overallScore: 0
        },
        metadata: {
          processingTime: 0,
          modelUsed: 'gpt-4',
          confidence: 0
        }
      };
    }

    const startTime = Date.now();
    let promptText = input;
    if (topMisalignments && topMisalignments.length > 0) {
      promptText += `\n\nYour outline misses popular genre trends such as: ${topMisalignments.join(', ')}. Would you like suggestions to align better?`;
    }
    const request: SuggestionRequest = {
      text: promptText,
      context: context || {
        text: input,
        documentType: 'chapter'
      },
      profile: {
        preferred_sentence_length: profile.preferred_sentence_length,
        vocabulary_complexity: profile.vocabulary_complexity,
        pacing_style: profile.pacing_style,
        genre_specializations: profile.genre_specializations
      }
    };

    const response = await fetch('http://localhost:3001/api/suggestions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data: SuggestionResponse = await response.json();
    const processingTime = Date.now() - startTime;

    return {
      ...data,
      metadata: {
        ...data.metadata,
        processingTime
      }
    };

  } catch (error) {
    console.error('Error getting suggestions:', error);
    // Fallback to local suggestion generation
    return generateFallbackSuggestions(input, profile, context);
  }
}

function generateFallbackSuggestions(
  input: string, 
  profile: WriterProfile, 
  context?: SuggestionContext
): SuggestionResponse {
  const suggestions: Suggestion[] = [];
  
  // Analyze sentence length
  const sentences = input.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgSentenceLength = sentences.reduce((sum, sentence) => 
    sum + sentence.split(' ').length, 0) / sentences.length;

  if (avgSentenceLength > profile.preferred_sentence_length + 5) {
    suggestions.push({
      id: `fallback-${Date.now()}-1`,
      type: 'pacing',
      comment: `Consider breaking this into shorter sentences. Your preferred length is ${profile.preferred_sentence_length} words.`,
      severity: 'warning',
      confidence: 0.7,
      category: 'sentence-structure',
      reasoning: `Average sentence length (${Math.round(avgSentenceLength)} words) exceeds your preference (${profile.preferred_sentence_length} words)`,
      basedOnPatterns: ['sentence_length_preference']
    });
  }

  // Analyze vocabulary complexity
  const complexWords = input.match(/\b\w{10,}\b/g) || [];
  if (complexWords.length > 3 && profile.vocabulary_complexity === 'simple') {
    suggestions.push({
      id: `fallback-${Date.now()}-2`,
      type: 'style',
      comment: 'Consider using simpler vocabulary to match your preferred style.',
      severity: 'info',
      confidence: 0.6,
      category: 'vocabulary',
      reasoning: `Found ${complexWords.length} complex words while your preference is simple vocabulary`,
      basedOnPatterns: ['vocabulary_complexity']
    });
  }

  // Analyze pacing
  const actionWords = input.match(/\b(run|jump|move|quick|fast|rapid|sudden)\b/gi) || [];
  if (actionWords.length > 2 && profile.pacing_style === 'contemplative') {
    suggestions.push({
      id: `fallback-${Date.now()}-3`,
      type: 'pacing',
      comment: 'Consider slowing the pace to match your contemplative writing style.',
      severity: 'info',
      confidence: 0.5,
      category: 'pacing',
      reasoning: `High action word count (${actionWords.length}) doesn't match contemplative style`,
      basedOnPatterns: ['pacing_style']
    });
  }

  // Genre-specific suggestions
  if (context?.genre && profile.genre_specializations.includes(context.genre)) {
    suggestions.push({
      id: `fallback-${Date.now()}-4`,
      type: 'style',
      comment: `This aligns well with your ${context.genre} expertise.`,
      severity: 'info',
      confidence: 0.8,
      category: 'genre-alignment',
      reasoning: `Content matches your specialized genre: ${context.genre}`,
      basedOnPatterns: ['genre_specializations']
    });
  }

  const criticalCount = suggestions.filter(s => s.severity === 'critical').length;
  const warningCount = suggestions.filter(s => s.severity === 'warning').length;
  const infoCount = suggestions.filter(s => s.severity === 'info').length;

  return {
    suggestions,
    summary: {
      totalSuggestions: suggestions.length,
      criticalCount,
      warningCount,
      infoCount,
      overallScore: suggestions.length > 0 ? 0.7 : 0.9
    },
    metadata: {
      processingTime: 50,
      modelUsed: 'fallback-analyzer',
      confidence: 0.6
    }
  };
}

export async function applySuggestion(
  originalText: string, 
  suggestion: Suggestion
): Promise<string> {
  if (!suggestion.suggestedText) {
    return originalText;
  }

  if (suggestion.start !== undefined && suggestion.end !== undefined) {
    return (
      originalText.substring(0, suggestion.start) +
      suggestion.suggestedText +
      originalText.substring(suggestion.end)
    );
  }

  return suggestion.suggestedText;
}

export function filterSuggestions(
  suggestions: Suggestion[], 
  filter: {
    types?: string[];
    severity?: string[];
    minConfidence?: number;
  }
): Suggestion[] {
  return suggestions.filter(suggestion => {
    if (filter.types && !filter.types.includes(suggestion.type)) {
      return false;
    }
    if (filter.severity && !filter.severity.includes(suggestion.severity)) {
      return false;
    }
    if (filter.minConfidence && suggestion.confidence < filter.minConfidence) {
      return false;
    }
    return true;
  });
}

export function getSuggestionSummary(suggestions: Suggestion[]) {
  const criticalCount = suggestions.filter(s => s.severity === 'critical').length;
  const warningCount = suggestions.filter(s => s.severity === 'warning').length;
  const infoCount = suggestions.filter(s => s.severity === 'info').length;
  
  const averageConfidence = suggestions.length > 0 
    ? suggestions.reduce((sum, s) => sum + s.confidence, 0) / suggestions.length 
    : 0;

  return {
    totalSuggestions: suggestions.length,
    criticalCount,
    warningCount,
    infoCount,
    averageConfidence,
    overallScore: suggestions.length > 0 ? Math.max(0.1, 1 - (criticalCount * 0.3 + warningCount * 0.1) / suggestions.length) : 1
  };
}

export async function recordSuggestionAction(
  suggestionId: string,
  action: 'accept' | 'reject' | 'apply' | 'ignore',
  userId: string
): Promise<void> {
  try {
    await fetch('http://localhost:3001/api/suggestions/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        suggestionId,
        action,
        userId,
        timestamp: new Date().toISOString()
      })
    });
  } catch (error) {
    console.error('Error recording suggestion action:', error);
    // Don't throw error to avoid disrupting user experience
  }
} 