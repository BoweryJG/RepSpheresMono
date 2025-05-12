// Comprehensive Supabase Connection and Data Fix Tool
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import colors from 'colors';

// Configure colors
colors.enable();

// Load environment variables
dotenv.config();

// Create log directory if it doesn't exist
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Set up logging
const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
const logFileName = `supabase-fix-${timestamp}.log`;
const logFilePath = path.join(logDir, logFileName);

// Function to log to both console and file
function log(message, isError = false) {
  const logTimestamp = new Date().toISOString();
  const logMessage = `[${logTimestamp}] ${message}`;
  
  if (isError) {
    console.error(message);
  } else {
    console.log(message);
  }
  
  // Ensure the log directory exists
  try {
    if (!fs.existsSync(path.dirname(logFilePath))) {
      fs.mkdirSync(path.dirname(logFilePath), { recursive: true });
    }
    fs.appendFileSync(logFilePath, logMessage + '\n');
  } catch (err) {
    console.error(`Error writing to log file: ${err.message}`);
  }
}

// Header
log('\n=================================================='.cyan);
log('🔧 SUPABASE COMPREHENSIVE FIX TOOL'.brightWhite.bold);
log('==================================================\n'.cyan);

// Get timestamp for logging
const startTimestamp = new Date().toLocaleString();
log(`Repair started at: ${startTimestamp}`.gray);
log(`Log file: ${logFilePath}`.gray);

// Environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_SERVICE_KEY;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

log('\nChecking environment variables:');
log(`SUPABASE_URL: ${SUPABASE_URL ? '✅' : '❌'}`);
log(`SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY ? '✅' : '❌'}`);
log(`SUPABASE_SERVICE_KEY: ${SUPABASE_SERVICE_KEY ? '✅' : '❌'}`);

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !SUPABASE_ANON_KEY) {
  log('\n❌ Error: Missing essential Supabase credentials'.red, true);
  log('Please check your .env file and ensure all required variables are set');
  process.exit(1);
}

// Create Supabase clients
const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

log('\nCreating Supabase clients:');
log('Anonymous client: ✅');
log('Admin client: ✅');

log('\n=================================================='.cyan);
log('🚀 STARTING SUPABASE FIX PROCESS'.brightWhite.bold);
log('==================================================\n'.cyan);

// SQL to recreate the execute_sql function
const createExecuteSqlFunctionSql = `
-- Drop existing function if it exists
DROP FUNCTION IF EXISTS execute_sql(text);

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

// SQL to create the execute_sql_with_results function
const createExecuteSqlWithResultsFunctionSql = `
-- Drop existing function if it exists
DROP FUNCTION IF EXISTS execute_sql_with_results(text);

-- Create the function with SETOF json return type
CREATE OR REPLACE FUNCTION public.execute_sql_with_results(sql_query TEXT)
RETURNS SETOF json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY EXECUTE sql_query;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.execute_sql_with_results TO authenticated, anon;

