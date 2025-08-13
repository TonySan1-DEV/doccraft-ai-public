-- DocCraft-AI Unified Mode System Database Schema Extensions
-- This file contains the necessary database changes to support the unified mode system

-- Add mode-related columns to existing writer_profiles table
ALTER TABLE writer_profiles ADD COLUMN IF NOT EXISTS system_mode VARCHAR(20) DEFAULT 'HYBRID';
ALTER TABLE writer_profiles ADD COLUMN IF NOT EXISTS mode_configuration JSONB DEFAULT '{}';
ALTER TABLE writer_profiles ADD COLUMN IF NOT EXISTS mode_customizations JSONB DEFAULT '{}';
ALTER TABLE writer_profiles ADD COLUMN IF NOT EXISTS auto_mode_switch BOOLEAN DEFAULT FALSE;
ALTER TABLE writer_profiles ADD COLUMN IF NOT EXISTS last_mode_change TIMESTAMP WITH TIME ZONE;
ALTER TABLE writer_profiles ADD COLUMN IF NOT EXISTS mode_transition_preferences JSONB DEFAULT '{}';

-- Create mode change audit logging table
CREATE TABLE IF NOT EXISTS mode_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  from_mode VARCHAR(20) NOT NULL,
  to_mode VARCHAR(20) NOT NULL,
  reason TEXT,
  context TEXT,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mode performance metrics table
CREATE TABLE IF NOT EXISTS mode_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mode VARCHAR(20) NOT NULL,
  session_duration INTERVAL,
  analysis_count INTEGER DEFAULT 0,
  suggestion_count INTEGER DEFAULT 0,
  auto_enhancement_count INTEGER DEFAULT 0,
  user_satisfaction_rating INTEGER CHECK (user_satisfaction_rating >= 1 AND user_satisfaction_rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mode-specific user preferences table
CREATE TABLE IF NOT EXISTS mode_user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mode VARCHAR(20) NOT NULL,
  preferences JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, mode)
);

-- Create mode transition rules table
CREATE TABLE IF NOT EXISTS mode_transition_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name VARCHAR(100) NOT NULL,
  from_mode VARCHAR(20),
  to_mode VARCHAR(20) NOT NULL,
  conditions JSONB NOT NULL DEFAULT '{}',
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mode coordination events table
CREATE TABLE IF NOT EXISTS mode_coordination_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  source_module VARCHAR(100),
  target_modules TEXT[],
  event_data JSONB,
  priority VARCHAR(20) DEFAULT 'medium',
  requires_immediate BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default mode transition rules
INSERT INTO mode_transition_rules (rule_name, from_mode, to_mode, conditions, priority) VALUES
('Auto-switch to Manual for Long Sessions', 'HYBRID', 'MANUAL', '{"session_duration_minutes": 120, "user_activity": "low"}', 1),
('Auto-switch to Full Auto for Research', 'HYBRID', 'FULLY_AUTO', '{"writing_phase": "research", "user_goals": ["research_intensive"]}', 2),
('Auto-switch to Hybrid for Collaboration', 'MANUAL', 'HYBRID', '{"collaboration_mode": true, "shared_document": true}', 3),
('Auto-switch to Manual for Final Review', 'FULLY_AUTO', 'MANUAL', '{"writing_phase": "polishing", "user_preference": "manual_review"}', 4);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_mode_changes_user_id ON mode_changes(user_id);
CREATE INDEX IF NOT EXISTS idx_mode_changes_created_at ON mode_changes(created_at);
CREATE INDEX IF NOT EXISTS idx_mode_performance_user_mode ON mode_performance_metrics(user_id, mode);
CREATE INDEX IF NOT EXISTS idx_mode_user_preferences_user_mode ON mode_user_preferences(user_id, mode);
CREATE INDEX IF NOT EXISTS idx_mode_coordination_events_user_id ON mode_coordination_events(user_id);
CREATE INDEX IF NOT EXISTS idx_mode_coordination_events_type ON mode_coordination_events(event_type);

-- Create function to update mode change timestamp
CREATE OR REPLACE FUNCTION update_mode_change_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.system_mode != OLD.system_mode THEN
    NEW.last_mode_change = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for mode change timestamp
CREATE TRIGGER trigger_update_mode_change_timestamp
  BEFORE UPDATE ON writer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_mode_change_timestamp();

