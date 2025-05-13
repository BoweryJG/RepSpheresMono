/**
 * Check Render Connection Script
 * 
 * This script performs a comprehensive check of the Render backend connection
 * and provides detailed diagnostics and solutions for any issues found.
 */

// Configuration
const API_BASE_URL = 'https://osbackend-zl1h.onrender.com';
const ENDPOINTS = {
  HEALTH: '/health',
  MARKET_INSIGHTS: '/api/data/market_insights',
  MODULE_ACCESS: '/api/modules/access'
};
const TIMEOUT_MS = 30000; // 30 seconds

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
 * Check an endpoint with detailed error handling
 * @param {string} endpoint - Endpoint to check
 * @param {Object} options - Fetch options
 * @returns {Object} - Check result
 */
async function checkEndpoint(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log(`\n🔍 Checking endpoint: ${url}`);
  
  const startTime = Date.now();
  
  try {
    const response = await fetchWithTimeout(url, options);
    const elapsed = Date.now() - startTime;
    
    let responseData;
    try {
      responseData = await response.json();
    } catch (e) {
      responseData = { error: 'Could not parse response as JSON' };
    }
    
    const result = {
      endpoint,
      url,
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      latency: `${elapsed}ms`,
      headers: Object.fromEntries(response.headers.entries()),
      data: responseData
    };
    
    if (response.ok) {
      console.log(`✅ Endpoint ${endpoint} is accessible (Status: ${response.status}, Latency: ${elapsed}ms)`);
    } else {
      console.error(`❌ Endpoint ${endpoint} returned status: ${response.status} - ${response.statusText}`);
    }
    
    return result;
  } catch (error) {
    const elapsed = Date.now() - startTime;
    
    console.error(`❌ Failed to connect to ${endpoint}:`, error.message);
    
    return {
      endpoint,
      url,
      error: error.message,
      errorType: error.name,
      latency: `${elapsed}ms`,
      ok: false
    };
  }
}

/**
 * Test the market insights POST endpoint with sample data
 * @returns {Object} - Check result
 */
async function checkMarketInsightsPost() {
  const endpoint = ENDPOINTS.MARKET_INSIGHTS;
  const url = `${API_BASE_URL}${endpoint}`;
  console.log(`\n🔍 Testing POST to: ${url}`);
  
  const testData = {
    userId: `test_user_${Date.now()}`,
    data: {
      testKey: "testValue",
      timestamp: new Date().toISOString()
    }
  };
  
  const startTime = Date.now();
  
  try {
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });
    
    const elapsed = Date.now() - startTime;
    
    let responseData;
    try {
      responseData = await response.json();
    } catch (e) {
      responseData = { error: 'Could not parse response as JSON' };
    }
    
    const result = {
      endpoint,
      url,
      method: 'POST',
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      latency: `${elapsed}ms`,
      headers: Object.fromEntries(response.headers.entries()),
      data: responseData,
      requestData: testData
    };
    
    if (response.ok) {
      console.log(`✅ POST to ${endpoint} successful (Status: ${response.status}, Latency: ${elapsed}ms)`);
    } else {
      console.error(`❌ POST to ${endpoint} failed with status: ${response.status} - ${response.statusText}`);
    }
    
    return result;
  } catch (error) {
    const elapsed = Date.now() - startTime;
    
    console.error(`❌ Failed to POST to ${endpoint}:`, error.message);
    
    return {
      endpoint,
      url,
      method: 'POST',
      error: error.message,
      errorType: error.name,
      latency: `${elapsed}ms`,
      ok: false,
      requestData: testData
    };
  }
}

/**
 * Check if the service is hibernating
 * @param {Object} results - Check results
 * @returns {boolean} - True if the service appears to be hibernating
 */
function isServiceHibernating(results) {
  // Check for timeout errors which might indicate hibernation
  const hasTimeouts = results.some(result => 
    result.error && (
      result.error.includes('timeout') || 
      result.error.includes('abort') ||
      result.latency > 10000 // More than 10 seconds might indicate hibernation
    )
  );
  
  // Check for slow first response but faster subsequent responses
  if (results.length > 1) {
    const firstLatency = parseInt(results[0].latency);
    const avgOtherLatency = results.slice(1).reduce((sum, r) => sum + parseInt(r.latency), 0) / (results.length - 1);
    
    if (firstLatency > 5000 && firstLatency > (avgOtherLatency * 3)) {
      return true;
    }
  }
  
  return hasTimeouts;
}

