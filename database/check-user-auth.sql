-- Check user authentication and access for nelbaz@gmail.com
-- Run this in Supabase SQL Editor

-- 1. Check if the user exists in auth.users
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    updated_at,
    role
FROM auth.users 
WHERE email = 'nelbaz@gmail.com';

-- 2. Check current authentication context (run this while logged in as nelbaz@gmail.com)
SELECT 
    auth.uid() as current_user_id,
    auth.role() as current_role,
    auth.email() as current_email;

-- 3. Test if the user can select from audio_classes (basic read access)
SELECT COUNT(*) as can_read_count FROM public.audio_classes;

-- 4. Test what happens when we try to insert a test record
-- Note: This will show the error without actually inserting
EXPLAIN (ANALYZE, BUFFERS) 
INSERT INTO public.audio_classes (
    title, 
    description, 
    tags, 
    created_by
) VALUES (
    'Test Title',
    'Test Description', 
    ARRAY['test'],
    auth.uid()
);

-- 5. Check the user's ID for reference
SELECT id FROM auth.users WHERE email = 'nelbaz@gmail.com';