-- Migration to add record_count column to csv_uploads table
-- Run this if you have an existing database without the record_count column

-- Add record_count column to csv_uploads table
ALTER TABLE csv_uploads ADD COLUMN IF NOT EXISTS record_count INTEGER DEFAULT 0;

-- Update existing records with their actual record counts
UPDATE csv_uploads 
SET record_count = (
    SELECT COUNT(*) 
    FROM records 
    WHERE records.upload_id = csv_uploads.id
)
WHERE record_count = 0;
