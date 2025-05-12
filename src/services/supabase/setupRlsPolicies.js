// Script to set up Row Level Security (RLS) policies for Supabase tables
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import colors from 'colors';

// Configure colors
colors.enable();

// Load environment variables
dotenv.config();

console.log('\n=================================================='.cyan);
console.log('🔒 SUPABASE RLS POLICY SETUP'.brightWhite.bold);
console.log('==================================================\n'.cyan);

// Get Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase configuration in .env file'.red);
  console.error('Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set'.yellow);
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// List of tables that need RLS policies
const TABLES = [
  'dental_procedures_simplified',
  'aesthetic_procedures',
  'companies',
  'categories',
  'aesthetic_categories',
  'dental_market_growth',
  'aesthetic_market_growth',
  'news_articles'
];

// Function to create execute_sql function if it doesn't exist
async function createExecuteSqlFunction() {
  console.log('\nChecking for execute_sql function...'.yellow);

  try {
    // Try to call the function to see if it exists
    const { data, error } = await supabase.rpc('execute_sql', {
      sql_query: 'SELECT 1'
    });

    if (error && error.message.includes('function') && error.message.includes('does not exist')) {
      console.log('❌ execute_sql function does not exist. Will create it...'.red);

      // Create the execute_sql function
      const createFunctionQuery = `
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
      `;

      // Execute the creation query
      const { error: createError } = await supabase.rpc('execute_sql_with_results', {
        sql_query: createFunctionQuery
      });

      if (createError) {
        console.error('❌ Failed to create execute_sql function:'.red, createError.message);
        console.log('Attempting alternative method...'.yellow);

        // This might fail if execute_sql_with_results doesn't exist either
        // Try to create function via direct SQL (this may fail due to permissions)
        const { error: directError } = await supabase.from('_exec_sql').insert({
          query: createFunctionQuery
        });

        if (directError) {
          console.error('❌ Alternative method also failed:'.red, directError.message);
          console.log('You may need to manually create the execute_sql function in the SQL Editor:'.yellow);
          console.log(createFunctionQuery.gray);
          return false;
        }

        console.log('✅ Created execute_sql function via alternative method'.green);
        return true;
      }

      console.log('✅ Created execute_sql function'.green);
      return true;
    } else if (error) {
      console.error('❌ Error checking for execute_sql function:'.red, error.message);
      return false;
    } else {
      console.log('✅ execute_sql function already exists'.green);
      return true;
    }
  } catch (err) {
    console.error('❌ Unexpected error checking for execute_sql function:'.red, err.message);
    return false;
  }
}

// Function to create execute_sql_with_results function if it doesn't exist
async function createExecuteSqlWithResultsFunction() {
  console.log('\nChecking for execute_sql_with_results function...'.yellow);

  try {
    // Try to call the function to see if it exists
    const { data, error } = await supabase.rpc('execute_sql_with_results', {
      sql_query: 'SELECT 1 as test'
    });

    if (error && error.message.includes('function') && error.message.includes('does not exist')) {
      console.log('❌ execute_sql_with_results function does not exist. Will create it...'.red);

      // Create the execute_sql_with_results function
      const createFunctionQuery = `
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
      `;

      // We can't use execute_sql_with_results to create itself
      // Try to create function via direct SQL (this may fail due to permissions)
      const { error: directError } = await supabase.from('_exec_sql').insert({
        query: createFunctionQuery
      });

      if (directError) {
        console.error('❌ Failed to create execute_sql_with_results function:'.red, directError.message);
        console.log('Attempting fallback to regular execute_sql...'.yellow);

        // Try using execute_sql if it exists
        const { error: execError } = await supabase.rpc('execute_sql', {
          sql_query: createFunctionQuery
        });

        if (execError) {
          console.error('❌ Fallback also failed:'.red, execError.message);
          console.log('You may need to manually create the execute_sql_with_results function in the SQL Editor:'.yellow);
          console.log(createFunctionQuery.gray);
          return false;
        }

        console.log('✅ Created execute_sql_with_results function via execute_sql'.green);
        return true;
      }

      console.log('✅ Created execute_sql_with_results function'.green);
      return true;
    } else if (error) {
      console.error('❌ Error checking for execute_sql_with_results function:'.red, error.message);
      return false;
    } else {
      console.log('✅ execute_sql_with_results function already exists'.green);
      return true;
    }
  } catch (err) {
    console.error('❌ Unexpected error checking for execute_sql_with_results function:'.red, err.message);
    return false;
  }
}

