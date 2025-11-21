-- Create storage bucket for instructor certifications
INSERT INTO storage.buckets (id, name, public)
VALUES ('instructor-certifications', 'instructor-certifications', false)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own certification files
CREATE POLICY "Users can upload their own certifications"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'instructor-certifications' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view their own certification files
CREATE POLICY "Users can view their own certifications"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'instructor-certifications'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow admins to view all certifications
CREATE POLICY "Admins can view all certifications"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'instructor-certifications'
  AND EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);