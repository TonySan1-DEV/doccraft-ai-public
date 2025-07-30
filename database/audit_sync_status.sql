-- Audit Sync Status Table
-- Tracks audit export operations and their status for monitoring

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create audit_sync_status table
CREATE TABLE IF NOT EXISTS audit_sync_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('success', 'failure')),
  destination TEXT NOT NULL CHECK (destination IN ('S3', 'BigQuery')),
  duration_ms INTEGER NOT NULL,
  error_message TEXT,
  records_exported INTEGER,
  environment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_sync_status_timestamp ON audit_sync_status(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_sync_status_status ON audit_sync_status(status);
CREATE INDEX IF NOT EXISTS idx_audit_sync_status_destination ON audit_sync_status(destination);
CREATE INDEX IF NOT EXISTS idx_audit_sync_status_environment ON audit_sync_status(environment);

-- Create composite index for common queries
CREATE INDEX IF NOT EXISTS idx_audit_sync_status_timestamp_status ON audit_sync_status(timestamp, status);
CREATE INDEX IF NOT EXISTS idx_audit_sync_status_destination_status ON audit_sync_status(destination, status);

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

-- Policy: System can insert sync status (for API endpoints)
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
COMMENT ON TABLE audit_sync_status IS 'Tracks audit export operations and their status for monitoring';
COMMENT ON COLUMN audit_sync_status.timestamp IS 'When the sync operation occurred';
COMMENT ON COLUMN audit_sync_status.status IS 'Status of the sync operation: success or failure';
COMMENT ON COLUMN audit_sync_status.destination IS 'Destination of the export: S3 or BigQuery';
COMMENT ON COLUMN audit_sync_status.duration_ms IS 'Duration of the sync operation in milliseconds';
COMMENT ON COLUMN audit_sync_status.error_message IS 'Error message if the sync failed';
COMMENT ON COLUMN audit_sync_status.records_exported IS 'Number of records exported';
COMMENT ON COLUMN audit_sync_status.environment IS 'Environment where the sync occurred';

-- Create view for easy querying of sync statistics
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
  MAX(timestamp) as last_sync
FROM audit_sync_status
GROUP BY DATE(timestamp), destination, environment
ORDER BY sync_date DESC, destination, environment;

-- Create function to get sync summary
CREATE OR REPLACE FUNCTION get_sync_summary(
  start_date TIMESTAMPTZ DEFAULT NULL,
  end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  total_syncs BIGINT,
  success_count BIGINT,
  failure_count BIGINT,
  avg_duration_ms NUMERIC,
  last_sync_time TIMESTAMPTZ,
  last_sync_status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_syncs,
    COUNT(*) FILTER (WHERE status = 'success') as success_count,
    COUNT(*) FILTER (WHERE status = 'failure') as failure_count,
    AVG(duration_ms) as avg_duration_ms,
    MAX(timestamp) as last_sync_time,
    (SELECT status FROM audit_sync_status 
     WHERE timestamp = (SELECT MAX(timestamp) FROM audit_sync_status) 
     LIMIT 1) as last_sync_status
  FROM audit_sync_status
  WHERE (start_date IS NULL OR timestamp >= start_date)
    AND (end_date IS NULL OR timestamp <= end_date);
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT SELECT ON audit_sync_status TO authenticated;
GRANT INSERT ON audit_sync_status TO authenticated;
GRANT UPDATE ON audit_sync_status TO authenticated;
GRANT SELECT ON audit_sync_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_sync_summary TO authenticated; 