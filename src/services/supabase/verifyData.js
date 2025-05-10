import { supabase } from './supabaseClient.js';

/**
 * Verify that data has been loaded into Supabase tables
 */
const verifyData = async () => {
  console.log("\n=== VERIFYING SUPABASE DATA ===\n");
  
  const tables = [
    // Main category tables
    { name: 'dental_categories', expectedMinCount: 1 },
    { name: 'aesthetic_categories', expectedMinCount: 1 },
    
    // Main procedure tables
    { name: 'dental_procedures', expectedMinCount: 3 },
    { name: 'aesthetic_procedures', expectedMinCount: 3 },
    
    // Market growth tables
    { name: 'dental_market_growth', expectedMinCount: 3 },
    { name: 'aesthetic_market_growth', expectedMinCount: 3 },
    
    // Demographics tables
    { name: 'dental_demographics', expectedMinCount: 3 },
    { name: 'aesthetic_demographics', expectedMinCount: 3 },
    
    // Gender distribution tables
    { name: 'dental_gender_distribution', expectedMinCount: 2 },
    { name: 'aesthetic_gender_distribution', expectedMinCount: 2 },
    
    // Geographic tables
    { name: 'metropolitan_markets', expectedMinCount: 1 },
    { name: 'market_size_by_state', expectedMinCount: 10 },
    { name: 'regions', expectedMinCount: 1 },
    
    // Regional analytics tables
    { name: 'growth_rates_by_region', expectedMinCount: 1 },
    { name: 'procedures_by_region', expectedMinCount: 1 },
    { name: 'demographics_by_region', expectedMinCount: 1 },
    { name: 'gender_split_by_region', expectedMinCount: 1 },
    
    // Provider tables
    { name: 'top_providers', expectedMinCount: 1 },
    
    // Companies table (added to verification)
    { name: 'companies', expectedMinCount: 5 }
  ];
  
  let tableCounts = {};
  let errors = [];
  let tablesWithData = 0;
  let tablesWithoutData = 0;
  
  // Check each table
  for (const table of tables) {
    try {
      console.log(`Checking table: ${table.name}...`);
      
      const { count, error } = await supabase
        .from(table.name)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error(`❌ Error checking table ${table.name}:`, error.message);
        errors.push({ table: table.name, error: error.message });
        continue;
      }
      
      tableCounts[table.name] = count;
      
      if (count >= table.expectedMinCount) {
        console.log(`✅ Table ${table.name} has ${count} rows (expected minimum: ${table.expectedMinCount})`);
        tablesWithData++;
      } else {
        console.log(`❌ Table ${table.name} has only ${count} rows (expected minimum: ${table.expectedMinCount})`);
        tablesWithoutData++;
      }
    } catch (err) {
      console.error(`❌ Unexpected error checking table ${table.name}:`, err);
      errors.push({ table: table.name, error: err.message });
    }
  }
  
  // Print summary
  console.log("\n=== DATA VERIFICATION SUMMARY ===\n");
  console.log(`Tables with sufficient data: ${tablesWithData}/${tables.length}`);
  console.log(`Tables with insufficient data: ${tablesWithoutData}/${tables.length}`);
  console.log(`Tables with errors: ${errors.length}/${tables.length}`);
  
  if (errors.length > 0) {
    console.log("\nErrors encountered:");
    errors.forEach(error => {
      console.log(`- Table ${error.table}: ${error.error}`);
    });
  }
  
  console.log("\nTable counts:");
  Object.entries(tableCounts).forEach(([table, count]) => {
    console.log(`- ${table}: ${count} rows`);
  });
  
  // Return overall assessment
  return {
    success: tablesWithData === tables.length,
    tablesWithData,
    tablesWithoutData,
    totalTables: tables.length,
    errors,
    tableCounts
  };
};

// Run verification
verifyData()
  .then(result => {
    console.log("\n=== FINAL RESULT ===\n");
    if (result.success) {
      console.log("✅ All tables have been populated with data successfully!");
      process.exit(0);
    } else if (result.tablesWithData > 0) {
      console.log("⚠️ Some tables have been populated, but not all.");
      console.log(`${result.tablesWithData}/${result.totalTables} tables have sufficient data.`);
      process.exit(0);
    } else {
      console.log("❌ Data loading appears to have failed. No tables have sufficient data.");
      process.exit(1);
    }
  })
  .catch(err => {
    console.error("❌ Error running verification:", err);
    process.exit(1);
  });
