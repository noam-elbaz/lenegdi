-- Simplified RLS fix - start fresh with basic policies
-- This will completely reset and simplify the RLS policies

-- 1. Disable RLS temporarily to clean up
ALTER TABLE public.audio_classes DISABLE ROW LEVEL SECURITY;

-- 2. Drop all existing policies
DROP POLICY IF EXISTS "Public read access for audio_classes" ON public.audio_classes;
DROP POLICY IF EXISTS "Authenticated users can insert audio_classes" ON public.audio_classes;
DROP POLICY IF EXISTS "Users can update their own audio_classes" ON public.audio_classes;
DROP POLICY IF EXISTS "Users can delete their own audio_classes" ON public.audio_classes;
DROP POLICY IF EXISTS "Allow authenticated users to insert audio_classes" ON public.audio_classes;
DROP POLICY IF EXISTS "Allow authenticated users to read audio_classes" ON public.audio_classes;
DROP POLICY IF EXISTS "Allow anonymous users to read audio_classes" ON public.audio_classes;
DROP POLICY IF EXISTS "Allow users to update their own audio_classes" ON public.audio_classes;
DROP POLICY IF EXISTS "Allow users to delete their own audio_classes" ON public.audio_classes;

-- 3. Re-enable RLS
ALTER TABLE public.audio_classes ENABLE ROW LEVEL SECURITY;

-- 4. Create very simple policies

-- Allow everyone to read (SELECT)
CREATE POLICY "read_policy" ON public.audio_classes
    FOR SELECT 
    USING (true);

-- Allow authenticated users to insert ONLY if they set created_by to their own ID
CREATE POLICY "insert_policy" ON public.audio_classes
    FOR INSERT 
    WITH CHECK (auth.uid() = created_by);

-- Allow users to update only their own records
CREATE POLICY "update_policy" ON public.audio_classes
    FOR UPDATE 
    USING (auth.uid() = created_by)
    WITH CHECK (auth.uid() = created_by);

-- Allow users to delete only their own records
CREATE POLICY "delete_policy" ON public.audio_classes
    FOR DELETE 
    USING (auth.uid() = created_by);

-- 5. Ensure proper grants
GRANT ALL ON public.audio_classes TO authenticated;
GRANT SELECT ON public.audio_classes TO anon;
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- 6. Also grant access to the public view
GRANT SELECT ON public.audio_classes_public TO anon, authenticated;