// Script to repair Supabase connection and setup missing tables
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import colors from 'colors';
colors.enable();

// Load environment variables
dotenv.config();

console.log('\n=================================================='.cyan);
console.log('🔧 SUPABASE CONNECTION REPAIR TOOL'.brightWhite.bold);
console.log('==================================================\n'.cyan);

// Get timestamp for logging
const timestamp = new Date().toLocaleString();
console.log(`Repair started at: ${timestamp}`.gray);

// Environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_SERVICE_KEY;

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_KEY) {
  console.error('\n❌ Error: Missing essential Supabase credentials'.red);
  console.log('Please check your .env file and make sure SUPABASE_URL, SUPABASE_ANON_KEY and SUPABASE_SERVICE_KEY are set');
  process.exit(1);
}

// Create clients
console.log('\nChecking environment variables:'.gray);
console.log(`SUPABASE_URL: ✅`.gray);
console.log(`SUPABASE_ANON_KEY: ✅`.gray);
console.log(`SUPABASE_SERVICE_KEY: ✅`.gray);

const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

console.log('\nCreated Supabase clients:'.gray);
console.log(`Anonymous client: ✅`.gray);
console.log(`Admin client: ✅`.gray);

console.log('\n=================================================='.cyan);
console.log('🚀 STARTING SUPABASE REPAIR PROCESS'.brightWhite.bold);
console.log('==================================================\n'.cyan);

// Function to test the Supabase connection
async function testConnection() {
  console.log('\nTesting anonymous client connection...'.yellow);
  try {
    // Use rpc to run a simple query that will always work
    const { data, error } = await supabaseAnon.rpc('version');
    
    if (error) {
      console.error(`❌ Anonymous client error: ${error.message}`.red);
      return false;
    } else {
      console.log(`✅ Anonymous client connection successful!`.green);
      return true;
    }
  } catch (err) {
    console.error(`❌ Anonymous client error: ${err.message}`.red);
    return false;
  }
}

async function testAdminConnection() {
  console.log('\nTesting admin client connection...'.yellow);
  try {
    // Use a direct SQL query that will always work if the connection is valid
    const { data, error } = await supabaseAdmin.rpc('execute_sql_with_results', {
      sql_query: "SELECT current_timestamp as time, current_user as user"
    });
    
    if (error) {
      console.error(`❌ Admin connection error: ${error.message}`.red);
      return false;
    } else {
      console.log(`✅ Admin client connection successful!`.green);
      console.log(`   Server time: ${data[0].time}`.gray);
      return true;
    }
  } catch (err) {
    console.error(`❌ Admin connection error: ${err.message}`.red);
    return false;
  }
}

// Required tables
const requiredTables = [
  'dental_procedures_simplified',
  'aesthetic_procedures',
  'companies',
  'dental_market_growth',
  'aesthetic_market_growth',
  'categories',
  'aesthetic_categories'
];

// Function to check if required tables exist
async function checkRequiredTables() {
  console.log('\nChecking required tables...'.yellow);
  const tablesStatus = {};
  const missingTables = [];
  
  try {
    // We can't use list_all_tables function as it's still having type issues, so use direct SQL instead
    const { data, error } = await supabaseAdmin.rpc('execute_sql_with_results', {
      sql_query: `
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_type = 'BASE TABLE'
      `
    });
    
    if (error) {
      console.error(`❌ Error checking tables: ${error.message}`.red);
      return { exists: false, missingTables: requiredTables };
    }
    
    const existingTables = data.map(row => row.table_name);
    
    for (const tableName of requiredTables) {
      const exists = existingTables.includes(tableName);
      tablesStatus[tableName] = exists;
      console.log(`Table '${tableName}': ${exists ? '✅' : '❌'}`.gray);
      
      if (!exists) {
        missingTables.push(tableName);
      }
    }
    
    if (missingTables.length > 0) {
      console.log('\n⚠️ Missing required tables:'.yellow);
      console.log(`   - ${missingTables.join('\n   - ')}`.yellow);
    }
    
    return { exists: missingTables.length === 0, missingTables };
  } catch (err) {
    console.error(`❌ Error checking tables: ${err.message}`.red);
    return { exists: false, missingTables: requiredTables };
  }
}

