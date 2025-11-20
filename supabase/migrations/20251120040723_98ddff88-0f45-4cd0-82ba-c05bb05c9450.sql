-- Create bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  instructor_id UUID NOT NULL REFERENCES public.instructors(id),
  session_type TEXT NOT NULL CHECK (session_type IN ('video', 'in_person')),
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes IN (30, 60, 90)),
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'Asia/Tokyo',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
  price_yen NUMERIC NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
  stripe_payment_intent_id TEXT,
  video_call_link TEXT,
  video_call_provider TEXT CHECK (video_call_provider IN ('zoom', 'google_meet', 'custom')),
  meeting_location TEXT,
  meeting_address TEXT,
  student_notes TEXT,
  instructor_notes TEXT,
  cancelled_at TIMESTAMPTZ,
  cancelled_by UUID,
  cancellation_reason TEXT,
  refund_amount NUMERIC,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Create instructor_availability table
CREATE TABLE IF NOT EXISTS public.instructor_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID NOT NULL REFERENCES public.instructors(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  session_type TEXT NOT NULL CHECK (session_type IN ('video', 'in_person', 'both')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(instructor_id, day_of_week, start_time, end_time, session_type)
);

-- Create instructor_blocked_dates table
CREATE TABLE IF NOT EXISTS public.instructor_blocked_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID NOT NULL REFERENCES public.instructors(id) ON DELETE CASCADE,
  blocked_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(instructor_id, blocked_date)
);

-- Add missing columns to instructors table
ALTER TABLE public.instructors 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS specializations TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS years_experience INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS location_prefecture TEXT,
ADD COLUMN IF NOT EXISTS location_city TEXT,
ADD COLUMN IF NOT EXISTS location_coordinates POINT,
ADD COLUMN IF NOT EXISTS available_for_video BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS available_for_in_person BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS available_for_practice_rooms BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS max_practice_room_size INTEGER DEFAULT 8,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS certification_documents TEXT[] DEFAULT '{}';

-- Create function to check instructor availability
CREATE OR REPLACE FUNCTION public.is_instructor_available(
  p_instructor_id UUID,
  p_date DATE,
  p_time TIME,
  p_duration_minutes INTEGER,
  p_session_type TEXT,
  p_booking_type TEXT DEFAULT 'one_on_one'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_day_of_week INTEGER;
  v_end_time TIME;
  v_has_availability BOOLEAN;
  v_is_blocked BOOLEAN;
  v_has_conflict BOOLEAN;
BEGIN
  -- Get day of week (0 = Sunday)
  v_day_of_week := EXTRACT(DOW FROM p_date);
  
  -- Calculate end time
  v_end_time := p_time + (p_duration_minutes || ' minutes')::INTERVAL;
  
  -- Check if instructor has availability for this day and time
  SELECT EXISTS (
    SELECT 1 FROM public.instructor_availability
    WHERE instructor_id = p_instructor_id
    AND day_of_week = v_day_of_week
    AND (session_type = p_session_type OR session_type = 'both')
    AND start_time <= p_time
    AND end_time >= v_end_time
    AND is_active = true
  ) INTO v_has_availability;
  
  IF NOT v_has_availability THEN
    RETURN FALSE;
  END IF;
  
  -- Check if date is blocked
  SELECT EXISTS (
    SELECT 1 FROM public.instructor_blocked_dates
    WHERE instructor_id = p_instructor_id
    AND blocked_date = p_date
  ) INTO v_is_blocked;
  
  IF v_is_blocked THEN
    RETURN FALSE;
  END IF;
  
  -- Check for conflicting bookings
  SELECT EXISTS (
    SELECT 1 FROM public.bookings
    WHERE instructor_id = p_instructor_id
    AND scheduled_date = p_date
    AND status IN ('pending', 'confirmed')
    AND (
      (scheduled_time <= p_time AND (scheduled_time + (duration_minutes || ' minutes')::INTERVAL) > p_time)
      OR
      (scheduled_time < v_end_time AND scheduled_time >= p_time)
    )
  ) INTO v_has_conflict;
  
  RETURN NOT v_has_conflict;
END;
$$;

-- Enable RLS on bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- RLS policies for bookings
CREATE POLICY "Users can view own bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings"
  ON public.bookings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Instructors can view their bookings"
  ON public.bookings FOR SELECT
  USING (
    instructor_id IN (
      SELECT id FROM public.instructors 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Instructors can update their bookings"
  ON public.bookings FOR UPDATE
  USING (
    instructor_id IN (
      SELECT id FROM public.instructors 
      WHERE user_id = auth.uid()
    )
  );

-- Enable RLS on instructor_availability
ALTER TABLE public.instructor_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view availability"
  ON public.instructor_availability FOR SELECT
  USING (true);

CREATE POLICY "Instructors can manage own availability"
  ON public.instructor_availability FOR ALL
  USING (
    instructor_id IN (
      SELECT id FROM public.instructors 
      WHERE user_id = auth.uid()
    )
  );

-- Enable RLS on instructor_blocked_dates
ALTER TABLE public.instructor_blocked_dates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view blocked dates"
  ON public.instructor_blocked_dates FOR SELECT
  USING (true);

CREATE POLICY "Instructors can manage own blocked dates"
  ON public.instructor_blocked_dates FOR ALL
  USING (
    instructor_id IN (
      SELECT id FROM public.instructors 
      WHERE user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_instructor_id ON public.bookings(instructor_id);
CREATE INDEX IF NOT EXISTS idx_bookings_scheduled_date ON public.bookings(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_instructor_availability_instructor_id ON public.instructor_availability(instructor_id);
CREATE INDEX IF NOT EXISTS idx_instructor_blocked_dates_instructor_id ON public.instructor_blocked_dates(instructor_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_bookings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_bookings_updated_at();