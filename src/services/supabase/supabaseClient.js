import { createClient } from '@supabase/supabase-js'

/**
 * Safe environment variable getter optimized for browser environments
 * 
 * @param {string} key - Environment variable key
 * @param {string} defaultValue - Default value if not found
 * @returns {string} - The environment variable value or default
 */
const getEnv = (key, defaultValue = '') => {
  // In browser context, we should only access Vite environment variables
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    if (import.meta.env[key]) {
      return import.meta.env[key];
    }
  }
  
  // Note: We no longer try to access process.env directly in browser context
  // as it's handled by the Vite define configuration
  
  if (!defaultValue && import.meta.env.PROD) {
    console.warn(`[Supabase] Missing configuration for ${key} in production environment`);
  }
  
  return defaultValue || '';
};

// Get Supabase configuration from environment variables
// No default values provided to ensure we don't expose keys in code
const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

// Validate configuration
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[Supabase] Missing required Supabase configuration. Check your environment variables.');
}

// Log environment info for debugging
const isProduction = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.PROD === true;
console.log(`[Supabase] Initializing in ${isProduction ? 'production' : 'development'} environment`);
if (supabaseUrl) {
  // Only show partial URL for security
  console.log(`[Supabase] Using URL: ${supabaseUrl.substring(0, 30)}...`);
}

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
