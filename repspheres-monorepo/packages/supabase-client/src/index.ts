import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the context type
interface SupabaseContextType {
  supabase: SupabaseClient;
  isLoading: boolean;
  error: Error | null;
}

// Create the context with a default value
const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

// Provider props
interface SupabaseProviderProps {
  supabaseUrl: string;
  supabaseKey: string;
  children: ReactNode;
}

/**
 * Provider component that wraps your app and makes the Supabase client available
 * to any child component that calls useSupabase().
 */
export function SupabaseProvider({ 
  supabaseUrl, 
  supabaseKey, 
  children 
}: SupabaseProviderProps) {
  const [supabase] = useState(() => createClient(supabaseUrl, supabaseKey));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Check if the Supabase connection is working
    const checkConnection = async () => {
      try {
        const { error } = await supabase.from('health_check').select('*').limit(1);
        if (error) throw error;
        setIsLoading(false);
      } catch (err) {
        console.error('Supabase connection error:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setIsLoading(false);
      }
    };

    checkConnection();
  }, [supabase]);

  const value = {
    supabase,
    isLoading,
    error,
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
}

/**
 * Hook that lets you access the Supabase client
 */
export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context.supabase;
}

/**
 * Hook that gives you the loading and error state of the Supabase connection
 */
export function useSupabaseStatus() {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabaseStatus must be used within a SupabaseProvider');
  }
  return {
    isLoading: context.isLoading,
    error: context.error,
  };
}

/**
 * Create a Supabase client directly (without React context)
 */
export function createSupabaseClient(supabaseUrl: string, supabaseKey: string) {
  return createClient(supabaseUrl, supabaseKey);
}

// Re-export types from supabase-js
export type { SupabaseClient };
