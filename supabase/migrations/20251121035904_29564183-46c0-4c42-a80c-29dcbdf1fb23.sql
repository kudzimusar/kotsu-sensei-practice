-- Add approval tracking columns to instructors table
ALTER TABLE instructors
ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS approved_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS rejection_reason text;

-- Update the existing pending instructor to approved status
UPDATE instructors 
SET status = 'approved', 
    approved_at = NOW(),
    approved_by = '63908300-f3df-4fff-ab25-cc268e00a45b'
WHERE id = '8402dc6b-9d29-4aaf-8f7e-9e39dc288d7a' 
  AND status = 'pending';