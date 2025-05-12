// Create basic database structure for Market Insights
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import colors from 'colors';

colors.enable();

// Load environment variables
dotenv.config();

console.log('\n=================================================='.cyan);
console.log('🏗️  MARKET INSIGHTS DATABASE BUILDER'.brightWhite.bold);
console.log('==================================================\n'.cyan);

// Get timestamp for logging
const timestamp = new Date().toLocaleString();
console.log(`Build started at: ${timestamp}`.gray);

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

// SQL for creating categories table
const createCategoriesTable = `
CREATE TABLE IF NOT EXISTS public.categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Add policies for access
CREATE POLICY IF NOT EXISTS "Enable read access for all users" 
  ON public.categories
  FOR SELECT
  USING (true);
`;

// SQL for creating aesthetic_categories table
const createAestheticCategoriesTable = `
CREATE TABLE IF NOT EXISTS public.aesthetic_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.aesthetic_categories ENABLE ROW LEVEL SECURITY;

-- Add policies for access
CREATE POLICY IF NOT EXISTS "Enable read access for all users" 
  ON public.aesthetic_categories
  FOR SELECT
  USING (true);
`;

// SQL for creating dental_procedures_simplified table
const createDentalProceduresTable = `
CREATE TABLE IF NOT EXISTS public.dental_procedures_simplified (
  id SERIAL PRIMARY KEY,
  procedure_code TEXT,
  procedure_name TEXT NOT NULL,
  description TEXT,
  category_id INTEGER REFERENCES public.categories(id),
  average_cost NUMERIC(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dental_procedures_simplified ENABLE ROW LEVEL SECURITY;

-- Add policies for access
CREATE POLICY IF NOT EXISTS "Enable read access for all users" 
  ON public.dental_procedures_simplified
  FOR SELECT
  USING (true);
`;

// SQL for creating aesthetic_procedures table
const createAestheticProceduresTable = `
CREATE TABLE IF NOT EXISTS public.aesthetic_procedures (
  id SERIAL PRIMARY KEY,
  procedure_name TEXT NOT NULL,
  description TEXT,
  category_id INTEGER REFERENCES public.aesthetic_categories(id),
  average_cost NUMERIC(10,2),
  recovery_time TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.aesthetic_procedures ENABLE ROW LEVEL SECURITY;

-- Add policies for access
CREATE POLICY IF NOT EXISTS "Enable read access for all users" 
  ON public.aesthetic_procedures
  FOR SELECT
  USING (true);
`;

// SQL for creating companies table
const createCompaniesTable = `
CREATE TABLE IF NOT EXISTS public.companies (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  ticker_symbol TEXT,
  description TEXT,
  website_url TEXT,
  sector TEXT,
  industry TEXT,
  founded_year INTEGER,
  headquarters TEXT,
  employee_count INTEGER,
  market_cap NUMERIC(14,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Add policies for access
CREATE POLICY IF NOT EXISTS "Enable read access for all users" 
  ON public.companies
  FOR SELECT
  USING (true);
`;

// SQL for creating dental_market_growth table
const createDentalMarketGrowthTable = `
CREATE TABLE IF NOT EXISTS public.dental_market_growth (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES public.categories(id),
  procedure_id INTEGER REFERENCES public.dental_procedures_simplified(id),
  year INTEGER NOT NULL,
  market_size NUMERIC(12,2),
  growth_rate NUMERIC(5,2),
  region TEXT,
  sub_region TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dental_market_growth ENABLE ROW LEVEL SECURITY;

-- Add policies for access
CREATE POLICY IF NOT EXISTS "Enable read access for all users" 
  ON public.dental_market_growth
  FOR SELECT
  USING (true);
`;

// SQL for creating aesthetic_market_growth table
const createAestheticMarketGrowthTable = `
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

-- Enable RLS
ALTER TABLE public.aesthetic_market_growth ENABLE ROW LEVEL SECURITY;

-- Add policies for access
CREATE POLICY IF NOT EXISTS "Enable read access for all users" 
  ON public.aesthetic_market_growth
  FOR SELECT
  USING (true);
`;

