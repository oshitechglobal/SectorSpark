/*
  # Create comment scraping table

  1. New Tables
    - `comment_scraping`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `video_url` (text, YouTube video URL)
      - `video_id` (text, YouTube video ID)
      - `video_title` (text, video title)
      - `video_thumbnail` (text, thumbnail URL)
      - `comment_count` (integer, number of comments to scrape)
      - `scraped_data` (jsonb, categorized comments data)
      - `status` (text, scraping status)
      - `webhook_response` (jsonb, webhook response data)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `comment_scraping` table
    - Add policies for authenticated users to manage their own data
*/

CREATE TABLE IF NOT EXISTS comment_scraping (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  video_url text NOT NULL,
  video_id text NOT NULL,
  video_title text DEFAULT 'YouTube Video',
  video_thumbnail text,
  comment_count integer DEFAULT 100,
  scraped_data jsonb DEFAULT '{}',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  webhook_response jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE comment_scraping ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own scrapings"
  ON comment_scraping
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own scrapings"
  ON comment_scraping
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scrapings"
  ON comment_scraping
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scrapings"
  ON comment_scraping
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_comment_scraping_user_id ON comment_scraping(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_scraping_video_id ON comment_scraping(video_id);
CREATE INDEX IF NOT EXISTS idx_comment_scraping_status ON comment_scraping(status);
CREATE INDEX IF NOT EXISTS idx_comment_scraping_created_at ON comment_scraping(created_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_comment_scraping_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_comment_scraping_updated_at
  BEFORE UPDATE ON comment_scraping
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_scraping_updated_at();