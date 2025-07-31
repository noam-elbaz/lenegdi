-- Supabase Storage Setup for Audio Classes
-- This script creates the storage bucket and policies for audio file uploads

-- Create storage bucket for audio files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'audio-classes',
    'audio-classes',
    true,
    52428800, -- 50MB limit
    ARRAY[
        'audio/mpeg',
        'audio/mp3', 
        'audio/wav',
        'audio/ogg',
        'audio/m4a',
        'audio/aac',
        'audio/flac'
    ]
);

-- Storage Policy: Allow public access to read audio files
CREATE POLICY "Public read access for audio files" ON storage.objects
    FOR SELECT USING (bucket_id = 'audio-classes');

-- Storage Policy: Allow authenticated users to upload audio files
CREATE POLICY "Authenticated users can upload audio files" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'audio-classes' AND 
        auth.role() = 'authenticated' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- Storage Policy: Allow users to update their own audio files
CREATE POLICY "Users can update their own audio files" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'audio-classes' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    ) WITH CHECK (
        bucket_id = 'audio-classes' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Storage Policy: Allow users to delete their own audio files
CREATE POLICY "Users can delete their own audio files" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'audio-classes' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Optional: Create a function to get storage statistics
CREATE OR REPLACE FUNCTION public.get_storage_stats()
RETURNS TABLE (
    total_files BIGINT,
    total_size BIGINT,
    avg_file_size NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_files,
        SUM(metadata->>'size')::BIGINT as total_size,
        AVG((metadata->>'size')::BIGINT)::NUMERIC as avg_file_size
    FROM storage.objects 
    WHERE bucket_id = 'audio-classes';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.get_storage_stats() TO authenticated;