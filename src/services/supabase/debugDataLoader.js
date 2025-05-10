import { supabaseClient } from './supabaseClient.js';
import { 
  dentalProcedures, 
  dentalCategories
} from '../../data/dentalProcedures.js';
import { 
  aestheticProcedures, 
  aestheticCategories
} from '../../data/aestheticProcedures.js';

// Debug function
const debug = (message, data = null) => {
  console.log(`\x1b[36m[DEBUG]\x1b[0m ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
};

// Error function
const logError = (message, error) => {
  console.error(`\x1b[31m[ERROR]\x1b[0m ${message}`);
  console.error(error);
};

/**
 * Test Supabase connection
 */
const testConnection = async () => {
  try {
    debug('Testing Supabase connection...');
    
    // Simple query to test connection
    const { data, error } = await supabaseClient
      .from('_test_connection')
      .select('*')
      .limit(1)
      .catch(e => ({ data: null, error: e }));
    
    if (error) {
      // This is expected for non-existent table, but should still connect
      debug('Connection test query returned error (expected)', error.message);
      
      // Check if we can get database schema info
      const { data: schemaData, error: schemaError } = await supabaseClient
        .rpc('get_schema_info')
        .catch(e => ({ data: null, error: e }));
      
      if (schemaError) {
        if (schemaError.message.includes('does not exist')) {
          debug('RPC function not available, but connection seems to be working');
          return true;
        } else {
          logError('Failed to get schema info', schemaError);
          return false;
        }
      } else {
        debug('Successfully connected to Supabase and fetched schema info');
        return true;
      }
    } else {
      debug('Successfully connected to Supabase');
      return true;
    }
  } catch (error) {
    logError('Error testing connection:', error);
    return false;
  }
};

/**
 * Load a sample of data to test
 */
const loadSampleData = async () => {
  try {
    debug('Attempting to load sample data...');
    
    // Try to load a single dental category
    debug('Loading a sample dental category...');
    const sampleCategory = dentalCategories[0];
    debug('Sample dental category to load:', sampleCategory);
    
    const { data: catData, error: catError } = await supabaseClient
      .from('dental_categories')
      .upsert({ category_label: sampleCategory }, { onConflict: 'category_label' })
      .select();
    
    if (catError) {
      logError('Failed to load sample dental category', catError);
      
      // Check if the table exists
      debug('Checking if dental_categories table exists...');
      const { data: tableInfo, error: tableError } = await supabaseClient
        .rpc('get_table_info', { tablename: 'dental_categories' })
        .catch(e => ({ data: null, error: e }));
      
      if (tableError) {
        logError('Failed to check if table exists', tableError);
        return false;
      } else if (!tableInfo || tableInfo.length === 0) {
        debug('Table dental_categories does not exist. Database schema may need to be created.');
        return false;
      }
    } else {
      debug('Successfully loaded dental category:', catData);
      
      // Try to load a single aesthetic category
      debug('Loading a sample aesthetic category...');
      const sampleAestheticCategory = aestheticCategories[0];
      debug('Sample aesthetic category to load:', sampleAestheticCategory);
      
      const { data: aestheticCatData, error: aestheticCatError } = await supabaseClient
        .from('aesthetic_categories')
        .upsert({ name: sampleAestheticCategory }, { onConflict: 'name' })
        .select();
      
      if (aestheticCatError) {
        logError('Failed to load sample aesthetic category', aestheticCatError);
        return false;
      } else {
        debug('Successfully loaded aesthetic category:', aestheticCatData);
        return true;
      }
    }
  } catch (error) {
    logError('Error loading sample data:', error);
    return false;
  }
};

/**
 * List existing tables in the Supabase database
 */
const listTables = async () => {
  try {
    debug('Fetching list of tables in the database...');
    
    // This query works for PostgreSQL to list all tables in the public schema
    const { data, error } = await supabaseClient.rpc('get_tables_info');
    
    if (error) {
      // If the RPC function doesn't exist, try a raw SQL query
      debug('RPC method failed, trying raw SQL query...');
      
      const { data: sqlData, error: sqlError } = await supabaseClient
        .from('pg_tables')
        .select('schemaname, tablename')
        .eq('schemaname', 'public');
      
      if (sqlError) {
        logError('Failed to list tables using SQL query', sqlError);
        return [];
      } else {
        debug('Successfully fetched tables:');
        debug('Tables:', sqlData);
        return sqlData;
      }
    } else {
      debug('Successfully fetched tables:');
      debug('Tables:', data);
      return data;
    }
  } catch (error) {
    logError('Error listing tables:', error);
    return [];
  }
};

/**
 * Main function to debug Supabase data loading
 */
const debugDataLoading = async () => {
  console.log('\n=== STARTING SUPABASE DATA LOADING DEBUG ===\n');
  
  try {
    // Test the connection
    debug('Step 1: Testing Supabase connection');
    const connectionSuccess = await testConnection();
    
    if (!connectionSuccess) {
      debug('❌ Supabase connection test failed. Check your credentials and connection.');
      return { success: false, message: 'Connection to Supabase failed' };
    }
    
    debug('✅ Supabase connection test successful');
    
    // List existing tables
    debug('\nStep 2: Checking existing tables in the database');
    const tables = await listTables();
    
    if (!tables || tables.length === 0) {
      debug('⚠️ No tables found. Schema may need to be created.');
    } else {
      debug(`✅ Found ${tables.length} tables in the database`);
    }
    
    // Try loading sample data
    debug('\nStep 3: Testing sample data loading');
    const sampleDataSuccess = await loadSampleData();
    
    if (!sampleDataSuccess) {
      debug('❌ Sample data loading failed. Check the table schema and data format.');
      return { success: false, message: 'Sample data loading failed' };
    }
    
    debug('✅ Sample data loading successful');
    
    // Log environment variables (obscuring sensitive parts)
    debug('\nStep 4: Checking environment configuration');
    debug('SUPABASE_URL (truncated):', `${process.env.VITE_SUPABASE_URL?.substring(0, 10)}...`);
    debug('SUPABASE_ANON_KEY exists:', !!process.env.VITE_SUPABASE_ANON_KEY);
    
    debug('\n=== DEBUG COMPLETED SUCCESSFULLY ===\n');
    return { success: true, message: 'Debug process completed successfully' };
  } catch (error) {
    logError('Unexpected error during debug process:', error);
    return { success: false, error: error.message };
  }
};

// Run the debug function
debugDataLoading()
  .then((result) => {
    console.log('\n=== FINAL RESULT ===');
    console.log(result);
    
    if (result.success) {
      console.log('\n✅ Debug completed successfully. You can proceed with regular data loading.');
      process.exit(0);
    } else {
      console.error('\n❌ Debug process failed:', result.message || result.error);
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('\n❌ Fatal error during debug execution:', error);
    process.exit(1);
  });
