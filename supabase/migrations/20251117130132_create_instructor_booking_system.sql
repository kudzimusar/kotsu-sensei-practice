-- ============================================
-- INSTRUCTOR BOOKING SYSTEM
-- Includes: 1-on-1 Sessions and Practice Rooms (Group Sessions)
-- ============================================

-- Create session type enum
CREATE TYPE public.session_type_enum AS ENUM ('video', 'in_person');
CREATE TYPE public.booking_type_enum AS ENUM ('one_on_one', 'practice_room');
CREATE TYPE public.instructor_status_enum AS ENUM ('pending', 'approved', 'rejected', 'suspended');
CREATE TYPE public.booking_status_enum AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'no_show');
CREATE TYPE public.payment_status_enum AS ENUM ('pending', 'paid', 'refunded', 'failed');
CREATE TYPE public.practice_room_status_enum AS ENUM ('open', 'full', 'in_progress', 'completed', 'cancelled');

-- ============================================
-- INSTRUCTORS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.instructors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  languages TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[] CHECK (array_length(languages, 1) > 0),
  certification_number TEXT UNIQUE,
  certification_documents TEXT[] DEFAULT ARRAY[]::TEXT[],
  bio TEXT,
  specializations TEXT[] DEFAULT ARRAY[]::TEXT[],
  years_experience INTEGER DEFAULT 0,
  rating NUMERIC(3,2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
  total_reviews INTEGER DEFAULT 0,
  status instructor_status_enum DEFAULT 'pending',
  rejection_reason TEXT,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  location_prefecture TEXT,
  location_city TEXT,
  location_address TEXT,
  location_coordinates POINT,
  available_for_video BOOLEAN DEFAULT true,
  available_for_in_person BOOLEAN DEFAULT false,
  available_for_practice_rooms BOOLEAN DEFAULT true,
  max_practice_room_size INTEGER DEFAULT 8 CHECK (max_practice_room_size >= 2 AND max_practice_room_size <= 20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.instructors ENABLE ROW LEVEL SECURITY;

-- RLS Policies for instructors
CREATE POLICY "Anyone can view approved instructors"
  ON public.instructors FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Instructors can view own profile"
  ON public.instructors FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Instructors can update own profile"
  ON public.instructors FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Instructors can insert own profile"
  ON public.instructors FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all instructors"
  ON public.instructors FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can manage all instructors"
  ON public.instructors FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- INSTRUCTOR AVAILABILITY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.instructor_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID REFERENCES public.instructors(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL CHECK (end_time > start_time),
  session_type session_type_enum NOT NULL,
  booking_type booking_type_enum DEFAULT 'one_on_one',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(instructor_id, day_of_week, start_time, session_type, booking_type)
);

-- Enable RLS
ALTER TABLE public.instructor_availability ENABLE ROW LEVEL SECURITY;

-- RLS Policies for availability
CREATE POLICY "Anyone can view availability of approved instructors"
  ON public.instructor_availability FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.instructors 
      WHERE id = instructor_id AND status = 'approved'
    )
  );

CREATE POLICY "Instructors can manage own availability"
  ON public.instructor_availability FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.instructors 
      WHERE id = instructor_id AND user_id = auth.uid()
    )
  );

-- ============================================
-- INSTRUCTOR PRICING TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.instructor_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID REFERENCES public.instructors(id) ON DELETE CASCADE NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes IN (30, 60, 90)),
  session_type session_type_enum NOT NULL,
  booking_type booking_type_enum DEFAULT 'one_on_one',
  price_yen NUMERIC(10,2) NOT NULL CHECK (price_yen > 0),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(instructor_id, duration_minutes, session_type, booking_type)
);

-- Enable RLS
ALTER TABLE public.instructor_pricing ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pricing
CREATE POLICY "Anyone can view pricing of approved instructors"
  ON public.instructor_pricing FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.instructors 
      WHERE id = instructor_id AND status = 'approved'
    )
  );

CREATE POLICY "Instructors can manage own pricing"
  ON public.instructor_pricing FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.instructors 
      WHERE id = instructor_id AND user_id = auth.uid()
    )
  );

