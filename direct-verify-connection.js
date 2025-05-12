// Direct Verification Script for Supabase Connection
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_SERVICE_KEY;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

console.log('\n==================================================');
console.log('🔍 DIRECT SUPABASE CONNECTION VERIFICATION');
console.log('==================================================\n');

// Create Supabase clients
const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Test anonymous client connection using a direct query
async function testAnonConnection() {
  try {
    console.log('Testing anonymous client connection...');
    
    // Simple test - list up to 5 tables from public schema
    const { data, error } = await supabaseAnon
      .from('pg_catalog.pg_tables')
      .select('tablename')
      .eq('schemaname', 'public')
      .limit(5);
    
    if (error) {
      console.error(`❌ Anonymous connection error: ${error.message}`);
      return false;
    }
    
    console.log('✅ Anonymous client connection successful!');
    console.log('   Tables found:', data ? data.length : 0);
    return true;
  } catch (err) {
    console.error(`❌ Anonymous connection error: ${err.message}`);
    return false;
  }
}

// Test admin client connection using a direct query
async function testAdminConnection() {
  try {
    console.log('\nTesting admin client connection...');
    
    // Simple test - list up to 5 tables from public schema
    const { data, error } = await supabaseAdmin
      .from('pg_catalog.pg_tables')
      .select('tablename')
      .eq('schemaname', 'public')
      .limit(5);
    
    if (error) {
      console.error(`❌ Admin connection error: ${error.message}`);
      return false;
    }
    
    console.log('✅ Admin client connection successful!');
    console.log('   Tables found:', data ? data.length : 0);
    if (data && data.length > 0) {
      console.log('   Sample tables:', data.map(t => t.tablename).join(', '));
    }
    return true;
  } catch (err) {
    console.error(`❌ Admin connection error: ${err.message}`);
    return false;
  }
}

// Test direct SQL using just the raw() method
async function testDirectSql() {
  try {
    console.log('\nTesting direct SQL execution...');
    
    // Use the raw() method to execute a simple SQL query
    const { data, error } = await supabaseAdmin.rpc(
      'pg_catalog.pg_stat_statements_reset'
    ).select();
    
    if (error) {
      console.error(`❌ Direct SQL error: ${error.message}`);
      console.log('   This is non-critical, continuing with verification...');
    } else {
      console.log('✅ Direct SQL execution successful!');
    }
    
    return !error;
  } catch (err) {
    console.error(`❌ Direct SQL error: ${err.message}`);
    console.log('   This is non-critical, continuing with verification...');
    return false;
  }
}

// Test if required tables exist
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
    
    // Get all tables from the public schema
    const { data, error } = await supabaseAdmin
      .from('pg_catalog.pg_tables')
      .select('tablename')
      .eq('schemaname', 'public');
    
    if (error) {
      console.error(`❌ Error checking tables: ${error.message}`);
      return false;
    }
    
    // Get list of existing table names
    const existingTables = data ? data.map(row => row.tablename) : [];
    
    // Check each required table
    for (const table of tablesToCheck) {
      const exists = existingTables.includes(table);
      console.log(`Table '${table}': ${exists ? '✅' : '❌'}`);
    }
    
    // Check if all required tables exist
    const allTablesExist = tablesToCheck.every(table => existingTables.includes(table));
    console.log(`\nAll required tables exist: ${allTablesExist ? '✅' : '❌'}`);
    
    return allTablesExist;
  } catch (err) {
    console.error(`❌ Error checking tables: ${err.message}`);
    return false;
  }
}

// Create one of the missing tables as a test
async function createTestTable() {
  try {
    console.log('\nTesting table creation ability...');
    
    // Try to create a test table
    const { error } = await supabaseAdmin.schema.createTable('test_connection_table', {
      id: { type: 'serial', primaryKey: true },
      created_at: { type: 'timestamp with time zone', defaultValue: 'now()' },
      name: { type: 'text' }
    });
    
    if (error) {
      console.error(`❌ Error creating test table: ${error.message}`);
      return false;
    }
    
    console.log('✅ Test table created successfully!');
    
    // Verify the table was created
    const { data, error: checkError } = await supabaseAdmin
      .from('pg_catalog.pg_tables')
      .select('tablename')
      .eq('schemaname', 'public')
      .eq('tablename', 'test_connection_table')
      .limit(1);
    
    if (checkError || !data || data.length === 0) {
      console.error(`❌ Could not verify test table creation`);
      return false;
    }
    
    console.log('✅ Test table verified!');
    return true;
  } catch (err) {
    console.error(`❌ Error during test table creation: ${err.message}`);
    return false;
  }
}

// Run all verification tests
async function runVerification() {
  const anonResult = await testAnonConnection();
  const adminResult = await testAdminConnection();
  const sqlResult = await testDirectSql();
  const tablesResult = await testTables();
  const createTableResult = await createTestTable();
  
  console.log('\n==================================================');
  console.log('📊 VERIFICATION RESULTS');
  console.log('==================================================\n');
  
  console.log(`Anonymous connection: ${anonResult ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`Admin connection: ${adminResult ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`Direct SQL execution: ${sqlResult ? '✅ SUCCESS' : '❌ FAILED (Non-critical)'}`);
  console.log(`Required tables: ${tablesResult ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`Table creation ability: ${createTableResult ? '✅ SUCCESS' : '❌ FAILED'}`);
  
  // Connection is the most important part
  const connectionSuccess = anonResult && adminResult;
  
  console.log('\n==================================================');
  console.log(`OVERALL CONNECTION STATUS: ${connectionSuccess ? '✅ CONNECTION SUCCESSFUL' : '❌ CONNECTION ISSUES'}`);
  console.log('==================================================\n');
  
  if (connectionSuccess && !tablesResult) {
    console.log('✅ Connection is working but some tables are missing');
    console.log('  You can run table creation scripts to set up missing tables');
  }
  
  return connectionSuccess;
}

// Run the verification
runVerification().catch(err => {
  console.error(`\n❌ Unexpected error: ${err.message}`);
});
