-- Migration: Add dynamic columns support to MDM tables
-- This allows storing flexible column data from uploaded CSV files

-- Add columns_info to jobs table (stores JSON array of column names)
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS columns_info TEXT;

-- Add row_data to clean_data table (stores JSON of all row fields)
ALTER TABLE clean_data ADD COLUMN IF NOT EXISTS row_data TEXT;

-- Add row_data to quarantine_data table (stores JSON of all row fields)
ALTER TABLE quarantine_data ADD COLUMN IF NOT EXISTS row_data TEXT;

-- Verify the changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('jobs', 'clean_data', 'quarantine_data')
ORDER BY table_name, ordinal_position;
