// Basic tables setup script for Supabase
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import colors from 'colors';
import { dentalProcedures } from '../../data/dentalProcedures.js';
import { aestheticProcedures } from '../../data/aestheticProcedures.js';

colors.enable();

// Load environment variables
dotenv.config();

console.log('\n=================================================='.cyan);
console.log('🔧 SUPABASE BASIC TABLES SETUP'.brightWhite.bold);
console.log('==================================================\n'.cyan);

// Get timestamp for logging
const timestamp = new Date().toLocaleString();
console.log(`Setup started at: ${timestamp}`.gray);

// Environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

// Check environment variables
console.log('\nChecking environment variables:'.yellow);
console.log(`SUPABASE_URL: ${SUPABASE_URL ? '✅' : '❌'}`);
console.log(`SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY ? '✅' : '❌'}`);

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('\n❌ Error: Missing essential Supabase credentials'.red);
  console.log('Please check your .env file and make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set');
  process.exit(1);
}

// Create client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test connection
async function testConnection() {
  try {
    console.log('\nTesting connection...'.yellow);
    
    // Check if connection works
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error(`❌ Connection error: ${error.message}`.red);
      return false;
    }
    
    console.log('✅ Connection successful!'.green);
    return true;
  } catch (err) {
    console.error(`❌ Connection test failed: ${err.message}`.red);
    return false;
  }
}

