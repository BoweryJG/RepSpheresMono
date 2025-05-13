/**
 * Unified Supabase Service Test Script
 * 
 * This script tests the connection to Supabase through the unified service
 * which handles both MCP and direct connections.
 */

import { supabaseClient } from './src/services/supabase/supabaseClient.js';
import * as unifiedService from './src/services/supabase/unifiedSupabaseService.js';

const { 
  unifiedSupabaseService,  
  getDentalProcedures, 
  getAestheticProcedures, 
  getDentalCompanies,
  getAestheticCompanies,
  getMarketGrowthData,
  getNewsArticles,
  getUpcomingEvents,
  getTrendingTopics
} = unifiedService;

import dotenv from 'dotenv';
import colors from 'colors';

// Load environment variables
dotenv.config();

// Terminal colors for output
colors.setTheme({
  info: 'blue',
  success: 'green',
  warn: 'yellow',
  error: 'red',
  data: 'cyan',
  header: 'magenta'
});

/**
 * Run all tests
 */
async function runTests() {
  console.log('\n' + '='.repeat(80).header);
  console.log('UNIFIED SUPABASE SERVICE TEST'.header);
  console.log('='.repeat(80).header + '\n');
  
  try {
    // Initialize the service
    console.log('Initializing unified Supabase service...'.info);
    const initResult = await unifiedSupabaseService.initialize();
    
    if (initResult.success) {
      console.log('✓ Service initialized successfully!'.success);
      console.log(`  Mode: ${initResult.environment}`.data);
      console.log(`  Using MCP: ${initResult.usingMcp}`.data);
    } else {
      console.log('✗ Service initialization failed!'.error);
      console.log(`  Error: ${initResult.error}`.error);
      process.exit(1);
    }
    
    // Test data access functions
    await testDataAccess();
    
  } catch (error) {
    console.error('Test script failed with error:'.error);
    console.error(error);
    process.exit(1);
  }
}

/**
 * Test all data access functions
 */
async function testDataAccess() {
  console.log('\n' + '-'.repeat(80));
  console.log('Testing data access functions...'.info);
  console.log('-'.repeat(80) + '\n');
  
  // Test dental procedures
  await testFunction('getDentalProcedures', getDentalProcedures);
  
  // Test aesthetic procedures
  await testFunction('getAestheticProcedures', getAestheticProcedures);
  
  // Test dental companies
  await testFunction('getDentalCompanies', getDentalCompanies);
  
  // Test aesthetic companies
  await testFunction('getAestheticCompanies', getAestheticCompanies);
  
  // Test dental market growth data
  await testFunction('getMarketGrowthData (dental)', () => getMarketGrowthData('dental'));
  
  // Test aesthetic market growth data
  await testFunction('getMarketGrowthData (aesthetic)', () => getMarketGrowthData('aesthetic'));
  
  // Test dental news
  await testFunction('getNewsArticles (dental)', () => getNewsArticles('dental'));
  
  // Test aesthetic news
  await testFunction('getNewsArticles (aesthetic)', () => getNewsArticles('aesthetic'));
  
  // Test dental events
  await testFunction('getUpcomingEvents (dental)', () => getUpcomingEvents('dental'));
  
  // Test aesthetic events
  await testFunction('getUpcomingEvents (aesthetic)', () => getUpcomingEvents('aesthetic'));
  
  // Test dental trending topics
  await testFunction('getTrendingTopics (dental)', () => getTrendingTopics('dental'));
  
  // Test aesthetic trending topics
  await testFunction('getTrendingTopics (aesthetic)', () => getTrendingTopics('aesthetic'));
  
  console.log('\n' + '='.repeat(80).success);
  console.log('ALL TESTS COMPLETED SUCCESSFULLY!'.success);
  console.log('='.repeat(80).success + '\n');
}

/**
 * Test a data access function and report results
 * @param {string} name - Function name for display
 * @param {Function} func - The data access function to test
 */
async function testFunction(name, func) {
  process.stdout.write(`Testing ${name}... `);
  
  try {
    const startTime = performance.now();
    const result = await func();
    const endTime = performance.now();
    const duration = (endTime - startTime).toFixed(2);
    
    if (Array.isArray(result)) {
      console.log(`✓ Success, got ${result.length} items (${duration}ms)`.success);
      
      // Display first item as example if available
      if (result.length > 0) {
        console.log('  Example item:'.data);
        console.log('  ' + JSON.stringify(result[0], null, 2).replace(/\n/g, '\n  ').data);
      }
    } else {
      console.log(`✓ Success (${duration}ms)`.success);
      console.log('  Result:'.data);
      console.log('  ' + JSON.stringify(result, null, 2).replace(/\n/g, '\n  ').data);
    }
  } catch (error) {
    console.log('✗ Failed!'.error);
    console.log(`  Error: ${error.message}`.error);
  }
  
  console.log(''); // Extra line for readability
}

// Run the tests
runTests()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Uncaught error in test script:'.error);
    console.error(error);
    process.exit(1);
  });
