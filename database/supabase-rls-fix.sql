-- Fix RLS policies for audio_classes table
-- This script addresses the "new row violates row-level security policy" error

-- First, drop the existing INSERT policy
DROP POLICY IF EXISTS "Authenticated users can insert audio_classes" ON public.audio_classes;

-- Create a more robust INSERT policy
-- Option 1: Simple authenticated user policy (recommended)
CREATE POLICY "Allow authenticated users to insert audio_classes" ON public.audio_classes
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = created_by);

-- Alternative Option 2: If the above doesn't work, try this more permissive policy
-- Uncomment the lines below and comment out the policy above if needed
/*
CREATE POLICY "Allow authenticated users to insert audio_classes_v2" ON public.audio_classes
    FOR INSERT TO authenticated
    WITH CHECK (true);
*/

-- Also ensure the SELECT policy is correct for authenticated users
DROP POLICY IF EXISTS "Public read access for audio_classes" ON public.audio_classes;

-- Create separate policies for authenticated and anonymous users
CREATE POLICY "Allow authenticated users to read audio_classes" ON public.audio_classes
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Allow anonymous users to read audio_classes" ON public.audio_classes
    FOR SELECT TO anon
    USING (true);

-- Verify that the UPDATE and DELETE policies are also properly scoped
DROP POLICY IF EXISTS "Users can update their own audio_classes" ON public.audio_classes;
DROP POLICY IF EXISTS "Users can delete their own audio_classes" ON public.audio_classes;

CREATE POLICY "Allow users to update their own audio_classes" ON public.audio_classes
    FOR UPDATE TO authenticated
    USING (auth.uid() = created_by)
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Allow users to delete their own audio_classes" ON public.audio_classes
    FOR DELETE TO authenticated
    USING (auth.uid() = created_by);

-- Ensure proper grants are in place
GRANT ALL ON public.audio_classes TO authenticated;
GRANT SELECT ON public.audio_classes TO anon;

-- Optional: Create a function to debug auth issues
CREATE OR REPLACE FUNCTION public.debug_auth_context()
RETURNS TABLE (
    current_user_id UUID,
    user_role TEXT,
    is_authenticated BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        auth.uid() as current_user_id,
        current_setting('role', true) as user_role,
        (auth.uid() IS NOT NULL) as is_authenticated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on debug function
GRANT EXECUTE ON FUNCTION public.debug_auth_context() TO authenticated, anon;

-- Add a helpful comment
COMMENT ON FUNCTION public.debug_auth_context() IS 'Debug function to check authentication context. Call this to troubleshoot RLS issues.';