// Create dental procedures table
async function createDentalProceduresTable() {
  try {
    console.log('\nCreating dental_procedures_simplified table...'.yellow);
    
    // First check if table exists by trying to read from it
    const { error: checkError } = await supabase
      .from('dental_procedures_simplified')
      .select('count', { count: 'exact', head: true });
    
    // If no error, table exists
    if (!checkError) {
      console.log('✅ dental_procedures_simplified table already exists'.green);
      return true;
    }
    
    // Otherwise, create the table
    const { error } = await supabase
      .from('dental_procedures')
      .insert([
        {
          procedure_name: 'Regular Dental Checkup',
          procedure_type: 'Preventive',
          description: 'Routine examination of teeth and gums',
          average_cost: 50,
          insurance_coverage: true,
          complexity_level: 1,
          recovery_time: 'None',
          popularity_score: 9.5
        }
      ]);
    
    if (error && error.code === '42P01') {
      // Table doesn't exist, create it
      console.log('Creating dental_procedures table...'.cyan);
      
      // Try to create through direct API call
      const { data, error: createError } = await supabase
        .rpc('create_dental_table', {});
      
      if (createError) {
        console.error(`❌ Error creating dental_procedures table: ${createError.message}`.red);
        
        // Fall back to default table creation by returning error so frontend can handle it
        console.log('Returning error to frontend for table creation handling'.yellow);
        return false;
      }
      
      console.log('✅ dental_procedures table created successfully'.green);
    } else if (error) {
      console.error(`❌ Error checking dental_procedures table: ${error.message}`.red);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error(`❌ Error creating dental_procedures table: ${err.message}`.red);
    return false;
  }
}

// Create aesthetic procedures table
async function createAestheticProceduresTable() {
  try {
    console.log('\nCreating aesthetic_procedures table...'.yellow);
    
    // First check if table exists by trying to read from it
    const { error: checkError } = await supabase
      .from('aesthetic_procedures')
      .select('count', { count: 'exact', head: true });
    
    // If no error, table exists
    if (!checkError) {
      console.log('✅ aesthetic_procedures table already exists'.green);
      return true;
    }
    
    // Otherwise, create the table
    const { error } = await supabase
      .from('aesthetic_procedures')
      .insert([
        {
          procedure_name: 'Botox Injection',
          procedure_type: 'Non-Surgical',
          description: 'Injectable treatment to reduce wrinkles',
          average_cost: 300,
          downtime_days: 0,
          procedure_risk: 'Low',
          popularity_trend: 'Increasing',
          satisfaction_rate: 0.85
        }
      ]);
    
    if (error && error.code === '42P01') {
      // Table doesn't exist, create it through API
      console.log('Creating aesthetic_procedures table...'.cyan);
      
      const { data, error: createError } = await supabase
        .rpc('create_aesthetic_table', {});
      
      if (createError) {
        console.error(`❌ Error creating aesthetic_procedures table: ${createError.message}`.red);
        
        // Fall back to default handling
        console.log('Returning error to frontend for table creation handling'.yellow);
        return false;
      }
      
      console.log('✅ aesthetic_procedures table created successfully'.green);
    } else if (error) {
      console.error(`❌ Error checking aesthetic_procedures table: ${error.message}`.red);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error(`❌ Error creating aesthetic_procedures table: ${err.message}`.red);
    return false;
  }
}

// Load sample data (just a few records)
async function loadSampleData() {
  try {
    console.log('\nLoading sample data...'.yellow);

    // Load dental procedures data (just a few)
    console.log('Loading dental procedures data...'.cyan);
    
    if (dentalProcedures && dentalProcedures.length > 0) {
      // Just take first 5 for testing
      const sampleDentalProcedures = dentalProcedures.slice(0, 5).map(proc => ({
        procedure_name: proc.name || 'Unknown',
        category_id: null, // Will need to be set properly in a full implementation
        yearly_growth_percentage: proc.growth || 0,
        market_size_2025_usd_millions: proc.marketSize2025 || 0,
        age_range: proc.primaryAgeGroup || 'All ages',
        recent_trends: proc.trends || 'No trend data available',
        future_outlook: proc.futureOutlook || 'No outlook data available'
      }));
      
      const { error: dentalError } = await supabase
        .from('dental_procedures_simplified')
        .upsert(sampleDentalProcedures, {
          onConflict: 'procedure_name',
          ignoreDuplicates: false
        });
      
      if (dentalError) {
        console.error(`❌ Error inserting dental procedures: ${dentalError.message}`.red);
      } else {
        console.log(`✅ Inserted ${sampleDentalProcedures.length} dental procedures`.green);
      }
    } else {
      console.warn('⚠️ No dental procedures data found'.yellow);
    }
    
    // Load aesthetic procedures data (just a few)
    console.log('Loading aesthetic procedures data...'.cyan);
    
    if (aestheticProcedures && aestheticProcedures.length > 0) {
      // Just take first 5 for testing
      const sampleAestheticProcedures = aestheticProcedures.slice(0, 5).map(proc => ({
        name: proc.name || 'Unknown',
        category_id: null, // Will need to be set properly in a full implementation
        yearly_growth_percentage: proc.growth || 0,
        market_size_2025_usd_millions: proc.marketSize2025 || 0,
        primary_age_group: proc.primaryAgeGroup || 'All ages',
        trends: proc.trends || 'No trend data available',
        future_outlook: proc.futureOutlook || 'No outlook data available'
      }));
      
      const { error: aestheticError } = await supabase
        .from('aesthetic_procedures')
        .upsert(sampleAestheticProcedures, {
          onConflict: 'name',
          ignoreDuplicates: false
        });
      
      if (aestheticError) {
        console.error(`❌ Error inserting aesthetic procedures: ${aestheticError.message}`.red);
      } else {
        console.log(`✅ Inserted ${sampleAestheticProcedures.length} aesthetic procedures`.green);
      }
    } else {
      console.warn('⚠️ No aesthetic procedures data found'.yellow);
    }
    
    return true;
  } catch (err) {
    console.error(`❌ Error loading sample data: ${err.message}`.red);
    return false;
  }
}

// Main setup process
async function setupProcess() {
  // Test connection
  const connected = await testConnection();
  
  if (!connected) {
    console.error('\n❌ Cannot proceed - connection failed'.red);
    process.exit(1);
  }
  
  // Create tables
  await createDentalProceduresTable();
  await createAestheticProceduresTable();
  
  // Load sample data
  await loadSampleData();
  
  console.log('\n=================================================='.cyan);
  console.log('✅ BASIC SETUP COMPLETED'.brightWhite.bold);
  console.log('==================================================\n'.cyan);
  
  console.log('Tables created and sample data loaded.\n');
  console.log('Next steps:');
  console.log('1. Check the frontend to see if data is displayed');
  console.log('2. If needed, run full data population scripts');
  console.log('3. For more complex tables, use the Supabase dashboard\n');
}

// Run the setup process
setupProcess();
