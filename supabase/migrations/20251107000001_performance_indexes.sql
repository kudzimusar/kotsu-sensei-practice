-- ============================================
-- PERFORMANCE INDEXES FOR CALENDAR/PLANNER
-- Critical optimization to reduce query times from 60+ seconds to <1 second
-- ============================================

-- Index for study_events date range queries
-- Used when fetching events for a specific user within a date range
CREATE INDEX IF NOT EXISTS idx_study_events_user_date 
  ON public.study_events(user_id, date) 
  WHERE user_id IS NOT NULL;

-- Index for driving_school_schedule date range queries with status filtering
-- Used when fetching schedule events for calendar display
CREATE INDEX IF NOT EXISTS idx_driving_schedule_user_date_status 
  ON public.driving_school_schedule(user_id, date, status)
  WHERE user_id IS NOT NULL;

-- Partial index for upcoming events queries (most common query pattern)
-- Optimizes the "show upcoming events" query that runs frequently
CREATE INDEX IF NOT EXISTS idx_driving_schedule_upcoming 
  ON public.driving_school_schedule(user_id, date, status) 
  WHERE status = 'scheduled' AND date >= CURRENT_DATE;

-- Index for holiday lookups by date range
-- Used when checking if dates are holidays for calendar blocking
CREATE INDEX IF NOT EXISTS idx_holidays_date_range 
  ON public.holidays(date);

-- Composite index for efficient event queries by user and date range
-- Used when combining events from multiple sources
CREATE INDEX IF NOT EXISTS idx_study_events_user_date_range 
  ON public.study_events(user_id, date, type) 
  WHERE user_id IS NOT NULL;

-- Index for guest session support in study_events (if needed)
-- Note: guest_session_id may not exist yet, but prepare for future
CREATE INDEX IF NOT EXISTS idx_study_events_guest_date 
  ON public.study_events(guest_session_id, date) 
  WHERE guest_session_id IS NOT NULL;

-- ============================================
-- ANALYZE TABLES
-- Update query planner statistics for better query plans
-- ============================================

ANALYZE public.study_events;
ANALYZE public.driving_school_schedule;
ANALYZE public.holidays;

