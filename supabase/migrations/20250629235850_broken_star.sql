/*
  # Update comment scraping table with categories

  1. Changes
    - Add category columns for the six specific comment types
    - Update existing table structure to support categorized comments
    - Maintain backward compatibility with existing data

  2. Categories
    - Most Requested AI Tools
    - AI Tool Comparisons  
    - Use Cases & Applications
    - Problems & Complaints
    - AI Business & Monetization
    - Content Requests & Suggestions
*/

-- Add category columns to comment_scraping table
DO $$
BEGIN
  -- Add category columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comment_scraping' AND column_name = 'most_requested_ai_tools') THEN
    ALTER TABLE comment_scraping ADD COLUMN most_requested_ai_tools jsonb DEFAULT '[]';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comment_scraping' AND column_name = 'ai_tool_comparisons') THEN
    ALTER TABLE comment_scraping ADD COLUMN ai_tool_comparisons jsonb DEFAULT '[]';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comment_scraping' AND column_name = 'use_cases_applications') THEN
    ALTER TABLE comment_scraping ADD COLUMN use_cases_applications jsonb DEFAULT '[]';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comment_scraping' AND column_name = 'problems_complaints') THEN
    ALTER TABLE comment_scraping ADD COLUMN problems_complaints jsonb DEFAULT '[]';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comment_scraping' AND column_name = 'ai_business_monetization') THEN
    ALTER TABLE comment_scraping ADD COLUMN ai_business_monetization jsonb DEFAULT '[]';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comment_scraping' AND column_name = 'content_requests_suggestions') THEN
    ALTER TABLE comment_scraping ADD COLUMN content_requests_suggestions jsonb DEFAULT '[]';
  END IF;
END $$;

-- Add indexes for the new category columns
CREATE INDEX IF NOT EXISTS idx_comment_scraping_categories ON comment_scraping USING gin (
  (most_requested_ai_tools || ai_tool_comparisons || use_cases_applications || problems_complaints || ai_business_monetization || content_requests_suggestions)
);