-- Fix image paths for seeded questions to use public folder paths
-- image_url is auto-generated, so only update image_path
UPDATE questions 
SET image_path = REPLACE(image_path, '/src/assets/', '/assets/')
WHERE image_path LIKE '/src/assets/%';