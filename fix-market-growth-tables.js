// Script to fix market growth tables structure
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import colors from 'colors';

colors.enable();

// Load environment variables
dotenv.config();

console.log('\n=================================================='.cyan);
console.log('🔧 MARKET GROWTH TABLES FIX TOOL'.brightWhite.bold);
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

// SQL for aesthetic categories table
const aestheticCategoriesSQL = `
CREATE TABLE IF NOT EXISTS public.aesthetic_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.aesthetic_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous select access" ON public.aesthetic_categories 
  FOR SELECT USING (true);
`;

// SQL for inserting initial aesthetic categories
const insertAestheticCategoriesSQL = `
INSERT INTO public.aesthetic_categories (name, description)
VALUES 
  ('Facial Procedures', 'Aesthetic procedures focused on enhancing facial features and appearance'),
  ('Body Contouring', 'Procedures designed to reshape and enhance the body'),
  ('Skin Treatments', 'Non-surgical procedures to improve skin texture, tone, and appearance'),
  ('Hair Restoration', 'Procedures focused on addressing hair loss and restoring hair growth'),
  ('Injectables', 'Minimally invasive treatments using injectable products for aesthetic enhancement'),
  ('Laser Treatments', 'Advanced procedures using laser technology for skin rejuvenation and hair removal')
ON CONFLICT (id) DO NOTHING;
`;

// SQL for dental market growth table
const dentalMarketGrowthTableSQL = `
DROP TABLE IF EXISTS public.dental_market_growth;

CREATE TABLE public.dental_market_growth (
  id SERIAL PRIMARY KEY,
  procedure_id INTEGER REFERENCES public.dental_procedures_simplified(id),
  category_id INTEGER REFERENCES public.categories(id),
  year INTEGER NOT NULL,
  growth_rate DECIMAL(5,2),
  market_size_usd BIGINT,
  region VARCHAR(50),
  country VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.dental_market_growth ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous select access" ON public.dental_market_growth 
  FOR SELECT USING (true);
`;

// SQL for aesthetic market growth table
const aestheticMarketGrowthTableSQL = `
DROP TABLE IF EXISTS public.aesthetic_market_growth;

CREATE TABLE public.aesthetic_market_growth (
  id SERIAL PRIMARY KEY,
  procedure_id INTEGER REFERENCES public.aesthetic_procedures(id),
  category_id INTEGER REFERENCES public.aesthetic_categories(id),
  year INTEGER NOT NULL,
  growth_rate DECIMAL(5,2),
  market_size_usd BIGINT,
  region VARCHAR(50),
  country VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.aesthetic_market_growth ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous select access" ON public.aesthetic_market_growth 
  FOR SELECT USING (true);
`;

// Function to check if a table exists
async function checkTableExists(tableName) {
  try {
    console.log(`Checking if table ${tableName} exists...`.yellow);
    
    const { data, error, count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error(`❌ Table ${tableName} does not exist: ${error.message}`.red);
      return false;
    }
    
    console.log(`✅ Table ${tableName} exists`.green);
    return true;
  } catch (err) {
    console.error(`❌ Error checking table ${tableName}: ${err.message}`.red);
    return false;
  }
}

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

