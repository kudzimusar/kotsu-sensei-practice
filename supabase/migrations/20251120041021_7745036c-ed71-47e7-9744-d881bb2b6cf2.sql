-- Add practice_room_id to instructor_reviews
ALTER TABLE public.instructor_reviews 
ADD COLUMN IF NOT EXISTS practice_room_id UUID REFERENCES public.practice_rooms(id);

-- Update the unique constraint to handle both booking and practice room reviews
ALTER TABLE public.instructor_reviews 
DROP CONSTRAINT IF EXISTS instructor_reviews_booking_id_key;

-- Add check constraint to ensure either booking_id or practice_room_id is set (but not both)
ALTER TABLE public.instructor_reviews
ADD CONSTRAINT instructor_reviews_one_source_check 
CHECK (
  (booking_id IS NOT NULL AND practice_room_id IS NULL) OR
  (booking_id IS NULL AND practice_room_id IS NOT NULL)
);

-- Create unique constraint for practice room reviews
CREATE UNIQUE INDEX IF NOT EXISTS idx_instructor_reviews_practice_room_user 
ON public.instructor_reviews(practice_room_id, user_id) 
WHERE practice_room_id IS NOT NULL;

-- Update the booking review unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS idx_instructor_reviews_booking_user 
ON public.instructor_reviews(booking_id, user_id) 
WHERE booking_id IS NOT NULL;