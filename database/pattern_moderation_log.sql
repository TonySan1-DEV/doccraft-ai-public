-- Pattern Moderation Audit Log Table
-- Tracks all moderation actions for transparency and compliance

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create pattern_moderation_log table
CREATE TABLE IF NOT EXISTS pattern_moderation_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pattern_id UUID NOT NULL REFERENCES user_prompt_patterns(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('approve', 'reject', 'revert')),
  moderator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  reason TEXT,
  note TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pattern_moderation_log_pattern_id ON pattern_moderation_log(pattern_id);
CREATE INDEX IF NOT EXISTS idx_pattern_moderation_log_action ON pattern_moderation_log(action);
CREATE INDEX IF NOT EXISTS idx_pattern_moderation_log_moderator_id ON pattern_moderation_log(moderator_id);
CREATE INDEX IF NOT EXISTS idx_pattern_moderation_log_created_at ON pattern_moderation_log(created_at);

-- Create composite index for common queries
CREATE INDEX IF NOT EXISTS idx_pattern_moderation_log_pattern_action ON pattern_moderation_log(pattern_id, action);

-- Add RLS (Row Level Security) policies
ALTER TABLE pattern_moderation_log ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view moderation logs
CREATE POLICY "admins_can_view_moderation_logs" ON pattern_moderation_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.role IN ('admin')
    )
  );

-- Policy: System can insert moderation logs (for API endpoints)
CREATE POLICY "system_can_insert_moderation_logs" ON pattern_moderation_log
  FOR INSERT WITH CHECK (true);

-- Policy: Only admins can update moderation logs
CREATE POLICY "admins_can_update_moderation_logs" ON pattern_moderation_log
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.role IN ('admin')
    )
  );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pattern_moderation_log_updated_at 
  BEFORE UPDATE ON pattern_moderation_log 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE pattern_moderation_log IS 'Audit trail for all pattern moderation actions';
COMMENT ON COLUMN pattern_moderation_log.pattern_id IS 'Reference to the moderated pattern';
COMMENT ON COLUMN pattern_moderation_log.action IS 'Type of moderation action: approve, reject, or revert';
COMMENT ON COLUMN pattern_moderation_log.moderator_id IS 'User ID of the admin who performed the action';
COMMENT ON COLUMN pattern_moderation_log.reason IS 'Optional reason for rejection or revert';
COMMENT ON COLUMN pattern_moderation_log.note IS 'Optional moderation note';
COMMENT ON COLUMN pattern_moderation_log.ip_address IS 'IP address of the moderator for security tracking';
COMMENT ON COLUMN pattern_moderation_log.user_agent IS 'User agent string for security tracking';

-- Create view for easy querying of moderation history
CREATE OR REPLACE VIEW pattern_moderation_history AS
SELECT 
  pml.id,
  pml.pattern_id,
  upp.genre,
  upp.arc,
  upp.pattern,
  pml.action,
  pml.moderator_id,
  up.email as moderator_email,
  pml.reason,
  pml.note,
  pml.ip_address,
  pml.user_agent,
  pml.created_at,
  pml.updated_at
FROM pattern_moderation_log pml
LEFT JOIN user_prompt_patterns upp ON pml.pattern_id = upp.id
LEFT JOIN auth.users up ON pml.moderator_id = up.id
ORDER BY pml.created_at DESC;

-- Grant permissions
GRANT SELECT ON pattern_moderation_log TO authenticated;
GRANT INSERT ON pattern_moderation_log TO authenticated;
GRANT UPDATE ON pattern_moderation_log TO authenticated;
GRANT SELECT ON pattern_moderation_history TO authenticated; 