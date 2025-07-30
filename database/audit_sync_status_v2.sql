-- Enhanced Audit Sync Status Table
-- Tracks audit export operations with comprehensive metadata and indexing

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing table if it exists (for migration)
DROP TABLE IF EXISTS audit_sync_status CASCADE;

-- Create enhanced audit_sync_status table
CREATE TABLE IF NOT EXISTS audit_sync_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('success', 'failure')),
  destination TEXT NOT NULL CHECK (destination IN ('S3', 'BigQuery', 'Postgres', 'Azure')),
  duration_ms INTEGER NOT NULL,
  error_message TEXT,
  records_exported INTEGER,
  environment TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create comprehensive indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_sync_status_timestamp ON audit_sync_status(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_sync_status_status ON audit_sync_status(status);
CREATE INDEX IF NOT EXISTS idx_audit_sync_status_destination ON audit_sync_status(destination);
CREATE INDEX IF NOT EXISTS idx_audit_sync_status_environment ON audit_sync_status(environment);
CREATE INDEX IF NOT EXISTS idx_audit_sync_status_created_at ON audit_sync_status(created_at DESC);

-- Create composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_audit_sync_status_timestamp_status ON audit_sync_status(timestamp DESC, status);
CREATE INDEX IF NOT EXISTS idx_audit_sync_status_destination_status ON audit_sync_status(destination, status);
CREATE INDEX IF NOT EXISTS idx_audit_sync_status_environment_status ON audit_sync_status(environment, status);

-- Create partial indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_sync_status_failures ON audit_sync_status(timestamp DESC) WHERE status = 'failure';
CREATE INDEX IF NOT EXISTS idx_audit_sync_status_recent ON audit_sync_status(timestamp DESC) WHERE timestamp > NOW() - INTERVAL '30 days';

-- Create GIN index for JSONB metadata queries
CREATE INDEX IF NOT EXISTS idx_audit_sync_status_metadata ON audit_sync_status USING GIN (metadata);

-- Add RLS (Row Level Security) policies
ALTER TABLE audit_sync_status ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view sync status
CREATE POLICY "admins_can_view_sync_status" ON audit_sync_status
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.role IN ('admin')
    )
  );

-- Policy: System can insert sync status (for API endpoints and cron jobs)
CREATE POLICY "system_can_insert_sync_status" ON audit_sync_status
  FOR INSERT WITH CHECK (true);

-- Policy: Only admins can update sync status
CREATE POLICY "admins_can_update_sync_status" ON audit_sync_status
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.role IN ('admin')
    )
  );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_audit_sync_status_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_audit_sync_status_updated_at 
  BEFORE UPDATE ON audit_sync_status 
  FOR EACH ROW EXECUTE FUNCTION update_audit_sync_status_updated_at();

-- Add comments for documentation
COMMENT ON TABLE audit_sync_status IS 'Enhanced tracking of audit export operations with comprehensive metadata';
COMMENT ON COLUMN audit_sync_status.timestamp IS 'When the sync operation occurred';
COMMENT ON COLUMN audit_sync_status.status IS 'Status of the sync operation: success or failure';
COMMENT ON COLUMN audit_sync_status.destination IS 'Destination of the export: S3, BigQuery, Postgres, or Azure';
COMMENT ON COLUMN audit_sync_status.duration_ms IS 'Duration of the sync operation in milliseconds';
COMMENT ON COLUMN audit_sync_status.error_message IS 'Error message if the sync failed';
COMMENT ON COLUMN audit_sync_status.records_exported IS 'Number of records exported';
COMMENT ON COLUMN audit_sync_status.environment IS 'Environment where the sync occurred';
COMMENT ON COLUMN audit_sync_status.metadata IS 'Additional JSON metadata for debugging and monitoring';

-- Create enhanced view for easy querying of sync statistics
CREATE OR REPLACE VIEW audit_sync_stats AS
SELECT 
  DATE(timestamp) as sync_date,
  destination,
  environment,
  COUNT(*) as total_syncs,
  COUNT(*) FILTER (WHERE status = 'success') as success_count,
  COUNT(*) FILTER (WHERE status = 'failure') as failure_count,
  AVG(duration_ms) as avg_duration_ms,
  MIN(timestamp) as first_sync,
  MAX(timestamp) as last_sync,
  SUM(records_exported) as total_records_exported
FROM audit_sync_status
GROUP BY DATE(timestamp), destination, environment
ORDER BY sync_date DESC, destination, environment;

-- Create function to get sync summary with date range
CREATE OR REPLACE FUNCTION get_sync_summary(
  start_date TIMESTAMPTZ DEFAULT NULL,
  end_date TIMESTAMPTZ DEFAULT NULL,
  destination_filter TEXT DEFAULT NULL,
  environment_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
  total_syncs BIGINT,
  success_count BIGINT,
  failure_count BIGINT,
  avg_duration_ms NUMERIC,
  total_records_exported BIGINT,
  last_sync_time TIMESTAMPTZ,
  last_sync_status TEXT,
  success_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_syncs,
    COUNT(*) FILTER (WHERE status = 'success') as success_count,
    COUNT(*) FILTER (WHERE status = 'failure') as failure_count,
    AVG(duration_ms) as avg_duration_ms,
    COALESCE(SUM(records_exported), 0) as total_records_exported,
    MAX(timestamp) as last_sync_time,
    (SELECT status FROM audit_sync_status 
     WHERE timestamp = (SELECT MAX(timestamp) FROM audit_sync_status) 
     LIMIT 1) as last_sync_status,
    CASE 
      WHEN COUNT(*) > 0 THEN 
        ROUND((COUNT(*) FILTER (WHERE status = 'success')::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)
      ELSE 0 
    END as success_rate
  FROM audit_sync_status
  WHERE (start_date IS NULL OR timestamp >= start_date)
    AND (end_date IS NULL OR timestamp <= end_date)
    AND (destination_filter IS NULL OR destination = destination_filter)
    AND (environment_filter IS NULL OR environment = environment_filter);
END;
$$ LANGUAGE plpgsql;

-- Create function to get recent failures
CREATE OR REPLACE FUNCTION get_recent_failures(hours_back INTEGER DEFAULT 24)
RETURNS TABLE (
  id UUID,
  timestamp TIMESTAMPTZ,
  destination TEXT,
  environment TEXT,
  error_message TEXT,
  duration_ms INTEGER,
  metadata JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ass.id,
    ass.timestamp,
    ass.destination,
    ass.environment,
    ass.error_message,
    ass.duration_ms,
    ass.metadata
  FROM audit_sync_status ass
  WHERE ass.status = 'failure'
    AND ass.timestamp >= NOW() - (hours_back || ' hours')::INTERVAL
  ORDER BY ass.timestamp DESC;
END;
$$ LANGUAGE plpgsql;

-- Create function to clean old records (for maintenance)
CREATE OR REPLACE FUNCTION cleanup_old_sync_records(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM audit_sync_status 
  WHERE timestamp < NOW() - (days_to_keep || ' days')::INTERVAL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT SELECT ON audit_sync_status TO authenticated;
GRANT INSERT ON audit_sync_status TO authenticated;
GRANT UPDATE ON audit_sync_status TO authenticated;
GRANT SELECT ON audit_sync_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_sync_summary TO authenticated;
GRANT EXECUTE ON FUNCTION get_recent_failures TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_sync_records TO authenticated; 