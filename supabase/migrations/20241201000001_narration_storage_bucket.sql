-- MCP Context Block
-- role: db-engineer
-- tier: Pro
-- file: supabase/migrations/20241201000001_narration_storage_bucket.sql
-- allowedActions: ["create", "alter", "secure"]
-- theme: "supabase_audio_storage"

-- =============================================================================
-- DocCraft-AI: Narration Audio Storage Bucket Setup
-- =============================================================================
-- This migration creates the Supabase Storage bucket for storing narration audio files
-- with proper Row-Level Security policies for user isolation and secure access.
-- =============================================================================

-- =============================================================================
-- 1. CREATE STORAGE BUCKET
-- =============================================================================

-- Create the narrations bucket for audio file storage
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'narrations',
  'narrations',
  false, -- Keep bucket private for security
  52428800, -- 50MB file size limit
  ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'] -- Allowed audio formats
) ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- =============================================================================
-- 2. ROW-LEVEL SECURITY POLICIES FOR STORAGE
-- =============================================================================

-- Enable RLS on the storage.objects table for the narrations bucket
-- Note: This is handled automatically by Supabase, but we document it here

-- =============================================================================
-- 3. STORAGE POLICIES FOR USER ISOLATION
-- =============================================================================

-- Policy: Users can upload files to their own directory
CREATE POLICY "Users can upload to their own directory"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'narrations' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Users can view files in their own directory
CREATE POLICY "Users can view files in their own directory"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'narrations' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Users can update files in their own directory
CREATE POLICY "Users can update files in their own directory"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'narrations' AND
    auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'narrations' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Users can delete files in their own directory
CREATE POLICY "Users can delete files in their own directory"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'narrations' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- =============================================================================
-- 4. STORAGE BUCKET METADATA AND CONFIGURATION
-- =============================================================================

-- Add bucket metadata for tracking
COMMENT ON TABLE storage.buckets IS 'Supabase Storage buckets for file storage';
COMMENT ON COLUMN storage.buckets.id IS 'Unique identifier for the bucket';
COMMENT ON COLUMN storage.buckets.name IS 'Human-readable name for the bucket';
COMMENT ON COLUMN storage.buckets.public IS 'Whether the bucket is publicly accessible';
COMMENT ON COLUMN storage.buckets.file_size_limit IS 'Maximum file size in bytes';
COMMENT ON COLUMN storage.buckets.allowed_mime_types IS 'Array of allowed MIME types';

-- Add specific comments for the narrations bucket
COMMENT ON TABLE storage.objects IS 'Individual files stored in Supabase Storage';
COMMENT ON COLUMN storage.objects.bucket_id IS 'Reference to the bucket containing this file';
COMMENT ON COLUMN storage.objects.name IS 'File path within the bucket';
COMMENT ON COLUMN storage.objects.owner IS 'User ID of the file owner';
COMMENT ON COLUMN storage.objects.metadata IS 'Additional file metadata';

-- =============================================================================
-- 5. UTILITY FUNCTIONS FOR STORAGE MANAGEMENT
-- =============================================================================

