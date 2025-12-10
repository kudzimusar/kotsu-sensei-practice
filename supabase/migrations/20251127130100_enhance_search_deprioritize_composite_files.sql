-- ============================================
-- ENHANCE SEARCH TO DEPRIORITIZE COMPOSITE FILES
-- Composite files (e.g., "328 and 506") should be deprioritized
-- when searching for a specific sign number
-- ============================================

DROP FUNCTION IF EXISTS public.search_road_signs(TEXT);

CREATE OR REPLACE FUNCTION public.search_road_signs(raw_q TEXT)
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
  q TEXT := LOWER(COALESCE(raw_q, ''));
  query_terms TEXT[];
  mapped_sign TEXT;
BEGIN
  IF q = '' THEN
    RETURN;
  END IF;
  
  -- Build terms: split on whitespace, keep those >0 char (filter stop words)
  SELECT array_agg(DISTINCT trim(both ' ' from lower(x))) INTO query_terms
  FROM (
    SELECT unnest(regexp_split_to_array(q, '\s+')) AS x
  ) s
  WHERE length(trim(both ' ' from x)) > 0
    AND trim(both ' ' from lower(x)) NOT IN ('the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'japan', 'japanese', 'road', 'sign', 'signs', 'this', 'that', 'show', 'me');
  
  -- Map whole query to a sign number if present in sign_number_map
  SELECT m.sign_number INTO mapped_sign
  FROM public.sign_number_map m
  WHERE m.keyword = q
  LIMIT 1;
  
  -- If no whole query match, try matching any individual term
  IF mapped_sign IS NULL AND array_length(query_terms, 1) > 0 THEN
    SELECT m.sign_number INTO mapped_sign
    FROM public.sign_number_map m
    WHERE m.keyword = ANY(query_terms)
    ORDER BY length(m.keyword) DESC
    LIMIT 1;
  END IF;
  
  RETURN QUERY
  WITH candidates AS (
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
      rsi.usage_count,
      -- Detect composite files (files with "and" or multiple numbers)
      (CASE 
        WHEN rsi.file_name ~* '\d+\s*(and|&)\s*\d+' OR 
             rsi.wikimedia_file_name ~* '\d+\s*(and|&)\s*\d+' THEN true 
        ELSE false 
      END) AS is_composite,
      -- Compute score with individual term matching - improves ALL queries
      (
        -- Tier 1: Exact sign_code match (score 100) - HIGHEST PRIORITY
        (CASE WHEN mapped_sign IS NOT NULL AND rsi.sign_number = mapped_sign THEN 100 ELSE 0 END) +
        
        -- Tier 1b: Filename with exact sign number match (score 95) - deprioritize composites
        (CASE WHEN mapped_sign IS NOT NULL AND rsi.file_name ILIKE '%' || mapped_sign || '%' THEN 
          CASE 
            WHEN rsi.file_name ~* '\d+\s*(and|&)\s*\d+' THEN 85  -- Composite file: lower score
            WHEN rsi.file_name ~* '^[^_]*' || mapped_sign || '[^_]*\.' THEN 95  -- Exact match in filename
            ELSE 90  -- Contains but not exact
          END
        ELSE 0 END) +
        
        (CASE WHEN mapped_sign IS NOT NULL AND rsi.filename_slug ILIKE '%' || mapped_sign || '%' THEN 95 ELSE 0 END) +
        (CASE WHEN mapped_sign IS NOT NULL AND rsi.wikimedia_file_name ILIKE '%' || mapped_sign || '%' THEN 
          CASE 
            WHEN rsi.wikimedia_file_name ~* '\d+\s*(and|&)\s*\d+' THEN 85  -- Composite file: lower score
            ELSE 90
          END
        ELSE 0 END) +
        
        -- Tier 2: Full query filename match (score 80)
        (CASE WHEN rsi.file_name ILIKE '%' || q || '%' THEN 80 ELSE 0 END) +
        (CASE WHEN rsi.filename_slug ILIKE '%' || q || '%' THEN 75 ELSE 0 END) +
        (CASE WHEN rsi.wikimedia_file_name ILIKE '%' || q || '%' THEN 70 ELSE 0 END) +
        
        -- Tier 3: Full query sign name match (score 60)
        (CASE WHEN rsi.sign_name_en ILIKE '%' || q || '%' THEN 60 ELSE 0 END) +
        (CASE WHEN rsi.sign_name_jp LIKE '%' || q || '%' THEN 55 ELSE 0 END) +
        
        -- Tier 2/3 Enhancement: Individual term matches (use q_term alias)
        (SELECT GREATEST(0, 5 * count(*)) FROM (
          SELECT 1 FROM unnest(query_terms) AS q_term
          WHERE rsi.file_name ILIKE '%' || q_term || '%'
             OR rsi.filename_slug ILIKE '%' || q_term || '%'
             OR rsi.wikimedia_file_name ILIKE '%' || q_term || '%'
        ) t) +
        
        (SELECT GREATEST(0, 4 * count(*)) FROM (
          SELECT 1 FROM unnest(query_terms) AS q_term
          WHERE rsi.sign_name_en ILIKE '%' || q_term || '%'
             OR rsi.sign_name_jp LIKE '%' || q_term || '%'
             OR (rsi.tags IS NOT NULL AND q_term = ANY(rsi.tags))
        ) t) +
        
        -- Tier 4: Tags match (score 40)
        (CASE WHEN array_length(query_terms, 1) > 0 AND rsi.tags && query_terms THEN 40 ELSE 0 END) +
        (CASE WHEN EXISTS (SELECT 1 FROM unnest(rsi.tags) AS tag WHERE tag ILIKE '%' || q || '%') THEN 35 ELSE 0 END) +
        
        -- Tier 5: Category match (score 10)
        (CASE WHEN rsi.sign_category ILIKE '%' || q || '%' THEN 10 ELSE 0 END) +
        
        -- Bonus: Usage count (quality indicator, max +5)
        LEAST(COALESCE(rsi.usage_count, 0) / 20, 5)::INTEGER
        
        -- Penalty: Composite files get -10 points when searching for specific sign
        - (CASE WHEN mapped_sign IS NOT NULL AND (rsi.file_name ~* '\d+\s*(and|&)\s*\d+' OR rsi.wikimedia_file_name ~* '\d+\s*(and|&)\s*\d+') THEN 10 ELSE 0 END)
      ) AS score_calc
    FROM road_sign_images rsi
    WHERE rsi.image_source = 'wikimedia_commons'
      AND rsi.is_verified = true
      -- Only include results that have some match - now supports individual term matching
      AND (
        -- Tier 1 matches
        (mapped_sign IS NOT NULL AND (
          rsi.sign_number = mapped_sign OR
          rsi.file_name ILIKE '%' || mapped_sign || '%' OR
          rsi.filename_slug ILIKE '%' || mapped_sign || '%' OR
          rsi.wikimedia_file_name ILIKE '%' || mapped_sign || '%'
        ))
        OR
        -- Tier 2 matches (full query)
        rsi.file_name ILIKE '%' || q || '%' OR
        rsi.filename_slug ILIKE '%' || q || '%' OR
        rsi.wikimedia_file_name ILIKE '%' || q || '%'
        OR
        -- Tier 2 matches (individual terms) - KEY FOR ALL MULTI-WORD QUERIES
        EXISTS (
          SELECT 1 FROM unnest(query_terms) AS q_term
          WHERE rsi.file_name ILIKE '%' || q_term || '%'
             OR rsi.filename_slug ILIKE '%' || q_term || '%'
             OR rsi.wikimedia_file_name ILIKE '%' || q_term || '%'
        )
        OR
        -- Tier 3 matches (full query)
        rsi.sign_name_en ILIKE '%' || q || '%' OR
        rsi.sign_name_jp LIKE '%' || q || '%'
        OR
        -- Tier 3 matches (individual terms) - KEY FOR ALL MULTI-WORD QUERIES
        EXISTS (
          SELECT 1 FROM unnest(query_terms) AS q_term
          WHERE rsi.sign_name_en ILIKE '%' || q_term || '%'
             OR rsi.sign_name_jp LIKE '%' || q_term || '%'
        )
        OR
        -- Tier 4 matches
        (array_length(query_terms, 1) > 0 AND rsi.tags && query_terms) OR
        EXISTS (SELECT 1 FROM unnest(rsi.tags) AS tag WHERE tag ILIKE '%' || q || '%')
      )
  )
  SELECT
    candidates.id, candidates.storage_url, candidates.file_name, candidates.filename_slug, 
    candidates.wikimedia_file_name, candidates.sign_number, candidates.sign_name_en, 
    candidates.sign_name_jp, candidates.sign_category, candidates.tags, 
    candidates.attribution_text, candidates.license_info, candidates.wikimedia_page_url, 
    candidates.artist_name, candidates.score_calc::INTEGER AS score
  FROM candidates
  WHERE candidates.score_calc > 0
  ORDER BY 
    candidates.score_calc DESC,  -- Highest score first
    candidates.is_composite ASC,  -- Non-composite files first (false before true)
    candidates.usage_count DESC NULLS LAST
  LIMIT 25;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.search_road_signs(TEXT) TO anon, authenticated;

COMMENT ON FUNCTION public.search_road_signs IS 'Enhanced 6-tier search with individual term matching and composite file deprioritization. Searches by: 1) Sign code number, 2) Filename (full query + individual terms, deprioritizes composite files), 3) Sign names (full query + individual terms), 4) Tags, 5) Category, 6) Usage quality. Returns ranked results with relevance scores.';


