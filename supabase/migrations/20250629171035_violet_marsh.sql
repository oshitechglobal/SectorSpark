/*
  # Create content_pieces table for Infinitum AI Creator Companion

  1. New Tables
    - `content_pieces`
      - `id` (uuid, primary key) - Auto-generated unique identifier
      - `user_id` (uuid, foreign key) - References auth.users, NOT NULL
      - `title` (text, NOT NULL) - Content title/headline
      - `platform` (text, NOT NULL) - Target platform (youtube, instagram, etc.)
      - `stage` (text) - Current pipeline stage (idea, outline, writing, etc.)
      - `order` (integer) - Position within stage for sorting
      - `description` (text) - Brief content description
      - `outline` (text) - Content structure and key points
      - `hook` (text) - Opening hook/attention grabber
      - `attention_value` (text) - Key value proposition/message
      - `will_share` (boolean) - Whether content will be shared
      - `priority` (text) - Content priority level
      - `date` (date) - Scheduled publication date
      - `video_url` (text) - YouTube/video link
      - `thumbnail_url` (text) - Custom thumbnail URL
      - `gamma_url` (text) - Gamma presentation link
      - `gamma_pdf_url` (text) - Gamma PDF export link
      - `skool_post` (text) - Skool community post content
      - `email_content` (text) - Email newsletter content
      - `lead_magnets` (jsonb) - Array of lead magnet objects {name, url}
      - `created_at` (timestamptz) - Auto-generated creation timestamp
      - `updated_at` (timestamptz) - Auto-updated modification timestamp

  2. Security
    - Enable RLS on `content_pieces` table
    - Add policy for authenticated users to manage their own content
    - Add policy for authenticated users to read their own content
    - Add policy for authenticated users to update their own content
    - Add policy for authenticated users to delete their own content

  3. Indexes
    - Index on user_id for efficient user content queries
    - Index on stage for pipeline filtering
    - Index on platform for platform-specific queries
    - Index on date for calendar views
    - Composite index on user_id + stage for kanban board queries

  4. Constraints
    - Check constraint for valid platform values
    - Check constraint for valid stage values
    - Check constraint for valid priority values
    - Default values for boolean and jsonb fields
*/

-- Create content_pieces table
CREATE TABLE IF NOT EXISTS content_pieces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  platform text NOT NULL,
  stage text DEFAULT 'idea',
  "order" integer DEFAULT 0,
  description text,
  outline text,
  hook text,
  attention_value text,
  will_share boolean DEFAULT false,
  priority text DEFAULT 'medium',
  date date,
  video_url text,
  thumbnail_url text,
  gamma_url text,
  gamma_pdf_url text,
  skool_post text,
  email_content text,
  lead_magnets jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add check constraints for valid enum values
ALTER TABLE content_pieces 
ADD CONSTRAINT valid_platform 
CHECK (platform IN ('youtube', 'instagram', 'tiktok', 'twitter', 'linkedin', 'blog', 'podcast'));

ALTER TABLE content_pieces 
ADD CONSTRAINT valid_stage 
CHECK (stage IN ('idea', 'outline', 'writing', 'design', 'film', 'edit', 'publish'));

ALTER TABLE content_pieces 
ADD CONSTRAINT valid_priority 
CHECK (priority IN ('low', 'medium', 'high', 'urgent'));

-- Add check constraint for lead_magnets JSON structure
ALTER TABLE content_pieces 
ADD CONSTRAINT valid_lead_magnets 
CHECK (jsonb_typeof(lead_magnets) = 'array');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_content_pieces_user_id ON content_pieces(user_id);
CREATE INDEX IF NOT EXISTS idx_content_pieces_stage ON content_pieces(stage);
CREATE INDEX IF NOT EXISTS idx_content_pieces_platform ON content_pieces(platform);
CREATE INDEX IF NOT EXISTS idx_content_pieces_date ON content_pieces(date);
CREATE INDEX IF NOT EXISTS idx_content_pieces_user_stage ON content_pieces(user_id, stage);
CREATE INDEX IF NOT EXISTS idx_content_pieces_created_at ON content_pieces(created_at);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_content_pieces_updated_at ON content_pieces;
CREATE TRIGGER update_content_pieces_updated_at
  BEFORE UPDATE ON content_pieces
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE content_pieces ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own content pieces"
  ON content_pieces
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own content pieces"
  ON content_pieces
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own content pieces"
  ON content_pieces
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own content pieces"
  ON content_pieces
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to get content pieces by stage for a user
CREATE OR REPLACE FUNCTION get_content_by_stage(user_uuid uuid, content_stage text)
RETURNS TABLE (
  id uuid,
  title text,
  platform text,
  description text,
  priority text,
  date date,
  attention_value text,
  will_share boolean,
  lead_magnets jsonb,
  created_at timestamptz,
  updated_at timestamptz
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cp.id,
    cp.title,
    cp.platform,
    cp.description,
    cp.priority,
    cp.date,
    cp.attention_value,
    cp.will_share,
    cp.lead_magnets,
    cp.created_at,
    cp.updated_at
  FROM content_pieces cp
  WHERE cp.user_id = user_uuid 
    AND cp.stage = content_stage
  ORDER BY cp."order" ASC, cp.created_at DESC;
END;
$$;

-- Create function to move content to next stage
CREATE OR REPLACE FUNCTION move_content_to_next_stage(content_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_stage text;
  next_stage text;
  stage_order text[] := ARRAY['idea', 'outline', 'writing', 'design', 'film', 'edit', 'publish'];
  current_index integer;
BEGIN
  -- Get current stage
  SELECT stage INTO current_stage 
  FROM content_pieces 
  WHERE id = content_id AND user_id = auth.uid();
  
  IF current_stage IS NULL THEN
    RETURN false;
  END IF;
  
  -- Find current stage index
  SELECT array_position(stage_order, current_stage) INTO current_index;
  
  -- If already at last stage, don't move
  IF current_index >= array_length(stage_order, 1) THEN
    RETURN false;
  END IF;
  
  -- Get next stage
  next_stage := stage_order[current_index + 1];
  
  -- Update content piece
  UPDATE content_pieces 
  SET stage = next_stage, updated_at = now()
  WHERE id = content_id AND user_id = auth.uid();
  
  RETURN true;
END;
$$;

-- Create function to get content analytics for a user
CREATE OR REPLACE FUNCTION get_content_analytics(user_uuid uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_content', COUNT(*),
    'by_stage', jsonb_object_agg(stage, stage_count),
    'by_platform', jsonb_object_agg(platform, platform_count),
    'completion_rate', 
      CASE 
        WHEN COUNT(*) > 0 THEN 
          ROUND((COUNT(*) FILTER (WHERE stage = 'publish')::numeric / COUNT(*)::numeric) * 100, 2)
        ELSE 0 
      END
  ) INTO result
  FROM (
    SELECT 
      stage,
      platform,
      COUNT(*) OVER (PARTITION BY stage) as stage_count,
      COUNT(*) OVER (PARTITION BY platform) as platform_count
    FROM content_pieces 
    WHERE user_id = user_uuid
  ) analytics;
  
  RETURN COALESCE(result, '{}'::jsonb);
END;
$$;