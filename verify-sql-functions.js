// Script to verify SQL functions in Supabase
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import colors from 'colors';

// Configure colors
colors.enable();

// Load environment variables
dotenv.config();

console.log('\n=================================================='.cyan);
console.log('🔍 SUPABASE SQL FUNCTIONS VERIFICATION'.brightWhite.bold);
console.log('==================================================\n'.cyan);

// Get timestamp for logging
const timestamp = new Date().toLocaleString();
console.log(`Verification started at: ${timestamp}`.gray);

// Environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_SERVICE_KEY;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !SUPABASE_ANON_KEY) {
  console.error('\n❌ Error: Missing essential Supabase credentials'.red);
  console.log('Please check your .env file for SUPABASE_URL, SUPABASE_SERVICE_KEY, and SUPABASE_ANON_KEY');
  process.exit(1);
}

console.log('Supabase URL:', SUPABASE_URL);

// Create Supabase clients
const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

console.log('\n=================================================='.cyan);
console.log('🔧 SUPABASE CONNECTIONS'.brightWhite.bold);
console.log('==================================================\n'.cyan);

// Function to verify the execute_sql function
async function verifyExecuteSql() {
  console.log('\nTesting execute_sql function...'.yellow);
  
  try {
    // Simple test using execute_sql function
    const { error } = await supabaseAdmin.rpc('execute_sql', {
      sql_query: 'CREATE TABLE IF NOT EXISTS test_table (id serial primary key, name text)'
    });
    
    if (error) {
      console.error(`❌ execute_sql function error: ${error.message}`.red);
      return false;
    }
    
    console.log('✅ execute_sql function is working correctly'.green);
    
    // Clean up test table
    await supabaseAdmin.rpc('execute_sql', {
      sql_query: 'DROP TABLE IF EXISTS test_table'
    });
    
    return true;
  } catch (err) {
    console.error(`❌ execute_sql function error: ${err.message}`.red);
    return false;
  }
}

// Function to verify the execute_sql_with_results function
async function verifyExecuteSqlWithResults() {
  console.log('\nTesting execute_sql_with_results function...'.yellow);
  
  try {
    // Test using execute_sql_with_results function
    const { data, error } = await supabaseAdmin.rpc('execute_sql_with_results', {
      sql_query: 'SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\' LIMIT 5'
    });
    
    if (error) {
      console.error(`❌ execute_sql_with_results function error: ${error.message}`.red);
      return false;
    }
    
    if (!data || data.length === 0) {
      console.log('⚠️ execute_sql_with_results returned no data, but function is working'.yellow);
    } else {
      console.log('Tables found:', data.map(item => item.table_name).join(', '));
    }
    
    console.log('✅ execute_sql_with_results function is working correctly'.green);
    return true;
  } catch (err) {
    console.error(`❌ execute_sql_with_results function error: ${err.message}`.red);
    return false;
  }
}

// Function to verify anonymous access
async function verifyAnonAccess() {
  console.log('\nTesting anonymous client access...'.yellow);
  
  try {
    const { data, error } = await supabaseAnon.from('dental_procedures_simplified').select('*').limit(1);
    
    if (error) {
      console.error(`❌ Anonymous access error: ${error.message}`.red);
      return false;
    }
    
    if (!data || data.length === 0) {
      console.log('⚠️ No data found in dental_procedures_simplified table, but access is working'.yellow);
    } else {
      console.log(`✅ Successfully retrieved ${data.length} record(s) using anonymous access`.green);
    }
    
    return true;
  } catch (err) {
    console.error(`❌ Anonymous access error: ${err.message}`.red);
    return false;
  }
}

// Function to verify admin access
async function verifyAdminAccess() {
  console.log('\nTesting admin client access...'.yellow);
  
  try {
    const { data, error } = await supabaseAdmin.from('dental_procedures_simplified').select('*').limit(1);
    
    if (error) {
      console.error(`❌ Admin access error: ${error.message}`.red);
      return false;
    }
    
    if (!data || data.length === 0) {
      console.log('⚠️ No data found in dental_procedures_simplified table, but access is working'.yellow);
    } else {
      console.log(`✅ Successfully retrieved ${data.length} record(s) using admin access`.green);
    }
    
    return true;
  } catch (err) {
    console.error(`❌ Admin access error: ${err.message}`.red);
    return false;
  }
}

