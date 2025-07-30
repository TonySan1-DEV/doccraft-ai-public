import React, { useState } from 'react';
import { useProfileSetup } from '../hooks/useWriterProfile';
import { WriterProfile } from '../types/WriterProfile';
import { Brain, BookOpen, Zap, Target, TrendingUp, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const WriterProfileSetup: React.FC = () => {
  const { isSetup, setupLoading, initializeProfile } = useProfileSetup();
  const [formData, setFormData] = useState<{
    preferred_sentence_length: number;
    vocabulary_complexity: 'simple' | 'moderate' | 'advanced';
    pacing_style: 'moderate' | 'fast' | 'contemplative';
    genre_specializations: string[];
  }>({
    preferred_sentence_length: 15,
    vocabulary_complexity: 'moderate',
    pacing_style: 'moderate',
    genre_specializations: []
  });

  const availableGenres = [
    'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Sci-Fi', 'Fantasy',
    'Thriller', 'Biography', 'Self-Help', 'Business', 'Technology', 'History',
    'Philosophy', 'Poetry', 'Children', 'Young Adult', 'Academic', 'Travel'
  ];

  const handleGenreToggle = (genre: string) => {
    setFormData(prev => ({
      ...prev,
      genre_specializations: prev.genre_specializations.includes(genre)
        ? prev.genre_specializations.filter(g => g !== genre)
        : [...prev.genre_specializations, genre]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.genre_specializations.length === 0) {
      toast.error('Please select at least one genre specialization');
      return;
    }

    const initialProfile: WriterProfile = {
      user_id: '', // Will be set by the service
      preferred_sentence_length: formData.preferred_sentence_length,
      vocabulary_complexity: formData.vocabulary_complexity,
      pacing_style: formData.pacing_style,
      genre_specializations: formData.genre_specializations,
      successful_patterns: {
        outline_styles: {},
        writing_habits: {
          preferred_session_length: 60,
          most_productive_hours: ['09:00', '14:00', '20:00'],
          common_themes: []
        },
        ai_prompt_preferences: {},
        content_analysis: {
          avg_paragraph_length: formData.preferred_sentence_length,
          dialogue_usage: 15,
          descriptive_ratio: 40,
          action_ratio: 45
        }
      }
    };

    await initializeProfile(initialProfile);
  };

  if (isSetup) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
          <Brain className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">
            AI Learning Profile Active
          </h2>
          <p className="text-green-700 dark:text-green-300">
            Your writing preferences are being learned and will enhance all AI suggestions across the platform.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Brain className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Adaptive AI Learning Setup
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Help our AI understand your writing style to provide personalized suggestions, 
            better outlines, and smarter content recommendations across all your eBook projects.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Sentence Length Preference */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <Target className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Preferred Sentence Length
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              How long do you typically prefer your sentences? This helps AI generate content that matches your style.
            </p>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="10"
                max="35"
                value={formData.preferred_sentence_length}
                onChange={(e) => setFormData(prev => ({ ...prev, preferred_sentence_length: parseInt(e.target.value) }))}
                className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-lg font-semibold text-blue-600 dark:text-blue-400 min-w-[3rem]">
                {formData.preferred_sentence_length} words
              </span>
            </div>
          </div>

          {/* Vocabulary Complexity */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <BookOpen className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Vocabulary Complexity
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Choose the vocabulary level that best matches your writing style and target audience.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(['simple', 'moderate', 'advanced'] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, vocabulary_complexity: level as 'simple' | 'moderate' | 'advanced' }))}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.vocabulary_complexity === level
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="font-semibold capitalize mb-1">{level}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {level === 'simple' && 'Accessible, clear language'}
                    {level === 'moderate' && 'Balanced, professional tone'}
                    {level === 'advanced' && 'Sophisticated, nuanced vocabulary'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Pacing Style */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <Zap className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Writing Pacing Style
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              How do you prefer to pace your writing? This influences chapter structure and content flow.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(['fast', 'moderate', 'contemplative'] as const).map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, pacing_style: style as 'moderate' | 'fast' | 'contemplative' }))}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.pacing_style === style
                      ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="font-semibold capitalize mb-1">{style}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {style === 'fast' && 'Quick, action-driven narrative'}
                    {style === 'moderate' && 'Balanced, steady progression'}
                    {style === 'contemplative' && 'Thoughtful, detailed exploration'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Genre Specializations */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Genre Specializations
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Select the genres you write in most often. This helps AI provide more relevant suggestions.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {availableGenres.map((genre) => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => handleGenreToggle(genre)}
                  className={`p-3 rounded-lg border-2 transition-all text-sm ${
                    formData.genre_specializations.includes(genre)
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
            {formData.genre_specializations.length > 0 && (
              <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">
                  Selected Genres:
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.genre_specializations.map((genre) => (
                    <span
                      key={genre}
                      className="px-2 py-1 bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300 rounded text-xs"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              disabled={setupLoading || formData.genre_specializations.length === 0}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              {setupLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Setting up AI Learning...
                </div>
              ) : (
                <div className="flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Activate Adaptive AI Learning
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WriterProfileSetup; 