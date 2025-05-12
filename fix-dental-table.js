// This script fixes the dental_procedures_simplified table by recreating it with
// columns that match our data structure
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
  success: (msg) => console.log(`${colors.green}${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}${msg}${colors.reset}`),
  title: (msg) => console.log(`\n${colors.blue}==========================================\n${colors.white}${msg}${colors.reset}\n${colors.blue}==========================================\n`)
};

// Load environment variables
dotenv.config();

// Get Supabase credentials
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

// Main function
async function main() {
  log.title("FIXING DENTAL PROCEDURES TABLE SCHEMA");

  // Check environment variables
  if (!supabaseUrl || !supabaseKey) {
    log.error("❌ Missing Supabase credentials! Check your .env file.");
    process.exit(1);
  }
  
  log.success("✓ Supabase credentials found");

  // Initialize Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);

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

  // Step 1: Drop the existing table if it exists
  log.info("Dropping existing dental_procedures_simplified table...");
  try {
    const { error } = await supabase.rpc('execute_sql', { 
      sql_query: 'DROP TABLE IF EXISTS public.dental_procedures_simplified CASCADE;' 
    }).catch(() => {
      // Function might not exist, try direct SQL
      return supabase.from('sql_query').select('*').limit(1);
    });
    
    if (error) {
      log.warning(`⚠️ Could not drop table using RPC: ${error.message}`);
      log.info("Will continue with direct SQL execution");
    } else {
      log.success("✓ Successfully dropped the table");
    }
  } catch (err) {
    log.warning(`⚠️ Error during drop table: ${err.message}`);
    log.info("Will try to continue anyway");
  }

  // Step 2: Create a new table with correct columns that match our data
  log.info("Creating new dental_procedures_simplified table...");
  
  const createTableSQL = `
  CREATE TABLE IF NOT EXISTS public.dental_procedures_simplified (
    id SERIAL PRIMARY KEY,
    procedure_name TEXT NOT NULL,
    category TEXT NOT NULL,
    yearly_growth_percentage NUMERIC(5,2) NOT NULL,
    market_size_2025_usd_millions NUMERIC(5,2) NOT NULL,
    primary_age_group TEXT NOT NULL,
    trends TEXT NOT NULL,
    future_outlook TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Enable RLS
  ALTER TABLE public.dental_procedures_simplified ENABLE ROW LEVEL SECURITY;

  -- Create policy for read access
  CREATE POLICY "Allow public read for dental_procedures_simplified" 
  ON public.dental_procedures_simplified 
  FOR SELECT TO anon USING (true);
  `;
  
  try {
    const { error } = await supabase.rpc('execute_sql', { 
      sql_query: createTableSQL 
    }).catch(() => {
      return { error: { message: "RPC not available" } };
    });
    
    if (error) {
      log.warning(`⚠️ Could not create table using RPC: ${error.message}`);
      log.info("Attempting to split and execute SQL directly...");
      
      // Try executing each statement separately
      const statements = createTableSQL.split(';').filter(s => s.trim().length > 0);
      
      for (const stmt of statements) {
        const { error: stmtError } = await supabase.rpc('execute_sql', { 
          sql_query: stmt + ';' 
        }).catch(() => {
          return { error: { message: "RPC not available for statement" } };
        });
        
        if (stmtError) {
          log.warning(`⚠️ Error executing statement: ${stmtError.message}`);
          log.warning(`Statement: ${stmt}`);
        } else {
          log.info("✓ Successfully executed statement");
        }
      }
    } else {
      log.success("✓ Successfully created new table");
    }
  } catch (err) {
    log.error(`❌ Error creating table: ${err.message}`);
    log.error("Cannot continue without the table");
    process.exit(1);
  }

  // Step 3: Populate the table with our data
  log.info("Populating dental_procedures_simplified with data...");
  
  if (!dentalProcedures || !Array.isArray(dentalProcedures)) {
    log.error("❌ Could not find dental procedures data");
    process.exit(1);
  }
  
  log.info(`Found ${dentalProcedures.length} dental procedures to insert`);
  
  // Map our data to the new table structure
  const procedures = dentalProcedures.map(proc => {
    return {
      procedure_name: proc.name,
      category: proc.category,
      yearly_growth_percentage: proc.growth,
      market_size_2025_usd_millions: proc.marketSize2025,
      primary_age_group: proc.primaryAgeGroup,
      trends: proc.trends,
      future_outlook: proc.futureOutlook
    };
  });
  
  // Insert the data in batches
  const batchSize = 10;
  let successCount = 0;
  
  for (let i = 0; i < procedures.length; i += batchSize) {
    const batch = procedures.slice(i, i + batchSize);
    const { error } = await supabase.from('dental_procedures_simplified').insert(batch);
    
    if (error) {
      log.error(`❌ Error inserting batch: ${error.message}`);
      
      // Try one by one
      for (const proc of batch) {
        const { error: singleError } = await supabase.from('dental_procedures_simplified').insert([proc]);
        if (singleError) {
          log.error(`❌ Could not insert procedure "${proc.procedure_name}": ${singleError.message}`);
        } else {
          log.success(`✓ Inserted "${proc.procedure_name}"`);
          successCount++;
        }
      }
    } else {
      log.success(`✓ Inserted batch of ${batch.length} procedures`);
      successCount += batch.length;
    }
  }
  
  log.info(`\nInserted ${successCount} out of ${procedures.length} dental procedures`);
  
  // Final verification
  const { data: verifyData, error: verifyError, count } = await supabase
    .from('dental_procedures_simplified')
    .select('*', { count: 'exact' });
  
  if (verifyError) {
    log.error(`❌ Error verifying data: ${verifyError.message}`);
  } else {
    log.success(`✓ Table dental_procedures_simplified now has ${count} records`);
    
    if (count > 0) {
      log.info("Sample record:");
      console.log(verifyData[0]);
    }
  }
  
  log.title("DENTAL PROCEDURES TABLE FIX COMPLETE");
  log.info("You should now be able to run your data refresh scripts successfully.");
  log.info("Try running: node fix-and-refresh-data.js");
}

// Start the process
main().catch((err) => {
  log.error(`Unexpected error: ${err.message}`);
  console.error(err);
  process.exit(1);
});
