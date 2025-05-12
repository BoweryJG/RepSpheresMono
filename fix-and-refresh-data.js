// Fix and Refresh Supabase Data - Simple All-in-One Solution
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configure colored console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

const log = {
  info: (msg) => console.log(`${colors.cyan}${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}${msg}${colors.reset}`),
  title: (msg) => console.log(`\n${colors.blue}==========================================\n${colors.white}${msg}${colors.reset}\n${colors.blue}==========================================\n`)
};

// Load environment variables
dotenv.config();

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get Supabase credentials
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client
let supabase;

// Main function
async function main() {
  log.title("SUPABASE FIX AND REFRESH - DIRECT FIX");

  // Check environment variables
  if (!supabaseUrl || !supabaseKey) {
    log.error("❌ Missing Supabase credentials! Check your .env file.");
    process.exit(1);
  }
  
  log.success("✓ Supabase credentials found");

  // Initialize Supabase client
  supabase = createClient(supabaseUrl, supabaseKey);

  // Check connection
  log.info("Checking Supabase connection...");
  
  try {
    const { data, error } = await supabase.from('companies').select('*').limit(1);
    
    if (error) {
      log.error(`❌ Connection error: ${error.message}`);
      log.error("Cannot proceed without database connection");
      process.exit(1);
    }
    
    log.success("✓ Successfully connected to Supabase");
  } catch (err) {
    log.error(`❌ Connection error: ${err.message}`);
    log.error("Cannot proceed without database connection");
    process.exit(1);
  }

  // Load data based on the test results
  await refreshData();
}

// Function to refresh data
async function refreshData() {
  log.info("\nStarting data refresh process...");
  log.info("This will check for missing data and populate it");

  // Check and refresh companies
  await refreshTable('companies', './src/data/dentalCompanies.js');
  
  // Check and refresh aesthetic procedures
  await refreshTable('aesthetic_procedures', './src/data/aestheticProcedures.js');
  
  // Check and refresh dental procedures - use the simplified table instead
  await refreshDentalProcedures('./src/data/dentalProcedures.js');
  
  // Optional: refresh news articles
  await checkAndRefreshNews();
  
  log.success("\n✓ Data refresh complete!");
  log.info("Your Supabase database should now have all the necessary data.");
  log.info("Try running your application to see if the data is displayed correctly.");
}

// Specialized function to refresh dental procedures using the simplified table
async function refreshDentalProcedures(dataSourcePath) {
  log.info("\nChecking dental procedures...");
  
  try {
    // First check if dental_procedures_simplified exists and has data
    const { data, error, count } = await supabase
      .from('dental_procedures_simplified')
      .select('*', { count: 'exact' })
      .limit(1);
    
    if (error && error.message.includes("relation \"dental_procedures_simplified\" does not exist")) {
      log.warning(`⚠️ Table dental_procedures_simplified does not exist`);
      log.info(`Creating and populating dental_procedures_simplified table...`);
      
      // Execute the SQL to create the table
      await createDentalProceduresSimplifiedTable();
      
      // After creating, wait a moment for the table to be available
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Load the data into the new table
      await loadDentalProceduresSimplified(dataSourcePath);
      return;
    } else if (error) {
      log.error(`❌ Error checking dental_procedures_simplified: ${error.message}`);
      return;
    }
    
    if (count > 0) {
      log.success(`✓ Table dental_procedures_simplified has ${count} records`);
      return;
    }
    
    log.warning(`⚠️ Table dental_procedures_simplified exists but has no data`);
    log.info(`Loading data for dental_procedures from ${dataSourcePath}...`);
    
    // Load data into dental_procedures_simplified
    await loadDentalProceduresSimplified(dataSourcePath);
  } catch (err) {
    log.error(`❌ Error processing dental_procedures: ${err.message}`);
  }
}

