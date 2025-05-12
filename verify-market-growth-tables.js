// Script to verify market growth tables and data
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import colors from 'colors';

colors.enable();

// Load environment variables
dotenv.config();

console.log('\n=================================================='.cyan);
console.log('🔍 MARKET GROWTH TABLES VERIFICATION TOOL'.brightWhite.bold);
console.log('==================================================\n'.cyan);

// Get timestamp for logging
const timestamp = new Date().toLocaleString();
console.log(`Verification started at: ${timestamp}`.gray);

// Environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_SERVICE_KEY;

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('\n❌ Error: Missing essential Supabase credentials'.red);
  console.log('Please check your .env file and make sure SUPABASE_URL and SUPABASE_SERVICE_KEY are set');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Function to check if a table exists
async function checkTable(tableName) {
  try {
    console.log(`\nChecking ${tableName} table...`.yellow);
    
    // Check if the table exists
    const { data, error, count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error(`❌ Error checking ${tableName} table: ${error.message}`.red);
      return { exists: false, count: 0, hasData: false };
    }
    
    console.log(`✅ Table ${tableName} exists`.green);
    console.log(`✅ Table ${tableName} has ${count} records`.green);
    
    const hasData = count > 0;
    
    return { exists: true, count, hasData };
  } catch (err) {
    console.error(`❌ Error checking ${tableName} table: ${err.message}`.red);
    return { exists: false, count: 0, hasData: false };
  }
}

// Function to check if a table has a specific column
async function checkColumn(tableName, columnName) {
  try {
    console.log(`Checking ${tableName}.${columnName} column...`.yellow);
    
    // Try to select just this column to check if it exists
    const { data, error } = await supabase
      .from(tableName)
      .select(columnName)
      .limit(1);
    
    if (error) {
      console.error(`❌ Column ${columnName} in ${tableName} doesn't exist or has issues: ${error.message}`.red);
      return false;
    }
    
    console.log(`✅ Column ${columnName} in ${tableName} exists`.green);
    return true;
  } catch (err) {
    console.error(`❌ Error checking ${columnName} column in ${tableName}: ${err.message}`.red);
    return false;
  }
}

// Function to sample data from a table
async function sampleTableData(tableName, limit = 3) {
  try {
    console.log(`Retrieving sample data from ${tableName}...`.yellow);
    
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(limit);
    
    if (error) {
      console.error(`❌ Error retrieving sample data from ${tableName}: ${error.message}`.red);
      return null;
    }
    
    if (!data || data.length === 0) {
      console.log(`⚠️ No sample data available from ${tableName}`.yellow);
      return null;
    }
    
    console.log(`✅ Successfully retrieved ${data.length} sample records from ${tableName}`.green);
    return data;
  } catch (err) {
    console.error(`❌ Error retrieving sample data from ${tableName}: ${err.message}`.red);
    return null;
  }
}

// Main function
async function main() {
  console.log('Checking tables for existence and data...'.yellow);
  
  // Check required tables
  const tables = [
    'aesthetic_categories',
    'aesthetic_procedures',
    'aesthetic_market_growth',
    'categories',
    'dental_procedures_simplified',
    'dental_market_growth',
    'companies'
  ];
  
  const tableResults = {};
  
  // Check each table
  for (const tableName of tables) {
    tableResults[tableName] = await checkTable(tableName);
    
    // If table exists, check key columns
    if (tableResults[tableName].exists) {
      if (tableName === 'dental_market_growth' || tableName === 'aesthetic_market_growth') {
        await checkColumn(tableName, 'category_id');
        await checkColumn(tableName, 'year');
        await checkColumn(tableName, 'growth_rate');
        
        // If table has data, show a sample
        if (tableResults[tableName].hasData) {
          const sampleData = await sampleTableData(tableName);
          if (sampleData) {
            console.log(`Sample data from ${tableName}:`.cyan);
            console.table(sampleData);
          }
        }
      }
      
      if (tableName === 'aesthetic_categories') {
        await checkColumn(tableName, 'name');
        await checkColumn(tableName, 'description');
        
        // If table has data, show a sample
        if (tableResults[tableName].hasData) {
          const sampleData = await sampleTableData(tableName);
          if (sampleData) {
            console.log(`Sample data from ${tableName}:`.cyan);
            console.table(sampleData);
          }
        }
      }
    }
  }
  
  // Summary
  console.log('\n=================================================='.cyan);
  console.log('📊 VERIFICATION SUMMARY'.brightWhite.bold);
  console.log('==================================================\n'.cyan);
  
  let allTablesExist = true;
  let allTablesHaveData = true;
  
  for (const tableName of tables) {
    const result = tableResults[tableName];
    
    if (!result.exists) {
      allTablesExist = false;
      console.error(`❌ Table ${tableName} does not exist`.red);
    } else if (!result.hasData) {
      allTablesHaveData = false;
      console.warn(`⚠️ Table ${tableName} exists but has no data (count: ${result.count})`.yellow);
    } else {
      console.log(`✅ Table ${tableName} exists and has ${result.count} records`.green);
    }
  }
  
  if (allTablesExist && allTablesHaveData) {
    console.log('\n🎉 All required tables exist and have data!'.green.bold);
    console.log('\nThe system appears to be properly set up with all required tables and data.');
  } else if (allTablesExist && !allTablesHaveData) {
    console.warn('\n⚠️ All required tables exist but some have no data.'.yellow.bold);
    console.log('\nRecommended actions:');
    console.log('1. Run populate-market-growth.js to populate the empty tables');
    console.log('2. Check for any errors in the data population process');
  } else {
    console.error('\n❌ Some required tables are missing.'.red.bold);
    console.log('\nRecommended actions:');
    console.log('1. Run fix-supabase-connection.js to ensure proper setup');
    console.log('2. Run fix-market-growth-tables.js to create missing tables');
  }
  
  console.log('\n==================================================\n'.cyan);
}

// Run the main function
main();