// Function to get existing tables
async function getExistingTables() {
  console.log('\nFetching list of existing tables...'.yellow);

  try {
    // Try to get table list using execute_sql_with_results
    const { data, error } = await supabase.rpc('execute_sql_with_results', {
      sql_query: `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      `
    });

    if (error) {
      console.error('❌ Failed to fetch tables:'.red, error.message);
      return null;
    }

    if (!data || data.length === 0) {
      console.log('⚠️ No tables found in the database'.yellow);
      return [];
    }

    const tables = data.map(row => row.table_name);
    console.log(`✅ Found ${tables.length} tables`.green);
    return tables;
  } catch (err) {
    console.error('❌ Unexpected error fetching tables:'.red, err.message);
    return null;
  }
}

// Function to check if a table has RLS enabled
async function hasRlsEnabled(tableName) {
  try {
    const { data, error } = await supabase.rpc('execute_sql_with_results', {
      sql_query: `
        SELECT relrowsecurity
        FROM pg_class
        WHERE relname = '${tableName}'
        AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
      `
    });

    if (error) {
      console.error(`❌ Failed to check RLS status for ${tableName}:`.red, error.message);
      return null;
    }

    if (!data || data.length === 0) {
      console.log(`⚠️ Table '${tableName}' not found`.yellow);
      return null;
    }

    return data[0].relrowsecurity;
  } catch (err) {
    console.error(`❌ Unexpected error checking RLS for ${tableName}:`.red, err.message);
    return null;
  }
}

// Function to enable RLS on a table
async function enableRls(tableName) {
  console.log(`\nEnabling RLS for table '${tableName}'...`.yellow);

  try {
    const rlsStatus = await hasRlsEnabled(tableName);
    
    if (rlsStatus === null) {
      return false;
    }
    
    if (rlsStatus === true) {
      console.log(`✅ RLS is already enabled for table '${tableName}'`.green);
      return true;
    }

    const { error } = await supabase.rpc('execute_sql', {
      sql_query: `ALTER TABLE public."${tableName}" ENABLE ROW LEVEL SECURITY;`
    });

    if (error) {
      console.error(`❌ Failed to enable RLS for table '${tableName}':`.red, error.message);
      return false;
    }

    console.log(`✅ RLS enabled for table '${tableName}'`.green);
    return true;
  } catch (err) {
    console.error(`❌ Unexpected error enabling RLS for ${tableName}:`.red, err.message);
    return false;
  }
}

// Function to check if an RLS policy exists for a table
async function hasPolicy(tableName, policyName) {
  try {
    const { data, error } = await supabase.rpc('execute_sql_with_results', {
      sql_query: `
        SELECT policyname
        FROM pg_policies
        WHERE tablename = '${tableName}'
        AND policyname = '${policyName}'
      `
    });

    if (error) {
      console.error(`❌ Failed to check policy for ${tableName}:`.red, error.message);
      return false;
    }

    return data && data.length > 0;
  } catch (err) {
    console.error(`❌ Unexpected error checking policy for ${tableName}:`.red, err.message);
    return false;
  }
}

// Function to create a select policy for a table
async function createSelectPolicy(tableName) {
  const policyName = `${tableName}_anon_select`;
  console.log(`\nCreating SELECT policy '${policyName}' for table '${tableName}'...`.yellow);

  try {
    const policyExists = await hasPolicy(tableName, policyName);
    
    if (policyExists) {
      console.log(`✅ Policy '${policyName}' already exists for table '${tableName}'`.green);
      return true;
    }

    const { error } = await supabase.rpc('execute_sql', {
      sql_query: `
        CREATE POLICY "${policyName}"
        ON public."${tableName}"
        FOR SELECT
        TO authenticated, anon
        USING (true);
      `
    });

    if (error) {
      console.error(`❌ Failed to create policy for table '${tableName}':`.red, error.message);
      return false;
    }

    console.log(`✅ Created SELECT policy for table '${tableName}'`.green);
    return true;
  } catch (err) {
    console.error(`❌ Unexpected error creating policy for ${tableName}:`.red, err.message);
    return false;
  }
}

