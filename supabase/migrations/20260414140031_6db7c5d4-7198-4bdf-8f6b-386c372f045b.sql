-- Create nis-forms storage bucket for blank government PDF templates
INSERT INTO storage.buckets (id, name, public)
VALUES ('nis-forms', 'nis-forms', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to nis-forms bucket
CREATE POLICY "Public read access for nis-forms"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'nis-forms');

-- Allow authenticated users to upload to nis-forms bucket
CREATE POLICY "Authenticated users can upload to nis-forms"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'nis-forms');