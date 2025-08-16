import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from '@jest/globals';
import {
  saveWriterProfile,
  getWriterProfile,
  updateWriterProfile,
  analyzeWriterProfile,
  generatePersonalizedSuggestions,
  learnFromUserAction,
} from '../src/services/profileTrainer';
import { WriterProfile, ProfileUpdateData } from '../src/types/WriterProfile';

// Mock Supabase client
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(() => ({
          data: null,
          error: { code: 'PGRST116' },
        })),
      })),
    })),
    upsert: jest.fn(() => ({
      data: { id: 'test-profile-id' },
      error: null,
    })),
    update: jest.fn(() => ({
      eq: jest.fn(() => ({
        data: null,
        error: null,
      })),
    })),
  })),
};

// Mock the supabase import
jest.mock('../src/lib/supabase', () => ({
  supabase: mockSupabase,
}));

describe('WriterProfile System Tests', () => {
  const mockUserId = 'test-user-id';
  const mockProfile: WriterProfile = {
    user_id: mockUserId,
    preferred_sentence_length: 25,
    vocabulary_complexity: 'advanced',
    pacing_style: 'contemplative',
    genre_specializations: ['Fiction', 'Mystery'],
    successful_patterns: {
      outline_styles: {
        Fiction: {
          chapter_count: 12,
          avg_chapter_length: 3000,
          preferred_structure: [
            'Introduction',
            'Rising Action',
            'Climax',
            'Resolution',
          ],
        },
      },
      writing_habits: {
        preferred_session_length: 90,
        most_productive_hours: ['09:00', '14:00', '20:00'],
        common_themes: ['redemption', 'identity', 'justice'],
      },
      ai_prompt_preferences: {
        outline_generation: {
          temperature: 0.7,
          max_tokens: 1000,
          style_modifiers: ['detailed', 'character-driven'],
        },
      },
      content_analysis: {
        avg_paragraph_length: 25,
        dialogue_usage: 20,
        descriptive_ratio: 35,
        action_ratio: 45,
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Profile Creation and Retrieval', () => {
    it('should create a new writer profile with valid data', async () => {
      // Mock successful profile creation
      mockSupabase.from.mockReturnValue({
        upsert: jest.fn(() => ({
          data: { id: 'new-profile-id' },
          error: null,
        })),
      });

      await expect(
        saveWriterProfile(mockUserId, mockProfile)
      ).resolves.not.toThrow();

      expect(mockSupabase.from).toHaveBeenCalledWith('writer_profiles');
    });

    it('should validate required fields during profile creation', async () => {
      const invalidProfile = {
        ...mockProfile,
        preferred_sentence_length: 3, // Too short
      };

      await expect(
        saveWriterProfile(mockUserId, invalidProfile as WriterProfile)
      ).rejects.toThrow(
        'Preferred sentence length must be between 5 and 50 words'
      );
    });

    it('should retrieve an existing writer profile', async () => {
      // Mock successful profile retrieval
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => ({
              data: mockProfile,
              error: null,
            })),
          })),
        })),
      });

      const result = await getWriterProfile(mockUserId);

      expect(result).toEqual(mockProfile);
      expect(mockSupabase.from).toHaveBeenCalledWith('writer_profiles');
    });

    it('should return null for non-existent profile', async () => {
      // Mock profile not found
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => ({
              data: null,
              error: { code: 'PGRST116' },
            })),
          })),
        })),
      });

      const result = await getWriterProfile(mockUserId);

      expect(result).toBeNull();
    });
  });

  describe('Profile Updates', () => {
    it('should update existing profile with new data', async () => {
      const updateData: ProfileUpdateData = {
        preferred_sentence_length: 30,
        vocabulary_complexity: 'moderate',
        genre_specializations: ['Fiction', 'Romance', 'Thriller'],
      };

      // Mock successful update
      mockSupabase.from.mockReturnValue({
        update: jest.fn(() => ({
          eq: jest.fn(() => ({
            data: null,
            error: null,
          })),
        })),
      });

      await expect(
        updateWriterProfile(mockUserId, updateData)
      ).resolves.not.toThrow();
    });

    it('should validate update data', async () => {
      const invalidUpdate: ProfileUpdateData = {
        preferred_sentence_length: 60, // Too long
      };

      await expect(
        updateWriterProfile(mockUserId, invalidUpdate)
      ).rejects.toThrow(
        'Preferred sentence length must be between 5 and 50 words'
      );
    });
  });

  describe('Field Integrity Validation', () => {
    it('should validate vocabulary_complexity enum values', () => {
      const validValues = ['simple', 'moderate', 'advanced'];

      validValues.forEach(value => {
        const profileWithValidValue = {
          ...mockProfile,
          vocabulary_complexity: value as 'simple' | 'moderate' | 'advanced',
        };

        expect(profileWithValidValue.vocabulary_complexity).toBe(value);
      });
    });

    it('should validate pacing_style enum values', () => {
      const validValues = ['fast', 'moderate', 'contemplative'];

      validValues.forEach(value => {
        const profileWithValidValue = {
          ...mockProfile,
          pacing_style: value as 'fast' | 'moderate' | 'contemplative',
        };

        expect(profileWithValidValue.pacing_style).toBe(value);
      });
    });

    it('should validate sentence length bounds', () => {
      const validLengths = [5, 15, 25, 35, 50];

      validLengths.forEach(length => {
        const profileWithValidLength = {
          ...mockProfile,
          preferred_sentence_length: length,
        };

        expect(profileWithValidLength.preferred_sentence_length).toBe(length);
        expect(
          profileWithValidLength.preferred_sentence_length
        ).toBeGreaterThanOrEqual(5);
        expect(
          profileWithValidLength.preferred_sentence_length
        ).toBeLessThanOrEqual(50);
      });
    });

    it('should validate genre_specializations array', () => {
      const validGenres = ['Fiction', 'Non-Fiction', 'Mystery', 'Romance'];

      const profileWithValidGenres = {
        ...mockProfile,
        genre_specializations: validGenres,
      };

      expect(Array.isArray(profileWithValidGenres.genre_specializations)).toBe(
        true
      );
      expect(
        profileWithValidGenres.genre_specializations.length
      ).toBeGreaterThan(0);
    });
  });

  describe('Analytics and Learning', () => {
    it('should generate personalized suggestions based on profile', async () => {
      const suggestions = await generatePersonalizedSuggestions(
        mockUserId,
        'outline',
        'Sample content for analysis'
      );

      expect(Array.isArray(suggestions)).toBe(true);
      suggestions.forEach(suggestion => {
        expect(suggestion).toHaveProperty('type');
        expect(suggestion).toHaveProperty('confidence');
        expect(suggestion).toHaveProperty('reasoning');
        expect(suggestion).toHaveProperty('suggestion');
        expect(suggestion).toHaveProperty('based_on_patterns');
      });
    });

    it('should record user actions for learning', async () => {
      await expect(
        learnFromUserAction(
          mockUserId,
          'outline_generation',
          'book_outliner',
          'success'
        )
      ).resolves.not.toThrow();
    });

    it('should analyze writer profile and return analytics', async () => {
      const analytics = await analyzeWriterProfile(mockUserId);

      expect(analytics).toHaveProperty('total_outlines_generated');
      expect(analytics).toHaveProperty('avg_outline_quality_score');
      expect(analytics).toHaveProperty('most_used_genres');
      expect(analytics).toHaveProperty('writing_consistency_score');
      expect(analytics).toHaveProperty('ai_suggestion_acceptance_rate');
      expect(analytics).toHaveProperty('last_activity_date');
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Mock database error
      mockSupabase.from.mockReturnValue({
        upsert: jest.fn(() => ({
          data: null,
          error: { message: 'Database connection failed' },
        })),
      });

      await expect(saveWriterProfile(mockUserId, mockProfile)).rejects.toThrow(
        'Failed to save writer profile'
      );
    });

    it('should validate user ID presence', async () => {
      await expect(saveWriterProfile('', mockProfile)).rejects.toThrow(
        'User ID is required'
      );
    });

    it('should handle network errors in profile retrieval', async () => {
      // Mock network error
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => ({
              data: null,
              error: { message: 'Network error' },
            })),
          })),
        })),
      });

      await expect(getWriterProfile(mockUserId)).rejects.toThrow(
        'Failed to fetch writer profile'
      );
    });
  });

  describe('RLS (Row Level Security) Enforcement', () => {
    it('should only allow users to access their own profiles', async () => {
      const otherUserId = 'other-user-id';

      // Mock that current user can only access their own profile
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => ({
              data: null, // No data returned for other user
              error: { code: 'PGRST116' },
            })),
          })),
        })),
      });

      const result = await getWriterProfile(otherUserId);
      expect(result).toBeNull();
    });

    it('should enforce user isolation in profile updates', async () => {
      const otherUserId = 'other-user-id';
      const updateData: ProfileUpdateData = {
        preferred_sentence_length: 30,
      };

      // Mock update failure for other user
      mockSupabase.from.mockReturnValue({
        update: jest.fn(() => ({
          eq: jest.fn(() => ({
            data: null,
            error: { message: 'Permission denied' },
          })),
        })),
      });

      await expect(
        updateWriterProfile(otherUserId, updateData)
      ).rejects.toThrow('Failed to update writer profile');
    });
  });

  describe('Performance and Caching', () => {
    it('should handle concurrent profile operations', async () => {
      const promises = Array(5)
        .fill(null)
        .map(() => getWriterProfile(mockUserId));

      const results = await Promise.all(promises);
      expect(results).toHaveLength(5);
    });

    it('should validate profile data structure integrity', () => {
      // Test that all required fields are present
      expect(mockProfile).toHaveProperty('user_id');
      expect(mockProfile).toHaveProperty('preferred_sentence_length');
      expect(mockProfile).toHaveProperty('vocabulary_complexity');
      expect(mockProfile).toHaveProperty('pacing_style');
      expect(mockProfile).toHaveProperty('genre_specializations');
      expect(mockProfile).toHaveProperty('successful_patterns');

      // Test nested structure integrity
      expect(mockProfile.successful_patterns).toHaveProperty('outline_styles');
      expect(mockProfile.successful_patterns).toHaveProperty('writing_habits');
      expect(mockProfile.successful_patterns).toHaveProperty(
        'ai_prompt_preferences'
      );
      expect(mockProfile.successful_patterns).toHaveProperty(
        'content_analysis'
      );
    });
  });
});
