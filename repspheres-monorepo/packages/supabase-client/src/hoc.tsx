import React, { ComponentType } from 'react';
import { SupabaseClient, User, Session } from '@supabase/supabase-js';
import { useSupabase, useSupabaseAuth } from './context';
import { SupabaseError } from './types';

// Props for components wrapped with withSupabase
export interface WithSupabaseProps {
  supabase: SupabaseClient;
  isLoading: boolean;
  error: SupabaseError | null;
  isAuthenticated: boolean;
}

// Props for components wrapped with withSupabaseAuth
export interface WithSupabaseAuthProps {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: SupabaseError | null;
  isAuthenticated: boolean;
  signUp: (email: string, password: string, options?: { 
    emailRedirectTo?: string;
    data?: Record<string, any>;
    captchaToken?: string;
  }) => Promise<any>;
  signInWithPassword: (email: string, password: string) => Promise<any>;
  signInWithOAuth: (provider: 'google' | 'github' | 'facebook' | 'twitter', options?: { 
    redirectTo?: string;
    scopes?: string;
    queryParams?: Record<string, string>;
  }) => Promise<void>;
  signInWithMagicLink: (email: string, options?: { 
    redirectTo?: string;
    captchaToken?: string;
  }) => Promise<any>;
  signOut: () => Promise<{ error: any | null }>;
  resetPassword: (email: string, options?: { 
    redirectTo?: string;
    captchaToken?: string;
  }) => Promise<any>;
  updatePassword: (password: string) => Promise<any>;
  updateUser: (attributes: { 
    email?: string; 
    password?: string; 
    data?: Record<string, any>;
    phone?: string;
  }) => Promise<any>;
  refreshSession: () => Promise<any>;
}

/**
 * Higher-Order Component that injects Supabase client into a component
 * @param WrappedComponent Component to wrap
 * @returns Wrapped component with Supabase client injected
 */
export function withSupabase<P extends WithSupabaseProps>(
  WrappedComponent: ComponentType<P>
): ComponentType<Omit<P, keyof WithSupabaseProps>> {
  const WithSupabaseComponent = (props: Omit<P, keyof WithSupabaseProps>) => {
    const { supabase, isLoading, error, isAuthenticated } = useSupabase();
    
    return (
      <WrappedComponent
        {...(props as P)}
        supabase={supabase}
        isLoading={isLoading}
        error={error}
        isAuthenticated={isAuthenticated}
      />
    );
  };
  
  WithSupabaseComponent.displayName = `WithSupabase(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  
  return WithSupabaseComponent;
}

/**
 * Higher-Order Component that injects Supabase auth into a component
 * @param WrappedComponent Component to wrap
 * @returns Wrapped component with Supabase auth injected
 */
export function withSupabaseAuth<P extends WithSupabaseAuthProps>(
  WrappedComponent: ComponentType<P>
): ComponentType<Omit<P, keyof WithSupabaseAuthProps>> {
  const WithSupabaseAuthComponent = (props: Omit<P, keyof WithSupabaseAuthProps>) => {
    const {
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
      refreshSession
    } = useSupabaseAuth();
    
    return (
      <WrappedComponent
        {...(props as P)}
        user={user}
        session={session}
        isLoading={isLoading}
        error={error}
        isAuthenticated={isAuthenticated}
        signUp={signUp}
        signInWithPassword={signInWithPassword}
        signInWithOAuth={signInWithOAuth}
        signInWithMagicLink={signInWithMagicLink}
        signOut={signOut}
        resetPassword={resetPassword}
        updatePassword={updatePassword}
        updateUser={updateUser}
        refreshSession={refreshSession}
      />
    );
  };
  
  WithSupabaseAuthComponent.displayName = `WithSupabaseAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  
  return WithSupabaseAuthComponent;
}