-- ============================================
-- PRACTICE ROOMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.practice_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID REFERENCES public.instructors(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  session_type session_type_enum NOT NULL DEFAULT 'video',
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes IN (30, 60, 90)),
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  timezone TEXT DEFAULT 'Asia/Tokyo',
  max_participants INTEGER NOT NULL CHECK (max_participants >= 2 AND max_participants <= 20),
  min_participants INTEGER DEFAULT 2 CHECK (min_participants >= 2),
  current_participants INTEGER DEFAULT 0 CHECK (current_participants >= 0),
  price_per_participant_yen NUMERIC(10,2) NOT NULL CHECK (price_per_participant_yen > 0),
  total_price_yen NUMERIC(10,2) NOT NULL CHECK (total_price_yen > 0),
  status practice_room_status_enum DEFAULT 'open',
  video_call_link TEXT,
  video_call_provider TEXT CHECK (video_call_provider IN ('zoom', 'google_meet', 'custom')),
  meeting_location TEXT,
  meeting_address TEXT,
  topic_focus TEXT[] DEFAULT ARRAY[]::TEXT[],
  language TEXT DEFAULT 'english' CHECK (language IN ('english', 'japanese', 'both')),
  instructor_notes TEXT,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancelled_by UUID REFERENCES auth.users(id),
  cancellation_reason TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.practice_rooms ENABLE ROW LEVEL SECURITY;

-- RLS Policies for practice rooms
CREATE POLICY "Anyone can view open practice rooms"
  ON public.practice_rooms FOR SELECT
  USING (status IN ('open', 'in_progress'));

CREATE POLICY "Users can view their practice rooms"
  ON public.practice_rooms FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.practice_room_participants 
      WHERE practice_room_id = id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Instructors can manage own practice rooms"
  ON public.practice_rooms FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.instructors 
      WHERE id = instructor_id AND user_id = auth.uid()
    )
  );

-- ============================================
-- PRACTICE ROOM PARTICIPANTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.practice_room_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_room_id UUID REFERENCES public.practice_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  price_paid_yen NUMERIC(10,2) NOT NULL CHECK (price_paid_yen > 0),
  payment_status payment_status_enum DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  joined_at TIMESTAMP WITH TIME ZONE,
  left_at TIMESTAMP WITH TIME ZONE,
  student_notes TEXT,
  is_host BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(practice_room_id, user_id)
);

-- Enable RLS
ALTER TABLE public.practice_room_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for participants
CREATE POLICY "Users can view own participation"
  ON public.practice_room_participants FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view participants of their practice rooms"
  ON public.practice_room_participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.practice_rooms pr
      JOIN public.practice_room_participants prp ON prp.practice_room_id = pr.id
      WHERE pr.id = practice_room_id AND prp.user_id = auth.uid()
    )
  );

CREATE POLICY "Instructors can view participants of their practice rooms"
  ON public.practice_room_participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.practice_rooms pr
      JOIN public.instructors i ON i.id = pr.instructor_id
      WHERE pr.id = practice_room_id AND i.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join practice rooms"
  ON public.practice_room_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own participation"
  ON public.practice_room_participants FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- BOOKINGS TABLE (1-on-1 Sessions)
-- ============================================
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  instructor_id UUID REFERENCES public.instructors(id) ON DELETE CASCADE NOT NULL,
  session_type session_type_enum NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes IN (30, 60, 90)),
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  timezone TEXT DEFAULT 'Asia/Tokyo',
  status booking_status_enum DEFAULT 'pending',
  price_yen NUMERIC(10,2) NOT NULL CHECK (price_yen > 0),
  payment_status payment_status_enum DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  video_call_link TEXT,
  video_call_provider TEXT CHECK (video_call_provider IN ('zoom', 'google_meet', 'custom')),
  meeting_location TEXT,
  meeting_address TEXT,
  student_notes TEXT,
  instructor_notes TEXT,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancelled_by UUID REFERENCES auth.users(id),
  cancellation_reason TEXT,
  refund_amount NUMERIC(10,2) DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bookings
CREATE POLICY "Users can view own bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Instructors can view their bookings"
  ON public.bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.instructors 
      WHERE id = instructor_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings"
  ON public.bookings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Instructors can update their bookings"
  ON public.bookings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.instructors 
      WHERE id = instructor_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all bookings"
  ON public.bookings FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- INSTRUCTOR REVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.instructor_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  practice_room_id UUID REFERENCES public.practice_rooms(id) ON DELETE SET NULL,
  instructor_id UUID REFERENCES public.instructors(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  language_quality INTEGER CHECK (language_quality >= 1 AND language_quality <= 5),
  teaching_quality INTEGER CHECK (teaching_quality >= 1 AND teaching_quality <= 5),
  punctuality INTEGER CHECK (punctuality >= 1 AND punctuality <= 5),
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CHECK (
    (booking_id IS NOT NULL AND practice_room_id IS NULL) OR
    (booking_id IS NULL AND practice_room_id IS NOT NULL)
  ),
  UNIQUE(booking_id, user_id) WHERE booking_id IS NOT NULL,
  UNIQUE(practice_room_id, user_id) WHERE practice_room_id IS NOT NULL
);

