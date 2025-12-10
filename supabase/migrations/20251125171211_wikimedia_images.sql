-- ============================================
-- WIKIMEDIA COMMONS IMAGE INTEGRATION
-- Add columns to track image source and Wikimedia metadata
-- ============================================

-- Add image_source column to track where the image came from
ALTER TABLE public.road_sign_images
ADD COLUMN IF NOT EXISTS image_source TEXT 
  CHECK (image_source IN ('wikimedia_commons', 'serper', 'user_upload')) 
  DEFAULT 'user_upload';

-- Add wikimedia_file_name to track original Wikimedia filename
ALTER TABLE public.road_sign_images
ADD COLUMN IF NOT EXISTS wikimedia_file_name TEXT;

-- Add wikimedia_page_url to store original Wikimedia page URL
ALTER TABLE public.road_sign_images
ADD COLUMN IF NOT EXISTS wikimedia_page_url TEXT;

-- Add index on image_source for faster queries
CREATE INDEX IF NOT EXISTS road_sign_images_image_source_idx 
ON public.road_sign_images(image_source);

-- Add index on wikimedia_file_name for lookups
CREATE INDEX IF NOT EXISTS road_sign_images_wikimedia_file_name_idx 
ON public.road_sign_images(wikimedia_file_name);

-- Add composite index for common query patterns (category + source)
CREATE INDEX IF NOT EXISTS road_sign_images_category_source_idx 
ON public.road_sign_images(sign_category, image_source) 
WHERE image_source = 'wikimedia_commons';

-- Add index for sign name searches (for fallback matching)
CREATE INDEX IF NOT EXISTS road_sign_images_sign_name_en_idx 
ON public.road_sign_images(sign_name_en);

CREATE INDEX IF NOT EXISTS road_sign_images_sign_name_jp_idx 
ON public.road_sign_images(sign_name_jp);