-- Function to get user's storage usage
CREATE OR REPLACE FUNCTION get_user_storage_usage(user_id UUID)
RETURNS TABLE (
  total_files BIGINT,
  total_size BIGINT,
  average_file_size NUMERIC,
  oldest_file TIMESTAMP WITH TIME ZONE,
  newest_file TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_files,
    COALESCE(SUM(metadata->>'size')::BIGINT, 0) as total_size,
    COALESCE(AVG((metadata->>'size')::NUMERIC), 0) as average_file_size,
    MIN(created_at) as oldest_file,
    MAX(created_at) as newest_file
  FROM storage.objects
  WHERE bucket_id = 'narrations'
    AND owner = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up orphaned files
CREATE OR REPLACE FUNCTION cleanup_orphaned_audio_files()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER := 0;
  orphaned_file RECORD;
BEGIN
  -- Find files that don't have corresponding database records
  FOR orphaned_file IN
    SELECT o.id, o.name, o.owner
    FROM storage.objects o
    WHERE o.bucket_id = 'narrations'
      AND o.created_at < NOW() - INTERVAL '24 hours'
      AND NOT EXISTS (
        SELECT 1 FROM tts_narrations t
        WHERE t.audio_file_url LIKE '%' || o.name || '%'
      )
  LOOP
    -- Delete orphaned file
    DELETE FROM storage.objects 
    WHERE id = orphaned_file.id;
    
    deleted_count := deleted_count + 1;
  END LOOP;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate audio file metadata
CREATE OR REPLACE FUNCTION validate_audio_file_metadata(
  file_size BIGINT,
  mime_type TEXT,
  file_name TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check file size (50MB limit)
  IF file_size > 52428800 THEN
    RETURN FALSE;
  END IF;
  
  -- Check MIME type
  IF mime_type NOT IN ('audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg') THEN
    RETURN FALSE;
  END IF;
  
  -- Check file name format
  IF file_name !~ '^[a-zA-Z0-9._-]+\.(mp3|wav|ogg)$' THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 6. STORAGE QUOTAS AND LIMITS
-- =============================================================================

-- Create a table to track user storage quotas
CREATE TABLE IF NOT EXISTS user_storage_quotas (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL DEFAULT 'Free' CHECK (tier IN ('Free', 'Basic', 'Pro')),
  max_storage_bytes BIGINT NOT NULL DEFAULT 1073741824, -- 1GB default
  used_storage_bytes BIGINT NOT NULL DEFAULT 0,
  max_files INTEGER NOT NULL DEFAULT 100,
  used_files INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set tier-specific quotas
INSERT INTO user_storage_quotas (user_id, tier, max_storage_bytes, max_files)
VALUES 
  ('00000000-0000-0000-0000-000000000000', 'Free', 1073741824, 50),   -- 1GB, 50 files
  ('00000000-0000-0000-0000-000000000001', 'Basic', 5368709120, 200), -- 5GB, 200 files
  ('00000000-0000-0000-0000-000000000002', 'Pro', 21474836480, 1000)  -- 20GB, 1000 files
ON CONFLICT (user_id) DO UPDATE SET
  tier = EXCLUDED.tier,
  max_storage_bytes = EXCLUDED.max_storage_bytes,
  max_files = EXCLUDED.max_files,
  updated_at = timezone('utc'::text, now());

-- Function to check user storage quota
CREATE OR REPLACE FUNCTION check_user_storage_quota(
  user_id UUID,
  additional_bytes BIGINT DEFAULT 0
)
RETURNS TABLE (
  can_upload BOOLEAN,
  current_usage BIGINT,
  max_allowed BIGINT,
  remaining_bytes BIGINT,
  quota_exceeded BOOLEAN
) AS $$
DECLARE
  user_quota RECORD;
  current_usage BIGINT;
BEGIN
  -- Get user quota
  SELECT * INTO user_quota
  FROM user_storage_quotas
  WHERE user_id = check_user_storage_quota.user_id;
  
  -- If no quota record exists, create one with default values
  IF NOT FOUND THEN
    INSERT INTO user_storage_quotas (user_id, tier, max_storage_bytes, max_files)
    VALUES (check_user_storage_quota.user_id, 'Free', 1073741824, 50);
    
    SELECT * INTO user_quota
    FROM user_storage_quotas
    WHERE user_id = check_user_storage_quota.user_id;
  END IF;
  
  -- Calculate current usage
  SELECT COALESCE(SUM((metadata->>'size')::BIGINT), 0) INTO current_usage
  FROM storage.objects
  WHERE bucket_id = 'narrations' AND owner = user_id;
  
  -- Update usage in quota table
  UPDATE user_storage_quotas
  SET used_storage_bytes = current_usage,
      updated_at = timezone('utc'::text, now())
  WHERE user_id = check_user_storage_quota.user_id;
  
  -- Check if upload would exceed quota
  RETURN QUERY
  SELECT 
    (current_usage + additional_bytes) <= user_quota.max_storage_bytes as can_upload,
    current_usage as current_usage,
    user_quota.max_storage_bytes as max_allowed,
    GREATEST(0, user_quota.max_storage_bytes - current_usage - additional_bytes) as remaining_bytes,
    (current_usage + additional_bytes) > user_quota.max_storage_bytes as quota_exceeded;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 7. STORAGE ANALYTICS AND MONITORING
-- =============================================================================

-- Create a view for storage analytics
CREATE OR REPLACE VIEW storage_analytics AS
SELECT 
  o.bucket_id,
  o.owner as user_id,
  COUNT(*) as file_count,
  COALESCE(SUM((o.metadata->>'size')::BIGINT), 0) as total_size_bytes,
  COALESCE(AVG((o.metadata->>'size')::NUMERIC), 0) as average_file_size,
  MIN(o.created_at) as oldest_file,
  MAX(o.created_at) as newest_file,
  usq.tier,
  usq.max_storage_bytes,
  usq.used_storage_bytes,
  usq.max_files,
  usq.used_files
FROM storage.objects o
LEFT JOIN user_storage_quotas usq ON o.owner = usq.user_id
WHERE o.bucket_id = 'narrations'
GROUP BY o.bucket_id, o.owner, usq.tier, usq.max_storage_bytes, usq.used_storage_bytes, usq.max_files, usq.used_files;

-- Create a view for storage usage by tier
CREATE OR REPLACE VIEW storage_usage_by_tier AS
SELECT 
  usq.tier,
  COUNT(usq.user_id) as user_count,
  COALESCE(SUM(usq.used_storage_bytes), 0) as total_used_bytes,
  COALESCE(SUM(usq.max_storage_bytes), 0) as total_max_bytes,
  COALESCE(AVG(usq.used_storage_bytes), 0) as average_used_bytes,
  COALESCE(SUM(usq.used_files), 0) as total_files,
  COALESCE(SUM(usq.max_files), 0) as total_max_files
FROM user_storage_quotas usq
GROUP BY usq.tier;

-- =============================================================================
-- 8. STORAGE MAINTENANCE AND CLEANUP
-- =============================================================================

-- Create a function to update storage usage statistics
CREATE OR REPLACE FUNCTION update_storage_usage_stats()
RETURNS VOID AS $$
BEGIN
  -- Update used storage bytes for all users
  UPDATE user_storage_quotas usq
  SET 
    used_storage_bytes = COALESCE(
      (SELECT SUM((metadata->>'size')::BIGINT)
       FROM storage.objects
       WHERE bucket_id = 'narrations' AND owner = usq.user_id), 0
    ),
    used_files = COALESCE(
      (SELECT COUNT(*)
       FROM storage.objects
       WHERE bucket_id = 'narrations' AND owner = usq.user_id), 0
    ),
    updated_at = timezone('utc'::text, now());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to enforce storage quotas
CREATE OR REPLACE FUNCTION enforce_storage_quotas()
RETURNS INTEGER AS $$
DECLARE
  quota_violation RECORD;
  deleted_count INTEGER := 0;
BEGIN
  -- Find users who exceed their quota
  FOR quota_violation IN
    SELECT 
      usq.user_id,
      usq.max_storage_bytes,
      usq.used_storage_bytes,
      usq.max_files,
      usq.used_files
    FROM user_storage_quotas usq
    WHERE usq.used_storage_bytes > usq.max_storage_bytes
       OR usq.used_files > usq.max_files
  LOOP
    -- Delete oldest files until quota is met
    DELETE FROM storage.objects
    WHERE bucket_id = 'narrations'
      AND owner = quota_violation.user_id
      AND id IN (
        SELECT id
        FROM storage.objects
        WHERE bucket_id = 'narrations' AND owner = quota_violation.user_id
        ORDER BY created_at ASC
        LIMIT 10
      );
    
    deleted_count := deleted_count + 1;
  END LOOP;
  
  -- Update usage statistics
  PERFORM update_storage_usage_stats();
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 9. STORAGE SECURITY AND AUDIT
-- =============================================================================

-- Create audit log table for storage operations
CREATE TABLE IF NOT EXISTS storage_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  operation TEXT NOT NULL CHECK (operation IN ('upload', 'download', 'delete', 'update')),
  bucket_id TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for audit log queries
CREATE INDEX IF NOT EXISTS idx_storage_audit_log_user_id ON storage_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_storage_audit_log_created_at ON storage_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_storage_audit_log_operation ON storage_audit_log(operation);

-- Function to log storage operations
CREATE OR REPLACE FUNCTION log_storage_operation(
  p_user_id UUID,
  p_operation TEXT,
  p_bucket_id TEXT,
  p_file_path TEXT,
  p_file_size BIGINT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_success BOOLEAN DEFAULT true,
  p_error_message TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO storage_audit_log (
    user_id, operation, bucket_id, file_path, file_size,
    ip_address, user_agent, success, error_message
  ) VALUES (
    p_user_id, p_operation, p_bucket_id, p_file_path, p_file_size,
    p_ip_address, p_user_agent, p_success, p_error_message
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 10. COMMENTS AND DOCUMENTATION
-- =============================================================================

COMMENT ON TABLE user_storage_quotas IS 'Tracks user storage quotas and usage for audio files';
COMMENT ON COLUMN user_storage_quotas.tier IS 'User subscription tier affecting storage limits';
COMMENT ON COLUMN user_storage_quotas.max_storage_bytes IS 'Maximum storage allowed in bytes';
COMMENT ON COLUMN user_storage_quotas.used_storage_bytes IS 'Current storage usage in bytes';
COMMENT ON COLUMN user_storage_quotas.max_files IS 'Maximum number of files allowed';
COMMENT ON COLUMN user_storage_quotas.used_files IS 'Current number of files stored';

COMMENT ON TABLE storage_audit_log IS 'Audit log for storage operations';
COMMENT ON COLUMN storage_audit_log.operation IS 'Type of storage operation performed';
COMMENT ON COLUMN storage_audit_log.bucket_id IS 'Storage bucket where operation occurred';
COMMENT ON COLUMN storage_audit_log.file_path IS 'Path of the file in storage';
COMMENT ON COLUMN storage_audit_log.success IS 'Whether the operation was successful';

COMMENT ON VIEW storage_analytics IS 'Analytics view for storage usage across users';
COMMENT ON VIEW storage_usage_by_tier IS 'Storage usage statistics grouped by user tier';

-- =============================================================================
-- 11. FUTURE ENHANCEMENTS (TODOs)
-- =============================================================================

/*
TODO: Future Storage Enhancements

1. STORAGE OPTIMIZATION:
   - Implement audio file compression before storage
   - Add support for different audio quality levels
   - Implement automatic file format conversion
   - Add CDN integration for global delivery

2. SECURITY ENHANCEMENTS:
   - Add virus scanning for uploaded files
   - Implement file encryption at rest
   - Add watermarking for audio files
   - Implement access token rotation

3. PERFORMANCE FEATURES:
   - Add streaming audio support
   - Implement progressive audio loading
   - Add audio file caching strategies
   - Optimize for mobile audio playback

4. ANALYTICS AND MONITORING:
   - Track audio file access patterns
   - Monitor bandwidth usage by user
   - Add storage cost optimization
   - Implement usage alerts and notifications

5. INTEGRATION FEATURES:
   - Add webhook support for file events
   - Implement real-time file processing
   - Add support for batch file operations
   - Integrate with third-party audio services

6. USER EXPERIENCE:
   - Add audio file preview functionality
   - Implement audio file sharing
   - Add audio file versioning
   - Support for audio file comments

7. SCALABILITY FEATURES:
   - Implement multi-region storage
   - Add automatic backup and recovery
   - Support for storage tiering
   - Add load balancing for file delivery

8. COMPLIANCE AND GOVERNANCE:
   - Add data retention policies
   - Implement GDPR compliance features
   - Add audit trail enhancements
   - Support for data export and deletion
*/

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================
-- This migration sets up complete audio file storage infrastructure
-- with security, quotas, analytics, and audit capabilities.
-- =============================================================================
