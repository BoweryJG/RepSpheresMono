import { createClient } from '@supabase/supabase-js'

/**
 * Get environment variable with fallback support for different environments
 * @param {string} key - Environment variable key
 * @param {string} defaultValue - Default value if not found
 * @returns {string} - The environment variable value or default
 */
const getEnv = (key, defaultValue) => {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  return defaultValue;
};

// Get Supabase configuration from environment variables
const supabaseUrl = getEnv('VITE_SUPABASE_URL', 'https://cbopynuvhcymbumjnvay.supabase.co');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNib3B5bnV2aGN5bWJ1bWpudmF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5OTUxNzMsImV4cCI6MjA1OTU3MTE3M30.UZElMkoHugIt984RtYWyfrRuv2rB67opQdCrFVPCfzU');

// Create Supabase client with explicit options following best practices
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'x-application-name': 'market-insights-dashboard'
    }
  },
  db: {
    schema: 'public'
  }
});

// Export for backward compatibility
export const supabaseClient = supabase;

// Log connection status
console.log('Supabase client initialized with URL:', supabaseUrl);
