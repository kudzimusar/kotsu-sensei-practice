-- ============================================
-- REFINED IMAGE SEARCH ALGORITHM
-- 6-Tier Multi-Layer Search System
-- ============================================

-- Add sign_number column to road_sign_images for Tier 1 matching
ALTER TABLE public.road_sign_images
ADD COLUMN IF NOT EXISTS sign_number TEXT;

-- Add index on sign_number for fast lookups
CREATE INDEX IF NOT EXISTS road_sign_images_sign_number_idx 
ON public.road_sign_images(sign_number)
WHERE sign_number IS NOT NULL;

-- Add index on filename_slug if not exists (for Tier 2 matching)
CREATE INDEX IF NOT EXISTS road_sign_images_filename_slug_idx 
ON public.road_sign_images(filename_slug)
WHERE filename_slug IS NOT NULL;

-- Create sign_number_map table for keyword-to-sign-number mapping
CREATE TABLE IF NOT EXISTS public.sign_number_map (
  keyword TEXT PRIMARY KEY,
  sign_number TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.sign_number_map ENABLE ROW LEVEL SECURITY;

-- RLS Policies - publicly readable
CREATE POLICY "Sign number map is publicly readable"
ON public.sign_number_map FOR SELECT
USING (true);

-- Allow admins to manage mappings
CREATE POLICY "Admins can manage sign number map"
ON public.sign_number_map FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'::app_role
  )
);

-- Insert common sign number mappings
INSERT INTO public.sign_number_map (keyword, sign_number) VALUES
  ('stop', '326'),
  ('stop sign', '326'),
  ('一時停止', '326'),
  ('ichiji teishi', '326'),
  ('tomare', '326'),
  ('no entry', '101'),
  ('進入禁止', '101'),
  ('no right turn', '302'),
  ('右折禁止', '302'),
  ('bus lane', '124'),
  ('bus', '124'),
  ('バス', '124'),
  ('t intersection', '201'),
  ('┣形交差点', '201'),
  ('t-intersection', '201'),
  ('201-b', '201-B'),
  ('pedestrian crossing', '325'),
  ('pedestrian', '325'),
  ('横断歩道', '325'),
  ('crosswalk', '325'),
  ('no parking', '314'),
  ('駐車禁止', '314'),
  ('speed limit', '301'),
  ('速度制限', '301'),
  ('school', '131'),
  ('学校', '131'),
  ('children', '133'),
  ('子供', '133'),
  ('yield', '201-A'),
  ('give way', '201-A'),
  ('徐行', '201-A')
ON CONFLICT (keyword) DO UPDATE 
SET sign_number = EXCLUDED.sign_number,
    updated_at = timezone('utc'::text, now());

