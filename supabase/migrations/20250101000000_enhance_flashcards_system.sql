-- ============================================
-- ENHANCE FLASHCARDS SYSTEM
-- Adds progress tracking, options, difficulty, and adaptive learning
-- ============================================

-- ============================================
-- ENHANCE ROAD_SIGN_FLASHCARDS TABLE
-- ============================================

-- Add missing columns to road_sign_flashcards
ALTER TABLE public.road_sign_flashcards
ADD COLUMN IF NOT EXISTS correct_answer TEXT,
ADD COLUMN IF NOT EXISTS options TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'easy',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Update existing records: set correct_answer = answer if not set
UPDATE public.road_sign_flashcards
SET correct_answer = answer
WHERE correct_answer IS NULL;

-- Add index for difficulty
CREATE INDEX IF NOT EXISTS road_sign_flashcards_difficulty_idx 
ON public.road_sign_flashcards(difficulty);

-- Add index for options (for GIN index on array)
CREATE INDEX IF NOT EXISTS road_sign_flashcards_options_idx 
ON public.road_sign_flashcards USING GIN(options);

-- ============================================
-- ADD FLASHCARD_READY TO ROAD_SIGN_IMAGES
-- ============================================

ALTER TABLE public.road_sign_images
ADD COLUMN IF NOT EXISTS flashcard_ready BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS road_sign_images_flashcard_ready_idx 
ON public.road_sign_images(flashcard_ready)
WHERE flashcard_ready = true;

-- ============================================
-- CREATE USER_FLASHCARD_PROGRESS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.user_flashcard_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flashcard_id UUID NOT NULL REFERENCES public.road_sign_flashcards(id) ON DELETE CASCADE,
  
  -- Progress tracking
  attempts INTEGER DEFAULT 0,
  correct INTEGER DEFAULT 0,
  incorrect INTEGER DEFAULT 0,
  
  -- Timestamps
  first_seen TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  last_correct TIMESTAMP WITH TIME ZONE,
  last_incorrect TIMESTAMP WITH TIME ZONE,
  
  -- Mastery tracking
  mastered BOOLEAN DEFAULT false,
  mastered_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraint: one progress record per user per flashcard
  CONSTRAINT unique_user_flashcard UNIQUE(user_id, flashcard_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS user_flashcard_progress_user_id_idx 
ON public.user_flashcard_progress(user_id);

CREATE INDEX IF NOT EXISTS user_flashcard_progress_flashcard_id_idx 
ON public.user_flashcard_progress(flashcard_id);

CREATE INDEX IF NOT EXISTS user_flashcard_progress_mastered_idx 
ON public.user_flashcard_progress(mastered)
WHERE mastered = false;

CREATE INDEX IF NOT EXISTS user_flashcard_progress_last_seen_idx 
ON public.user_flashcard_progress(last_seen DESC);

-- Enable RLS
ALTER TABLE public.user_flashcard_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own flashcard progress"
ON public.user_flashcard_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own flashcard progress"
ON public.user_flashcard_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own flashcard progress"
ON public.user_flashcard_progress FOR UPDATE
USING (auth.uid() = user_id);

-- ============================================
-- CREATE ROAD_SIGN_TAGS TABLE (Optional - for explicit tagging)
-- ============================================

CREATE TABLE IF NOT EXISTS public.road_sign_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sign_id UUID NOT NULL REFERENCES public.road_sign_images(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Constraint: unique tag per sign
  CONSTRAINT unique_sign_tag UNIQUE(sign_id, tag)
);

-- Indexes
CREATE INDEX IF NOT EXISTS road_sign_tags_sign_id_idx 
ON public.road_sign_tags(sign_id);

CREATE INDEX IF NOT EXISTS road_sign_tags_tag_idx 
ON public.road_sign_tags(tag);

-- Enable RLS
ALTER TABLE public.road_sign_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Road sign tags are publicly readable"
ON public.road_sign_tags FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert tags"
ON public.road_sign_tags FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to update flashcard progress
CREATE OR REPLACE FUNCTION public.update_flashcard_progress(
  p_user_id UUID,
  p_flashcard_id UUID,
  p_is_correct BOOLEAN
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_attempts INTEGER;
  v_correct INTEGER;
  v_incorrect INTEGER;
BEGIN
  -- Insert or update progress
  INSERT INTO public.user_flashcard_progress (
    user_id,
    flashcard_id,
    attempts,
    correct,
    incorrect,
    last_seen,
    last_correct,
    last_incorrect
  )
  VALUES (
    p_user_id,
    p_flashcard_id,
    1,
    CASE WHEN p_is_correct THEN 1 ELSE 0 END,
    CASE WHEN p_is_correct THEN 0 ELSE 1 END,
    now(),
    CASE WHEN p_is_correct THEN now() ELSE NULL END,
    CASE WHEN p_is_correct THEN NULL ELSE now() END
  )
  ON CONFLICT (user_id, flashcard_id)
  DO UPDATE SET
    attempts = user_flashcard_progress.attempts + 1,
    correct = user_flashcard_progress.correct + CASE WHEN p_is_correct THEN 1 ELSE 0 END,
    incorrect = user_flashcard_progress.incorrect + CASE WHEN p_is_correct THEN 0 ELSE 1 END,
    last_seen = now(),
    last_correct = CASE WHEN p_is_correct THEN now() ELSE user_flashcard_progress.last_correct END,
    last_incorrect = CASE WHEN p_is_correct THEN user_flashcard_progress.last_incorrect ELSE now() END,
    mastered = CASE 
      WHEN user_flashcard_progress.correct + CASE WHEN p_is_correct THEN 1 ELSE 0 END >= 3 
        AND (user_flashcard_progress.correct::FLOAT / NULLIF(user_flashcard_progress.attempts + 1, 0)) >= 0.8
      THEN true
      ELSE user_flashcard_progress.mastered
    END,
    mastered_at = CASE 
      WHEN user_flashcard_progress.mastered = false 
        AND (user_flashcard_progress.correct + CASE WHEN p_is_correct THEN 1 ELSE 0 END >= 3 
          AND (user_flashcard_progress.correct::FLOAT / NULLIF(user_flashcard_progress.attempts + 1, 0)) >= 0.8)
      THEN now()
      ELSE user_flashcard_progress.mastered_at
    END;
END;
$$;

-- Function to get user's weak areas (for adaptive learning)
CREATE OR REPLACE FUNCTION public.get_user_weak_areas(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  flashcard_id UUID,
  sign_category TEXT,
  attempts INTEGER,
  correct INTEGER,
  accuracy DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ufp.flashcard_id,
    rsf.category,
    ufp.attempts,
    ufp.correct,
    CASE 
      WHEN ufp.attempts > 0 THEN (ufp.correct::DECIMAL / ufp.attempts)
      ELSE 0
    END as accuracy
  FROM public.user_flashcard_progress ufp
  JOIN public.road_sign_flashcards rsf ON rsf.id = ufp.flashcard_id
  WHERE ufp.user_id = p_user_id
    AND ufp.mastered = false
    AND ufp.attempts > 0
  ORDER BY accuracy ASC, ufp.attempts DESC
  LIMIT p_limit;
END;
$$;

-- Trigger for updated_at on road_sign_flashcards
CREATE OR REPLACE FUNCTION public.handle_flashcards_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

CREATE TRIGGER road_sign_flashcards_updated_at
BEFORE UPDATE ON public.road_sign_flashcards
FOR EACH ROW
EXECUTE FUNCTION public.handle_flashcards_updated_at();

