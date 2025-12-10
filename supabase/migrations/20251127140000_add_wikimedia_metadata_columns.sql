-- ============================================
-- ADD WIKIMEDIA METADATA COLUMNS
-- Adds columns needed for official Wikimedia API metadata hydration
-- ============================================

-- Add Wikimedia page ID and revision tracking
ALTER TABLE public.road_sign_images
ADD COLUMN IF NOT EXISTS wikimedia_pageid BIGINT,
ADD COLUMN IF NOT EXISTS revision_id BIGINT,
ADD COLUMN IF NOT EXISTS metadata_hydrated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS metadata_hydrated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS extmetadata JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS commonmetadata JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS exif_metadata JSONB DEFAULT '[]'::jsonb;

-- Add indexes for metadata queries
CREATE INDEX IF NOT EXISTS road_sign_images_pageid_idx 
ON public.road_sign_images(wikimedia_pageid)
WHERE wikimedia_pageid IS NOT NULL;

CREATE INDEX IF NOT EXISTS road_sign_images_hydrated_idx 
ON public.road_sign_images(metadata_hydrated)
WHERE metadata_hydrated = false;

CREATE INDEX IF NOT EXISTS road_sign_images_revision_idx 
ON public.road_sign_images(revision_id)
WHERE revision_id IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.road_sign_images.wikimedia_pageid IS 'Official Wikimedia Commons page ID from API';
COMMENT ON COLUMN public.road_sign_images.revision_id IS 'Wikimedia revision ID - used to detect updates';
COMMENT ON COLUMN public.road_sign_images.metadata_hydrated IS 'Whether official metadata has been fetched from Wikimedia API';
COMMENT ON COLUMN public.road_sign_images.extmetadata IS 'Extended metadata from Wikimedia (JSONB)';
COMMENT ON COLUMN public.road_sign_images.commonmetadata IS 'Common metadata from Wikimedia (JSONB)';
COMMENT ON COLUMN public.road_sign_images.exif_metadata IS 'EXIF data from image (JSONB array)';

-- Ensure wikimedia_file_name exists (should already exist from previous migrations)
ALTER TABLE public.road_sign_images
ADD COLUMN IF NOT EXISTS wikimedia_file_name TEXT;

-- Add index if not exists
CREATE INDEX IF NOT EXISTS road_sign_images_wikimedia_file_name_idx 
ON public.road_sign_images(wikimedia_file_name)
WHERE wikimedia_file_name IS NOT NULL;


