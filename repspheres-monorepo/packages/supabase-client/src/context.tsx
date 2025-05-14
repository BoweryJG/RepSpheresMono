import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { SupabaseClient, Session, User, Provider, UserResponse, AuthError } from '@supabase/supabase-js';
import { createSupabaseClient, getSupabaseClient } from './client';
import { SupabaseError, SupabaseOptions, AuthResponse } from './types';

export interface SupabaseContextType {
  supabase: SupabaseClient;
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  error: SupabaseError | null;
  isAuthenticated: boolean;
}

export interface SupabaseProviderProps {
  children: ReactNode;
  supabaseUrl?: string;
  supabaseKey?: string;
  options?: SupabaseOptions;
  onAuthStateChange?: (session: Session | null, user: User | null) => void;
  environmentKey?: string; // For environment-specific configurations
}

// Create context with default values
const SupabaseContext = createContext<SupabaseContextType>({
  supabase: {} as SupabaseClient,
  session: null,
  user: null,
  isLoading: true,
  error: null,
  isAuthenticated: false,
});

/**
 * Provider component that wraps your app and makes Supabase client
 * available to any child component that calls useSupabase().
 */
export function SupabaseProvider({ 
  children, 
  supabaseUrl,
  supabaseKey,
  options = { 
    autoRefreshToken: true, 
    persistSession: true,
    detectSessionInUrl: true
  },
  onAuthStateChange,
  environmentKey
}: SupabaseProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<SupabaseError | null>(null);
  
  // Create or get the Supabase client
  const supabase = useMemo(() => {
    // If URL and key are provided, create a new client
    if (supabaseUrl && supabaseKey) {
      return createSupabaseClient(supabaseUrl, supabaseKey, options);
    }
    
    // If environment key is provided, use it to get a specific client
    if (environmentKey) {
      return getSupabaseClient(environmentKey);
    }
    
    // Otherwise, get the default client
    return getSupabaseClient();
  }, [supabaseUrl, supabaseKey, options, environmentKey]);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        setIsLoading(true);
        
        // Check if we have a session
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        
        // Call the onAuthStateChange callback if provided
        if (onAuthStateChange) {
          onAuthStateChange(initialSession, initialSession?.user ?? null);
        }
      } catch (error) {
        const supabaseError: SupabaseError = {
          message: (error as Error).message || 'An error occurred',
          status: (error as any).status,
          code: (error as any).code
        };
        setError(supabaseError);
        console.error('Error getting initial session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: string, newSession: Session | null) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setIsLoading(false);
        
        // Call the onAuthStateChange callback if provided
        if (onAuthStateChange) {
          onAuthStateChange(newSession, newSession?.user ?? null);
        }
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, onAuthStateChange]);

  // Compute isAuthenticated based on session existence
  const isAuthenticated = !!session && !!user;

  // Value to be provided to consumers
  const value = useMemo(() => ({
    supabase,
    session,
    user,
    isLoading,
    error,
    isAuthenticated,
  }), [supabase, session, user, isLoading, error, isAuthenticated]);

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
}

/**
 * Hook that lets you access the Supabase client and auth state
 */
export function useSupabase(): SupabaseContextType {
  const context = useContext(SupabaseContext);
  
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  
  return context;
}

/**
 * Hook that provides authentication-specific functionality
 */