// Function to execute SQL to create the dental_procedures_simplified table
async function createDentalProceduresSimplifiedTable() {
  try {
    log.info("Creating dental_procedures_simplified table...");
    
    // Drop the table first if it exists to avoid schema mismatches
    const dropResult = await supabase.rpc('execute_sql', {
      sql_query: `
        DROP TABLE IF EXISTS public.dental_procedures_simplified;
      `
    });
    
    if (dropResult.error && !dropResult.error.message.includes("function \"execute_sql\" does not exist")) {
      log.warning(`Issue dropping table: ${dropResult.error.message}`);
    }
    
    // Here we're executing the creation SQL directly
    // This is a simplified version that doesn't reference dental_categories
    const { error } = await supabase.rpc('execute_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS public.dental_procedures_simplified (
          id SERIAL PRIMARY KEY,
          procedure_name TEXT NOT NULL UNIQUE,
          yearly_growth_percentage NUMERIC(5,2) NOT NULL,
          market_size_2025_usd_millions NUMERIC(5,2) NOT NULL,
          primary_age_group TEXT NOT NULL,
          trends TEXT NOT NULL,
          outlook TEXT NOT NULL,
          category TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Enable Row Level Security (RLS)
        ALTER TABLE public.dental_procedures_simplified ENABLE ROW LEVEL SECURITY;
        
        -- Create access policy for public reading
        CREATE POLICY IF NOT EXISTS "Allow public to read dental_procedures_simplified" 
        ON public.dental_procedures_simplified 
        FOR SELECT 
        TO anon 
        USING (true);
      `
    });
    
    if (error) {
      // If execute_sql function doesn't exist, fall back to directSqlFix
      if (error.message.includes("function \"execute_sql\" does not exist")) {
        log.warning("execute_sql function not found, using alternative method...");
        
        const sqlPath = path.join(__dirname, 'src', 'services', 'supabase', 'sql', 'create_dental_procedures_simplified.sql');
        if (fs.existsSync(sqlPath)) {
          const sql = fs.readFileSync(sqlPath, 'utf8');
          const { data, error: sqlError } = await supabase.rpc('exec_sql', { sql });
          
          if (sqlError) {
            log.error(`❌ Error creating dental_procedures_simplified table: ${sqlError.message}`);
            return false;
          }
        } else {
          log.error(`❌ SQL file not found: ${sqlPath}`);
          return false;
        }
      } else {
        log.error(`❌ Error creating dental_procedures_simplified table: ${error.message}`);
        return false;
      }
    }
    
    log.success("✓ dental_procedures_simplified table created successfully");
    return true;
  } catch (err) {
    log.error(`❌ Error creating dental_procedures_simplified table: ${err.message}`);
    return false;
  }
}

// Function to refresh a specific table
async function refreshTable(tableName, dataSourcePath) {
  log.info(`\nChecking ${tableName}...`);
  
  try {
    // Handle the dental_procedures case specially
    if (tableName === 'dental_procedures') {
      // Try dental_procedures_simplified instead
      const { data, error, count } = await supabase
        .from('dental_procedures_simplified')
        .select('*', { count: 'exact' })
        .limit(1);
      
      if (error && error.message.includes("relation \"dental_procedures_simplified\" does not exist")) {
        log.warning(`⚠️ Table dental_procedures_simplified does not exist`);
        log.info(`Please run the SQL script to create the dental_procedures_simplified table`);
        log.info(`From src/services/supabase/sql/create_dental_procedures_simplified.sql`);
        return;
      } else if (error) {
        log.error(`❌ Error checking dental_procedures_simplified: ${error.message}`);
        return;
      }
      
      if (count > 0) {
        log.success(`✓ Table dental_procedures_simplified has ${count} records`);
        return;
      }
      
      log.warning(`⚠️ Table dental_procedures_simplified exists but has no data`);
      log.info(`Loading data for dental_procedures from ${dataSourcePath}...`);
      
      // Continue with loading data into dental_procedures_simplified
      await loadDentalProceduresSimplified(dataSourcePath);
      return;
    }
    
    // For other tables, proceed normally
    const { data, error, count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact' })
      .limit(1);
    
    if (error) {
      log.error(`❌ Error checking ${tableName}: ${error.message}`);
      return;
    }
    
    if (count > 0) {
      log.success(`✓ Table ${tableName} has ${count} records`);
      return;
    }
    
    log.warning(`⚠️ Table ${tableName} exists but has no data`);
    log.info(`Loading data for ${tableName} from ${dataSourcePath}...`);
    
    // Non-dental tables - Import the data source
    const dataModule = await import(dataSourcePath);
    
    // Handle different export formats
    let sourceData;
    if (dataModule.default) {
      // Default export
      sourceData = dataModule.default;
    } else if (tableName === 'aesthetic_procedures' && dataModule.aestheticProcedures) {
      // Named export for aesthetic procedures
      sourceData = dataModule.aestheticProcedures;
    } else {
      // Try to guess based on table name
      const possibleExportNames = Object.keys(dataModule);
      for (const exportName of possibleExportNames) {
        if (exportName.toLowerCase().includes(tableName.replace('_', ''))) {
          sourceData = dataModule[exportName];
          break;
        }
      }
      
      if (!sourceData) {
        sourceData = [];
      }
    }
    
    if (!Array.isArray(sourceData)) {
      log.error(`❌ Source data for ${tableName} is not an array`);
      return;
    }
    
    log.info(`Found ${sourceData.length} records to insert`);
    
    // Insert the data
    const { error: insertError } = await supabase.from(tableName).insert(sourceData);
    
    if (insertError) {
      log.error(`❌ Error inserting data into ${tableName}: ${insertError.message}`);
      return;
    }
    
    log.success(`✓ Successfully loaded data into ${tableName}`);
    
  } catch (err) {
    log.error(`❌ Error processing ${tableName}: ${err.message}`);
  }
}

// Function to load data into dental_procedures_simplified
async function loadDentalProceduresSimplified(dataSourcePath) {
  try {
    // Import the data source
    const dataModule = await import(dataSourcePath);
    
    // Get the dental procedures data
    let procedures = [];
    if (dataModule.dentalProcedures) {
      procedures = dataModule.dentalProcedures;
    } else if (dataModule.default) {
      procedures = dataModule.default;
    } else {
      log.error(`❌ Could not find dental procedures data in ${dataSourcePath}`);
      return;
    }
    
    if (!Array.isArray(procedures)) {
      log.error(`❌ Dental procedures data is not an array`);
      return;
    }
    
    log.info(`Found ${procedures.length} dental procedures to insert`);
    
    // Transform the data to match the dental_procedures_simplified schema
    const simplifiedProcedures = procedures.map(proc => ({
      procedure_name: proc.name,
      yearly_growth_percentage: proc.growth,
      market_size_2025_usd_millions: proc.marketSize2025,
      primary_age_group: proc.primaryAgeGroup,
      trends: proc.trends,
      outlook: proc.futureOutlook,
      category: proc.category // Include the category as a text field instead of a foreign key
    }));
    
    // Insert the data in batches to avoid potential size limitations
    const batchSize = 10;
    for (let i = 0; i < simplifiedProcedures.length; i += batchSize) {
      const batch = simplifiedProcedures.slice(i, i + batchSize);
      const { error } = await supabase.from('dental_procedures_simplified').insert(batch);
      
      if (error) {
        log.error(`❌ Error inserting batch of data into dental_procedures_simplified: ${error.message}`);
        // If we hit an error with a specific batch, try inserting one by one
        for (const proc of batch) {
          const { error: singleError } = await supabase.from('dental_procedures_simplified').insert([proc]);
          if (singleError) {
            log.error(`❌ Could not insert procedure "${proc.procedure_name}": ${singleError.message}`);
          } else {
            log.info(`✓ Inserted procedure ${proc.procedure_name}`);
          }
        }
      } else {
        log.info(`✓ Inserted batch of ${batch.length} procedures`);
      }
    }
    
    log.success(`✓ Successfully loaded data into dental_procedures_simplified`);
  } catch (err) {
    log.error(`❌ Error processing dental_procedures_simplified: ${err.message}`);
  }
}

// Function to check and refresh news articles
async function checkAndRefreshNews() {
  log.info("\nChecking news_articles table...");
  
  try {
    const { count, error } = await supabase
      .from('news_articles')
      .select('*', { count: 'exact' })
      .limit(1);
      
    if (error) {
      log.error(`❌ Error checking news_articles: ${error.message}`);
      return;
    }
    
    if (count > 0) {
      log.success(`✓ Table news_articles has ${count} records`);
      return;
    }
    
    log.warning("⚠️ News articles need to be refreshed");
    log.info("This requires external API calls. Skipping for now.");
    log.info("To load news articles, run:");
    log.info("node src/services/supabase/populateNewsArticles.js");
  } catch (err) {
    log.error(`❌ Error processing news_articles: ${err.message}`);
  }
}

// Start the process
main().catch((err) => {
  log.error(`Unexpected error: ${err.message}`);
  console.error(err);
  process.exit(1);
});
