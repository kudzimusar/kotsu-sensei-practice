-- ============================================
-- INSTRUCTOR CERTIFICATION DOCUMENTS STORAGE
-- ============================================

-- Create storage bucket for instructor certification documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'instructor-certifications',
  'instructor-certifications',
  false, -- Private bucket, only accessible by authenticated users
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for certification documents bucket
CREATE POLICY "Instructors can upload own certification documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'instructor-certifications' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Instructors can view own certification documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'instructor-certifications'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Admins can view all certification documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'instructor-certifications'
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'::app_role
  )
);

CREATE POLICY "Instructors can update own certification documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'instructor-certifications'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Instructors can delete own certification documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'instructor-certifications'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

