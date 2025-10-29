-- Create guest_sessions table
CREATE TABLE IF NOT EXISTS public.guest_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  device_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  last_active TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (timezone('utc'::text, now()) + INTERVAL '7 days')
);

-- Enable RLS on guest_sessions
ALTER TABLE public.guest_sessions ENABLE ROW LEVEL SECURITY;

-- Guest sessions are publicly readable (for session validation)
CREATE POLICY "Guest sessions are publicly readable"
  ON public.guest_sessions
  FOR SELECT
  USING (expires_at > now());

-- Add guest_session_id to quiz_progress
ALTER TABLE public.quiz_progress
  ADD COLUMN IF NOT EXISTS guest_session_id UUID REFERENCES public.guest_sessions(id) ON DELETE CASCADE;

-- Update quiz_progress to allow either user_id OR guest_session_id
ALTER TABLE public.quiz_progress
  ALTER COLUMN user_id DROP NOT NULL;

-- Add constraint to ensure either user_id or guest_session_id is present
ALTER TABLE public.quiz_progress
  ADD CONSTRAINT quiz_progress_user_or_guest_check 
  CHECK (
    (user_id IS NOT NULL AND guest_session_id IS NULL) OR
    (user_id IS NULL AND guest_session_id IS NOT NULL)
  );

-- Add guest_session_id to category_performance
ALTER TABLE public.category_performance
  ADD COLUMN IF NOT EXISTS guest_session_id UUID REFERENCES public.guest_sessions(id) ON DELETE CASCADE;

-- Update category_performance to allow either user_id OR guest_session_id
ALTER TABLE public.category_performance
  ALTER COLUMN user_id DROP NOT NULL;

-- Add constraint to ensure either user_id or guest_session_id is present
ALTER TABLE public.category_performance
  ADD CONSTRAINT category_performance_user_or_guest_check 
  CHECK (
    (user_id IS NOT NULL AND guest_session_id IS NULL) OR
    (user_id IS NULL AND guest_session_id IS NOT NULL)
  );

-- Add guest_session_id to test_history
ALTER TABLE public.test_history
  ADD COLUMN IF NOT EXISTS guest_session_id UUID REFERENCES public.guest_sessions(id) ON DELETE CASCADE;

-- Update test_history to allow either user_id OR guest_session_id
ALTER TABLE public.test_history
  ALTER COLUMN user_id DROP NOT NULL;

-- Add constraint to ensure either user_id or guest_session_id is present
ALTER TABLE public.test_history
  ADD CONSTRAINT test_history_user_or_guest_check 
  CHECK (
    (user_id IS NOT NULL AND guest_session_id IS NULL) OR
    (user_id IS NULL AND guest_session_id IS NOT NULL)
  );

-- Update RLS policies for quiz_progress to support guests
DROP POLICY IF EXISTS "Users can view own quiz progress" ON public.quiz_progress;
CREATE POLICY "Users and guests can view own quiz progress"
  ON public.quiz_progress
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    guest_session_id IN (
      SELECT id FROM public.guest_sessions WHERE expires_at > now()
    )
  );

DROP POLICY IF EXISTS "Users can insert own quiz progress" ON public.quiz_progress;
CREATE POLICY "Users and guests can insert own quiz progress"
  ON public.quiz_progress
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR
    guest_session_id IN (
      SELECT id FROM public.guest_sessions WHERE expires_at > now()
    )
  );

DROP POLICY IF EXISTS "Users can update own quiz progress" ON public.quiz_progress;
CREATE POLICY "Users and guests can update own quiz progress"
  ON public.quiz_progress
  FOR UPDATE
  USING (
    auth.uid() = user_id OR
    guest_session_id IN (
      SELECT id FROM public.guest_sessions WHERE expires_at > now()
    )
  );

DROP POLICY IF EXISTS "Users can delete own quiz progress" ON public.quiz_progress;
CREATE POLICY "Users and guests can delete own quiz progress"
  ON public.quiz_progress
  FOR DELETE
  USING (
    auth.uid() = user_id OR
    guest_session_id IN (
      SELECT id FROM public.guest_sessions WHERE expires_at > now()
    )
  );

-- Update RLS policies for category_performance to support guests
DROP POLICY IF EXISTS "Users can view own performance" ON public.category_performance;
CREATE POLICY "Users and guests can view own performance"
  ON public.category_performance
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    guest_session_id IN (
      SELECT id FROM public.guest_sessions WHERE expires_at > now()
    )
  );

DROP POLICY IF EXISTS "Users can insert own performance" ON public.category_performance;
CREATE POLICY "Users and guests can insert own performance"
  ON public.category_performance
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR
    guest_session_id IN (
      SELECT id FROM public.guest_sessions WHERE expires_at > now()
    )
  );

DROP POLICY IF EXISTS "Users can update own performance" ON public.category_performance;
CREATE POLICY "Users and guests can update own performance"
  ON public.category_performance
  FOR UPDATE
  USING (
    auth.uid() = user_id OR
    guest_session_id IN (
      SELECT id FROM public.guest_sessions WHERE expires_at > now()
    )
  );

-- Update RLS policies for test_history to support guests
DROP POLICY IF EXISTS "Users can view own test history" ON public.test_history;
CREATE POLICY "Users and guests can view own test history"
  ON public.test_history
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    guest_session_id IN (
      SELECT id FROM public.guest_sessions WHERE expires_at > now()
    )
  );

DROP POLICY IF EXISTS "Users can insert own test history" ON public.test_history;
CREATE POLICY "Users and guests can insert own test history"
  ON public.test_history
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR
    guest_session_id IN (
      SELECT id FROM public.guest_sessions WHERE expires_at > now()
    )
  );

-- Create function to migrate guest data to user account
CREATE OR REPLACE FUNCTION public.migrate_guest_to_user(
  p_guest_session_id UUID,
  p_user_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_quiz_count INTEGER;
  v_test_count INTEGER;
  v_perf_count INTEGER;
BEGIN
  -- Update quiz_progress
  UPDATE public.quiz_progress
  SET user_id = p_user_id, guest_session_id = NULL
  WHERE guest_session_id = p_guest_session_id;
  GET DIAGNOSTICS v_quiz_count = ROW_COUNT;

  -- Update test_history
  UPDATE public.test_history
  SET user_id = p_user_id, guest_session_id = NULL
  WHERE guest_session_id = p_guest_session_id;
  GET DIAGNOSTICS v_test_count = ROW_COUNT;

  -- Update category_performance
  UPDATE public.category_performance
  SET user_id = p_user_id, guest_session_id = NULL
  WHERE guest_session_id = p_guest_session_id;
  GET DIAGNOSTICS v_perf_count = ROW_COUNT;

  -- Delete the guest session
  DELETE FROM public.guest_sessions
  WHERE id = p_guest_session_id;

  RETURN json_build_object(
    'success', true,
    'quiz_progress_migrated', v_quiz_count,
    'test_history_migrated', v_test_count,
    'category_performance_migrated', v_perf_count
  );
END;
$$;

-- Create indexes for guest session lookups
CREATE INDEX IF NOT EXISTS idx_guest_sessions_expires_at ON public.guest_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_quiz_progress_guest_session ON public.quiz_progress(guest_session_id);
CREATE INDEX IF NOT EXISTS idx_category_performance_guest_session ON public.category_performance(guest_session_id);
CREATE INDEX IF NOT EXISTS idx_test_history_guest_session ON public.test_history(guest_session_id);