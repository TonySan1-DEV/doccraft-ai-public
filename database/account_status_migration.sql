-- Migration: Add account status fields to writer_profiles table
-- This migration adds support for account pausing and closing functionality

-- Add account status fields
ALTER TABLE writer_profiles 
ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active' 
CHECK (account_status IN ('active', 'paused', 'closed', 'suspended'));

ALTER TABLE writer_profiles 
ADD COLUMN IF NOT EXISTS pause_start_date TIMESTAMP WITH TIME ZONE;

ALTER TABLE writer_profiles 
ADD COLUMN IF NOT EXISTS pause_end_date TIMESTAMP WITH TIME ZONE;

ALTER TABLE writer_profiles 
ADD COLUMN IF NOT EXISTS closed_date TIMESTAMP WITH TIME ZONE;

ALTER TABLE writer_profiles 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add index for account status queries
CREATE INDEX IF NOT EXISTS idx_writer_profiles_account_status ON writer_profiles(account_status);
CREATE INDEX IF NOT EXISTS idx_writer_profiles_pause_dates ON writer_profiles(pause_start_date, pause_end_date);

-- Add comments for documentation
COMMENT ON COLUMN writer_profiles.account_status IS 'Current status of the user account: active, paused, closed, or suspended';
COMMENT ON COLUMN writer_profiles.pause_start_date IS 'Date when account was paused';
COMMENT ON COLUMN writer_profiles.pause_end_date IS 'Date when account pause will end';
COMMENT ON COLUMN writer_profiles.closed_date IS 'Date when account was closed';
COMMENT ON COLUMN writer_profiles.created_at IS 'Date when the profile was created';

-- Create a function to automatically reactivate paused accounts
CREATE OR REPLACE FUNCTION reactivate_paused_accounts()
RETURNS void AS $$
BEGIN
  UPDATE writer_profiles 
  SET 
    account_status = 'active',
    pause_start_date = NULL,
    pause_end_date = NULL,
    updated_at = NOW()
  WHERE 
    account_status = 'paused' 
    AND pause_end_date IS NOT NULL 
    AND pause_end_date <= NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to run the reactivation function daily
-- Note: This requires pg_cron extension to be enabled
-- SELECT cron.schedule('reactivate-paused-accounts', '0 0 * * *', 'SELECT reactivate_paused_accounts();');

-- Create a view for account status monitoring
CREATE OR REPLACE VIEW account_status_summary AS
SELECT 
  account_status,
  COUNT(*) as count,
  COUNT(CASE WHEN pause_end_date <= NOW() THEN 1 END) as expired_pauses
FROM writer_profiles 
GROUP BY account_status;

-- Grant necessary permissions
GRANT SELECT ON account_status_summary TO authenticated;
GRANT EXECUTE ON FUNCTION reactivate_paused_accounts() TO authenticated; 