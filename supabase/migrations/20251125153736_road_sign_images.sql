-- ============================================
-- ROAD SIGN IMAGES - AI IMAGE RECOGNITION
-- ============================================

-- Create storage bucket for road sign images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'road-sign-images',
  'road-sign-images',
  true,
  NULL, -- No size limit
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET file_size_limit = NULL;

-- RLS policies for storage bucket
DROP POLICY IF EXISTS "Public can view road sign images" ON storage.objects;
CREATE POLICY "Public can view road sign images"
ON storage.objects FOR SELECT
USING (bucket_id = 'road-sign-images');

DROP POLICY IF EXISTS "Authenticated users can upload road sign images" ON storage.objects;
CREATE POLICY "Authenticated users can upload road sign images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'road-sign-images' 
  AND auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Users can update their own road sign images" ON storage.objects;
CREATE POLICY "Users can update their own road sign images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'road-sign-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Admins can delete road sign images" ON storage.objects;
CREATE POLICY "Admins can delete road sign images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'road-sign-images'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'::app_role
    )
  )
);

-- ============================================
-- ROAD SIGN IMAGES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.road_sign_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Storage info
  storage_type TEXT CHECK (storage_type IN ('supabase', 'aws_s3')) NOT NULL DEFAULT 'supabase',
  storage_path TEXT NOT NULL,
  storage_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  
  -- AI Analysis
  sign_name_en TEXT,
  sign_name_jp TEXT,
  sign_category TEXT CHECK (sign_category IN ('regulatory', 'warning', 'indication', 'guidance', 'auxiliary', 'road-markings')),
  sign_meaning TEXT,
  ai_explanation TEXT,
  ai_confidence DECIMAL(3,2) CHECK (ai_confidence >= 0 AND ai_confidence <= 1),
  
  -- Metadata
  tags TEXT[] DEFAULT '{}',
  is_verified BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS road_sign_images_user_id_idx ON public.road_sign_images(user_id);
CREATE INDEX IF NOT EXISTS road_sign_images_category_idx ON public.road_sign_images(sign_category);
CREATE INDEX IF NOT EXISTS road_sign_images_tags_idx ON public.road_sign_images USING GIN(tags);
CREATE INDEX IF NOT EXISTS road_sign_images_verified_idx ON public.road_sign_images(is_verified);
CREATE INDEX IF NOT EXISTS road_sign_images_usage_count_idx ON public.road_sign_images(usage_count DESC);

-- Enable RLS
ALTER TABLE public.road_sign_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Road sign images are publicly readable"
ON public.road_sign_images FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own road sign images"
ON public.road_sign_images FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own road sign images"
ON public.road_sign_images FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can update any road sign images"
ON public.road_sign_images FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'::app_role
  )
);

CREATE POLICY "Users can delete their own road sign images"
ON public.road_sign_images FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- ROAD SIGN QUESTIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.road_sign_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  road_sign_image_id UUID REFERENCES public.road_sign_images(id) ON DELETE CASCADE,
  
  question_text TEXT NOT NULL,
  answer BOOLEAN NOT NULL,
  explanation TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS road_sign_questions_image_id_idx ON public.road_sign_questions(road_sign_image_id);
CREATE INDEX IF NOT EXISTS road_sign_questions_difficulty_idx ON public.road_sign_questions(difficulty);

-- Enable RLS
ALTER TABLE public.road_sign_questions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Road sign questions are publicly readable"
ON public.road_sign_questions FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert road sign questions"
ON public.road_sign_questions FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- ROAD SIGN FLASHCARDS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.road_sign_flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  road_sign_image_id UUID REFERENCES public.road_sign_images(id) ON DELETE CASCADE,
  
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  explanation TEXT,
  category TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS road_sign_flashcards_image_id_idx ON public.road_sign_flashcards(road_sign_image_id);
CREATE INDEX IF NOT EXISTS road_sign_flashcards_category_idx ON public.road_sign_flashcards(category);

-- Enable RLS
ALTER TABLE public.road_sign_flashcards ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Road sign flashcards are publicly readable"
ON public.road_sign_flashcards FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert road sign flashcards"
ON public.road_sign_flashcards FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger for updated_at on road_sign_images
CREATE OR REPLACE FUNCTION public.handle_road_sign_images_updated_at()
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

CREATE TRIGGER road_sign_images_updated_at
BEFORE UPDATE ON public.road_sign_images
FOR EACH ROW
EXECUTE FUNCTION public.handle_road_sign_images_updated_at();

