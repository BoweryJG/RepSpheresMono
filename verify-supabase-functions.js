// Verify Supabase SQL functions script
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import colors from 'colors';

colors.enable();

// Load environment variables
dotenv.config();

console.log('\n=================================================='.cyan);
console.log('🔍 SUPABASE FUNCTIONS VERIFICATION TOOL'.brightWhite.bold);
console.log('==================================================\n'.cyan);

// Get timestamp for logging
const timestamp = new Date().toLocaleString();
console.log(`Verification started at: ${timestamp}`.gray);

// Environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('\n❌ Error: Missing essential Supabase credentials'.red);
  console.log('Please check your .env file and make sure SUPABASE_URL and SUPABASE_SERVICE_KEY are set');
  process.exit(1);
}

// Create admin client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

console.log(`\nConnecting to Supabase at: ${SUPABASE_URL}`.yellow);

// Function to verify SQL functions
async function verifyFunctions() {
  console.log('\nVerifying SQL functions:'.yellow);
  let allFunctionsExist = true;
  
  // Test version function
  try {
    const { data, error } = await supabase.rpc('version');
    
    if (error) {
      console.error(`❌ version: ${error.message}`.red);
      allFunctionsExist = false;
    } else {
      console.log(`✅ version: Function exists and works!`.green);
      console.log(`   Result: ${JSON.stringify(data)}`.gray);
    }
  } catch (err) {
    console.error(`❌ version: ${err.message}`.red);
    allFunctionsExist = false;
  }
  
  // Test execute_sql function
  try {
    const { data, error } = await supabase.rpc('execute_sql', { 
      sql_query: 'CREATE TABLE IF NOT EXISTS temp_test_table (id serial primary key, name text)' 
    });
    
    if (error) {
      console.error(`❌ execute_sql: ${error.message}`.red);
      allFunctionsExist = false;
    } else {
      console.log(`✅ execute_sql: Function exists and works!`.green);
      console.log(`   Result: ${JSON.stringify(data)}`.gray);
    }
  } catch (err) {
    console.error(`❌ execute_sql: ${err.message}`.red);
    allFunctionsExist = false;
  }
  
  // Test execute_sql_with_results function - Need to use a correct JSON-returning query
  try {
    const { data, error } = await supabase.rpc('execute_sql_with_results', { 
      sql_query: 'SELECT row_to_json(row) FROM (SELECT 1 as test) row' 
    });
    
    if (error) {
      console.error(`❌ execute_sql_with_results: ${error.message}`.red);
      allFunctionsExist = false;
    } else {
      console.log(`✅ execute_sql_with_results: Function exists and works!`.green);
      console.log(`   Result: ${JSON.stringify(data)}`.gray);
    }
  } catch (err) {
    console.error(`❌ execute_sql_with_results: ${err.message}`.red);
    allFunctionsExist = false;
  }
  
  // Test list_all_tables function - Use direct query which is more reliable
  try {
    // Query the function through a direct database query
    const { data, error } = await supabase.rpc('execute_sql_with_results', { 
      sql_query: `SELECT json_build_object(
        'schema_name', schema_name,
        'table_name', table_name,
        'row_count', row_count
      ) FROM list_all_tables() LIMIT 5;`
    });
    
    if (error) {
      console.error(`❌ list_all_tables: ${error.message}`.red);
      allFunctionsExist = false;
    } else {
      console.log(`✅ list_all_tables: Function exists and works!`.green);
      console.log(`   Result: ${JSON.stringify(data)}`.gray);
    }
  } catch (err) {
    console.error(`❌ list_all_tables: ${err.message}`.red);
    allFunctionsExist = false;
  }
  
  return allFunctionsExist;
}

// Function to check if RLS is set up correctly
async function checkRlsPolicies() {
  try {
    console.log('\nChecking RLS policies:'.yellow);
    
    const { data, error } = await supabase.rpc('execute_sql_with_results', {
      sql_query: `
        SELECT
          schemaname,
          tablename,
          policyname,
          cmd
        FROM
          pg_policies
        WHERE
          schemaname = 'public'
        ORDER BY
          tablename, policyname;
      `
    });
    
    if (error) {
      console.error(`❌ Error checking RLS policies: ${error.message}`.red);
      return false;
    }
    
    if (!data || data.length === 0) {
      console.log('⚠️ No RLS policies found'.yellow);
      return false;
    }
    
    // Group policies by table
    const policiesByTable = {};
    
    for (const policy of data) {
      const { tablename } = policy;
      
      if (!policiesByTable[tablename]) {
        policiesByTable[tablename] = [];
      }
      
      policiesByTable[tablename].push(policy);
    }
    
    console.log(`Found policies for ${Object.keys(policiesByTable).length} tables:`.cyan);
    
    for (const [table, policies] of Object.entries(policiesByTable)) {
      console.log(`   Table '${table}': ${policies.length} policies`.cyan);
      policies.forEach(policy => {
        console.log(`      - ${policy.policyname} (${policy.cmd})`.gray);
      });
    }
    
    return true;
  } catch (err) {
    console.error(`❌ Error checking RLS policies: ${err.message}`.red);
    return false;
  }
}

// Run verification
async function runVerification() {
  try {
    const functionsExist = await verifyFunctions();
    const rlsPoliciesExist = functionsExist ? await checkRlsPolicies() : false;
    
    console.log('\n=================================================='.cyan);
    console.log('🔍 VERIFICATION RESULTS'.brightWhite.bold);
    console.log('==================================================\n'.cyan);
    
    console.log(`SQL Functions: ${functionsExist ? '✅' : '❌'}`.cyan);
    console.log(`RLS Policies: ${rlsPoliciesExist ? '✅' : '❌'}`.cyan);
    
    console.log('\nVerification completed at', new Date().toLocaleString());
    
    if (functionsExist) {
      console.log('\n✅ SQL functions are properly set up!'.green);
      console.log('Next steps:');
      console.log('1. Run fix-supabase-connection.js to complete the repair process');
      console.log('2. Verify data with a simple query');
      console.log('3. Check frontend connection');
    } else {
      console.log('\n⚠️ Some SQL functions are missing.'.yellow);
      console.log('Please make sure you run the supabase-functions.sql script in Supabase SQL Editor.');
    }
    
    console.log('\n==================================================\n'.cyan);
  } catch (err) {
    console.error(`Unexpected error: ${err}`.red);
  }
}

// Start verification
runVerification();
