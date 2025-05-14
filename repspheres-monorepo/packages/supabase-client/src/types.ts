import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase configuration
 */
export interface SupabaseConfig {
  /**
   * Supabase URL
   */
  url: string;
  
  /**
   * Supabase API key
   */
  key: string;
  
  /**
   * Custom headers
   */
  headers?: Record<string, string>;
}

/**
 * Supabase client options
 */
export interface SupabaseClientOptions {
  /**
   * Whether to persist the session
   */
  persistSession?: boolean;
  
  /**
   * Whether to automatically refresh the token
   */
  autoRefreshToken?: boolean;
  
  /**
   * Whether to detect the session in the URL
   */
  detectSessionInUrl?: boolean;
  
  /**
   * Database schema
   */
  schema?: string;
  
  /**
   * Whether to enable realtime subscriptions
   */
  realtimeEnabled?: boolean;
}

/**
 * Supabase query options
 */
export interface SupabaseQueryOptions {
  /**
   * Success callback
   */
  onSuccess?: (data: any) => void;
  
  /**
   * Error callback
   */
  onError?: (error: any) => void;
  
  /**
   * Whether to throw on error
   */
  throwOnError?: boolean;
}

/**
 * Table definitions for type safety
 */
export interface Tables {
  // Define your tables here for type safety
  users: {
    id: string;
    email: string;
    created_at: string;
    updated_at: string;
    [key: string]: any;
  };
  
  profiles: {
    id: string;
    user_id: string;
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
    created_at: string;
    updated_at: string;
    [key: string]: any;
  };
  
  // Add more tables as needed
}

/**
 * Typed Supabase client
 */
export type TypedSupabaseClient = SupabaseClient<Tables>;

/**
 * Supabase context
 */
export interface SupabaseContext {
  /**
   * Supabase client
   */
  client: TypedSupabaseClient;
  
  /**
   * Whether the client is loading
   */
  isLoading: boolean;
  
  /**
   * Error if any
   */
  error: Error | null;
}
