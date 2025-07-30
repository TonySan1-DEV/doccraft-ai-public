-- Sync Errors Table
-- Tracks audit sync failures and other system errors for monitoring

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create sync_errors table
CREATE TABLE IF NOT EXISTS sync_errors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  context TEXT,
  export_type TEXT,
  retry_count INTEGER DEFAULT 0,
  environment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'ignored')),
  resolution_notes TEXT,
  assigned_to UUID REFERENCES auth.users(id),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical'))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sync_errors_error_type ON sync_errors(error_type);
CREATE INDEX IF NOT EXISTS idx_sync_errors_status ON sync_errors(status);
CREATE INDEX IF NOT EXISTS idx_sync_errors_created_at ON sync_errors(created_at);
CREATE INDEX IF NOT EXISTS idx_sync_errors_export_type ON sync_errors(export_type);

-- Create composite index for common queries
CREATE INDEX IF NOT EXISTS idx_sync_errors_type_status ON sync_errors(error_type, status);
CREATE INDEX IF NOT EXISTS idx_sync_errors_created_status ON sync_errors(created_at, status);

-- Add RLS (Row Level Security) policies
ALTER TABLE sync_errors ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view sync errors
CREATE POLICY "admins_can_view_sync_errors" ON sync_errors
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.role IN ('admin')
    )
  );

-- Policy: System can insert sync errors (for API endpoints)
CREATE POLICY "system_can_insert_sync_errors" ON sync_errors
  FOR INSERT WITH CHECK (true);

-- Policy: Only admins can update sync errors
CREATE POLICY "admins_can_update_sync_errors" ON sync_errors
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.role IN ('admin')
    )
  );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_sync_errors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sync_errors_updated_at 
  BEFORE UPDATE ON sync_errors 
  FOR EACH ROW EXECUTE FUNCTION update_sync_errors_updated_at();

-- Add comments for documentation
COMMENT ON TABLE sync_errors IS 'Tracks system errors and sync failures for monitoring and alerting';
COMMENT ON COLUMN sync_errors.error_type IS 'Type of error (e.g., audit_export_failure, sync_timeout)';
COMMENT ON COLUMN sync_errors.error_message IS 'Detailed error message (sanitized)';
COMMENT ON COLUMN sync_errors.context IS 'Context where the error occurred';
COMMENT ON COLUMN sync_errors.export_type IS 'Type of export that failed (s3, bigquery)';
COMMENT ON COLUMN sync_errors.retry_count IS 'Number of retry attempts made';
COMMENT ON COLUMN sync_errors.environment IS 'Environment where error occurred (dev, staging, prod)';
COMMENT ON COLUMN sync_errors.status IS 'Current status of the error (open, resolved, ignored)';
COMMENT ON COLUMN sync_errors.priority IS 'Priority level for resolution';

-- Create view for easy querying of open errors
CREATE OR REPLACE VIEW open_sync_errors AS
SELECT 
  id,
  error_type,
  error_message,
  context,
  export_type,
  retry_count,
  environment,
  created_at,
  status,
  priority,
  CASE 
    WHEN created_at < NOW() - INTERVAL '1 hour' THEN 'high'
    WHEN created_at < NOW() - INTERVAL '30 minutes' THEN 'medium'
    ELSE 'low'
  END as urgency
FROM sync_errors
WHERE status = 'open'
ORDER BY 
  CASE priority
    WHEN 'critical' THEN 1
    WHEN 'high' THEN 2
    WHEN 'medium' THEN 3
    WHEN 'low' THEN 4
  END,
  created_at DESC;

-- Create function to resolve errors
CREATE OR REPLACE FUNCTION resolve_sync_error(
  error_id UUID,
  resolution_notes TEXT DEFAULT NULL,
  resolved_by UUID DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  UPDATE sync_errors 
  SET 
    status = 'resolved',
    resolved_at = NOW(),
    resolution_notes = COALESCE(resolution_notes, resolution_notes),
    assigned_to = COALESCE(resolved_by, assigned_to)
  WHERE id = error_id;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT SELECT ON sync_errors TO authenticated;
GRANT INSERT ON sync_errors TO authenticated;
GRANT UPDATE ON sync_errors TO authenticated;
GRANT SELECT ON open_sync_errors TO authenticated;
GRANT EXECUTE ON FUNCTION resolve_sync_error TO authenticated; 