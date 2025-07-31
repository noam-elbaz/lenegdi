// Debug functions to help troubleshoot RLS and authentication issues

// Function to debug current authentication state
async function debugAuthState() {
    try {
        // Get current user from client
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        // Get session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        // Call the debug function in the database
        const { data: dbDebug, error: dbError } = await supabase
            .rpc('debug_auth_context');
        
        console.log('=== Authentication Debug Info ===');
        console.log('Client User:', user);
        console.log('Client Session:', session);
        console.log('Database Auth Context:', dbDebug);
        
        if (userError) console.error('User Error:', userError);
        if (sessionError) console.error('Session Error:', sessionError);
        if (dbError) console.error('DB Debug Error:', dbError);
        
        return {
            clientUser: user,
            clientSession: session,
            dbContext: dbDebug?.[0],
            errors: { userError, sessionError, dbError }
        };
    } catch (error) {
        console.error('Debug Auth State Error:', error);
        return { error };
    }
}

// Function to test RLS policies before inserting
async function testRLSBeforeInsert(testData) {
    console.log('=== Testing RLS Policies ===');
    
    // First check auth state
    const authDebug = await debugAuthState();
    
    if (!authDebug.clientUser) {
        console.error('User is not authenticated');
        return { error: 'User not authenticated' };
    }
    
    // Test data should include created_by field
    const dataToTest = {
        ...testData,
        created_by: authDebug.clientUser.id
    };
    
    console.log('Test Data:', dataToTest);
    console.log('User ID from client:', authDebug.clientUser.id);
    console.log('User ID from database:', authDebug.dbContext?.current_user_id);
    
    // Try a test insert (this will either succeed or show the exact error)
    try {
        const { data, error } = await supabase
            .from('audio_classes')
            .insert([{
                title: 'TEST - Delete Me',
                description: 'This is a test record to verify RLS policies',
                tags: ['test'],
                created_by: authDebug.clientUser.id
            }])
            .select();
        
        if (error) {
            console.error('RLS Test Failed:', error);
            return { error, authDebug };
        }
        
        console.log('RLS Test Succeeded:', data);
        
        // Clean up test record
        if (data && data[0]) {
            await supabase
                .from('audio_classes')
                .delete()
                .eq('id', data[0].id);
            console.log('Test record cleaned up');
        }
        
        return { success: true, data, authDebug };
    } catch (error) {
        console.error('RLS Test Exception:', error);
        return { error, authDebug };
    }
}

// Enhanced createAudioClass function with better error handling
async function createAudioClassWithDebug(classData) {
    console.log('=== Creating Audio Class with Debug ===');
    
    // First, debug auth state
    const authDebug = await debugAuthState();
    
    if (!authDebug.clientUser) {
        throw new Error('User is not authenticated');
    }
    
    // Ensure created_by is set correctly
    const dataWithCreatedBy = {
        ...classData,
        created_by: authDebug.clientUser.id
    };
    
    console.log('Data to insert:', dataWithCreatedBy);
    console.log('Auth context:', authDebug.dbContext);
    
    const { data, error } = await supabase
        .from('audio_classes')
        .insert([dataWithCreatedBy])
        .select();

    if (error) {
        console.error('Insert error details:', {
            error,
            userData: authDebug.clientUser,
            dbContext: authDebug.dbContext,
            insertData: dataWithCreatedBy
        });
        throw error;
    }

    console.log('Successfully created audio class:', data[0]);
    return data[0];
}

// Function to check if RLS policies are working correctly
async function checkRLSPolicies() {
    try {
        console.log('=== Checking RLS Policies ===');
        
        // Get current policies
        const { data: policies, error } = await supabase
            .from('pg_policies')
            .select('*')
            .eq('tablename', 'audio_classes');
        
        if (error) {
            console.error('Error fetching policies:', error);
            return;
        }
        
        console.log('Current RLS Policies:', policies);
        
        // Check table permissions
        const { data: permissions, error: permError } = await supabase
            .rpc('check_table_permissions', { table_name: 'audio_classes' });
        
        if (permError) {
            console.log('Could not check permissions (function may not exist):', permError.message);
        } else {
            console.log('Table Permissions:', permissions);
        }
        
    } catch (error) {
        console.error('Error checking RLS policies:', error);
    }
}

// Add these functions to window for easy access in browser console
if (typeof window !== 'undefined') {
    window.debugAuthState = debugAuthState;
    window.testRLSBeforeInsert = testRLSBeforeInsert;
    window.createAudioClassWithDebug = createAudioClassWithDebug;
    window.checkRLSPolicies = checkRLSPolicies;
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        debugAuthState,
        testRLSBeforeInsert,
        createAudioClassWithDebug,
        checkRLSPolicies
    };
}