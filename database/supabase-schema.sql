-- Supabase Audio Classes Database Schema
-- This script creates the necessary tables, constraints, indexes, and RLS policies
-- for an audio classes website

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the audio_classes table
CREATE TABLE public.audio_classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    tags TEXT[] DEFAULT '{}',
    audio_file_path TEXT,
    audio_file_url TEXT,
    duration INTEGER CHECK (duration >= 0),
    file_size BIGINT CHECK (file_size >= 0),
    mime_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_audio_classes_created_by ON public.audio_classes(created_by);
CREATE INDEX idx_audio_classes_created_at ON public.audio_classes(created_at DESC);
CREATE INDEX idx_audio_classes_title ON public.audio_classes(title);
CREATE INDEX idx_audio_classes_tags ON public.audio_classes USING GIN(tags);
CREATE INDEX idx_audio_classes_duration ON public.audio_classes(duration);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at on row changes
CREATE TRIGGER trigger_audio_classes_updated_at
    BEFORE UPDATE ON public.audio_classes
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Enable Row Level Security
ALTER TABLE public.audio_classes ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow public read access (SELECT) for all users
CREATE POLICY "Public read access for audio_classes" ON public.audio_classes
    FOR SELECT USING (true);

-- RLS Policy: Allow authenticated users to insert their own records
CREATE POLICY "Authenticated users can insert audio_classes" ON public.audio_classes
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = created_by);

-- RLS Policy: Allow users to update their own records
CREATE POLICY "Users can update their own audio_classes" ON public.audio_classes
    FOR UPDATE USING (auth.uid() = created_by) WITH CHECK (auth.uid() = created_by);

-- RLS Policy: Allow users to delete their own records
CREATE POLICY "Users can delete their own audio_classes" ON public.audio_classes
    FOR DELETE USING (auth.uid() = created_by);

-- Optional: Create a view for public access with commonly needed fields
CREATE OR REPLACE VIEW public.audio_classes_public AS
SELECT 
    id,
    title,
    description,
    tags,
    audio_file_url,
    duration,
    mime_type,
    created_at,
    updated_at
FROM public.audio_classes;

-- Enable RLS on the view as well
ALTER VIEW public.audio_classes_public SET (security_invoker = true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.audio_classes TO authenticated;
GRANT SELECT ON public.audio_classes TO anon;
GRANT SELECT ON public.audio_classes_public TO anon, authenticated;

-- Create a function to get audio classes with metadata (optional helper)
CREATE OR REPLACE FUNCTION public.get_audio_classes_with_stats()
RETURNS TABLE (
    total_classes BIGINT,
    total_duration INTEGER,
    avg_duration NUMERIC,
    most_common_tags TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_classes,
        SUM(duration)::INTEGER as total_duration,
        AVG(duration)::NUMERIC as avg_duration,
        ARRAY(
            SELECT DISTINCT unnest(tags) 
            FROM public.audio_classes 
            WHERE tags IS NOT NULL 
            GROUP BY unnest(tags) 
            ORDER BY COUNT(*) DESC 
            LIMIT 10
        ) as most_common_tags
    FROM public.audio_classes;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.get_audio_classes_with_stats() TO anon, authenticated;

-- Comments for documentation
COMMENT ON TABLE public.audio_classes IS 'Stores audio class information including metadata and file references';
COMMENT ON COLUMN public.audio_classes.id IS 'Unique identifier for the audio class';
COMMENT ON COLUMN public.audio_classes.title IS 'Title of the audio class (required)';
COMMENT ON COLUMN public.audio_classes.description IS 'Optional description of the audio class';
COMMENT ON COLUMN public.audio_classes.tags IS 'Array of tags for categorization and search';
COMMENT ON COLUMN public.audio_classes.audio_file_path IS 'Storage path to the audio file in Supabase Storage';
COMMENT ON COLUMN public.audio_classes.audio_file_url IS 'Public URL to access the audio file';
COMMENT ON COLUMN public.audio_classes.duration IS 'Duration of the audio in seconds';
COMMENT ON COLUMN public.audio_classes.file_size IS 'Size of the audio file in bytes';
COMMENT ON COLUMN public.audio_classes.mime_type IS 'MIME type of the audio file (e.g., audio/mpeg, audio/wav)';
COMMENT ON COLUMN public.audio_classes.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN public.audio_classes.updated_at IS 'Timestamp when the record was last updated';
COMMENT ON COLUMN public.audio_classes.created_by IS 'UUID of the user who created this audio class';