-- MCP Context Block
-- role: db-engineer
-- tier: Pro
-- file: supabase/migrations/20241201000002_create_pipelines_table.sql
-- allowedActions: ["create", "alter", "secure"]
-- theme: doc2video_pipeline_tracking

-- =============================================================================
-- DocCraft-AI: Pipeline Tracking Table
-- =============================================================================
-- This migration creates the pipelines table for tracking Doc-to-Video workflow runs
-- including status, progress, errors, and relationships to generated content.
-- =============================================================================

-- =============================================================================
-- 1. CREATE PIPELINES TABLE
-- =============================================================================

-- Create the pipelines table for tracking workflow runs
CREATE TABLE IF NOT EXISTS pipelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('auto', 'hybrid', 'manual')),
  features JSONB NOT NULL DEFAULT '[]'::jsonb, -- e.g., ["script", "slides", "voiceover"]
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'success', 'failed')),
  current_step TEXT,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  error_message TEXT,
  error_details JSONB DEFAULT '{}'::jsonb,
  processing_time_ms INTEGER,
  duration_seconds NUMERIC(10,3),
  
  -- Relationship fields to generated content
  slide_deck_id UUID REFERENCES slide_decks(id) ON DELETE SET NULL,
  narrated_deck_id UUID REFERENCES narrated_decks(id) ON DELETE SET NULL,
  tts_narration_id UUID REFERENCES tts_narrations(id) ON DELETE SET NULL,
  
  -- Metadata fields
  document_text_hash TEXT, -- Hash of input document for deduplication
  document_word_count INTEGER,
  tier TEXT DEFAULT 'Pro' CHECK (tier IN ('Free', 'Basic', 'Pro')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- =============================================================================
-- 2. INDEXES FOR PERFORMANCE
-- =============================================================================

-- Index for user-based queries
CREATE INDEX IF NOT EXISTS idx_pipelines_user_id ON pipelines(user_id);

-- Index for status-based queries
CREATE INDEX IF NOT EXISTS idx_pipelines_status ON pipelines(status);

-- Composite index for user status lookups
CREATE INDEX IF NOT EXISTS idx_pipelines_user_status ON pipelines(user_id, status);

-- Index for recent pipelines
CREATE INDEX IF NOT EXISTS idx_pipelines_created_at ON pipelines(created_at DESC);

-- Index for mode-based queries
CREATE INDEX IF NOT EXISTS idx_pipelines_mode ON pipelines(mode);

-- Index for tier-based queries
CREATE INDEX IF NOT EXISTS idx_pipelines_tier ON pipelines(tier);

-- Index for features array queries
CREATE INDEX IF NOT EXISTS idx_pipelines_features ON pipelines USING gin(features);

-- Index for error details queries
CREATE INDEX IF NOT EXISTS idx_pipelines_error_details ON pipelines USING gin(error_details);

-- =============================================================================
-- 3. ROW-LEVEL SECURITY POLICIES
-- =============================================================================

-- Enable RLS on pipelines table
ALTER TABLE pipelines ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own pipelines
CREATE POLICY "Users can view their own pipelines"
  ON pipelines FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own pipelines
CREATE POLICY "Users can insert their own pipelines"
  ON pipelines FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own pipelines
CREATE POLICY "Users can update their own pipelines"
  ON pipelines FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own pipelines
CREATE POLICY "Users can delete their own pipelines"
  ON pipelines FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================================================
-- 4. TRIGGERS FOR AUTOMATIC UPDATES
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_pipelines_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_pipelines_updated_at
  BEFORE UPDATE ON pipelines
  FOR EACH ROW
  EXECUTE FUNCTION update_pipelines_updated_at();

-- Function to calculate duration when pipeline completes
CREATE OR REPLACE FUNCTION update_pipeline_duration()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate duration when status changes to success or failed
  IF NEW.status IN ('success', 'failed') AND OLD.status NOT IN ('success', 'failed') THEN
    NEW.completed_at = timezone('utc'::text, now());
    IF NEW.started_at IS NOT NULL THEN
      NEW.duration_seconds = EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at));
    END IF;
  END IF;
  
  -- Set started_at when status changes to running
  IF NEW.status = 'running' AND OLD.status != 'running' THEN
    NEW.started_at = timezone('utc'::text, now());
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update timestamps and duration
CREATE TRIGGER update_pipeline_timestamps
  BEFORE UPDATE ON pipelines
  FOR EACH ROW
  EXECUTE FUNCTION update_pipeline_duration();

-- =============================================================================
-- 5. UTILITY FUNCTIONS FOR PIPELINE MANAGEMENT
-- =============================================================================

-- Function to create a new pipeline
CREATE OR REPLACE FUNCTION create_pipeline(
  p_user_id UUID,
  p_mode TEXT,
  p_features JSONB,
  p_tier TEXT DEFAULT 'Pro'
)
RETURNS UUID AS $$
DECLARE
  pipeline_id UUID;
