-- Create the audio-classes storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'audio-classes',
  'audio-classes', 
  true,
  52428800,
  ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/m4a', 'audio/flac', 'audio/webm']
);

-- Create policy to allow public read access
CREATE POLICY "Public read access for audio-classes"
ON storage.objects
FOR SELECT
USING (bucket_id = 'audio-classes');

-- Create policy to allow authenticated users to upload
CREATE POLICY "Authenticated users can upload to audio-classes"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'audio-classes' 
  AND auth.role() = 'authenticated'
);

-- Create policy to allow users to update their own files
CREATE POLICY "Users can update their own files in audio-classes"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'audio-classes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'audio-classes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy to allow users to delete their own files
CREATE POLICY "Users can delete their own files in audio-classes"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'audio-classes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);