// Function to check if tables exist and have the right structure
async function validateTables() {
  const tables = ['dental_market_growth', 'aesthetic_market_growth'];
  const results = {};
  
  for (const tableName of tables) {
    try {
      console.log(`\nValidating ${tableName} table...`.yellow);
      
      // Check if the table exists
      const { data: tableExists, error: tableError, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
      
      if (tableError) {
        console.error(`❌ Error checking ${tableName} table: ${tableError.message}`.red);
        results[tableName] = { exists: false, valid: false };
        continue;
      }
      
      console.log(`✅ Table ${tableName} exists`.green);
      
      // Check for the category_id column
      try {
        const { data: columnData, error: columnError } = await supabase
          .from(tableName)
          .select('category_id')
          .limit(1);
        
        if (columnError) {
          console.error(`❌ Table ${tableName} doesn't have a valid category_id column: ${columnError.message}`.red);
          results[tableName] = { exists: true, valid: false };
        } else {
          console.log(`✅ Table ${tableName} has a valid category_id column`.green);
          results[tableName] = { exists: true, valid: true };
        }
      } catch (columnErr) {
        console.error(`❌ Error checking category_id column in ${tableName}: ${columnErr.message}`.red);
        results[tableName] = { exists: true, valid: false };
      }
    } catch (err) {
      console.error(`❌ Error validating ${tableName} table: ${err.message}`.red);
      results[tableName] = { exists: false, valid: false };
    }
  }
  
  return results;
}

// Main function
async function main() {
  // First, validate the tables
  const beforeValidation = await validateTables();
  
  // Check if aesthetic_categories table exists
  const aestheticCategoriesExists = await checkTableExists('aesthetic_categories');
  
  // Create aesthetic_categories table if it doesn't exist
  let aestheticCategoriesSuccess = true;
  if (!aestheticCategoriesExists) {
    console.log('\nAesthetic categories table needs to be created...'.yellow);
    aestheticCategoriesSuccess = await executeSql(
      aestheticCategoriesSQL, 
      'Creating aesthetic categories table'
    );
    
    if (aestheticCategoriesSuccess) {
      // Insert initial categories if table was created successfully
      const insertCategoriesSuccess = await executeSql(
        insertAestheticCategoriesSQL, 
        'Inserting initial aesthetic categories'
      );
      
      if (!insertCategoriesSuccess) {
        console.error('❌ Failed to insert initial aesthetic categories'.red);
        aestheticCategoriesSuccess = false;
      }
    }
  } else {
    console.log('✅ Aesthetic categories table already exists'.green);
  }
  
  // Fix dental market growth table
  const dentalSuccess = await executeSql(
    dentalMarketGrowthTableSQL, 
    'Recreating dental market growth table'
  );
  
  // Only proceed with aesthetic market growth table if aesthetic_categories exists
  let aestheticSuccess = false;
  if (aestheticCategoriesSuccess || aestheticCategoriesExists) {
    aestheticSuccess = await executeSql(
      aestheticMarketGrowthTableSQL, 
      'Recreating aesthetic market growth table'
    );
  } else {
    console.error('❌ Cannot create aesthetic market growth table without aesthetic categories table'.red);
  }
  
  // Validate tables again
  const afterValidation = await validateTables();
  
  console.log('\n=================================================='.cyan);
  console.log('🔍 FIX RESULT'.brightWhite.bold);
  console.log('==================================================\n'.cyan);
  
  if (dentalSuccess && afterValidation['dental_market_growth'].valid) {
    console.log('✅ Dental market growth table fixed successfully'.green);
  } else {
    console.error('❌ Failed to fix dental market growth table'.red);
  }
  
  if (aestheticSuccess && afterValidation['aesthetic_market_growth'].valid) {
    console.log('✅ Aesthetic market growth table fixed successfully'.green);
  } else {
    console.error('❌ Failed to fix aesthetic market growth table'.red);
  }
  
  if (dentalSuccess && aestheticSuccess && 
      afterValidation['dental_market_growth'].valid && 
      afterValidation['aesthetic_market_growth'].valid) {
    console.log('\n🚀 All market growth tables have been successfully fixed!'.green);
    console.log('\nNext steps:');
    console.log('1. Run populate-market-growth.js to populate the tables with data');
    console.log('2. Run verify-supabase-data.js to verify the populated data');
  } else {
    console.error('\n⚠️ Some table fixes failed.'.yellow);
    
    // Give more specific error information
    if (!aestheticCategoriesSuccess && !aestheticCategoriesExists) {
      console.error('❌ Failed to create aesthetic_categories table which is required by aesthetic_market_growth'.red);
    }
    
    console.log('\nPossible issues:');
    console.log('1. Database connection issues');
    console.log('2. Permission issues');
    console.log('3. Referenced tables (dental_procedures_simplified, categories, aesthetic_procedures) not existing');
    
    console.log('\nTry:');
    console.log('1. Running fix-supabase-connection.js to ensure proper setup');
    console.log('2. Verifying that all referenced tables exist');
  }
  
  console.log('\n==================================================\n'.cyan);
}

// Run the main function
main();
