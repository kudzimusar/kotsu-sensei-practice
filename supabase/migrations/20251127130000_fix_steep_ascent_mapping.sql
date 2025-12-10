-- ============================================
-- FIX STEEP ASCENT MAPPING
-- Sign 328 is actually "horn" (警笛鳴らせ), not steep ascent
-- Correct steep ascent sign is 212-3 (上り急勾配)
-- ============================================
-- 
-- Problem: Previously mapped "steep ascent" to sign 328, but:
-- - Sign 328 = Horn/Sound Horn (警笛鳴らせ)
-- - Sign 212-3 = Steep Ascent (上り急勾配)
-- 
-- The file "japan_road_sign_328_and_506.svg" is a composite showing 
-- multiple signs, which caused incorrect matches.
-- ============================================

-- Remove incorrect steep ascent mappings to 328
DELETE FROM public.sign_number_map 
WHERE sign_number = '328' 
AND keyword IN ('steep ascent', 'steep upgrade', 'ascent', 'upgrade', '上り急勾配', '上り急勾配あり', 'nobori kyūkōbai', 'nobori kyūkōbai ari', 'steep');

-- Add correct steep ascent mappings to 212-3
INSERT INTO public.sign_number_map (keyword, sign_number) VALUES
  ('steep ascent', '212-3'),
  ('steep upgrade', '212-3'),
  ('ascent', '212-3'),
  ('upgrade', '212-3'),
  ('上り急勾配', '212-3'),
  ('上り急勾配あり', '212-3'),
  ('nobori kyūkōbai', '212-3'),
  ('nobori kyūkōbai ari', '212-3'),
  ('steep', '212-3')  -- generic fallback (maps to ascent)
ON CONFLICT (keyword) DO UPDATE 
SET sign_number = EXCLUDED.sign_number,
    updated_at = timezone('utc'::text, now());

-- Add horn sign mappings for 328 (for reference and future queries)
INSERT INTO public.sign_number_map (keyword, sign_number) VALUES
  ('horn', '328'),
  ('sound horn', '328'),
  ('警笛', '328'),
  ('警笛鳴らせ', '328'),
  ('sound horn sign', '328'),
  ('horn sign', '328')
ON CONFLICT (keyword) DO UPDATE 
SET sign_number = EXCLUDED.sign_number,
    updated_at = timezone('utc'::text, now());

-- Verify the fixes
-- Run this query to confirm mappings:
-- SELECT keyword, sign_number FROM sign_number_map 
-- WHERE keyword ILIKE '%steep%' OR keyword ILIKE '%ascent%' OR keyword ILIKE '%horn%'
-- ORDER BY sign_number, keyword;