// Function to check RLS policies
async function checkRlsPolicies() {
  console.log('\nChecking RLS policies...'.yellow);
  
  try {
    const { data, error } = await supabaseAdmin.rpc('execute_sql_with_results', {
      sql_query: `
        SELECT tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
        ORDER BY tablename
      `
    });
    
    if (error) {
      console.error(`❌ Error checking RLS policies: ${error.message}`.red);
      return false;
    }
    
    if (!data || data.length === 0) {
      console.log('⚠️ No RLS policies found in the database'.yellow);
      return false;
    }
    
    console.log('✅ Found RLS policies:'.green);
    const tablesPolicies = {};
    
    data.forEach(row => {
      if (!tablesPolicies[row.tablename]) {
        tablesPolicies[row.tablename] = [];
      }
      tablesPolicies[row.tablename].push(row.policyname);
    });
    
    for (const [table, policies] of Object.entries(tablesPolicies)) {
      console.log(`   - ${table}: ${policies.join(', ')}`.cyan);
    }
    
    return true;
  } catch (err) {
    console.error(`❌ Error checking RLS policies: ${err.message}`.red);
    return false;
  }
}

// Main function to verify everything
async function verifyAllFunctionality() {
  const results = {
    executeSql: await verifyExecuteSql(),
    executeSqlWithResults: await verifyExecuteSqlWithResults(),
    anonAccess: await verifyAnonAccess(),
    adminAccess: await verifyAdminAccess(),
    rlsPolicies: await checkRlsPolicies()
  };
  
  // Display summary
  console.log('\n=================================================='.cyan);
  console.log('📊 VERIFICATION SUMMARY'.brightWhite.bold);
  console.log('==================================================\n'.cyan);
  
  console.log(`execute_sql function: ${results.executeSql ? '✅' : '❌'}`);
  console.log(`execute_sql_with_results function: ${results.executeSqlWithResults ? '✅' : '❌'}`);
  console.log(`Anonymous client access: ${results.anonAccess ? '✅' : '❌'}`);
  console.log(`Admin client access: ${results.adminAccess ? '✅' : '❌'}`);
  console.log(`RLS policies: ${results.rlsPolicies ? '✅' : '❌'}`);
  
  const allSucceeded = Object.values(results).every(result => result === true);
  
  console.log('\n=================================================='.cyan);
  
  if (allSucceeded) {
    console.log('✅ ALL FUNCTIONALITY VERIFIED SUCCESSFULLY'.green.bold);
    console.log('\nYour Supabase database is configured correctly!'.green);
  } else {
    console.log('⚠️ SOME VERIFICATIONS FAILED'.yellow.bold);
    console.log('\nThere are still issues with your Supabase configuration.'.yellow);
    
    // Provide recommendations based on what failed
    console.log('\nRecommended actions:'.cyan);
    
    if (!results.executeSql || !results.executeSqlWithResults) {
      console.log('- Re-run fix-sql-functions.js to recreate the SQL utility functions'.gray);
    }
    
    if (!results.adminAccess) {
      console.log('- Check your SUPABASE_SERVICE_KEY in the .env file'.gray);
      console.log('- Run update-service-key.js if you need to update the service key'.gray);
    }
    
    if (!results.anonAccess) {
      console.log('- Check your SUPABASE_ANON_KEY in the .env file'.gray);
      console.log('- Verify RLS policies are set up correctly'.gray);
    }
    
    if (!results.rlsPolicies) {
      console.log('- Run src/services/supabase/runSetupRls.js to configure RLS policies'.gray);
    }
  }
  console.log('==================================================\n'.cyan);
  
  const endTimestamp = new Date().toLocaleString();
  console.log(`Verification completed at: ${endTimestamp}`.gray);
}

// Run the verification
verifyAllFunctionality().catch(err => {
  console.error(`\n❌ Unexpected error: ${err.message}`.red);
  console.error(err);
});
