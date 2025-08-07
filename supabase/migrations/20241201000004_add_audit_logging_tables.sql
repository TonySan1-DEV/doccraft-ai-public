-- =============================================================================
-- AUDIT LOGGING FOR PIPELINE ASSET ACCESS
-- =============================================================================
-- Migration: 20241201000004_add_audit_logging_tables.sql
-- Purpose: Track asset downloads and shareable link usage for security and analytics
-- Author: DocCraft-AI Team
-- Date: 2024-12-01

-- =============================================================================
-- 1. ASSET DOWNLOAD EVENTS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS asset_download_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pipeline_id UUID REFERENCES pipelines(id) ON DELETE CASCADE NOT NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('slide', 'script', 'audio')),
  asset_id UUID, -- References specific asset (slide_deck_id, narrated_deck_id, tts_narration_id)
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_agent TEXT,
  ip_address INET,
  tier_at_time TEXT NOT NULL DEFAULT 'Free' CHECK (tier_at_time IN ('Free', 'Basic', 'Pro', 'Premium')),
  download_method TEXT NOT NULL DEFAULT 'signed_url' CHECK (download_method IN ('signed_url', 'direct', 'preview')),
  file_size_bytes BIGINT,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  
  -- Metadata for analytics
  session_id TEXT,
  referrer TEXT,
  country_code TEXT,
  device_type TEXT CHECK (device_type IN ('desktop', 'mobile', 'tablet', 'unknown')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =============================================================================
-- 2. SHAREABLE LINK EVENTS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS sharable_link_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pipeline_id UUID REFERENCES pipelines(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('created', 'accessed', 'expired', 'revoked')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  referrer TEXT,
  tier_at_time TEXT NOT NULL DEFAULT 'Free' CHECK (tier_at_time IN ('Free', 'Basic', 'Pro', 'Premium')),
  
  -- Link metadata
  link_token TEXT, -- For future tokenized links
  access_count INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  
  -- Visitor tracking
  visitor_ip INET,
  visitor_user_agent TEXT,
  visitor_country TEXT,
  visitor_device_type TEXT CHECK (visitor_device_type IN ('desktop', 'mobile', 'tablet', 'unknown')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =============================================================================
-- 3. INDEXES FOR PERFORMANCE
-- =============================================================================

-- Asset download events indexes
CREATE INDEX IF NOT EXISTS idx_asset_download_events_user_id ON asset_download_events(user_id);
CREATE INDEX IF NOT EXISTS idx_asset_download_events_pipeline_id ON asset_download_events(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_asset_download_events_asset_type ON asset_download_events(asset_type);
CREATE INDEX IF NOT EXISTS idx_asset_download_events_timestamp ON asset_download_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_asset_download_events_tier ON asset_download_events(tier_at_time);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_asset_download_events_user_timestamp ON asset_download_events(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_asset_download_events_pipeline_asset ON asset_download_events(pipeline_id, asset_type);

-- Shareable link events indexes
CREATE INDEX IF NOT EXISTS idx_sharable_link_events_user_id ON sharable_link_events(user_id);
CREATE INDEX IF NOT EXISTS idx_sharable_link_events_pipeline_id ON sharable_link_events(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_sharable_link_events_event_type ON sharable_link_events(event_type);
CREATE INDEX IF NOT EXISTS idx_sharable_link_events_timestamp ON sharable_link_events(timestamp);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_sharable_link_events_user_timestamp ON sharable_link_events(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_sharable_link_events_pipeline_type ON sharable_link_events(pipeline_id, event_type);

-- =============================================================================
-- 4. TRIGGERS FOR AUTOMATIC UPDATES
-- =============================================================================

-- Trigger function for asset_download_events
CREATE OR REPLACE FUNCTION update_asset_download_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for asset_download_events
CREATE TRIGGER update_asset_download_events_updated_at
  BEFORE UPDATE ON asset_download_events
  FOR EACH ROW
  EXECUTE FUNCTION update_asset_download_events_updated_at();

-- Trigger function for sharable_link_events
CREATE OR REPLACE FUNCTION update_sharable_link_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for sharable_link_events
CREATE TRIGGER update_sharable_link_events_updated_at
  BEFORE UPDATE ON sharable_link_events
  FOR EACH ROW
  EXECUTE FUNCTION update_sharable_link_events_updated_at();

-- =============================================================================
-- 5. UTILITY FUNCTIONS FOR AUDIT LOGGING
-- =============================================================================

-- Function to log asset download event
CREATE OR REPLACE FUNCTION log_asset_download(
  p_user_id UUID,
  p_pipeline_id UUID,
  p_asset_type TEXT,
  p_asset_id UUID DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_tier_at_time TEXT DEFAULT 'Free',
  p_download_method TEXT DEFAULT 'signed_url',
  p_file_size_bytes BIGINT DEFAULT NULL,
  p_success BOOLEAN DEFAULT true,
  p_error_message TEXT DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL,
  p_referrer TEXT DEFAULT NULL,
  p_country_code TEXT DEFAULT NULL,
  p_device_type TEXT DEFAULT 'unknown'
)
RETURNS UUID AS $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO asset_download_events (
    user_id,
    pipeline_id,
    asset_type,
    asset_id,
    user_agent,
    ip_address,
    tier_at_time,
    download_method,
    file_size_bytes,
    success,
    error_message,
    session_id,
    referrer,
    country_code,
    device_type
  ) VALUES (
    p_user_id,
    p_pipeline_id,
    p_asset_type,
    p_asset_id,
    p_user_agent,
    p_ip_address,
    p_tier_at_time,
    p_download_method,
    p_file_size_bytes,
    p_success,
    p_error_message,
    p_session_id,
    p_referrer,
    p_country_code,
    p_device_type
  ) RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log shareable link event
CREATE OR REPLACE FUNCTION log_sharable_link_event(
  p_user_id UUID,
  p_pipeline_id UUID,
  p_event_type TEXT,
  p_referrer TEXT DEFAULT NULL,
  p_tier_at_time TEXT DEFAULT 'Free',
  p_link_token TEXT DEFAULT NULL,
  p_visitor_ip INET DEFAULT NULL,
  p_visitor_user_agent TEXT DEFAULT NULL,
  p_visitor_country TEXT DEFAULT NULL,
  p_visitor_device_type TEXT DEFAULT 'unknown'
)
RETURNS UUID AS $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO sharable_link_events (
    user_id,
    pipeline_id,
    event_type,
    referrer,
    tier_at_time,
    link_token,
    visitor_ip,
    visitor_user_agent,
    visitor_country,
    visitor_device_type
  ) VALUES (
    p_user_id,
    p_pipeline_id,
    p_event_type,
    p_referrer,
    p_tier_at_time,
    p_link_token,
    p_visitor_ip,
    p_visitor_user_agent,
    p_visitor_country,
    p_visitor_device_type
  ) RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 6. ANALYTICS VIEWS
-- =============================================================================

-- View for asset download statistics
CREATE OR REPLACE VIEW asset_download_stats AS
SELECT 
  user_id,
  pipeline_id,
  asset_type,
  COUNT(*) as total_downloads,
  COUNT(*) FILTER (WHERE success = true) as successful_downloads,
  COUNT(*) FILTER (WHERE success = false) as failed_downloads,
  AVG(file_size_bytes) as avg_file_size,
  SUM(file_size_bytes) as total_bytes_downloaded,
  MIN(timestamp) as first_download,
  MAX(timestamp) as last_download,
  COUNT(DISTINCT DATE(timestamp)) as unique_download_days
FROM asset_download_events
GROUP BY user_id, pipeline_id, asset_type;

-- View for shareable link statistics
CREATE OR REPLACE VIEW sharable_link_stats AS
SELECT 
  user_id,
  pipeline_id,
  COUNT(*) FILTER (WHERE event_type = 'created') as links_created,
  COUNT(*) FILTER (WHERE event_type = 'accessed') as links_accessed,
  COUNT(*) FILTER (WHERE event_type = 'expired') as links_expired,
  COUNT(*) FILTER (WHERE event_type = 'revoked') as links_revoked,
  MIN(timestamp) as first_event,
  MAX(timestamp) as last_event
FROM sharable_link_events
GROUP BY user_id, pipeline_id;

-- View for user tier usage analytics
CREATE OR REPLACE VIEW tier_usage_analytics AS
SELECT 
  tier_at_time,
  asset_type,
  COUNT(*) as total_events,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT pipeline_id) as unique_pipelines,
  AVG(file_size_bytes) as avg_file_size,
  SUM(file_size_bytes) as total_bytes
FROM asset_download_events
WHERE success = true
GROUP BY tier_at_time, asset_type
ORDER BY tier_at_time, asset_type;

-- =============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on audit tables
ALTER TABLE asset_download_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE sharable_link_events ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own download events
CREATE POLICY "Users can view own download events" ON asset_download_events
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own download events
CREATE POLICY "Users can insert own download events" ON asset_download_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only see their own shareable link events
CREATE POLICY "Users can view own shareable link events" ON sharable_link_events
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own shareable link events
CREATE POLICY "Users can insert own shareable link events" ON sharable_link_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can see all events (requires admin role)
CREATE POLICY "Admins can view all download events" ON asset_download_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admins can view all shareable link events" ON sharable_link_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- =============================================================================
-- 8. GRANTS AND PERMISSIONS
-- =============================================================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT ON asset_download_events TO authenticated;
GRANT SELECT, INSERT ON sharable_link_events TO authenticated;

-- Grant permissions on views
GRANT SELECT ON asset_download_stats TO authenticated;
GRANT SELECT ON sharable_link_stats TO authenticated;
GRANT SELECT ON tier_usage_analytics TO authenticated;

-- Grant usage on sequences (if any)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =============================================================================
-- 9. COMMENTS FOR DOCUMENTATION
-- =============================================================================

COMMENT ON TABLE asset_download_events IS 'Audit log for pipeline asset downloads (slides, scripts, audio)';
COMMENT ON TABLE sharable_link_events IS 'Audit log for shareable link creation and access';
COMMENT ON VIEW asset_download_stats IS 'Aggregated statistics for asset downloads per user/pipeline';
COMMENT ON VIEW sharable_link_stats IS 'Aggregated statistics for shareable link usage';
COMMENT ON VIEW tier_usage_analytics IS 'Analytics view for tier-based usage patterns';

COMMENT ON COLUMN asset_download_events.asset_type IS 'Type of asset: slide, script, or audio';
COMMENT ON COLUMN asset_download_events.download_method IS 'How the asset was downloaded: signed_url, direct, or preview';
COMMENT ON COLUMN asset_download_events.tier_at_time IS 'User tier when download occurred';
COMMENT ON COLUMN sharable_link_events.event_type IS 'Type of event: created, accessed, expired, or revoked';
COMMENT ON COLUMN sharable_link_events.link_token IS 'Future: tokenized link for public access';

-- =============================================================================
-- 10. FUTURE-PROOFING FOR PUBLIC ACCESS
-- =============================================================================

-- TODO: Add support for tokenized public links
-- This will require additional tables and functions for:
-- - Public link tokens
-- - Anonymous access tracking
-- - Rate limiting
-- - Expiration management

-- Example future structure:
-- CREATE TABLE IF NOT EXISTS public_link_tokens (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   pipeline_id UUID REFERENCES pipelines(id) ON DELETE CASCADE NOT NULL,
--   token_hash TEXT UNIQUE NOT NULL,
--   created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
--   expires_at TIMESTAMP WITH TIME ZONE,
--   max_access_count INTEGER,
--   current_access_count INTEGER DEFAULT 0,
--   is_active BOOLEAN DEFAULT true,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
-- );

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================
-- This migration adds comprehensive audit logging for pipeline asset access
-- while maintaining security through RLS policies and providing analytics views
-- for usage tracking and upgrade nudges.
