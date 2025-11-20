-- Create instructor_reviews table
CREATE TABLE IF NOT EXISTS public.instructor_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID NOT NULL REFERENCES public.instructors(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  booking_id UUID REFERENCES public.bookings(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  helpful_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  admin_response TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(booking_id)
);

-- Enable RLS
ALTER TABLE public.instructor_reviews ENABLE ROW LEVEL SECURITY;

-- RLS policies for instructor_reviews
CREATE POLICY "Anyone can view verified reviews"
  ON public.instructor_reviews FOR SELECT
  USING (is_verified = true);

CREATE POLICY "Users can create reviews for their bookings"
  ON public.instructor_reviews FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.bookings 
      WHERE id = booking_id 
      AND user_id = auth.uid()
      AND status = 'completed'
    )
  );

CREATE POLICY "Users can update own reviews"
  ON public.instructor_reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Instructors can respond to reviews"
  ON public.instructor_reviews FOR UPDATE
  USING (
    instructor_id IN (
      SELECT id FROM public.instructors 
      WHERE user_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_instructor_reviews_instructor_id ON public.instructor_reviews(instructor_id);
CREATE INDEX IF NOT EXISTS idx_instructor_reviews_user_id ON public.instructor_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_instructor_reviews_rating ON public.instructor_reviews(rating);

-- Create edge functions for booking and practice room payments
-- Note: These are just table structures. Edge functions are managed separately.