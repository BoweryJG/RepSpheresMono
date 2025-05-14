#!/usr/bin/env node

/**
 * Supabase Data Issue Fixer
 * 
 * This script attempts to automatically fix common data issues
 * in the Supabase database for the Market Insights application
 * 
 * Usage: node src/services/supabase/fixDataIssues.js
 */

import { supabase } from './supabaseClient.js';
import dotenv from 'dotenv';
import * as colors from 'colors/safe.js';
import { runFullVerification } from './verifySupabaseData.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Initialize environment
dotenv.config();
colors.enable();

// Get directory name for this file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Print header
console.log(colors.cyan.bold('============================================='));
console.log(colors.cyan.bold('🔧 SUPABASE DATA ISSUE FIXER'));
console.log(colors.cyan.bold('=============================================\n'));

/**
 * Automatically fix common data issues
 */
async function fixDataIssues() {
  try {
    // Step 1: Verify the database and collect issues
    console.log(colors.blue('🔍 Running database verification...'));
    
    const verification = await runFullVerification();
    
    if (!verification) {
      console.error(colors.red('❌ Verification failed to run'));
      process.exit(1);
    }
    
    // Check for critical connection issues
    if (!verification.connection.success) {
      console.error(colors.red(`❌ Cannot continue: Database connection failed - ${verification.connection.error}`));
      process.exit(1);
    }
    
    console.log(colors.blue('\n🔧 Planning data fixes...'));
    
    // Collect all issues that need to be fixed
    const issues = [];
    
    // Auth issues
    if (!verification.auth.success) {
      issues.push({
        type: 'auth',
        description: 'Authentication issues',
        details: verification.auth.error || 'No active session',
        severity: 'warning'
      });
    }
    
    // Table issues
    if (!verification.tables.success) {
      const missingTables = Object.entries(verification.tables.tables || {})
        .filter(([_, info]) => !info.exists)
        .map(([tableName]) => tableName);
      
      if (missingTables.length > 0) {
        issues.push({
          type: 'missing_tables',
          description: 'Missing database tables',
          details: `Missing tables: ${missingTables.join(', ')}`,
          tables: missingTables,
          severity: 'critical'
        });
      }
    }
    
    // Data issues
    if (!verification.data.success) {
      const emptyTables = Object.entries(verification.data.data || {})
        .filter(([_, info]) => !info.valid && info.error === 'No data')
        .map(([tableName]) => tableName);
      
      if (emptyTables.length > 0) {
        issues.push({
          type: 'empty_tables',
          description: 'Tables with missing data',
          details: `Empty tables: ${emptyTables.join(', ')}`,
          tables: emptyTables,
          severity: 'critical'
        });
      }
    }
    
    // RLS issues
    if (!verification.rls.success) {
      issues.push({
        type: 'rls',
        description: 'Row Level Security issues',
        details: verification.rls.error || 'Unknown RLS error',
        severity: 'critical'
      });
    }
    
    // Print summary of issues
    if (issues.length === 0) {
      console.log(colors.green('✅ No issues found! Database appears healthy.'));
      return;
    }
    
    console.log(colors.yellow(`Found ${issues.length} issues to fix:`));
    issues.forEach((issue, i) => {
      const severityColor = issue.severity === 'critical' ? colors.red : colors.yellow;
      console.log(severityColor(`  ${i + 1}. [${issue.severity.toUpperCase()}] ${issue.description}: ${issue.details}`));
    });
    
    // Step 2: Fix the issues
    console.log(colors.blue('\n🔧 Applying fixes...'));
    
    // Sort issues by severity (critical first)
    issues.sort((a, b) => {
      if (a.severity === 'critical' && b.severity !== 'critical') return -1;
      if (a.severity !== 'critical' && b.severity === 'critical') return 1;
      return 0;
    });
    
    // Try to fix each issue
    for (const issue of issues) {
      console.log(colors.blue(`\nFix attempt: ${issue.description}...`));
      
      switch (issue.type) {
        case 'auth':
          await fixAuthIssue(issue);
          break;
        
        case 'missing_tables':
          await fixMissingTables(issue);
          break;
        
        case 'empty_tables':
          await fixEmptyTables(issue);
          break;
        
        case 'rls':
          await fixRLSIssue(issue);
          break;
        
        default:
          console.log(colors.yellow(`⚠️ No automatic fix available for issue type: ${issue.type}`));
      }
    }
    
    // Step 3: Re-verify to confirm fixes
    console.log(colors.blue('\n🔍 Re-checking database after fixes...'));
    
    const recheck = await runFullVerification();
    
    if (!recheck) {
      console.error(colors.red('❌ Verification failed to run after fixes'));
      process.exit(1);
    }
    
    const fixedIssues = [];
    const remainingIssues = [];
    
    // Check auth issues
    if (!verification.auth.success && recheck.auth.success) {
      fixedIssues.push('Authentication issues');
    } else if (!recheck.auth.success) {
      remainingIssues.push('Authentication issues');
    }
    
    // Check table issues
    if (!verification.tables.success && recheck.tables.success) {
      fixedIssues.push('Missing tables');
    } else if (!recheck.tables.success) {
      remainingIssues.push('Missing tables');
    }
    
    // Check data issues
    if (!verification.data.success && recheck.data.success) {
      fixedIssues.push('Data issues');
    } else if (!recheck.data.success) {
      remainingIssues.push('Data issues');
    }
    
    // Check RLS issues
    if (!verification.rls.success && recheck.rls.success) {
      fixedIssues.push('RLS issues');
    } else if (!recheck.rls.success) {
      remainingIssues.push('RLS issues');
    }
    
    // Print summary
    console.log(colors.cyan.bold('\n============================================='));
    console.log(colors.cyan.bold('📋 FIX RESULTS'));
    console.log(colors.cyan.bold('============================================='));
    
    if (fixedIssues.length > 0) {
      console.log(colors.green(`\n✅ Fixed ${fixedIssues.length} issues:`));
      fixedIssues.forEach(issue => console.log(colors.green(`  - ${issue}`)));
    } else {
      console.log(colors.yellow('\n⚠️ No issues were successfully fixed'));
    }
    
    if (remainingIssues.length > 0) {
      console.log(colors.yellow(`\n⚠️ ${remainingIssues.length} issues remain:`));
      remainingIssues.forEach(issue => console.log(colors.yellow(`  - ${issue}`)));
      console.log(colors.yellow('\nSuggested manual fixes:'));
      
      if (remainingIssues.includes('Authentication issues')) {
        console.log(colors.gray('1. Check your .env file for correct credentials'));
        console.log(colors.gray('   VITE_SUPABASE_USER=your-email@example.com'));
        console.log(colors.gray('   VITE_SUPABASE_PASSWORD=your-password'));
      }
      
      if (remainingIssues.includes('Missing tables') || remainingIssues.includes('Data issues')) {
        console.log(colors.gray('1. Try setting up the schema manually: npm run setup-schema'));
        console.log(colors.gray('2. Try loading data manually: npm run load-procedures'));
      }
      
      if (remainingIssues.includes('RLS issues')) {
        console.log(colors.gray('1. Check your Supabase dashboard and ensure RLS is enabled'));
        console.log(colors.gray('2. Check the RLS policies for each table'));
      }
    } else {
      console.log(colors.green('\n✅ All issues have been resolved!'));
    }
    
    console.log(colors.gray('\nNext steps:'));
    console.log(colors.gray('1. Restart your application: npm run dev'));
    console.log(colors.gray('2. Check browser console for any remaining errors'));
    
    console.log(colors.cyan.bold('\n=============================================\n'));
  } catch (error) {
    console.error(colors.red(`\n❌ Error fixing data issues: ${error.message}`));
    console.error(colors.gray(error.stack));
    process.exit(1);
  }
}

