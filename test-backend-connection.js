/**
 * Test Backend Connection Script
 * 
 * This script tests the connection to the Render backend API endpoints
 * to ensure they are accessible before deploying the frontend.
 */

const API_BASE_URL = 'https://osbackend-zl1h.onrender.com';
const MARKET_INSIGHTS_ENDPOINT = '/api/data/market_insights';
const MODULE_ACCESS_ENDPOINT = '/api/modules/access';

/**
 * Test a specific API endpoint
 * @param {string} endpoint - The API endpoint to test
 * @returns {Promise<boolean>} - True if the endpoint is accessible
 */
async function testEndpoint(endpoint) {
  try {
    console.log(`Testing endpoint: ${API_BASE_URL}${endpoint}`);
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    
    if (response.ok) {
      console.log(`✅ Endpoint ${endpoint} is accessible (Status: ${response.status})`);
      return true;
    } else {
      console.error(`❌ Endpoint ${endpoint} returned status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Failed to connect to ${endpoint}:`, error.message);
    return false;
  }
}

/**
 * Test the market insights POST endpoint with sample data
 * @returns {Promise<boolean>} - True if the endpoint accepts POST requests
 */
async function testMarketInsightsPost() {
  try {
    console.log(`Testing POST to: ${API_BASE_URL}${MARKET_INSIGHTS_ENDPOINT}`);
    
    const testData = {
      userId: "test_user",
      data: {
        testKey: "testValue",
        timestamp: new Date().toISOString()
      }
    };
    
    const response = await fetch(`${API_BASE_URL}${MARKET_INSIGHTS_ENDPOINT}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });
    
    if (response.ok) {
      console.log(`✅ POST to ${MARKET_INSIGHTS_ENDPOINT} successful (Status: ${response.status})`);
      return true;
    } else {
      console.error(`❌ POST to ${MARKET_INSIGHTS_ENDPOINT} failed with status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Failed to POST to ${MARKET_INSIGHTS_ENDPOINT}:`, error.message);
    return false;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('===== Testing Render Backend Connection =====');
  console.log(`Base URL: ${API_BASE_URL}`);
  
  // Test health endpoint if available
  await testEndpoint('/health');
  
  // Test market insights GET endpoint
  const marketInsightsGetSuccess = await testEndpoint(`${MARKET_INSIGHTS_ENDPOINT}?userId=test_user`);
  
  // Test market insights POST endpoint
  const marketInsightsPostSuccess = await testMarketInsightsPost();
  
  // Test module access endpoint
  const moduleAccessSuccess = await testEndpoint(MODULE_ACCESS_ENDPOINT);
  
  // Summary
  console.log('\n===== Test Results =====');
  console.log(`Market Insights GET: ${marketInsightsGetSuccess ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Market Insights POST: ${marketInsightsPostSuccess ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Module Access: ${moduleAccessSuccess ? '✅ PASSED' : '❌ FAILED'}`);
  
  const allPassed = marketInsightsGetSuccess && marketInsightsPostSuccess && moduleAccessSuccess;
  console.log(`\nOverall Status: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  if (!allPassed) {
    console.log('\n⚠️ Warning: Some backend endpoints are not accessible.');
    console.log('Please verify the backend is running and the endpoints are correctly configured.');
  } else {
    console.log('\n🚀 Backend is ready for frontend deployment!');
  }
}

// Run the tests
runTests().catch(error => {
  console.error('Error running tests:', error);
});
