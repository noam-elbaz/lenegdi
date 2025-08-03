-- Remove category column from audio_classes table
-- Migration to remove category field from the schema

-- Drop the category column from the main table
ALTER TABLE public.audio_classes 
DROP COLUMN IF EXISTS category;

-- Update the public view to remove category
DROP VIEW IF EXISTS public.audio_classes_public;

CREATE VIEW public.audio_classes_public AS
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

-- Enable RLS on the view
ALTER VIEW public.audio_classes_public SET (security_invoker = true);

-- Grant permissions
GRANT SELECT ON public.audio_classes_public TO anon, authenticated;