// Main function to set up RLS policies
async function setupRlsPolicies() {
  console.log('Starting RLS policy setup...'.cyan);

  // Create necessary SQL execution functions
  await createExecuteSqlFunction();
  await createExecuteSqlWithResultsFunction();

  // Get list of all tables in the database
  const existingTables = await getExistingTables();
  
  if (!existingTables) {
    console.error('❌ Failed to get table list, cannot proceed'.red);
    return false;
  }

  console.log('\nFound tables:'.cyan, existingTables.join(', '));

  // Combine predefined tables with any additional ones from the database
  const allTables = Array.from(new Set([...TABLES, ...existingTables]));

  // Set up RLS for each table
  const results = {};
  
  for (const tableName of allTables) {
    // Skip system tables
    if (tableName.startsWith('_') || tableName.startsWith('pg_')) {
      continue;
    }
    
    const enabled = await enableRls(tableName);
    
    if (enabled) {
      const policyCreated = await createSelectPolicy(tableName);
      results[tableName] = policyCreated;
    } else {
      results[tableName] = false;
    }
  }

  // Display summary
  console.log('\n=================================================='.cyan);
  console.log('🔍 RLS POLICY SETUP SUMMARY'.brightWhite.bold);
  console.log('==================================================\n'.cyan);

  let successCount = 0;
  let failCount = 0;

  for (const [tableName, success] of Object.entries(results)) {
    if (success) {
      successCount++;
      console.log(`✅ ${tableName}: RLS and policies set up successfully`.green);
    } else {
      failCount++;
      console.log(`❌ ${tableName}: Failed to set up RLS or policies`.red);
    }
  }

  console.log(`\nTotal: ${successCount} succeeded, ${failCount} failed`.cyan);

  if (failCount > 0) {
    console.log('\nFor tables that failed, you may need to manually set up RLS:'.yellow);
    console.log('1. Go to the Supabase dashboard and navigate to the SQL Editor'.gray);
    console.log('2. Execute the following SQL for each failed table:'.gray);
    console.log(`   ALTER TABLE public.TABLE_NAME ENABLE ROW LEVEL SECURITY;`.gray);
    console.log(`   CREATE POLICY "TABLE_NAME_anon_select" ON public.TABLE_NAME FOR SELECT TO authenticated, anon USING (true);`.gray);
  }

  return successCount > 0;
}

// Function to provide recommendations based on the setup results
function provideRecommendations(success) {
  console.log('\n=================================================='.cyan);
  console.log('🔧 RECOMMENDATIONS'.brightWhite.bold);
  console.log('==================================================\n'.cyan);
  
  if (success) {
    console.log('✅ RLS policies have been set up successfully!'.green);
    console.log('\nNext steps:'.cyan);
    console.log('1. Run your application to verify data access is working:'.cyan);
    console.log('   npm run dev'.gray);
    console.log('2. If you still have issues, check the database connection:'.cyan);
    console.log('   node src/services/supabase/nodeDatabaseTest.js'.gray);
  } else {
    console.log('❌ There were issues setting up RLS policies.'.red);
    console.log('\nTry these solutions:'.cyan);
    
    console.log('\n1. Check your Supabase connection:'.yellow);
    console.log('   node src/services/supabase/checkProjectAvailability.js'.gray);
    
    console.log('\n2. Run database diagnostics:'.yellow);
    console.log('   node src/services/supabase/nodeDatabaseTest.js'.gray);
    
    console.log('\n3. Set up RLS manually in Supabase SQL Editor:'.yellow);
    console.log('   Execute the SQL commands shown earlier for each table'.gray);
    
    console.log('\n4. Check your environment variables:'.yellow);
    console.log('   Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are correct in .env'.gray);
  }
}

// Main function
async function main() {
  const success = await setupRlsPolicies();
  provideRecommendations(success);
  
  console.log('\nSetup completed at', new Date().toLocaleString());
  console.log('\n==================================================\n'.cyan);
}

// Run the main function
main().catch(err => {
  console.error('Unexpected error during setup:'.red, err);
  process.exit(1);
});
