/*
  # Create YouTube video analysis table

  1. New Tables
    - `youtube_analysis`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `video_url` (text, the original YouTube URL)
      - `video_id` (text, extracted YouTube video ID)
      - `video_title` (text, video title from YouTube)
      - `video_thumbnail` (text, thumbnail URL)
      - `analysis_html` (text, the HTML analysis content from webhook)
      - `status` (text, analysis status: pending/completed/failed)
      - `webhook_response` (jsonb, full webhook response data)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `youtube_analysis` table
    - Add policies for authenticated users to manage their own analysis data

  3. Indexes
    - Add index on user_id for faster queries
    - Add index on video_id for duplicate detection
    - Add index on status for filtering
*/

CREATE TABLE IF NOT EXISTS youtube_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  video_url text NOT NULL,
  video_id text NOT NULL,
  video_title text DEFAULT 'YouTube Video',
  video_thumbnail text,
  analysis_html text DEFAULT '',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  webhook_response jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE youtube_analysis ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own analysis"
  ON youtube_analysis
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analysis"
  ON youtube_analysis
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analysis"
  ON youtube_analysis
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analysis"
  ON youtube_analysis
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_youtube_analysis_user_id ON youtube_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_youtube_analysis_video_id ON youtube_analysis(video_id);
CREATE INDEX IF NOT EXISTS idx_youtube_analysis_status ON youtube_analysis(status);
CREATE INDEX IF NOT EXISTS idx_youtube_analysis_created_at ON youtube_analysis(created_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_youtube_analysis_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_youtube_analysis_updated_at
  BEFORE UPDATE ON youtube_analysis
  FOR EACH ROW
  EXECUTE FUNCTION update_youtube_analysis_updated_at();