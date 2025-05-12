// Simple Supabase database connection test
import { supabase } from './supabaseClient.js';
import colors from 'colors';

colors.enable();

console.log('\n=================================================='.cyan);
console.log('🔍 SUPABASE DATABASE CONNECTION DIAGNOSTICS'.brightWhite.bold);
console.log('==================================================\n'.cyan);

// Get current timestamp for logging
const timestamp = new Date().toLocaleString();
console.log(`Test started at: ${timestamp}`.gray);

// Test connection to Supabase
async function testConnection() {
  try {
    console.log('Testing connection to Supabase...'.yellow);
    
    // Simple query to test connection - fetch version info
    const { data, error } = await supabase.rpc('version');
    
    if (error) {
      console.error('❌ Connection error:'.red, error.message);
      return false;
    }
    
    console.log('✅ Successfully connected to Supabase!'.green);
    console.log(`   Server info: ${JSON.stringify(data)}`.gray);
    return true;
  } catch (err) {
    console.error('❌ Connection test failed:'.red, err.message);
    return false;
  }
}

// Check database settings
async function checkDatabaseSettings() {
  try {
    console.log('\nChecking Supabase configuration...'.yellow);
    
    // Extract and display basic info
    const url = supabase.supabaseUrl;
    const anonKey = supabase.supabaseKey;
    const maskedKey = anonKey ? `${anonKey.substring(0, 5)}...${anonKey.substring(anonKey.length - 5)}` : 'Not set';
    
    console.log(`   URL: ${url || 'Not set'}`.cyan);
    console.log(`   API Key: ${maskedKey}`.cyan);
    
    // Check environment variables
    console.log('\nEnvironment Variables:'.yellow);
    
    const envVars = [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY',
      'VITE_SUPABASE_SERVICE_KEY',
      'VITE_SUPABASE_USER',
      'VITE_SUPABASE_PASSWORD'
    ];
    
    for (const envVar of envVars) {
      const value = process.env[envVar] || import.meta.env?.[envVar];
      const isSet = !!value;
      
      if (isSet) {
        // Mask sensitive values
        const maskedValue = envVar.includes('KEY') || envVar.includes('PASSWORD') ? 
          `${value.substring(0, 3)}...${value.substring(value.length - 3)}` : 
          value;
          
        console.log(`   ${envVar}: ${maskedValue}`.green);
      } else {
        console.log(`   ${envVar}: Not set`.red);
      }
    }
    
    return true;
  } catch (err) {
    console.error('❌ Error checking database settings:'.red, err.message);
    return false;
  }
}

// Test actual data queries
async function testDataQueries() {
  try {
    console.log('\nTesting data queries...'.yellow);
    
    // List of tables to test
    const tables = [
      'dental_procedures_simplified',
      'aesthetic_procedures',
      'companies',
      'categories',
      'aesthetic_categories',
      'dental_market_growth',
      'aesthetic_market_growth'
    ];
    
    const results = {};
    
    // Test each table
    for (const table of tables) {
      console.log(`   Testing table '${table}'...`.cyan);
      
      // Try to fetch a count from the table
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error(`   ❌ Error querying table '${table}':`.red, error.message);
        results[table] = { success: false, error: error.message };
      } else {
        console.log(`   ✅ Successfully accessed table '${table}'`.green);
        console.log(`      Row count: ${count}`.gray);
        results[table] = { success: true, count };
      }
    }
    
    // Display summary
    console.log('\nQuery Test Summary:'.yellow);
    let successCount = 0;
    let failCount = 0;
    
    for (const [table, result] of Object.entries(results)) {
      if (result.success) {
        successCount++;
        console.log(`   ✅ ${table}: ${result.count} rows`.green);
      } else {
        failCount++;
        console.log(`   ❌ ${table}: ${result.error}`.red);
      }
    }
    
    console.log(`\n   Total: ${successCount} succeeded, ${failCount} failed`.cyan);
    
    return successCount > 0;
  } catch (err) {
    console.error('❌ Error running data queries:'.red, err.message);
    return false;
  }
}

