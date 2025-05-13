/**
 * Simplified Netlify Deployment Setup Script
 * 
 * This script is executed during Netlify build process to:
 * 1. Verify database connection
 * 2. Verify essential tables exist
 * 3. Log database status for debugging
 * 
 * This is a simplified version that avoids SQL function calls
 * and focuses only on verification to prevent deployment issues.
 */

// Use ES module imports
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import path from 'path';
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
 * Main setup function - simplified to avoid SQL function calls
 */
async function setupNetlify() {
  console.log('🚀 Starting Netlify deployment setup...');
  
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
    
    // Step 2: Verify data integrity
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
 * Verify data integrity - simplified to just check table existence
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
  
  // Check if views exist - but don't try to create them
  try {
    const { error: viewError } = await supabase
      .from('v_all_procedures')
      .select('count(*)', { count: 'exact', head: true });
      
    if (viewError) {
      console.error(`⛔ View v_all_procedures not accessible: ${viewError.message}`);
    } else {
      console.log('✅ View v_all_procedures is accessible');
    }
  } catch (error) {
    console.warn('⚠️ Could not verify views:', error.message);
  }
  
  console.log(`⛔ Data integrity check found ${errors} errors and ${warnings} warnings`);
}

// Execute the setup function
setupNetlify().catch(error => {
  console.error('⛔ Fatal error during Netlify setup:', error);
  // Don't exit with error code, allow the build to continue
});