/**
 * Fix authentication issues
 */
async function fixAuthIssue(issue) {
  console.log(colors.gray('Attempting to fix authentication...'));
  
  if (!process.env.VITE_SUPABASE_USER || !process.env.VITE_SUPABASE_PASSWORD) {
    console.log(colors.yellow('⚠️ Cannot fix auth: No credentials in .env file'));
    console.log(colors.gray('Add these variables to your .env file:'));
    console.log(colors.gray('VITE_SUPABASE_USER=your-email@example.com'));
    console.log(colors.gray('VITE_SUPABASE_PASSWORD=your-password'));
    return false;
  }
  
  try {
    // Try to sign in with provided credentials
    const { data, error } = await supabase.auth.signInWithPassword({
      email: process.env.VITE_SUPABASE_USER,
      password: process.env.VITE_SUPABASE_PASSWORD
    });
    
    if (error) {
      console.error(colors.red(`❌ Authentication failed: ${error.message}`));
      return false;
    }
    
    console.log(colors.green('✅ Successfully authenticated'));
    return true;
  } catch (error) {
    console.error(colors.red(`❌ Authentication error: ${error.message}`));
    return false;
  }
}

/**
 * Fix missing tables by running the schema setup
 */
async function fixMissingTables(issue) {
  console.log(colors.gray('Attempting to create missing tables...'));
  
  try {
    // Check if schema file exists
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
      console.error(colors.red(`❌ Schema file not found: ${schemaPath}`));
      return false;
    }
    
    console.log(colors.gray(`Found schema file: ${schemaPath}`));
    
    // Read schema SQL
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Apply schema
    try {
      // First try using RPC
      console.log(colors.gray('Applying schema via RPC...'));
      
      const { data, error } = await supabase.rpc('pgmigrate_apply', { query: schemaSql });
      
      if (error) {
        console.error(colors.red(`❌ Failed to apply schema via RPC: ${error.message}`));
        console.log(colors.yellow('⚠️ Please apply the schema manually in the SQL Editor:'));
        console.log(colors.gray('1. Go to https://app.supabase.com'));
        console.log(colors.gray('2. Open your project'));
        console.log(colors.gray('3. Go to the SQL Editor'));
        console.log(colors.gray('4. Run the schema.sql file content'));
        return false;
      }
      
      console.log(colors.green('✅ Successfully applied schema'));
      return true;
    } catch (error) {
      console.error(colors.red(`❌ Error applying schema: ${error.message}`));
      
      // Try executing through CLI as fallback
      console.log(colors.gray('Trying alternative method...'));
      
      try {
        // Try to run the setup-schema command
        console.log(colors.gray('Running setup-schema script...'));
        const { spawn } = await import('child_process');
        
        const setupProcess = spawn('npm', ['run', 'setup-schema'], {
          stdio: 'inherit',
          shell: true
        });
        
        await new Promise((resolve, reject) => {
          setupProcess.on('close', (code) => {
            if (code === 0) {
              console.log(colors.green('✅ Successfully ran setup-schema'));
              resolve();
            } else {
              console.error(colors.red(`❌ setup-schema failed with code ${code}`));
              reject(new Error(`Process exited with code ${code}`));
            }
          });
        });
        
        return true;
      } catch (cliError) {
        console.error(colors.red(`❌ Failed to run setup-schema: ${cliError.message}`));
        return false;
      }
    }
  } catch (error) {
    console.error(colors.red(`❌ Error fixing missing tables: ${error.message}`));
    return false;
  }
}

