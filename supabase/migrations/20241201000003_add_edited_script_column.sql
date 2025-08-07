-- Migration: Add edited_script column to narrated_decks table
-- This migration adds support for storing user-edited scripts before narration

-- Add edited script columns to narrated_decks table
ALTER TABLE narrated_decks 
ADD COLUMN IF NOT EXISTS edited_script TEXT;

ALTER TABLE narrated_decks 
ADD COLUMN IF NOT EXISTS script_edited_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE narrated_decks 
ADD COLUMN IF NOT EXISTS script_edited_by UUID REFERENCES auth.users(id);

-- Add pipeline_id column for linking to pipeline records
ALTER TABLE narrated_decks 
ADD COLUMN IF NOT EXISTS pipeline_id UUID REFERENCES pipelines(id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_narrated_decks_pipeline_id ON narrated_decks(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_narrated_decks_script_edited_at ON narrated_decks(script_edited_at);

-- Add comments for documentation
COMMENT ON COLUMN narrated_decks.edited_script IS 'User-edited version of the AI-generated script';
COMMENT ON COLUMN narrated_decks.script_edited_at IS 'Timestamp when the script was last edited by user';
COMMENT ON COLUMN narrated_decks.script_edited_by IS 'User ID who edited the script';
COMMENT ON COLUMN narrated_decks.pipeline_id IS 'Reference to the pipeline that generated this narrated deck';

-- Create a function to update script editing metadata
CREATE OR REPLACE FUNCTION update_script_editing_metadata()
RETURNS TRIGGER AS $$
BEGIN
  -- Update script_edited_at when edited_script changes
  IF NEW.edited_script IS DISTINCT FROM OLD.edited_script THEN
    NEW.script_edited_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update script editing metadata
DROP TRIGGER IF EXISTS trigger_update_script_editing_metadata ON narrated_decks;
CREATE TRIGGER trigger_update_script_editing_metadata
  BEFORE UPDATE ON narrated_decks
  FOR EACH ROW
  EXECUTE FUNCTION update_script_editing_metadata();

-- Add a view for easy access to script editing history
CREATE OR REPLACE VIEW script_editing_history AS
SELECT 
  nd.id as narrated_deck_id,
  nd.title,
  nd.pipeline_id,
  nd.script_edited_at,
  nd.script_edited_by,
  u.email as editor_email,
  CASE 
    WHEN nd.edited_script IS NOT NULL THEN 'edited'
    ELSE 'original'
  END as script_status,
  LENGTH(nd.edited_script) as edited_script_length,
  LENGTH(nd.slides::text) as original_script_length
FROM narrated_decks nd
LEFT JOIN auth.users u ON nd.script_edited_by = u.id
WHERE nd.edited_script IS NOT NULL OR nd.script_edited_at IS NOT NULL
ORDER BY nd.script_edited_at DESC;

-- Grant appropriate permissions
GRANT SELECT ON script_editing_history TO authenticated;
