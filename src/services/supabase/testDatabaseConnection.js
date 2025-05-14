#!/usr/bin/env node

/**
 * Supabase Database Connection Tester
 * 
 * This script tests the connection to Supabase and performs
 * basic diagnostics on tables and data availability
 * 
 * Usage: node src/services/supabase/testDatabaseConnection.js
 */

import { supabase } from './supabaseClient.js';
import dotenv from 'dotenv';
import * as colors from 'colors/safe.js';

// Initialize environment
dotenv.config();
colors.enable();

// Print header
console.log(colors.cyan.bold('================================================'));
console.log(colors.cyan.bold('🔍 SUPABASE DATABASE CONNECTION TEST'));
console.log(colors.cyan.bold('================================================\n'));

async function testConnection() {
  console.log(colors.blue('🔌 Testing basic connection...'));
  
  try {
    // Parse Supabase URL from .env
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) {
      throw new Error('VITE_SUPABASE_URL not found in environment variables');
    }
    
    console.log(colors.gray(`Database URL: ${supabaseUrl}`));
    
    // Extract project ID from URL for display
    const projectId = supabaseUrl.split('https://')[1]?.split('.')[0];
    if (projectId) {
      console.log(colors.gray(`Project ID: ${projectId}`));
    }
    
    // Test basic connection
    const startTime = Date.now();
    const { data, error } = await supabase.from('dental_procedures').select('count()', { count: 'exact', head: true });
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    if (error) {
      if (error.message.includes('does not exist')) {
        console.error(colors.yellow('⚠️ Connected but table "dental_procedures" not found'));
        console.log(colors.gray('This could mean your schema has not been set up yet.'));
        console.log(colors.gray('Try running: npm run setup-schema'));
      } else {
        throw error;
      }
    } else {
      console.log(colors.green(`✅ Connection established! (${responseTime}ms)`));
    }
    
    // Check auth
    console.log(colors.blue('\n🔑 Checking authentication...'));
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error(colors.red(`❌ Auth error: ${authError.message}`));
    } else if (!session) {
      console.log(colors.yellow('⚠️ No active session - trying auto login...'));
      
      // Try to login with environment variables if available
      if (process.env.VITE_SUPABASE_USER && process.env.VITE_SUPABASE_PASSWORD) {
        console.log(colors.gray(`Attempting login as ${process.env.VITE_SUPABASE_USER}...`));
        
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: process.env.VITE_SUPABASE_USER,
          password: process.env.VITE_SUPABASE_PASSWORD
        });
        
        if (loginError) {
          console.error(colors.red(`❌ Auto-login failed: ${loginError.message}`));
          console.log(colors.gray('Add correct credentials to .env file:'));
          console.log(colors.gray('VITE_SUPABASE_USER=your-email@example.com'));
          console.log(colors.gray('VITE_SUPABASE_PASSWORD=your-password'));
        } else {
          console.log(colors.green('✅ Auto-login successful!'));
        }
      } else {
        console.log(colors.yellow('⚠️ No login credentials found in .env file'));
        console.log(colors.gray('This might be ok for public data access.'));
      }
    } else {
      console.log(colors.green(`✅ Authenticated as ${session.user.email}`));
    }
    
    // List tables
    console.log(colors.blue('\n📋 Checking database tables...'));
    
    // Try to use the custom function if it exists
    let tables = [];
    let usingCustomFunction = false;
    
    try {
      const { data: functionData, error: functionError } = await supabase.rpc('list_all_tables');
      
      if (!functionError && functionData) {
        tables = functionData;
        usingCustomFunction = true;
        console.log(colors.green('✅ Using list_all_tables helper function'));
      }
    } catch (e) {
      console.log(colors.yellow('⚠️ list_all_tables function not available'));
      console.log(colors.gray('Run setup-diagnostics to create this helper:'));
      console.log(colors.gray('npm run setup-diagnostics'));
    }
    
    // If function doesn't work, try direct query on key tables
    if (tables.length === 0) {
      console.log(colors.blue('Checking essential tables directly...'));
      
      const essentialTables = [
        'dental_procedures',
        'aesthetic_procedures',
        'categories',
        'companies',
        'market_trends',
        'news_articles'
      ];
      
      for (const tableName of essentialTables) {
        try {
          const { count, error } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true });
            
          if (error) {
            if (error.message.includes('does not exist')) {
              console.log(colors.yellow(`⚠️ Table '${tableName}' not found`));
            } else {
              console.error(colors.red(`❌ Error checking '${tableName}': ${error.message}`));
            }
          } else {
            console.log(colors.green(`✅ Table '${tableName}' exists with ${count} rows`));
          }
        } catch (e) {
          console.error(colors.red(`❌ Error checking '${tableName}': ${e.message}`));
        }
      }
    } else {
      // Display tables found with the function
      console.log(colors.green(`Found ${tables.length} tables in the database:`));
      
      // Group tables by prefix for better organization
      const groupedTables = {};
      
      for (const tableObj of tables) {
        const tableName = tableObj.tablename || tableObj;
        const prefix = tableName.split('_')[0];
        
        if (!groupedTables[prefix]) {
          groupedTables[prefix] = [];
        }
        
        groupedTables[prefix].push(tableName);
      }
      
      // Display tables by group
      for (const [prefix, tableNames] of Object.entries(groupedTables)) {
        console.log(colors.cyan(`  ${prefix}_* (${tableNames.length}):`), 
          tableNames.map(t => colors.gray(t.replace(`${prefix}_`, ''))).join(', '));
      }
      
      // Check row counts for key tables
      console.log(colors.blue('\n🔢 Checking data in key tables...'));
      
      const keyTables = [
        'dental_procedures',
        'aesthetic_procedures',
        'categories',
        'companies'
      ];
      
      for (const tableName of keyTables) {
        // Skip if the table doesn't exist
        if (!tables.some(t => (t.tablename || t) === tableName)) {
          console.log(colors.yellow(`⚠️ Table '${tableName}' not found`));
          continue;
        }
        
        // Check row count
        try {
          const { count, error } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true });
            
          if (error) {
            console.error(colors.red(`❌ Error checking '${tableName}': ${error.message}`));
          } else if (count === 0) {
            console.log(colors.yellow(`⚠️ Table '${tableName}' is empty (0 rows)`));
          } else {
            console.log(colors.green(`✅ Table '${tableName}' has ${count} rows`));
          }
        } catch (e) {
          console.error(colors.red(`❌ Error checking '${tableName}': ${e.message}`));
        }
      }
    }
    
    // Final recommendations
    console.log(colors.cyan.bold('\n================================================'));
    console.log(colors.cyan.bold('📋 RESULT'));
    console.log(colors.cyan.bold('================================================'));
    
    // Make recommendations based on what we learned
    const recommendations = [];
    
    if (!supabaseUrl) {
      recommendations.push('- Set VITE_SUPABASE_URL in your .env file');
    }
    
    if (!process.env.VITE_SUPABASE_ANON_KEY) {
      recommendations.push('- Set VITE_SUPABASE_ANON_KEY in your .env file'); 
    }
    
    if (!session && (!process.env.VITE_SUPABASE_USER || !process.env.VITE_SUPABASE_PASSWORD)) {
      recommendations.push('- Add VITE_SUPABASE_USER and VITE_SUPABASE_PASSWORD to your .env file');
    }
    
    if (!usingCustomFunction) {
      recommendations.push('- Run npm run setup-diagnostics to create helper functions');
    }
    
    if (tables.length === 0 || !tables.some(t => (t.tablename || t) === 'dental_procedures')) {
      recommendations.push('- Run npm run setup-schema to create required tables');
      recommendations.push('- Run npm run load-procedures to populate tables with data');
    }
    
    if (recommendations.length > 0) {
      console.log(colors.yellow('\n⚠️ Recommendations to fix issues:'));
      recommendations.forEach(rec => console.log(colors.yellow(rec)));
      console.log('');
      
      console.log(colors.magenta('For comprehensive diagnoses and automatic fixes:'));
      console.log(colors.cyan('npm run fix-supabase'));
    } else {
      console.log(colors.green('\n✅ Database connection is healthy!'));
      console.log(colors.gray('If your UI is still not showing data, try:'));
      console.log(colors.gray('1. Check browser console for JavaScript errors'));
      console.log(colors.gray('2. Verify that RLS policies are set correctly'));
      console.log(colors.gray('3. Run npm run fix-supabase for full diagnostics'));
    }
    
    console.log(colors.cyan.bold('\n================================================\n'));
    
    return true;
  } catch (error) {
    console.error(colors.red(`\n❌ Connection error: ${error.message}`));
    console.log(colors.yellow('\nPossible causes:'));
    
    if (error.message.includes('fetch failed')) {
      console.log(colors.yellow('- Network connectivity issue or Supabase service is down'));
    }
    
    if (error.message.includes('invalid anon key')) {
      console.log(colors.yellow('- Invalid Supabase anon key in .env file'));
    }
    
    if (error.message.includes('not found in environment')) {
      console.log(colors.yellow('- Missing environment variables in .env file'));
    }
    
    console.log(colors.yellow('\nHow to fix:'));
    console.log(colors.yellow('1. Check your .env file contains:'));
    console.log(colors.gray('   VITE_SUPABASE_URL=https://your-project-id.supabase.co'));
    console.log(colors.gray('   VITE_SUPABASE_ANON_KEY=your-anon-key'));
    console.log(colors.yellow('2. Verify your Supabase project is active at:'));
    console.log(colors.gray('   https://app.supabase.com/projects'));
    console.log(colors.yellow('3. For comprehensive diagnostics, run:'));
    console.log(colors.gray('   npm run fix-supabase'));
    
    console.log(colors.cyan.bold('\n================================================\n'));
    
    return false;
  }
}

// Run the test
testConnection();
