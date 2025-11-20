-- Create instructor_pricing table
CREATE TABLE IF NOT EXISTS public.instructor_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID NOT NULL REFERENCES public.instructors(id) ON DELETE CASCADE,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes IN (30, 60, 90)),
  session_type TEXT NOT NULL CHECK (session_type IN ('video', 'in_person')),
  booking_type TEXT NOT NULL CHECK (booking_type IN ('one_on_one', 'practice_room')),
  price_yen NUMERIC NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(instructor_id, duration_minutes, session_type, booking_type)
);

-- Create practice_rooms table
CREATE TABLE IF NOT EXISTS public.practice_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID NOT NULL REFERENCES public.instructors(id),
  title TEXT NOT NULL,
  description TEXT,
  session_type TEXT NOT NULL CHECK (session_type IN ('video', 'in_person')),
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes IN (30, 60, 90)),
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'Asia/Tokyo',
  max_participants INTEGER NOT NULL CHECK (max_participants >= 2 AND max_participants <= 20),
  min_participants INTEGER NOT NULL DEFAULT 2 CHECK (min_participants >= 2),
  current_participants INTEGER NOT NULL DEFAULT 0,
  price_per_participant_yen NUMERIC NOT NULL,
  total_price_yen NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'full', 'in_progress', 'completed', 'cancelled')),
  video_call_link TEXT,
  video_call_provider TEXT CHECK (video_call_provider IN ('zoom', 'google_meet', 'custom')),
  meeting_location TEXT,
  meeting_address TEXT,
  topic_focus TEXT[] DEFAULT '{}',
  language TEXT NOT NULL DEFAULT 'both' CHECK (language IN ('english', 'japanese', 'both')),
  instructor_notes TEXT,
  cancelled_at TIMESTAMPTZ,
  cancelled_by UUID,
  cancellation_reason TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Create practice_room_participants table
CREATE TABLE IF NOT EXISTS public.practice_room_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_room_id UUID NOT NULL REFERENCES public.practice_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  price_paid_yen NUMERIC NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
  stripe_payment_intent_id TEXT,
  joined_at TIMESTAMPTZ,
  left_at TIMESTAMPTZ,
  student_notes TEXT,
  is_host BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(practice_room_id, user_id)
);

-- Enable RLS
ALTER TABLE public.instructor_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_room_participants ENABLE ROW LEVEL SECURITY;

-- RLS policies for instructor_pricing
CREATE POLICY "Anyone can view pricing"
  ON public.instructor_pricing FOR SELECT
  USING (is_active = true);

CREATE POLICY "Instructors can manage own pricing"
  ON public.instructor_pricing FOR ALL
  USING (
    instructor_id IN (
      SELECT id FROM public.instructors 
      WHERE user_id = auth.uid()
    )
  );

-- RLS policies for practice_rooms
CREATE POLICY "Anyone can view open practice rooms"
  ON public.practice_rooms FOR SELECT
  USING (status IN ('open', 'full'));

CREATE POLICY "Instructors can create practice rooms"
  ON public.practice_rooms FOR INSERT
  WITH CHECK (
    instructor_id IN (
      SELECT id FROM public.instructors 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Instructors can manage own practice rooms"
  ON public.practice_rooms FOR ALL
  USING (
    instructor_id IN (
      SELECT id FROM public.instructors 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Participants can view their practice rooms"
  ON public.practice_rooms FOR SELECT
  USING (
    id IN (
      SELECT practice_room_id FROM public.practice_room_participants 
      WHERE user_id = auth.uid()
    )
  );

-- RLS policies for practice_room_participants
CREATE POLICY "Users can view participants of their rooms"
  ON public.practice_room_participants FOR SELECT
  USING (
    practice_room_id IN (
      SELECT id FROM public.practice_rooms WHERE instructor_id IN (
        SELECT id FROM public.instructors WHERE user_id = auth.uid()
      )
    ) OR user_id = auth.uid()
  );

CREATE POLICY "Users can join practice rooms"
  ON public.practice_room_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave practice rooms"
  ON public.practice_room_participants FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_instructor_pricing_instructor_id ON public.instructor_pricing(instructor_id);
CREATE INDEX IF NOT EXISTS idx_practice_rooms_instructor_id ON public.practice_rooms(instructor_id);
CREATE INDEX IF NOT EXISTS idx_practice_rooms_scheduled_date ON public.practice_rooms(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_practice_rooms_status ON public.practice_rooms(status);
CREATE INDEX IF NOT EXISTS idx_practice_room_participants_room_id ON public.practice_room_participants(practice_room_id);
CREATE INDEX IF NOT EXISTS idx_practice_room_participants_user_id ON public.practice_room_participants(user_id);

-- Add booking_type column to instructor_availability
ALTER TABLE public.instructor_availability 
ADD COLUMN IF NOT EXISTS booking_type TEXT DEFAULT 'both' CHECK (booking_type IN ('one_on_one', 'practice_room', 'both'));