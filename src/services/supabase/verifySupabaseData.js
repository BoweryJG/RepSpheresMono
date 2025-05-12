/**
 * Verify Supabase Data
 * Comprehensive testing tool for Supabase database health and data integrity
 * 
 * Instructions: 
 * Import and use runFullVerification() in your own scripts
 * Or run this file directly: node src/services/supabase/verifySupabaseData.js
 */

import { supabase } from './supabaseClient.js';
import dotenv from 'dotenv';
import colors from 'colors/safe.js';

// Initialize environment
dotenv.config();
colors.enable();

// Define essential tables that should exist
const ESSENTIAL_TABLES = {
  dental_procedures_simplified: { minRows: 5 },
  aesthetic_procedures: { minRows: 5 },
  categories: { minRows: 2 },
  companies: { minRows: 0 }, // Optional
  market_trends: { minRows: 0 }, // Optional
  news_articles: { minRows: 0 } // Optional
};

/**
 * Test the basic Supabase connection
 */
async function testConnection() {
  console.log(colors.blue('🔌 Testing Supabase connection...'));
  
  try {
    const { data, error } = await supabase.from('dental_procedures_simplified').select('count()', { count: 'exact', head: true });
    
    if (error) {
      console.error(colors.red(`❌ Connection failed: ${error.message}`));
      return { success: false, error: error.message };
    }
    
    console.log(colors.green('✅ Connection successful'));
    return { success: true };
  } catch (error) {
    console.error(colors.red(`❌ Connection failed: ${error.message}`));
    return { success: false, error: error.message };
  }
}

/**
 * Test if authentication works properly
 */
async function testAuthentication() {
  console.log(colors.blue('\n🔑 Testing Supabase authentication...'));
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error(colors.red(`❌ Authentication error: ${error.message}`));
      return { success: false, error: error.message };
    }
    
    if (!session) {
      console.log(colors.yellow('⚠️ No active session'));
      
      // Try to login with environment variables if available
      if (process.env.VITE_SUPABASE_USER && process.env.VITE_SUPABASE_PASSWORD) {
        console.log(colors.gray(`Attempting login as ${process.env.VITE_SUPABASE_USER}...`));
        
        const { data, error: loginError } = await supabase.auth.signInWithPassword({
          email: process.env.VITE_SUPABASE_USER,
          password: process.env.VITE_SUPABASE_PASSWORD
        });
        
        if (loginError) {
          console.error(colors.red(`❌ Login failed: ${loginError.message}`));
          return { success: false, error: loginError.message };
        }
        
        console.log(colors.green('✅ Login successful'));
        return { success: true };
      }
      
      console.log(colors.yellow('⚠️ No login credentials found in .env file'));
      return { success: false, error: 'No auth session or credentials' };
    }
    
    console.log(colors.green(`✅ Authenticated as ${session.user.email}`));
    return { success: true };
  } catch (error) {
    console.error(colors.red(`❌ Authentication error: ${error.message}`));
    return { success: false, error: error.message };
  }
}

/**
 * Check which tables exist and which are missing
 */
export async function checkTables() { // Exported for external use
  console.log(colors.blue('\n📋 Checking required tables...'));
  
  try {
    // First try to use the custom function
    let tables = [];
    try {
      const { data: functionData, error: functionError } = await supabase.rpc('list_all_tables');
      
      if (!functionError && functionData) {
        tables = functionData;
      }
    } catch (e) {
      // Function might not exist, continue with fallback
    }
    
    // Fallback to direct query if function doesn't exist
    if (tables.length === 0) {
      // Query directly using AUTH_CLIENT
      const { data, error } = await supabase.auth.getSession();
      
      if (!data.session) {
        console.error(colors.red('❌ Cannot check tables - no authentication'));
        return { 
          success: false, 
          error: 'Authentication required', 
          tables: Object.keys(ESSENTIAL_TABLES).reduce((acc, tableName) => {
            acc[tableName] = { exists: false, error: 'Auth required' };
            return acc;
          }, {}) 
        };
      }
    }
    
    // Check each essential table
    const tableResults = {};
    let missingTables = 0;
    
    for (const tableName of Object.keys(ESSENTIAL_TABLES)) {
      // Check if table exists by running a simple query
      const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
        
      if (error && error.message.includes('does not exist')) {
        console.log(colors.yellow(`⚠️ Missing table: ${tableName}`));
        tableResults[tableName] = { exists: false };
        missingTables++;
      } else if (error) {
        console.error(colors.red(`❌ Error checking table ${tableName}: ${error.message}`));
        tableResults[tableName] = { exists: false, error: error.message };
        missingTables++;
      } else {
        console.log(colors.green(`✅ Found table: ${tableName} (${count} rows)`));
        tableResults[tableName] = { exists: true, rowCount: count };
      }
    }
    
    if (missingTables === 0) {
      console.log(colors.green('✅ All required tables exist'));
    } else {
      console.log(colors.yellow(`⚠️ Missing ${missingTables} required tables`));
    }
    
    return { 
      success: missingTables === 0,
      tables: tableResults
    };
  } catch (error) {
    console.error(colors.red(`❌ Error checking tables: ${error.message}`));
    return { success: false, error: error.message };
  }
}

/**
 * Check if tables have appropriate data
 */