-- ============================================
-- COMPREHENSIVE 6-TIER SEARCH FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION public.search_road_signs(q TEXT)
RETURNS TABLE (
  id UUID,
  storage_url TEXT,
  file_name TEXT,
  filename_slug TEXT,
  wikimedia_file_name TEXT,
  sign_number TEXT,
  sign_name_en TEXT,
  sign_name_jp TEXT,
  sign_category TEXT,
  tags TEXT[],
  attribution_text TEXT,
  license_info TEXT,
  wikimedia_page_url TEXT,
  artist_name TEXT,
  score INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized_query TEXT;
  mapped_sign_number TEXT;
  detected_category TEXT;
  query_terms TEXT[];
  term TEXT;
BEGIN
  -- Step 0: Preprocess query
  normalized_query := LOWER(TRIM(q));
  
  -- Extract query terms (filter out stop words)
  query_terms := ARRAY[]::TEXT[];
  FOR term IN SELECT unnest(string_to_array(normalized_query, ' '))
  LOOP
    IF length(term) >= 2 AND term NOT IN ('the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'japan', 'japanese', 'road', 'sign', 'signs', 'this', 'that') THEN
      query_terms := array_append(query_terms, term);
    END IF;
  END LOOP;
  
  -- Step 1: Map keywords to sign numbers
  SELECT snm.sign_number INTO mapped_sign_number
  FROM sign_number_map snm
  WHERE snm.keyword = normalized_query
  LIMIT 1;
  
  -- Also check if query contains a known keyword
  IF mapped_sign_number IS NULL THEN
    SELECT snm.sign_number INTO mapped_sign_number
    FROM sign_number_map snm
    WHERE normalized_query LIKE '%' || snm.keyword || '%'
    ORDER BY length(snm.keyword) DESC
    LIMIT 1;
  END IF;
  
  -- Step 2: Detect category from query keywords
  IF normalized_query LIKE '%regulatory%' OR normalized_query LIKE '%prohibition%' OR normalized_query LIKE '%must%' OR normalized_query LIKE '%no%' OR normalized_query LIKE '%禁止%' THEN
    detected_category := 'regulatory';
  ELSIF normalized_query LIKE '%warning%' OR normalized_query LIKE '%caution%' OR normalized_query LIKE '%triangle%' OR normalized_query LIKE '%注意%' THEN
    detected_category := 'warning';
  ELSIF normalized_query LIKE '%guidance%' OR normalized_query LIKE '%direction%' OR normalized_query LIKE '%blue%' OR normalized_query LIKE '%案内%' THEN
    detected_category := 'guidance';
  ELSIF normalized_query LIKE '%marking%' OR normalized_query LIKE '%pavement%' OR normalized_query LIKE '%road marking%' OR normalized_query LIKE '%路面標示%' THEN
    detected_category := 'road-markings';
  ELSIF normalized_query LIKE '%expressway%' OR normalized_query LIKE '%exit%' OR normalized_query LIKE '%interchange%' OR normalized_query LIKE '%高速道路%' THEN
    detected_category := 'guidance'; -- Expressway signs are typically guidance
  END IF;
  
  -- Return ranked results using 6-tier scoring system
  RETURN QUERY
  WITH ranked_signs AS (
    SELECT
      rsi.id,
      rsi.storage_url,
      rsi.file_name,
      rsi.filename_slug,
      rsi.wikimedia_file_name,
      rsi.sign_number,
      rsi.sign_name_en,
      rsi.sign_name_jp,
      rsi.sign_category,
      rsi.tags,
      rsi.attribution_text,
      rsi.license_info,
      rsi.wikimedia_page_url,
      rsi.artist_name,
      -- Tier 1: Exact sign_code match (score 100)
      CASE 
        WHEN mapped_sign_number IS NOT NULL AND rsi.sign_number = mapped_sign_number THEN 100
        WHEN mapped_sign_number IS NOT NULL AND rsi.file_name ILIKE '%' || mapped_sign_number || '%' THEN 95
        WHEN mapped_sign_number IS NOT NULL AND rsi.filename_slug ILIKE '%' || mapped_sign_number || '%' THEN 95
        WHEN mapped_sign_number IS NOT NULL AND rsi.wikimedia_file_name ILIKE '%' || mapped_sign_number || '%' THEN 90
        ELSE 0
      END +
      -- Tier 2: Filename match (score 80)
      CASE
        WHEN rsi.file_name ILIKE '%' || normalized_query || '%' THEN 80
        WHEN rsi.filename_slug ILIKE '%' || normalized_query || '%' THEN 75
        WHEN rsi.wikimedia_file_name ILIKE '%' || normalized_query || '%' THEN 70
        ELSE 0
      END +
      -- Tier 3: Sign name match (score 60)
      CASE
        WHEN rsi.sign_name_en ILIKE '%' || normalized_query || '%' THEN 60
        WHEN rsi.sign_name_jp LIKE '%' || normalized_query || '%' THEN 55
        ELSE 0
      END +
      -- Tier 4: Tags match (score 40)
      CASE
        WHEN array_length(query_terms, 1) > 0 AND rsi.tags && query_terms THEN 40
        WHEN EXISTS (SELECT 1 FROM unnest(rsi.tags) AS tag WHERE tag ILIKE '%' || normalized_query || '%') THEN 35
        ELSE 0
      END +
      -- Tier 5: Category match (score 10)
      CASE
        WHEN detected_category IS NOT NULL AND rsi.sign_category = detected_category THEN 10
        ELSE 0
      END +
      -- Bonus: Usage count (quality indicator, max +5)
      LEAST(COALESCE(rsi.usage_count, 0) / 20, 5)::INTEGER AS score
    FROM road_sign_images rsi
    WHERE rsi.image_source = 'wikimedia_commons'
      AND rsi.is_verified = true
      -- Only include results that have some match
      AND (
        -- Tier 1 matches
        (mapped_sign_number IS NOT NULL AND (
          rsi.sign_number = mapped_sign_number OR
          rsi.file_name ILIKE '%' || mapped_sign_number || '%' OR
          rsi.filename_slug ILIKE '%' || mapped_sign_number || '%' OR
          rsi.wikimedia_file_name ILIKE '%' || mapped_sign_number || '%'
        ))
        OR
        -- Tier 2 matches
        rsi.file_name ILIKE '%' || normalized_query || '%' OR
        rsi.filename_slug ILIKE '%' || normalized_query || '%' OR
        rsi.wikimedia_file_name ILIKE '%' || normalized_query || '%'
        OR
        -- Tier 3 matches
        rsi.sign_name_en ILIKE '%' || normalized_query || '%' OR
        rsi.sign_name_jp LIKE '%' || normalized_query || '%'
        OR
        -- Tier 4 matches
        (array_length(query_terms, 1) > 0 AND rsi.tags && query_terms) OR
        EXISTS (SELECT 1 FROM unnest(rsi.tags) AS tag WHERE tag ILIKE '%' || normalized_query || '%')
        OR
        -- Tier 5 matches
        (detected_category IS NOT NULL AND rsi.sign_category = detected_category)
      )
  )
  SELECT *
  FROM ranked_signs
  WHERE score > 0
  ORDER BY score DESC, usage_count DESC
  LIMIT 10;
END;
$$;

-- Grant execute permission to public
GRANT EXECUTE ON FUNCTION public.search_road_signs(TEXT) TO anon, authenticated;

-- ============================================
-- ADDITIONAL INDEXES FOR PERFORMANCE
-- ============================================

-- Full-text search indexes for better text matching
CREATE INDEX IF NOT EXISTS road_sign_images_file_name_trgm_idx 
ON public.road_sign_images USING gin(file_name gin_trgm_ops)
WHERE file_name IS NOT NULL;

CREATE INDEX IF NOT EXISTS road_sign_images_sign_name_en_trgm_idx 
ON public.road_sign_images USING gin(sign_name_en gin_trgm_ops)
WHERE sign_name_en IS NOT NULL;

-- Enable pg_trgm extension if not already enabled (for trigram matching)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Composite index for common search patterns
CREATE INDEX IF NOT EXISTS road_sign_images_category_verified_idx 
ON public.road_sign_images(sign_category, is_verified, image_source)
WHERE image_source = 'wikimedia_commons' AND is_verified = true;

-- Index on tags for array containment searches (Tier 4)
-- Already exists as GIN index, but ensure it's optimal
CREATE INDEX IF NOT EXISTS road_sign_images_tags_gin_idx 
ON public.road_sign_images USING GIN(tags)
WHERE tags IS NOT NULL AND array_length(tags, 1) > 0;

COMMENT ON FUNCTION public.search_road_signs IS '6-tier multi-layer search algorithm for Japanese road signs. Searches by: 1) Sign code number, 2) Filename, 3) Sign names (EN/JP), 4) Tags, 5) Category, 6) Usage quality. Returns ranked results with relevance scores.';

COMMENT ON TABLE public.sign_number_map IS 'Maps common keywords and queries to Japanese road sign numbers (e.g., "stop" -> "326", "bus" -> "124")';

