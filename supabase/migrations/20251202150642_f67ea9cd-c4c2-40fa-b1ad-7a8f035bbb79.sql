-- Add AI-enhanced fields to road_sign_images table
ALTER TABLE road_sign_images ADD COLUMN IF NOT EXISTS expanded_meaning TEXT;
ALTER TABLE road_sign_images ADD COLUMN IF NOT EXISTS translated_japanese TEXT;
ALTER TABLE road_sign_images ADD COLUMN IF NOT EXISTS gemini_category TEXT;
ALTER TABLE road_sign_images ADD COLUMN IF NOT EXISTS ai_enhanced BOOLEAN DEFAULT false;
ALTER TABLE road_sign_images ADD COLUMN IF NOT EXISTS driver_behavior TEXT;
ALTER TABLE road_sign_images ADD COLUMN IF NOT EXISTS legal_context TEXT;
ALTER TABLE road_sign_images ADD COLUMN IF NOT EXISTS ai_enhanced_at TIMESTAMP WITH TIME ZONE;

-- Add index for AI-enhanced images lookup
CREATE INDEX IF NOT EXISTS idx_road_sign_images_ai_enhanced ON road_sign_images(ai_enhanced) WHERE ai_enhanced = true;

-- Add comment explaining fields
COMMENT ON COLUMN road_sign_images.expanded_meaning IS 'AI-generated expanded meaning of the sign for learners';
COMMENT ON COLUMN road_sign_images.translated_japanese IS 'AI-translated Japanese name with explanation';
COMMENT ON COLUMN road_sign_images.gemini_category IS 'AI-inferred category (regulatory, warning, indication, guidance, auxiliary, road-markings, traffic-signals)';
COMMENT ON COLUMN road_sign_images.driver_behavior IS 'AI-generated description of what action drivers should take';
COMMENT ON COLUMN road_sign_images.legal_context IS 'AI-generated legal implications and requirements';