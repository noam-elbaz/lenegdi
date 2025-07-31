// Supabase Configuration
// Replace these with your actual Supabase project URL and public API key

const SUPABASE_URL = 'https://orkpwvjghccvcopzahez.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_bE14Ztx34YF1m_m8YVvxbQ_6X_xaVUr'; // Get this from Supabase Dashboard → Settings → API

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Supabase Storage Configuration
const STORAGE_BUCKET = 'audio-classes';

// Helper function to get public URL for uploaded files
function getPublicAudioUrl(filePath) {
    const { data } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);
    return data.publicUrl;
}

// Helper function to upload audio file
async function uploadAudioFile(file, userId) {
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
async function deleteAudioFile(filePath) {
    const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([filePath]);

    if (error) {
        console.error('Delete error:', error);
        throw error;
    }
}

// Database helper functions
async function createAudioClass(classData) {
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

async function getAudioClasses() {
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

async function updateAudioClass(id, updates) {
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

async function deleteAudioClass(id) {
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
async function signInWithEmail(email, password) {
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

async function signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error('Sign out error:', error);
        throw error;
    }
}

async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
        console.log('User signed in:', session.user);
        // Update UI to show admin capabilities
        updateUIForAuthenticatedUser(session.user);
    } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        // Update UI to hide admin capabilities
        updateUIForAnonymousUser();
    }
});

// UI update functions (to be implemented in main script)
function updateUIForAuthenticatedUser(user) {
    // Show admin panel button
    const adminBtn = document.getElementById('adminBtn');
    if (adminBtn) {
        adminBtn.style.display = 'block';
        adminBtn.textContent = 'Admin Panel';
    }
}

function updateUIForAnonymousUser() {
    // Hide admin panel button or show login
    const adminBtn = document.getElementById('adminBtn');
    if (adminBtn) {
        adminBtn.textContent = 'Login';
    }
}