BEGIN
  INSERT INTO pipelines (
    user_id, mode, features, tier, status, current_step, progress
  ) VALUES (
    p_user_id, p_mode, p_features, p_tier, 'pending', 'initializing', 0
  ) RETURNING id INTO pipeline_id;
  
  RETURN pipeline_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update pipeline status
CREATE OR REPLACE FUNCTION update_pipeline_status(
  p_pipeline_id UUID,
  p_status TEXT,
  p_current_step TEXT DEFAULT NULL,
  p_progress INTEGER DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE pipelines
  SET 
    status = p_status,
    current_step = COALESCE(p_current_step, current_step),
    progress = COALESCE(p_progress, progress),
    error_message = COALESCE(p_error_message, error_message),
    updated_at = timezone('utc'::text, now())
  WHERE id = p_pipeline_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to link pipeline to generated content
CREATE OR REPLACE FUNCTION link_pipeline_content(
  p_pipeline_id UUID,
  p_slide_deck_id UUID DEFAULT NULL,
  p_narrated_deck_id UUID DEFAULT NULL,
  p_tts_narration_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE pipelines
  SET 
    slide_deck_id = COALESCE(p_slide_deck_id, slide_deck_id),
    narrated_deck_id = COALESCE(p_narrated_deck_id, narrated_deck_id),
    tts_narration_id = COALESCE(p_tts_narration_id, tts_narration_id),
    updated_at = timezone('utc'::text, now())
  WHERE id = p_pipeline_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get pipeline statistics for a user
CREATE OR REPLACE FUNCTION get_user_pipeline_stats(p_user_id UUID)
RETURNS TABLE (
  total_pipelines BIGINT,
  successful_pipelines BIGINT,
  failed_pipelines BIGINT,
  average_duration NUMERIC,
  total_processing_time BIGINT,
  mode_distribution JSONB,
  feature_usage JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_pipelines,
    COUNT(*) FILTER (WHERE status = 'success')::BIGINT as successful_pipelines,
    COUNT(*) FILTER (WHERE status = 'failed')::BIGINT as failed_pipelines,
    COALESCE(AVG(duration_seconds), 0) as average_duration,
    COALESCE(SUM(processing_time_ms), 0)::BIGINT as total_processing_time,
    jsonb_object_agg(mode, count) FILTER (WHERE mode IS NOT NULL) as mode_distribution,
    jsonb_object_agg(feature, count) FILTER (WHERE feature IS NOT NULL) as feature_usage
  FROM pipelines p
  LEFT JOIN LATERAL (
    SELECT jsonb_array_elements_text(features) as feature, COUNT(*) as count
    FROM pipelines
    WHERE user_id = p_user_id
    GROUP BY jsonb_array_elements_text(features)
  ) f ON true
  WHERE p.user_id = p_user_id
  GROUP BY p.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 6. VIEWS FOR ANALYTICS
-- =============================================================================

-- View for pipeline analytics
CREATE OR REPLACE VIEW pipeline_analytics AS
SELECT 
  p.id,
  p.user_id,
  p.mode,
  p.features,
  p.status,
  p.current_step,
  p.progress,
  p.error_message,
  p.processing_time_ms,
  p.duration_seconds,
  p.tier,
  p.created_at,
  p.updated_at,
  p.started_at,
  p.completed_at,
  sd.title as slide_deck_title,
  nd.title as narrated_deck_title,
  tn.audio_file_url as tts_audio_url
FROM pipelines p
LEFT JOIN slide_decks sd ON p.slide_deck_id = sd.id
LEFT JOIN narrated_decks nd ON p.narrated_deck_id = nd.id
LEFT JOIN tts_narrations tn ON p.tts_narration_id = tn.id;

-- View for pipeline performance metrics
CREATE OR REPLACE VIEW pipeline_performance AS
SELECT 
  mode,
  status,
  tier,
  COUNT(*) as pipeline_count,
  AVG(duration_seconds) as avg_duration,
  AVG(processing_time_ms) as avg_processing_time,
  MIN(duration_seconds) as min_duration,
  MAX(duration_seconds) as max_duration,
  AVG(progress) as avg_progress
FROM pipelines
WHERE status IN ('success', 'failed')
GROUP BY mode, status, tier;

-- View for user pipeline summary
CREATE OR REPLACE VIEW user_pipeline_summary AS
SELECT 
  user_id,
  tier,
  COUNT(*) as total_pipelines,
  COUNT(*) FILTER (WHERE status = 'success') as successful_pipelines,
  COUNT(*) FILTER (WHERE status = 'failed') as failed_pipelines,
  COUNT(*) FILTER (WHERE status = 'running') as running_pipelines,
  AVG(duration_seconds) as avg_duration,
  SUM(processing_time_ms) as total_processing_time,
  MAX(created_at) as last_pipeline_date
FROM pipelines
GROUP BY user_id, tier;

-- =============================================================================
-- 7. CONSTRAINTS AND VALIDATIONS
-- =============================================================================

-- Add constraints for data integrity
ALTER TABLE pipelines 
  ADD CONSTRAINT pipelines_features_not_empty CHECK (jsonb_array_length(features) > 0),
  ADD CONSTRAINT pipelines_progress_valid CHECK (progress >= 0 AND progress <= 100),
  ADD CONSTRAINT pipelines_duration_valid CHECK (duration_seconds >= 0),
  ADD CONSTRAINT pipelines_processing_time_valid CHECK (processing_time_ms >= 0);

-- =============================================================================
-- 8. COMMENTS FOR DOCUMENTATION
-- =============================================================================

COMMENT ON TABLE pipelines IS 'Tracks Doc-to-Video pipeline execution runs with status, progress, and relationships to generated content';
COMMENT ON COLUMN pipelines.mode IS 'Pipeline execution mode: auto, hybrid, or manual';
COMMENT ON COLUMN pipelines.features IS 'JSONB array of features used in this pipeline run';
COMMENT ON COLUMN pipelines.status IS 'Current status of the pipeline execution';
COMMENT ON COLUMN pipelines.current_step IS 'Current step being executed in the pipeline';
COMMENT ON COLUMN pipelines.progress IS 'Progress percentage (0-100) of pipeline execution';
COMMENT ON COLUMN pipelines.error_message IS 'Error message if pipeline failed';
COMMENT ON COLUMN pipelines.error_details IS 'JSONB object containing detailed error information';
COMMENT ON COLUMN pipelines.processing_time_ms IS 'Total processing time in milliseconds';
COMMENT ON COLUMN pipelines.duration_seconds IS 'Duration from start to completion in seconds';
COMMENT ON COLUMN pipelines.slide_deck_id IS 'Reference to generated slide deck';
COMMENT ON COLUMN pipelines.narrated_deck_id IS 'Reference to generated narrated deck';
COMMENT ON COLUMN pipelines.tts_narration_id IS 'Reference to generated TTS narration';
COMMENT ON COLUMN pipelines.document_text_hash IS 'Hash of input document for deduplication';
COMMENT ON COLUMN pipelines.document_word_count IS 'Word count of input document';
COMMENT ON COLUMN pipelines.tier IS 'User tier when pipeline was executed';

COMMENT ON VIEW pipeline_analytics IS 'Comprehensive view of pipeline data with related content information';
COMMENT ON VIEW pipeline_performance IS 'Performance metrics aggregated by mode, status, and tier';
COMMENT ON VIEW user_pipeline_summary IS 'Summary statistics for each user''s pipeline usage';

-- =============================================================================
-- 9. FUTURE ENHANCEMENTS (TODOs)
-- =============================================================================

/*
TODO: Future Pipeline Enhancements

1. REAL-TIME PROGRESS TRACKING:
   - Add WebSocket support for live progress updates
   - Implement progress callbacks for UI feedback
   - Add estimated completion time calculations

2. PIPELINE CACHING:
   - Add cache for frequently accessed pipeline data
   - Implement result caching for identical inputs
   - Add cache invalidation strategies

3. ADVANCED ERROR HANDLING:
   - Add retry mechanisms for failed pipelines
   - Implement circuit breaker pattern
   - Add error categorization and severity levels

4. PERFORMANCE OPTIMIZATION:
   - Add parallel execution support
   - Implement resource usage monitoring
   - Add performance profiling and optimization

5. SECURITY ENHANCEMENTS:
   - Add audit logging for pipeline operations
   - Implement rate limiting for pipeline creation
   - Add input validation and sanitization

6. MONITORING AND ALERTING:
   - Add pipeline failure notifications
   - Implement performance metrics dashboard
   - Add error rate monitoring and alerting

7. PIPELINE TEMPLATES:
   - Add predefined pipeline configurations
   - Implement custom pipeline builder
   - Add pipeline sharing and collaboration

8. ANALYTICS AND REPORTING:
   - Add detailed usage analytics
   - Implement cost tracking and optimization
   - Add user behavior analysis

9. INTEGRATION FEATURES:
   - Add webhook support for pipeline events
   - Implement API rate limiting
   - Add third-party service integration

10. SCALABILITY FEATURES:
    - Add pipeline queuing and prioritization
    - Implement load balancing for pipeline execution
    - Add multi-region pipeline support
*/

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================
-- This migration creates a comprehensive pipeline tracking system
-- with proper security, performance optimizations, and future-ready features.
-- =============================================================================
