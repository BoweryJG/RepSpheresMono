/**
 * Test script for verifying connection to the Render backend
 * 
 * Usage:
 * npx ts-node scripts/test-render-connection.ts
 */

import { marketInsightsApi } from '../apps/market-insights/src/services/market-insights-api';

async function testRenderConnection() {
  console.log('Testing connection to Render backend...');
  console.log('API URL:', 'https://osbackend-zl1h.onrender.com');
  
  try {
    // Test API status
    console.log('\n1. Checking API status...');
    const status = await marketInsightsApi.checkStatus();
    console.log('✅ API Status:', status);
    
    // Test market data
    console.log('\n2. Fetching market data...');
    const marketData = await marketInsightsApi.getMarketData();
    console.log(`✅ Received ${marketData.length} market data items`);
    if (marketData.length > 0) {
      console.log('Sample market data:', marketData[0]);
    }
    
    // Test procedures
    console.log('\n3. Fetching procedures...');
    const procedures = await marketInsightsApi.getProcedures();
    if (Array.isArray(procedures)) {
      console.log(`✅ Received ${procedures.length} procedures`);
      if (procedures.length > 0) {
        console.log('Sample procedure:', procedures[0]);
      }
    } else {
      console.log('✅ Received procedure data (single item)');
    }
    
    // Test categories
    console.log('\n4. Fetching categories...');
    const categories = await marketInsightsApi.getCategories();
    console.log(`✅ Received ${categories.length} categories`);
    console.log('Categories:', categories);
    
    // Test news
    console.log('\n5. Fetching news articles...');
    const news = await marketInsightsApi.getNews(undefined, 3);
    console.log(`✅ Received ${news.length} news articles`);
    if (news.length > 0) {
      console.log('Sample news article:', {
        title: news[0].title,
        source: news[0].source,
        publishedAt: news[0].publishedAt
      });
    }
    
    // Test search
    console.log('\n6. Testing search functionality...');
    const searchResults = await marketInsightsApi.search('dental');
    console.log(`✅ Search returned ${searchResults.length} results`);
    
    console.log('\n✅ All tests passed! Connection to Render backend is working correctly.');
    
  } catch (error) {
    console.error('\n❌ Error connecting to Render backend:');
    if (error instanceof Error) {
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
    } else {
      console.error(error);
    }
    
    console.log('\nTroubleshooting steps:');
    console.log('1. Check that the Render backend is running at https://osbackend-zl1h.onrender.com');
    console.log('2. Verify your network connection');
    console.log('3. Check for CORS issues (if running in a browser)');
    console.log('4. Ensure the API URL is correctly configured');
    
    process.exit(1);
  }
}

// Run the test
testRenderConnection();
