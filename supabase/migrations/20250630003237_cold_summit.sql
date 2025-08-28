/*
  # Create YouTube Chapters Table

  1. New Tables
    - `youtube_chapters`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `video_url` (text, YouTube video URL)
      - `video_id` (text, extracted YouTube video ID)
      - `video_title` (text, video title from YouTube API)
      - `video_thumbnail` (text, video thumbnail URL)
      - `chapters_text` (text, generated chapters as plain text)
      - `status` (text, generation status: pending/completed/failed)
      - `webhook_response` (jsonb, response from webhook)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `youtube_chapters` table
    - Add policies for authenticated users to manage their own chapters

  3. Indexes
    - Index on user_id for fast user queries
    - Index on video_id for duplicate checking
    - Index on status for filtering
    - Index on created_at for ordering
*/

CREATE TABLE IF NOT EXISTS youtube_chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  video_url text NOT NULL,
  video_id text NOT NULL,
  video_title text DEFAULT 'YouTube Video',
  video_thumbnail text,
  chapters_text text DEFAULT '',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  webhook_response jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE youtube_chapters ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own chapters"
  ON youtube_chapters
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chapters"
  ON youtube_chapters
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chapters"
  ON youtube_chapters
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chapters"
  ON youtube_chapters
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_youtube_chapters_user_id ON youtube_chapters(user_id);
CREATE INDEX IF NOT EXISTS idx_youtube_chapters_video_id ON youtube_chapters(video_id);
CREATE INDEX IF NOT EXISTS idx_youtube_chapters_status ON youtube_chapters(status);
CREATE INDEX IF NOT EXISTS idx_youtube_chapters_created_at ON youtube_chapters(created_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_youtube_chapters_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_youtube_chapters_updated_at
  BEFORE UPDATE ON youtube_chapters
  FOR EACH ROW
  EXECUTE FUNCTION update_youtube_chapters_updated_at();