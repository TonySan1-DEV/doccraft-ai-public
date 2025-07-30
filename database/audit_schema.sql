-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tier TEXT NOT NULL CHECK (tier IN ('Free', 'Pro', 'Admin')),
  role TEXT NOT NULL CHECK (role IN ('user', 'admin')),
  mcp_json JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tier ON audit_logs(tier);
CREATE INDEX IF NOT EXISTS idx_audit_logs_role ON audit_logs(role);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_timestamp ON audit_logs(user_id, timestamp DESC);

-- Enable Row Level Security
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for audit_logs
CREATE POLICY "Users can view their own audit logs" ON audit_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- Function to automatically log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
  p_user_id UUID,
  p_action TEXT,
  p_resource TEXT,
  p_details JSONB DEFAULT '{}'::jsonb,
  p_tier TEXT DEFAULT 'Free',
  p_role TEXT DEFAULT 'user',
  p_mcp_json JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO audit_logs (
    user_id, action, resource, details, tier, role, mcp_json
  ) VALUES (
    p_user_id, p_action, p_resource, p_details, p_tier, p_role, p_mcp_json
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get audit logs with filtering
CREATE OR REPLACE FUNCTION get_audit_logs(
  p_user_id UUID,
  p_is_admin BOOLEAN DEFAULT FALSE,
  p_action_filter TEXT DEFAULT NULL,
  p_resource_filter TEXT DEFAULT NULL,
  p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_limit INTEGER DEFAULT 100
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  action TEXT,
  resource TEXT,
  details JSONB,
  timestamp TIMESTAMP WITH TIME ZONE,
  tier TEXT,
  role TEXT,
  mcp_json JSONB,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.id,
    al.user_id,
    al.action,
    al.resource,
    al.details,
    al.timestamp,
    al.tier,
    al.role,
    al.mcp_json,
    al.created_at
  FROM audit_logs al
  WHERE 
    (p_is_admin OR al.user_id = p_user_id)
    AND (p_action_filter IS NULL OR al.action = p_action_filter)
    AND (p_resource_filter IS NULL OR al.resource = p_resource_filter)
    AND (p_start_date IS NULL OR al.timestamp >= p_start_date)
    AND (p_end_date IS NULL OR al.timestamp <= p_end_date)
  ORDER BY al.timestamp DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get audit statistics
CREATE OR REPLACE FUNCTION get_audit_stats(
  p_user_id UUID,
  p_is_admin BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
  total_events BIGINT,
  events_by_action JSONB,
  events_by_resource JSONB
) AS $$
DECLARE
  action_stats JSONB;
  resource_stats JSONB;
BEGIN
  -- Get action statistics
  SELECT jsonb_object_agg(action, count) INTO action_stats
  FROM (
    SELECT action, COUNT(*) as count
    FROM audit_logs
    WHERE (p_is_admin OR user_id = p_user_id)
    GROUP BY action
  ) action_counts;

  -- Get resource statistics
  SELECT jsonb_object_agg(resource, count) INTO resource_stats
  FROM (
    SELECT resource, COUNT(*) as count
    FROM audit_logs
    WHERE (p_is_admin OR user_id = p_user_id)
    GROUP BY resource
  ) resource_counts;

  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM audit_logs WHERE (p_is_admin OR user_id = p_user_id)),
    COALESCE(action_stats, '{}'::jsonb),
    COALESCE(resource_stats, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit log retention policy (optional)
-- This automatically deletes logs older than 1 year
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM audit_logs 
  WHERE timestamp < NOW() - INTERVAL '1 year';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a scheduled job to clean up old logs (if using pg_cron)
-- SELECT cron.schedule('cleanup-audit-logs', '0 2 * * *', 'SELECT cleanup_old_audit_logs();');

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION log_audit_event(UUID, TEXT, TEXT, JSONB, TEXT, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION get_audit_logs(UUID, BOOLEAN, TEXT, TEXT, TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_audit_stats(UUID, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_audit_logs() TO service_role; 