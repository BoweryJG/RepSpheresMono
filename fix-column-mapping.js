// Fix the column mapping issue with dental_procedures_simplified
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { dentalProcedures } from './src/data/dentalProcedures.js';

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

// Get Supabase credentials
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client
let supabase;

// Main function
async function main() {
  log.title("FIXING DENTAL PROCEDURES TABLE MAPPING");

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

  // First, let's check the actual schema
  await checkTableSchema();
  
  // Now fix the dental procedures data
  await fixAndLoadDentalProcedures();
}

// Function to check the actual table schema
async function checkTableSchema() {
  log.info("\nChecking actual table schema for dental_procedures_simplified...");
  
  try {
    const { data, error } = await supabase
      .from('dental_procedures_simplified')
      .select('*')
      .limit(1);
    
    if (error) {
      log.error(`❌ Error checking table: ${error.message}`);
      return;
    }
    
    // Check if the table exists but has no data
    if (data && data.length === 0) {
      log.warning("⚠️ Table exists but has no data");
      
      // Try to get the column information
      const { data: columns, error: colError } = await supabase.rpc('list_columns', { 
        table_name: 'dental_procedures_simplified' 
      }).catch(() => {
        // Function might not exist
        return { data: null, error: { message: "Function not available" } };
      });
      
      if (colError) {
        log.warning(`⚠️ Could not get column information: ${colError.message}`);
        log.info("Will proceed assuming the schema from fix-table-column.js");
      } else if (columns) {
        log.success("✓ Retrieved column information");
        columns.forEach(col => {
          log.info(`  - ${col.column_name}: ${col.data_type}`);
        });
      }
    } else if (data) {
      log.success("✓ Table exists and has data");
      log.info("Sample data structure:");
      console.log(data[0]);
    }
  } catch (err) {
    log.error(`❌ Error checking schema: ${err.message}`);
  }
}

// Function to fix and load dental procedures
async function fixAndLoadDentalProcedures() {
  log.info("\nLoading dental procedures with correct column mapping...");
  
  try {
    // First clear the existing data to avoid duplicates
    const { error: clearError } = await supabase
      .from('dental_procedures_simplified')
      .delete()
      .not('id', 'is', null);
    
    if (clearError) {
      log.warning(`⚠️ Could not clear existing data: ${clearError.message}`);
      log.info("Will attempt to continue with insert anyway");
    } else {
      log.success("✓ Cleared existing data");
    }
    
    if (!dentalProcedures || !Array.isArray(dentalProcedures)) {
      log.error("❌ Could not find dental procedures data");
      return;
    }
    
    log.info(`Found ${dentalProcedures.length} dental procedures to insert`);
    
    // Create both mappings to support both schema versions
    const procedures = dentalProcedures.map(proc => {
      // Try mapping for both possible column names to handle schema variations
      return {
        procedure_name: proc.name,
        yearly_growth_percentage: proc.growth,
        market_size_2025_usd_millions: proc.marketSize2025,
        primary_age_group: proc.primaryAgeGroup,
        trends: proc.trends,
        // Map to both column names to handle different schema possibilities
        outlook: proc.futureOutlook,
        future_outlook: proc.futureOutlook,
        category: proc.category
      };
    });
    
    // Insert the data in batches
    const batchSize = 10;
    let successCount = 0;
    
    for (let i = 0; i < procedures.length; i += batchSize) {
      const batch = procedures.slice(i, i + batchSize);
      const { error } = await supabase.from('dental_procedures_simplified').insert(batch);
      
      if (error) {
        log.error(`❌ Error inserting batch: ${error.message}`);
        
        // Try one by one
        for (const proc of batch) {
          const { error: singleError } = await supabase.from('dental_procedures_simplified').insert([proc]);
          if (singleError) {
            // Log a more detailed error for diagnostics
            log.error(`❌ Failed to insert "${proc.procedure_name}": ${singleError.message}`);
            
            // Try with a more focused object (only include the exact columns we're sure of)
            const minimalProc = {
              procedure_name: proc.procedure_name,
              yearly_growth_percentage: proc.yearly_growth_percentage,
              market_size_2025_usd_millions: proc.market_size_2025_usd_millions,
              primary_age_group: proc.primary_age_group,
              trends: proc.trends,
              category: proc.category
            };
            
            // If we're still not sure which outlook column works, try them one at a time
            const { error: minError } = await supabase.from('dental_procedures_simplified').insert([minimalProc]);
            if (minError) {
              log.error(`❌ Still failed with minimal data: ${minError.message}`);
            } else {
              log.success(`✓ Inserted "${proc.procedure_name}" with minimal data`);
              successCount++;
              
              // Now let's try to update with the outlook field
              try {
                // Try with 'outlook' column
                const { error: updateError } = await supabase
                  .from('dental_procedures_simplified')
                  .update({ outlook: proc.outlook })
                  .eq('procedure_name', proc.procedure_name);
                
                if (!updateError) {
                  log.info(`  Updated with 'outlook' column`);
                } else {
                  // Try with 'future_outlook' column
                  const { error: updateError2 } = await supabase
                    .from('dental_procedures_simplified')
                    .update({ future_outlook: proc.future_outlook })
                    .eq('procedure_name', proc.procedure_name);
                  
                  if (!updateError2) {
                    log.info(`  Updated with 'future_outlook' column`);
                  } else {
                    log.warning(`⚠️ Could not update outlook field: ${updateError2.message}`);
                  }
                }
              } catch (updateErr) {
                log.warning(`⚠️ Error during update: ${updateErr.message}`);
              }
            }
          } else {
            log.success(`✓ Inserted "${proc.procedure_name}"`);
            successCount++;
          }
        }
      } else {
        log.success(`✓ Inserted batch of ${batch.length} procedures`);
        successCount += batch.length;
      }
    }
    
    log.info(`\nInserted ${successCount} out of ${procedures.length} dental procedures`);
    
    // Final verification
    const { data: verifyData, error: verifyError, count } = await supabase
      .from('dental_procedures_simplified')
      .select('*', { count: 'exact' });
    
    if (verifyError) {
      log.error(`❌ Error verifying data: ${verifyError.message}`);
    } else {
      log.success(`✓ Table dental_procedures_simplified now has ${count} records`);
      
      if (count > 0) {
        log.info("Sample record:");
        console.log(verifyData[0]);
      }
    }
    
  } catch (err) {
    log.error(`❌ Error processing dental procedures: ${err.message}`);
  }
}

// Start the process
main().catch((err) => {
  log.error(`Unexpected error: ${err.message}`);
  console.error(err);
  process.exit(1);
});
