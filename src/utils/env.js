/**
 * Environment variable utilities
 * Safe for both browser and Node.js environments
 */

/**
 * Get environment variable value
 * @param {string} key - Environment variable name
 * @param {string} defaultValue - Default value if not found
 * @returns {string} Environment variable value or default
 */
export const getEnv = (key, defaultValue = '') => {
  // Check Vite environment variables first (works in both dev and prod)
  if (import.meta.env && import.meta.env[key] !== undefined) {
    return import.meta.env[key];
  }

  // Check Node.js environment variables (for server-side usage)
  if (typeof process !== 'undefined' && process.env) {
    // Check for direct match
    if (process.env[key] !== undefined) {
      return process.env[key];
    }
    
    // For Node.js scripts, also check without VITE_ prefix as fallback
    if (key.startsWith('VITE_') && process.env[key.substring(5)] !== undefined) {
      return process.env[key.substring(5)];
    }
  }

  // Check window._env_ for runtime environment variables (useful for Docker)
  if (typeof window !== 'undefined' && window._env_ && window._env_[key] !== undefined) {
    return window._env_[key];
  }

  return defaultValue;
};

/**
 * Load environment variables (Node.js only)
 * This should only be called in Node.js environments
 */
export const loadEnv = () => {
  if (typeof window === 'undefined') {
    try {
      // Use dynamic import to avoid bundling dotenv in the browser
      import('dotenv').then(dotenv => {
        dotenv.config();
      }).catch(() => {
        // dotenv not available, continue without it
      });
    } catch (error) {
      // Ignore errors in browser
    }
  }
};

// Export a default object with common environment variables
export const env = {
  // Supabase
  supabaseUrl: getEnv('VITE_SUPABASE_URL'),
  supabaseAnonKey: getEnv('VITE_SUPABASE_ANON_KEY'),
  
  // API Keys
  braveSearchApiKey: getEnv('VITE_BRAVE_SEARCH_API_KEY'),
  
  // Environment
  nodeEnv: getEnv('NODE_ENV', 'development'),
  isProduction: getEnv('NODE_ENV') === 'production',
  isDevelopment: getEnv('NODE_ENV') !== 'production'
};

export default env;
