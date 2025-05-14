import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database, SupabaseClientOptions } from './types';

// Context type definition
interface SupabaseContextType {
  supabase: SupabaseClient<Database>;
  isLoading: boolean;
  error: Error | null;
}

// Create context with a default value
const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

// Provider props type
interface SupabaseProviderProps {
  supabaseUrl: string;
  supabaseKey: string;
  children: ReactNode;
  options?: {
    autoRefreshToken?: boolean;
    persistSession?: boolean;
    detectSessionInUrl?: boolean;
  };
}

/**
 * Supabase Provider component
 * Provides Supabase client to all child components
 */
export const SupabaseProvider: React.FC<SupabaseProviderProps> = ({
  supabaseUrl,
  supabaseKey,
  children,
  options = {}
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [supabase, setSupabase] = useState<SupabaseClient<Database> | null>(null);

  useEffect(() => {
    try {
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase URL and key are required');
      }

      const client = createSupabaseClient(supabaseUrl, supabaseKey, {
        auth: {
          autoRefreshToken: options.autoRefreshToken ?? true,
          persistSession: options.persistSession ?? true,
          detectSessionInUrl: options.detectSessionInUrl ?? true
        }
      });
      setSupabase(client);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to initialize Supabase client'));
      setIsLoading(false);
    }
  }, [supabaseUrl, supabaseKey]);

  if (isLoading) {
    return null; // Or a loading component
  }

  if (error || !supabase) {
    console.error('Supabase client initialization error:', error);
    return null; // Or an error component
  }

  return (
    <SupabaseContext.Provider value={{ supabase, isLoading, error }}>
      {children}
    </SupabaseContext.Provider>
  );
};

/**
 * Hook to use Supabase client
 * Must be used within a SupabaseProvider
 */
export const useSupabase = (): SupabaseContextType => {
  const context = useContext(SupabaseContext);
  
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  
  return context;
};

/**
 * Create a Supabase client
 * Can be used outside of React components
 */
export const createSupabaseClient = (
  supabaseUrl: string,
  supabaseKey: string,
  options: SupabaseClientOptions = {}
): SupabaseClient<Database> => {
  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: options.auth?.autoRefreshToken ?? true,
      persistSession: options.auth?.persistSession ?? true,
      detectSessionInUrl: options.auth?.detectSessionInUrl ?? true
    },
    global: options.global
  });
};

/**
 * Higher-order component to inject Supabase client
 * @param Component Component to wrap
 */
export function withSupabase<P extends { supabase: SupabaseClient<Database> }>(
  Component: React.ComponentType<P>
) {
  return (props: Omit<P, 'supabase'>) => {
    const { supabase } = useSupabase();
    return <Component {...(props as any)} supabase={supabase} />;
  };
}

// Export types
export type { SupabaseClient, Database };
