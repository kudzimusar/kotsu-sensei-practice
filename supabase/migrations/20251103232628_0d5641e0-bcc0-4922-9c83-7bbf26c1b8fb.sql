-- Create function to automatically mark past driving schedule events as completed
CREATE OR REPLACE FUNCTION auto_complete_past_schedule_events()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update driving_school_schedule events where date has passed and status is still 'scheduled'
  UPDATE driving_school_schedule
  SET status = 'completed',
      updated_at = timezone('utc'::text, now())
  WHERE date < CURRENT_DATE
    AND status = 'scheduled';
    
  -- Also mark any user_lecture_schedule items as completed if their scheduled_date has passed
  UPDATE user_lecture_schedule
  SET status = 'completed',
      completed_at = timezone('utc'::text, now()),
      updated_at = timezone('utc'::text, now())
  WHERE scheduled_date < CURRENT_DATE
    AND status = 'scheduled';
END;
$$;

-- Create function that users can call to manually mark a schedule event as complete
CREATE OR REPLACE FUNCTION mark_schedule_event_complete(event_id uuid)
RETURNS driving_school_schedule
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result driving_school_schedule;
BEGIN
  UPDATE driving_school_schedule
  SET status = 'completed',
      updated_at = timezone('utc'::text, now())
  WHERE id = event_id
    AND user_id = auth.uid()
  RETURNING * INTO result;
  
  RETURN result;
END;
$$;