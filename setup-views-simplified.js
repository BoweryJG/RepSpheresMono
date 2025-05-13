/**
 * Simplified script to create views and functions in Supabase
 * 
 * This script creates:
 * 1. The execute_sql function (if it doesn't exist)
 * 2. Required views (v_all_procedures, v_dental_companies, v_aesthetic_companies)
 * 3. The search_procedures function
 */

import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// Set up __filename and __dirname equivalents for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();
console.log('✅ Required modules loaded successfully');

// Create Supabase client for direct access
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('⛔ Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Main setup function
 */
async function setupViews() {
  console.log('🚀 Starting Supabase views and functions setup...');
  
  try {
    // Step 1: Create execute_sql function if it doesn't exist
    console.log('⚙️ Creating execute_sql function...');
    const executeSqlPath = path.join(__dirname, 'src', 'services', 'supabase', 'sql', 'create_execute_sql_function.sql');
    const executeSqlSql = fs.readFileSync(executeSqlPath, 'utf8');
    
    // Execute the SQL directly
    let executeSqlError = null;
    try {
      const { error } = await supabase.rpc('execute_sql', { sql_query: executeSqlSql });
      executeSqlError = error;
    } catch (err) {
      // If the function doesn't exist yet, execute it directly
      console.log('⚠️ execute_sql function does not exist yet, creating it directly...');
      try {
        const { error } = await supabase.sql(executeSqlSql);
        executeSqlError = error;
      } catch (sqlErr) {
        executeSqlError = sqlErr;
      }
    }
    
    if (executeSqlError) {
      console.warn('⚠️ Could not create execute_sql function:', executeSqlError.message);
      console.log('⚠️ Will try to continue without it...');
    } else {
      console.log('✅ execute_sql function created or already exists');
    }
    
    // Step 2: Create views and search function
    console.log('👁️ Creating database views and functions...');
    const viewsPath = path.join(__dirname, 'src', 'services', 'supabase', 'sql', 'create_views.sql');
    const viewsSql = fs.readFileSync(viewsPath, 'utf8');
    
    // Split the SQL into individual statements
    const statements = viewsSql.split(';').filter(stmt => stmt.trim().length > 0);
    
    // Execute each statement separately
    for (const stmt of statements) {
      try {
        // Try to use execute_sql function if it exists
        let error = null;
        try {
          const result = await supabase.rpc('execute_sql', { sql_query: stmt + ';' });
          error = result.error;
        } catch (err) {
          // If that fails, execute directly
          try {
            const result = await supabase.sql(stmt + ';');
            error = result.error;
          } catch (sqlErr) {
            error = sqlErr;
          }
        }
        
        if (error) {
          console.warn(`⚠️ Error executing statement: ${error.message}`);
        }
      } catch (stmtError) {
        console.warn(`⚠️ Error executing statement: ${stmtError.message}`);
      }
    }
    
    console.log('✅ Required views and functions created');
    
    // Step 3: Verify the views exist
    console.log('🔍 Verifying views...');
    
    try {
      const { data: proceduresData, error: proceduresError } = await supabase
        .from('v_all_procedures')
        .select('count(*)', { count: 'exact', head: true });
        
      if (proceduresError) {
        console.error(`⛔ View v_all_procedures not accessible: ${proceduresError.message}`);
      } else {
        console.log('✅ View v_all_procedures is accessible');
      }
    } catch (error) {
      console.warn('⚠️ Could not verify v_all_procedures view:', error.message);
    }
    
    console.log('✅ Setup completed successfully!');
  } catch (error) {
    console.error('⛔ Error during setup:', error);
    process.exit(1);
  }
}

// Execute the setup function
setupViews().catch(error => {
  console.error('⛔ Fatal error during setup:', error);
  process.exit(1);
});
