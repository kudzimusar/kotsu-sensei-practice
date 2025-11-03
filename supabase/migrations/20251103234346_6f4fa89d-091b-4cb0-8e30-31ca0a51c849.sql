-- Remove translation system
DROP TABLE IF EXISTS public.translations CASCADE;

-- Remove language column from user_settings
ALTER TABLE public.user_settings 
DROP COLUMN IF EXISTS language;