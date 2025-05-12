// Enhanced Supabase Connection Repair Tool with detailed logging
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import colors from 'colors';
import path from 'path';

// Configure colors
colors.enable();

// Load environment variables
dotenv.config();

// Set up logging
const logFileName = `supabase-repair-${new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '')}.log`;
const logFilePath = path.join(process.cwd(), logFileName);

// Function to log to both console and file
function log(message, isError = false) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  
  if (isError) {
    console.error(message);
  } else {
    console.log(message);
  }
  
  fs.appendFileSync(logFilePath, logMessage + '\n');
}

// Header
log('\n=================================================='.cyan);
log('🔧 SUPABASE CONNECTION REPAIR TOOL (ENHANCED)'.brightWhite.bold);
log('==================================================\n'.cyan);

// Get timestamp for logging
const timestamp = new Date().toLocaleString();
log(`Repair started at: ${timestamp}`.gray);
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

// Create Supabase clients - one with anon key for testing, one with service key for admin operations
try {
  log('\nCreating Supabase clients:');
  
  const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  log('Anonymous client: ✅');
  
  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  log('Admin client: ✅');
  
  log('\n=================================================='.cyan);
  log('🚀 STARTING SUPABASE REPAIR PROCESS'.brightWhite.bold);
  log('==================================================\n'.cyan);
  
  // Function to test anonymous client connection
  async function testAnonConnection() {
    try {
      log('\nTesting anonymous client connection...'.yellow);
      
      const { data, error } = await supabaseAnon.from('dental_procedures_simplified').select('count(*)').limit(1);
      
      if (error) {
        log(`❌ Anonymous connection error: ${error.message}`.red, true);
        return false;
      }
      
      log('✅ Anonymous client connection successful!'.green);
      return true;
    } catch (err) {
      log(`❌ Anonymous connection error: ${err.message}`.red, true);
      log('Error details: ' + JSON.stringify(err, null, 2));
      return false;
    }
  }
  
  // Function to test admin client connection
  async function testAdminConnection() {
    try {
      log('\nTesting admin client connection...'.yellow);
      
      // Simple test query
      const { data, error } = await supabaseAdmin.from('dental_procedures_simplified').select('count(*)').limit(1);
      
      if (error) {
        log(`❌ Admin connection error: ${error.message}`.red, true);
        log(`❌ Admin client connection failed. Please check your SUPABASE_URL and SUPABASE_SERVICE_KEY.`.red, true);
        return false;
      }
      
      log('✅ Admin client connection successful!'.green);
      return true;
    } catch (err) {
      log(`❌ Admin connection error: ${err.message}`.red, true);
      log('Error details: ' + JSON.stringify(err, null, 2));
      log(`❌ Admin client connection failed. Please check your SUPABASE_URL and SUPABASE_SERVICE_KEY.`.red, true);
      return false;
    }
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
      
      // Using RPC call to check tables
      const { data, error } = await supabaseAdmin.rpc('execute_sql_with_results', {
        sql_query: `
          SELECT table_name
          FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_type = 'BASE TABLE'
          AND table_name IN ('${tablesToCheck.join("','")}')
        `
      });
      
      if (error) {
        log(`❌ Error checking tables: ${error.message}`.red, true);
        return null;
      }
      
      const existingTables = data ? data.map(row => row.table_name) : [];
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
      log('Error details: ' + JSON.stringify(err, null, 2));
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
      
      // Execute the SQL to create the table
      const { error } = await supabaseAdmin.rpc('execute_sql', {
        sql_query: createTableSql
      });
      
      if (error) {
        log(`❌ Error creating ${tableName} table: ${error.message}`.red, true);
        log('Error details: ' + JSON.stringify(error, null, 2));
        return false;
      }
      
      log(`✅ ${tableName} table created successfully!`.green);
      return true;
    } catch (err) {
      log(`❌ Error creating ${tableName} table: ${err.message}`.red, true);
      log('Error details: ' + JSON.stringify(err, null, 2));
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
        const enableRlsResult = await supabaseAdmin.rpc('execute_sql', {
          sql_query: `ALTER TABLE public."${tableName}" ENABLE ROW LEVEL SECURITY;`
        });
        
        if (enableRlsResult.error) {
          log(`⚠️ Could not enable RLS on '${tableName}': ${enableRlsResult.error.message}`.yellow);
          results[tableName] = false;
          continue;
        }
        
        // Create a policy that allows anyone to select from the table
        const createPolicyResult = await supabaseAdmin.rpc('execute_sql', {
          sql_query: `
            CREATE POLICY "${tableName}_anon_select"
            ON public."${tableName}"
            FOR SELECT
            TO authenticated, anon
            USING (true);
          `
        });
        
        if (createPolicyResult.error && !createPolicyResult.error.message.includes('already exists')) {
          log(`⚠️ Could not create policy for '${tableName}': ${createPolicyResult.error.message}`.yellow);
          results[tableName] = false;
        } else {
          results[tableName] = true;
        }
      } catch (err) {
        log(`❌ Error setting up RLS for '${tableName}': ${err.message}`.red, true);
        log('Error details: ' + JSON.stringify(err, null, 2));
        results[tableName] = false;
      }
    }
    
    return results;
  }
  
  // Main repair process
  async function performRepair() {
    // Initial connection tests
    const initialAnonConnection = await testAnonConnection();
    const initialAdminConnection = await testAdminConnection();
    
    // Table checks and creation
    const tableCheck = await checkTables();
    
    // Create missing tables if any
    const tableCreationResults = {};
    if (tableCheck && tableCheck.missingTables.length > 0) {
      for (const tableName of tableCheck.missingTables) {
        tableCreationResults[tableName] = await createTable(tableName);
      }
    }
    
    // Set up RLS policies on all tables (existing and newly created)
    const existingTables = tableCheck ? tableCheck.existingTables : [];
    const createdTables = Object.keys(tableCreationResults).filter(table => tableCreationResults[table]);
    const allTables = [...new Set([...existingTables, ...createdTables])];
    const rlsResults = await setupRlsPolicies(allTables);
    
    // Final connection test
    const finalAnonConnection = await testAnonConnection();
    
    // Generate summary
    log('\n=================================================='.cyan);
    log('🔍 REPAIR PROCESS SUMMARY'.brightWhite.bold);
    log('==================================================\n'.cyan);
    
    log(`Initial anonymous connection: ${initialAnonConnection ? '✅' : '❌'}`);
    log(`Initial admin connection: ${initialAdminConnection ? '✅' : '❌'}`);
    
    const allTablesExist = tableCheck ? tableCheck.missingTables.length === 0 : false;
    const allTablesCreated = tableCheck && tableCheck.missingTables.length > 0 ? 
      tableCheck.missingTables.every(table => tableCreationResults[table]) : false;
    
    log(`Required tables: ${allTablesExist || allTablesCreated ? '✅' : '❌'}`);
    
    const allRlsSet = Object.values(rlsResults).every(result => result === true);
    log(`RLS policies: ${allRlsSet ? '✅' : '❌'}`);
    
    log(`Final anonymous connection: ${finalAnonConnection ? '✅' : '❌'}`);
    
    const endTimestamp = new Date().toLocaleString();
    log(`\nRepair process completed at ${endTimestamp}`);
    
    const success = finalAnonConnection;
    
    log(`\n${success ? '✅ Connection successfully established!' : '❌ Connection issues remain!'}`);
    log('\nRecommended next steps:');
    log('1. Run data population scripts');
    log('2. Verify data with a simple query');
    log('3. Check frontend connection');
    
    log('\n==================================================\n'.cyan);
    
    return success;
  }
  
  // Run the repair process
  performRepair().then(success => {
    log(`Repair process completed with ${success ? 'SUCCESS' : 'ISSUES'}`);
    log(`Log file has been saved to: ${logFilePath}`);
  }).catch(err => {
    log(`\n❌ Unexpected error during repair: ${err.message}`.red, true);
    log('Error details: ' + JSON.stringify(err, null, 2));
    log(`Log file has been saved to: ${logFilePath}`);
  });
  
} catch (err) {
  log(`\n❌ Error creating Supabase clients: ${err.message}`.red, true);
  log('Error details: ' + JSON.stringify(err, null, 2));
  process.exit(1);
}
