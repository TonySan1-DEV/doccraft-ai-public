-- MCP Context Block
-- role: db-engineer
-- tier: Pro
-- file: supabase/migrations/20241201000000_doc2video_tables.sql
-- allowedActions: ["create", "alter", "secure"]
-- theme: doc2video_storage

-- =============================================================================
-- DocCraft-AI: Doc-to-Video Pipeline Database Schema
-- =============================================================================
-- This migration creates the core tables for storing Doc-to-Video pipeline outputs
-- including slide decks, narrated decks, TTS narrations, and pipeline metadata.
-- All tables include row-level security for user isolation and support for
-- future AI-powered features like embeddings and semantic search.
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search
CREATE EXTENSION IF NOT EXISTS "vector"; -- For future embeddings support

-- =============================================================================
-- 1. SLIDE DECKS TABLE
-- =============================================================================
-- Stores generated slide presentations with metadata and analysis
CREATE TABLE IF NOT EXISTS slide_decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  theme TEXT,
  slides JSONB NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  analysis JSONB DEFAULT '{}'::jsonb,
  tier TEXT DEFAULT 'Pro',
  processing_time_ms INTEGER,
  word_count INTEGER,
  slide_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_slide_decks_user_id ON slide_decks(user_id);
CREATE INDEX IF NOT EXISTS idx_slide_decks_created_at ON slide_decks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_slide_decks_title ON slide_decks USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_slide_decks_tier ON slide_decks(tier);
CREATE INDEX IF NOT EXISTS idx_slide_decks_metadata ON slide_decks USING gin(metadata);

-- =============================================================================
-- 2. NARRATED DECKS TABLE
-- =============================================================================
-- Stores slide decks with generated narration scripts
CREATE TABLE IF NOT EXISTS narrated_decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  theme TEXT,
  slides JSONB NOT NULL,
  narration_metadata JSONB DEFAULT '{}'::jsonb,
  analysis JSONB DEFAULT '{}'::jsonb,
  size_metadata JSONB DEFAULT '{}'::jsonb,
  tier TEXT DEFAULT 'Pro',
  processing_time_ms INTEGER,
  total_narration_length INTEGER,
  average_narration_length INTEGER,
  total_words INTEGER,
  average_words_per_slide NUMERIC(10,2),
  tone TEXT DEFAULT 'conversational',
  has_introduction BOOLEAN DEFAULT false,
  has_summary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_narrated_decks_user_id ON narrated_decks(user_id);
CREATE INDEX IF NOT EXISTS idx_narrated_decks_created_at ON narrated_decks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_narrated_decks_title ON narrated_decks USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_narrated_decks_tier ON narrated_decks(tier);
CREATE INDEX IF NOT EXISTS idx_narrated_decks_tone ON narrated_decks(tone);
CREATE INDEX IF NOT EXISTS idx_narrated_decks_narration_metadata ON narrated_decks USING gin(narration_metadata);

-- =============================================================================
-- 3. TTS NARRATIONS TABLE
-- =============================================================================
-- Stores text-to-speech narration outputs with audio metadata
CREATE TABLE IF NOT EXISTS tts_narrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  audio_file_url TEXT NOT NULL,
  timeline JSONB NOT NULL,
  model_used TEXT DEFAULT 'en-US-JennyNeural',
  audio_metadata JSONB DEFAULT '{}'::jsonb,
  analysis JSONB DEFAULT '{}'::jsonb,
  voice_settings JSONB DEFAULT '{}'::jsonb,
  tier TEXT DEFAULT 'Pro',
  processing_time_ms INTEGER,
  total_duration NUMERIC(10,3),
  slide_count INTEGER,
  average_duration_per_slide NUMERIC(10,3),
  speed_multiplier NUMERIC(5,2) DEFAULT 1.0,
  has_gaps BOOLEAN DEFAULT false,
  total_words INTEGER,
  voice TEXT DEFAULT 'en-US-JennyNeural',
  language TEXT DEFAULT 'en',
  speed NUMERIC(5,2) DEFAULT 1.0,
  pitch NUMERIC(5,2) DEFAULT 1.0,
  volume NUMERIC(5,2) DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tts_narrations_user_id ON tts_narrations(user_id);
