import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase/supabaseClient';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userDetails, setUserDetails] = useState(null);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Fetch user details when user changes
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (user) {
        try {
          // You can expand this to fetch more user profile data from your database
          const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();
            
          if (error) {
            console.warn('Error fetching user profile:', error);
            setUserDetails(null);
          } else {
            setUserDetails(data);
          }
        } catch (err) {
          console.error('Unexpected error fetching user profile:', err);
          setUserDetails(null);
        }
      } else {
        setUserDetails(null);
      }
    };

    fetchUserDetails();
  }, [user]);

  useEffect(() => {
    // Check active sessions and sets the user
    const getInitialSession = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          return;
        }
        
        const { session } = data;
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Unexpected error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for changes on auth state (login, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log('Auth state changed:', event);
        setSession(newSession);
        setUser(newSession?.user ?? null);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Format and standardize error handling
  const handleError = (error) => {
    console.error('Auth error:', error);
    
    // Map common Supabase errors to user-friendly messages
    if (error.message.includes('Email not confirmed')) {
      return 'Please check your email to confirm your account before signing in.';
    } else if (error.message.includes('Invalid login credentials')) {
      return 'Invalid email or password. Please try again.';
    } else if (error.message.includes('Email already registered')) {
      return 'This email is already registered. Please try signing in instead.';
    } else if (error.message.includes('rate limit')) {
      return 'Too many attempts. Please try again later.';
    }
    
    // Return original error if no mapping exists
    return error.message;
  };

  // Sign up with email and password
  const signUp = async (email, password) => {
    try {
      setError(null);
      setAuthLoading(true);
      
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`
        }
      });
      
      if (error) throw error;
      
      return { 
        success: true, 
        data,
        emailConfirmationRequired: true
      };
    } catch (error) {
      const formattedError = handleError(error);
      setError(formattedError);
      return { success: false, error: formattedError };
    } finally {
      setAuthLoading(false);
    }
  };

  // Sign in with email and password
  const signIn = async (email, password) => {
    try {
      setError(null);
      setAuthLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) throw error;
      
      return { success: true, data };
    } catch (error) {
      const formattedError = handleError(error);
      setError(formattedError);
      return { success: false, error: formattedError };
    } finally {
      setAuthLoading(false);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      setError(null);
      setAuthLoading(true);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (error) throw error;
      
      return { success: true, data };
    } catch (error) {
      const formattedError = handleError(error);
      setError(formattedError);
      return { success: false, error: formattedError };
    } finally {
      setAuthLoading(false);
    }
  };

  // Sign in with Facebook
  const signInWithFacebook = async () => {
    try {
      setError(null);
      setAuthLoading(true);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (error) throw error;
      
      return { success: true, data };
    } catch (error) {
      const formattedError = handleError(error);
      setError(formattedError);
      return { success: false, error: formattedError };
    } finally {
      setAuthLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setError(null);
      setAuthLoading(true);
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      const formattedError = handleError(error);
      setError(formattedError);
      return { success: false, error: formattedError };
    } finally {
      setAuthLoading(false);
    }
  };

  // Reset password (sends password reset email)
  const resetPassword = async (email) => {
    try {
      setError(null);
      setAuthLoading(true);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password-confirm`
      });
      
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      const formattedError = handleError(error);
      setError(formattedError);
      return { success: false, error: formattedError };
    } finally {
      setAuthLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      setError(null);
      setAuthLoading(true);
      
      // First update the auth profile if needed
      if (profileData.email || profileData.password) {
        const authUpdates = {};
        if (profileData.email) authUpdates.email = profileData.email;
        if (profileData.password) authUpdates.password = profileData.password;
        
        const { error: authError } = await supabase.auth.updateUser(authUpdates);
        if (authError) throw authError;
      }
      
      // Then update other profile fields in your profiles table
      const { first_name, last_name, company, role, preferences } = profileData;
      
      if (first_name || last_name || company || role || preferences) {
        const updates = { user_id: user.id };
        if (first_name !== undefined) updates.first_name = first_name;
        if (last_name !== undefined) updates.last_name = last_name;
        if (company !== undefined) updates.company = company;
        if (role !== undefined) updates.role = role;
        if (preferences !== undefined) updates.preferences = preferences;
        
        const { error: profileError } = await supabase
          .from('user_profiles')
          .upsert(updates, { onConflict: 'user_id' });
          
        if (profileError) throw profileError;
        
        // Update the local user details state
        setUserDetails(prev => ({ ...prev, ...updates }));
      }
      
      return { success: true };
    } catch (error) {
      const formattedError = handleError(error);
      setError(formattedError);
      return { success: false, error: formattedError };
    } finally {
      setAuthLoading(false);
    }
  };

  const value = {
    user,
    session,
    userDetails,
    loading,
    authLoading,
    error,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithFacebook,
    signOut,
    resetPassword,
    updateProfile,
    isAuthenticated: !!user,
    clearError: () => setError(null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