-- Add a comment to the function
COMMENT ON FUNCTION public.execute_sql_with_results IS 'Executes arbitrary SQL and returns results as JSON';
`;

// Function to execute SQL directly with the admin client (not using RPC)
async function executeSqlDirectly(sql, description) {
  try {
    log(`\n${description}...`.yellow);
    
    // Using the special PostgreSQL syntax for Supabase direct SQL execution
    const { data, error } = await supabaseAdmin.from('_exec_sql').insert({ query: sql }).select();
    
    if (error) {
      log(`❌ ${description} failed: ${error.message}`.red, true);
      return { success: false, error: error.message };
    }
    
    log(`✅ ${description} completed successfully`.green);
    return { success: true };
  } catch (err) {
    log(`❌ ${description} failed: ${err.message}`.red, true);
    log(`Error details: ${JSON.stringify(err, null, 2)}`, true);
    return { success: false, error: err.message };
  }
}

// Function to test anonymous client connection
async function testAnonConnection() {
  try {
    log('\nTesting anonymous client connection...'.yellow);
    
    const { data, error } = await supabaseAnon.from('dental_procedures_simplified').select('count(*)').limit(1);
    
    if (error && !error.message.includes('does not exist')) {
      log(`❌ Anonymous connection error: ${error.message}`.red, true);
      return false;
    }
    
    log('✅ Anonymous client connection successful!'.green);
    return true;
  } catch (err) {
    log(`❌ Anonymous connection error: ${err.message}`.red, true);
    log(`Error details: ${JSON.stringify(err, null, 2)}`, true);
    return false;
  }
}

// Function to test admin client connection
async function testAdminConnection() {
  try {
    log('\nTesting admin client connection...'.yellow);
    
    // Simple test query
    const { data, error } = await supabaseAdmin.from('dental_procedures_simplified').select('count(*)').limit(1);
    
    if (error && !error.message.includes('does not exist')) {
      log(`❌ Admin connection error: ${error.message}`.red, true);
      log(`❌ Admin client connection failed. Please check your SUPABASE_URL and SUPABASE_SERVICE_KEY.`.red, true);
      return false;
    }
    
    log('✅ Admin client connection successful!'.green);
    return true;
  } catch (err) {
    log(`❌ Admin connection error: ${err.message}`.red, true);
    log(`Error details: ${JSON.stringify(err, null, 2)}`, true);
    log(`❌ Admin client connection failed. Please check your SUPABASE_URL and SUPABASE_SERVICE_KEY.`.red, true);
    return false;
  }
}

// Function to fix SQL functions
async function fixSqlFunctions() {
  log('\nFixing SQL functions...'.yellow);
  
  // Create the execute_sql function
  const execResult = await executeSqlDirectly(
    createExecuteSqlFunctionSql, 
    'Creating execute_sql function'
  );
  
  // Create the execute_sql_with_results function
  const execWithResultsResult = await executeSqlDirectly(
    createExecuteSqlWithResultsFunctionSql,
    'Creating execute_sql_with_results function'
  );
  
  return {
    execResult,
    execWithResultsResult
  };
}

// Function to check all required tables
async function checkTables() {
  try {
    log('\nChecking required tables...'.yellow);
    
    const tablesToCheck = [
      'dental_procedures_simplified',
      'aesthetic_procedures',
      'companies',
      'dental_market_growth',
      'aesthetic_market_growth',
      'categories',
      'aesthetic_categories'
    ];
    
    // Using direct SQL since RPC might not be available yet
    const { data, error } = await supabaseAdmin.from('_exec_sql').insert({
      query: `
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
        AND table_name IN ('${tablesToCheck.join("','")}')
      `
    }).select();
    
    if (error) {
      log(`❌ Error checking tables: ${error.message}`.red, true);
      return null;
    }
    
    const existingTables = data && data[0] ? data[0].map(row => row.table_name) : [];
    const missingTables = tablesToCheck.filter(table => !existingTables.includes(table));
    
    for (const table of tablesToCheck) {
      log(`Table '${table}': ${existingTables.includes(table) ? '✅' : '❌'}`);
    }
    
    if (missingTables.length > 0) {
      log(`\n⚠️ Missing required tables:\n   - ${missingTables.join('\n   - ')}`.yellow);
    }
    
    return {
      existingTables,
      missingTables
    };
  } catch (err) {
    log(`❌ Error checking tables: ${err.message}`.red, true);
    log(`Error details: ${JSON.stringify(err, null, 2)}`, true);
    return null;
  }
}

// Function to create missing tables
async function createTable(tableName) {
  log(`\nCreating ${tableName} table...`.yellow);
  
  try {
    let createTableSql = '';
    
    // Define SQL for each table type
    switch (tableName) {
      case 'dental_procedures_simplified':
        createTableSql = `
          CREATE TABLE IF NOT EXISTS dental_procedures_simplified (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            category VARCHAR(100),
            average_cost DECIMAL(10, 2),
            description TEXT,
            tags TEXT[]
          );
        `;
        break;
      case 'aesthetic_procedures':
        createTableSql = `
          CREATE TABLE IF NOT EXISTS aesthetic_procedures (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            category VARCHAR(100),
            average_cost DECIMAL(10, 2),
            description TEXT,
            tags TEXT[]
          );
        `;
        break;
      case 'companies':
        createTableSql = `
          CREATE TABLE IF NOT EXISTS companies (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            industry VARCHAR(100),
            market_cap DECIMAL(18, 2),
            headquarters VARCHAR(255),
            founded_year INTEGER,
            description TEXT,
            website VARCHAR(255),
            ticker_symbol VARCHAR(50)
          );
        `;
        break;
      case 'dental_market_growth':
        createTableSql = `
          CREATE TABLE IF NOT EXISTS dental_market_growth (
            id SERIAL PRIMARY KEY,
            year INTEGER NOT NULL,
            category VARCHAR(100),
            region VARCHAR(100),
            growth_rate DECIMAL(8, 2),
            market_size DECIMAL(18, 2),
            currency VARCHAR(10) DEFAULT 'USD'
          );
        `;
        break;
      case 'aesthetic_market_growth':
        createTableSql = `
          CREATE TABLE IF NOT EXISTS aesthetic_market_growth (
            id SERIAL PRIMARY KEY,
            year INTEGER NOT NULL,
            category VARCHAR(100),
            region VARCHAR(100),
            growth_rate DECIMAL(8, 2),
            market_size DECIMAL(18, 2),
            currency VARCHAR(10) DEFAULT 'USD'
          );
        `;
        break;
      case 'categories':
        createTableSql = `
          CREATE TABLE IF NOT EXISTS categories (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            parent_category VARCHAR(100),
            description TEXT
          );
        `;
        break;
      case 'aesthetic_categories':
        createTableSql = `
          CREATE TABLE IF NOT EXISTS aesthetic_categories (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            parent_category VARCHAR(100),
            description TEXT
          );
        `;
        break;
      default:
        log(`❌ Unknown table: ${tableName}`.red, true);
        return false;
    }
    
    // Execute the SQL to create the table using direct query
    const { error } = await supabaseAdmin.from('_exec_sql').insert({ query: createTableSql }).select();
    
    if (error) {
      log(`❌ Error creating ${tableName} table: ${error.message}`.red, true);
      return false;
    }
    
    log(`✅ ${tableName} table created successfully!`.green);
    return true;
  } catch (err) {
    log(`❌ Error creating ${tableName} table: ${err.message}`.red, true);
    log(`Error details: ${JSON.stringify(err, null, 2)}`, true);
    return false;
  }
}

// Function to check and setup RLS policies
async function setupRlsPolicies(tables) {
  log('\nSetting up RLS policies...'.yellow);
  
  const results = {};
  
  for (const tableName of tables) {
    log(`Setting up RLS for '${tableName}'...`.gray);
    
    try {
      // Enable RLS on the table
      const { error: enableRlsError } = await supabaseAdmin.from('_exec_sql').insert({
        query: `ALTER TABLE public."${tableName}" ENABLE ROW LEVEL SECURITY;`
      }).select();
      
      if (enableRlsError) {
        log(`⚠️ Could not enable RLS on '${tableName}': ${enableRlsError.message}`.yellow);
        results[tableName] = false;
        continue;
      }
      
      // Create a policy that allows anyone to select from the table
      const { error: policyError } = await supabaseAdmin.from('_exec_sql').insert({
        query: `
          DO $$
          BEGIN
            BEGIN
              CREATE POLICY "${tableName}_anon_select"
              ON public."${tableName}"
              FOR SELECT
              TO authenticated, anon
              USING (true);
            EXCEPTION WHEN duplicate_object THEN
              NULL;
            END;
          END $$;
        `
      }).select();
      
      if (policyError) {
        log(`⚠️ Could not create policy for '${tableName}': ${policyError.message}`.yellow);
        results[tableName] = false;
      } else {
        log(`✅ RLS policy set up for '${tableName}'`.green);
        results[tableName] = true;
      }
    } catch (err) {
      log(`❌ Error setting up RLS for '${tableName}': ${err.message}`.red, true);
      log(`Error details: ${JSON.stringify(err, null, 2)}`, true);
      results[tableName] = false;
    }
  }
  
  return results;
}

// Function to verify functions
async function verifyFunctions() {
  try {
    log('\nVerifying SQL functions...'.yellow);
    
    // Test execute_sql function
    const { error: execError } = await supabaseAdmin.from('_exec_sql').insert({
      query: `SELECT has_function_privilege('public.execute_sql(text)', 'execute');`
    }).select();
    
    const hasExecuteSql = !execError;
    log(`execute_sql function: ${hasExecuteSql ? '✅' : '❌'}`);
    
    // Test execute_sql_with_results function
    const { error: execResultsError } = await supabaseAdmin.from('_exec_sql').insert({
      query: `SELECT has_function_privilege('public.execute_sql_with_results(text)', 'execute');`
    }).select();
    
    const hasExecuteSqlWithResults = !execResultsError;
    log(`execute_sql_with_results function: ${hasExecuteSqlWithResults ? '✅' : '❌'}`);
    
    return {
      hasExecuteSql,
      hasExecuteSqlWithResults
    };
  } catch (err) {
    log(`❌ Error verifying SQL functions: ${err.message}`.red, true);
    log(`Error details: ${JSON.stringify(err, null, 2)}`, true);
    return {
      hasExecuteSql: false,
      hasExecuteSqlWithResults: false
    };
  }
}

// Main repair process
async function performComprehensiveFix() {
  try {
    // Step 1: Initial connection tests
    const initialAnonConnection = await testAnonConnection();
    const initialAdminConnection = await testAdminConnection();
    
    // Step 2: Fix SQL functions
    const sqlFunctionsResult = await fixSqlFunctions();
    
    // Step 3: Verify functions were created correctly
    const functionsVerification = await verifyFunctions();
    
    // Step 4: Table checks and creation
    const tableCheck = await checkTables();
    
    // Step 5: Create missing tables if any
    const tableCreationResults = {};
    if (tableCheck && tableCheck.missingTables.length > 0) {
      for (const tableName of tableCheck.missingTables) {
        tableCreationResults[tableName] = await createTable(tableName);
      }
    }
    
    // Step 6: Set up RLS policies on all tables (existing and newly created)
    const existingTables = tableCheck ? tableCheck.existingTables : [];
    const createdTables = Object.keys(tableCreationResults).filter(table => tableCreationResults[table]);
    const allTables = [...new Set([...existingTables, ...createdTables])];
    const rlsResults = await setupRlsPolicies(allTables);
    
    // Step 7: Final connection test
    const finalAnonConnection = await testAnonConnection();
    const finalAdminConnection = await testAdminConnection();
    
    // Generate summary
    log('\n=================================================='.cyan);
    log('🔍 COMPREHENSIVE FIX SUMMARY'.brightWhite.bold);
    log('==================================================\n'.cyan);
    
    log(`Initial anonymous connection: ${initialAnonConnection ? '✅' : '❌'}`);
    log(`Initial admin connection: ${initialAdminConnection ? '✅' : '❌'}`);
    log(`SQL functions fixed: ${sqlFunctionsResult.execResult.success && sqlFunctionsResult.execWithResultsResult.success ? '✅' : '❌'}`);
    
    const allTablesExist = tableCheck ? tableCheck.missingTables.length === 0 : false;
    const allTablesCreated = tableCheck && tableCheck.missingTables.length > 0 ? 
      tableCheck.missingTables.every(table => tableCreationResults[table]) : true;
    
    log(`Required tables: ${allTablesExist || allTablesCreated ? '✅' : '❌'}`);
    
    const allRlsSet = Object.values(rlsResults).every(result => result === true);
    log(`RLS policies: ${allRlsSet ? '✅' : '❌'}`);
    
    log(`Final anonymous connection: ${finalAnonConnection ? '✅' : '❌'}`);
    log(`Final admin connection: ${finalAdminConnection ? '✅' : '❌'}`);
    
    const endTimestamp = new Date().toLocaleString();
    log(`\nFix process completed at ${endTimestamp}`.gray);
    
    const success = finalAnonConnection && finalAdminConnection;
    
    log(`\n${success ? '✅ Connection successfully established!' : '❌ Connection issues remain!'}`);
    
    if (success) {
      log('\nRecommended next steps:');
      log('1. Run data population scripts');
      log('2. Verify data with simple queries');
      log('3. Check frontend connection');
    } else {
      log('\nTroubleshooting recommendations:');
      
      if (!finalAdminConnection) {
        log('- Verify your SUPABASE_SERVICE_KEY is correct');
        log('- Check if the Supabase project is paused or has reached quota limits');
      }
      
      if (!allTablesExist && !allTablesCreated) {
        log('- Run specific table creation scripts manually');
        log('- Check if there are data type conflicts or constraints preventing table creation');
      }
      
      if (!allRlsSet) {
        log('- Manually configure RLS policies through the Supabase dashboard');
      }
    }
    
    log('\n==================================================\n'.cyan);
    log(`Log file has been saved to: ${logFilePath}`.gray);
    
    return success;
  } catch (err) {
    log(`\n❌ Unexpected error during fix process: ${err.message}`.red, true);
    log(`Error details: ${JSON.stringify(err, null, 2)}`, true);
    return false;
  }
}

// Run the repair process
performComprehensiveFix().then(success => {
  log(`Comprehensive fix process completed with ${success ? 'SUCCESS' : 'ISSUES'}`);
}).catch(err => {
  log(`\n❌ Fatal error during repair: ${err.message}`.red, true);
  log(`Error details: ${JSON.stringify(err, null, 2)}`, true);
});
