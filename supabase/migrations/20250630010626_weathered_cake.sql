/*
  # Create AI News Table

  1. New Tables
    - `ai_news`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text, news source/publication name)
      - `title` (text, article title)
      - `url` (text, article URL)
      - `html_content` (text, full HTML content of article)
      - `summary` (text, AI-generated summary)
      - `category` (text, news category)
      - `published_at` (timestamptz, when article was published)
      - `relevance_score` (integer, AI-calculated relevance score)
      - `tags` (jsonb, array of tags)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `ai_news` table
    - Add policies for authenticated users to manage their own news
    
  3. Indexes
    - Add indexes for performance optimization
*/

CREATE TABLE IF NOT EXISTS ai_news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  title text NOT NULL,
  url text NOT NULL,
  html_content text DEFAULT '',
  summary text DEFAULT '',
  category text DEFAULT 'general',
  published_at timestamptz DEFAULT now(),
  relevance_score integer DEFAULT 50,
  tags jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE ai_news ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own news"
  ON ai_news
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own news"
  ON ai_news
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own news"
  ON ai_news
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own news"
  ON ai_news
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_news_user_id ON ai_news(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_news_category ON ai_news(category);
CREATE INDEX IF NOT EXISTS idx_ai_news_published_at ON ai_news(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_news_relevance_score ON ai_news(relevance_score DESC);
CREATE INDEX IF NOT EXISTS idx_ai_news_created_at ON ai_news(created_at DESC);

-- Create text search index for title and summary
CREATE INDEX IF NOT EXISTS idx_ai_news_search ON ai_news USING gin (to_tsvector('english', title || ' ' || summary));

-- Create GIN index for tags
CREATE INDEX IF NOT EXISTS idx_ai_news_tags ON ai_news USING gin (tags);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_ai_news_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ai_news_updated_at
  BEFORE UPDATE ON ai_news
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_news_updated_at();