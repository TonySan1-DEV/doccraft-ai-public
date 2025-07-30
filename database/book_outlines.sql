-- Create book_outlines table
CREATE TABLE IF NOT EXISTS book_outlines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  genre TEXT NOT NULL,
  tone TEXT NOT NULL,
  outline JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE book_outlines ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
-- Users can only INSERT/SELECT their own outlines
CREATE POLICY "Users can manage their own book outlines" ON book_outlines
  FOR ALL USING (auth.uid() = user_id);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_book_outlines_user_id ON book_outlines(user_id);
CREATE INDEX IF NOT EXISTS idx_book_outlines_created_at ON book_outlines(created_at DESC);

-- Add comment for documentation
COMMENT ON TABLE book_outlines IS 'Stores AI-generated book outlines for authenticated users';
COMMENT ON COLUMN book_outlines.outline IS 'JSONB array of chapters with title and summary'; 