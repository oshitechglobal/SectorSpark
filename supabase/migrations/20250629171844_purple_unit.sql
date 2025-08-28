/*
  # Add due_date column to content_pieces table

  1. Changes
    - Add `due_date` column to `content_pieces` table as nullable date field
    - This resolves the schema mismatch where the frontend expects `due_date` but the table only has `date`

  2. Notes
    - The `due_date` column will be used for publication scheduling
    - Existing `date` column remains for backward compatibility
    - Column is nullable to allow content without specific due dates
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'content_pieces' AND column_name = 'due_date'
  ) THEN
    ALTER TABLE content_pieces ADD COLUMN due_date date;
  END IF;
END $$;