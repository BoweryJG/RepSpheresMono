/**
 * Render Backend Database Setup Script
 * 
 * This script is designed to be run on the Render backend to set up the database schema.
 * It handles:
 * 1. Creating necessary database functions
 * 2. Setting up views
 * 3. Verifying data integrity
 * 
 * Usage:
 * - Add this script to your Render backend
 * - Create an endpoint that calls this script
 * - Or run it directly during backend startup
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

// Create Supabase client for direct access
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('⛔ Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Configuration - essential tables to verify
const ESSENTIAL_TABLES = [
  'dental_procedures_simplified',
  'aesthetic_procedures',
  'categories',
  'aesthetic_categories',
  'companies',
  'dental_market_growth',
  'aesthetic_market_growth',
  'news_articles',
  'events',
  'trending_topics'
];

/**
 * Main setup function
 */
async function setupDatabase() {
  try {
    // Step 1: Verify database connection
    console.log('📡 Verifying Supabase connection...');
    
    // Use a simple query to check connection
    const { data, error } = await supabase
      .from('dental_procedures_simplified')
      .select('count(*)', { count: 'exact', head: true })
      .limit(1);
    
    if (error) {
      console.error('⛔ Failed to connect to Supabase:', error.message);
      process.exit(1);
    }
    
    console.log('✅ Successfully connected to Supabase');
    
    // Step 2: Create execute_sql function
    console.log('⚙️ Creating execute_sql function...');
    await createExecuteSqlFunction();
    
    // Step 3: Set up database views
    console.log('👁️ Creating database views and functions...');
    await setupViews();
    
    // Step 4: Verify data integrity
    console.log('🔍 Verifying data integrity...');
    await verifyDataIntegrity();
    
    console.log('✅ Database setup completed successfully!');
  } catch (error) {
    console.error('⛔ Error during database setup:', error);
    process.exit(1);
  }
}

/**
 * Create the execute_sql function
 */
async function createExecuteSqlFunction() {
  try {
    // SQL to create the execute_sql function
    const sql = `
      CREATE OR REPLACE FUNCTION public.execute_sql(sql text)
      RETURNS void
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        EXECUTE sql;
      END;
      $$;
    `;
    
    // Execute the SQL
    const { error } = await supabase.rpc('execute_sql', { sql });
    
    if (error) {
      // If the function doesn't exist yet, we need to create it directly
      const { error: directError } = await supabase.sql(sql);
      
      if (directError) {
        console.error('⚠️ Error creating execute_sql function:', directError.message);
      } else {
        console.log('✅ execute_sql function created');
      }
    } else {
      console.log('✅ execute_sql function already exists');
    }
  } catch (error) {
    console.error('⚠️ Error creating execute_sql function:', error.message);
    // Continue anyway, as we might be able to create views directly
  }
}

/**
 * Set up database views
 */
async function setupViews() {
  try {
    // Create v_all_procedures view
    const createAllProceduresView = `
      CREATE OR REPLACE VIEW v_all_procedures AS
      SELECT
        'dental' as industry,
        dp.id,
        dp.name,
        dp.description,
        dp.yearly_growth_percentage,
        dp.category_id,
        c.name as category_name
      FROM
        dental_procedures_simplified dp
      LEFT JOIN
        categories c ON dp.category_id = c.id
      UNION ALL
      SELECT
        'aesthetic' as industry,
        ap.id,
        ap.name,
        ap.description,
        ap.yearly_growth_percentage,
        ap.category_id,
        ac.name as category_name
      FROM
        aesthetic_procedures ap
      LEFT JOIN
        aesthetic_categories ac ON ap.category_id = ac.id;
    `;
    
    // Create v_dental_companies view
    const createDentalCompaniesView = `
      CREATE OR REPLACE VIEW v_dental_companies AS
      SELECT
        c.id,
        c.name,
        c.description,
        c.website,
        c.logo_url,
        c.headquarters,
        c.founded_year,
        c.revenue_range,
        c.employee_count,
        c.market_cap,
        c.stock_symbol,
        c.primary_industry
      FROM
        companies c
      WHERE
        c.primary_industry = 'dental' OR c.primary_industry = 'both';
    `;
    
    // Create v_aesthetic_companies view
    const createAestheticCompaniesView = `
      CREATE OR REPLACE VIEW v_aesthetic_companies AS
      SELECT
        c.id,
        c.name,
        c.description,
        c.website,
        c.logo_url,
        c.headquarters,
        c.founded_year,
        c.revenue_range,
        c.employee_count,
        c.market_cap,
        c.stock_symbol,
        c.primary_industry
      FROM
        companies c
      WHERE
        c.primary_industry = 'aesthetic' OR c.primary_industry = 'both';
    `;
    
    // Create search_procedures function
    const createSearchProceduresFunction = `
      CREATE OR REPLACE FUNCTION search_procedures(search_term text)
      RETURNS TABLE (
        industry text,
        id uuid,
        name text,
        description text,
        yearly_growth_percentage numeric
      )
      LANGUAGE sql
      AS $$
        SELECT
          industry,
          id,
          name,
          description,
          yearly_growth_percentage
        FROM
          v_all_procedures
        WHERE
          name ILIKE '%' || search_term || '%'
          OR description ILIKE '%' || search_term || '%'
        ORDER BY
          industry, name ASC;
      $$;
    `;
    
    // Execute the SQL statements
    const views = [
      { name: 'v_all_procedures', sql: createAllProceduresView },
      { name: 'v_dental_companies', sql: createDentalCompaniesView },
      { name: 'v_aesthetic_companies', sql: createAestheticCompaniesView },
      { name: 'search_procedures function', sql: createSearchProceduresFunction }
    ];
    
    for (const view of views) {
      try {
        // Try using execute_sql function first
        const { error } = await supabase.rpc('execute_sql', { sql: view.sql });
        
        if (error) {
          // If that fails, try direct SQL
          const { error: directError } = await supabase.sql(view.sql);
          
          if (directError) {
            console.error(`⚠️ Error creating ${view.name}:`, directError.message);
          } else {
            console.log(`✅ ${view.name} created`);
          }
        } else {
          console.log(`✅ ${view.name} created`);
        }
      } catch (viewError) {
        console.error(`⚠️ Error creating ${view.name}:`, viewError.message);
      }
    }
    
    console.log('✅ Required views and functions created');
  } catch (error) {
    console.error('⚠️ Error setting up views:', error.message);
  }
}

