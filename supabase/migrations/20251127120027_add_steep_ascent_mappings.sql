-- ============================================
-- ADD STEEP ASCENT/DESCENT MAPPINGS
-- ============================================

-- Ensure table exists (should already exist from previous migration)
CREATE TABLE IF NOT EXISTS public.sign_number_map (
  keyword TEXT PRIMARY KEY,
  sign_number TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Upsert steep ascent/descent + useful synonyms
INSERT INTO public.sign_number_map (keyword, sign_number) VALUES
  ('steep ascent', '328'),
  ('steep upgrade', '328'),
  ('ascent', '328'),
  ('upgrade', '328'),
  ('上り急勾配', '328'),
  ('上り急勾配あり', '328'),
  ('nobori kyūkōbai', '328'),
  ('nobori kyūkōbai ari', '328'),
  ('steep descent', '329'),
  ('steep downgrade', '329'),
  ('descent', '329'),
  ('downhill', '329'),
  ('下り急勾配', '329'),
  ('下り急勾配あり', '329'),
  ('kudari kyūkōbai', '329'),
  ('steep', '328')  -- generic fallback (maps to ascent)
ON CONFLICT (keyword) DO UPDATE 
SET sign_number = EXCLUDED.sign_number,
    updated_at = timezone('utc'::text, now());


