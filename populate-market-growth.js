// Script to populate market growth tables
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import colors from 'colors';

colors.enable();

// Load environment variables
dotenv.config();

console.log('\n=================================================='.cyan);
console.log('🚀 MARKET GROWTH DATA POPULATION TOOL'.brightWhite.bold);
console.log('==================================================\n'.cyan);

// Get timestamp for logging
const timestamp = new Date().toLocaleString();
console.log(`Population started at: ${timestamp}`.gray);

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

// Function to fetch aesthetic categories for reference
async function fetchAestheticCategories() {
  console.log('Fetching aesthetic categories for reference...'.gray);
  
  const { data, error } = await supabase
    .from('aesthetic_categories')
    .select('id, name')
    .order('id');
    
  if (error) {
    console.error(`❌ Error fetching aesthetic categories: ${error.message}`.red);
    return [];
  }
  
  if (!data || data.length === 0) {
    console.warn('⚠️ No aesthetic categories found in database'.yellow);
    return [];
  }
  
  console.log(`✅ Found ${data.length} aesthetic categories`.green);
  console.table(data.map(cat => ({ id: cat.id, name: cat.name })));
  
  return data;
}

// Sample dental market growth data
const dentalMarketGrowthData = [
  {
    procedure_id: null,
    category_id: 1,
    year: 2020,
    growth_rate: 2.5,
    market_size_usd: 145000000,
    region: 'North America',
    country: 'USA',
    notes: 'Pre-pandemic market data'
  },
  {
    procedure_id: null,
    category_id: 1,
    year: 2021,
    growth_rate: 1.2,
    market_size_usd: 146800000,
    region: 'North America',
    country: 'USA',
    notes: 'Covid affected growth'
  },
  {
    procedure_id: null,
    category_id: 1,
    year: 2022,
    growth_rate: 3.7,
    market_size_usd: 152200000,
    region: 'North America',
    country: 'USA',
    notes: 'Recovery period'
  },
  {
    procedure_id: null,
    category_id: 1,
    year: 2023,
    growth_rate: 4.2,
    market_size_usd: 158600000,
    region: 'North America',
    country: 'USA',
    notes: 'Strong growth post-pandemic'
  },
  {
    procedure_id: null,
    category_id: 2,
    year: 2020,
    growth_rate: 1.8,
    market_size_usd: 82000000,
    region: 'North America',
    country: 'USA',
    notes: 'Conservative growth'
  },
  {
    procedure_id: null,
    category_id: 2,
    year: 2021,
    growth_rate: 0.9,
    market_size_usd: 82750000,
    region: 'North America',
    country: 'USA',
    notes: 'Slow growth during pandemic'
  },
  {
    procedure_id: null,
    category_id: 2,
    year: 2022,
    growth_rate: 2.8,
    market_size_usd: 85100000,
    region: 'North America',
    country: 'USA',
    notes: 'Stabilizing growth'
  },
  {
    procedure_id: null,
    category_id: 2,
    year: 2023,
    growth_rate: 3.5,
    market_size_usd: 88000000,
    region: 'North America',
    country: 'USA',
    notes: 'Increasing demand'
  },
  {
    procedure_id: null,
    category_id: 3,
    year: 2020,
    growth_rate: 3.2,
    market_size_usd: 110000000,
    region: 'North America',
    country: 'USA',
    notes: 'Strong initial growth'
  },
  {
    procedure_id: null,
    category_id: 3,
    year: 2021,
    growth_rate: 1.5,
    market_size_usd: 111650000,
    region: 'North America',
    country: 'USA',
    notes: 'Reduced growth due to COVID'
  },
  {
    procedure_id: null,
    category_id: 3,
    year: 2022,
    growth_rate: 4.1,
    market_size_usd: 116200000,
    region: 'North America',
    country: 'USA',
    notes: 'Rebounding growth'
  },
  {
    procedure_id: null,
    category_id: 3,
    year: 2023,
    growth_rate: 4.8,
    market_size_usd: 121800000,
    region: 'North America',
    country: 'USA',
    notes: 'Accelerating demand'
  }
];

