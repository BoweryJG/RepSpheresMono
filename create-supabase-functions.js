// Create the necessary Supabase functions
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configure colored console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

const log = {
  info: (msg) => console.log(`${colors.cyan}${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}${msg}${colors.reset}`),
  title: (msg) => console.log(`\n${colors.blue}==========================================\n${colors.white}${msg}${colors.reset}\n${colors.blue}==========================================\n`)
};

// Load environment variables
dotenv.config();

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get Supabase credentials
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseKey) {
  console.error(`${colors.red}❌ Missing SUPABASE_SERVICE_KEY in .env file!${colors.reset}`);
  console.log(`${colors.yellow}This script requires the service role key, not the anon key.${colors.reset}`);
  process.exit(1);
}

// Create Supabase client
let supabase;

// Main function
async function main() {
  log.title("CREATING SUPABASE FUNCTIONS");

  // Check environment variables
  if (!supabaseUrl || !supabaseKey) {
    log.error("❌ Missing Supabase credentials! Check your .env file.");
    process.exit(1);
  }
  
  log.success("✓ Supabase credentials found");

  // Initialize Supabase client
  supabase = createClient(supabaseUrl, supabaseKey);

  // Check connection
  log.info("Checking Supabase connection...");
  
  try {
    const { data, error } = await supabase.from('companies').select('*').limit(1);
    
    if (error) {
      log.error(`❌ Connection error: ${error.message}`);
      log.error("Cannot proceed without database connection");
      process.exit(1);
    }
    
    log.success("✓ Successfully connected to Supabase");
  } catch (err) {
    log.error(`❌ Connection error: ${err.message}`);
    log.error("Cannot proceed without database connection");
    process.exit(1);
  }

  // Create the execute_sql function
  await createExecuteSqlFunction();
  
  // Create the list_all_tables function
  await createListAllTablesFunction();
}

// Function to create the execute_sql function in Supabase
async function createExecuteSqlFunction() {
  log.info("\nCreating execute_sql function...");
  
  try {
    // Check if the function already exists
    const { data, error } = await supabase.rpc('execute_sql', {
      sql_query: 'SELECT 1 as test;'
    });
    
    if (!error) {
      log.success("✓ execute_sql function already exists");
      return;
    }
    
    // Function doesn't exist or has an error, create it
    const sql = `
    CREATE OR REPLACE FUNCTION public.execute_sql(sql_query text)
    RETURNS JSONB
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    DECLARE
        result JSONB;
    BEGIN
        EXECUTE sql_query INTO result;
        RETURN result;
    EXCEPTION WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'error', SQLERRM,
            'detail', SQLSTATE,
            'query', sql_query
        );
    END;
    $$;

    -- Grant access to authenticated and anonymous users
    GRANT EXECUTE ON FUNCTION public.execute_sql TO authenticated;
    GRANT EXECUTE ON FUNCTION public.execute_sql TO anon;
    `;
    
    // Execute the SQL directly
    const { error: createError } = await supabase.rpc('exec_sql', { sql });
    
    if (createError) {
      // Try a different approach if the first one fails
      log.warning(`First approach failed: ${createError.message}`);
      log.info("Trying alternative approach...");
      
      // Try direct SQL (this will only work with service_role key, which we don't have here)
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          },
          body: JSON.stringify({ sql })
        });
        
        if (!response.ok) {
          log.error(`Second approach failed: ${response.statusText}`);
          log.warning("Could not create execute_sql function. You may need to create it manually.");
          log.info("SQL for execute_sql function:");
          console.log(sql);
          return;
        }
        
        log.success("✓ execute_sql function created successfully (second approach)");
      } catch (err) {
        log.error(`Error in second approach: ${err.message}`);
        log.warning("Could not create execute_sql function. You may need to create it manually.");
        log.info("SQL for execute_sql function:");
        console.log(sql);
      }
      
      return;
    }
    
    log.success("✓ execute_sql function created successfully");
    
    // Verify the function works
    const testResult = await supabase.rpc('execute_sql', {
      sql_query: 'SELECT 1 as test;'
    });
    
    if (testResult.error) {
      log.warning(`Function created but test failed: ${testResult.error.message}`);
    } else {
      log.success("✓ execute_sql function verified working");
    }
  } catch (err) {
    log.error(`❌ Error creating execute_sql function: ${err.message}`);
  }
}

// Function to create the list_all_tables function in Supabase
async function createListAllTablesFunction() {
  log.info("\nCreating list_all_tables function...");
  
  try {
    // Check if the function already exists
    const { data, error } = await supabase.rpc('list_all_tables');
    
    if (!error) {
      log.success("✓ list_all_tables function already exists");
      return;
    }
    
    // Function doesn't exist or has an error, create it
    const sql = `
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
            n.nspname AS schema_name,
            c.relname AS table_name,
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

    -- Grant access to authenticated and anonymous users
    GRANT EXECUTE ON FUNCTION public.list_all_tables TO authenticated;
    GRANT EXECUTE ON FUNCTION public.list_all_tables TO anon;
    `;
    
    // Try to use execute_sql function if it exists
    const { error: createError } = await supabase.rpc('execute_sql', {
      sql_query: sql
    });
    
    if (createError) {
      log.warning(`First approach failed: ${createError.message}`);
      
      // Try direct SQL (this will only work with service_role key, which we don't have here)
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          },
          body: JSON.stringify({ sql })
        });
        
        if (!response.ok) {
          log.error(`Second approach failed: ${response.statusText}`);
          log.warning("Could not create list_all_tables function. You may need to create it manually.");
          log.info("SQL for list_all_tables function:");
          console.log(sql);
          return;
        }
        
        log.success("✓ list_all_tables function created successfully (second approach)");
      } catch (err) {
        log.error(`Error in second approach: ${err.message}`);
        log.warning("Could not create list_all_tables function. You may need to create it manually.");
        log.info("SQL for list_all_tables function:");
        console.log(sql);
      }
      
      return;
    }
    
    log.success("✓ list_all_tables function created successfully");
    
    // Verify the function works
    const testResult = await supabase.rpc('list_all_tables');
    
    if (testResult.error) {
      log.warning(`Function created but test failed: ${testResult.error.message}`);
    } else {
      log.success("✓ list_all_tables function verified working");
    }
  } catch (err) {
    log.error(`❌ Error creating list_all_tables function: ${err.message}`);
  }
}

// Start the process
main().catch((err) => {
  log.error(`Unexpected error: ${err.message}`);
  console.error(err);
  process.exit(1);
});