/**
 * Fix empty tables by loading data
 */
async function fixEmptyTables(issue) {
  console.log(colors.gray('Attempting to load data into empty tables...'));
  
  try {
    // Try to run the data loader command
    console.log(colors.gray('Running data loader scripts...'));
    
    try {
      const { spawn } = await import('child_process');
      
      // Run the appropriate data loader based on which tables are empty
      if (issue.tables.includes('dental_procedures') || issue.tables.includes('aesthetic_procedures')) {
        console.log(colors.gray('Loading procedures data...'));
        
        const loaderProcess = spawn('npm', ['run', 'load-procedures'], {
          stdio: 'inherit',
          shell: true
        });
        
        await new Promise((resolve, reject) => {
          loaderProcess.on('close', (code) => {
            if (code === 0) {
              console.log(colors.green('✅ Successfully loaded procedures data'));
              resolve();
            } else {
              console.error(colors.red(`❌ Data loader failed with code ${code}`));
              reject(new Error(`Process exited with code ${code}`));
            }
          });
        });
      }
      
      if (issue.tables.includes('categories')) {
        console.log(colors.gray('Loading categories data...'));
        
        // For simplicity, we'll use the full process loader which includes categories
        const fullProcess = spawn('npm', ['run', 'supabase-full-process'], {
          stdio: 'inherit',
          shell: true
        });
        
        await new Promise((resolve, reject) => {
          fullProcess.on('close', (code) => {
            if (code === 0) {
              console.log(colors.green('✅ Successfully loaded all data'));
              resolve();
            } else {
              console.error(colors.red(`❌ Full process failed with code ${code}`));
              reject(new Error(`Process exited with code ${code}`));
            }
          });
        });
      }
      
      return true;
    } catch (cliError) {
      console.error(colors.red(`❌ Failed to run data loaders: ${cliError.message}`));
      
      // Critical tables that must have data
      if (issue.tables.includes('dental_procedures') || issue.tables.includes('aesthetic_procedures')) {
        console.log(colors.yellow('⚠️ Attempting direct data insertion...'));
        
        // Load procedure data from JS files
        let dentalData = [];
        let aestheticData = [];
        
        try {
          const dentalPath = path.join(__dirname, '..', '..', 'data', 'dentalProcedures.js');
          if (fs.existsSync(dentalPath)) {
            const { default: data } = await import(dentalPath);
            dentalData = data || [];
            console.log(colors.gray(`Loaded ${dentalData.length} dental procedures from file`));
          }
          
          const aestheticPath = path.join(__dirname, '..', '..', 'data', 'aestheticProcedures.js');
          if (fs.existsSync(aestheticPath)) {
            const { default: data } = await import(aestheticPath);
            aestheticData = data || [];
            console.log(colors.gray(`Loaded ${aestheticData.length} aesthetic procedures from file`));
          }
        } catch (importError) {
          console.error(colors.red(`❌ Failed to import data files: ${importError.message}`));
        }
        
        // Insert dental procedures
        if (dentalData.length > 0 && issue.tables.includes('dental_procedures')) {
          const { data, error } = await supabase
            .from('dental_procedures')
            .insert(dentalData);
          
          if (error) {
            console.error(colors.red(`❌ Failed to insert dental procedures: ${error.message}`));
          } else {
            console.log(colors.green(`✅ Inserted ${dentalData.length} dental procedures`));
          }
        }
        
        // Insert aesthetic procedures
        if (aestheticData.length > 0 && issue.tables.includes('aesthetic_procedures')) {
          const { data, error } = await supabase
            .from('aesthetic_procedures')
            .insert(aestheticData);
          
          if (error) {
            console.error(colors.red(`❌ Failed to insert aesthetic procedures: ${error.message}`));
          } else {
            console.log(colors.green(`✅ Inserted ${aestheticData.length} aesthetic procedures`));
          }
        }
      }
      
      return false;
    }
  } catch (error) {
    console.error(colors.red(`❌ Error fixing empty tables: ${error.message}`));
    return false;
  }
}

