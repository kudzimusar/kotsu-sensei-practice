-- Fix time slot mismatch: update existing events from 18:10-19:40 to 18:30-20:00
-- so they display correctly in the schedule grid

UPDATE driving_school_schedule
SET time_slot = '18:30-20:00'
WHERE time_slot = '18:10-19:40'
  AND date >= '2025-11-01' 
  AND date <= '2025-12-31';