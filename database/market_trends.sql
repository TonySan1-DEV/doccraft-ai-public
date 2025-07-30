-- Create market_trends table for Market Trend Integration module
CREATE TABLE IF NOT EXISTS market_trends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  genre TEXT NOT NULL,
  trend_type TEXT NOT NULL CHECK (trend_type IN ('topic', 'tone', 'structure', 'theme')),
  label TEXT NOT NULL,
  score FLOAT NOT NULL CHECK (score >= 0.0 AND score <= 1.0),
  examples TEXT[] DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE market_trends ENABLE ROW LEVEL SECURITY;

-- Create policy for read-only access (all authenticated users can read)
CREATE POLICY "Users can read market trends" ON market_trends
  FOR SELECT USING (auth.role() = 'authenticated');

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_market_trends_genre ON market_trends(genre);
CREATE INDEX IF NOT EXISTS idx_market_trends_trend_type ON market_trends(trend_type);
CREATE INDEX IF NOT EXISTS idx_market_trends_score ON market_trends(score DESC);
CREATE INDEX IF NOT EXISTS idx_market_trends_updated_at ON market_trends(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_market_trends_genre_type ON market_trends(genre, trend_type);

-- Add comments for documentation
COMMENT ON TABLE market_trends IS 'Stores real-time market trend data for genre-specific content analysis';
COMMENT ON COLUMN market_trends.genre IS 'The literary genre this trend applies to';
COMMENT ON COLUMN market_trends.trend_type IS 'Type of trend: topic, tone, structure, or theme';
COMMENT ON COLUMN market_trends.label IS 'Human-readable label for the trend';
COMMENT ON COLUMN market_trends.score IS 'Trend popularity score from 0.0 to 1.0';
COMMENT ON COLUMN market_trends.examples IS 'Array of example content demonstrating this trend';

-- Insert sample market trends for testing
INSERT INTO market_trends (genre, trend_type, label, score, examples) VALUES
-- Romance Trends
('Romance', 'topic', 'Enemies to Lovers', 0.95, ARRAY['Forced proximity', 'Workplace rivals', 'Academic competition']),
('Romance', 'tone', 'Slow Burn', 0.88, ARRAY['Gradual emotional development', 'Delayed gratification', 'Building tension']),
('Romance', 'structure', 'Dual POV', 0.92, ARRAY['Alternating perspectives', 'Both sides of the story', 'Deeper character development']),
('Romance', 'theme', 'Second Chance Love', 0.85, ARRAY['Reunited lovers', 'Past mistakes', 'Redemption arcs']),

-- Mystery Trends
('Mystery', 'topic', 'Small Town Secrets', 0.90, ARRAY['Close-knit communities', 'Hidden pasts', 'Everyone knows everyone']),
('Mystery', 'tone', 'Atmospheric Suspense', 0.87, ARRAY['Moody settings', 'Psychological tension', 'Creeping dread']),
('Mystery', 'structure', 'Multiple Suspects', 0.93, ARRAY['Red herrings', 'Complex motives', 'Surprise reveals']),
('Mystery', 'theme', 'Justice vs Revenge', 0.82, ARRAY['Moral ambiguity', 'Personal vendettas', 'Legal vs emotional justice']),

-- Fantasy Trends
('Fantasy', 'topic', 'Chosen One Reluctance', 0.89, ARRAY['Unwilling heroes', 'Destiny resistance', 'Ordinary origins']),
('Fantasy', 'tone', 'Epic Scale', 0.91, ARRAY['World-changing stakes', 'Grand quests', 'Mythological elements']),
('Fantasy', 'structure', 'Quest Journey', 0.94, ARRAY['Hero''s journey', 'Companion dynamics', 'Progressive challenges']),
('Fantasy', 'theme', 'Power and Responsibility', 0.86, ARRAY['Great power costs', 'Leadership burdens', 'Sacrifice themes']),

-- Sci-Fi Trends
('Sci-Fi', 'topic', 'AI Consciousness', 0.88, ARRAY['Artificial intelligence', 'What makes us human', 'Technology ethics']),
('Sci-Fi', 'tone', 'Speculative Realism', 0.85, ARRAY['Plausible futures', 'Scientific accuracy', 'Social commentary']),
('Sci-Fi', 'structure', 'Time Manipulation', 0.90, ARRAY['Time travel', 'Parallel timelines', 'Causality loops']),
('Sci-Fi', 'theme', 'Humanity vs Technology', 0.87, ARRAY['Dependency concerns', 'Loss of humanity', 'Integration challenges']),

-- Thriller Trends
('Thriller', 'topic', 'Psychological Manipulation', 0.92, ARRAY['Gaslighting', 'Mind games', 'Reality distortion']),
('Thriller', 'tone', 'High Stakes Tension', 0.94, ARRAY['Immediate danger', 'Countdown scenarios', 'Life-or-death choices']),
('Thriller', 'structure', 'Race Against Time', 0.91, ARRAY['Ticking clocks', 'Deadline pressure', 'Escalating urgency']),
('Thriller', 'theme', 'Trust and Betrayal', 0.89, ARRAY['False allies', 'Hidden agendas', 'Loyalty tests']),

-- Historical Fiction Trends
('Historical Fiction', 'topic', 'Untold Stories', 0.86, ARRAY['Forgotten figures', 'Hidden histories', 'Alternative perspectives']),
('Historical Fiction', 'tone', 'Immersive Period', 0.88, ARRAY['Authentic details', 'Period language', 'Cultural accuracy']),
('Historical Fiction', 'structure', 'Dual Timeline', 0.84, ARRAY['Past and present', 'Generational connections', 'Historical parallels']),
('Historical Fiction', 'theme', 'Progress vs Tradition', 0.82, ARRAY['Social change', 'Cultural shifts', 'Modern relevance']),

-- Non-Fiction Trends
('Non-Fiction', 'topic', 'Personal Transformation', 0.90, ARRAY['Self-improvement', 'Life lessons', 'Overcoming challenges']),
('Non-Fiction', 'tone', 'Accessible Expertise', 0.87, ARRAY['Clear explanations', 'Real-world examples', 'Engaging style']),
('Non-Fiction', 'structure', 'Story-Driven Learning', 0.89, ARRAY['Narrative approach', 'Case studies', 'Personal anecdotes']),
('Non-Fiction', 'theme', 'Practical Application', 0.85, ARRAY['Actionable advice', 'Step-by-step guidance', 'Measurable results'])

ON CONFLICT DO NOTHING; 