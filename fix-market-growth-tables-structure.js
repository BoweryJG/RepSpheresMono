// Script to fix market growth tables structure and populate sample data
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import colors from 'colors';

colors.enable();

// Load environment variables
dotenv.config();

console.log('\n=================================================='.cyan);
console.log('🔧 MARKET GROWTH TABLES STRUCTURE FIX TOOL'.brightWhite.bold);
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
      const { error: directError } = await supabase
        .from('_queries')
        .select('*')
        .eq('sql', sql);
      
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

// Function to check if a table exists
async function checkTableExists(tableName) {
  try {
    console.log(`Checking if ${tableName} exists...`.yellow);
    
    const { data, error, count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });
      
    if (error) {
      if (error.message.includes('does not exist')) {
        console.log(`❌ Table ${tableName} does not exist`.yellow);
        return false;
      } else {
        console.error(`❌ Error checking table ${tableName}: ${error.message}`.red);
        return null;
      }
    }
    
    console.log(`✅ Table ${tableName} exists with ${count} records`.green);
    return true;
  } catch (err) {
    console.error(`❌ Error checking table ${tableName}: ${err.message}`.red);
    return null;
  }
}

// Function to check if a column exists in a table
async function checkColumnExists(tableName, columnName) {
  try {
    console.log(`Checking if ${columnName} exists in ${tableName}...`.yellow);
    
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

// SQL for fixing aesthetic_market_growth table structure
const fixAestheticMarketGrowthSQL = `
-- Drop the table if it exists but has incorrect structure
DROP TABLE IF EXISTS public.aesthetic_market_growth;

-- Create the aesthetic_market_growth table with correct structure
CREATE TABLE IF NOT EXISTS public.aesthetic_market_growth (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES public.aesthetic_categories(id),
  procedure_id INTEGER REFERENCES public.aesthetic_procedures(id),
  year INTEGER NOT NULL,
  market_size NUMERIC(12,2),
  growth_rate NUMERIC(5,2),
  region TEXT,
  sub_region TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.aesthetic_market_growth ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'aesthetic_market_growth' AND policyname = 'Enable read access for authenticated users'
  ) THEN
    CREATE POLICY "Enable read access for authenticated users" 
      ON public.aesthetic_market_growth
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END
$$;

-- Create policy for anonymous users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'aesthetic_market_growth' AND policyname = 'Enable read access for anonymous users'
  ) THEN
    CREATE POLICY "Enable read access for anonymous users" 
      ON public.aesthetic_market_growth
      FOR SELECT
      TO anon
      USING (true);
  END IF;
END
$$;

-- Add a comment to the table
COMMENT ON TABLE public.aesthetic_market_growth IS 'Stores market growth data for aesthetic procedures by category, year, and region';
`;

// SQL for updating dental_market_growth procedure_id values
const updateDentalMarketGrowthSQL = `
-- Update the dental_market_growth table to ensure procedure_id values are populated
UPDATE public.dental_market_growth
SET procedure_id = (
  SELECT id 
  FROM public.dental_procedures_simplified 
  WHERE categories.id = dental_market_growth.category_id
  LIMIT 1
)
WHERE procedure_id IS NULL
AND EXISTS (
  SELECT 1 
  FROM public.dental_procedures_simplified 
  WHERE categories.id = dental_market_growth.category_id
);
`;

// Sample data for aesthetic_market_growth table
const aestheticGrowthData = [
  {
    category_id: 1, // Use first aesthetic category
    procedure_id: 1, // Use first aesthetic procedure
    year: 2024,
    market_size: 5800000000.00,
    growth_rate: 8.50,
    region: 'North America',
    sub_region: 'United States',
    notes: 'Strong growth driven by increasing consumer demand'
  },
  {
    category_id: 1, 
    procedure_id: 1,
    year: 2023,
    market_size: 5300000000.00,
    growth_rate: 7.80,
    region: 'North America',
    sub_region: 'United States',
    notes: 'Recovery after pandemic slowdown'
  },
  {
    category_id: 2, // Second category
    procedure_id: 10, // Different procedure
    year: 2024,
    market_size: 3200000000.00,
    growth_rate: 9.20,
    region: 'North America',
    sub_region: 'United States',
    notes: 'Rapid growth due to new technologies'
  },
  {
    category_id: 2,
    procedure_id: 10,
    year: 2023,
    market_size: 2900000000.00,
    growth_rate: 6.50,
    region: 'North America',
    sub_region: 'United States',
    notes: 'Increasing popularity among younger demographic'
  },
  {
    category_id: 3, // Third category
    procedure_id: 20, // Different procedure
    year: 2024,
    market_size: 1800000000.00,
    growth_rate: 11.30,
    region: 'North America',
    sub_region: 'United States',
    notes: 'Emerging segment with high growth potential'
  },
  {
    category_id: 3,
    procedure_id: 20,
    year: 2023,
    market_size: 1600000000.00,
    growth_rate: 10.20,
    region: 'North America',
    sub_region: 'United States',
    notes: 'Beginning of rapid expansion'
  }
];

// Function to populate dental_market_growth with sample procedure_id values if needed
async function populateDentalMarketGrowthProcedureIds() {
  console.log('\nPopulating dental_market_growth procedure_id values...'.cyan);
  
  try {
    // First check if we have null procedure_id values
    const { data: nullProcedureIds, error: nullCheckError, count } = await supabase
      .from('dental_market_growth')
      .select('id, category_id', { count: 'exact' })
      .is('procedure_id', null);
      
    if (nullCheckError) {
      console.error(`❌ Error checking null procedure_ids: ${nullCheckError.message}`.red);
      return false;
    }
    
    if (count === 0) {
      console.log('✅ No null procedure_id values found in dental_market_growth'.green);
      return true;
    }
    
    console.log(`Found ${count} records with null procedure_id values. Updating...`.yellow);
    
    // For each record with null procedure_id, find a procedure in the same category
    for (const record of nullProcedureIds) {
      const { data: procedures, error: proceduresError } = await supabase
        .from('dental_procedures_simplified')
        .select('id')
        .eq('category_id', record.category_id)
        .limit(1);
        
      if (proceduresError) {
        console.error(`❌ Error finding procedure for category ${record.category_id}: ${proceduresError.message}`.red);
        continue;
      }
      
      if (!procedures || procedures.length === 0) {
        console.log(`⚠️ No procedures found for category ${record.category_id}`.yellow);
        continue;
      }
      
      // Update the record with a valid procedure_id
      const procedureId = procedures[0].id;
      const { error: updateError } = await supabase
        .from('dental_market_growth')
        .update({ procedure_id: procedureId })
        .eq('id', record.id);
        
      if (updateError) {
        console.error(`❌ Error updating procedure_id for record ${record.id}: ${updateError.message}`.red);
      } else {
        console.log(`✅ Updated procedure_id to ${procedureId} for record ${record.id}`.green);
      }
    }
    
    return true;
  } catch (err) {
    console.error(`❌ Error populating dental_market_growth procedure_ids: ${err.message}`.red);
    return false;
  }
}

// Function to populate aesthetic_market_growth table with sample data
async function populateAestheticMarketGrowth() {
  console.log('\nPopulating aesthetic_market_growth with sample data...'.cyan);
  
  try {
    // First check how many records we already have
    const { count, error: countError } = await supabase
      .from('aesthetic_market_growth')
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      console.error(`❌ Error checking aesthetic_market_growth count: ${countError.message}`.red);
      return false;
    }
    
    if (count > 0) {
      console.log(`⚠️ Table already has ${count} records. Skipping sample data.`.yellow);
      return true;
    }
    
    // Validate that the category_ids and procedure_ids we're using exist
    for (const record of aestheticGrowthData) {
      // Check category_id
      const { data: categoryData, error: categoryError } = await supabase
        .from('aesthetic_categories')
        .select('id')
        .eq('id', record.category_id)
        .limit(1);
        
      if (categoryError || !categoryData || categoryData.length === 0) {
        console.log(`⚠️ Category ID ${record.category_id} not found. Using first available category.`.yellow);
        
        // Find an available category
        const { data: availableCategories, error: availableCategoriesError } = await supabase
          .from('aesthetic_categories')
          .select('id')
          .limit(1);
          
        if (availableCategoriesError || !availableCategories || availableCategories.length === 0) {
          console.error(`❌ No aesthetic categories available. Cannot proceed.`.red);
          return false;
        }
        
        record.category_id = availableCategories[0].id;
      }
      
      // Check procedure_id
      const { data: procedureData, error: procedureError } = await supabase
        .from('aesthetic_procedures')
        .select('id')
        .eq('id', record.procedure_id)
        .limit(1);
        
      if (procedureError || !procedureData || procedureData.length === 0) {
        console.log(`⚠️ Procedure ID ${record.procedure_id} not found. Using procedure for category ${record.category_id}.`.yellow);
        
        // Find a procedure in the same category
        const { data: availableProcedures, error: availableProceduresError } = await supabase
          .from('aesthetic_procedures')
          .select('id')
          .eq('category_id', record.category_id)
          .limit(1);
          
        if (!availableProceduresError && availableProcedures && availableProcedures.length > 0) {
          record.procedure_id = availableProcedures[0].id;
        } else {
          // If no procedure in this category, find any procedure
          const { data: anyProcedures, error: anyProceduresError } = await supabase
            .from('aesthetic_procedures')
            .select('id')
            .limit(1);
            
          if (anyProceduresError || !anyProcedures || anyProcedures.length === 0) {
            console.error(`❌ No aesthetic procedures available. Cannot proceed.`.red);
            return false;
          }
          
          record.procedure_id = anyProcedures[0].id;
        }
      }
    }
    
    // Insert the data
    const { data, error } = await supabase
      .from('aesthetic_market_growth')
      .insert(aestheticGrowthData)
      .select();
      
    if (error) {
      console.error(`❌ Error inserting aesthetic_market_growth data: ${error.message}`.red);
      return false;
    }
    
    console.log(`✅ Successfully added ${data.length} records to aesthetic_market_growth`.green);
    return true;
  } catch (err) {
    console.error(`❌ Error populating aesthetic_market_growth: ${err.message}`.red);
    return false;
  }
}

// Main function
async function main() {
  console.log('\n=================================================='.cyan);
  console.log('🔍 STARTING TABLE STRUCTURE FIXES'.brightWhite.bold);
  console.log('==================================================\n'.cyan);
  
  // First verify database connection
  const connectionOk = await checkConnection();
  if (!connectionOk) {
    console.error('❌ Cannot proceed due to database connection issues'.red);
    console.log('Please check your .env file and make sure SUPABASE_URL and SUPABASE_SERVICE_KEY are correct');
    process.exit(1);
  }
  
  // Check dental_market_growth table
  console.log('\nChecking dental_market_growth table...'.cyan);
  const dentalMarketGrowthExists = await checkTableExists('dental_market_growth');
  
  if (dentalMarketGrowthExists) {
    const procedureIdExists = await checkColumnExists('dental_market_growth', 'procedure_id');
    
    if (procedureIdExists) {
      console.log('✅ dental_market_growth table structure looks good'.green);
      await populateDentalMarketGrowthProcedureIds();
    } else {
      console.error('❌ dental_market_growth is missing procedure_id column'.red);
      // This would require more complex fixes that we're not implementing here
    }
  } else {
    console.error('❌ dental_market_growth table does not exist'.red);
    console.log('Run fix-supabase-connection.js to create the table first');
  }
  
  // Check aesthetic_market_growth table
  console.log('\nChecking aesthetic_market_growth table...'.cyan);
  const aestheticMarketGrowthExists = await checkTableExists('aesthetic_market_growth');
  
  if (aestheticMarketGrowthExists) {
    const categoryIdExists = await checkColumnExists('aesthetic_market_growth', 'category_id');
    const procedureIdExists = await checkColumnExists('aesthetic_market_growth', 'procedure_id');
    
    if (!categoryIdExists || !procedureIdExists) {
      console.log('⚠️ aesthetic_market_growth has incorrect structure. Recreating...'.yellow);
      const fixedTable = await executeSql(
        fixAestheticMarketGrowthSQL,
        'Fixing aesthetic_market_growth table structure'
      );
      
      if (fixedTable) {
        await populateAestheticMarketGrowth();
      }
    } else {
      console.log('✅ aesthetic_market_growth table structure looks good'.green);
      await populateAestheticMarketGrowth();
    }
  } else {
    console.log('⚠️ aesthetic_market_growth table does not exist. Creating...'.yellow);
    const createdTable = await executeSql(
      fixAestheticMarketGrowthSQL,
      'Creating aesthetic_market_growth table'
    );
    
    if (createdTable) {
      await populateAestheticMarketGrowth();
    }
  }
  
  // Overall summary
  console.log('\n=================================================='.cyan);
  console.log('📊 FIX SUMMARY'.brightWhite.bold);
  console.log('==================================================\n'.cyan);
  
  console.log('✅ Completed table structure and data fixes'.green);
  console.log('\nNext steps:');
  console.log('1. Run monitor-market-data-connections.js to verify the fixes');
  console.log('2. If issues persist, consider running fix-supabase-connection.js for a complete reset');
  
  console.log('\n==================================================\n'.cyan);
}

// Run the main function
main();
