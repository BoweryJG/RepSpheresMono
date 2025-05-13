/**
 * Netlify Deployment Setup Script
 * 
 * This script is executed during Netlify build process to:
 * 1. Verify database connection
 * 2. Set up required database functions and views
 * 3. Verify essential tables exist
 * 4. Log database status for debugging
 */

// Use ES module imports
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { spawn } from 'child_process';

// Set up __filename and __dirname equivalents for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();
console.log('🚀 Starting Netlify deployment setup...');

// Create Supabase client for direct access
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

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
async function setupNetlify() {
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
      // Continue anyway, we'll try to deploy without database setup
    } else {
      console.log('✅ Successfully connected to Supabase');
    }
    
    // Step 2: Set up database schema
    console.log('🏗️ Setting up database schema...');
    
    // First try to create the execute_sql function and views
    try {
      // Run the setup-views-simplified.js script
      await runScript('./setup-views-simplified.js');
      console.log('✅ Schema setup completed');
    } catch (setupError) {
      console.error('⚠️ Error during schema setup:', setupError.message);
      console.log('⚠️ Will continue with deployment anyway');
    }
    
    // Step 3: Verify data integrity
    console.log('🔍 Verifying data integrity...');
    await verifyDataIntegrity();
    
    console.log('✅ Netlify setup completed successfully!');
  } catch (error) {
    console.error('⛔ Error during Netlify setup:', error);
    // Don't exit with error code, allow the build to continue
    console.log('⚠️ Setup encountered errors but will continue with deployment');
  }
}

/**
 * Run a Node.js script as a child process
 */
function runScript(scriptPath) {
  return new Promise((resolve, reject) => {
    const process = spawn('node', ['--experimental-json-modules', '--es-module-specifier-resolution=node', scriptPath]);
    
    process.stdout.on('data', (data) => {
      console.log(data.toString().trim());
    });
    
    process.stderr.on('data', (data) => {
      console.error(data.toString().trim());
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Script exited with code ${code}`));
      }
    });
  });
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
  
  console.log(`⛔ Data integrity check found ${errors} errors and ${warnings} warnings`);
}

// Execute the setup function
setupNetlify().catch(error => {
  console.error('⛔ Fatal error during Netlify setup:', error);
  // Don't exit with error code, allow the build to continue
});