/**
 * Fix RLS issues
 */
async function fixRLSIssue(issue) {
  console.log(colors.gray('Attempting to fix RLS policies...'));
  
  try {
    // Check if we have proper authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session) {
      console.error(colors.red('❌ Cannot fix RLS without authentication'));
      return false;
    }
    
    // Apply basic RLS policies for essential tables
    const rlsQueries = [
      // For dental_procedures
      `
      ALTER TABLE IF EXISTS public.dental_procedures ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "Allow public read access" ON public.dental_procedures;
      CREATE POLICY "Allow public read access" ON public.dental_procedures
        FOR SELECT USING (true);
      `,
      
      // For aesthetic_procedures
      `
      ALTER TABLE IF EXISTS public.aesthetic_procedures ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "Allow public read access" ON public.aesthetic_procedures;
      CREATE POLICY "Allow public read access" ON public.aesthetic_procedures
        FOR SELECT USING (true);
      `,
      
      // For categories
      `
      ALTER TABLE IF EXISTS public.categories ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "Allow public read access" ON public.categories;
      CREATE POLICY "Allow public read access" ON public.categories
        FOR SELECT USING (true);
      `,
      
      // For companies
      `
      ALTER TABLE IF EXISTS public.companies ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "Allow public read access" ON public.companies;
      CREATE POLICY "Allow public read access" ON public.companies
        FOR SELECT USING (true);
      `
    ];
    
    let success = true;
    for (const query of rlsQueries) {
      try {
        const { data, error } = await supabase.rpc('pgmigrate_apply', { query });
        
        if (error) {
          console.error(colors.red(`❌ Failed to apply RLS policy: ${error.message}`));
          success = false;
        }
      } catch (error) {
        console.error(colors.red(`❌ Error applying RLS policy: ${error.message}`));
        success = false;
      }
    }
    
    if (success) {
      console.log(colors.green('✅ Applied RLS policies successfully'));
      return true;
    } else {
      console.log(colors.yellow('⚠️ Some RLS policies could not be applied'));
      console.log(colors.yellow('Please check with administrator or apply manually:'));
      console.log(colors.gray('1. Go to https://app.supabase.com'));
      console.log(colors.gray('2. Open your project'));
      console.log(colors.gray('3. Go to the Authentication > Policies section'));
      console.log(colors.gray('4. Enable RLS and add policies for all tables'));
      return false;
    }
  } catch (error) {
    console.error(colors.red(`❌ Error fixing RLS issues: ${error.message}`));
    return false;
  }
}

// Run the fixer
fixDataIssues();