// Sample data for categories
const categoriesSampleData = [
  { name: 'Preventive', description: 'Preventive dental procedures' },
  { name: 'Restorative', description: 'Restorative dental procedures' },
  { name: 'Endodontics', description: 'Root canal treatments and related procedures' },
  { name: 'Periodontics', description: 'Procedures related to gum disease' },
  { name: 'Prosthodontics', description: 'Procedures for dental prostheses' },
  { name: 'Oral Surgery', description: 'Surgical procedures in the oral cavity' }
];

// Sample data for aesthetic_categories
const aestheticCategoriesSampleData = [
  { name: 'Facial', description: 'Facial aesthetic procedures' },
  { name: 'Body', description: 'Body contouring and enhancement procedures' },
  { name: 'Injectable', description: 'Injectable treatments like fillers and botox' },
  { name: 'Laser', description: 'Laser treatments for skin and other concerns' }
];

// Sample data for dental_procedures_simplified
const dentalProceduresSampleData = [
  { procedure_code: 'D0120', procedure_name: 'Periodic Oral Evaluation', description: 'Regular dental check-up', category_id: 1, average_cost: 50.00 },
  { procedure_code: 'D1110', procedure_name: 'Prophylaxis - Adult', description: 'Dental cleaning for adults', category_id: 1, average_cost: 85.00 },
  { procedure_code: 'D2150', procedure_name: 'Amalgam Filling', description: 'Silver filling for cavities', category_id: 2, average_cost: 150.00 },
  { procedure_code: 'D2740', procedure_name: 'Crown - Porcelain', description: 'Porcelain dental crown', category_id: 2, average_cost: 1200.00 },
  { procedure_code: 'D3310', procedure_name: 'Root Canal - Anterior', description: 'Root canal for front teeth', category_id: 3, average_cost: 700.00 }
];

// Sample data for aesthetic_procedures
const aestheticProceduresSampleData = [
  { procedure_name: 'Botox', description: 'Injectable neurotoxin for wrinkle reduction', category_id: 3, average_cost: 400.00, recovery_time: '1-2 days' },
  { procedure_name: 'Dermal Fillers', description: 'Injectable gel for volume restoration', category_id: 3, average_cost: 650.00, recovery_time: '1-2 days' },
  { procedure_name: 'Rhinoplasty', description: 'Surgical nose reshaping', category_id: 1, average_cost: 5500.00, recovery_time: '1-2 weeks' },
  { procedure_name: 'Liposuction', description: 'Surgical fat removal procedure', category_id: 2, average_cost: 3500.00, recovery_time: '1-2 weeks' },
  { procedure_name: 'Laser Hair Removal', description: 'Permanent hair reduction using laser technology', category_id: 4, average_cost: 300.00, recovery_time: 'None' }
];

// Sample data for companies
const companiesSampleData = [
  { name: 'Dentsply Sirona', ticker_symbol: 'XRAY', description: 'Global manufacturer of professional dental products and technologies', website_url: 'https://www.dentsplysirona.com', sector: 'Healthcare', industry: 'Dental', founded_year: 1899, headquarters: 'Charlotte, North Carolina, USA', employee_count: 15000, market_cap: 7500000000.00 },
  { name: 'Align Technology', ticker_symbol: 'ALGN', description: 'Global medical device company with industry-leading products like Invisalign', website_url: 'https://www.aligntech.com', sector: 'Healthcare', industry: 'Dental', founded_year: 1997, headquarters: 'Tempe, Arizona, USA', employee_count: 14000, market_cap: 20000000000.00 },
  { name: 'AbbVie', ticker_symbol: 'ABBV', description: 'Research-based biopharmaceutical company and manufacturer of Botox', website_url: 'https://www.abbvie.com', sector: 'Healthcare', industry: 'Pharmaceuticals', founded_year: 2013, headquarters: 'North Chicago, Illinois, USA', employee_count: 47000, market_cap: 270000000000.00 }
];

// Sample data for dental_market_growth
const dentalMarketGrowthSampleData = [
  { category_id: 1, procedure_id: 1, year: 2024, market_size: 4200000.00, growth_rate: 5.20, region: 'North America', sub_region: 'United States', notes: 'Increasing focus on preventive care' },
  { category_id: 2, procedure_id: 3, year: 2024, market_size: 6800000.00, growth_rate: 4.50, region: 'North America', sub_region: 'United States', notes: 'Steady demand for restorative procedures' },
  { category_id: 3, procedure_id: 5, year: 2024, market_size: 3500000.00, growth_rate: 3.80, region: 'North America', sub_region: 'United States', notes: 'Moderate growth in endodontic procedures' }
];