/**
 * Analyze results and provide solutions
 * @param {Array<Object>} results - Check results
 */
function analyzeAndSuggestSolutions(results) {
  console.log('\n===== Analysis and Solutions =====');
  
  // Count successful and failed checks
  const successful = results.filter(r => r.ok).length;
  const failed = results.length - successful;
  
  console.log(`📊 Summary: ${successful} successful, ${failed} failed checks`);
  
  // Check if all endpoints are working
  if (successful === results.length) {
    console.log('\n✅ All endpoints are working correctly!');
    console.log('If you are still experiencing issues in your application, consider:');
    console.log('1. Checking for CORS issues in the browser console');
    console.log('2. Verifying that your application is using the correct API URL');
    console.log('3. Checking for client-side errors in your code');
    return;
  }
  
  // Check for hibernation
  if (isServiceHibernating(results)) {
    console.log('\n⚠️ The Render service appears to be hibernating.');
    console.log('Free Render services hibernate after periods of inactivity.');
    console.log('\nSolutions:');
    console.log('1. Implement a "wake-up" request before making actual API calls:');
    console.log(`   fetch('${API_BASE_URL}/health').then(() => { /* proceed with actual requests */ });`);
    console.log('2. Consider upgrading to a paid Render plan to avoid hibernation');
    console.log('3. Set up a scheduled job to ping the service periodically to keep it active');
  }
  
  // Check for network issues
  const networkErrors = results.filter(r => r.error && (
    r.error.includes('network') || 
    r.error.includes('connect') ||
    r.error.includes('ENOTFOUND')
  )).length;
  
  if (networkErrors > 0) {
    console.log('\n⚠️ Network connectivity issues detected.');
    console.log('\nSolutions:');
    console.log('1. Check your internet connection');
    console.log('2. Verify that the Render service is running at:', API_BASE_URL);
    console.log('3. Check if there are any firewall or proxy settings blocking the connection');
  }
  
  // Check for CORS issues
  const corsErrors = results.filter(r => r.error && r.error.includes('CORS')).length;
  if (corsErrors > 0) {
    console.log('\n⚠️ CORS issues detected.');
    console.log('\nSolutions:');
    console.log('1. Add your frontend domain to the allowed origins in your Render service');
    console.log('2. Use a CORS proxy for development');
    console.log('3. Check the browser console for specific CORS error details');
  }
  
  // Check for 400 status on module access endpoint
  const moduleAccessResult = results.find(r => r.endpoint === ENDPOINTS.MODULE_ACCESS);
  if (moduleAccessResult && moduleAccessResult.status === 400) {
    console.log('\n⚠️ Module access endpoint returns 400 status code.');
    console.log('This is expected behavior according to the documentation.');
    console.log('The application is designed to handle this by returning { access: true }.');
    console.log('\nNo action needed for this specific issue.');
  }
  
  // General advice
  console.log('\n📋 General recommendations:');
  console.log('1. Check the Render dashboard for service status and logs');
  console.log('2. Verify that your API_BASE_URL is correct in your application');
  console.log('3. Implement retry logic for handling intermittent connection issues');
  console.log('4. Add error handling in your application to gracefully handle API failures');
}

/**
 * Run all checks and analyze results
 */
async function runDiagnostics() {
  console.log('===== Render Backend Connection Diagnostics =====');
  console.log(`Base URL: ${API_BASE_URL}`);
  console.log('Running comprehensive connection tests...');
  
  const results = [];
  
  // Check health endpoint
  results.push(await checkEndpoint(ENDPOINTS.HEALTH));
  
  // Check market insights GET endpoint
  results.push(await checkEndpoint(`${ENDPOINTS.MARKET_INSIGHTS}?userId=test_user`));
  
  // Check market insights POST endpoint
  results.push(await checkMarketInsightsPost());
  
  // Check module access endpoint
  results.push(await checkEndpoint(ENDPOINTS.MODULE_ACCESS));
  
  // Analyze results and suggest solutions
  analyzeAndSuggestSolutions(results);
  
  return results;
}

// Run the diagnostics
runDiagnostics().catch(error => {
  console.error('Error running diagnostics:', error);
});
