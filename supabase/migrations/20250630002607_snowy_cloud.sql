/*
  # Update comment scraping categories to text fields

  1. Changes Made
    - Convert jsonb category fields to text fields
    - Preserve existing data during conversion
    - Add proper indexes for text search
    - Set default values to empty strings

  2. Categories Updated
    - most_requested_ai_tools
    - ai_tool_comparisons  
    - use_cases_applications
    - problems_complaints
    - ai_business_monetization
    - content_requests_suggestions

  3. Migration Strategy
    - Add new text columns
    - Migrate data from jsonb to text
    - Drop old jsonb columns
    - Rename new columns to original names
*/

-- Step 1: Add new text columns with temporary names
ALTER TABLE comment_scraping 
ADD COLUMN most_requested_ai_tools_text text DEFAULT '',
ADD COLUMN ai_tool_comparisons_text text DEFAULT '',
ADD COLUMN use_cases_applications_text text DEFAULT '',
ADD COLUMN problems_complaints_text text DEFAULT '',
ADD COLUMN ai_business_monetization_text text DEFAULT '',
ADD COLUMN content_requests_suggestions_text text DEFAULT '';

-- Step 2: Migrate data from jsonb arrays to text
UPDATE comment_scraping 
SET 
    most_requested_ai_tools_text = CASE 
        WHEN most_requested_ai_tools IS NULL THEN ''
        WHEN jsonb_typeof(most_requested_ai_tools) = 'array' THEN 
            COALESCE((SELECT string_agg(value::text, E'\n\n') FROM jsonb_array_elements_text(most_requested_ai_tools)), '')
        ELSE COALESCE(most_requested_ai_tools::text, '')
    END,
    ai_tool_comparisons_text = CASE 
        WHEN ai_tool_comparisons IS NULL THEN ''
        WHEN jsonb_typeof(ai_tool_comparisons) = 'array' THEN 
            COALESCE((SELECT string_agg(value::text, E'\n\n') FROM jsonb_array_elements_text(ai_tool_comparisons)), '')
        ELSE COALESCE(ai_tool_comparisons::text, '')
    END,
    use_cases_applications_text = CASE 
        WHEN use_cases_applications IS NULL THEN ''
        WHEN jsonb_typeof(use_cases_applications) = 'array' THEN 
            COALESCE((SELECT string_agg(value::text, E'\n\n') FROM jsonb_array_elements_text(use_cases_applications)), '')
        ELSE COALESCE(use_cases_applications::text, '')
    END,
    problems_complaints_text = CASE 
        WHEN problems_complaints IS NULL THEN ''
        WHEN jsonb_typeof(problems_complaints) = 'array' THEN 
            COALESCE((SELECT string_agg(value::text, E'\n\n') FROM jsonb_array_elements_text(problems_complaints)), '')
        ELSE COALESCE(problems_complaints::text, '')
    END,
    ai_business_monetization_text = CASE 
        WHEN ai_business_monetization IS NULL THEN ''
        WHEN jsonb_typeof(ai_business_monetization) = 'array' THEN 
            COALESCE((SELECT string_agg(value::text, E'\n\n') FROM jsonb_array_elements_text(ai_business_monetization)), '')
        ELSE COALESCE(ai_business_monetization::text, '')
    END,
    content_requests_suggestions_text = CASE 
        WHEN content_requests_suggestions IS NULL THEN ''
        WHEN jsonb_typeof(content_requests_suggestions) = 'array' THEN 
            COALESCE((SELECT string_agg(value::text, E'\n\n') FROM jsonb_array_elements_text(content_requests_suggestions)), '')
        ELSE COALESCE(content_requests_suggestions::text, '')
    END;

-- Step 3: Drop the old GIN index that was based on jsonb concatenation
DROP INDEX IF EXISTS idx_comment_scraping_categories;

-- Step 4: Drop the old jsonb columns
ALTER TABLE comment_scraping 
DROP COLUMN most_requested_ai_tools,
DROP COLUMN ai_tool_comparisons,
DROP COLUMN use_cases_applications,
DROP COLUMN problems_complaints,
DROP COLUMN ai_business_monetization,
DROP COLUMN content_requests_suggestions;

-- Step 5: Rename the new text columns to the original names
ALTER TABLE comment_scraping 
RENAME COLUMN most_requested_ai_tools_text TO most_requested_ai_tools;

ALTER TABLE comment_scraping 
RENAME COLUMN ai_tool_comparisons_text TO ai_tool_comparisons;

ALTER TABLE comment_scraping 
RENAME COLUMN use_cases_applications_text TO use_cases_applications;

ALTER TABLE comment_scraping 
RENAME COLUMN problems_complaints_text TO problems_complaints;

ALTER TABLE comment_scraping 
RENAME COLUMN ai_business_monetization_text TO ai_business_monetization;

ALTER TABLE comment_scraping 
RENAME COLUMN content_requests_suggestions_text TO content_requests_suggestions;

-- Step 6: Set NOT NULL constraints and defaults
ALTER TABLE comment_scraping 
ALTER COLUMN most_requested_ai_tools SET NOT NULL,
ALTER COLUMN most_requested_ai_tools SET DEFAULT '';

ALTER TABLE comment_scraping 
ALTER COLUMN ai_tool_comparisons SET NOT NULL,
ALTER COLUMN ai_tool_comparisons SET DEFAULT '';

ALTER TABLE comment_scraping 
ALTER COLUMN use_cases_applications SET NOT NULL,
ALTER COLUMN use_cases_applications SET DEFAULT '';

ALTER TABLE comment_scraping 
ALTER COLUMN problems_complaints SET NOT NULL,
ALTER COLUMN problems_complaints SET DEFAULT '';

ALTER TABLE comment_scraping 
ALTER COLUMN ai_business_monetization SET NOT NULL,
ALTER COLUMN ai_business_monetization SET DEFAULT '';

ALTER TABLE comment_scraping 
ALTER COLUMN content_requests_suggestions SET NOT NULL,
ALTER COLUMN content_requests_suggestions SET DEFAULT '';

-- Step 7: Create new text search indexes for better performance
CREATE INDEX IF NOT EXISTS idx_comment_scraping_most_requested ON comment_scraping USING gin (to_tsvector('english', most_requested_ai_tools));
CREATE INDEX IF NOT EXISTS idx_comment_scraping_comparisons ON comment_scraping USING gin (to_tsvector('english', ai_tool_comparisons));
CREATE INDEX IF NOT EXISTS idx_comment_scraping_use_cases ON comment_scraping USING gin (to_tsvector('english', use_cases_applications));
CREATE INDEX IF NOT EXISTS idx_comment_scraping_problems ON comment_scraping USING gin (to_tsvector('english', problems_complaints));
CREATE INDEX IF NOT EXISTS idx_comment_scraping_business ON comment_scraping USING gin (to_tsvector('english', ai_business_monetization));
CREATE INDEX IF NOT EXISTS idx_comment_scraping_requests ON comment_scraping USING gin (to_tsvector('english', content_requests_suggestions));