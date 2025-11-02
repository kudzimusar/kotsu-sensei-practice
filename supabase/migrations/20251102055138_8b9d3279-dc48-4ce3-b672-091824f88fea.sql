-- Add language field to user_settings table
ALTER TABLE user_settings 
ADD COLUMN language text NOT NULL DEFAULT 'ja'
CHECK (language IN ('ja', 'en'));