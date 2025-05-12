// Simple connection test for Supabase
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_SERVICE_KEY;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

console.log('\n==================================================');
console.log('🔍 SIMPLE SUPABASE CONNECTION TEST');
console.log('==================================================\n');

console.log('Supabase URL:', SUPABASE_URL);

// Create Supabase clients
const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

console.log('Clients created successfully');

// Test anonymous connection
async function testAnonConnection() {
  try {
    console.log('\nTesting anonymous client connection...');
    
    const { data, error } = await supabaseAnon.from('dental_procedures_simplified').select('count(*)').limit(1);
    
    if (error) {
      console.error(`❌ Anonymous connection error: ${error.message}`);
      return false;
    }
    
    console.log('✅ Anonymous client connection successful!');
    return true;
  } catch (err) {
    console.error(`❌ Anonymous connection error: ${err.message}`);
    return false;
  }
}

// Test admin connection
async function testAdminConnection() {
  try {
    console.log('\nTesting admin client connection...');
    
    const { data, error } = await supabaseAdmin.from('dental_procedures_simplified').select('count(*)').limit(1);
    
    if (error) {
      console.error(`❌ Admin connection error: ${error.message}`);
      return false;
    }
    
    console.log('✅ Admin client connection successful!');
    return true;
  } catch (err) {
    console.error(`❌ Admin connection error: ${err.message}`);
    return false;
  }
}

// Test execute_sql function
async function testExecuteSql() {
  try {
    console.log('\nTesting execute_sql function...');
    
    const { error } = await supabaseAdmin.rpc('execute_sql', {
      sql_query: 'SELECT 1'
    });
    
    if (error) {
      console.error(`❌ execute_sql function error: ${error.message}`);
      return false;
    }
    
    console.log('✅ execute_sql function is working correctly');
    return true;
  } catch (err) {
    console.error(`❌ execute_sql function error: ${err.message}`);
    return false;
  }
}

// Test execute_sql_with_results function
async function testExecuteSqlWithResults() {
  try {
    console.log('\nTesting execute_sql_with_results function...');
    
    const { data, error } = await supabaseAdmin.rpc('execute_sql_with_results', {
      sql_query: 'SELECT 1 as test'
    });
    
    if (error) {
      console.error(`❌ execute_sql_with_results function error: ${error.message}`);
      return false;
    }
    
    console.log('✅ execute_sql_with_results function returned:', data);
    return true;
  } catch (err) {
    console.error(`❌ execute_sql_with_results function error: ${err.message}`);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  const anonResult = await testAnonConnection();
  const adminResult = await testAdminConnection();
  const execSqlResult = await testExecuteSql();
  const execSqlWithResultsResult = await testExecuteSqlWithResults();
  
  console.log('\n==================================================');
  console.log('📊 TEST RESULTS');
  console.log('==================================================\n');
  
  console.log(`Anonymous connection: ${anonResult ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`Admin connection: ${adminResult ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`execute_sql function: ${execSqlResult ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`execute_sql_with_results function: ${execSqlWithResultsResult ? '✅ SUCCESS' : '❌ FAILED'}`);
  
  console.log('\n==================================================\n');
  
  if (anonResult && adminResult && execSqlResult && execSqlWithResultsResult) {
    console.log('✅ ALL TESTS PASSED - The SQL function fix was successful!');
  } else {
    console.log('❌ SOME TESTS FAILED - The SQL function fix was not completely successful.');
  }
}

// Run the tests
runAllTests().catch(err => {
  console.error(`\n❌ Unexpected error: ${err.message}`);
});
