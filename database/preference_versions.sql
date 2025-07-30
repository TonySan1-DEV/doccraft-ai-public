-- Preference Versions Schema
-- Stores versioned user preference profiles with rollback functionality

-- Create preference_versions table
CREATE TABLE IF NOT EXISTS preference_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  label TEXT, -- Optional label for version (e.g., "Fast Draft 1", "Test V2")
  version_number INTEGER NOT NULL, -- Auto-incrementing version number per user
  is_current BOOLEAN DEFAULT FALSE, -- Flag to mark current active version
  metadata JSONB DEFAULT '{}'::jsonb -- Additional metadata (change reason, etc.)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_preference_versions_user_id ON preference_versions(user_id);
CREATE INDEX IF NOT EXISTS idx_preference_versions_created_at ON preference_versions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_preference_versions_version_number ON preference_versions(user_id, version_number DESC);
CREATE INDEX IF NOT EXISTS idx_preference_versions_current ON preference_versions(user_id, is_current) WHERE is_current = TRUE;

-- Enable Row Level Security
ALTER TABLE preference_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for preference_versions
CREATE POLICY "Users can view their own preference versions" ON preference_versions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own preference versions" ON preference_versions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preference versions" ON preference_versions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preference versions" ON preference_versions
  FOR DELETE USING (auth.uid() = user_id);

-- Function to auto-increment version number per user
CREATE OR REPLACE FUNCTION get_next_version_number(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  next_version INTEGER;
BEGIN
  SELECT COALESCE(MAX(version_number), 0) + 1
  INTO next_version
  FROM preference_versions
  WHERE user_id = user_uuid;
  
  RETURN next_version;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a new preference version
CREATE OR REPLACE FUNCTION create_preference_version(
  user_uuid UUID,
  preference_data JSONB,
  version_label TEXT DEFAULT NULL,
  version_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  new_version_id UUID;
  next_version_num INTEGER;
BEGIN
  -- Get next version number
  next_version_num := get_next_version_number(user_uuid);
  
  -- Set all existing versions as not current
  UPDATE preference_versions 
  SET is_current = FALSE 
  WHERE user_id = user_uuid;
  
  -- Create new version
  INSERT INTO preference_versions (
    user_id, 
    preferences, 
    label, 
    version_number, 
    is_current, 
    metadata
  ) VALUES (
    user_uuid,
    preference_data,
    version_label,
    next_version_num,
    TRUE,
    version_metadata
  ) RETURNING id INTO new_version_id;
  
  -- Enforce maximum version limit (keep only last 10 versions)
  DELETE FROM preference_versions 
  WHERE user_id = user_uuid 
  AND version_number < (next_version_num - 9);
  
  RETURN new_version_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to restore a preference version
CREATE OR REPLACE FUNCTION restore_preference_version(
  user_uuid UUID,
  version_id UUID
)
RETURNS JSONB AS $$
DECLARE
  restored_preferences JSONB;
  version_to_restore INTEGER;
BEGIN
  -- Get the version to restore
  SELECT preferences, version_number
  INTO restored_preferences, version_to_restore
  FROM preference_versions
  WHERE id = version_id AND user_id = user_uuid;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Version not found or access denied';
  END IF;
  
  -- Create new version with restored preferences
  PERFORM create_preference_version(
    user_uuid,
    restored_preferences,
    'Restored from version ' || version_to_restore,
    jsonb_build_object('restored_from', version_id, 'restored_at', now())
  );
  
  RETURN restored_preferences;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current preference version
CREATE OR REPLACE FUNCTION get_current_preference_version(user_uuid UUID)
RETURNS TABLE(
  id UUID,
  preferences JSONB,
  label TEXT,
  version_number INTEGER,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pv.id,
    pv.preferences,
    pv.label,
    pv.version_number,
    pv.created_at
  FROM preference_versions pv
  WHERE pv.user_id = user_uuid AND pv.is_current = TRUE
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get preference version history
CREATE OR REPLACE FUNCTION get_preference_version_history(
  user_uuid UUID,
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE(
  id UUID,
  preferences JSONB,
  label TEXT,
  version_number INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  is_current BOOLEAN,
  metadata JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pv.id,
    pv.preferences,
    pv.label,
    pv.version_number,
    pv.created_at,
    pv.is_current,
    pv.metadata
  FROM preference_versions pv
  WHERE pv.user_id = user_uuid
  ORDER BY pv.version_number DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to validate preference data before insert/update
CREATE OR REPLACE FUNCTION validate_preference_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure preferences is not null
  IF NEW.preferences IS NULL THEN
    RAISE EXCEPTION 'Preferences cannot be null';
  END IF;
  
  -- Ensure preferences is a valid JSON object
  IF jsonb_typeof(NEW.preferences) != 'object' THEN
    RAISE EXCEPTION 'Preferences must be a JSON object';
  END IF;
  
  -- Validate required preference fields
  IF NOT (NEW.preferences ? 'tone') THEN
    RAISE EXCEPTION 'Preferences must include tone field';
  END IF;
  
  IF NOT (NEW.preferences ? 'language') THEN
    RAISE EXCEPTION 'Preferences must include language field';
  END IF;
  
  IF NOT (NEW.preferences ? 'copilotEnabled') THEN
    RAISE EXCEPTION 'Preferences must include copilotEnabled field';
  END IF;
  
  IF NOT (NEW.preferences ? 'memoryEnabled') THEN
    RAISE EXCEPTION 'Preferences must include memoryEnabled field';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for validation
CREATE TRIGGER validate_preference_data_trigger
  BEFORE INSERT OR UPDATE ON preference_versions
  FOR EACH ROW EXECUTE FUNCTION validate_preference_data(); 