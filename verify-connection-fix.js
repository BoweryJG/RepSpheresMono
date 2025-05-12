// Verify that Supabase connection issues were fixed
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_SERVICE_KEY;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

console.log('\n==================================================');
console.log('🔍 VERIFYING SUPABASE CONNECTION FIX');
console.log('==================================================\n');

// Create Supabase clients
const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Test anonymous client connection
async function testAnonConnection() {
  try {
    console.log('Testing anonymous client connection...');
    const { data, error } = await supabaseAnon.rpc('execute_sql_with_results', {
      sql_query: 'SELECT 1 as test'
    });
    
    if (error) {
      console.error(`❌ Anonymous connection error: ${error.message}`);
      return false;
    }
    
    console.log('✅ Anonymous client connection successful!');
    console.log('   Data returned:', data);
    return true;
  } catch (err) {
    console.error(`❌ Anonymous connection error: ${err.message}`);
    return false;
  }
}

// Test admin client connection
async function testAdminConnection() {
  try {
    console.log('\nTesting admin client connection...');
    const { data, error } = await supabaseAdmin.rpc('execute_sql_with_results', {
      sql_query: 'SELECT 1 as test'
    });
    
    if (error) {
      console.error(`❌ Admin connection error: ${error.message}`);
      return false;
    }
    
    console.log('✅ Admin client connection successful!');
    console.log('   Data returned:', data);
    return true;
  } catch (err) {
    console.error(`❌ Admin connection error: ${err.message}`);
    return false;
  }
}

// Test if tables exist
async function testTables() {
  try {
    console.log('\nVerifying required tables exist...');
    
    const tablesToCheck = [
      'dental_procedures_simplified',
      'aesthetic_procedures',
      'companies',
      'dental_market_growth',
      'aesthetic_market_growth',
      'categories',
      'aesthetic_categories'
    ];
    
    const { data, error } = await supabaseAdmin.rpc('execute_sql_with_results', {
      sql_query: `
        SELECT table_name 
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name IN ('${tablesToCheck.join("','")}')
      `
    });
    
    if (error) {
      console.error(`❌ Error checking tables: ${error.message}`);
      return false;
    }
    
    const existingTables = data ? data.map(row => row.table_name) : [];
    
    for (const table of tablesToCheck) {
      console.log(`Table '${table}': ${existingTables.includes(table) ? '✅' : '❌'}`);
    }
    
    const allTablesExist = tablesToCheck.every(table => existingTables.includes(table));
    console.log(`\nAll required tables exist: ${allTablesExist ? '✅' : '❌'}`);
    
    return allTablesExist;
  } catch (err) {
    console.error(`❌ Error checking tables: ${err.message}`);
    return false;
  }
}

// Run all verification tests
async function runVerification() {
  const anonResult = await testAnonConnection();
  const adminResult = await testAdminConnection();
  const tablesResult = await testTables();
  
  console.log('\n==================================================');
  console.log('📊 VERIFICATION RESULTS');
  console.log('==================================================\n');
  
  console.log(`Anonymous connection: ${anonResult ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`Admin connection: ${adminResult ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`Required tables: ${tablesResult ? '✅ SUCCESS' : '❌ FAILED'}`);
  
  const allSuccess = anonResult && adminResult && tablesResult;
  
  console.log('\n==================================================');
  console.log(`OVERALL STATUS: ${allSuccess ? '✅ ALL FIXES APPLIED SUCCESSFULLY' : '❌ SOME FIXES NOT APPLIED'}`);
  console.log('==================================================\n');
  
  return allSuccess;
}

// Run the verification
runVerification().catch(err => {
  console.error(`\n❌ Unexpected error: ${err.message}`);
});