-- Create function to log mode changes
CREATE OR REPLACE FUNCTION log_mode_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.system_mode != OLD.system_mode THEN
    INSERT INTO mode_changes (user_id, from_mode, to_mode, reason, context)
    VALUES (NEW.id, OLD.system_mode, NEW.system_mode, 'User preference change', 'Database trigger');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for mode change logging
CREATE TRIGGER trigger_log_mode_change
  AFTER UPDATE ON writer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION log_mode_change();

-- Create view for mode analytics
CREATE OR REPLACE VIEW mode_analytics AS
SELECT 
  wp.system_mode,
  COUNT(*) as user_count,
  AVG(EXTRACT(EPOCH FROM (NOW() - wp.last_mode_change))) as avg_time_in_mode_seconds,
  COUNT(CASE WHEN wp.auto_mode_switch = TRUE THEN 1 END) as auto_switch_users
FROM writer_profiles wp
WHERE wp.system_mode IS NOT NULL
GROUP BY wp.system_mode;

-- Create view for mode performance summary
CREATE OR REPLACE VIEW mode_performance_summary AS
SELECT 
  mpm.mode,
  COUNT(DISTINCT mpm.user_id) as active_users,
  AVG(mpm.analysis_count) as avg_analysis_count,
  AVG(mpm.suggestion_count) as avg_suggestion_count,
  AVG(mpm.auto_enhancement_count) as avg_auto_enhancements,
  AVG(mpm.user_satisfaction_rating) as avg_satisfaction
FROM mode_performance_metrics mpm
WHERE mpm.created_at >= NOW() - INTERVAL '30 days'
GROUP BY mpm.mode;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON mode_changes TO authenticated;
GRANT SELECT, INSERT, UPDATE ON mode_performance_metrics TO authenticated;
GRANT SELECT, INSERT, UPDATE ON mode_user_preferences TO authenticated;
GRANT SELECT ON mode_transition_rules TO authenticated;
GRANT SELECT, INSERT ON mode_coordination_events TO authenticated;
GRANT SELECT ON mode_analytics TO authenticated;
GRANT SELECT ON mode_performance_summary TO authenticated;

-- Create RLS policies for security
ALTER TABLE mode_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mode_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE mode_user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE mode_coordination_events ENABLE ROW LEVEL SECURITY;

-- Mode changes policy - users can only see their own changes
CREATE POLICY mode_changes_user_policy ON mode_changes
  FOR ALL USING (auth.uid() = user_id);

-- Mode performance metrics policy - users can only see their own metrics
CREATE POLICY mode_performance_user_policy ON mode_performance_metrics
  FOR ALL USING (auth.uid() = user_id);

-- Mode user preferences policy - users can only see their own preferences
CREATE POLICY mode_preferences_user_policy ON mode_user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Mode coordination events policy - users can only see their own events
CREATE POLICY mode_coordination_user_policy ON mode_coordination_events
  FOR ALL USING (auth.uid() = user_id);

-- Insert initial data for existing users
INSERT INTO mode_user_preferences (user_id, mode, preferences)
SELECT 
  id,
  'HYBRID',
  '{"aiInitiativeLevel": "RESPONSIVE", "suggestionFrequency": "CONTEXTUAL", "userControlLevel": 70, "interventionStyle": "GENTLE", "autoEnhancement": true, "realTimeAnalysis": true, "proactiveSuggestions": true}'::jsonb
FROM writer_profiles
WHERE system_mode IS NULL OR system_mode = 'HYBRID'
ON CONFLICT (user_id, mode) DO NOTHING;

-- Update existing writer profiles to have default mode configuration
UPDATE writer_profiles 
SET 
  mode_configuration = '{"mode": "HYBRID", "aiInitiativeLevel": "RESPONSIVE", "suggestionFrequency": "CONTEXTUAL", "userControlLevel": 70, "interventionStyle": "GENTLE", "autoEnhancement": true, "realTimeAnalysis": true, "proactiveSuggestions": true}'::jsonb,
  mode_transition_preferences = '{"preserveSettings": true, "adaptToContext": true, "showTransitionGuide": true, "rememberPerDocumentType": false}'::jsonb
WHERE mode_configuration = '{}' OR mode_configuration IS NULL;