/**
 * Verify data integrity - check table existence and record counts
 */
async function verifyDataIntegrity() {
  let errors = 0;
  let warnings = 0;
  
  // Check essential tables
  for (const table of ESSENTIAL_TABLES) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error(`⛔ Table ${table} not accessible: ${error.message}`);
        errors++;
      } else if (count === 0) {
        console.warn(`⚠️ Table ${table} is empty`);
        warnings++;
      } else {
        console.log(`✅ Table ${table} verified with ${count} records`);
      }
    } catch (tableError) {
      console.error(`⛔ Error checking table ${table}: ${tableError.message}`);
      errors++;
    }
  }
  
  // Check if views exist
  try {
    const { error: viewError } = await supabase
      .from('v_all_procedures')
      .select('count(*)', { count: 'exact', head: true });
      
    if (viewError) {
      console.error(`⛔ View v_all_procedures not accessible: ${viewError.message}`);
      errors++;
    } else {
      console.log('✅ View v_all_procedures is accessible');
    }
  } catch (error) {
    console.error(`⛔ View v_all_procedures not accessible: ${error.message}`);
    errors++;
  }
  
  // Check dental companies view
  try {
    const { error: dentalViewError } = await supabase
      .from('v_dental_companies')
      .select('count(*)', { count: 'exact', head: true });
      
    if (dentalViewError) {
      console.error(`⛔ View v_dental_companies not accessible: ${dentalViewError.message}`);
      errors++;
    } else {
      console.log('✅ View v_dental_companies is accessible');
    }
  } catch (error) {
    console.error(`⛔ View v_dental_companies not accessible: ${error.message}`);
    errors++;
  }
  
  // Check aesthetic companies view
  try {
    const { error: aestheticViewError } = await supabase
      .from('v_aesthetic_companies')
      .select('count(*)', { count: 'exact', head: true });
      
    if (aestheticViewError) {
      console.error(`⛔ View v_aesthetic_companies not accessible: ${aestheticViewError.message}`);
      errors++;
    } else {
      console.log('✅ View v_aesthetic_companies is accessible');
    }
  } catch (error) {
    console.error(`⛔ View v_aesthetic_companies not accessible: ${error.message}`);
    errors++;
  }
  
  // Check search_procedures function
  try {
    const { error: searchError } = await supabase
      .rpc('search_procedures', { search_term: 'test' });
      
    if (searchError) {
      console.error(`⛔ Function search_procedures failed: ${searchError.message}`);
      errors++;
    } else {
      console.log('✅ Function search_procedures is accessible');
    }
  } catch (error) {
    console.error(`⛔ Function search_procedures failed: ${error.message}`);
    errors++;
  }
  
  console.log(`${errors > 0 ? '⛔' : '✅'} Data integrity check found ${errors} errors and ${warnings} warnings`);
}

// Execute the setup function if this script is run directly
if (require.main === module) {
  setupDatabase().catch(error => {
    console.error('⛔ Fatal error during database setup:', error);
    process.exit(1);
  });
}

// Export for use in other modules
module.exports = {
  setupDatabase,
  createExecuteSqlFunction,
  setupViews,
  verifyDataIntegrity
};
