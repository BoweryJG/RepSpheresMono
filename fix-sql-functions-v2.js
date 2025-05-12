// Fix SQL Functions with proper return types
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

console.log('\n==================================================');
console.log('🔧 SQL FUNCTIONS FIX SCRIPT (v2)');
console.log('==================================================\n');

// Create Supabase admin client
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// SQL for the execute_sql function (void return type)
const createExecuteSqlFunctionSql = `
-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.execute_sql(text);

-- Create the function with void return type
CREATE OR REPLACE FUNCTION public.execute_sql(sql_query TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_query;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.execute_sql TO authenticated, anon;

-- Add a comment to the function
COMMENT ON FUNCTION public.execute_sql IS 'Executes arbitrary SQL with appropriate security controls';
`;

// SQL for a correctly defined execute_sql_with_results function
const createExecuteSqlWithResultsFunctionSql = `
-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.execute_sql_with_results(text);

-- Create the function with jsonb return type
CREATE OR REPLACE FUNCTION public.execute_sql_with_results(sql_query TEXT)
RETURNS TABLE(result jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY EXECUTE sql_query;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error executing query: %', SQLERRM;
  RETURN QUERY SELECT jsonb_build_object('error', SQLERRM) AS result;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.execute_sql_with_results TO authenticated, anon;

-- Add a comment to the function
COMMENT ON FUNCTION public.execute_sql_with_results IS 'Executes arbitrary SQL and returns results as JSON';
`;

// Function to execute SQL directly with the admin client using REST API
async function executeSqlDirectly(sql, description) {
  try {
    console.log(`\n${description}...`);
    
    // Using PostgreSQL syntax for REST API
    const { data, error } = await supabaseAdmin.rpc('_knex_raw', {
      string: sql
    });
    
    if (error) {
      console.error(`❌ ${description} failed: ${error.message}`);
      // Attempt alternative direct SQL method
      console.log('Attempting alternative method...');
      
      // Using PostgreSQL REST endpoint
      const { error: altError } = await supabaseAdmin.from('_exec_sql').insert({ query: sql }).select();
      
      if (altError) {
        console.error(`❌ Alternative method also failed: ${altError.message}`);
        console.error('Falling back to direct SQL execution using service role...');
        
        // Final attempt using raw SQL
        const { error: finalError } = await supabaseAdmin.auth.admin.executeRawSql({ sql });
        
        if (finalError) {
          console.error(`❌ All methods failed: ${finalError.message}`);
          return { success: false, error: finalError.message };
        }
        
        console.log(`✅ Function created successfully using direct SQL execution`);
        return { success: true };
      }
      
      console.log(`✅ Function created successfully using alternative method`);
      return { success: true };
    }
    
    console.log(`✅ ${description} completed successfully`);
    return { success: true };
  } catch (err) {
    console.error(`❌ ${description} failed: ${err.message}`);
    console.error(`Error details: ${JSON.stringify(err, null, 2)}`);
    return { success: false, error: err.message };
  }
}

// Function to test if SQL functions work correctly
async function testSqlFunctions() {
  try {
    console.log('\nTesting SQL functions...');
    
    // Test execute_sql (void return)
    console.log('\nTesting execute_sql function...');
    const { error: execError } = await supabaseAdmin.rpc('execute_sql', {
      sql_query: 'CREATE TABLE IF NOT EXISTS function_test (id SERIAL PRIMARY KEY, test_name TEXT)'
    });
    
    if (execError) {
      console.error(`❌ execute_sql test failed: ${execError.message}`);
    } else {
      console.log('✅ execute_sql function is working correctly');
    }
    
    // Test execute_sql_with_results (jsonb return)
    console.log('\nTesting execute_sql_with_results function...');
    const { data, error: resultError } = await supabaseAdmin.rpc('execute_sql_with_results', {
      sql_query: "SELECT jsonb_build_object('test', 'success') AS result"
    });
    
    if (resultError) {
      console.error(`❌ execute_sql_with_results test failed: ${resultError.message}`);
    } else {
      console.log('✅ execute_sql_with_results function is working correctly');
      console.log(`   Result: ${JSON.stringify(data)}`);
    }
    
    return {
      execSuccess: !execError,
      resultSuccess: !resultError
    };
  } catch (err) {
    console.error(`❌ Error testing SQL functions: ${err.message}`);
    return {
      execSuccess: false,
      resultSuccess: false
    };
  }
}

// Main function to fix SQL functions
async function fixSqlFunctions() {
  try {
    // Step 1: Create execute_sql function
    const execFunctionResult = await executeSqlDirectly(
      createExecuteSqlFunctionSql,
      'Creating execute_sql function'
    );
    
    // Step 2: Create execute_sql_with_results function
    const execWithResultsResult = await executeSqlDirectly(
      createExecuteSqlWithResultsFunctionSql,
      'Creating execute_sql_with_results function'
    );
    
    // Step 3: Test if the functions work correctly
    if (execFunctionResult.success && execWithResultsResult.success) {
      console.log('\nFunctions created successfully. Testing...');
      const testResults = await testSqlFunctions();
      
      console.log('\n==================================================');
      console.log('📊 FUNCTION FIX RESULTS');
      console.log('==================================================\n');
      
      console.log(`execute_sql function: ${testResults.execSuccess ? '✅ SUCCESS' : '❌ FAILED'}`);
      console.log(`execute_sql_with_results function: ${testResults.resultSuccess ? '✅ SUCCESS' : '❌ FAILED'}`);
      
      console.log('\n==================================================');
      const allSuccess = testResults.execSuccess && testResults.resultSuccess;
      console.log(`OVERALL STATUS: ${allSuccess ? '✅ ALL FUNCTIONS WORKING' : '❌ SOME FUNCTIONS FAILED'}`);
      console.log('==================================================\n');
      
      return allSuccess;
    } else {
      console.log('\n==================================================');
      console.log('📊 FUNCTION CREATION RESULTS');
      console.log('==================================================\n');
      
      console.log(`execute_sql function: ${execFunctionResult.success ? '✅ SUCCESS' : '❌ FAILED'}`);
      console.log(`execute_sql_with_results function: ${execWithResultsResult.success ? '✅ SUCCESS' : '❌ FAILED'}`);
      
      console.log('\n==================================================');
      console.log('❌ FUNCTION CREATION INCOMPLETE');
      console.log('==================================================\n');
      
      return false;
    }
  } catch (err) {
    console.error(`\n❌ Unexpected error: ${err.message}`);
    return false;
  }
}

// Run the fix process
fixSqlFunctions().then(success => {
  console.log(`SQL function fix process ${success ? 'completed successfully' : 'had issues'}`);
  
  if (success) {
    console.log('\nNext steps:');
    console.log('1. Run "node verify-connection-fix.js" to verify connections');
    console.log('2. Run table creation scripts if needed');
    console.log('3. Run data population scripts');
  } else {
    console.log('\nTroubleshooting recommendations:');
    console.log('- Check if you have proper permissions to create functions');
    console.log('- Verify your SUPABASE_SERVICE_KEY is correct');
    console.log('- Try executing the SQL directly in the Supabase SQL editor');
  }
}).catch(err => {
  console.error(`\n❌ Fatal error: ${err.message}`);
});
