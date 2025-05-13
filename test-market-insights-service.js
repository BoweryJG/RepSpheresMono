/**
 * Test Market Insights Service Script
 * 
 * This script tests the marketInsightsApiService to ensure it correctly
 * handles the Render backend API endpoints, including error cases.
 */

import marketInsightsApiService from './src/services/marketInsightsApiService.js';

/**
 * Test the module access endpoint
 */
async function testModuleAccess() {
  console.log('===== Testing Module Access =====');
  
  try {
    // Test the checkModuleAccess method
    console.log('Testing checkModuleAccess method...');
    const moduleAccess = await marketInsightsApiService.checkModuleAccess();
    console.log('Module access result:', moduleAccess);
    
    if (moduleAccess && moduleAccess.access === true) {
      console.log('✅ checkModuleAccess correctly returns { access: true }');
    } else {
      console.error('❌ checkModuleAccess did not return { access: true }');
    }
    
    // Test the directCheckModuleAccess method
    console.log('\nTesting directCheckModuleAccess method...');
    const directModuleAccess = await marketInsightsApiService.directCheckModuleAccess();
    console.log('Direct module access result:', directModuleAccess);
    
    if (directModuleAccess && directModuleAccess.access === true) {
      console.log('✅ directCheckModuleAccess correctly returns { access: true }');
    } else {
      console.error('❌ directCheckModuleAccess did not return { access: true }');
    }
    
  } catch (error) {
    console.error('Error testing module access:', error);
  }
}

/**
 * Test the market insights endpoints
 */
async function testMarketInsights() {
  console.log('\n===== Testing Market Insights =====');
  
  const testUserId = 'test_user_' + Date.now();
  const testData = {
    testKey: 'testValue',
    timestamp: new Date().toISOString()
  };
  
  try {
    // Test storing market insights
    console.log(`Testing storeMarketInsights for user ${testUserId}...`);
    const storeResult = await marketInsightsApiService.storeMarketInsights(testUserId, testData);
    console.log('Store result:', storeResult);
    
    // Test retrieving market insights
    console.log(`\nTesting getMarketInsights for user ${testUserId}...`);
    const getResult = await marketInsightsApiService.getMarketInsights(testUserId);
    console.log('Get result:', getResult);
    
    // Verify the data was stored correctly
    if (getResult && getResult.data && getResult.data.testKey === testData.testKey) {
      console.log('✅ Market insights data was stored and retrieved correctly');
    } else {
      console.error('❌ Market insights data was not stored or retrieved correctly');
    }
    
  } catch (error) {
    console.error('Error testing market insights:', error);
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('===== Testing Market Insights API Service =====');
  
  await testModuleAccess();
  await testMarketInsights();
  
  console.log('\n===== Test Complete =====');
}

// Run the tests
runTests().catch(error => {
  console.error('Error running tests:', error);
});
