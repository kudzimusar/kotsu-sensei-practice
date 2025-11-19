-- Add certification document URL field to instructors table
ALTER TABLE public.instructors 
ADD COLUMN IF NOT EXISTS certification_url TEXT,
ADD COLUMN IF NOT EXISTS certification_filename TEXT;