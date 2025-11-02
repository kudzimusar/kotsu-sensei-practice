-- Update existing schedule data with correct times from Japanese schedule
-- First, delete all existing events for November and December 2025
DELETE FROM driving_school_schedule 
WHERE date >= '2025-11-01' AND date <= '2025-12-31';

-- Insert the complete correct schedule based on Japanese images
-- This will be populated by the reset-user-schedule edge function for the official user
-- Other users can load the template via ScheduleTemplateLoader component