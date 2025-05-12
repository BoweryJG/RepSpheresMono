// Netlify Function to check the status of the Supabase API connection
// This function can be used as a health check endpoint for Netlify deployments

import { createClient } from '@supabase/supabase-js';

// Get environment variables with fallback
const getEnv = (key, defaultValue = '') => {
  if (process.env[key]) {
    return process.env[key];
  }
  return defaultValue;
};

// Create a Supabase client for the function
const createSupabaseClient = () => {
  const supabaseUrl = getEnv('VITE_SUPABASE_URL', 'https://cbopynuvhcymbumjnvay.supabase.co');
  const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY', '');
  
  if (!supabaseAnonKey) {
    throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable');
  }
  
  return createClient(supabaseUrl, supabaseAnonKey);
};

// Handle OPTIONS requests (CORS preflight)
const handleCors = (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };
  
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'CORS preflight' }),
    };
  }
  
  return headers;
};

// Run a basic check on the Supabase API
const checkSupabaseConnection = async (supabase) => {
  try {
    const startTime = Date.now();
    
    // Check if basic table queries work
    const { data, error } = await supabase
      .from('dental_procedures_simplified')
      .select('count', { count: 'exact', head: true });
      
    if (error) {
      throw error;
    }
    
    const elapsed = Date.now() - startTime;
    
    return {
      status: 'healthy',
      latency: `${elapsed}ms`,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

// Main function handler
export async function handler(event, context) {
  // Handle CORS
  const corsHeaders = handleCors(event);
  if (event.httpMethod === 'OPTIONS') {
    return corsHeaders;
  }

  try {
    // Create a Supabase client
    const supabase = createSupabaseClient();
    
    // Get query parameters
    const params = event.queryStringParameters || {};
    const action = params.action || 'check';
    
    // Check connection status
    if (action === 'check') {
      const result = await checkSupabaseConnection(supabase);
      
      return {
        statusCode: result.status === 'healthy' ? 200 : 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...result,
          environment: {
            netlify: process.env.NETLIFY === 'true',
            nodeEnv: process.env.NODE_ENV,
            region: process.env.AWS_REGION || 'unknown',
          }
        })
      };
    }

    // Get environment information
    if (action === 'env') {
      return {
        statusCode: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          environment: {
            netlify: process.env.NETLIFY === 'true',
            nodeEnv: process.env.NODE_ENV,
            region: process.env.AWS_REGION || 'unknown',
          },
          // Only return keys, not values for security
          envVars: {
            viteSupabaseUrlSet: !!process.env.VITE_SUPABASE_URL,
            viteSupabaseAnonKeySet: !!process.env.VITE_SUPABASE_ANON_KEY
          }
        })
      };
    }

    // Unknown action
    return {
      statusCode: 400,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Unknown action', validActions: ['check', 'env'] })
    };
    
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
}
