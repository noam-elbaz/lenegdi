import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        // Check if Supabase is properly configured
        if (!supabase || !supabase.auth) {
          throw new Error('Supabase not properly configured. Check environment variables.');
        }
        
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        setUser(session?.user ?? null);
      } catch (err) {
        console.error('Error getting initial session:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      setError(null);
      
      // Handle specific auth events
      if (event === 'SIGNED_OUT') {
        // Clear any cached data when user signs out
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      
      return data;
    } catch (err) {
      console.error('Sign in error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
    } catch (err) {
      console.error('Sign out error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = () => {
    if (!user) return false;
    // Check if user has admin role or specific email
    return user.user_metadata?.role === 'admin' || 
           user.email === 'admin@lnegditamid.org' ||
           user.app_metadata?.role === 'admin';
  };

  return {
    user,
    loading,
    error,
    signIn,
    signOut,
    isAdmin: isAdmin(),
    isAuthenticated: !!user
  };
}