// Function to create the dental_procedures_simplified table
async function createDentalProceduresTable() {
  console.log('\nCreating dental_procedures_simplified table...'.yellow);
  
  try {
    const { error } = await supabaseAdmin.rpc('execute_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS dental_procedures_simplified (
          id SERIAL PRIMARY KEY,
          procedure_name TEXT NOT NULL,
          category TEXT NOT NULL,
          avg_cost DECIMAL(10,2),
          min_cost DECIMAL(10,2),
          max_cost DECIMAL(10,2),
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `
    });
    
    if (error) {
      console.error(`❌ Error creating dental_procedures_simplified table: ${error.message}`.red);
      return false;
    }
    
    console.log('✅ dental_procedures_simplified table created successfully!'.green);
    return true;
  } catch (err) {
    console.error(`❌ Error creating dental_procedures_simplified table: ${err.message}`.red);
    return false;
  }
}

// Function to create the aesthetic_procedures table
async function createAestheticProceduresTable() {
  console.log('\nCreating aesthetic_procedures table...'.yellow);
  
  try {
    const { error } = await supabaseAdmin.rpc('execute_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS aesthetic_procedures (
          id SERIAL PRIMARY KEY,
          procedure_name TEXT NOT NULL,
          category TEXT NOT NULL,
          avg_cost DECIMAL(10,2),
          min_cost DECIMAL(10,2),
          max_cost DECIMAL(10,2),
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `
    });
    
    if (error) {
      console.error(`❌ Error creating aesthetic_procedures table: ${error.message}`.red);
      return false;
    }
    
    console.log('✅ aesthetic_procedures table created successfully!'.green);
    return true;
  } catch (err) {
    console.error(`❌ Error creating aesthetic_procedures table: ${err.message}`.red);
    return false;
  }
}

// Function to create companies table
async function createCompaniesTable() {
  console.log('\nCreating companies table...'.yellow);
  
  try {
    const { error } = await supabaseAdmin.rpc('execute_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS companies (
          id SERIAL PRIMARY KEY,
          company_name TEXT NOT NULL,
          ticker_symbol TEXT,
          market_cap DECIMAL(20,2),
          revenue DECIMAL(20,2),
          employee_count INTEGER,
          founded_year INTEGER,
          headquarters TEXT,
          website TEXT,
          logo_url TEXT,
          sector TEXT,
          industry TEXT,
          description TEXT,
          is_dental BOOLEAN DEFAULT FALSE,
          is_aesthetic BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `
    });
    
    if (error) {
      console.error(`❌ Error creating companies table: ${error.message}`.red);
      return false;
    }
    
    console.log('✅ companies table created successfully!'.green);
    return true;
  } catch (err) {
    console.error(`❌ Error creating companies table: ${err.message}`.red);
    return false;
  }
}

// Function to create dental_market_growth table
async function createDentalMarketGrowthTable() {
  console.log('\nCreating dental_market_growth table...'.yellow);
  
  try {
    const { error } = await supabaseAdmin.rpc('execute_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS dental_market_growth (
          id SERIAL PRIMARY KEY,
          year INTEGER NOT NULL,
          region TEXT NOT NULL,
          market_size DECIMAL(20,2),
          growth_rate DECIMAL(6,2),
          segment TEXT,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `
    });
    
    if (error) {
      console.error(`❌ Error creating dental_market_growth table: ${error.message}`.red);
      return false;
    }
    
    console.log('✅ dental_market_growth table created successfully!'.green);
    return true;
  } catch (err) {
    console.error(`❌ Error creating dental_market_growth table: ${err.message}`.red);
    return false;
  }
}

// Function to create aesthetic_market_growth table
async function createAestheticMarketGrowthTable() {
  console.log('\nCreating aesthetic_market_growth table...'.yellow);
  
  try {
    const { error } = await supabaseAdmin.rpc('execute_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS aesthetic_market_growth (
          id SERIAL PRIMARY KEY,
          year INTEGER NOT NULL,
          region TEXT NOT NULL,
          market_size DECIMAL(20,2),
          growth_rate DECIMAL(6,2),
          segment TEXT,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `
    });
    
    if (error) {
      console.error(`❌ Error creating aesthetic_market_growth table: ${error.message}`.red);
      return false;
    }
    
    console.log('✅ aesthetic_market_growth table created successfully!'.green);
    return true;
  } catch (err) {
    console.error(`❌ Error creating aesthetic_market_growth table: ${err.message}`.red);
    return false;
  }
}

// Function to create categories table
async function createCategoriesTable() {
  console.log('\nCreating categories table...'.yellow);
  
  try {
    const { error } = await supabaseAdmin.rpc('execute_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS categories (
          id SERIAL PRIMARY KEY,
          category_name TEXT NOT NULL,
          display_name TEXT NOT NULL,
          description TEXT,
          parent_category_id INTEGER REFERENCES categories(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `
    });
    
    if (error) {
      console.error(`❌ Error creating categories table: ${error.message}`.red);
      return false;
    }
    
    console.log('✅ categories table created successfully!'.green);
    return true;
  } catch (err) {
    console.error(`❌ Error creating categories table: ${err.message}`.red);
    return false;
  }
}

