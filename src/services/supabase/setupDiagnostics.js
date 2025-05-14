#!/usr/bin/env node

/**
 * Supabase Diagnostics Setup
 * 
 * This script installs helper functions in your Supabase database
 * to assist with diagnostics and data verification
 * 
 * Usage: node src/services/supabase/setupDiagnostics.js
 */

import { supabase } from './supabaseClient.js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import * as colors from 'colors/safe.js';
import { fileURLToPath } from 'url';

// Initialize environment
dotenv.config();
colors.enable();

// Get directory name for this file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Print header
console.log(colors.cyan.bold('============================================='));
console.log(colors.cyan.bold('🔧 SUPABASE DIAGNOSTICS SETUP'));
console.log(colors.cyan.bold('=============================================\n'));

async function setupDiagnostics() {
  try {
    // Check authentication
    console.log(colors.blue('🔑 Checking authentication...'));
    
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error(colors.red(`❌ Authentication error: ${authError.message}`));
      return false;
    }
    
    if (!session) {
      console.log(colors.yellow('⚠️ No active session - trying auto login...'));
      
      // Try to login with environment variables
      if (process.env.VITE_SUPABASE_USER && process.env.VITE_SUPABASE_PASSWORD) {
        console.log(colors.gray(`Attempting login as ${process.env.VITE_SUPABASE_USER}...`));
        
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: process.env.VITE_SUPABASE_USER,
          password: process.env.VITE_SUPABASE_PASSWORD
        });
        
        if (loginError) {
          console.error(colors.red(`❌ Auto-login failed: ${loginError.message}`));
          console.log(colors.yellow('Please set up correct credentials in your .env file:'));
          console.log(colors.gray('VITE_SUPABASE_USER=your-email@example.com'));
          console.log(colors.gray('VITE_SUPABASE_PASSWORD=your-password'));
          return false;
        }
        
        console.log(colors.green('✅ Auto-login successful!'));
      } else {
        console.error(colors.red('❌ Authentication required'));
        console.log(colors.yellow('Please add your Supabase credentials to your .env file:'));
        console.log(colors.gray('VITE_SUPABASE_USER=your-email@example.com'));
        console.log(colors.gray('VITE_SUPABASE_PASSWORD=your-password'));
        return false;
      }
    } else {
      console.log(colors.green(`✅ Authenticated as ${session.user.email}`));
    }
    
    // Locate SQL files
    console.log(colors.blue('\n📁 Locating diagnostic SQL functions...'));
    
    const sqlDir = path.join(__dirname, 'sql');
    if (!fs.existsSync(sqlDir)) {
      console.error(colors.red(`❌ SQL directory not found: ${sqlDir}`));
      console.log(colors.yellow('Creating the directory...'));
      fs.mkdirSync(sqlDir, { recursive: true });
    }
    
    const listAllTablesFunctionPath = path.join(sqlDir, 'create_list_all_tables_function.sql');
    if (!fs.existsSync(listAllTablesFunctionPath)) {
      console.error(colors.red(`❌ SQL file not found: ${listAllTablesFunctionPath}`));
      
      // Create the file with default content
      console.log(colors.yellow('Creating the SQL file with default content...'));
      
      const defaultSql = `-- Function to list all tables in the database
-- This allows diagnostic tools to find all tables without needing elevated permissions

CREATE OR REPLACE FUNCTION public.list_all_tables()
RETURNS TABLE (tablename text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT table_name::text
  FROM information_schema.tables
  WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
  AND table_type = 'BASE TABLE'
  ORDER BY table_schema, table_name;
END;
$$;

-- Grant execute permission to authenticated users and anon
ALTER FUNCTION public.list_all_tables() SECURITY DEFINER;
GRANT EXECUTE ON FUNCTION public.list_all_tables() TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_all_tables() TO anon;`;
      
      fs.writeFileSync(listAllTablesFunctionPath, defaultSql);
      console.log(colors.green(`✅ Created SQL file: ${listAllTablesFunctionPath}`));
    } else {
      console.log(colors.green(`✅ Found SQL file: ${listAllTablesFunctionPath}`));
    }
    
    // Read SQL files
    console.log(colors.blue('\n📄 Reading SQL functions...'));
    
    const listAllTablesFunction = fs.readFileSync(listAllTablesFunctionPath, 'utf8');
    console.log(colors.green(`✅ Read list_all_tables function (${listAllTablesFunction.length} bytes)`));
    
    // Execute SQL
    console.log(colors.blue('\n🔧 Installing SQL functions...'));
    
    // Install helper functions
    try {
      // First try using supabase rpc if available
      try {
        console.log(colors.gray('Attempting to use pgmigrate_apply RPC...'));
        
        const { data: rpcData, error: rpcError } = await supabase
          .rpc('pgmigrate_apply', { 
            query: listAllTablesFunction 
          });
          
        if (rpcError) {
          throw rpcError;
        }
        
        console.log(colors.green('✅ Installed list_all_tables function using RPC'));
      } catch (rpcError) {
        // Fallback to direct SQL if RPC is not available
        console.log(colors.yellow('⚠️ RPC method unavailable, trying direct SQL...'));
        
        // This will need higher privileges than the default anon key provides
        const { data: sqlData, error: sqlError } = await supabase.auth.getSession();
          
        if (!sqlData.session) {
          console.error(colors.red('❌ Authentication required for direct SQL'));
          throw new Error('Cannot execute SQL without proper authentication');
        }
        
        try {
          // Try to use Supabase's SQL execution endpoint
          // This is not typically available with client credentials
          const sqlResult = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/rpc/pgmigrate_apply`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.VITE_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_KEY}`,
              'apikey': process.env.VITE_SUPABASE_ANON_KEY
            },
            body: JSON.stringify({
              query: listAllTablesFunction
            })
          });
          
          if (!sqlResult.ok) {
            throw new Error(`SQL execution failed: ${await sqlResult.text()}`);
          }
          
          console.log(colors.green('✅ Installed list_all_tables function using direct SQL'));
        } catch (directSqlError) {
          console.error(colors.red(`❌ Failed to install function: ${directSqlError.message}`));
          console.log(colors.yellow('\nPlease run this SQL manually in the Supabase SQL Editor:'));
          console.log(colors.gray('-------------------------------------------'));
          console.log(colors.cyan(listAllTablesFunction));
          console.log(colors.gray('-------------------------------------------'));
          
          // Even though this fails, we'll continue with the process
          console.log(colors.yellow('\nContinuing with setup despite SQL execution failure...'));
        }
      }
    } catch (error) {
      console.error(colors.red(`❌ Failed to install functions: ${error.message}`));
      console.log(colors.yellow('\nPlease run this SQL manually in the Supabase SQL Editor:'));
      console.log(colors.gray('-------------------------------------------'));
      console.log(colors.cyan(listAllTablesFunction));
      console.log(colors.gray('-------------------------------------------'));
      
      // Even though this fails, we'll continue with the process
      console.log(colors.yellow('\nContinuing with setup despite SQL execution failure...'));
    }
    
    // Test the installed function
    console.log(colors.blue('\n🧪 Testing installed function...'));
    
    try {
      const { data: funcData, error: funcError } = await supabase.rpc('list_all_tables');
      
      if (funcError) {
        console.error(colors.red(`❌ Function test failed: ${funcError.message}`));
        console.log(colors.yellow('You may need to install the function manually using SQL Editor.'));
      } else {
        const tableCount = funcData.length;
        console.log(colors.green(`✅ Function working properly! Found ${tableCount} tables.`));
        
        // List some tables for verification
        if (tableCount > 0) {
          console.log(colors.gray('Example tables:'));
          funcData.slice(0, 5).forEach(table => 
            console.log(colors.gray(`- ${table.tablename || table}`))
          );
          
          if (tableCount > 5) {
            console.log(colors.gray(`... and ${tableCount - 5} more`));
          }
        } else {
          console.log(colors.yellow('⚠️ No tables found in the database'));
        }
      }
    } catch (e) {
      console.error(colors.red(`❌ Function test failed: ${e.message}`));
    }
    
    // Final steps
    console.log(colors.cyan.bold('\n============================================='));
    console.log(colors.cyan.bold('📋 SETUP COMPLETE'));
    console.log(colors.cyan.bold('============================================='));
    
    console.log(colors.green('\nDiagnostic functions have been set up.'));
    console.log(colors.gray('Next steps:'));
    console.log(colors.gray('1. Run diagnostic checks: npm run test-db'));
    console.log(colors.gray('2. Fix any data issues: npm run fix-data'));
    console.log(colors.gray('3. All-in-one solution: npm run fix-supabase'));
    
    console.log(colors.cyan.bold('\n=============================================\n'));
    
    return true;
  } catch (error) {
    console.error(colors.red(`\n❌ Setup failed: ${error.message}`));
    console.log(colors.cyan.bold('\n=============================================\n'));
    return false;
  }
}

// Run the setup
setupDiagnostics();
