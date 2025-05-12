// Script to fix market growth table column references
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import colors from 'colors';

colors.enable();

// Load environment variables
dotenv.config();

console.log('\n=================================================='.cyan);
console.log('🔧 MARKET GROWTH TABLE COLUMN REFERENCE FIX TOOL'.brightWhite.bold);
console.log('==================================================\n'.cyan);

// Get timestamp for logging
const timestamp = new Date().toLocaleString();
console.log(`Fix started at: ${timestamp}`.gray);

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

// Function to execute SQL with error handling
async function executeSql(sql, description) {
  try {
    console.log(`${description}...`.yellow);
    
    // Try to use the execute_sql function if it exists
    const { error: rpcError } = await supabase.rpc('execute_sql', { sql_query: sql });
    
    if (rpcError) {
      console.log(`Using direct SQL execution for ${description} (RPC error: ${rpcError.message})`.gray);
      
      // Fall back to direct query if RPC fails
      const { error: directError } = await supabase.functions.invoke('pg', {
        body: { query: sql }
      });
      
      if (directError) {
        console.error(`❌ Error ${description.toLowerCase()}: ${directError.message}`.red);
        return false;
      }
    }
    
    console.log(`✅ ${description} completed successfully`.green);
    return true;
  } catch (err) {
    console.error(`❌ Error ${description.toLowerCase()}: ${err.message}`.red);
    return false;
  }
}

// Function to check if a column exists in a table
async function checkColumnExists(tableName, columnName) {
  try {
    console.log(`Checking if ${columnName} exists in ${tableName}...`.yellow);
    
    // Use system_columns RPC function if exists
    try {
      const { data, error: systemError } = await supabase.rpc('system_columns', {
        table_name: tableName
      });
      
      if (!systemError && data && Array.isArray(data)) {
        const columnExists = data.some(col => col.column_name === columnName);
        if (columnExists) {
          console.log(`✅ Column ${columnName} exists in ${tableName}`.green);
        } else {
          console.log(`❌ Column ${columnName} does not exist in ${tableName}`.yellow);
        }
        return columnExists;
      }
    } catch (rpcError) {
      // RPC function doesn't exist, use a different approach
      console.log(`System columns RPC not available: ${rpcError.message}`.gray);
    }
    
    // Direct query approach
    const { data, error } = await supabase
      .from(tableName)
      .select(columnName)
      .limit(1);
      
    if (error) {
      if (error.message.includes('column') && error.message.includes('does not exist')) {
        console.log(`❌ Column ${columnName} does not exist in ${tableName}`.yellow);
        return false;
      } else {
        console.error(`❌ Error checking column ${columnName} in ${tableName}: ${error.message}`.red);
        return null;
      }
    }
    
    console.log(`✅ Column ${columnName} exists in ${tableName}`.green);
    return true;
  } catch (err) {
    console.error(`❌ Error checking column ${columnName} in ${tableName}: ${err.message}`.red);
    return null;
  }
}

// SQL for ensuring dental_market_growth foreign key references
const dentalMarketGrowthReferencesSQL = `
-- Make sure the category_id references the correct table
ALTER TABLE public.dental_market_growth 
  DROP CONSTRAINT IF EXISTS dental_market_growth_category_id_fkey,
  ADD CONSTRAINT dental_market_growth_category_id_fkey 
    FOREIGN KEY (category_id) REFERENCES public.categories(id);

-- Make sure the procedure_id references the correct table
ALTER TABLE public.dental_market_growth 
  DROP CONSTRAINT IF EXISTS dental_market_growth_procedure_id_fkey,
  ADD CONSTRAINT dental_market_growth_procedure_id_fkey 
    FOREIGN KEY (procedure_id) REFERENCES public.dental_procedures_simplified(id);
`;