-- Enable RLS
ALTER TABLE public.instructor_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reviews
CREATE POLICY "Anyone can view reviews"
  ON public.instructor_reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create own reviews"
  ON public.instructor_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON public.instructor_reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON public.instructor_reviews FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- INSTRUCTOR BLOCKED DATES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.instructor_blocked_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID REFERENCES public.instructors(id) ON DELETE CASCADE NOT NULL,
  blocked_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(instructor_id, blocked_date)
);

-- Enable RLS
ALTER TABLE public.instructor_blocked_dates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blocked dates
CREATE POLICY "Anyone can view blocked dates of approved instructors"
  ON public.instructor_blocked_dates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.instructors 
      WHERE id = instructor_id AND status = 'approved'
    )
  );

CREATE POLICY "Instructors can manage own blocked dates"
  ON public.instructor_blocked_dates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.instructors 
      WHERE id = instructor_id AND user_id = auth.uid()
    )
  );

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_instructors_user_id ON public.instructors(user_id);
CREATE INDEX IF NOT EXISTS idx_instructors_status ON public.instructors(status);
CREATE INDEX IF NOT EXISTS idx_instructors_location ON public.instructors USING GIST(location_coordinates);

CREATE INDEX IF NOT EXISTS idx_availability_instructor ON public.instructor_availability(instructor_id);
CREATE INDEX IF NOT EXISTS idx_availability_day_time ON public.instructor_availability(day_of_week, start_time, end_time);

