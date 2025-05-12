// Script to verify Supabase connection and tables
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import colors from 'colors';

colors.enable();

// Load environment variables
dotenv.config();

console.log('\n=================================================='.cyan);
console.log('🔍 SUPABASE DATA VERIFICATION TOOL'.brightWhite.bold);
console.log('==================================================\n'.cyan);

// Get timestamp for logging
const timestamp = new Date().toLocaleString();
console.log(`Verification started at: ${timestamp}`.gray);

// Environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_SERVICE_KEY;

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_KEY) {
  console.error('\n❌ Error: Missing essential Supabase credentials'.red);
  console.log('Please check your .env file and make sure the following variables are set:');
  console.log('- SUPABASE_URL or VITE_SUPABASE_URL');
  console.log('- SUPABASE_ANON_KEY or VITE_SUPABASE_ANON_KEY');
  console.log('- SUPABASE_SERVICE_KEY or VITE_SUPABASE_SERVICE_KEY');
  process.exit(1);
}

// Create clients
const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

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

// Function to test database connection
async function testConnection() {
  console.log('\nTesting database connections...'.yellow);
  
  try {
    // Test anonymous client connection
    console.log('Testing anonymous client connection...'.gray);
    const { data: anonData, error: anonError, count: anonCount } = await supabaseAnon
      .from('dental_procedures_simplified')
      .select('*', { count: 'exact', head: true });
    
    if (anonError) {
      console.error(`❌ Anonymous client connection error: ${anonError.message}`.red);
      return false;
    } else {
      console.log('✅ Anonymous client connection successful!'.green);
    }
    
    // Test admin client connection
    console.log('\nTesting admin client connection...'.gray);
    const { data: adminData, error: adminError, count: adminCount } = await supabaseAdmin
      .from('dental_procedures_simplified')
      .select('*', { count: 'exact', head: true });
    
    if (adminError) {
      console.error(`❌ Admin client connection error: ${adminError.message}`.red);
      return false;
    } else {
      console.log('✅ Admin client connection successful!'.green);
    }
    
    return true;
  } catch (err) {
    console.error(`❌ Connection test failed: ${err.message}`.red);
    return false;
  }
}

// Function to test SQL functions
async function testSQLFunctions() {
  console.log('\nTesting SQL functions...'.yellow);
  
  try {
    // Test version function
    console.log('Testing version function...'.gray);
    const { data: versionData, error: versionError } = await supabaseAdmin.rpc('version');
    
    if (versionError) {
      console.error(`❌ version function error: ${versionError.message}`.red);
    } else {
      console.log(`✅ version function works! Server version: ${versionData.server_version}`.green);
    }
    
    // Test list_all_tables function
    console.log('\nTesting list_all_tables function...'.gray);
    const { data: tablesData, error: tablesError } = await supabaseAdmin.rpc('list_all_tables');
    
    if (tablesError) {
      console.error(`❌ list_all_tables function error: ${tablesError.message}`.red);
    } else {
      console.log(`✅ list_all_tables function works! Found ${tablesData.length} tables`.green);
      
      console.log('\nAvailable tables:'.gray);
      tablesData.forEach((tableInfo, index) => {
        console.log(`${index + 1}. ${tableInfo.schema_name}.${tableInfo.table_name} (${tableInfo.row_count} rows)`);
      });
    }
    
    return !versionError && !tablesError;
  } catch (err) {
    console.error(`❌ SQL function test failed: ${err.message}`.red);
    return false;
  }
}

// Function to check tables and count rows
async function checkTables() {
  console.log('\nChecking required tables...'.yellow);
  
  let allTablesExist = true;
  let tableResults = {};
  
  for (const tableName of requiredTables) {
    try {
      console.log(`Checking table '${tableName}'...`.gray);
      const { data, error, count } = await supabaseAdmin
        .from(tableName)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error(`❌ Error accessing table '${tableName}': ${error.message}`.red);
        allTablesExist = false;
        tableResults[tableName] = { exists: false, count: 0, error: error.message };
      } else {
        console.log(`✅ Table '${tableName}' exists with ${count} rows`.green);
        tableResults[tableName] = { exists: true, count, error: null };
      }
    } catch (err) {
      console.error(`❌ Error checking table '${tableName}': ${err.message}`.red);
      allTablesExist = false;
      tableResults[tableName] = { exists: false, count: 0, error: err.message };
    }
  }
  
  return { allTablesExist, tableResults };
}

// Function to sample some data from each table
async function sampleTableData() {
  console.log('\nSampling data from tables...'.yellow);
  
  for (const tableName of requiredTables) {
    try {
      const { data, error } = await supabaseAdmin
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (error) {
        console.error(`❌ Error sampling data from '${tableName}': ${error.message}`.red);
      } else if (data && data.length > 0) {
        console.log(`✅ Sample data from '${tableName}':`.green);
        console.log(JSON.stringify(data[0], null, 2).substring(0, 500) + (JSON.stringify(data[0], null, 2).length > 500 ? '...' : ''));
      } else {
        console.log(`⚠️ No data found in '${tableName}'`.yellow);
      }
    } catch (err) {
      console.error(`❌ Error sampling data from '${tableName}': ${err.message}`.red);
    }
  }
}

// Main function
async function main() {
  const connectionResult = await testConnection();
  const sqlFunctionsResult = await testSQLFunctions();
  const { allTablesExist, tableResults } = await checkTables();
  
  console.log('\n=================================================='.cyan);
  console.log('🔍 VERIFICATION RESULT'.brightWhite.bold);
  console.log('==================================================\n'.cyan);
  
  if (connectionResult) {
    console.log('✅ Database connection verified'.green);
  } else {
    console.error('❌ Database connection issues detected'.red);
  }
  
  if (sqlFunctionsResult) {
    console.log('✅ SQL functions are working correctly'.green);
  } else {
    console.error('❌ SQL function issues detected'.red);
  }
  
  if (allTablesExist) {
    console.log('✅ All required tables exist'.green);
  } else {
    console.error('❌ Some required tables are missing'.red);
  }
  
  console.log('\nTable status:');
  for (const [tableName, result] of Object.entries(tableResults)) {
    if (result.exists) {
      console.log(`- ${tableName}: ${result.count > 0 ? '✅' : '⚠️'} ${result.count} rows`);
    } else {
      console.log(`- ${tableName}: ❌ ${result.error}`);
    }
  }
  
  // Sample data only if connection successful
  if (connectionResult) {
    await sampleTableData();
  }
  
  console.log('\nNext steps:');
  if (!connectionResult || !allTablesExist) {
    console.log('1. Run fix-supabase-connection.js again to repair any remaining issues');
    console.log('2. Run data population scripts to populate tables with data');
  } else if (Object.values(tableResults).some(result => result.count === 0)) {
    console.log('1. Run data population scripts to populate empty tables');
    console.log('2. Verify data integrity after population');
  } else {
    console.log('1. All tables have data! Your database appears to be set up correctly');
    console.log('2. Check your application for proper database connectivity');
  }
  
  console.log('\n==================================================\n'.cyan);
}

// Run the main function
main();