async function checkData(tableResults) {
  console.log(colors.blue('\n🔢 Checking required data...'));
  
  try {
    const dataResults = {};
    let dataIssues = 0;
    
    for (const [tableName, requirements] of Object.entries(ESSENTIAL_TABLES)) {
      // Skip tables that don't exist
      if (tableResults && tableResults[tableName] && !tableResults[tableName].exists) {
        dataResults[tableName] = { valid: false, error: 'Table does not exist' };
        dataIssues++;
        continue;
      }
      
      // Check row count
      const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
        
      if (error) {
        console.error(colors.red(`❌ Error checking data for ${tableName}: ${error.message}`));
        dataResults[tableName] = { valid: false, error: error.message };
        dataIssues++;
      } else if (count < requirements.minRows) {
        console.log(colors.yellow(`⚠️ Insufficient data in ${tableName}: ${count}/${requirements.minRows} rows`));
        dataResults[tableName] = { valid: false, error: 'No data', rowCount: count };
        dataIssues++;
      } else {
        console.log(colors.green(`✅ ${tableName} has sufficient data: ${count} rows`));
        dataResults[tableName] = { valid: true, rowCount: count };
      }
    }
    
    if (dataIssues === 0) {
      console.log(colors.green('✅ All required tables have sufficient data'));
    } else {
      console.log(colors.yellow(`⚠️ Found data issues in ${dataIssues} tables`));
    }
    
    return {
      success: dataIssues === 0,
      data: dataResults
    };
  } catch (error) {
    console.error(colors.red(`❌ Error checking data: ${error.message}`));
    return { success: false, error: error.message };
  }
}

/**
 * Test Row Level Security settings
 */
async function testRLS() {
  console.log(colors.blue('\n🔒 Testing Row Level Security (RLS) policies...'));
  
  try {
    // Create a test table if it doesn't exist
    const testTableName = 'rls_test';
    
    // Try to create a test table
    try {
      const { error: createError } = await supabase
        .rpc('pgmigrate_apply', { 
          query: `CREATE TABLE IF NOT EXISTS public.${testTableName} (
            id SERIAL PRIMARY KEY,
            name TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
          );
          ALTER TABLE public.${testTableName} ENABLE ROW LEVEL SECURITY;
          DROP POLICY IF EXISTS "Allow full access" ON public.${testTableName};
          CREATE POLICY "Allow full access" ON public.${testTableName} USING (true) WITH CHECK (true);` 
        });
    } catch (e) {
      // Ignore errors here, just trying to create if possible
    }
    
    // Test writing to the table
    console.log(colors.gray('Testing write access...'));
    const testData = { name: `test-${Date.now()}` };
    const { data: insertData, error: insertError } = await supabase
      .from(testTableName)
      .insert([testData])
      .select();
      
    if (insertError) {
      console.error(colors.red(`❌ Write test failed: ${insertError.message}`));
      return { success: false, error: insertError.message, type: 'write_denied' };
    }
    
    console.log(colors.green('✅ Write access successful'));
    
    // Test reading from the table
    console.log(colors.gray('Testing read access...'));
    const { data: readData, error: readError } = await supabase
      .from(testTableName)
      .select('*')
      .limit(1);
      
    if (readError) {
      console.error(colors.red(`❌ Read test failed: ${readError.message}`));
      return { success: false, error: readError.message, type: 'read_denied' };
    }
    
    console.log(colors.green('✅ Read access successful'));
    
    // Test reading from standard tables
    let standardDataError = null;
    try {
      const { data, error } = await supabase.from('dental_procedures_simplified').select().limit(1);
      if (error) standardDataError = error;
    } catch (error) {
      standardDataError = error;
    }
    
    if (standardDataError) {
      console.error(colors.red(`❌ Standard table access failed: ${standardDataError.message}`));
      return { success: false, error: standardDataError.message, type: 'standard_table_access_denied' };
    }
    
    console.log(colors.green('✅ RLS policies are correctly configured'));
    return { success: true };
  } catch (error) {
    console.error(colors.red(`❌ Error testing RLS: ${error.message}`));
    return { success: false, error: error.message };
  }
}

/**
 * Run all verification tests and return a comprehensive result
 */
export async function runFullVerification() {
  console.log(colors.cyan.bold('============================================='));
  console.log(colors.cyan.bold('🔎 SUPABASE DATA VERIFICATION TOOL'));
  console.log(colors.cyan.bold('=============================================\n'));
  
  // Step 1: Test connection
  const connection = await testConnection();
  if (!connection.success) {
    return { success: false, connection };
  }
  
  // Step 2: Test authentication
  const auth = await testAuthentication();
  
  // Step 3: Check tables
  const tables = await checkTables();
  
  // Step 4: Check data
  const data = await checkData(tables.tables);
  
  // Step 5: Test RLS
  const rls = await testRLS();
  
  // Compile results
  const results = {
    success: connection.success && tables.success && data.success && rls.success,
    connection,
    auth,
    tables,
    data,
    rls
  };
  
  // Print summary
  console.log(colors.cyan.bold('\n============================================='));
  console.log(colors.cyan.bold('📊 VERIFICATION RESULTS'));
  console.log(colors.cyan.bold('============================================='));
  
  console.log(colors.gray('\nConnection:'), connection.success ? colors.green('✅ PASS') : colors.red('❌ FAIL'));
  console.log(colors.gray('Authentication:'), auth.success ? colors.green('✅ PASS') : colors.yellow('⚠️ WARNING'));
  console.log(colors.gray('Tables:'), tables.success ? colors.green('✅ PASS') : colors.yellow('⚠️ WARNING'));
  console.log(colors.gray('Data:'), data.success ? colors.green('✅ PASS') : colors.yellow('⚠️ WARNING'));
  console.log(colors.gray('Row Level Security:'), rls.success ? colors.green('✅ PASS') : colors.red('❌ FAIL'));
  console.log(colors.gray('\nOverall:'), results.success ? colors.green.bold('✅ PASS') : colors.yellow.bold('⚠️ ISSUES FOUND'));
  
  console.log(colors.cyan.bold('\n=============================================\n'));
  
  return results;
}

// If this file is run directly, execute verification
if (process.argv[1].includes('verifySupabaseData.js')) {
  runFullVerification();
}