CREATE INDEX IF NOT EXISTS idx_pricing_instructor ON public.instructor_pricing(instructor_id);
CREATE INDEX IF NOT EXISTS idx_pricing_active ON public.instructor_pricing(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_bookings_user ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_instructor ON public.bookings(instructor_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date_time ON public.bookings(scheduled_date, scheduled_time);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);

CREATE INDEX IF NOT EXISTS idx_practice_rooms_instructor ON public.practice_rooms(instructor_id);
CREATE INDEX IF NOT EXISTS idx_practice_rooms_date_time ON public.practice_rooms(scheduled_date, scheduled_time);
CREATE INDEX IF NOT EXISTS idx_practice_rooms_status ON public.practice_rooms(status);

CREATE INDEX IF NOT EXISTS idx_participants_room ON public.practice_room_participants(practice_room_id);
CREATE INDEX IF NOT EXISTS idx_participants_user ON public.practice_room_participants(user_id);

CREATE INDEX IF NOT EXISTS idx_reviews_instructor ON public.instructor_reviews(instructor_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON public.instructor_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_booking ON public.instructor_reviews(booking_id) WHERE booking_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_reviews_practice_room ON public.instructor_reviews(practice_room_id) WHERE practice_room_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_blocked_dates_instructor ON public.instructor_blocked_dates(instructor_id);
CREATE INDEX IF NOT EXISTS idx_blocked_dates_date ON public.instructor_blocked_dates(blocked_date);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_instructor_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

CREATE TRIGGER handle_instructor_updated_at
  BEFORE UPDATE ON public.instructors
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_instructor_updated_at();

CREATE TRIGGER handle_availability_updated_at
  BEFORE UPDATE ON public.instructor_availability
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_instructor_updated_at();

CREATE TRIGGER handle_pricing_updated_at
  BEFORE UPDATE ON public.instructor_pricing
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_instructor_updated_at();

CREATE TRIGGER handle_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_instructor_updated_at();

CREATE TRIGGER handle_practice_rooms_updated_at
  BEFORE UPDATE ON public.practice_rooms
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_instructor_updated_at();

CREATE TRIGGER handle_participants_updated_at
  BEFORE UPDATE ON public.practice_room_participants
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_instructor_updated_at();

CREATE TRIGGER handle_reviews_updated_at
  BEFORE UPDATE ON public.instructor_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_instructor_updated_at();

-- Update instructor rating when review is added/updated/deleted
CREATE OR REPLACE FUNCTION public.update_instructor_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  avg_rating NUMERIC;
  total_count INTEGER;
BEGIN
  IF TG_OP = 'DELETE' THEN
    SELECT 
      COALESCE(AVG(rating), 0),
      COUNT(*)
    INTO avg_rating, total_count
    FROM public.instructor_reviews
    WHERE instructor_id = OLD.instructor_id;
  ELSE
    SELECT 
      COALESCE(AVG(rating), 0),
      COUNT(*)
    INTO avg_rating, total_count
    FROM public.instructor_reviews
    WHERE instructor_id = NEW.instructor_id;
  END IF;

  UPDATE public.instructors
  SET 
    rating = ROUND(avg_rating::numeric, 2),
    total_reviews = total_count
  WHERE id = COALESCE(NEW.instructor_id, OLD.instructor_id);

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER update_instructor_rating_on_review
  AFTER INSERT OR UPDATE OR DELETE ON public.instructor_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_instructor_rating();

-- Update practice room participant count
CREATE OR REPLACE FUNCTION public.update_practice_room_participants()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  participant_count INTEGER;
  room_status practice_room_status_enum;
BEGIN
  IF TG_OP = 'DELETE' THEN
    SELECT COUNT(*) INTO participant_count
    FROM public.practice_room_participants
    WHERE practice_room_id = OLD.practice_room_id;
  ELSE
    SELECT COUNT(*) INTO participant_count
    FROM public.practice_room_participants
    WHERE practice_room_id = NEW.practice_room_id;
  END IF;

  SELECT 
    CASE 
      WHEN participant_count >= (SELECT max_participants FROM public.practice_rooms WHERE id = COALESCE(NEW.practice_room_id, OLD.practice_room_id)) THEN 'full'
      WHEN participant_count >= (SELECT min_participants FROM public.practice_rooms WHERE id = COALESCE(NEW.practice_room_id, OLD.practice_room_id)) THEN 'open'
      ELSE 'open'
    END INTO room_status;

  UPDATE public.practice_rooms
  SET 
    current_participants = participant_count,
    status = room_status
  WHERE id = COALESCE(NEW.practice_room_id, OLD.practice_room_id);

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER update_practice_room_participants_count
  AFTER INSERT OR DELETE ON public.practice_room_participants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_practice_room_participants();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to check if instructor is available at a given time
CREATE OR REPLACE FUNCTION public.is_instructor_available(
  p_instructor_id UUID,
  p_date DATE,
  p_time TIME,
  p_duration_minutes INTEGER,
  p_session_type session_type_enum,
  p_booking_type booking_type_enum DEFAULT 'one_on_one'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  day_of_week INTEGER;
  end_time TIME;
  has_availability BOOLEAN;
  is_blocked BOOLEAN;
BEGIN
  -- Check if instructor is approved
  IF NOT EXISTS (
    SELECT 1 FROM public.instructors 
    WHERE id = p_instructor_id AND status = 'approved'
  ) THEN
    RETURN false;
  END IF;

  -- Get day of week (0 = Sunday, 6 = Saturday)
  day_of_week := EXTRACT(DOW FROM p_date)::INTEGER;

  -- Calculate end time
  end_time := (p_time + (p_duration_minutes || ' minutes')::INTERVAL)::TIME;

  -- Check if instructor has availability for this day/time
  SELECT EXISTS (
    SELECT 1 FROM public.instructor_availability
    WHERE instructor_id = p_instructor_id
      AND day_of_week = day_of_week
      AND start_time <= p_time
      AND end_time >= end_time
      AND session_type = p_session_type
      AND (booking_type = p_booking_type OR booking_type = 'one_on_one')
      AND is_active = true
  ) INTO has_availability;

  IF NOT has_availability THEN
    RETURN false;
  END IF;

  -- Check if date is blocked
  SELECT EXISTS (
    SELECT 1 FROM public.instructor_blocked_dates
    WHERE instructor_id = p_instructor_id
      AND blocked_date = p_date
  ) INTO is_blocked;

  IF is_blocked THEN
    RETURN false;
  END IF;

  -- For 1-on-1: Check if there's already a booking at this time
  IF p_booking_type = 'one_on_one' THEN
    IF EXISTS (
      SELECT 1 FROM public.bookings
      WHERE instructor_id = p_instructor_id
        AND scheduled_date = p_date
        AND scheduled_time = p_time
        AND status IN ('pending', 'confirmed')
    ) THEN
      RETURN false;
    END IF;
  END IF;

  RETURN true;
END;
$$;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

