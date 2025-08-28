/*
  # Create LinkedIn Post Outputs Table

  1. New Tables
    - `linkedin_post_outputs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `news_id` (uuid, foreign key to ai_news)
      - `webhook_response` (jsonb, stores the full JSON response)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `linkedin_post_outputs` table
    - Add policies for authenticated users to manage their own post outputs

  3. Indexes
    - Add indexes for performance optimization
    - Create updated_at trigger
*/

CREATE TABLE IF NOT EXISTS linkedin_post_outputs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  news_id uuid REFERENCES ai_news(id) ON DELETE CASCADE NOT NULL,
  webhook_response jsonb DEFAULT '{}' NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE linkedin_post_outputs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own post outputs"
  ON linkedin_post_outputs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own post outputs"
  ON linkedin_post_outputs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own post outputs"
  ON linkedin_post_outputs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own post outputs"
  ON linkedin_post_outputs
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_linkedin_post_outputs_user_id ON linkedin_post_outputs(user_id);
CREATE INDEX IF NOT EXISTS idx_linkedin_post_outputs_news_id ON linkedin_post_outputs(news_id);
CREATE INDEX IF NOT EXISTS idx_linkedin_post_outputs_created_at ON linkedin_post_outputs(created_at DESC);

-- Create unique constraint to prevent duplicate outputs for the same news item
CREATE UNIQUE INDEX IF NOT EXISTS idx_linkedin_post_outputs_unique_news 
  ON linkedin_post_outputs(user_id, news_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_linkedin_post_outputs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_linkedin_post_outputs_updated_at
  BEFORE UPDATE ON linkedin_post_outputs
  FOR EACH ROW
  EXECUTE FUNCTION update_linkedin_post_outputs_updated_at();