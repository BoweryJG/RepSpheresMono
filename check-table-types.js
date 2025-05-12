// Check database object types before fixing tables
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import colors from 'colors';

colors.enable();

// Load environment variables
dotenv.config();

console.log('\n=================================================='.cyan);
console.log('🔍 DATABASE OBJECT TYPE CHECKER'.brightWhite.bold);
console.log('==================================================\n'.cyan);

// Get timestamp for logging
const timestamp = new Date().toLocaleString();
console.log(`Check started at: ${timestamp}`.gray);

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
      return { success: false, data: null, error: error.message };
    }
    
    return { success: true, data, error: null };
  } catch (err) {
    console.error(`SQL Execution Error: ${err.message}`.red);
    return { success: false, data: null, error: err.message };
  }
}

// Function to check object type (table, view, etc.)
async function checkObjectType(objectName) {
  try {
    console.log(`Checking object type for ${objectName}...`.yellow);
    
    const sql = `
      SELECT c.relname AS name, 
             n.nspname AS schema,
             CASE c.relkind 
                WHEN 'r' THEN 'table'
                WHEN 'v' THEN 'view'
                WHEN 'm' THEN 'materialized view'
                WHEN 'i' THEN 'index'
                WHEN 'S' THEN 'sequence'
                WHEN 'c' THEN 'composite type'
                WHEN 't' THEN 'TOAST table'
                WHEN 'f' THEN 'foreign table'
                WHEN 'p' THEN 'partitioned table'
                ELSE c.relkind::text
             END AS type
      FROM pg_catalog.pg_class c
      LEFT JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname NOT IN ('pg_catalog', 'pg_toast', 'information_schema')
      AND n.nspname NOT LIKE 'pg_temp%'
      AND c.relname = '${objectName}'
      AND n.nspname = 'public'
      ORDER BY schema, name;
    `;
    
    const result = await executeRawSql(sql);
    
    if (!result.success) {
      return { exists: false, type: null, error: result.error };
    }
    
    if (!result.data || result.data.length === 0) {
      console.log(`❌ Object '${objectName}' not found in database`.yellow);
      return { exists: false, type: null, error: null };
    }
    
    const objType = result.data[0].type;
    console.log(`✅ Object '${objectName}' is a ${objType}`.green);
    return { exists: true, type: objType, error: null };
  } catch (err) {
    console.error(`Error checking object type: ${err.message}`.red);
    return { exists: false, type: null, error: err.message };
  }
}

// Function to check all objects needed for the market growth tables
async function checkAllObjects() {
  const objectsToCheck = [
    'aesthetic_categories',
    'aesthetic_procedures',
    'dental_procedures_simplified',
    'categories',
    'aesthetic_market_growth',
    'dental_market_growth'
  ];
  
  const results = {};
  
  for (const objName of objectsToCheck) {
    results[objName] = await checkObjectType(objName);
  }
  
  return results;
}