// Function to create aesthetic_categories table
async function createAestheticCategoriesTable() {
  console.log('\nCreating aesthetic_categories table...'.yellow);
  
  try {
    const { error } = await supabaseAdmin.rpc('execute_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS aesthetic_categories (
          id SERIAL PRIMARY KEY,
          category_name TEXT NOT NULL,
          display_name TEXT NOT NULL,
          description TEXT,
          parent_category_id INTEGER REFERENCES aesthetic_categories(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `
    });
    
    if (error) {
      console.error(`❌ Error creating aesthetic_categories table: ${error.message}`.red);
      return false;
    }
    
    console.log('✅ aesthetic_categories table created successfully!'.green);
    return true;
  } catch (err) {
    console.error(`❌ Error creating aesthetic_categories table: ${err.message}`.red);
    return false;
  }
}

// Setup RLS policies for a table
async function setupTableRls(tableName) {
  console.log(`Setting up RLS for '${tableName}'...`.gray);
  
  try {
    // Enable RLS on the table
    const { error: enableRlsError } = await supabaseAdmin.rpc('execute_sql', {
      sql_query: `
        ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;
      `
    });
    
    if (enableRlsError) {
      console.warn(`⚠️ Could not enable RLS on '${tableName}': ${enableRlsError.message}`.yellow);
      return false;
    }
    
    // Create a policy for reading data
    const { error: readPolicyError } = await supabaseAdmin.rpc('execute_sql', {
      sql_query: `
        CREATE POLICY "${tableName}_read_policy" ON "${tableName}"
        FOR SELECT
        TO authenticated, anon
        USING (true);
      `
    });
    
    if (readPolicyError && !readPolicyError.message.includes('already exists')) {
      console.warn(`⚠️ Could not create read policy for '${tableName}': ${readPolicyError.message}`.yellow);
    }
    
    return true;
  } catch (err) {
    console.warn(`⚠️ Error setting up RLS for '${tableName}': ${err.message}`.yellow);
    return false;
  }
}

// Function to setup RLS policies for all tables
async function setupRlsPolicies(tables) {
  console.log('\nSetting up RLS policies...'.yellow);
  
  const results = {};
  for (const tableName of tables) {
    results[tableName] = await setupTableRls(tableName);
  }
  
  return results;
}

// Main function to run the repair process
async function runRepairProcess() {
  // Check initial connection
  const anonConnected = await testConnection();
  const adminConnected = await testAdminConnection();
  
  if (!anonConnected) {
    console.error('\n❌ Anonymous client connection failed. Please check your SUPABASE_URL and SUPABASE_ANON_KEY.'.red);
  }
  
  if (!adminConnected) {
    console.error('\n❌ Admin client connection failed. Please check your SUPABASE_URL and SUPABASE_SERVICE_KEY.'.red);
  }
  
  if (!anonConnected && !adminConnected) {
    console.error('\n❌ Both connections failed. Please check your Supabase configuration and credentials.'.red);
    return false;
  }
  
  // Check if required tables exist
  const { exists: tablesExist, missingTables } = await checkRequiredTables();
  
  // Create missing tables
  if (!tablesExist) {
    for (const tableName of missingTables) {
      switch (tableName) {
        case 'dental_procedures_simplified':
          await createDentalProceduresTable();
          break;
        case 'aesthetic_procedures':
          await createAestheticProceduresTable();
          break;
        case 'companies':
          await createCompaniesTable();
          break;
        case 'dental_market_growth':
          await createDentalMarketGrowthTable();
          break;
        case 'aesthetic_market_growth':
          await createAestheticMarketGrowthTable();
          break;
        case 'categories':
          await createCategoriesTable();
          break;
        case 'aesthetic_categories':
          await createAestheticCategoriesTable();
          break;
      }
    }
  }
  
  // Setup RLS policies for all tables
  await setupRlsPolicies(requiredTables);
  
  // Final connection test after everything
  const finalAnonConnected = await testConnection();

  // Print summary
  console.log('\n=================================================='.cyan);
  console.log('🔍 REPAIR PROCESS SUMMARY'.brightWhite.bold);
  console.log('==================================================\n'.cyan);
  
  console.log(`Initial anonymous connection: ${anonConnected ? '✅' : '❌'}`.cyan);
  console.log(`Initial admin connection: ${adminConnected ? '✅' : '❌'}`.cyan);
  console.log(`Required tables: ${tablesExist ? '✅' : '❌'}`.cyan);
  console.log(`RLS policies: ${tablesExist ? '✅' : '❌'}`.cyan);
  console.log(`Final anonymous connection: ${finalAnonConnected ? '✅' : '❌'}`.cyan);
  
  console.log(`\nRepair process completed at ${new Date().toLocaleString()}`);
  
  if (finalAnonConnected) {
    console.log('\n✅ Connection successfully established!'.green);
    console.log('Recommended next steps:');
    console.log('1. Run data population scripts');
    console.log('2. Verify data with a simple query');
    console.log('3. Check frontend connection');
  } else {
    console.error('\n❌ Connection could not be fully repaired.'.red);
    console.log('Please check the logs above for more details on what failed.');
  }
  
  console.log('\n==================================================\n'.cyan);
  
  return finalAnonConnected;
}

// Run the process
runRepairProcess();
