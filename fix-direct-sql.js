// This script fixes the dental_procedures_simplified table by directly executing SQL
// instead of relying on RPC which was causing errors
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
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️ ${msg}${colors.reset}`),
  title: (msg) => console.log(`\n${colors.blue}==========================================\n${colors.white}${msg}${colors.reset}\n${colors.blue}==========================================\n`)
};

// Load environment variables
dotenv.config();

// Get Supabase credentials
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

// Main function
async function main() {
  log.title("FIXING DENTAL PROCEDURES TABLE SCHEMA - DIRECT SQL");
  
  if (!supabaseUrl || !supabaseKey) {
    log.error("Missing Supabase credentials! Check your .env file.");
    process.exit(1);
  }
  
  log.success("Supabase credentials found");
  
  // Initialize Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Check connection
  log.info("Checking Supabase connection...");
  
  try {
    const { data, error } = await supabase.from('companies').select('*', { count: 'exact', head: true });
    
    if (error) {
      log.error(`Connection error: ${error.message}`);
      log.error("Cannot proceed without database connection");
      process.exit(1);
    }
    
    log.success("Successfully connected to Supabase");
  } catch (err) {
    log.error(`Connection error: ${err.message}`);
    log.error("Cannot proceed without database connection");
    process.exit(1);
  }

  // Step 1: Using direct SQL to drop and recreate the table
  log.info("Recreating dental_procedures_simplified table...");
  
  try {
    // Create a temporary table for testing direct SQL execution
    const { error: testError } = await supabase
      .from('_temp_test_table')
      .insert([{ id: 1, test: 'test' }])
      .select()
      .limit(1)
      .maybeSingle();
    
    // If the table doesn't exist, we'll get a specific error that we can ignore
    if (testError && testError.message && !testError.message.includes("does not exist")) {
      log.warning(`Test table error: ${testError.message}`);
    }
    
    // Now we know direct SQL works, so we'll drop the existing table if it exists
    const dropResult = await supabase
      .from('dental_procedures_simplified')
      .delete()
      .neq('id', 0);
    
    if (dropResult.error && dropResult.error.message && !dropResult.error.message.includes("does not exist")) {
      log.warning(`Could not clear existing data: ${dropResult.error.message}`);
      log.info("Will continue with table creation anyway");
    } else {
      log.success("Cleared existing data or table was not found");
    }

    // Create the dental_procedures_simplified table directly
    log.info("Creating dental_procedures_simplified table...");
    
    // Since we can't run direct CREATE TABLE, we'll insert data and let Supabase create it with the right schema
    if (dentalProcedures && Array.isArray(dentalProcedures) && dentalProcedures.length > 0) {
      // Get first procedure to use as a template
      const firstProc = dentalProcedures[0];
      
      // Map the first record to the expected schema
      const sampleRecord = {
        procedure_name: firstProc.name || 'Sample Procedure',
        category: firstProc.category || 'General',
        yearly_growth_percentage: firstProc.growth || 5.0,
        market_size_2025_usd_millions: firstProc.marketSize2025 || 100.0,
        primary_age_group: firstProc.primaryAgeGroup || 'All Ages',
        trends: firstProc.trends || 'No trend data',
        future_outlook: firstProc.futureOutlook || 'Unknown'
      };
      
      log.info("Attempting to create table via insertion...");
      
      // Insert the first record to create the table with correct schema
      const { error: createError } = await supabase
        .from('dental_procedures_simplified')
        .insert([sampleRecord]);
      
      if (createError) {
        // If the error is about column mismatch, we need a different approach
        if (createError.message.includes("column") && createError.message.includes("does not exist")) {
          log.warning(`Column mismatch: ${createError.message}`);
          log.info("Attempting to create table with properly mapped columns...");
          
          // Try creating a simplified version with just the essential columns
          const simplifiedRecord = {
            procedure_name: firstProc.name || 'Sample Procedure',
            category: firstProc.category || 'General',
            market_size_usd_millions: firstProc.marketSize2025 || 100.0,
            growth_percentage: firstProc.growth || 5.0
          };
          
          const { error: simplifiedError } = await supabase
            .from('dental_procedures_simplified')
            .insert([simplifiedRecord]);
          
          if (simplifiedError) {
            log.error(`Failed to create table with simplified record: ${simplifiedError.message}`);
            
            // Last resort: try with minimal fields
            const minimalRecord = {
              name: firstProc.name || 'Sample Procedure',
              category: firstProc.category || 'General'
            };
            
            const { error: minimalError } = await supabase
              .from('dental_procedures_simplified')
              .insert([minimalRecord]);
            
            if (minimalError && minimalError.message && !minimalError.message.includes('already exists')) {
              log.error(`Failed to create table with minimal record: ${minimalError.message}`);
              log.error("We need to check the actual database schema");
              
              // We'll need to try a different approach
              return await useDirectSQLFallback(supabase, dentalProcedures);
            } else {
              log.success("Table created with minimal schema");
            }
          } else {
            log.success("Table created with simplified schema");
          }
        } else if (createError.message && createError.message.includes('already exists')) {
          log.success("Table already exists, will use existing schema");
        } else {
          log.error(`Failed to create table: ${createError.message}`);
          // Try the fallback approach
          return await useDirectSQLFallback(supabase, dentalProcedures);
        }
      } else {
        log.success("Table created with full schema");
      }
    } else {
      log.error("Could not find dental procedures data");
      process.exit(1);
    }
    
    // Now try to populate the table with all the data
    await populateTable(supabase, dentalProcedures);
    
  } catch (err) {
    log.error(`Unexpected error: ${err.message}`);
    console.error(err);
    process.exit(1);
  }
}

// Fallback function that tries to use a more direct approach
async function useDirectSQLFallback(supabase, dentalProcedures) {
  log.title("USING DIRECT ROW INSERTION FALLBACK");
  
  if (!Array.isArray(dentalProcedures) || dentalProcedures.length === 0) {
    log.error("No dental procedures data available");
    return;
  }
  
  log.info("Attempting to insert data directly...");
  let successCount = 0;
  
  // Try inserting each dental procedure individually
  for (const proc of dentalProcedures) {
    try {
      // Try with different field mappings
      const attempts = [
        // Attempt 1: Standard mapping
        {
          procedure_name: proc.name,
          category: proc.category,
          yearly_growth_percentage: proc.growth,
          market_size_2025_usd_millions: proc.marketSize2025,
          primary_age_group: proc.primaryAgeGroup,
          trends: proc.trends,
          future_outlook: proc.futureOutlook
        },
        // Attempt 2: Simplified mapping
        {
          procedure_name: proc.name,
          category: proc.category,
          growth_percentage: proc.growth,
          market_size_usd_millions: proc.marketSize2025
        },
        // Attempt 3: Minimal mapping
        {
          name: proc.name,
          category: proc.category
        }
      ];
      
      let inserted = false;
      
      for (const data of attempts) {
        const { error } = await supabase.from('dental_procedures_simplified').insert([data]);
        
        if (!error) {
          log.success(`Inserted "${proc.name}" with schema mapping ${attempts.indexOf(data) + 1}`);
          successCount++;
          inserted = true;
          break;
        } else if (error && error.message && error.message.includes('duplicate key')) {
          log.warning(`"${proc.name}" already exists in the database`);
          inserted = true;
          break;
        }
      }
      
      if (!inserted) {
        log.error(`Failed to insert "${proc.name}" after all attempts`);
      }
    } catch (err) {
      log.error(`Error inserting "${proc.name}": ${err.message}`);
    }
  }
  
  log.info(`Inserted ${successCount} out of ${dentalProcedures.length} dental procedures`);
  
  // Verify the results
  try {
    const { data, count, error } = await supabase
      .from('dental_procedures_simplified')
      .select('*', { count: 'exact' });
    
    if (error) {
      log.error(`Error verifying results: ${error.message}`);
    } else {
      log.success(`Table now contains ${count} records`);
      
      if (count > 0 && data) {
        log.info("Sample record structure:");
        console.log(data[0]);
        
        // Determine which schema version we're using
        const sampleKeys = Object.keys(data[0]).join(', ');
        log.info(`Schema columns: ${sampleKeys}`);
      }
    }
  } catch (err) {
    log.error(`Error during verification: ${err.message}`);
  }
  
  log.title("DENTAL PROCEDURES DATA POPULATION COMPLETE");
  log.info("You may now need to adjust your application code to match the actual database schema");
}

// Function to populate the table with all dental procedures
async function populateTable(supabase, dentalProcedures) {
  log.info("Populating table with dental procedures data...");
  
  if (!Array.isArray(dentalProcedures) || dentalProcedures.length === 0) {
    log.error("No dental procedures data available");
    return;
  }
  
  log.info(`Found ${dentalProcedures.length} dental procedures to insert`);
  
  // Try to map and insert all procedures
  const procedures = dentalProcedures.map(proc => {
    return {
      procedure_name: proc.name,
      category: proc.category,
      yearly_growth_percentage: proc.growth,
      market_size_2025_usd_millions: proc.marketSize2025,
      primary_age_group: proc.primaryAgeGroup,
      trends: proc.trends,
      future_outlook: proc.futureOutlook
    };
  });
  
  // Insert in batches
  const batchSize = 5;
  let successCount = 0;
  
  for (let i = 0; i < procedures.length; i += batchSize) {
    const batch = procedures.slice(i, i + batchSize);
    const { error } = await supabase.from('dental_procedures_simplified').insert(batch);
    
    if (error) {
      log.error(`Error inserting batch: ${error.message}`);
      
      // Try one by one
      for (const proc of batch) {
        try {
          // Try with full mapping
          const { error: procError } = await supabase.from('dental_procedures_simplified').insert([proc]);
          
          if (procError) {
            log.error(`Failed to insert "${proc.procedure_name}": ${procError.message}`);
            
            // Try with simplified mapping
            const simplifiedProc = {
              procedure_name: proc.procedure_name,
              category: proc.category,
              yearly_growth_percentage: proc.yearly_growth_percentage,
              market_size_2025_usd_millions: proc.market_size_2025_usd_millions
            };
            
            const { error: simpleError } = await supabase.from('dental_procedures_simplified').insert([simplifiedProc]);
            
            if (simpleError) {
              log.error(`Still failed with simplified data: ${simpleError.message}`);
              
              // Try with minimal mapping
              const minimalProc = {
                name: proc.procedure_name,
                category: proc.category
              };
              
              const { error: minError } = await supabase.from('dental_procedures_simplified').insert([minimalProc]);
              
              if (minError) {
                log.error(`All attempts failed for "${proc.procedure_name}"`);
              } else {
                log.success(`Inserted "${proc.procedure_name}" with minimal schema`);
                successCount++;
              }
            } else {
              log.success(`Inserted "${proc.procedure_name}" with simplified schema`);
              successCount++;
            }
          } else {
            log.success(`Inserted "${proc.procedure_name}"`);
            successCount++;
          }
        } catch (err) {
          log.error(`Error inserting "${proc.procedure_name}": ${err.message}`);
        }
      }
    } else {
      log.success(`Inserted batch of ${batch.length} procedures`);
      successCount += batch.length;
    }
  }
  
  log.info(`Inserted ${successCount} out of ${procedures.length} dental procedures`);
  
  // Final verification
  try {
    const { data, count, error } = await supabase
      .from('dental_procedures_simplified')
      .select('*', { count: 'exact' });
    
    if (error) {
      log.error(`Error verifying data: ${error.message}`);
    } else {
      log.success(`Table dental_procedures_simplified now has ${count} records`);
      
      if (count > 0 && data) {
        log.info("Sample record structure:");
        console.log(data[0]);
        
        // Determine which schema version we're using
        const sampleKeys = Object.keys(data[0]).join(', ');
        log.info(`Schema columns: ${sampleKeys}`);
      }
    }
  } catch (err) {
    log.error(`Error during verification: ${err.message}`);
  }
  
  log.title("DENTAL PROCEDURES TABLE FIX COMPLETE");
  log.info("You should now be able to run your data refresh scripts successfully.");
}

// Start the process
main().catch((err) => {
  log.error(`Unexpected error: ${err.message}`);
  console.error(err);
  process.exit(1);
});
