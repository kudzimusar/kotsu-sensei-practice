-- Create storage bucket for instructor certifications
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'instructor-certifications',
  'instructor-certifications',
  true,
  10485760, -- 10MB
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for instructor-certifications bucket
CREATE POLICY "Authenticated users can view certifications"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'instructor-certifications'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Instructors can upload own certifications"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'instructor-certifications'
  AND auth.role() = 'authenticated'
  AND (
    -- Users can upload to their own folder
    (storage.foldername(name))[1] = auth.uid()::text
    OR
    -- Admins can upload anywhere
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'::app_role
    )
  )
);

CREATE POLICY "Instructors can update own certifications"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'instructor-certifications'
  AND auth.role() = 'authenticated'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'::app_role
    )
  )
);

CREATE POLICY "Instructors can delete own certifications"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'instructor-certifications'
  AND auth.role() = 'authenticated'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'::app_role
    )
  )
);

CREATE POLICY "Admins can view all certifications"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'instructor-certifications'
  AND EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'::app_role
  )
);

