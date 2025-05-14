import { createClient } from '@supabase/supabase-js';
import { SupabaseClient, SupabaseOptions, Database } from './types';

/**
 * Creates a typed Supabase client with the provided URL and key
 * 
 * @param supabaseUrl - The URL of the Supabase project
 * @param supabaseKey - The API key for the Supabase project
 * @param options - Optional configuration options for the Supabase client
 * @returns A typed Supabase client instance
 */
export const createSupabaseClient = (
  supabaseUrl: string,
  supabaseKey: string,
  options?: SupabaseOptions
): SupabaseClient => {
  if (!supabaseUrl) {
    throw new Error('Supabase URL is required');
  }

  if (!supabaseKey) {
    throw new Error('Supabase key is required');
  }

  const defaultOptions: SupabaseOptions = {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
  };

  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: mergedOptions.autoRefreshToken,
      persistSession: mergedOptions.persistSession,
      detectSessionInUrl: mergedOptions.detectSessionInUrl,
    },
    global: {
      headers: mergedOptions.headers || {},
    },
  });
};

/**
 * Singleton instance of the Supabase client
 * Use this only when you need a global instance outside of React components
 */
let globalSupabaseClient: SupabaseClient | null = null;

/**
 * Initializes the global Supabase client
 * 
 * @param supabaseUrl - The URL of the Supabase project
 * @param supabaseKey - The API key for the Supabase project
 * @param options - Optional configuration options for the Supabase client
 * @returns The global Supabase client instance
 */
export const initializeSupabase = (
  supabaseUrl: string,
  supabaseKey: string,
  options?: SupabaseOptions
): SupabaseClient => {
  if (!globalSupabaseClient) {
    globalSupabaseClient = createSupabaseClient(supabaseUrl, supabaseKey, options);
  }
  return globalSupabaseClient;
};

/**
 * Gets the global Supabase client instance
 * Throws an error if the client has not been initialized
 * 
 * @param environmentKey Optional environment key to get a specific client
 * @returns The global Supabase client instance
 */
export const getSupabaseClient = (environmentKey?: string): SupabaseClient => {
  if (!globalSupabaseClient) {
    throw new Error(
      'Supabase client has not been initialized. Call initializeSupabase first.'
    );
  }
  
  // In the future, we could implement environment-specific clients
  // For now, we just return the global client regardless of the environmentKey
  return globalSupabaseClient;
};

/**
 * Resets the global Supabase client instance
 * Useful for testing or when you need to reinitialize with different credentials
 */
export const resetSupabaseClient = (): void => {
  globalSupabaseClient = null;
};
