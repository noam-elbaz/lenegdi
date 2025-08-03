-- Fix storage policies for audio file uploads
-- The 400 Bad Request suggests storage policy issues

-- 1. First, let's check current storage policies
SELECT 
    policyname,
    cmd,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- 2. Drop existing storage policies for audio-classes bucket
DROP POLICY IF EXISTS "Public read access for audio-classes" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to audio-classes" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own files in audio-classes" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files in audio-classes" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for audio files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload audio files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own audio files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own audio files" ON storage.objects;

-- 3. Create simple, working storage policies

-- Allow public read access to audio-classes bucket
CREATE POLICY "allow_public_read_audio_classes" ON storage.objects
    FOR SELECT 
    USING (bucket_id = 'audio-classes');

-- Allow authenticated users to upload to audio-classes bucket
CREATE POLICY "allow_authenticated_upload_audio_classes" ON storage.objects
    FOR INSERT 
    WITH CHECK (
        bucket_id = 'audio-classes' 
        AND auth.role() = 'authenticated'
    );

-- Allow users to update their own files (path starts with their user ID)
CREATE POLICY "allow_users_update_own_audio_files" ON storage.objects
    FOR UPDATE 
    USING (
        bucket_id = 'audio-classes' 
        AND auth.uid()::text = (string_to_array(name, '/'))[1]
    )
    WITH CHECK (
        bucket_id = 'audio-classes' 
        AND auth.uid()::text = (string_to_array(name, '/'))[1]
    );

-- Allow users to delete their own files
CREATE POLICY "allow_users_delete_own_audio_files" ON storage.objects
    FOR DELETE 
    USING (
        bucket_id = 'audio-classes' 
        AND auth.uid()::text = (string_to_array(name, '/'))[1]
    );

-- 4. Make sure the bucket exists and is properly configured
UPDATE storage.buckets 
SET 
    public = true,
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY[
        'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 
        'audio/aac', 'audio/m4a', 'audio/flac', 'audio/webm'
    ]
WHERE id = 'audio-classes';

-- 5. Check the bucket configuration
SELECT 
    id, 
    name, 
    public, 
    file_size_limit, 
    allowed_mime_types 
FROM storage.buckets 
WHERE id = 'audio-classes';