// SQL for ensuring aesthetic_market_growth foreign key references
const aestheticMarketGrowthReferencesSQL = `
-- Make sure the category_id references the correct table
ALTER TABLE public.aesthetic_market_growth 
  DROP CONSTRAINT IF EXISTS aesthetic_market_growth_category_id_fkey,
  ADD CONSTRAINT aesthetic_market_growth_category_id_fkey 
    FOREIGN KEY (category_id) REFERENCES public.aesthetic_categories(id);

-- Make sure the procedure_id references the correct table
ALTER TABLE public.aesthetic_market_growth 
  DROP CONSTRAINT IF EXISTS aesthetic_market_growth_procedure_id_fkey,
  ADD CONSTRAINT aesthetic_market_growth_procedure_id_fkey 
    FOREIGN KEY (procedure_id) REFERENCES public.aesthetic_procedures(id);
`;

// Function to check database connection and proper API key
async function checkConnection() {
  try {
    console.log('Checking database connection...'.yellow);
    
    const { data, error, count } = await supabase
      .from('aesthetic_categories')
      .select('*', { count: 'exact', head: true });
      
    if (error) {
      console.error(`❌ Database connection error: ${error.message}`.red);
      return false;
    }
    
    console.log(`✅ Database connection successful. Found ${count} aesthetic categories.`.green);
    return true;
  } catch (err) {
    console.error(`❌ Database connection error: ${err.message}`.red);
    return false;
  }
}

// Main function
async function main() {
  console.log('\n=================================================='.cyan);
  console.log('🔍 STARTING COLUMN REFERENCE FIXES'.brightWhite.bold);
  console.log('==================================================\n'.cyan);
  
  // First verify database connection
  const connectionOk = await checkConnection();
  if (!connectionOk) {
    console.error('❌ Cannot proceed due to database connection issues'.red);
    console.log('Please check your .env file and make sure SUPABASE_URL and SUPABASE_SERVICE_KEY are correct');
    process.exit(1);
  }
  
  // Check dental_market_growth table columns
  console.log('\nChecking dental_market_growth table columns...'.cyan);
  const dentalCategoryIdExists = await checkColumnExists('dental_market_growth', 'category_id');
  const dentalProcedureIdExists = await checkColumnExists('dental_market_growth', 'procedure_id');
  
  // Check aesthetic_market_growth table columns
  console.log('\nChecking aesthetic_market_growth table columns...'.cyan);
  const aestheticCategoryIdExists = await checkColumnExists('aesthetic_market_growth', 'category_id');
  const aestheticProcedureIdExists = await checkColumnExists('aesthetic_market_growth', 'procedure_id');
  
  // Fix dental_market_growth foreign keys if needed
  if (dentalCategoryIdExists !== false && dentalProcedureIdExists !== false) {
    console.log('\nFixing dental_market_growth foreign key references...'.cyan);
    const dentalReferencesFixed = await executeSql(
      dentalMarketGrowthReferencesSQL,
      'Fixing dental market growth table references'
    );
    
    if (!dentalReferencesFixed) {
      console.error('❌ Failed to fix dental market growth table references'.red);
    }
  } else {
    console.error('❌ Cannot fix dental market growth references - columns missing'.red);
  }
  
  // Fix aesthetic_market_growth foreign keys if needed
  if (aestheticCategoryIdExists !== false && aestheticProcedureIdExists !== false) {
    console.log('\nFixing aesthetic_market_growth foreign key references...'.cyan);
    const aestheticReferencesFixed = await executeSql(
      aestheticMarketGrowthReferencesSQL,
      'Fixing aesthetic market growth table references'
    );
    
    if (!aestheticReferencesFixed) {
      console.error('❌ Failed to fix aesthetic market growth table references'.red);
    }
  } else {
    console.error('❌ Cannot fix aesthetic market growth references - columns missing'.red);
  }
  
  // Overall summary
  console.log('\n=================================================='.cyan);
  console.log('📊 FIX SUMMARY'.brightWhite.bold);
  console.log('==================================================\n'.cyan);
  
  console.log('✅ Fixed column references where possible'.green);
  console.log('\nNext steps:');
  console.log('1. Run verify-market-growth-tables.js to verify the data');
  console.log('2. If issues persist, run fix-market-growth-tables.js to recreate the tables');
  console.log('3. Then run populate-market-growth.js again to repopulate the tables');
  
  console.log('\n==================================================\n'.cyan);
}

// Run the main function
main();