// Sample aesthetic market growth data - will be updated with correct category IDs
let aestheticMarketGrowthData = [
  // Facial Procedures data (category 1)
  {
    procedure_id: null,
    category_id: 1,
    year: 2020,
    growth_rate: 3.1,
    market_size_usd: 125000000,
    region: 'North America',
    country: 'USA',
    notes: 'Pre-pandemic market data'
  },
  {
    procedure_id: null,
    category_id: 1,
    year: 2021,
    growth_rate: 1.8,
    market_size_usd: 127200000,
    region: 'North America',
    country: 'USA',
    notes: 'Covid affected growth'
  },
  {
    procedure_id: null,
    category_id: 1,
    year: 2022,
    growth_rate: 4.5,
    market_size_usd: 133000000,
    region: 'North America',
    country: 'USA',
    notes: 'Strong recovery post-pandemic'
  },
  {
    procedure_id: null,
    category_id: 1,
    year: 2023,
    growth_rate: 5.2,
    market_size_usd: 140000000,
    region: 'North America',
    country: 'USA',
    notes: 'Accelerated growth - zoom effect'
  },
  // Body Contouring data (category 2)
  {
    procedure_id: null,
    category_id: 2,
    year: 2020,
    growth_rate: 2.9,
    market_size_usd: 92000000,
    region: 'North America',
    country: 'USA',
    notes: 'Steady growth pre-pandemic'
  },
  {
    procedure_id: null,
    category_id: 2,
    year: 2021,
    growth_rate: 1.4,
    market_size_usd: 93300000,
    region: 'North America',
    country: 'USA',
    notes: 'Reduced growth during pandemic'
  },
  {
    procedure_id: null,
    category_id: 2,
    year: 2022,
    growth_rate: 3.8,
    market_size_usd: 96800000,
    region: 'North America',
    country: 'USA',
    notes: 'Recovery period'
  },
  {
    procedure_id: null,
    category_id: 2,
    year: 2023,
    growth_rate: 4.7,
    market_size_usd: 101300000,
    region: 'North America',
    country: 'USA',
    notes: 'Strong demand post-pandemic'
  },
  // Skin Treatments data (category 3)
  {
    procedure_id: null,
    category_id: 3,
    year: 2020,
    growth_rate: 3.5,
    market_size_usd: 78000000,
    region: 'North America',
    country: 'USA',
    notes: 'Strong initial demand'
  },
  {
    procedure_id: null,
    category_id: 3,
    year: 2021,
    growth_rate: 2.0,
    market_size_usd: 79600000,
    region: 'North America',
    country: 'USA',
    notes: 'Moderate growth during pandemic'
  },
  {
    procedure_id: null,
    category_id: 3,
    year: 2022,
    growth_rate: 4.3,
    market_size_usd: 83000000,
    region: 'North America',
    country: 'USA',
    notes: 'Increasing demand'
  },
  {
    procedure_id: null,
    category_id: 3,
    year: 2023,
    growth_rate: 5.5,
    market_size_usd: 87600000,
    region: 'North America',
    country: 'USA',
    notes: 'Strong growth with social media influence'
  },
  // Injectables data (category 5)
  {
    procedure_id: null,
    category_id: 5,
    year: 2020,
    growth_rate: 4.2,
    market_size_usd: 115000000,
    region: 'North America',
    country: 'USA',
    notes: 'High demand for non-surgical procedures'
  },
  {
    procedure_id: null,
    category_id: 5,
    year: 2021,
    growth_rate: 2.5,
    market_size_usd: 117875000,
    region: 'North America',
    country: 'USA',
    notes: 'Continued growth despite pandemic'
  },
  {
    procedure_id: null,
    category_id: 5,
    year: 2022,
    growth_rate: 5.8,
    market_size_usd: 124700000,
    region: 'North America',
    country: 'USA',
    notes: 'Strong post-pandemic surge'
  },
  {
    procedure_id: null,
    category_id: 5,
    year: 2023,
    growth_rate: 6.2,
    market_size_usd: 132400000,
    region: 'North America',
    country: 'USA',
    notes: 'Zoom effect driving demand for facial injectables'
  }
];

// Function to populate dental market growth data
async function populateDentalMarketGrowth() {
  console.log('\nPopulating dental market growth data...'.yellow);

  // First, check if we need to update existing records or insert new ones
  const { data: existingData, error: checkError, count } = await supabase
    .from('dental_market_growth')
    .select('*', { count: 'exact' });

  if (checkError) {
    console.error(`❌ Error checking dental market growth data: ${checkError.message}`.red);
    return false;
  }

  if (count > 0) {
    console.log(`⚠️ Found ${count} existing records in dental_market_growth.`.yellow);
    
    // Option to clear existing data
    console.log('Clearing existing dental market growth data...'.gray);
    const { error: deleteError } = await supabase
      .from('dental_market_growth')
      .delete()
      .gte('id', 0);

    if (deleteError) {
      console.error(`❌ Error clearing dental market growth data: ${deleteError.message}`.red);
      return false;
    }
    
    console.log('✅ Existing dental market growth data cleared.'.green);
  }

  // Insert new data
  const { data, error } = await supabase
    .from('dental_market_growth')
    .insert(dentalMarketGrowthData)
    .select();

  if (error) {
    console.error(`❌ Error populating dental market growth data: ${error.message}`.red);
    return false;
  }

  console.log(`✅ Successfully populated ${data.length} dental market growth records.`.green);
  return true;
}

