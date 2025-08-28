/*
  # Video-to-Revenue Pipeline Database Schema

  1. Main Tables
    - `video_revenue_generations` - Main pipeline entries
    - `video_revenue_newsletter_emails` - Generated newsletter emails
    - `video_revenue_skool_posts` - Generated Skool community posts
    - `video_revenue_linkedin_posts` - Generated LinkedIn posts

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data

  3. Relationships
    - All child tables reference video_revenue_generations
    - Proper CASCADE delete for data integrity
*/

-- Create video_revenue_generations table
CREATE TABLE IF NOT EXISTS video_revenue_generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_url text NOT NULL,
  video_title text NOT NULL,
  video_description text,
  template_resource text NOT NULL,
  key_insights jsonb DEFAULT '[]'::jsonb,
  main_teaching text,
  featured_template text,
  newsletter_cta text,
  newsletter_tone text,
  free_community_cta text,
  free_community_tone text,
  paid_community_cta text,
  paid_community_tone text,
  linkedin_keyword text,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'ready', 'published', 'archived')),
  is_favorite boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create video_revenue_newsletter_emails table
CREATE TABLE IF NOT EXISTS video_revenue_newsletter_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  generation_id uuid NOT NULL REFERENCES video_revenue_generations(id) ON DELETE CASCADE,
  email_number integer NOT NULL,
  configured_tone text,
  configured_cta text,
  subject_line text,
  content text,
  cta_integration text,
  created_at timestamptz DEFAULT now()
);

-- Create video_revenue_skool_posts table
CREATE TABLE IF NOT EXISTS video_revenue_skool_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  generation_id uuid NOT NULL REFERENCES video_revenue_generations(id) ON DELETE CASCADE,
  community text NOT NULL CHECK (community IN ('Free', 'Paid')),
  post_number integer NOT NULL,
  configured_tone text,
  configured_cta text,
  content text,
  cta_integration text,
  created_at timestamptz DEFAULT now()
);

-- Create video_revenue_linkedin_posts table
CREATE TABLE IF NOT EXISTS video_revenue_linkedin_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  generation_id uuid NOT NULL REFERENCES video_revenue_generations(id) ON DELETE CASCADE,
  variation text NOT NULL,
  configured_tone text,
  configured_keyword text,
  hook text,
  content text,
  cta_line text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE video_revenue_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_revenue_newsletter_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_revenue_skool_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_revenue_linkedin_posts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for video_revenue_generations
CREATE POLICY "Users can insert their own generations"
  ON video_revenue_generations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own generations"
  ON video_revenue_generations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own generations"
  ON video_revenue_generations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own generations"
  ON video_revenue_generations
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for video_revenue_newsletter_emails
CREATE POLICY "Users can insert their own newsletter emails"
  ON video_revenue_newsletter_emails
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own newsletter emails"
  ON video_revenue_newsletter_emails
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own newsletter emails"
  ON video_revenue_newsletter_emails
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own newsletter emails"
  ON video_revenue_newsletter_emails
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for video_revenue_skool_posts
CREATE POLICY "Users can insert their own skool posts"
  ON video_revenue_skool_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own skool posts"
  ON video_revenue_skool_posts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own skool posts"
  ON video_revenue_skool_posts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own skool posts"
  ON video_revenue_skool_posts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for video_revenue_linkedin_posts
CREATE POLICY "Users can insert their own linkedin posts"
  ON video_revenue_linkedin_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own linkedin posts"
  ON video_revenue_linkedin_posts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own linkedin posts"
  ON video_revenue_linkedin_posts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own linkedin posts"
  ON video_revenue_linkedin_posts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_video_revenue_generations_user_id ON video_revenue_generations(user_id);
CREATE INDEX idx_video_revenue_generations_status ON video_revenue_generations(status);
CREATE INDEX idx_video_revenue_generations_created_at ON video_revenue_generations(created_at DESC);
CREATE INDEX idx_video_revenue_generations_is_favorite ON video_revenue_generations(is_favorite);

CREATE INDEX idx_video_revenue_newsletter_emails_user_id ON video_revenue_newsletter_emails(user_id);
CREATE INDEX idx_video_revenue_newsletter_emails_generation_id ON video_revenue_newsletter_emails(generation_id);
CREATE INDEX idx_video_revenue_newsletter_emails_email_number ON video_revenue_newsletter_emails(email_number);

CREATE INDEX idx_video_revenue_skool_posts_user_id ON video_revenue_skool_posts(user_id);
CREATE INDEX idx_video_revenue_skool_posts_generation_id ON video_revenue_skool_posts(generation_id);
CREATE INDEX idx_video_revenue_skool_posts_community ON video_revenue_skool_posts(community);

CREATE INDEX idx_video_revenue_linkedin_posts_user_id ON video_revenue_linkedin_posts(user_id);
CREATE INDEX idx_video_revenue_linkedin_posts_generation_id ON video_revenue_linkedin_posts(generation_id);
CREATE INDEX idx_video_revenue_linkedin_posts_variation ON video_revenue_linkedin_posts(variation);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_video_revenue_generations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_video_revenue_generations_updated_at
  BEFORE UPDATE ON video_revenue_generations
  FOR EACH ROW
  EXECUTE FUNCTION update_video_revenue_generations_updated_at();