-- Add thumbnail_url column to audio_classes table
-- Migration to support thumbnail images for audio class cards

-- Add the thumbnail_url column
ALTER TABLE public.audio_classes 
ADD COLUMN thumbnail_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.audio_classes.thumbnail_url IS 'Optional URL to thumbnail image for the audio class (recommended: square format)';

-- Update the public view to include thumbnail_url
CREATE OR REPLACE VIEW public.audio_classes_public AS
SELECT 
    id,
    title,
    description,
    tags,
    audio_file_url,
    thumbnail_url,
    duration,
    mime_type,
    created_at,
    updated_at
FROM public.audio_classes;

-- The existing RLS policies will automatically apply to the new column
-- since they operate on the entire table

-- Optionally add an index for performance if we plan to filter by thumbnail existence
CREATE INDEX idx_audio_classes_has_thumbnail ON public.audio_classes(thumbnail_url) 
WHERE thumbnail_url IS NOT NULL;