// Function to populate aesthetic market growth data
async function populateAestheticMarketGrowth() {
  console.log('\nPopulating aesthetic market growth data...'.yellow);

  // First, check if we need to update existing records or insert new ones
  const { data: existingData, error: checkError, count } = await supabase
    .from('aesthetic_market_growth')
    .select('*', { count: 'exact' });

  if (checkError) {
    console.error(`❌ Error checking aesthetic market growth data: ${checkError.message}`.red);
    return false;
  }

  if (count > 0) {
    console.log(`⚠️ Found ${count} existing records in aesthetic_market_growth.`.yellow);
    
    // Option to clear existing data
    console.log('Clearing existing aesthetic market growth data...'.gray);
    const { error: deleteError } = await supabase
      .from('aesthetic_market_growth')
      .delete()
      .gte('id', 0);

    if (deleteError) {
      console.error(`❌ Error clearing aesthetic market growth data: ${deleteError.message}`.red);
      return false;
    }
    
    console.log('✅ Existing aesthetic market growth data cleared.'.green);
  }
  
  // Get aesthetic categories to ensure we're using valid category IDs
  const aestheticCategories = await fetchAestheticCategories();
  
  if (aestheticCategories.length > 0) {
    // Make sure our data uses valid category IDs
    const validCategoryIds = aestheticCategories.map(cat => cat.id);
    
    // For any rows with invalid category IDs, adjust them to use valid IDs
    aestheticMarketGrowthData = aestheticMarketGrowthData.map(record => {
      if (!validCategoryIds.includes(record.category_id)) {
        // Find the closest valid category ID
        const closestValidId = validCategoryIds[0];
        console.log(`Adjusting category_id from ${record.category_id} to ${closestValidId} for a record`.yellow);
        return { ...record, category_id: closestValidId };
      }
      return record;
    });
  }

  // Insert new data
  const { data, error } = await supabase
    .from('aesthetic_market_growth')
    .insert(aestheticMarketGrowthData)
    .select();

  if (error) {
    console.error(`❌ Error populating aesthetic market growth data: ${error.message}`.red);
    return false;
  }

  console.log(`✅ Successfully populated ${data.length} aesthetic market growth records.`.green);
  return true;
}

// Main function
async function main() {
  console.log('Starting market growth data population process...'.cyan);
  
  // First, validate that required tables exist
  console.log('Validating required tables...'.yellow);
  
  // Validate dental_market_growth table
  const { data: dentalTable, error: dentalError } = await supabase
    .from('dental_market_growth')
    .select('id')
    .limit(1);
    
  if (dentalError) {
    console.error(`❌ Dental market growth table is not accessible: ${dentalError.message}`.red);
    console.log('Run fix-market-growth-tables.js first to create the necessary tables'.yellow);
    process.exit(1);
  }
  
  // Validate aesthetic_market_growth table  
  const { data: aestheticTable, error: aestheticError } = await supabase
    .from('aesthetic_market_growth')
    .select('id')
    .limit(1);
    
  if (aestheticError) {
    console.error(`❌ Aesthetic market growth table is not accessible: ${aestheticError.message}`.red);
    console.log('Run fix-market-growth-tables.js first to create the necessary tables'.yellow);
    process.exit(1);
  }
  
  // Validate aesthetic_categories table  
  const { data: categoriesTable, error: categoriesError } = await supabase
    .from('aesthetic_categories')
    .select('id')
    .limit(1);
    
  if (categoriesError) {
    console.error(`❌ Aesthetic categories table is not accessible: ${categoriesError.message}`.red);
    console.log('Run fix-market-growth-tables.js first to create the necessary tables'.yellow);
    process.exit(1);
  }
  
  console.log('✅ Required tables exist and are accessible'.green);
  
  const dentalSuccess = await populateDentalMarketGrowth();
  const aestheticSuccess = await populateAestheticMarketGrowth();
  
  console.log('\n=================================================='.cyan);
  console.log('🔍 POPULATION RESULT'.brightWhite.bold);
  console.log('==================================================\n'.cyan);
  
  if (dentalSuccess) {
    console.log('✅ Dental market growth data populated successfully'.green);
  } else {
    console.error('❌ Failed to populate dental market growth data'.red);
  }
  
  if (aestheticSuccess) {
    console.log('✅ Aesthetic market growth data populated successfully'.green);
  } else {
    console.error('❌ Failed to populate aesthetic market growth data'.red);
  }
  
  if (dentalSuccess && aestheticSuccess) {
    console.log('\n🚀 All market growth data has been successfully populated!'.green);
    console.log('\nNext steps:');
    console.log('1. Run verify-market-growth-tables.js to verify the populated data');
    console.log('2. Check your application for proper database connectivity');
  } else {
    console.error('\n⚠️ Some data population operations failed.'.yellow);
    console.log('\nPossible issues:');
    console.log('1. Database connection issues');
    console.log('2. Table structure or constraint issues');
    console.log('3. Permission issues');
    
    console.log('\nTry:');
    console.log('1. Running fix-supabase-connection.js to ensure proper setup');
    console.log('2. Checking database logs for specific errors');
  }
  
  console.log('\n==================================================\n'.cyan);
}

// Run the main function
main();
