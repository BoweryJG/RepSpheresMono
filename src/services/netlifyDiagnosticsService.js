import { supabase } from './supabase/supabaseClient';

/**
 * Netlify Diagnostics Service
 * 
 * This service provides utilities for diagnosing and troubleshooting
 * issues with the Netlify deployment, particularly around Supabase connectivity.
 */
class NetlifyDiagnosticsService {
  constructor() {
    this.isNetlify = typeof __IS_NETLIFY__ !== 'undefined' && __IS_NETLIFY__ === true;
    this.apiEndpoint = '/.netlify/functions/api-status';
    this.diagnosticsResults = null;
  }

  /**
   * Check if the application is running on Netlify
   * @returns {boolean} True if running on Netlify
   */
  isRunningOnNetlify() {
    return this.isNetlify;
  }

  /**
   * Run a comprehensive health check of the application
   * @returns {Promise<Object>} Health check results
   */
  async runHealthCheck() {
    try {
      const results = {
        timestamp: new Date().toISOString(),
        environment: {
          mode: import.meta.env.MODE,
          isNetlify: this.isNetlify,
          browserInfo: navigator.userAgent
        },
        checks: {
          frontend: { status: 'healthy' },
          supabase: await this.checkSupabaseDirectConnection(),
          netlifyFunction: await this.checkNetlifyFunction()
        }
      };

      // Store for later reference
      this.diagnosticsResults = results;
      console.log('[Diagnostics] Health check results:', results);
      
      return results;
    } catch (error) {
      console.error('[Diagnostics] Health check failed:', error);
      return {
        timestamp: new Date().toISOString(),
        error: error.message,
        status: 'error'
      };
    }
  }

  /**
   * Check Supabase connection directly from the browser
   * @returns {Promise<Object>} Connection check results
   */
  async checkSupabaseDirectConnection() {
    try {
      const startTime = Date.now();
      
      // Test a simple query
      const { data, error } = await supabase
        .from('dental_procedures_simplified')
        .select('count', { count: 'exact', head: true });
      
      const elapsed = Date.now() - startTime;
      
      if (error) {
        return {
          status: 'unhealthy',
          error: error.message,
          errorCode: error.code,
          latency: `${elapsed}ms`
        };
      }
      
      return {
        status: 'healthy',
        latency: `${elapsed}ms`,
        count: data?.count
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message
      };
    }
  }

  /**
   * Check Netlify Function API health
   * @returns {Promise<Object>} API health check results
   */
  async checkNetlifyFunction() {
    // Skip if not running on Netlify
    if (!this.isNetlify && import.meta.env.MODE === 'development') {
      return {
        status: 'skipped',
        message: 'Not running on Netlify'
      };
    }
    
    try {
      const startTime = Date.now();
      
      // Call the API status endpoint
      const response = await fetch(`${this.apiEndpoint}?action=check`);
      const data = await response.json();
      
      const elapsed = Date.now() - startTime;
      
      if (!response.ok) {
        return {
          status: 'unhealthy',
          statusCode: response.status,
          error: data.error || 'Unknown error',
          latency: `${elapsed}ms`
        };
      }
      
      // Check environment variables through the function
      const envResponse = await fetch(`${this.apiEndpoint}?action=env`);
      const envData = await envResponse.json();
      
      return {
        status: 'healthy',
        latency: `${elapsed}ms`,
        functionResponse: data,
        environmentInfo: envData
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message
      };
    }
  }

  /**
   * Get detailed environment information
   * @returns {Object} Environment information
   */
  getEnvironmentInfo() {
    return {
      mode: import.meta.env.MODE,
      isProduction: import.meta.env.PROD,
      isNetlify: this.isNetlify,
      viteEnvVars: Object.keys(import.meta.env)
        .filter(key => key.startsWith('VITE_'))
        .reduce((obj, key) => {
          // Only indicate if the variable exists, not its value
          obj[key] = '✓';
          return obj;
        }, {}),
      browserInfo: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        online: navigator.onLine
      }
    };
  }

  /**
   * Get the last diagnostics results or run a new check
   * @param {boolean} refresh - Whether to run a new check
   * @returns {Promise<Object>} Diagnostics results
   */
  async getDiagnostics(refresh = false) {
    if (refresh || !this.diagnosticsResults) {
      return this.runHealthCheck();
    }
    return this.diagnosticsResults;
  }
}

export const netlifyDiagnosticsService = new NetlifyDiagnosticsService();
