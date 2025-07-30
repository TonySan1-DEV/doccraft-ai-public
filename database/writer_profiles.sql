-- Create writer_profiles table for Adaptive AI Learning system
CREATE TABLE IF NOT EXISTS writer_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_sentence_length INTEGER DEFAULT 20,
  vocabulary_complexity TEXT DEFAULT 'moderate' CHECK (vocabulary_complexity IN ('simple', 'moderate', 'advanced')),
  pacing_style TEXT DEFAULT 'moderate' CHECK (pacing_style IN ('fast', 'moderate', 'contemplative')),
  genre_specializations TEXT[] DEFAULT '{}',
  successful_patterns JSONB DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE writer_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
-- Users can only INSERT/SELECT/UPDATE their own profiles
CREATE POLICY "Users can manage their own writer profiles" ON writer_profiles
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_writer_profiles_user_id ON writer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_writer_profiles_updated_at ON writer_profiles(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_writer_profiles_genre_specializations ON writer_profiles USING GIN(genre_specializations);

-- Add comments for documentation
COMMENT ON TABLE writer_profiles IS 'Stores adaptive AI learning data for personalized writer suggestions';
COMMENT ON COLUMN writer_profiles.preferred_sentence_length IS 'Average sentence length preference in words';
COMMENT ON COLUMN writer_profiles.vocabulary_complexity IS 'Writer''s preferred vocabulary level';
COMMENT ON COLUMN writer_profiles.pacing_style IS 'Writing pace and rhythm preference';
COMMENT ON COLUMN writer_profiles.genre_specializations IS 'Array of genres the writer specializes in';
COMMENT ON COLUMN writer_profiles.successful_patterns IS 'JSONB object storing successful writing patterns and AI prompt preferences'; 