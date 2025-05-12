// Check the actual table columns in Supabase
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get Supabase credentials
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("\n=== CHECKING ACTUAL DENTAL_PROCEDURES_SIMPLIFIED COLUMNS ===\n");
  
  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials! Check your .env file.");
    process.exit(1);
  }

  try {
    // First try to get the columns using PostgreSQL information_schema
    const { data, error } = await supabase.rpc('execute_sql', {
      sql_query: `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'dental_procedures_simplified'
        ORDER BY ordinal_position;
      `
    });

    if (error) {
      console.error("Error fetching columns:", error.message);
      
      // If the first approach failed, try an alternative method
      console.log("Trying alternative approach...");
      await checkColumnsAlternative();
      return;
    }

    if (data && data.length > 0) {
      console.log("Columns found in dental_procedures_simplified:");
      console.table(data);
    } else {
      console.log("No columns found or table doesn't exist");
      await checkColumnsAlternative();
    }
  } catch (err) {
    console.error("Unexpected error:", err.message);
  }
}

async function checkColumnsAlternative() {
  try {
    // Try creating a temporary record and see what columns are accepted
    const testData = {
      procedure_name: "TEST_PROCEDURE_DELETE_ME",
      yearly_growth_percentage: 5.0,
      market_size_2025_usd_millions: 2.5,
      // Try different variations for the remaining fields
      primary_age_group: "All ages",
      primaryAgeGroup: "All ages",
      age_range: "All ages",
      trends: "Test trend",
      recent_trends: "Test trend",
      future_outlook: "Test outlook",
      category: "Test"
    };

    const { data, error } = await supabase
      .from('dental_procedures_simplified')
      .insert([testData])
      .select();

    if (error) {
      console.error("Error from insert test:", error.message);
      
      if (error.message.includes("column")) {
        // Parse the column name from the error message
        const columnMatch = error.message.match(/column ["']?([a-zA-Z_0-9]+)["']?/);
        if (columnMatch && columnMatch[1]) {
          console.log(`Problem with column: ${columnMatch[1]}`);
        }
      }
    } else {
      console.log("Test insert worked! Inserted data:", data);
      console.log("Column names accepted:");
      if (data && data.length > 0) {
        const acceptedColumns = Object.keys(data[0]);
        console.table(acceptedColumns.map(col => ({ column: col })));
        
        // Clean up the test data
        await supabase
          .from('dental_procedures_simplified')
          .delete()
          .eq('procedure_name', 'TEST_PROCEDURE_DELETE_ME');
      }
    }
  } catch (err) {
    console.error("Error in alternative check:", err.message);
  }
}

main().catch(console.error);
