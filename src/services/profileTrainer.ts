import { supabase } from '../lib/supabase';
import {
  WriterProfile,
  ProfileUpdateData,
  ProfileAnalytics,
  PersonalizedSuggestion,
} from '../types/WriterProfile';

// Check if we're in demo mode
const isDemoMode =
  !supabase.auth || typeof supabase.auth.getSession !== 'function';

// Mock data for demo mode
const mockWriterProfile: WriterProfile = {
  id: 'demo-profile-001',
  user_id: 'demo-user-id',
  preferred_sentence_length: 15,
  vocabulary_complexity: 'moderate',
  pacing_style: 'moderate',
  genre_specializations: ['fiction', 'mystery', 'romance'],
  successful_patterns: {
    outline_styles: {
      fiction: {
        chapter_count: 20,
        avg_chapter_length: 3000,
        preferred_structure: ['hook', 'development', 'climax', 'resolution'],
      },
    },
    writing_habits: {
      preferred_session_length: 45,
      most_productive_hours: ['9:00 AM', '2:00 PM'],
      common_themes: ['redemption', 'love', 'justice'],
    },
    ai_prompt_preferences: {
      outline_generation: {
        temperature: 0.7,
        max_tokens: 500,
        style_modifiers: ['detailed', 'character-driven'],
      },
    },
    content_analysis: {
      avg_paragraph_length: 4,
      dialogue_usage: 30,
      descriptive_ratio: 40,
      action_ratio: 30,
    },
  },
  updated_at: new Date().toISOString(),
  tier: 'Pro',
};

const mockProfileAnalytics: ProfileAnalytics = {
  total_outlines_generated: 15,
  avg_outline_quality_score: 8.5,
  most_used_genres: ['fiction', 'mystery', 'romance'],
  writing_consistency_score: 0.85,
  ai_suggestion_acceptance_rate: 0.78,
  last_activity_date: new Date().toISOString(),
};

export async function saveWriterProfile(
  userId: string,
  profile: WriterProfile
): Promise<void> {
  if (isDemoMode) {
    return Promise.resolve();
  }

  try {
    // Validate required fields
    if (!userId) throw new Error('User ID is required');
    if (
      !profile.preferred_sentence_length ||
      profile.preferred_sentence_length < 5 ||
      profile.preferred_sentence_length > 50
    ) {
      throw new Error(
        'Preferred sentence length must be between 5 and 50 words'
      );
    }

    const { error } = await supabase.from('writer_profiles').upsert(
      {
        user_id: userId,
        preferred_sentence_length: profile.preferred_sentence_length,
        vocabulary_complexity: profile.vocabulary_complexity,
        pacing_style: profile.pacing_style,
        genre_specializations: profile.genre_specializations,
        successful_patterns: profile.successful_patterns,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id',
      }
    );

    if (error) {
      console.error('Error saving writer profile:', error);
      throw new Error('Failed to save writer profile');
    }

    console.log('Writer profile saved successfully for user:', userId);
  } catch (error) {
    console.error('Error in saveWriterProfile:', error);
    throw error;
  }
}

export async function getWriterProfile(
  userId: string
): Promise<WriterProfile | null> {
  if (isDemoMode) {
    return Promise.resolve(mockWriterProfile);
  }

  try {
    if (!userId) throw new Error('User ID is required');

    const { data, error } = await supabase
      .from('writer_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No profile found, return null
        return null;
      }
      console.error('Error fetching writer profile:', error);
      throw new Error('Failed to fetch writer profile');
    }

    return data as WriterProfile;
  } catch (error) {
    console.error('Error in getWriterProfile:', error);
    throw error;
  }
}

export async function updateWriterProfile(
  userId: string,
  updateData: ProfileUpdateData
): Promise<void> {
  if (isDemoMode) {
    return Promise.resolve();
  }

  try {
    if (!userId) throw new Error('User ID is required');

    // Validate update data
    if (
      updateData.preferred_sentence_length &&
      (updateData.preferred_sentence_length < 5 ||
        updateData.preferred_sentence_length > 50)
    ) {
      throw new Error(
        'Preferred sentence length must be between 5 and 50 words'
      );
    }

    const { error } = await supabase
      .from('writer_profiles')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating writer profile:', error);
      throw new Error('Failed to update writer profile');
    }

    console.log('Writer profile updated successfully for user:', userId);
  } catch (error) {
    console.error('Error in updateWriterProfile:', error);
    throw error;
  }
}

