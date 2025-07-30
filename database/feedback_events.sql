-- Feedback Events Schema
-- Tracks user feedback on AI-generated suggestions for continuous improvement

-- Create feedback_events table
CREATE TABLE IF NOT EXISTS feedback_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('positive', 'negative')),
  source_prompt TEXT NOT NULL,
  pattern_used TEXT NOT NULL, -- genre + arc + tone label
  copilot_enabled BOOLEAN NOT NULL,
  memory_enabled BOOLEAN NOT NULL,
  session_id TEXT, -- Optional session tracking
  prompt_hash TEXT, -- Hash of prompt for deduplication
  content_type TEXT, -- Type of content (suggestion, rewrite, preview, etc.)
  context_data JSONB DEFAULT '{}'::jsonb, -- Additional context (document type, length, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_feedback_events_user_id ON feedback_events(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_events_timestamp ON feedback_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_feedback_events_feedback_type ON feedback_events(feedback_type);
CREATE INDEX IF NOT EXISTS idx_feedback_events_pattern_used ON feedback_events(pattern_used);
CREATE INDEX IF NOT EXISTS idx_feedback_events_prompt_hash ON feedback_events(prompt_hash);
CREATE INDEX IF NOT EXISTS idx_feedback_events_content_type ON feedback_events(content_type);
CREATE INDEX IF NOT EXISTS idx_feedback_events_user_session ON feedback_events(user_id, session_id);

-- Enable Row Level Security
ALTER TABLE feedback_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only view their own feedback events
CREATE POLICY "Users can view own feedback events" ON feedback_events
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own feedback events
CREATE POLICY "Users can insert own feedback events" ON feedback_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own feedback events (for corrections)
CREATE POLICY "Users can update own feedback events" ON feedback_events
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own feedback events
CREATE POLICY "Users can delete own feedback events" ON feedback_events
  FOR DELETE USING (auth.uid() = user_id);

-- Function to sanitize prompt text before storage
CREATE OR REPLACE FUNCTION sanitize_prompt_text(prompt_text TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Remove potentially sensitive content
  RETURN regexp_replace(
    regexp_replace(
      regexp_replace(
        prompt_text,
        'password\s*[:=]\s*\S+', 'password=***', 'gi'
      ),
      'api_key\s*[:=]\s*\S+', 'api_key=***', 'gi'
    ),
    'token\s*[:=]\s*\S+', 'token=***', 'gi'
  );
END;
$$ LANGUAGE plpgsql;

-- Function to create feedback event with sanitization
CREATE OR REPLACE FUNCTION create_feedback_event(
  p_user_id UUID,
  p_feedback_type TEXT,
  p_source_prompt TEXT,
  p_pattern_used TEXT,
  p_copilot_enabled BOOLEAN,
  p_memory_enabled BOOLEAN,
  p_session_id TEXT DEFAULT NULL,
  p_content_type TEXT DEFAULT NULL,
  p_context_data JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
  v_sanitized_prompt TEXT;
  v_prompt_hash TEXT;
BEGIN
  -- Sanitize the prompt
  v_sanitized_prompt := sanitize_prompt_text(p_source_prompt);
  
  -- Generate hash for deduplication
  v_prompt_hash := encode(sha256(v_sanitized_prompt::bytea), 'hex');
  
  -- Check for duplicate feedback in same session
  IF p_session_id IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM feedback_events 
      WHERE user_id = p_user_id 
        AND session_id = p_session_id 
        AND prompt_hash = v_prompt_hash
        AND created_at > NOW() - INTERVAL '1 hour'
    ) THEN
      RAISE EXCEPTION 'Duplicate feedback detected for this prompt in current session';
    END IF;
  END IF;
  
  -- Insert the feedback event
  INSERT INTO feedback_events (
    user_id,
    feedback_type,
    source_prompt,
    pattern_used,
    copilot_enabled,
    memory_enabled,
    session_id,
    prompt_hash,
    content_type,
    context_data
  ) VALUES (
    p_user_id,
    p_feedback_type,
    v_sanitized_prompt,
    p_pattern_used,
    p_copilot_enabled,
    p_memory_enabled,
    p_session_id,
    v_prompt_hash,
    p_content_type,
    p_context_data
  ) RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get feedback statistics
CREATE OR REPLACE FUNCTION get_feedback_stats(
  p_user_id UUID DEFAULT NULL,
  p_pattern_used TEXT DEFAULT NULL,
  p_time_range INTERVAL DEFAULT INTERVAL '30 days'
)
RETURNS TABLE (
  pattern_used TEXT,
  total_feedback INTEGER,
  positive_feedback INTEGER,
  negative_feedback INTEGER,
  positive_rate NUMERIC,
  avg_rating NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fe.pattern_used,
    COUNT(*)::INTEGER as total_feedback,
    COUNT(CASE WHEN fe.feedback_type = 'positive' THEN 1 END)::INTEGER as positive_feedback,
    COUNT(CASE WHEN fe.feedback_type = 'negative' THEN 1 END)::INTEGER as negative_feedback,
    ROUND(
      (COUNT(CASE WHEN fe.feedback_type = 'positive' THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC) * 100, 
      2
    ) as positive_rate,
    CASE 
      WHEN COUNT(*) > 0 THEN 
        (COUNT(CASE WHEN fe.feedback_type = 'positive' THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC) * 5
      ELSE 0 
    END as avg_rating
  FROM feedback_events fe
  WHERE fe.created_at > NOW() - p_time_range
    AND (p_user_id IS NULL OR fe.user_id = p_user_id)
    AND (p_pattern_used IS NULL OR fe.pattern_used = p_pattern_used)
  GROUP BY fe.pattern_used
  ORDER BY total_feedback DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's recent feedback
CREATE OR REPLACE FUNCTION get_user_recent_feedback(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  feedback_type TEXT,
  pattern_used TEXT,
  content_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fe.id,
    fe.feedback_type,
    fe.pattern_used,
    fe.content_type,
    fe.created_at
  FROM feedback_events fe
  WHERE fe.user_id = p_user_id
  ORDER BY fe.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get pattern performance analytics
CREATE OR REPLACE FUNCTION get_pattern_analytics(
  p_time_range INTERVAL DEFAULT INTERVAL '30 days'
)
RETURNS TABLE (
  pattern_used TEXT,
  total_usage INTEGER,
  positive_rate NUMERIC,
  confidence_interval NUMERIC,
  trend_direction TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH pattern_stats AS (
    SELECT 
      fe.pattern_used,
      COUNT(*) as total_usage,
      COUNT(CASE WHEN fe.feedback_type = 'positive' THEN 1 END) as positive_count,
      COUNT(CASE WHEN fe.feedback_type = 'negative' THEN 1 END) as negative_count
    FROM feedback_events fe
    WHERE fe.created_at > NOW() - p_time_range
    GROUP BY fe.pattern_used
    HAVING COUNT(*) >= 5 -- Minimum sample size for meaningful stats
  )
  SELECT 
    ps.pattern_used,
    ps.total_usage::INTEGER,
    ROUND(
      (ps.positive_count::NUMERIC / ps.total_usage::NUMERIC) * 100, 
      2
    ) as positive_rate,
    ROUND(
      SQRT(
        (ps.positive_count::NUMERIC * ps.negative_count::NUMERIC) / 
        (ps.total_usage::NUMERIC * ps.total_usage::NUMERIC * ps.total_usage::NUMERIC)
      ) * 100,
      2
    ) as confidence_interval,
    CASE 
      WHEN ps.positive_count::NUMERIC / ps.total_usage::NUMERIC > 0.7 THEN 'improving'
      WHEN ps.positive_count::NUMERIC / ps.total_usage::NUMERIC < 0.3 THEN 'declining'
      ELSE 'stable'
    END as trend_direction
  FROM pattern_stats ps
  ORDER BY ps.total_usage DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a view for easy access to feedback summary
CREATE OR REPLACE VIEW feedback_summary AS
SELECT 
  pattern_used,
  COUNT(*) as total_feedback,
  COUNT(CASE WHEN feedback_type = 'positive' THEN 1 END) as positive_count,
  COUNT(CASE WHEN feedback_type = 'negative' THEN 1 END) as negative_count,
  ROUND(
    (COUNT(CASE WHEN feedback_type = 'positive' THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC) * 100, 
    2
  ) as positive_rate,
  MAX(created_at) as last_feedback
FROM feedback_events
WHERE created_at > NOW() - INTERVAL '90 days'
GROUP BY pattern_used
ORDER BY total_feedback DESC;

-- Grant permissions
GRANT SELECT ON feedback_summary TO authenticated;
GRANT EXECUTE ON FUNCTION create_feedback_event TO authenticated;
GRANT EXECUTE ON FUNCTION get_feedback_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_recent_feedback TO authenticated;
GRANT EXECUTE ON FUNCTION get_pattern_analytics TO authenticated; 