// Sample data for aesthetic_market_growth
const aestheticMarketGrowthSampleData = [
  { category_id: 1, procedure_id: 3, year: 2024, market_size: 5800000.00, growth_rate: 8.50, region: 'North America', sub_region: 'United States', notes: 'Strong growth in facial aesthetics' },
  { category_id: 2, procedure_id: 4, year: 2024, market_size: 3200000.00, growth_rate: 7.30, region: 'North America', sub_region: 'United States', notes: 'Body contouring procedures gaining popularity' },
  { category_id: 3, procedure_id: 1, year: 2024, market_size: 1800000.00, growth_rate: 9.20, region: 'North America', sub_region: 'United States', notes: 'Injectable treatments continue rapid growth' }
];

// Function to insert sample data into a table
async function insertSampleData(tableName, data, description) {
  try {
    console.log(`${description}...`.yellow);
    
    const { data: insertedData, error } = await supabase
      .from(tableName)
      .insert(data)
      .select();
    
    if (error) {
      console.error(`❌ ${description} failed: ${error.message}`.red);
      return { success: false, count: 0 };
    }
    
    console.log(`✅ ${description} completed: ${insertedData.length} records inserted`.green);
    return { success: true, count: insertedData.length };
  } catch (err) {
    console.error(`❌ ${description} failed: ${err.message}`.red);
    return { success: false, count: 0 };
  }
}

// Main function to create all tables and populate with sample data
async function buildDatabase() {
  console.log('\nStarting database build process...'.cyan);
  
  // Create all tables
  const tables = [
    { sql: createCategoriesTable, description: 'Creating categories table' },
    { sql: createAestheticCategoriesTable, description: 'Creating aesthetic_categories table' },
    { sql: createDentalProceduresTable, description: 'Creating dental_procedures_simplified table' },
    { sql: createAestheticProceduresTable, description: 'Creating aesthetic_procedures table' },
    { sql: createCompaniesTable, description: 'Creating companies table' },
    { sql: createDentalMarketGrowthTable, description: 'Creating dental_market_growth table' },
    { sql: createAestheticMarketGrowthTable, description: 'Creating aesthetic_market_growth table' }
  ];
  
  // Create each table
  console.log('\n=================================================='.cyan);
  console.log('📊 CREATING DATABASE TABLES'.brightWhite.bold);
  console.log('==================================================\n'.cyan);
  
  for (const table of tables) {
    await executeRawSql(table.sql, table.description);
  }
  
  // Populate tables with sample data
  console.log('\n=================================================='.cyan);
  console.log('🔢 POPULATING TABLES WITH SAMPLE DATA'.brightWhite.bold);
  console.log('==================================================\n'.cyan);
  
  // First insert reference data
  await insertSampleData('categories', categoriesSampleData, 'Inserting sample categories');
  await insertSampleData('aesthetic_categories', aestheticCategoriesSampleData, 'Inserting sample aesthetic categories');
  
  // Then insert tables that depend on the reference data
  await insertSampleData('dental_procedures_simplified', dentalProceduresSampleData, 'Inserting sample dental procedures');
  await insertSampleData('aesthetic_procedures', aestheticProceduresSampleData, 'Inserting sample aesthetic procedures');
  await insertSampleData('companies', companiesSampleData, 'Inserting sample companies');
  
  // Then insert market growth data which depends on both categories and procedures
  await insertSampleData('dental_market_growth', dentalMarketGrowthSampleData, 'Inserting sample dental market growth data');
  await insertSampleData('aesthetic_market_growth', aestheticMarketGrowthSampleData, 'Inserting sample aesthetic market growth data');
  
  // Print completion summary
  console.log('\n=================================================='.cyan);
  console.log('✅ DATABASE BUILD COMPLETED'.green.bold);
  console.log('==================================================\n'.cyan);
  
  console.log('Next steps:');
  console.log('1. Run monitor-market-data-connections.js to verify all tables are correctly created');
  console.log('2. Check the dashboard to ensure market growth data is displayed correctly');
  console.log('3. Run additional data population scripts if needed for more complete data\n');
}

// Execute main function
try {
  buildDatabase();
} catch (err) {
  console.error(`\n❌ Unexpected error: ${err.message}`.red);
  console.error(err);
}
