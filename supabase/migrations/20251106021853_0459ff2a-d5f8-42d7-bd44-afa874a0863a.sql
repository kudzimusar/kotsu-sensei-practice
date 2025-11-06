-- ============================================
-- PHASE 1: QUESTIONS WITH IMAGES SUPPORT
-- ============================================

-- Create storage bucket for driving scenario images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'driving-scenarios',
  'driving-scenarios',
  true,
  5242880,
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for storage bucket
CREATE POLICY "Public can view scenario images"
ON storage.objects FOR SELECT
USING (bucket_id = 'driving-scenarios');

CREATE POLICY "Authenticated users can upload scenario images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'driving-scenarios' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Admins can delete scenario images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'driving-scenarios'
  AND EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'::app_role
  )
);

-- ============================================
-- QUESTIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.questions (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  test_category TEXT NOT NULL,
  question_text TEXT NOT NULL,
  answer BOOLEAN NOT NULL,
  explanation TEXT NOT NULL,
  
  -- Image handling
  image_type TEXT CHECK (image_type IN ('sign', 'scenario', 'none')),
  image_path TEXT,
  image_storage_path TEXT,
  image_url TEXT GENERATED ALWAYS AS (
    CASE 
      WHEN image_storage_path IS NOT NULL THEN
        'https://ndulrvfwcqyvutcviebk.supabase.co/storage/v1/object/public/driving-scenarios/' || image_storage_path
      ELSE image_path
    END
  ) STORED,
  
  -- Additional metadata
  tags TEXT[] DEFAULT '{}',
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  times_shown INTEGER DEFAULT 0,
  times_correct INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS questions_test_category_idx ON public.questions(test_category);
CREATE INDEX IF NOT EXISTS questions_tags_idx ON public.questions USING GIN(tags);
CREATE INDEX IF NOT EXISTS questions_difficulty_idx ON public.questions(difficulty);
CREATE INDEX IF NOT EXISTS questions_image_type_idx ON public.questions(image_type);

-- Enable RLS
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Questions are publicly readable"
ON public.questions FOR SELECT
USING (true);

CREATE POLICY "Admins can insert questions"
ON public.questions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'::app_role
  )
);

CREATE POLICY "Admins can update questions"
ON public.questions FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'::app_role
  )
);

CREATE POLICY "Admins can delete questions"
ON public.questions FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'::app_role
  )
);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_questions_updated_at()
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

CREATE TRIGGER questions_updated_at
BEFORE UPDATE ON public.questions
FOR EACH ROW
EXECUTE FUNCTION public.handle_questions_updated_at();