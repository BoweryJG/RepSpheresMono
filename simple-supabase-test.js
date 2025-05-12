// Simple script to test and fix Supabase connection
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

// Simple colored console logging
const log = {
  info: (msg) => console.log('\x1b[36m%s\x1b[0m', msg), // Cyan
  success: (msg) => console.log('\x1b[32m%s\x1b[0m', msg), // Green
  error: (msg) => console.log('\x1b[31m%s\x1b[0m', msg), // Red
  warning: (msg) => console.log('\x1b[33m%s\x1b[0m', msg), // Yellow
};

log.info("\n=== SUPABASE CONNECTION TEST ===\n");

// Check if credentials exist
if (!supabaseUrl || !supabaseKey) {
  log.error("❌ Missing Supabase credentials in your .env file!");
  log.info("Make sure you have these variables in your .env file:");
  console.log("VITE_SUPABASE_URL=your_supabase_url");
  console.log("VITE_SUPABASE_ANON_KEY=your_anon_key");
  process.exit(1);
}

log.success("✓ Supabase credentials found in environment variables");

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Main function
async function testConnection() {
  try {
    // 1. Test basic connection
    log.info("\nTesting Supabase connection...");
    
    // Simple ping test using fetch
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: {
          'apikey': supabaseKey,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        log.success("✓ Supabase API is accessible");
      } else {
        log.error(`❌ Connection test failed: HTTP ${response.status}`);
        const text = await response.text();
        console.log("Response:", text);
      }
    } catch (err) {
      log.error(`❌ Connection test failed: ${err.message}`);
    }
    
    // 2. List available tables
    log.info("\nListing available tables...");
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_type', 'BASE TABLE');
      
    if (tablesError) {
      log.error(`❌ Error fetching tables: ${tablesError.message}`);
      
      log.info("\nTrying alternative method to list tables...");
      // Alternative way to list tables
      const { data, error } = await supabase
        .rpc('list_tables')
        .select('*');
      
      if (error) {
        log.error(`❌ Alternative method failed: ${error.message}`);
      } else if (data && data.length > 0) {
        log.success(`✓ Found ${data.length} tables using RPC method`);
        console.log(data.map(t => t.table_name).join(', '));
      } else {
        log.warning("⚠️ No tables found or RPC method not available");
      }
    } else if (tables && tables.length > 0) {
      log.success(`✓ Found ${tables.length} tables`);
      console.log(tables.map(t => t.table_name).join(', '));
    } else {
      log.warning("⚠️ No tables found in the database");
    }
    
    // 3. Test data retrieval from a few common tables
    log.info("\nTesting data retrieval from common tables...");
    
    const tablesToTest = [
      'companies', 
      'dental_procedures', 
      'aesthetic_procedures',
      'news_articles',
      'market_growth'
    ];
    
    let dataFound = false;
    
    for (const table of tablesToTest) {
      log.info(`Querying table '${table}'...`);
      
      try {
        const { data, error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact' })
          .limit(1);
          
        if (error) {
          log.warning(`⚠️ Couldn't query '${table}': ${error.message}`);
        } else if (data && data.length > 0) {
          log.success(`✓ Successfully retrieved data from '${table}' (${count} records total)`);
          dataFound = true;
        } else {
          log.warning(`⚠️ Table '${table}' exists but has no data`);
        }
      } catch (err) {
        log.warning(`⚠️ Error testing '${table}': ${err.message}`);
      }
    }
    
    if (!dataFound) {
      log.error("\n❌ No data could be retrieved from any of the common tables");
      log.error("You may need to check if your data has been loaded properly");
    }
    
    // 4. Attempt simple RLS settings if needed
    log.info("\nChecking if tables need RLS policies...");
    
    try {
      // Try to directly query RLS settings
      const { data: rlsData, error: rlsError } = await supabase
        .from('information_schema.policies')
        .select('*')
        .eq('table_schema', 'public');
        
      if (rlsError) {
        log.warning(`⚠️ Cannot check RLS status: ${rlsError.message}`);
      } else if (rlsData && rlsData.length > 0) {
        log.success(`✓ Found ${rlsData.length} RLS policies configured`);
      } else {
        log.warning("⚠️ No RLS policies found, tables may be inaccessible to the application");
      }
    } catch (err) {
      log.warning(`⚠️ Error checking RLS: ${err.message}`);
    }
    
    // Final status
    log.info("\n=== CONNECTION TEST COMPLETE ===");
    
    log.info("\nRecommendations:");
    log.info("1. Check your Supabase dashboard to ensure your project is active");
    log.info("2. If tables aren't showing up, you may need to run your data loader scripts");
    log.info("3. For RLS issues, use the Supabase dashboard -> Authentication -> Policies");
    log.info("4. To refresh your data, run: node src/services/supabase/refreshSupabaseData.js");
    
  } catch (err) {
    log.error(`\n❌ Unexpected error: ${err.message}`);
    console.error(err);
  }
}

// Run the test
testConnection();
