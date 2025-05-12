import { createClient } from '@supabase/supabase-js'

/**
 * Enhanced environment variable getter with fallback support for different environments
 * Specifically optimized for Netlify deployment
 * 
 * @param {string} key - Environment variable key
 * @param {string} defaultValue - Default value if not found
 * @returns {string} - The environment variable value or default
 */
const getEnv = (key, defaultValue) => {
  // Check for import.meta.env first (Vite environment variables)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    if (import.meta.env[key]) {
      return import.meta.env[key];
    }
  }
  
  // Check for process.env (Node.js environment, including Netlify functions)
  if (typeof process !== 'undefined' && process.env) {
    if (process.env[key]) {
      return process.env[key];
    }
  }
  
  // If we're in production, log that we're using default values
  if (import.meta.env.PROD) {
    console.warn(`[Supabase] Using default value for ${key} in production environment`);
  }
  
  return defaultValue;
};

// Supabase configuration constants
const DEFAULT_SUPABASE_URL = 'https://cbopynuvhcymbumjnvay.supabase.co';
const DEFAULT_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNib3B5bnV2aGN5bWJ1bWpudmF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5OTUxNzMsImV4cCI6MjA1OTU3MTE3M30.UZElMkoHugIt984RtYWyfrRuv2rB67opQdCrFVPCfzU';

// Get Supabase configuration with enhanced environment variable handling
const supabaseUrl = getEnv('VITE_SUPABASE_URL', DEFAULT_SUPABASE_URL);
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY', DEFAULT_ANON_KEY);

// Validate configuration
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[Supabase] Missing required Supabase configuration. Check your environment variables.');
}

// Log environment info for debugging
const isProduction = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.PROD === true;
console.log(`[Supabase] Initializing in ${isProduction ? 'production' : 'development'} environment`);
console.log(`[Supabase] Using URL: ${supabaseUrl.substring(0, 30)}...`);

// Create Supabase client with explicit options and enhanced error handling
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'x-application-name': 'market-insights-dashboard',
      'x-deployment-env': isProduction ? 'netlify-prod' : 'development'
    }
  },
  db: {
    schema: 'public'
  },
  // Enhanced error handling for Netlify deployment
  realtime: {
    params: {
      eventsPerSecond: 1 // Limit realtime events to prevent Netlify function timeout
    }
  }
});

// Check connection and log initialization status
supabase.auth.onAuthStateChange((event, session) => {
  console.log(`[Supabase] Auth state changed: ${event}`);
});

// Perform a simple test query to check connectivity
const testConnection = async () => {
  try {
    const { error } = await supabase.from('dental_procedures_simplified').select('count', { count: 'exact', head: true });
    if (error) {
      console.error('[Supabase] Connection test error:', error.message);
      return false;
    }
    console.log('[Supabase] Connection test successful');
    return true;
  } catch (err) {
    console.error('[Supabase] Connection test exception:', err.message);
    return false;
  }
};

// Run test connection in background
if (typeof window !== 'undefined') {
  setTimeout(() => testConnection(), 1000);
}

// Export for backward compatibility
export const supabaseClient = supabase;

// Log connection status
console.log('[Supabase] Client initialized');
