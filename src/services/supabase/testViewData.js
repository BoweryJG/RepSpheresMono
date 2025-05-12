/**
 * Test script to fetch and display data from Supabase tables
 * Run with: node src/services/supabase/testViewData.js
 */

import { supabase } from './supabaseClient.js';

/**
 * Fetch and log data from a specific table
 * @param {string} tableName - The name of the table to query
 * @param {number} limit - Maximum number of records to retrieve
 */
async function viewTableData(tableName, limit = 5) {
  console.log(`\n----- DATA FROM ${tableName.toUpperCase()} -----`);
  
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(limit);
      
    if (error) {
      console.error(`Error fetching data from ${tableName}:`, error.message);
      return false;
    }
    
    if (!data || data.length === 0) {
      console.log(`No data found in ${tableName}`);
      return false;
    }
    
    console.log(`Found ${data.length} rows in ${tableName}:`);
    console.table(data);
    return true;
  } catch (error) {
    console.error(`Error viewing ${tableName}:`, error.message);
    return false;
  }
}

/**
 * List all tables in the Supabase database
 */
async function listAllTables() {
  console.log('\n----- LISTING ALL TABLES -----');
  
  try {
    // Try to use the custom function if available
    try {
      const { data, error } = await supabase.rpc('list_all_tables');
      if (!error) {
        console.log('Tables found:', data);
        return data;
      }
    } catch (e) {
      // Function might not exist, continue with fallback
    }
    
    // Fallback: Try to query information_schema
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
      
    if (error) {
      console.error('Error listing tables:', error.message);
      return ['dental_procedures_simplified', 'aesthetic_procedures']; // Default fallback
    }
    
    const tableNames = data.map(t => t.table_name);
    console.log('Tables found:', tableNames);
    return tableNames;
  } catch (error) {
    console.error('Error listing tables:', error.message);
    return ['dental_procedures_simplified', 'aesthetic_procedures']; // Default fallback
  }
}

/**
 * Test fetching multiple tables
 */
async function testMultipleTables() {
  // Try a few known tables
  const knownTables = [
    'dental_procedures_simplified',
    'aesthetic_procedures',
    'categories',
    'aesthetic_categories',
    'dental_market_growth',
    'aesthetic_market_growth',
    'companies'
  ];
  
  let results = {};
  
  for (const table of knownTables) {
    const success = await viewTableData(table);
    results[table] = success;
  }
  
  // Summary
  console.log('\n----- SUMMARY -----');
  for (const [table, success] of Object.entries(results)) {
    console.log(`${table}: ${success ? 'Data found ✅' : 'No data or error ❌'}`);
  }
}

// Main function
async function main() {
  console.log('===== SUPABASE DATA VIEWER =====');
  
  // List all tables
  const tables = await listAllTables();
  
  // Test specific tables
  await testMultipleTables();
  
  console.log('\n===== TEST COMPLETE =====');
}

// Execute if run directly
main();
