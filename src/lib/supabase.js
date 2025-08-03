import { createClient } from '@supabase/supabase-js';

// Supabase Configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are loaded
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
}

// Initialize Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Supabase Storage Configuration
const STORAGE_BUCKET = 'audio-classes';

// Helper function to get public URL for uploaded files
export function getPublicAudioUrl(filePath) {
    const { data } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);
    return data.publicUrl;
}

// Helper function to upload audio file
export async function uploadAudioFile(file, userId) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file);

    if (error) {
        console.error('Upload error:', error);
        throw error;
    }

    return {
        path: data.path,
        publicUrl: getPublicAudioUrl(data.path)
    };
}

// Helper function to delete audio file
export async function deleteAudioFile(filePath) {
    const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([filePath]);

    if (error) {
        console.error('Delete error:', error);
        throw error;
    }
}

// Database helper functions
export async function createAudioClass(classData) {
    const { data, error } = await supabase
        .from('audio_classes')
        .insert([classData])
        .select();

    if (error) {
        console.error('Database insert error:', error);
        throw error;
    }

    return data[0];
}

export async function getAudioClasses() {
    const { data, error } = await supabase
        .from('audio_classes_public')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Database fetch error:', error);
        throw error;
    }

    return data;
}

export async function updateAudioClass(id, updates) {
    const { data, error } = await supabase
        .from('audio_classes')
        .update(updates)
        .eq('id', id)
        .select();

    if (error) {
        console.error('Database update error:', error);
        throw error;
    }

    return data[0];
}

export async function deleteAudioClass(id) {
    const { error } = await supabase
        .from('audio_classes')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Database delete error:', error);
        throw error;
    }
}

// Authentication helper functions
export async function signInWithEmail(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        console.error('Auth error:', error);
        throw error;
    }

    return data;
}

export async function signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error('Sign out error:', error);
        throw error;
    }
}

export async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}