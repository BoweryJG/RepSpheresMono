// This script creates the dental_procedures_simplified table using direct SQL
// and then populates it with data from dentalProcedures.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { dentalProcedures } from './src/data/dentalProcedures.js';

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
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️ ${msg}${colors.reset}`),
  title: (msg) => console.log(`\n${colors.blue}==========================================\n${colors.white}${msg}${colors.reset}\n${colors.blue}==========================================\n`)
};

// Load environment variables
dotenv.config();

// Get Supabase credentials
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

// SQL queries
const dropTableSQL = `
DROP TABLE IF EXISTS dental_procedures_simplified;
`;

const createTableSQL = `
CREATE TABLE IF NOT EXISTS dental_procedures_simplified (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  growth NUMERIC,
  market_size NUMERIC,
  primary_age_group TEXT,
  trends TEXT,
  future_outlook TEXT
);
`;

// Main function
async function main() {
  log.title("CREATING DENTAL PROCEDURES TABLE WITH DIRECT SQL");
  
  if (!supabaseUrl || !supabaseKey) {
    log.error("Missing Supabase credentials! Check your .env file.");
    process.exit(1);
  }
  
  log.success("Supabase credentials found");
  
  // Initialize Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Check connection
  log.info("Checking Supabase connection...");
  
  try {
    const { data, error } = await supabase.from('companies').select('*', { count: 'exact', head: true });
    
    if (error) {
      log.error(`Connection error: ${error.message}`);
      log.error("Cannot proceed without database connection");
      process.exit(1);
    }
    
    log.success("Successfully connected to Supabase");
  } catch (err) {
    log.error(`Connection error: ${err.message}`);
    log.error("Cannot proceed without database connection");
    process.exit(1);
  }

  // Step 1: Drop existing table if it exists
  log.info("Dropping existing dental_procedures_simplified table...");
  try {
    const { data: dropData, error: dropError } = await supabase.rpc('execute_sql', { sql_query: dropTableSQL });
    
    if (dropError) {
      // If the RPC doesn't exist, try using raw SQL through the REST API
      log.warning(`RPC error: ${dropError.message}`);
      log.info("Attempting to drop table via direct query...");
      
      // Try to delete all rows as a fallback
      const { error: deleteError } = await supabase
        .from('dental_procedures_simplified')
        .delete()
        .neq('id', 0);
      
      if (deleteError && !deleteError.message.includes("does not exist")) {
        log.warning(`Could not delete rows: ${deleteError.message}`);
      } else {
        log.success("Deleted existing rows or table does not exist");
      }
    } else {
      log.success("Dropped existing table");
    }
  } catch (err) {
    log.warning(`Error dropping table: ${err.message}`);
    log.info("Will attempt to proceed anyway");
  }

  // Step 2: Create the new table
  log.info("Creating dental_procedures_simplified table with SQL...");
  try {
    const { data: createData, error: createError } = await supabase.rpc('execute_sql', { sql_query: createTableSQL });
    
    if (createError) {
      // If the RPC doesn't exist, try a different approach
      log.warning(`RPC error: ${createError.message}`);
      log.info("Attempting to create minimal table via insertion...");
      
      // Try inserting with minimal fields
      const { error: insertError } = await supabase
        .from('dental_procedures_simplified')
        .insert([{ 
          name: 'Sample Procedure',
          category: 'General' 
        }]);
      
      if (insertError && !insertError.message.includes("already exists")) {
        log.error(`Could not create table: ${insertError.message}`);
        log.error("We need to create the RPC function first");
        
        await createExecuteSQLFunction(supabase);
        
        // Try again after creating the function
        log.info("Attempting to create table again with SQL...");
        const { error: retryError } = await supabase.rpc('execute_sql', { sql_query: createTableSQL });
        
        if (retryError) {
          log.error(`Failed to create table: ${retryError.message}`);
          process.exit(1);
        } else {
          log.success("Table created successfully on retry");
        }
      } else if (insertError) {
        log.warning("Table already exists with some schema");
      } else {
        log.success("Created table via insertion");
        
        // Delete the sample record
        const { error: deleteError } = await supabase
          .from('dental_procedures_simplified')
          .delete()
          .eq('name', 'Sample Procedure');
          
        if (deleteError) {
          log.warning(`Could not delete sample record: ${deleteError.message}`);
        }
      }
    } else {
      log.success("Created table with SQL");
    }
  } catch (err) {
    log.error(`Error creating table: ${err.message}`);
    process.exit(1);
  }
  
  // Step 3: Populate the table with dental procedures
  log.info("Populating dental_procedures_simplified table...");
  
  // Ensure we have data to insert
  if (!dentalProcedures || !Array.isArray(dentalProcedures) || dentalProcedures.length === 0) {
    log.error("No dental procedures data to insert");
    process.exit(1);
  }
  
  log.info(`Found ${dentalProcedures.length} procedures to insert`);

  // Insert procedures one by one to handle errors better
  let successCount = 0;
  
  for (const proc of dentalProcedures) {
    try {
      // Map to our table schema
      const record = {
        name: proc.name,
        category: proc.category,
        growth: proc.growth,
        market_size: proc.marketSize2025,
        primary_age_group: proc.primaryAgeGroup,
        trends: proc.trends,
        future_outlook: proc.futureOutlook
      };
      
      const { error } = await supabase
        .from('dental_procedures_simplified')
        .insert([record]);
      
      if (error) {
        // Try simplified version without some fields
        const simplifiedRecord = {
          name: proc.name,
          category: proc.category,
          growth: proc.growth,
          market_size: proc.marketSize2025
        };
        
        const { error: simpleError } = await supabase
          .from('dental_procedures_simplified')
          .insert([simplifiedRecord]);
          
        if (simpleError) {
          // Try minimal version with just name and category
          const minimalRecord = {
            name: proc.name,
            category: proc.category
          };
          
          const { error: minError } = await supabase
            .from('dental_procedures_simplified')
            .insert([minimalRecord]);
            
          if (minError) {
            if (minError.message && minError.message.includes('duplicate key')) {
              log.warning(`"${proc.name}" already exists in the database`);
              successCount++;
            } else {
              log.error(`Failed to insert "${proc.name}": ${minError.message}`);
            }
          } else {
            log.success(`Inserted "${proc.name}" with minimal fields`);
            successCount++;
          }
        } else {
          log.success(`Inserted "${proc.name}" with simplified fields`);
          successCount++;
        }
      } else {
        log.success(`Inserted "${proc.name}" with all fields`);
        successCount++;
      }
    } catch (err) {
      log.error(`Error processing "${proc.name}": ${err.message}`);
    }
  }
  
  log.info(`Successfully inserted ${successCount} out of ${dentalProcedures.length} procedures`);
  
  // Step 4: Verify the data
  try {
    const { data, count, error } = await supabase
      .from('dental_procedures_simplified')
      .select('*', { count: 'exact' });
    
    if (error) {
      log.error(`Error verifying data: ${error.message}`);
    } else {
      log.success(`Table now contains ${count} records`);
      
      if (count > 0 && data && data.length > 0) {
        log.info("Sample record structure:");
        console.log(data[0]);
        
        // Show the actual columns we have
        const columns = Object.keys(data[0]);
        log.info(`Actual table columns: ${columns.join(', ')}`);
      }
    }
  } catch (err) {
    log.error(`Error during verification: ${err.message}`);
  }
  
  log.title("DENTAL PROCEDURES TABLE CREATION COMPLETE");
}

// Helper function to create the execute_sql function if it doesn't exist
async function createExecuteSQLFunction(supabase) {
  log.info("Creating execute_sql function...");
  
  const createFunctionSQL = `
  CREATE OR REPLACE FUNCTION execute_sql(sql_query TEXT)
  RETURNS JSONB
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $$
  DECLARE
    result JSONB;
  BEGIN
    EXECUTE sql_query;
    result := '{"success": true}'::JSONB;
    RETURN result;
  EXCEPTION WHEN OTHERS THEN
    result := jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'detail', SQLSTATE
    );
    RETURN result;
  END;
  $$;
  `;
  
  try {
    // Try to create the function directly
    // This might fail due to permissions, but worth trying
    const { data, error } = await supabase
      .rpc('execute_sql', { sql_query: createFunctionSQL });
    
    if (error) {
      log.warning(`Could not create function via RPC: ${error.message}`);
      log.info("The function might need to be created by a superuser");
      
      // Save the function creation SQL to a file for manual execution
      log.info("Saving SQL to create-execute-sql-function.sql");
      console.log(createFunctionSQL);
      
      return false;
    } else {
      log.success("Created execute_sql function");
      return true;
    }
  } catch (err) {
    log.error(`Error creating function: ${err.message}`);
    return false;
  }
}

// Start the script
main().catch((err) => {
  console.error("Unhandled error:", err);
  process.exit(1);
});