// Check Row Level Security policies
async function checkRlsPolicies() {
  try {
    console.log('\nChecking RLS policies...'.yellow);
    
    // Try to get RLS policy information via SQL
    const { data, error } = await supabase.rpc('execute_sql_with_results', {
      sql_query: `
        SELECT
          schemaname,
          tablename,
          policyname,
          permissive,
          roles,
          cmd,
          qual
        FROM
          pg_policies
        WHERE
          schemaname = 'public'
        ORDER BY
          tablename, policyname;
      `
    });
    
    if (error) {
      console.error('❌ Error checking RLS policies:'.red, error.message);
      console.log('   This function requires special permissions or the SQL execution function.'.gray);
      
      // Alternative approach - test individual tables for RLS effects
      console.log('\nTesting RLS access by role...'.yellow);
      
      // Here we can only test the effect of RLS indirectly
      // by seeing if we can access data as the anon role
      const tables = [
        'dental_procedures_simplified',
        'aesthetic_procedures',
        'companies'
      ];
      
      for (const table of tables) {
        const { data: tableData, error: tableError } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (tableError) {
          console.log(`   ❌ Table '${table}' access failed: ${tableError.message}`.red);
          console.log(`      This might indicate RLS is enabled but no policies grant access`.gray);
        } else if (tableData && tableData.length > 0) {
          console.log(`   ✅ Table '${table}' is accessible (with or without RLS)`.green);
        } else {
          console.log(`   ⚠️ Table '${table}' returned no data, can't determine RLS state`.yellow);
        }
      }
    } else if (data && data.length > 0) {
      console.log('✅ RLS policies found:'.green);
      
      // Group policies by table
      const policiesByTable = {};
      
      for (const policy of data) {
        const tableName = policy.tablename;
        
        if (!policiesByTable[tableName]) {
          policiesByTable[tableName] = [];
        }
        
        policiesByTable[tableName].push(policy);
      }
      
      // Display policies by table
      for (const [table, policies] of Object.entries(policiesByTable)) {
        console.log(`\n   Table: ${table}`.cyan);
        
        for (const policy of policies) {
          console.log(`     - ${policy.policyname}`.green);
          console.log(`       Command: ${policy.cmd}, Roles: ${policy.roles.join(', ')}`.gray);
        }
      }
    } else {
      console.log('⚠️ No RLS policies found. Tables might be publicly accessible or RLS not enabled.'.yellow);
    }
    
    return true;
  } catch (err) {
    console.error('❌ Error checking RLS policies:'.red, err.message);
    return false;
  }
}

// Suggest possible fixes based on test results
function suggestFixes(connectionResult, dataResult, rlsResult) {
  console.log('\n=================================================='.cyan);
  console.log('🔧 DIAGNOSTICS RESULTS & RECOMMENDATIONS'.brightWhite.bold);
  console.log('==================================================\n'.cyan);
  
  if (!connectionResult) {
    console.log('❌ Connection issues detected:'.red);
    console.log('   1. Check your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env file'.yellow);
    console.log('   2. Verify your Supabase project is running and not in maintenance mode'.yellow);
    console.log('   3. Check for network issues between your environment and Supabase'.yellow);
    console.log('   4. If using a local dev server, ensure cors policy allows your origin'.yellow);
  }
  
  if (connectionResult && !dataResult) {
    console.log('❌ Data access issues detected:'.red);
    console.log('   1. RLS policies may be blocking access - check your policies'.yellow);
    console.log('   2. Tables might not exist - verify schema setup'.yellow);
    console.log('   3. Run database setup scripts from the console:'.yellow);
    console.log('      node src/services/supabase/runSetupRls.js'.gray);
    console.log('   4. Manually execute this SQL in Supabase SQL Editor:'.yellow);
    console.log('      ALTER TABLE public.dental_procedures_simplified ENABLE ROW LEVEL SECURITY;'.gray);
    console.log('      CREATE POLICY "dental_procedures_simplified_anon_select" ON public.dental_procedures_simplified FOR SELECT TO authenticated, anon USING (true);'.gray);
  }
  
  if (connectionResult && dataResult) {
    console.log('✅ Connection and data access look good.'.green);
    
    if (!rlsResult) {
      console.log('⚠️ Row Level Security might not be properly configured:'.yellow);
      console.log('   For proper security, ensure RLS is enabled and proper policies are in place.'.yellow);
    }
  }
}

// Main function to run all tests
async function runTests() {
  // Test connection
  const connectionResult = await testConnection();
  
  // Check database settings
  await checkDatabaseSettings();
  
  // Test data queries (only if connection succeeded)
  const dataResult = connectionResult ? await testDataQueries() : false;
  
  // Check RLS policies (only if data query succeeded)
  const rlsResult = dataResult ? await checkRlsPolicies() : false;
  
  // Suggest possible fixes
  suggestFixes(connectionResult, dataResult, rlsResult);
  
  console.log('\nDiagnostics completed at', new Date().toLocaleString());
  console.log('\n==================================================\n'.cyan);
}

// Run all tests
runTests();
