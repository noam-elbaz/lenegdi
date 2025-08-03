-- Debug script to check RLS policies and authentication
-- Run this in Supabase SQL Editor to diagnose the issue

-- 1. Check if the table exists and RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'audio_classes';

-- 2. List all current RLS policies on audio_classes table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'audio_classes';

-- 3. Check table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'audio_classes' 
ORDER BY ordinal_position;

-- 4. Check current grants on the table
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'audio_classes';

-- 5. Test authentication context (run this when logged in)
SELECT 
    auth.uid() as current_user_id,
    auth.role() as current_role,
    current_user as postgres_user;

-- 6. Check if there are any existing records (to see if SELECT works)
SELECT COUNT(*) as total_records FROM audio_classes;