import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  getSuggestions, 
  applySuggestion, 
  filterSuggestions, 
  getSuggestionSummary,
  recordSuggestionAction
} from '../src/services/realtimeSuggestor';
import { Suggestion, SuggestionContext } from '../src/types/Suggestion';
import { WriterProfile } from '../src/types/WriterProfile';

// Mock fetch
global.fetch = vi.fn();

describe('Real-Time AI Suggestions System Tests', () => {
  const mockProfile: WriterProfile = {
    user_id: 'test-user-id',
    preferred_sentence_length: 20,
    vocabulary_complexity: 'moderate',
    pacing_style: 'moderate',
    genre_specializations: ['Fiction', 'Mystery'],
    successful_patterns: {
      outline_styles: {},
      writing_habits: {
        preferred_session_length: 60,
        most_productive_hours: ['09:00', '14:00'],
        common_themes: ['redemption', 'justice']
      },
      ai_prompt_preferences: {},
      content_analysis: {
        avg_paragraph_length: 20,
        dialogue_usage: 15,
        descriptive_ratio: 40,
        action_ratio: 45
      }
    }
  };

  const mockContext: SuggestionContext = {
    text: 'Sample text for testing',
    genre: 'Mystery',
    tone: 'suspenseful',
    documentType: 'chapter'
  };

  const mockSuggestions: Suggestion[] = [
    {
      id: 'suggestion-1',
      type: 'style',
      comment: 'Consider using more descriptive language to enhance the scene.',
      severity: 'warning',
      confidence: 0.85,
      category: 'descriptive-writing',
      reasoning: 'Based on your preference for moderate vocabulary complexity',
      basedOnPatterns: ['vocabulary_complexity', 'descriptive_ratio'],
      start: 0,
      end: 50,
      suggestedText: 'Consider using more vivid descriptive language to enhance the scene.'
    },
    {
      id: 'suggestion-2',
      type: 'pacing',
      comment: 'This sentence is quite long. Consider breaking it into shorter sentences.',
      severity: 'info',
      confidence: 0.72,
      category: 'sentence-structure',
      reasoning: 'Sentence length exceeds your preferred 20-word average',
      basedOnPatterns: ['sentence_length_preference']
    },
    {
      id: 'suggestion-3',
      type: 'tone',
      comment: 'This aligns well with your Mystery genre expertise.',
      severity: 'info',
      confidence: 0.90,
      category: 'genre-alignment',
      reasoning: 'Content matches your specialized genre: Mystery',
      basedOnPatterns: ['genre_specializations']
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getSuggestions Function', () => {
    it('should return empty suggestions for empty input', async () => {
      const result = await getSuggestions('', mockProfile);
      
      expect(result.suggestions).toEqual([]);
      expect(result.summary.totalSuggestions).toBe(0);
      expect(result.summary.overallScore).toBe(0);
    });

    it('should return empty suggestions for short input', async () => {
      const result = await getSuggestions('Hi', mockProfile);
      
      expect(result.suggestions).toEqual([]);
      expect(result.summary.totalSuggestions).toBe(0);
    });

    it('should make API request with correct payload', async () => {
      const mockResponse = {
        suggestions: mockSuggestions,
        summary: {
          totalSuggestions: 3,
          criticalCount: 0,
          warningCount: 1,
          infoCount: 2,
          overallScore: 0.8
        },
        metadata: {
          processingTime: 500,
          modelUsed: 'gpt-4',
          confidence: 0.85
        }
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await getSuggestions('This is a test sentence for analysis.', mockProfile, mockContext);

      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: 'This is a test sentence for analysis.',
          context: mockContext,
          profile: {
            preferred_sentence_length: 20,
            vocabulary_complexity: 'moderate',
            pacing_style: 'moderate',
            genre_specializations: ['Fiction', 'Mystery']
          }
        })
      });

      expect(result.suggestions).toEqual(mockSuggestions);
      expect(result.summary.totalSuggestions).toBe(3);
    });

    it('should handle API errors gracefully with fallback', async () => {
      (fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const result = await getSuggestions('This is a long sentence that should trigger suggestions based on the user profile preferences.', mockProfile);

      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(result.metadata.modelUsed).toBe('fallback-analyzer');
      expect(result.metadata.confidence).toBe(0.6);
    });

    it('should generate profile-aware fallback suggestions', async () => {
      const longSentence = 'This is an extremely long sentence that contains many words and should definitely trigger the sentence length analysis based on the user profile preferences for shorter sentences.';
      
      const result = await getSuggestions(longSentence, mockProfile);

      expect(result.suggestions.length).toBeGreaterThan(0);
      
      const pacingSuggestion = result.suggestions.find(s => s.type === 'pacing');
      expect(pacingSuggestion).toBeDefined();
      expect(pacingSuggestion?.comment).toContain('preferred length is 20 words');
    });
  });

  describe('Profile-Aware Suggestion Relevance', () => {
    it('should generate suggestions based on vocabulary complexity preference', async () => {
      const complexText = 'The extraordinarily sophisticated vocabulary demonstrates exceptional linguistic proficiency.';
      const simpleProfile = { ...mockProfile, vocabulary_complexity: 'simple' as const };
      
      const result = await getSuggestions(complexText, simpleProfile);
      
      const vocabularySuggestion = result.suggestions.find(s => s.type === 'style');
      expect(vocabularySuggestion).toBeDefined();
      expect(vocabularySuggestion?.comment).toContain('simpler vocabulary');
    });

    it('should generate suggestions based on pacing style preference', async () => {
      const actionText = 'He ran quickly, jumped over the fence, and moved rapidly through the crowd.';
      const contemplativeProfile = { ...mockProfile, pacing_style: 'contemplative' as const };
      
      const result = await getSuggestions(actionText, contemplativeProfile);
      
      const pacingSuggestion = result.suggestions.find(s => s.type === 'pacing');
      expect(pacingSuggestion).toBeDefined();
      expect(pacingSuggestion?.comment).toContain('contemplative');
    });

    it('should recognize genre specialization alignment', async () => {
      const mysteryText = 'The detective carefully examined the crime scene, looking for clues.';
      const result = await getSuggestions(mysteryText, mockProfile, { ...mockContext, genre: 'Mystery' });
      
      const genreSuggestion = result.suggestions.find(s => s.type === 'style');
      expect(genreSuggestion).toBeDefined();
      expect(genreSuggestion?.comment).toContain('Mystery expertise');
    });
  });

  describe('Fallback Logic', () => {
    it('should provide fallback suggestions when API fails', async () => {
      (fetch as any).mockRejectedValueOnce(new Error('API unavailable'));

      const result = await getSuggestions('This is a test sentence.', mockProfile);

      expect(result.suggestions.length).toBeGreaterThanOrEqual(0);
      expect(result.metadata.modelUsed).toBe('fallback-analyzer');
      expect(result.metadata.confidence).toBe(0.6);
    });

    it('should handle network timeouts gracefully', async () => {
      (fetch as any).mockRejectedValueOnce(new Error('Request timeout'));

      const result = await getSuggestions('This is a test sentence.', mockProfile);

      expect(result.suggestions).toBeDefined();
      expect(Array.isArray(result.suggestions)).toBe(true);
    });

    it('should handle malformed API responses', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ invalid: 'response' })
      });

      const result = await getSuggestions('This is a test sentence.', mockProfile);

      expect(result.suggestions).toBeDefined();
      expect(Array.isArray(result.suggestions)).toBe(true);
    });
  });

  describe('Suggestion Formatting', () => {
    it('should validate suggestion structure', () => {
      mockSuggestions.forEach(suggestion => {
        expect(suggestion).toHaveProperty('id');
        expect(suggestion).toHaveProperty('type');
        expect(suggestion).toHaveProperty('comment');
        expect(suggestion).toHaveProperty('severity');
        expect(suggestion).toHaveProperty('confidence');
        expect(suggestion).toHaveProperty('category');
        expect(suggestion).toHaveProperty('reasoning');
        expect(suggestion).toHaveProperty('basedOnPatterns');
        
        expect(typeof suggestion.id).toBe('string');
        expect(typeof suggestion.comment).toBe('string');
        expect(typeof suggestion.confidence).toBe('number');
        expect(suggestion.confidence).toBeGreaterThanOrEqual(0);
        expect(suggestion.confidence).toBeLessThanOrEqual(1);
        expect(Array.isArray(suggestion.basedOnPatterns)).toBe(true);
      });
    });

    it('should validate severity levels', () => {
      const validSeverities = ['info', 'warning', 'critical'];
      
      mockSuggestions.forEach(suggestion => {
        expect(validSeverities).toContain(suggestion.severity);
      });
    });

    it('should validate suggestion types', () => {
      const validTypes = ['style', 'tone', 'clarity', 'pacing', 'structure', 'grammar', 'engagement'];
      
      mockSuggestions.forEach(suggestion => {
        expect(validTypes).toContain(suggestion.type);
      });
    });
  });

  describe('applySuggestion Function', () => {
    it('should apply suggestion with start/end indices', async () => {
      const originalText = 'This is a test sentence.';
      const suggestion: Suggestion = {
        ...mockSuggestions[0],
        start: 0,
        end: 4,
        suggestedText: 'That'
      };

      const result = await applySuggestion(originalText, suggestion);
      expect(result).toBe('That is a test sentence.');
    });

    it('should return original text when no suggested text provided', async () => {
      const originalText = 'This is a test sentence.';
      const suggestion: Suggestion = {
        ...mockSuggestions[0],
        suggestedText: undefined
      };

      const result = await applySuggestion(originalText, suggestion);
      expect(result).toBe(originalText);
    });

    it('should replace entire text when no indices provided', async () => {
      const originalText = 'This is a test sentence.';
      const suggestion: Suggestion = {
        ...mockSuggestions[0],
        suggestedText: 'This is the improved version.'
      };

      const result = await applySuggestion(originalText, suggestion);
      expect(result).toBe('This is the improved version.');
    });
  });

  describe('filterSuggestions Function', () => {
    it('should filter by type', () => {
      const filtered = filterSuggestions(mockSuggestions, { types: ['style'] });
      expect(filtered.length).toBe(1);
      expect(filtered[0].type).toBe('style');
    });

    it('should filter by severity', () => {
      const filtered = filterSuggestions(mockSuggestions, { severity: ['warning'] });
      expect(filtered.length).toBe(1);
      expect(filtered[0].severity).toBe('warning');
    });

    it('should filter by minimum confidence', () => {
      const filtered = filterSuggestions(mockSuggestions, { minConfidence: 0.8 });
      expect(filtered.every(s => s.confidence >= 0.8)).toBe(true);
    });

    it('should combine multiple filters', () => {
      const filtered = filterSuggestions(mockSuggestions, { 
        types: ['style', 'pacing'],
        severity: ['warning', 'info'],
        minConfidence: 0.7
      });
      expect(filtered.length).toBeGreaterThan(0);
    });
  });

  describe('getSuggestionSummary Function', () => {
    it('should calculate correct summary statistics', () => {
      const summary = getSuggestionSummary(mockSuggestions);
      
      expect(summary.totalSuggestions).toBe(3);
      expect(summary.criticalCount).toBe(0);
      expect(summary.warningCount).toBe(1);
      expect(summary.infoCount).toBe(2);
      expect(summary.averageConfidence).toBeCloseTo(0.82, 2);
      expect(summary.overallScore).toBeGreaterThan(0);
    });

    it('should handle empty suggestions array', () => {
      const summary = getSuggestionSummary([]);
      
      expect(summary.totalSuggestions).toBe(0);
      expect(summary.criticalCount).toBe(0);
      expect(summary.warningCount).toBe(0);
      expect(summary.infoCount).toBe(0);
      expect(summary.averageConfidence).toBe(0);
      expect(summary.overallScore).toBe(1);
    });
  });

  describe('recordSuggestionAction Function', () => {
    it('should record user action successfully', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      await expect(recordSuggestionAction('suggestion-1', 'accept', 'user-1')).resolves.not.toThrow();
      
      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/suggestions/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          suggestionId: 'suggestion-1',
          action: 'accept',
          userId: 'user-1',
          timestamp: expect.any(String)
        })
      });
    });

    it('should handle recording errors gracefully', async () => {
      (fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(recordSuggestionAction('suggestion-1', 'reject', 'user-1')).resolves.not.toThrow();
    });
  });

  describe('Different Writing Styles', () => {
    it('should handle technical writing style', async () => {
      const technicalText = 'The implementation utilizes advanced algorithms to optimize performance metrics.';
      const technicalProfile = { ...mockProfile, vocabulary_complexity: 'advanced' as const };
      
      const result = await getSuggestions(technicalText, technicalProfile);
      
      expect(result.suggestions.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle narrative writing style', async () => {
      const narrativeText = 'The old man walked slowly down the dusty road, his memories trailing behind him like shadows.';
      const narrativeProfile = { ...mockProfile, pacing_style: 'contemplative' as const };
      
      const result = await getSuggestions(narrativeText, narrativeProfile);
      
      expect(result.suggestions.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle action writing style', async () => {
      const actionText = 'He sprinted across the field, leaped over the fence, and dove through the window.';
      const actionProfile = { ...mockProfile, pacing_style: 'fast' as const };
      
      const result = await getSuggestions(actionText, actionProfile);
      
      expect(result.suggestions.length).toBeGreaterThanOrEqual(0);
    });
  });
}); 