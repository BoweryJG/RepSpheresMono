// Fix aesthetic_market_growth table structure
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import colors from 'colors';

colors.enable();

// Load environment variables
dotenv.config();

console.log('\n=================================================='.cyan);
console.log('🔧 AESTHETIC MARKET GROWTH TABLE FIX'.brightWhite.bold);
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

// Function to execute raw SQL
async function executeRawSql(sql, description) {
  try {
    console.log(`${description}...`.yellow);
    
    const { data, error } = await supabase.rpc('execute_sql', { sql_query: sql });
    if (error) {
      console.error(`❌ ${description} failed: ${error.message}`.red);
      return { success: false, data: null, error: error.message };
    }
    
    console.log(`✅ ${description} completed successfully`.green);
    return { success: true, data, error: null };
  } catch (err) {
    console.error(`❌ ${description} failed: ${err.message}`.red);
    return { success: false, data: null, error: err.message };
  }
}

// SQL to check if the table exists
const checkTableSql = `
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public'
  AND table_name = 'aesthetic_market_growth'
);
`;

// SQL to drop the existing table
const dropTableSql = `
DROP TABLE IF EXISTS public.aesthetic_market_growth;
`;

// SQL to recreate the table with proper structure
const recreateTableSql = `
CREATE TABLE public.aesthetic_market_growth (
  id SERIAL PRIMARY KEY,
  category_id INTEGER,
  procedure_id INTEGER,
  year INTEGER NOT NULL,
  market_size NUMERIC(12,2),
  growth_rate NUMERIC(5,2),
  region TEXT,
  sub_region TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add comment
COMMENT ON TABLE public.aesthetic_market_growth IS 'Stores market growth data for aesthetic procedures';

-- Enable RLS
ALTER TABLE public.aesthetic_market_growth ENABLE ROW LEVEL SECURITY;

-- Add policies for access
CREATE POLICY "Enable read access for all users" 
  ON public.aesthetic_market_growth
  FOR SELECT
  USING (true);
`;

// SQL to add foreign key constraints (in a separate step to avoid circular dependencies)
const addForeignKeysSql = `
-- Add foreign key to aesthetic_categories if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'aesthetic_categories') THEN
    BEGIN
      ALTER TABLE public.aesthetic_market_growth 
      ADD CONSTRAINT fk_aesthetic_market_growth_category
      FOREIGN KEY (category_id)
      REFERENCES public.aesthetic_categories(id);
      
      RAISE NOTICE 'Foreign key constraint for category_id added.';
    EXCEPTION
      WHEN others THEN
        RAISE NOTICE 'Could not add foreign key constraint for category_id: %', SQLERRM;
    END;
  ELSE
    RAISE NOTICE 'Table aesthetic_categories does not exist, skipping foreign key.';
  END IF;
  
  -- Add foreign key to aesthetic_procedures if it exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'aesthetic_procedures') THEN
    BEGIN
      ALTER TABLE public.aesthetic_market_growth 
      ADD CONSTRAINT fk_aesthetic_market_growth_procedure
      FOREIGN KEY (procedure_id)
      REFERENCES public.aesthetic_procedures(id);
      
      RAISE NOTICE 'Foreign key constraint for procedure_id added.';
    EXCEPTION
      WHEN others THEN
        RAISE NOTICE 'Could not add foreign key constraint for procedure_id: %', SQLERRM;
    END;
  ELSE
    RAISE NOTICE 'Table aesthetic_procedures does not exist, skipping foreign key.';
  END IF;
END $$;
`;

// Sample data for aesthetic_market_growth
const aestheticMarketGrowthSampleData = [
  { category_id: 1, procedure_id: 3, year: 2024, market_size: 5800000.00, growth_rate: 8.50, region: 'North America', sub_region: 'United States', notes: 'Strong growth in facial aesthetics' },
  { category_id: 2, procedure_id: 4, year: 2024, market_size: 3200000.00, growth_rate: 7.30, region: 'North America', sub_region: 'United States', notes: 'Body contouring procedures gaining popularity' },
  { category_id: 3, procedure_id: 1, year: 2024, market_size: 1800000.00, growth_rate: 9.20, region: 'North America', sub_region: 'United States', notes: 'Injectable treatments continue rapid growth' }
];

// Function to insert sample data into the table
async function insertSampleData() {
  try {
    console.log('Inserting sample data into aesthetic_market_growth...'.yellow);
    
    const { data, error } = await supabase
      .from('aesthetic_market_growth')
      .insert(aestheticMarketGrowthSampleData)
      .select();
    
    if (error) {
      console.error(`❌ Failed to insert sample data: ${error.message}`.red);
      return { success: false, count: 0 };
    }
    
    console.log(`✅ Successfully added ${data.length} records to aesthetic_market_growth`.green);
    return { success: true, count: data.length };
  } catch (err) {
    console.error(`❌ Error inserting sample data: ${err.message}`.red);
    return { success: false, count: 0 };
  }
}

// Main function to fix the table
async function fixAestheticMarketGrowthTable() {
  console.log('\nChecking if aesthetic_market_growth table exists...'.cyan);
  
  // Check if table exists
  const checkResult = await executeRawSql(checkTableSql, 'Checking table existence');
  const tableExists = checkResult.success ? checkResult.data[0].exists : false;
  
  if (tableExists) {
    console.log('Table exists, dropping and recreating...'.cyan);
    
    // Drop the existing table
    await executeRawSql(dropTableSql, 'Dropping existing table');
  } else {
    console.log('Table does not exist, creating new table...'.cyan);
  }
  
  // Create the table with proper structure
  const createResult = await executeRawSql(recreateTableSql, 'Creating aesthetic_market_growth table');
  
  if (createResult.success) {
    // Add foreign key constraints
    await executeRawSql(addForeignKeysSql, 'Adding foreign key constraints');
    
    // Insert sample data
    await insertSampleData();
  }
  
  // Final status report
  console.log('\n=================================================='.cyan);
  console.log('✅ TABLE FIX COMPLETED'.green.bold);
  console.log('==================================================\n'.cyan);
  
  console.log('Next steps:');
  console.log('1. Run monitor-market-data-connections.js to verify the table structure');
  console.log('2. Check the dashboard to ensure market growth data is displayed correctly\n');
}

// Execute main function
try {
  fixAestheticMarketGrowthTable();
} catch (err) {
  console.error(`\n❌ Unexpected error: ${err.message}`.red);
  console.error(err);
}
