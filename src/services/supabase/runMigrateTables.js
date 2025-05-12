#!/usr/bin/env node

/**
 * Run Migration Scripts
 * 
 * This script runs SQL migration scripts to ensure the correct table structures
 * exist in the Supabase database, particularly the dental_procedures_simplified table.
 * 
 * Usage:
 * node src/services/supabase/runMigrateTables.js
 */

import { supabase } from './supabaseClient.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import colors from 'colors/safe.js';

// Initialize environment and colors
dotenv.config();
colors.enable();

// Get the directory path of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Log header
console.log(colors.cyan.bold('============================================='));
console.log(colors.cyan.bold('🔄 SUPABASE TABLE MIGRATION'));
console.log(colors.cyan.bold('=============================================\n'));

/**
 * Run a SQL migration file
 * @param {string} filename - SQL file name
 */
async function runMigration(filename) {
  try {
    console.log(colors.blue(`Running migration: ${filename}...`));
    
    // Read SQL file
    const sqlFilePath = path.join(__dirname, 'sql', filename);
    const sqlContent = await fs.readFile(sqlFilePath, 'utf8');
    
    // Run the SQL using Supabase's RPC function if available
    try {
      const { data, error } = await supabase.rpc('pgmigrate_apply', { query: sqlContent });
      
      if (error) {
        throw error;
      }
      
      console.log(colors.green(`✅ Migration ${filename} applied successfully`));
    } catch (rpcError) {
      console.warn(colors.yellow(`Could not use RPC for migration: ${rpcError.message}`));
      console.log(colors.blue(`Attempting to run SQL directly...`));
      
      // If RPC fails, try direct SQL execution
      const { error } = await supabase.sql(sqlContent);
      
      if (error) {
        throw error;
      }
      
      console.log(colors.green(`✅ Migration ${filename} applied successfully using direct SQL`));
    }
    
    return true;
  } catch (error) {
    console.error(colors.red(`❌ Error applying migration ${filename}: ${error.message}`));
    return false;
  }
}

/**
 * Verify table exists by querying it
 * @param {string} tableName - Table name to verify
 */
async function verifyTableExists(tableName) {
  try {
    console.log(colors.blue(`Verifying table ${tableName} exists...`));
    
    const { count, error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });
      
    if (error && error.message.includes('does not exist')) {
      console.error(colors.red(`❌ Table ${tableName} does not exist`));
      return false;
    } else if (error) {
      console.warn(colors.yellow(`⚠️ Error checking ${tableName}: ${error.message}`));
      return false;
    }
    
    console.log(colors.green(`✅ Table ${tableName} exists with ${count} rows`));
    return true;
  } catch (error) {
    console.error(colors.red(`❌ Error verifying table ${tableName}: ${error.message}`));
    return false;
  }
}

/**
 * Main function to run all migrations
 */
async function runAllMigrations() {
  // First check authentication
  try {
    console.log(colors.blue('Checking Supabase authentication...'));
    
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      throw new Error(`Authentication error: ${error.message}`);
    }
    
    if (!session) {
      console.log(colors.yellow('⚠️ No active session'));
      
      // Try to login with environment variables if available
      if (process.env.VITE_SUPABASE_USER && process.env.VITE_SUPABASE_PASSWORD) {
        console.log(colors.gray(`Attempting login as ${process.env.VITE_SUPABASE_USER}...`));
        
        const { data, error: loginError } = await supabase.auth.signInWithPassword({
          email: process.env.VITE_SUPABASE_USER,
          password: process.env.VITE_SUPABASE_PASSWORD
        });
        
        if (loginError) {
          throw new Error(`Login failed: ${loginError.message}`);
        }
        
        console.log(colors.green('✅ Login successful'));
      } else {
        throw new Error('No auth session or credentials');
      }
    } else {
      console.log(colors.green(`✅ Authenticated as ${session.user.email}`));
    }
    
    // List of migrations to run in order
    const migrations = [
      'create_dental_procedures_simplified.sql'
    ];
    
    // Run each migration
    let failedMigrations = 0;
    for (const migration of migrations) {
      const success = await runMigration(migration);
      if (!success) failedMigrations++;
    }
    
    // Verify tables exist
    const tablesToVerify = ['dental_procedures_simplified'];
    for (const table of tablesToVerify) {
      await verifyTableExists(table);
    }
    
    // Final status
    console.log(colors.cyan.bold('\n============================================='));
    if (failedMigrations === 0) {
      console.log(colors.green('✅ All migrations completed successfully'));
    } else {
      console.log(colors.yellow(`⚠️ ${failedMigrations} migrations failed`));
    }
    console.log(colors.cyan.bold('============================================='));
    
    return failedMigrations === 0;
  } catch (error) {
    console.error(colors.red(`\n❌ Migration process failed: ${error.message}`));
    console.log(colors.cyan.bold('\n============================================='));
    return false;
  }
}

// Run migrations if this file is executed directly
if (process.argv[1].includes('runMigrateTables.js')) {
  runAllMigrations()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error(colors.red(`Fatal error: ${error.message}`));
      process.exit(1);
    });
}

export { runAllMigrations };