export async function analyzeWriterProfile(
  userId: string
): Promise<ProfileAnalytics> {
  if (isDemoMode) {
    return Promise.resolve(mockProfileAnalytics);
  }

  try {
    if (!userId) throw new Error('User ID is required');

    // Get user's outlines for analysis
    const { data: outlines, error: outlinesError } = await supabase
      .from('book_outlines')
      .select('*')
      .eq('user_id', userId);

    if (outlinesError) {
      console.error('Error fetching outlines for analysis:', outlinesError);
      throw new Error('Failed to fetch outlines for analysis');
    }

    // Calculate analytics based on outlines
    const totalOutlines = outlines?.length || 0;
    const avgQualityScore =
      outlines?.length > 0
        ? outlines.reduce(
            (sum: any, outline: any) => sum + (outline.quality_score || 7),
            0
          ) / outlines.length
        : 7;

    const genreCounts: Record<string, number> = {};
    outlines?.forEach((outline: any) => {
      const genre = outline.genre || 'unknown';
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    });

    const mostUsedGenres = Object.entries(genreCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([genre]) => genre);

    const analytics: ProfileAnalytics = {
      total_outlines_generated: totalOutlines,
      avg_outline_quality_score: Math.round(avgQualityScore * 10) / 10,
      most_used_genres: mostUsedGenres,
      writing_consistency_score: 0.8, // Placeholder
      ai_suggestion_acceptance_rate: 0.75, // Placeholder
      last_activity_date: outlines?.[0]?.created_at || new Date().toISOString(),
    };

    return analytics;
  } catch (error) {
    console.error('Error in analyzeWriterProfile:', error);
    throw error;
  }
}

export async function generatePersonalizedSuggestions(
  userId: string,
  context: string,
  currentContent?: string
): Promise<PersonalizedSuggestion[]> {
  try {
    if (!userId) throw new Error('User ID is required');

    const profile = await getWriterProfile(userId);
    if (!profile) {
      // Return default suggestions if no profile exists
      return generateDefaultSuggestions();
    }

    const suggestions: PersonalizedSuggestion[] = [];

    // Generate outline suggestions based on profile
    if (context.includes('outline')) {
      suggestions.push({
        type: 'outline',
        confidence: 0.85,
        reasoning: `Based on your preference for ${profile.pacing_style} pacing and ${profile.vocabulary_complexity} vocabulary`,
        suggestion: `Consider a ${profile.preferred_sentence_length}-chapter structure with ${profile.genre_specializations[0] || 'your preferred'} genre elements`,
        based_on_patterns: [
          'pacing_style',
          'vocabulary_complexity',
          'genre_specializations',
        ],
      });
    }

    // Generate content suggestions
    if (context.includes('content') && currentContent) {
      const avgLength =
        profile.successful_patterns?.content_analysis?.avg_paragraph_length ||
        20;
      suggestions.push({
        type: 'content',
        confidence: 0.78,
        reasoning: `Your writing typically uses ${avgLength}-word paragraphs with ${profile.vocabulary_complexity} vocabulary`,
        suggestion: `Expand this section with more descriptive elements, maintaining your ${profile.pacing_style} rhythm`,
        based_on_patterns: [
          'content_analysis',
          'vocabulary_complexity',
          'pacing_style',
        ],
      });
    }

    // Generate style suggestions
    if (context.includes('style')) {
      suggestions.push({
        type: 'style',
        confidence: 0.82,
        reasoning: `Your successful patterns show preference for ${profile.vocabulary_complexity} language`,
        suggestion: `Use more ${profile.vocabulary_complexity === 'advanced' ? 'sophisticated vocabulary' : 'accessible language'} to match your style`,
        based_on_patterns: ['vocabulary_complexity', 'successful_patterns'],
      });
    }

    return suggestions;
  } catch (error) {
    console.error('Error in generatePersonalizedSuggestions:', error);
    return generateDefaultSuggestions();
  }
}

function generateDefaultSuggestions(): PersonalizedSuggestion[] {
  return [
    {
      type: 'outline',
      confidence: 0.6,
      reasoning: 'Based on general best practices for eBook creation',
      suggestion:
        'Start with a clear introduction, develop 3-5 main chapters, and end with a strong conclusion',
      based_on_patterns: ['general_best_practices'],
    },
  ];
}

export async function learnFromUserAction(
  userId: string,
  action: string,
  context: string,
  outcome: 'success' | 'failure'
): Promise<void> {
  try {
    if (!userId) throw new Error('User ID is required');

    const profile = await getWriterProfile(userId);
    if (!profile) return; // Skip learning if no profile exists

    // Update successful patterns based on user action
    const updatedPatterns = { ...profile.successful_patterns };

    if (outcome === 'success') {
      if (!updatedPatterns.ai_prompt_preferences) {
        updatedPatterns.ai_prompt_preferences = {};
      }

      updatedPatterns.ai_prompt_preferences[action] = {
        temperature: 0.7,
        max_tokens: 1000,
        style_modifiers: [context],
      };
    }

    // Update the profile with learned patterns
    await updateWriterProfile(userId, {
      successful_patterns: updatedPatterns,
    });

    console.log(`Learned from user action: ${action} - ${outcome}`);
  } catch (error) {
    console.error('Error in learnFromUserAction:', error);
    // Don't throw error to avoid disrupting user experience
  }
}