// Function to generate SQL for creating aesthetic_market_growth table based on object types
async function generateCreateTableSql(objectTypes) {
  let createTableSql = '';
  let categRefSql = '';
  let procRefSql = '';
  
  // Determine how to reference aesthetic_categories
  if (objectTypes.aesthetic_categories && objectTypes.aesthetic_categories.exists) {
    if (objectTypes.aesthetic_categories.type === 'table') {
      categRefSql = 'REFERENCES public.aesthetic_categories(id)';
    } else {
      // For views, we can't use foreign keys, so we'll just note this
      categRefSql = '-- Cannot reference view aesthetic_categories directly';
    }
  } else {
    categRefSql = '-- aesthetic_categories not found';
  }
  
  // Determine how to reference aesthetic_procedures
  if (objectTypes.aesthetic_procedures && objectTypes.aesthetic_procedures.exists) {
    if (objectTypes.aesthetic_procedures.type === 'table') {
      procRefSql = 'REFERENCES public.aesthetic_procedures(id)';
    } else {
      // For views, we can't use foreign keys, so we'll just note this
      procRefSql = '-- Cannot reference view aesthetic_procedures directly';
    }
  } else {
    procRefSql = '-- aesthetic_procedures not found';
  }
  
  // Create SQL for the aesthetic_market_growth table
  createTableSql = `
-- Drop the table if it exists
DROP TABLE IF EXISTS public.aesthetic_market_growth;

-- Create the aesthetic_market_growth table with proper structure
CREATE TABLE public.aesthetic_market_growth (
  id SERIAL PRIMARY KEY,
  category_id INTEGER ${categRefSql},
  procedure_id INTEGER ${procRefSql},
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

  return createTableSql;
}

// Function to create the aesthetic_market_growth table with appropriate structure
async function createAestheticMarketGrowthTable(createTableSql) {
  try {
    console.log('\nCreating aesthetic_market_growth table...'.cyan);
    console.log('Using SQL:'.yellow);
    console.log(createTableSql);
    
    const result = await executeRawSql(createTableSql);
    
    if (!result.success) {
      console.error(`❌ Failed to create table: ${result.error}`.red);
      return false;
    }
    
    console.log('✅ Table created successfully'.green);
    return true;
  } catch (err) {
    console.error(`❌ Error creating table: ${err.message}`.red);
    return false;
  }
}

// Function to populate with sample data
async function populateWithSampleData() {
  try {
    console.log('\nPopulating aesthetic_market_growth with sample data...'.cyan);
    
    const sampleData = [
      {
        category_id: 1,
        procedure_id: 1,
        year: 2024,
        market_size: 5800000.00,
        growth_rate: 8.50,
        region: 'North America',
        sub_region: 'United States',
        notes: 'Strong growth driven by consumer demand'
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
        notes: 'Emerging segment with high growth potential'
      }
    ];
    
    // Insert sample data using the Supabase client
    const { data, error } = await supabase
      .from('aesthetic_market_growth')
      .insert(sampleData)
      .select();
    
    if (error) {
      console.error(`❌ Error inserting sample data: ${error.message}`.red);
      return false;
    }
    
    console.log(`✅ Successfully added ${data.length} records`.green);
    return true;
  } catch (err) {
    console.error(`❌ Error adding sample data: ${err.message}`.red);
    return false;
  }
}

// Main function
async function main() {
  console.log('\nChecking database object types...'.cyan);
  
  // Check object types
  const objectTypes = await checkAllObjects();
  
  console.log('\n=================================================='.cyan);
  console.log('📊 OBJECT TYPE SUMMARY'.brightWhite.bold);
  console.log('==================================================\n'.cyan);
  
  // Print summary table
  console.log('| Object Name                 | Exists | Type             |');
  console.log('|----------------------------|--------|------------------|');
  
  for (const [objName, result] of Object.entries(objectTypes)) {
    const existsStr = result.exists ? '✅ Yes' : '❌ No ';
    const typeStr = result.type || 'N/A';
    const paddedName = objName.padEnd(28);
    const paddedType = typeStr.padEnd(18);
    
    console.log(`| ${paddedName}| ${existsStr} | ${paddedType}|`);
  }
  
  console.log('\n==================================================\n'.cyan);
  
  // Generate SQL for creating the table based on object types
  const createTableSql = await generateCreateTableSql(objectTypes);
  
  // Create the table
  const tableCreated = await createAestheticMarketGrowthTable(createTableSql);
  
  if (tableCreated) {
    // Populate with sample data
    await populateWithSampleData();
  }
  
  console.log('\n=================================================='.cyan);
  console.log('✅ PROCESS COMPLETED'.green.bold);
  console.log('==================================================\n'.cyan);
  
  if (tableCreated) {
    console.log('The aesthetic_market_growth table has been created successfully.');
    console.log('Next steps:');
    console.log('1. Run monitor-market-data-connections.js to verify the table structure');
    console.log('2. Check the dashboard to ensure market growth data is displayed correctly');
  } else {
    console.log('⚠️ The table creation process encountered issues.');
    console.log('Please review the error messages above and try again.');
  }
}

// Run the main function
main();
