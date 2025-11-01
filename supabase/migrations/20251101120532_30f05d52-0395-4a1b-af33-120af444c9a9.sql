-- Create table for user lecture schedules
CREATE TABLE IF NOT EXISTS public.user_lecture_schedule (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lecture_number integer NOT NULL,
  stage text NOT NULL CHECK (stage IN ('First Stage', 'Second Stage')),
  scheduled_date date,
  status text NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'scheduled', 'completed')),
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, lecture_number)
);

-- Enable RLS
ALTER TABLE public.user_lecture_schedule ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own lecture schedule"
  ON public.user_lecture_schedule
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own lecture schedule"
  ON public.user_lecture_schedule
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lecture schedule"
  ON public.user_lecture_schedule
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own lecture schedule"
  ON public.user_lecture_schedule
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to auto-initialize curriculum for new users
CREATE OR REPLACE FUNCTION public.initialize_user_curriculum(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lecture_number integer;
BEGIN
  -- Insert all 26 lectures for the user
  FOR v_lecture_number IN 1..26 LOOP
    INSERT INTO public.user_lecture_schedule (user_id, lecture_number, stage, status)
    VALUES (
      p_user_id,
      v_lecture_number,
      CASE WHEN v_lecture_number <= 10 THEN 'First Stage' ELSE 'Second Stage' END,
      'not_started'
    )
    ON CONFLICT (user_id, lecture_number) DO NOTHING;
  END LOOP;
END;
$$;

-- Trigger to initialize curriculum when user profile is created
CREATE OR REPLACE FUNCTION public.handle_new_user_curriculum()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.initialize_user_curriculum(new.id);
  RETURN new;
END;
$$;

-- Create trigger on profiles table
DROP TRIGGER IF EXISTS on_profile_created_initialize_curriculum ON public.profiles;
CREATE TRIGGER on_profile_created_initialize_curriculum
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_curriculum();

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.handle_lecture_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  new.updated_at = timezone('utc'::text, now());
  IF new.status = 'completed' AND old.status != 'completed' THEN
    new.completed_at = timezone('utc'::text, now());
  END IF;
  RETURN new;
END;
$$;

CREATE TRIGGER update_lecture_schedule_updated_at
  BEFORE UPDATE ON public.user_lecture_schedule
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_lecture_updated_at();