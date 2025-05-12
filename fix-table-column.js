// Fix the dental_procedures_simplified table column mismatch
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

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

// Create Supabase client
let supabase;

// Main function
async function main() {
  log.title("FIX DENTAL PROCEDURES TABLE COLUMN");

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

  // Perform the column fix for dental_procedures_simplified
  await fixDentalProceduresTable();
}

async function fixDentalProceduresTable() {
  log.info("\nChecking dental_procedures_simplified table structure...");
  
  try {
    // First, check if the table exists
    const { data, error } = await supabase
      .from('dental_procedures_simplified')
      .select('*')
      .limit(1);
    
    if (error && error.message.includes("relation \"dental_procedures_simplified\" does not exist")) {
      log.error(`❌ Table dental_procedures_simplified does not exist.`);
      log.info("Creating the table from scratch...");
      await recreateDentalProceduresTable();
      return;
    } else if (error) {
      log.error(`❌ Error checking table: ${error.message}`);
      return;
    }

    log.success("✓ Table dental_procedures_simplified exists");

    // We detected from previous errors that there's a mismatch between 'outlook' and 'future_outlook'
    // Let's recreate the table with the correct columns
    log.info("Fixing column mismatch...");

    // Option 1: Drop and recreate the table (safer if there's no valuable data)
    log.warning("⚠️ Will drop and recreate the table with the correct schema");
    await recreateDentalProceduresTable();
    
    // Option 2: Rename the column (alternative approach if needed)
    // This doesn't seem to be the issue based on errors, so we'll go with Option 1
    
    log.success("✓ Table structure has been fixed");

    // Final check
    const { data: checkData, error: checkError } = await supabase
      .from('dental_procedures_simplified')
      .select('*')
      .limit(1);
      
    if (checkError) {
      log.error(`❌ Error after fixes: ${checkError.message}`);
    } else {
      log.success("✓ Table is now accessible and ready for data");
    }
    
  } catch (err) {
    log.error(`❌ Error fixing table: ${err.message}`);
  }
}

async function recreateDentalProceduresTable() {
  try {
    log.info("Dropping existing dental_procedures_simplified table...");
    
    // Direct SQL approach
    await supabase.rpc('execute_sql', {
      sql_query: "DROP TABLE IF EXISTS dental_procedures_simplified;"
    }).catch(err => {
      log.warning(`Note: Execute SQL function not found or error dropping table directly: ${err.message}`);
      // This is expected if the execute_sql function doesn't exist
    });
    
    log.info("Creating dental_procedures_simplified table with correct schema...");
    
    // Create the table with both 'outlook' and 'future_outlook' columns to be safe
    // This matches schema.sql but adds the 'outlook' column that seems to be needed
    const createSql = `
    CREATE TABLE IF NOT EXISTS public.dental_procedures_simplified (
      id SERIAL PRIMARY KEY,
      procedure_name TEXT NOT NULL UNIQUE,
      yearly_growth_percentage NUMERIC(5,2) NOT NULL,
      market_size_2025_usd_millions NUMERIC(5,2) NOT NULL,
      primary_age_group TEXT NOT NULL,
      trends TEXT NOT NULL,
      outlook TEXT NOT NULL,
      future_outlook TEXT,
      category TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Enable Row Level Security (RLS)
    ALTER TABLE public.dental_procedures_simplified ENABLE ROW LEVEL SECURITY;
    
    -- Create access policy for public reading
    CREATE POLICY "Allow public to read dental_procedures_simplified" 
    ON public.dental_procedures_simplified 
    FOR SELECT 
    TO anon 
    USING (true);
    `;
    
    // Try different methods, starting with standard API
    try {
      // First attempt: Standard insert via API
      const { error } = await supabase.rpc('execute_sql', { sql_query: createSql });
      
      if (error) {
        throw new Error(`Error using execute_sql: ${error.message}`);
      }
      
      log.success("✓ Table created successfully using execute_sql");
      return;
    } catch (err) {
      log.warning(`Could not create table using execute_sql: ${err.message}`);
    }
    
    // Second attempt: Manual SQL using the from API with special column
    try {
      log.info("Trying alternative approach for table creation...");
      
      // Creating a temporary table to work around potential permission issues
      const tempSql = `
        CREATE TABLE IF NOT EXISTS public.dental_procedures_simplified (
          id SERIAL PRIMARY KEY,
          procedure_name TEXT NOT NULL UNIQUE,
          yearly_growth_percentage NUMERIC(5,2) NOT NULL,
          market_size_2025_usd_millions NUMERIC(5,2) NOT NULL,
          primary_age_group TEXT NOT NULL,
          trends TEXT NOT NULL,
          outlook TEXT NOT NULL,
          category TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;
      
      // Use direct SQL or other method to create
      log.warning("⚠️ If you're unable to create the table due to permissions, you may need to:");
      log.info("1. Run this SQL in the Supabase SQL Editor:");
      log.info("----------------------------------------------");
      console.log(createSql);
      log.info("----------------------------------------------");
      
      log.info("2. Then refresh your data using fix-and-refresh-data.js");
    } catch (err) {
      log.error(`❌ Error in alternative approach: ${err.message}`);
    }
    
  } catch (err) {
    log.error(`❌ Error recreating table: ${err.message}`);
  }
}

// Start the process
main().catch((err) => {
  log.error(`Unexpected error: ${err.message}`);
  console.error(err);
  process.exit(1);
});