export function useSupabaseAuth() {
  const { supabase, user, session, isLoading, error, isAuthenticated } = useSupabase();
  
  const signUp = async (email: string, password: string, options?: { 
    emailRedirectTo?: string;
    data?: Record<string, any>;
    captchaToken?: string;
  }): Promise<AuthResponse> => {
    try {
      const response = await supabase.auth.signUp({ 
        email, 
        password, 
        options: {
          emailRedirectTo: options?.emailRedirectTo,
          data: options?.data,
          captchaToken: options?.captchaToken
        } 
      });
      
      return {
        data: {
          user: response.data?.user || null,
          session: response.data?.session || null
        },
        error: response.error ? {
          message: response.error.message,
          status: response.error.status,
          code: response.error.code
        } : null
      };
    } catch (err) {
      return {
        data: { user: null, session: null },
        error: {
          message: (err as Error).message || 'An error occurred during sign up',
          code: 'SIGN_UP_ERROR'
        }
      };
    }
  };
  
  const signInWithPassword = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await supabase.auth.signInWithPassword({ email, password });
      
      return {
        data: {
          user: response.data?.user || null,
          session: response.data?.session || null
        },
        error: response.error ? {
          message: response.error.message,
          status: response.error.status,
          code: response.error.code
        } : null
      };
    } catch (err) {
      return {
        data: { user: null, session: null },
        error: {
          message: (err as Error).message || 'An error occurred during sign in',
          code: 'SIGN_IN_ERROR'
        }
      };
    }
  };
  
  const signInWithOAuth = async (provider: Provider, options?: { 
    redirectTo?: string;
    scopes?: string;
    queryParams?: Record<string, string>;
  }): Promise<void> => {
    await supabase.auth.signInWithOAuth({ 
      provider, 
      options: {
        redirectTo: options?.redirectTo,
        scopes: options?.scopes,
        queryParams: options?.queryParams
      } 
    });
  };
  
  const signInWithMagicLink = async (email: string, options?: { 
    redirectTo?: string;
    captchaToken?: string;
  }): Promise<AuthResponse> => {
    try {
      const response = await supabase.auth.signInWithOtp({ 
        email, 
        options: {
          emailRedirectTo: options?.redirectTo,
          captchaToken: options?.captchaToken
        } 
      });
      
      return {
        data: {
          user: response.data?.user || null,
          session: response.data?.session || null
        },
        error: response.error ? {
          message: response.error.message,
          status: response.error.status,
          code: response.error.code
        } : null
      };
    } catch (err) {
      return {
        data: { user: null, session: null },
        error: {
          message: (err as Error).message || 'An error occurred sending magic link',
          code: 'MAGIC_LINK_ERROR'
        }
      };
    }
  };
  
  const signOut = async (): Promise<{ error: AuthError | null }> => {
    return await supabase.auth.signOut();
  };
  
  const resetPassword = async (email: string, options?: { 
    redirectTo?: string;
    captchaToken?: string;
  }): Promise<AuthResponse> => {
    try {
      const response = await supabase.auth.resetPasswordForEmail(email, { 
        redirectTo: options?.redirectTo,
        captchaToken: options?.captchaToken
      });
      
      return {
        data: {
          user: null,
          session: null
        },
        error: response.error ? {
          message: response.error.message,
          status: response.error.status,
          code: response.error.code
        } : null
      };
    } catch (err) {
      return {
        data: { user: null, session: null },
        error: {
          message: (err as Error).message || 'An error occurred resetting password',
          code: 'RESET_PASSWORD_ERROR'
        }
      };
    }
  };
  
  const updatePassword = async (password: string): Promise<UserResponse> => {
    return await supabase.auth.updateUser({ password });
  };
  
  const updateUser = async (attributes: { 
    email?: string; 
    password?: string; 
    data?: Record<string, any>;
    phone?: string;
  }): Promise<UserResponse> => {
    return await supabase.auth.updateUser(attributes);
  };
  
  const refreshSession = async (): Promise<AuthResponse> => {
    try {
      const response = await supabase.auth.refreshSession();
      
      return {
        data: {
          user: response.data?.user || null,
          session: response.data?.session || null
        },
        error: response.error ? {
          message: response.error.message,
          status: response.error.status,
          code: response.error.code
        } : null
      };
    } catch (err) {
      return {
        data: {
          user: null,
          session: null
        },
        error: {
          message: (err as Error).message || 'An error occurred refreshing session',
          code: 'REFRESH_SESSION_ERROR'
        }
      };
    }
  };
  
  return {
    user,
    session,
    isLoading,
    error,
    isAuthenticated,
    signUp,
    signInWithPassword,
    signInWithOAuth,
    signInWithMagicLink,
    signOut,
    resetPassword,
    updatePassword,
    updateUser,
    refreshSession,
  };
}

/**
 * Hook for managing user profiles in Supabase
 */
export function useSupabaseProfile<T = any>(profileTable: string = 'profiles') {
  const { supabase, user } = useSupabase();
  const [profile, setProfile] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<SupabaseError | null>(null);
  
  const getProfile = useCallback(async () => {
    if (!user) return null;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from(profileTable)
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      
      setProfile(data as T);
      return data as T;
    } catch (err) {
      const profileError: SupabaseError = {
        message: (err as Error).message || 'Error fetching profile',
        code: 'PROFILE_FETCH_ERROR'
      };
      setError(profileError);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [supabase, user, profileTable]);
  
  const updateProfile = async (updates: Partial<T>) => {
    if (!user) return null;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from(profileTable)
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      
      setProfile(data as T);
      return data as T;
    } catch (err) {
      const profileError: SupabaseError = {
        message: (err as Error).message || 'Error updating profile',
        code: 'PROFILE_UPDATE_ERROR'
      };
      setError(profileError);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load profile when user changes
  useEffect(() => {
    if (user) {
      getProfile();
    } else {
      setProfile(null);
    }
  }, [user, getProfile]);
  
  return {
    profile,
    isLoading,
    error,
    getProfile,
    updateProfile
  };
}

export default SupabaseContext;
