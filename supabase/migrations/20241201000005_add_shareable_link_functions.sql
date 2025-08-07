-- Migration: Add shareable link functions and telemetry events table
-- Date: 2024-12-01
-- Description: Functions for shareable link access tracking and telemetry logging

-- =============================================================================
-- 1. TELEMETRY EVENTS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS telemetry_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pipeline_id UUID REFERENCES pipelines(id) ON DELETE CASCADE,
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for telemetry events
CREATE INDEX IF NOT EXISTS idx_telemetry_events_event_type ON telemetry_events(event_type);
CREATE INDEX IF NOT EXISTS idx_telemetry_events_user_id ON telemetry_events(user_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_events_pipeline_id ON telemetry_events(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_events_timestamp ON telemetry_events(timestamp);

-- RLS policies for telemetry events
ALTER TABLE telemetry_events ENABLE ROW LEVEL SECURITY;

-- Users can view their own telemetry events
CREATE POLICY "Users can view own telemetry events" ON telemetry_events
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own telemetry events
CREATE POLICY "Users can insert own telemetry events" ON telemetry_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view all telemetry events
CREATE POLICY "Admins can view all telemetry events" ON telemetry_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.tier = 'Admin'
    )
  );

-- =============================================================================
-- 2. SHAREABLE LINK FUNCTIONS
-- =============================================================================

-- Function to increment shareable link access count
CREATE OR REPLACE FUNCTION increment_shareable_link_access_count(
  p_token TEXT,
  p_pipeline_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Update the access count for the most recent created event with this token
  UPDATE sharable_link_events
  SET 
    access_count = COALESCE(access_count, 0) + 1,
    updated_at = timezone('utc'::text, now())
  WHERE link_token = p_token 
    AND pipeline_id = p_pipeline_id
    AND event_type = 'created'
    AND id = (
      SELECT id FROM sharable_link_events 
      WHERE link_token = p_token 
        AND pipeline_id = p_pipeline_id 
        AND event_type = 'created'
      ORDER BY timestamp DESC 
      LIMIT 1
    );
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a shareable link
CREATE OR REPLACE FUNCTION create_shareable_link(
  p_pipeline_id UUID,
  p_user_id UUID,
  p_token TEXT DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
  generated_token TEXT;
BEGIN
  -- Generate token if not provided
  IF p_token IS NULL THEN
    generated_token := encode(gen_random_bytes(32), 'hex');
  ELSE
    generated_token := p_token;
  END IF;

  -- Insert the shareable link event
  INSERT INTO sharable_link_events (
    pipeline_id,
    user_id,
    event_type,
    link_token,
    tier_at_time
  ) VALUES (
    p_pipeline_id,
    p_user_id,
    'created',
    generated_token,
    (SELECT tier FROM profiles WHERE id = p_user_id)
  );

  RETURN generated_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to revoke a shareable link
CREATE OR REPLACE FUNCTION revoke_shareable_link(
  p_token TEXT,
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Insert revocation event
  INSERT INTO sharable_link_events (
    pipeline_id,
    user_id,
    event_type,
    link_token,
    tier_at_time
  )
  SELECT 
    pipeline_id,
    p_user_id,
    'revoked',
    p_token,
    tier_at_time
  FROM sharable_link_events
  WHERE link_token = p_token 
    AND event_type = 'created'
    AND user_id = p_user_id
  ORDER BY timestamp DESC
  LIMIT 1;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get shareable link statistics
CREATE OR REPLACE FUNCTION get_shareable_link_stats(
  p_pipeline_id UUID,
  p_user_id UUID
)
RETURNS TABLE (
  total_links INTEGER,
  active_links INTEGER,
  total_accesses INTEGER,
  unique_visitors INTEGER,
  last_accessed TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT sle.link_token)::INTEGER as total_links,
    COUNT(DISTINCT CASE WHEN sle.event_type = 'created' AND NOT EXISTS (
      SELECT 1 FROM sharable_link_events sle2 
      WHERE sle2.link_token = sle.link_token 
        AND sle2.event_type = 'revoked'
        AND sle2.timestamp > sle.timestamp
    ) THEN sle.link_token END)::INTEGER as active_links,
    COALESCE(SUM(sle.access_count), 0)::INTEGER as total_accesses,
    COALESCE(SUM(sle.unique_visitors), 0)::INTEGER as unique_visitors,
    MAX(sle.timestamp) as last_accessed
  FROM sharable_link_events sle
  WHERE sle.pipeline_id = p_pipeline_id
    AND sle.user_id = p_user_id
    AND sle.event_type = 'created';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 3. TELEMETRY FUNCTIONS
-- =============================================================================

-- Function to log telemetry events
CREATE OR REPLACE FUNCTION log_telemetry_event(
  p_event_type TEXT,
  p_user_id UUID DEFAULT NULL,
  p_pipeline_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO telemetry_events (
    event_type,
    user_id,
    pipeline_id,
    metadata
  ) VALUES (
    p_event_type,
    p_user_id,
    p_pipeline_id,
    p_metadata
  ) RETURNING id INTO event_id;

  RETURN event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get telemetry statistics
CREATE OR REPLACE FUNCTION get_telemetry_stats(
  p_user_id UUID DEFAULT NULL,
  p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS TABLE (
  event_type TEXT,
  event_count BIGINT,
  unique_users BIGINT,
  last_occurrence TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    te.event_type,
    COUNT(*)::BIGINT as event_count,
    COUNT(DISTINCT te.user_id)::BIGINT as unique_users,
    MAX(te.timestamp) as last_occurrence
  FROM telemetry_events te
  WHERE (p_user_id IS NULL OR te.user_id = p_user_id)
    AND (p_start_date IS NULL OR te.timestamp >= p_start_date)
    AND (p_end_date IS NULL OR te.timestamp <= p_end_date)
  GROUP BY te.event_type
  ORDER BY event_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 4. COMMENTS AND DOCUMENTATION
-- =============================================================================

COMMENT ON TABLE telemetry_events IS 'Telemetry events for analytics and monitoring';
COMMENT ON COLUMN telemetry_events.event_type IS 'Type of telemetry event';
COMMENT ON COLUMN telemetry_events.metadata IS 'Additional event metadata as JSON';

COMMENT ON FUNCTION increment_shareable_link_access_count IS 'Increment access count for a shareable link';
COMMENT ON FUNCTION create_shareable_link IS 'Create a new shareable link for a pipeline';
COMMENT ON FUNCTION revoke_shareable_link IS 'Revoke a shareable link';
COMMENT ON FUNCTION get_shareable_link_stats IS 'Get statistics for shareable links';

COMMENT ON FUNCTION log_telemetry_event IS 'Log a telemetry event';
COMMENT ON FUNCTION get_telemetry_stats IS 'Get telemetry statistics';

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================
