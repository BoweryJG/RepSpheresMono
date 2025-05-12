// Direct SQL fix for aesthetic_market_growth table
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import colors from 'colors';

colors.enable();

// Load environment variables
dotenv.config();

console.log('\n=================================================='.cyan);
console.log('🔧 DIRECT FIX FOR AESTHETIC MARKET GROWTH TABLE'.brightWhite.bold);
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
async function executeRawSql(sql) {
  try {
    const { data, error } = await supabase.rpc('execute_sql', { sql_query: sql });
    if (error) {
      console.error(`SQL Execution Error: ${error.message}`.red);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error(`SQL Execution Error: ${err.message}`.red);
    return false;
  }
}

// SQL for dropping and recreating the aesthetic_market_growth table
const recreateTableSql = `
-- Drop the table if it exists
DROP TABLE IF EXISTS public.aesthetic_market_growth;

-- Create the aesthetic_market_growth table with correct structure
CREATE TABLE public.aesthetic_market_growth (
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

-- Add comment
COMMENT ON TABLE public.aesthetic_market_growth IS 'Stores market growth data for aesthetic procedures';

-- Enable RLS
ALTER TABLE public.aesthetic_market_growth ENABLE ROW LEVEL SECURITY;

-- Add policies for access
CREATE POLICY "Enable read access for authenticated users" 
  ON public.aesthetic_market_growth
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable read access for anonymous users" 
  ON public.aesthetic_market_growth
  FOR SELECT
  TO anon
  USING (true);
`;

// Sample data for aesthetic_market_growth
const sampleData = [
  {
    category_id: 1,
    procedure_id: 1,
    year: 2024,
    market_size: 5600000.00,
    growth_rate: 8.50,
    region: 'North America',
    sub_region: 'United States',
    notes: 'Strong growth in facial aesthetics'
  },
  {
    category_id: 2,
    procedure_id: 5,
    year: 2024,
    market_size: 3200000.00,
    growth_rate: 7.30,
    region: 'North America',
    sub_region: 'United States',
    notes: 'Body contouring procedures gaining popularity'
  },
  {
    category_id: 3,
    procedure_id: 10,
    year: 2024,
    market_size: 1800000.00,
    growth_rate: 9.20,
    region: 'North America',
    sub_region: 'United States',
    notes: 'Dermal fillers market expanding rapidly'
  }
];

// Check if a table exists
async function checkTableExists(tableName) {
  try {
    console.log(`Checking if table ${tableName} exists...`.yellow);
    
    const { data, error, count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });
      
    if (error) {
      if (error.message.includes('does not exist')) {
        console.log(`Table ${tableName} does not exist`.yellow);
        return false;
      }
      console.error(`Error checking table ${tableName}: ${error.message}`.red);
      return null;
    }
    
    console.log(`Table ${tableName} exists with ${count} records`.green);
    return true;
  } catch (err) {
    console.error(`Error checking table ${tableName}: ${err.message}`.red);
    return null;
  }
}

// Insert sample data
async function insertSampleData() {
  try {
    console.log('Inserting sample data into aesthetic_market_growth...'.yellow);
    
    const { data, error } = await supabase
      .from('aesthetic_market_growth')
      .insert(sampleData)
      .select();
      
    if (error) {
      console.error(`Error inserting sample data: ${error.message}`.red);
      return false;
    }
    
    console.log(`Successfully inserted ${data.length} records`.green);
    return true;
  } catch (err) {
    console.error(`Error inserting sample data: ${err.message}`.red);
    return false;
  }
}

// Check table structure
async function checkTableStructure() {
  try {
    console.log('Checking aesthetic_market_growth table structure...'.yellow);
    
    const { data, error } = await supabase
      .from('aesthetic_market_growth')
      .select('category_id, procedure_id')
      .limit(1);
      
    if (error) {
      if (error.message.toLowerCase().includes('column') && error.message.toLowerCase().includes('does not exist')) {
        console.log('Table structure is incorrect'.red);
        return false;
      }
      console.error(`Error checking table structure: ${error.message}`.red);
      return null;
    }
    
    console.log('Table structure is correct'.green);
    return true;
  } catch (err) {
    console.error(`Error checking table structure: ${err.message}`.red);
    return null;
  }
}

// Main function
async function main() {
  try {
    // Test connection
    console.log('Testing database connection...'.yellow);
    const { data: testData, error: testError } = await supabase
      .from('aesthetic_categories')
      .select('*')
      .limit(1);
      
    if (testError) {
      console.error(`Database connection error: ${testError.message}`.red);
      process.exit(1);
    }
    
    console.log('Database connection successful'.green);
    
    // Check if table exists with correct structure
    const tableExists = await checkTableExists('aesthetic_market_growth');
    
    if (tableExists === true) {
      const structureCorrect = await checkTableStructure();
      
      if (structureCorrect === false) {
        console.log('Recreating table with correct structure...'.yellow);
        
        // Drop and recreate table
        const tableRecreated = await executeRawSql(recreateTableSql);
        
        if (!tableRecreated) {
          console.error('Failed to recreate table'.red);
          process.exit(1);
        }
        
        console.log('Table recreated successfully'.green);
        
        // Insert sample data
        await insertSampleData();
      } else if (structureCorrect === true) {
        console.log('Table structure is correct. Checking if sample data is needed...'.yellow);
        
        // Check if table is empty
        const { count, error: countError } = await supabase
          .from('aesthetic_market_growth')
          .select('*', { count: 'exact', head: true });
          
        if (countError) {
          console.error(`Error checking record count: ${countError.message}`.red);
        } else if (count === 0) {
          console.log('Table is empty, inserting sample data...'.yellow);
          await insertSampleData();
        } else {
          console.log(`Table already has ${count} records, no sample data needed`.green);
        }
      }
    } else {
      console.log('Creating new aesthetic_market_growth table...'.yellow);
      
      // Create table
      const tableCreated = await executeRawSql(recreateTableSql);
      
      if (!tableCreated) {
        console.error('Failed to create table'.red);
        process.exit(1);
      }
      
      console.log('Table created successfully'.green);
      
      // Insert sample data
      await insertSampleData();
    }
    
    // Final verification
    console.log('\nFinal verification...'.cyan);
    const finalStructure = await checkTableStructure();
    
    if (finalStructure === true) {
      console.log('\n✅ AESTHETIC MARKET GROWTH TABLE FIX COMPLETED SUCCESSFULLY'.green.bold);
      console.log('The table structure is now correct with required columns and sample data'.green);
    } else {
      console.log('\n❌ TABLE FIX FAILED'.red.bold);
      console.log('Please check Supabase permissions and try again'.red);
    }
  } catch (err) {
    console.error(`Unexpected error: ${err.message}`.red);
  }
}

// Run the main function
main();
