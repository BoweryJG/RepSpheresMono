import { createClient } from '@supabase/supabase-js';

// Import dotenv for Node.js environments
// This won't affect browser environments
// Completely avoid dynamic imports and top-level await which cause issues in Netlify builds
let dotenvLoaded = false;

// In browser environments, we don't need dotenv
// In Node.js environments, dotenv should be loaded by the script that imports this module
// This avoids any top-level await or dynamic import issues in Netlify builds
console.log('[Supabase] Environment variables will be loaded from process.env or import.meta.env');

/**
 * Safe environment variable getter optimized for both browser and Node.js environments
 * 
 * @param {string} key - Environment variable key
 * @param {string} defaultValue - Default value if not found
 * @returns {string} - The environment variable value or default
 */
const getEnv = (key, defaultValue = '') => {
  // Check Node.js environment first (for Node scripts)
  if (typeof process !== 'undefined' && process.env) {
    // Check for direct environment variables (e.g. VITE_SUPABASE_URL)
    if (process.env[key]) {
      return process.env[key];
    }
    
    // For Node.js scripts, also check without VITE_ prefix as fallback
    if (key.startsWith('VITE_') && process.env[key.substring(5)]) {
      return process.env[key.substring(5)];
    }
  }
  
  // Check browser context (Vite)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    if (import.meta.env[key]) {
      return import.meta.env[key];
    }
  }
  
  // Safe warning that works in both environments
  if (!defaultValue) {
    const isProduction = 
      (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.PROD === true) ||
      (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'production');
    
    if (isProduction) {
      console.warn(`[Supabase] Missing configuration for ${key} in production environment`);
    }
  }
  
  return defaultValue || '';
};

// Get Supabase configuration from environment variables
// No default values provided to ensure we don't expose keys in code
const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

// For Node.js scripts, log more detailed environment information
if (typeof process !== 'undefined' && process.env) {
  console.log('[Supabase] Environment check:');
  console.log(`  - VITE_SUPABASE_URL: ${supabaseUrl ? '✅ Found' : '❌ Missing'}`);
  console.log(`  - VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✅ Found' : '❌ Missing'}`);
}

// Validate configuration
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[Supabase] Missing required Supabase configuration. Check your environment variables.');
}

// Log environment info for debugging
const isProduction = 
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.PROD === true) ||
  (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'production');
console.log(`[Supabase] Initializing in ${isProduction ? 'production' : 'development'} environment`);

// Only show partial URL for security with extra safeguards
try {
  if (supabaseUrl) {
    // Extreme safeguards for string operations
    const urlToDisplay = String(supabaseUrl || '');
    const displayLength = Math.min(30, urlToDisplay.length);
    console.log(`[Supabase] Using URL: ${urlToDisplay.slice(0, displayLength)}...`);
  }
} catch (e) {
  console.log('[Supabase] Error displaying URL');
}

// Create a safe wrapper around the Supabase client
const createSafeSupabaseClient = () => {
  try {
    // Ensure we have valid string values for createClient with extreme safeguards
    const safeSupabaseUrl = String(supabaseUrl || '');
    const safeSupabaseAnonKey = String(supabaseAnonKey || '');
    
    // Verify we have actual values before creating client
    if (!safeSupabaseUrl || safeSupabaseUrl === 'undefined' || !safeSupabaseAnonKey || safeSupabaseAnonKey === 'undefined') {
      throw new Error(`Invalid Supabase configuration: URL=${safeSupabaseUrl ? 'present' : 'missing'}, Key=${safeSupabaseAnonKey ? 'present' : 'missing'}`);
    }
    
    // Create the actual Supabase client
    const client = createClient(safeSupabaseUrl, safeSupabaseAnonKey, {
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
    
    // Create a proxy to intercept all method calls and add error handling
    return new Proxy(client, {
      get: function(target, prop) {
        // Get the original property
        const originalValue = target[prop];
        
        // If it's not a function, just return it
        if (typeof originalValue !== 'function') {
          return originalValue;
        }
        
        // If it's a function, wrap it with error handling
        return function(...args) {
          try {
            const result = originalValue.apply(target, args);
            
            // If the result is a promise, add error handling
            if (result && typeof result.then === 'function') {
              try {
                return result.then(data => {
                  return data;
                }).catch(err => {
                  console.error(`[Supabase] Error in ${String(prop)} method:`, err);
                  throw err;
                });
              } catch (err) {
                console.error(`[Supabase] Error handling promise in ${String(prop)} method:`, err);
                throw err;
              }
            }
            
            return result;
          } catch (err) {
            console.error(`[Supabase] Error in ${String(prop)} method:`, err);
            throw err;
          }
        };
      }
    });
  } catch (err) {
    console.error('[Supabase] Failed to create client:', err);
    // Return a dummy client that won't throw errors
    return {
      from: () => ({ select: () => ({ data: null, error: { message: 'Client initialization failed' } }) }),
      auth: { 
        onAuthStateChange: (callback) => {
          console.log('[Supabase] Auth state change listener registered on dummy client');
          return { data: { subscription: { unsubscribe: () => {} } } };
        }
      }
    };
  }
};

// Create the safe Supabase client
export const supabase = createSafeSupabaseClient();

// Check connection and log initialization status
try {
  supabase.auth.onAuthStateChange((event, session) => {
    console.log(`[Supabase] Auth state changed: ${event}`);
  });
} catch (e) {
  console.error('[Supabase] Error setting up auth state change listener:', e);
}

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

// Run test connection in background with extra error handling
if (typeof window !== 'undefined') {
  setTimeout(() => {
    try {
      testConnection();
    } catch (e) {
      console.error('[Supabase] Error running connection test:', e);
    }
  }, 1000);
}

// Export for backward compatibility
export const supabaseClient = supabase;

// Log connection status
console.log('[Supabase] Client initialized');