CREATE INDEX IF NOT EXISTS idx_tts_narrations_created_at ON tts_narrations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tts_narrations_model_used ON tts_narrations(model_used);
CREATE INDEX IF NOT EXISTS idx_tts_narrations_tier ON tts_narrations(tier);
CREATE INDEX IF NOT EXISTS idx_tts_narrations_voice ON tts_narrations(voice);
CREATE INDEX IF NOT EXISTS idx_tts_narrations_timeline ON tts_narrations USING gin(timeline);

-- =============================================================================
-- 4. PIPELINE OUTPUTS TABLE
-- =============================================================================
-- Tracks complete pipeline executions (Auto/Hybrid/Manual workflows)
CREATE TABLE IF NOT EXISTS pipeline_outputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  slide_deck_id UUID REFERENCES slide_decks(id) ON DELETE CASCADE,
  narrated_deck_id UUID REFERENCES narrated_decks(id) ON DELETE CASCADE,
  tts_narration_id UUID REFERENCES tts_narrations(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  mode TEXT NOT NULL CHECK (mode IN ('auto', 'hybrid', 'manual')),
  features_used TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}'::jsonb,
  user_tier TEXT DEFAULT 'Pro',
  access_validated BOOLEAN DEFAULT false,
  total_processing_time_ms INTEGER,
  slide_count INTEGER,
  narration_length INTEGER,
  audio_duration NUMERIC(10,3),
  errors TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_pipeline_outputs_user_id ON pipeline_outputs(user_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_outputs_created_at ON pipeline_outputs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pipeline_outputs_status ON pipeline_outputs(status);
CREATE INDEX IF NOT EXISTS idx_pipeline_outputs_mode ON pipeline_outputs(mode);
CREATE INDEX IF NOT EXISTS idx_pipeline_outputs_tier ON pipeline_outputs(user_tier);
CREATE INDEX IF NOT EXISTS idx_pipeline_outputs_slide_deck_id ON pipeline_outputs(slide_deck_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_outputs_narrated_deck_id ON pipeline_outputs(narrated_deck_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_outputs_tts_narration_id ON pipeline_outputs(tts_narration_id);

-- =============================================================================
-- 5. ROW-LEVEL SECURITY POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE slide_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE narrated_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tts_narrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_outputs ENABLE ROW LEVEL SECURITY;

-- Slide Decks RLS Policies
CREATE POLICY "Users can view their own slide decks"
  ON slide_decks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own slide decks"
  ON slide_decks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own slide decks"
  ON slide_decks FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own slide decks"
  ON slide_decks FOR DELETE
  USING (auth.uid() = user_id);

-- Narrated Decks RLS Policies
CREATE POLICY "Users can view their own narrated decks"
  ON narrated_decks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own narrated decks"
  ON narrated_decks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own narrated decks"
  ON narrated_decks FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own narrated decks"
  ON narrated_decks FOR DELETE
  USING (auth.uid() = user_id);

-- TTS Narrations RLS Policies
CREATE POLICY "Users can view their own TTS narrations"
  ON tts_narrations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own TTS narrations"
  ON tts_narrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own TTS narrations"
  ON tts_narrations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own TTS narrations"
  ON tts_narrations FOR DELETE
  USING (auth.uid() = user_id);

-- Pipeline Outputs RLS Policies
CREATE POLICY "Users can view their own pipeline outputs"
  ON pipeline_outputs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pipeline outputs"
  ON pipeline_outputs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pipeline outputs"
  ON pipeline_outputs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pipeline outputs"
  ON pipeline_outputs FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================================================
-- 6. TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_slide_decks_updated_at
  BEFORE UPDATE ON slide_decks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_narrated_decks_updated_at
  BEFORE UPDATE ON narrated_decks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tts_narrations_updated_at
  BEFORE UPDATE ON tts_narrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pipeline_outputs_updated_at
  BEFORE UPDATE ON pipeline_outputs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 7. FUNCTIONS FOR DATA VALIDATION AND UTILITIES
-- =============================================================================

-- Function to validate slide deck structure
CREATE OR REPLACE FUNCTION validate_slide_deck_structure(slides_json JSONB)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if slides is an array
  IF NOT (jsonb_typeof(slides_json) = 'array') THEN
    RETURN FALSE;
  END IF;
  
  -- Check if array is not empty
  IF jsonb_array_length(slides_json) = 0 THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate word count from slides
CREATE OR REPLACE FUNCTION calculate_slide_word_count(slides_json JSONB)
RETURNS INTEGER AS $$
DECLARE
  slide JSONB;
  total_words INTEGER := 0;
  slide_text TEXT;
BEGIN
  FOR slide IN SELECT * FROM jsonb_array_elements(slides_json)
  LOOP
    -- Extract text from slide title and bullets
    slide_text := COALESCE(slide->>'title', '') || ' ' || 
                  COALESCE(array_to_string(ARRAY(SELECT jsonb_array_elements_text(slide->'bullets')), ' '), '');
    
    -- Count words (simple space-based counting)
    total_words := total_words + array_length(regexp_split_to_array(trim(slide_text), '\s+'), 1);
  END LOOP;
  
  RETURN total_words;
END;
$$ LANGUAGE plpgsql;

-- Function to validate narration structure
CREATE OR REPLACE FUNCTION validate_narration_structure(slides_json JSONB)
RETURNS BOOLEAN AS $$
DECLARE
  slide JSONB;
BEGIN
  FOR slide IN SELECT * FROM jsonb_array_elements(slides_json)
  LOOP
    -- Check if each slide has narration
    IF slide->>'narration' IS NULL OR slide->>'narration' = '' THEN
      RETURN FALSE;
    END IF;
  END LOOP;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 8. CONSTRAINTS AND VALIDATIONS
-- =============================================================================

-- Add constraints for data integrity
ALTER TABLE slide_decks 
  ADD CONSTRAINT slide_decks_title_not_empty CHECK (length(trim(title)) > 0),
  ADD CONSTRAINT slide_decks_slides_not_empty CHECK (jsonb_array_length(slides) > 0),
  ADD CONSTRAINT slide_decks_tier_valid CHECK (tier IN ('Free', 'Basic', 'Pro'));

ALTER TABLE narrated_decks 
  ADD CONSTRAINT narrated_decks_title_not_empty CHECK (length(trim(title)) > 0),
  ADD CONSTRAINT narrated_decks_slides_not_empty CHECK (jsonb_array_length(slides) > 0),
  ADD CONSTRAINT narrated_decks_tier_valid CHECK (tier IN ('Free', 'Basic', 'Pro')),
  ADD CONSTRAINT narrated_decks_tone_valid CHECK (tone IN ('conversational', 'professional', 'casual', 'formal'));

ALTER TABLE tts_narrations 
  ADD CONSTRAINT tts_narrations_audio_url_not_empty CHECK (length(trim(audio_file_url)) > 0),
  ADD CONSTRAINT tts_narrations_timeline_not_empty CHECK (jsonb_array_length(timeline) > 0),
  ADD CONSTRAINT tts_narrations_tier_valid CHECK (tier IN ('Free', 'Basic', 'Pro')),
  ADD CONSTRAINT tts_narrations_speed_valid CHECK (speed >= 0.5 AND speed <= 2.0),
  ADD CONSTRAINT tts_narrations_pitch_valid CHECK (pitch >= 0.5 AND pitch <= 2.0),
  ADD CONSTRAINT tts_narrations_volume_valid CHECK (volume >= 0.0 AND volume <= 1.0);

ALTER TABLE pipeline_outputs 
  ADD CONSTRAINT pipeline_outputs_mode_valid CHECK (mode IN ('auto', 'hybrid', 'manual')),
  ADD CONSTRAINT pipeline_outputs_status_valid CHECK (status IN ('processing', 'completed', 'failed')),
  ADD CONSTRAINT pipeline_outputs_tier_valid CHECK (user_tier IN ('Free', 'Basic', 'Pro'));

-- =============================================================================
-- 9. COMMENTS FOR DOCUMENTATION
-- =============================================================================

COMMENT ON TABLE slide_decks IS 'Stores generated slide presentations with metadata and analysis';
COMMENT ON TABLE narrated_decks IS 'Stores slide decks with generated narration scripts';
COMMENT ON TABLE tts_narrations IS 'Stores text-to-speech narration outputs with audio metadata';
COMMENT ON TABLE pipeline_outputs IS 'Tracks complete pipeline executions (Auto/Hybrid/Manual workflows)';

COMMENT ON COLUMN slide_decks.slides IS 'JSONB array of slide objects with title, bullets, and layout';
COMMENT ON COLUMN slide_decks.metadata IS 'Processing metadata including word count, slide count, processing time';
COMMENT ON COLUMN slide_decks.analysis IS 'AI analysis results including themes, complexity, readability';

COMMENT ON COLUMN narrated_decks.slides IS 'JSONB array of slide objects with narration text';
COMMENT ON COLUMN narrated_decks.narration_metadata IS 'Narration-specific metadata including tone, length, word count';
COMMENT ON COLUMN narrated_decks.analysis IS 'Analysis of narration quality, flow, and engagement';

COMMENT ON COLUMN tts_narrations.timeline IS 'JSONB array of timeline entries with start/end times and narration text';
COMMENT ON COLUMN tts_narrations.audio_metadata IS 'Audio file metadata including duration, format, quality';
COMMENT ON COLUMN tts_narrations.voice_settings IS 'TTS voice configuration including voice, speed, pitch, volume';

COMMENT ON COLUMN pipeline_outputs.features_used IS 'Array of features used in this pipeline execution';
COMMENT ON COLUMN pipeline_outputs.metadata IS 'Pipeline execution metadata including processing times, errors';

-- =============================================================================
-- 10. FUTURE ENHANCEMENTS (TODOs)
-- =============================================================================

/*
TODO: Future Enhancements

1. EMBEDDINGS SUPPORT
   - Add embedding columns for semantic search
   - Create vector indexes for similarity queries
   - Implement embedding generation triggers

2. FULL-TEXT SEARCH
   - Add GIN indexes for content search
   - Implement weighted search across titles and content
   - Add search ranking functions

3. AUDIO STORAGE
   - Create Supabase Storage buckets for audio files
   - Implement signed URL generation
   - Add audio file cleanup policies

4. ANALYTICS AND METRICS
   - Create materialized views for common queries
   - Add aggregation functions for usage statistics
   - Implement performance monitoring tables

5. CACHING AND OPTIMIZATION
   - Add Redis integration for session storage
   - Implement query result caching
   - Add database connection pooling

6. SECURITY ENHANCEMENTS
   - Add audit logging tables
   - Implement rate limiting policies
   - Add encryption for sensitive data

7. SCALABILITY FEATURES
   - Add partitioning for large tables
   - Implement archiving strategies
   - Add data retention policies

8. API INTEGRATION
   - Create stored procedures for common operations
   - Add webhook support for real-time updates
   - Implement API rate limiting
*/

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================
-- This migration creates a complete schema for Doc-to-Video pipeline persistence
-- with proper security, performance optimizations, and future-ready features.
-- =============================================================================
