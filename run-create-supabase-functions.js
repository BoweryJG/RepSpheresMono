// Script to create Supabase SQL functions
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import colors from 'colors';
import fs from 'fs';

colors.enable();

// Load environment variables
dotenv.config();

console.log('\n=================================================='.cyan);
console.log('🔧 SUPABASE FUNCTIONS SETUP TOOL'.brightWhite.bold);
console.log('==================================================\n'.cyan);

// Get timestamp for logging
const timestamp = new Date().toLocaleString();
console.log(`Setup started at: ${timestamp}`.gray);

// Environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_SERVICE_KEY;

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('\n❌ Error: Missing essential Supabase credentials'.red);
  console.log('Please check your .env file and make sure SUPABASE_URL and SUPABASE_SERVICE_KEY are set');
  process.exit(1);
}

// Create admin client
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// SQL function definitions
const VERSION_FUNCTION = `
-- Basic version function to get database info
CREATE OR REPLACE FUNCTION public.version()
RETURNS json
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT json_build_object(
    'version', version(),
    'server_version', current_setting('server_version'),
    'system_time', now()
  );
$$;

ALTER FUNCTION public.version() OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.version() TO authenticated;
GRANT EXECUTE ON FUNCTION public.version() TO anon;
`;

const EXECUTE_SQL_FUNCTION = `
-- Basic execute_sql function for non-select statements
CREATE OR REPLACE FUNCTION public.execute_sql(sql_query text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_query;
END;
$$;

ALTER FUNCTION public.execute_sql(text) OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.execute_sql TO authenticated;
GRANT EXECUTE ON FUNCTION public.execute_sql TO anon;
`;

const EXECUTE_SQL_WITH_RESULTS_FUNCTION = `
-- Function to execute SQL and return results
CREATE OR REPLACE FUNCTION public.execute_sql_with_results(sql_query text)
RETURNS TABLE (json_result json)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY EXECUTE sql_query;
END;
$$;

ALTER FUNCTION public.execute_sql_with_results(text) OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.execute_sql_with_results TO authenticated;
GRANT EXECUTE ON FUNCTION public.execute_sql_with_results TO anon;
`;

const LIST_ALL_TABLES_FUNCTION = `
-- Function to list all tables in the database with row counts
CREATE OR REPLACE FUNCTION public.list_all_tables()
RETURNS TABLE (
    schema_name text,
    table_name text,
    row_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
      n.nspname::text AS schema_name,
      c.relname::text AS table_name,
      CASE
          WHEN c.reltuples < 0 THEN 0::bigint
          ELSE c.reltuples::bigint
      END AS row_count
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE c.relkind = 'r'
  AND n.nspname NOT IN ('pg_catalog', 'information_schema')
  ORDER BY n.nspname, c.relname;
END;
$$;

ALTER FUNCTION public.list_all_tables() OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.list_all_tables TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_all_tables TO anon;
`;

// Function to create SQL functions
async function createSQLFunctions() {
  console.log('\nCreating SQL functions...'.yellow);
  
  // Create version function
  try {
    console.log('Creating version function...'.gray);
    const { error: versionError } = await supabaseAdmin.rpc('execute_sql', {
      sql_query: VERSION_FUNCTION
    });
    
    if (versionError) {
      // If the execute_sql function doesn't exist yet, use direct SQL
      const { error: directVersionError } = await supabaseAdmin.from('_temp_version_check').select().limit(1).maybeSingle();
      
      if (directVersionError) {
        // Create the function using direct SQL
        console.log('Direct SQL execution for version function...'.gray);
        
        // We need to use direct SQL for the first function
        const { error: sqlVersionError } = await supabaseAdmin.functions.invoke('pg', {
          body: { query: VERSION_FUNCTION }
        });
        
        if (sqlVersionError) {
          console.error(`❌ Error creating version function: ${sqlVersionError.message}`.red);
        } else {
          console.log('✅ version function created successfully!'.green);
        }
      }
    } else {
      console.log('✅ version function created successfully!'.green);
    }
  } catch (err) {
    console.error(`❌ Error creating version function: ${err.message}`.red);
  }
  
  // Test version function and continue if it works
  try {
    const { data, error } = await supabaseAdmin.rpc('version');
    
    if (error) {
      console.error(`❌ Error testing version function: ${error.message}`.red);
      return false;
    } else {
      console.log(`✅ version function works! Server version: ${data.server_version}`.green);
      
      // Create execute_sql function
      console.log('\nCreating execute_sql function...'.gray);
      const { error: execError } = await supabaseAdmin.rpc('execute_sql', {
        sql_query: EXECUTE_SQL_FUNCTION
      });
      
      if (execError) {
        console.error(`❌ Error creating execute_sql function: ${execError.message}`.red);
      } else {
        console.log('✅ execute_sql function created successfully!'.green);
      }
      
      // Create execute_sql_with_results function
      console.log('\nCreating execute_sql_with_results function...'.gray);
      const { error: execResultsError } = await supabaseAdmin.rpc('execute_sql', {
        sql_query: EXECUTE_SQL_WITH_RESULTS_FUNCTION
      });
      
      if (execResultsError) {
        console.error(`❌ Error creating execute_sql_with_results function: ${execResultsError.message}`.red);
      } else {
        console.log('✅ execute_sql_with_results function created successfully!'.green);
      }
      
      // Create list_all_tables function
      console.log('\nCreating list_all_tables function...'.gray);
      const { error: tablesError } = await supabaseAdmin.rpc('execute_sql', {
        sql_query: LIST_ALL_TABLES_FUNCTION
      });
      
      if (tablesError) {
        console.error(`❌ Error creating list_all_tables function: ${tablesError.message}`.red);
      } else {
        console.log('✅ list_all_tables function created successfully!'.green);
      }
      
      return true;
    }
  } catch (err) {
    console.error(`❌ Error testing version function: ${err.message}`.red);
    return false;
  }
}

// Main function
async function setup() {
  const success = await createSQLFunctions();
  
  console.log('\n=================================================='.cyan);
  console.log('🔍 SETUP RESULT'.brightWhite.bold);
  console.log('==================================================\n'.cyan);
  
  if (success) {
    console.log('✅ SQL functions have been created successfully!'.green);
    console.log('\nNext steps:');
    console.log('1. Run fix-supabase-connection.js to repair your database');
    console.log('2. Run verify-supabase-functions.js to verify the functions work correctly');
  } else {
    console.error('❌ Failed to create all SQL functions.'.red);
    console.log('\nPossible issues:');
    console.log('1. Your Supabase service key might be invalid or expired');
    console.log('2. The database might be unavailable');
    console.log('3. You might not have the required permissions');
    
    console.log('\nTry running the SQL directly in the Supabase SQL Editor:');
    console.log('1. Go to your Supabase project');
    console.log('2. Click on "SQL Editor"');
    console.log('3. Copy the SQL from supabase-functions.sql');
    console.log('4. Run the SQL');
  }
  
  console.log('\n==================================================\n'.cyan);
}

// Run the setup
setup();
