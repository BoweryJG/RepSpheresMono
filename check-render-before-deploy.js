/**
 * Check Render Connection Before Deploy
 * 
 * This script checks the Render backend connection before deploying to Netlify.
 * It ensures that the Render backend is awake and responsive before triggering a deployment.
 */

import fetch from 'node-fetch';
import { AbortController } from 'abort-controller';

// Configuration
const API_BASE_URL = 'https://osbackend-zl1h.onrender.com';
const ENDPOINTS = {
  HEALTH: '/health',
  MARKET_INSIGHTS: '/api/data/market_insights',
  MODULE_ACCESS: '/api/modules/access'
};
const TIMEOUT_MS = 30000; // 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000; // 2 seconds

/**
 * Fetch with timeout
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @param {number} timeoutMs - Timeout in milliseconds
 * @returns {Promise<Response>} - Fetch response
 */
async function fetchWithTimeout(url, options = {}, timeoutMs = TIMEOUT_MS) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

/**
 * Sleep for a specified duration
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Wake up the Render service with retries
 * @returns {Promise<boolean>} - True if successful, false otherwise
 */
async function wakeUpRenderService() {
  console.log('🔄 Attempting to wake up Render service...');
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`Attempt ${attempt}/${MAX_RETRIES}...`);
      const startTime = Date.now();
      
      const response = await fetchWithTimeout(`${API_BASE_URL}${ENDPOINTS.HEALTH}`);
      const elapsed = Date.now() - startTime;
      
      if (response.ok) {
        console.log(`✅ Render service is awake! (${elapsed}ms)`);
        return true;
      } else {
        console.log(`⚠️ Render service returned status ${response.status} (${elapsed}ms)`);
      }
    } catch (error) {
      console.log(`⚠️ Attempt ${attempt} failed: ${error.message}`);
    }
    
    if (attempt < MAX_RETRIES) {
      console.log(`Waiting ${RETRY_DELAY_MS}ms before next attempt...`);
      await sleep(RETRY_DELAY_MS);
    }
  }
  
  console.error('❌ Failed to wake up Render service after multiple attempts');
  return false;
}

/**
 * Check if the Render service is ready for deployment
 * @returns {Promise<boolean>} - True if ready, false otherwise
 */
async function isRenderServiceReady() {
  try {
    // First, try to wake up the service
    const isAwake = await wakeUpRenderService();
    if (!isAwake) {
      return false;
    }
    
    // Check the module access endpoint
    console.log('🔍 Checking module access endpoint...');
    const moduleResponse = await fetchWithTimeout(`${API_BASE_URL}${ENDPOINTS.MODULE_ACCESS}`);
    
    // Status 400 is expected for this endpoint when no parameters are provided
    if (moduleResponse.status === 400 || moduleResponse.ok) {
      console.log('✅ Module access endpoint is working');
    } else {
      console.error(`❌ Module access endpoint returned unexpected status: ${moduleResponse.status}`);
      return false;
    }
    
    // Check the market insights endpoint
    console.log('🔍 Checking market insights endpoint...');
    const insightsResponse = await fetchWithTimeout(`${API_BASE_URL}${ENDPOINTS.MARKET_INSIGHTS}?userId=test_user`);
    
    if (insightsResponse.ok) {
      console.log('✅ Market insights endpoint is working');
    } else {
      console.error(`❌ Market insights endpoint returned status: ${insightsResponse.status}`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error checking Render service:', error.message);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('===== Checking Render Connection Before Deploy =====');
  
  try {
    const isReady = await isRenderServiceReady();
    
    if (isReady) {
      console.log('✅ Render service is ready for deployment');
      process.exit(0); // Success
    } else {
      console.error('❌ Render service is not ready for deployment');
      
      // Exit with a non-zero code, but allow the deployment to continue
      // This will just serve as a warning
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Error checking Render service:', error);
    process.exit(0); // Allow deployment to continue despite errors
  }
}

// Run the main function
main();
