#!/usr/bin/env node

/**
 * Run Simple Check Script
 * 
 * This script executes the simpleCheck.js file to verify if the dental_procedures_simplified 
 * table is accessible and contains data.
 * 
 * Usage:
 * node src/services/supabase/runSimpleCheck.js
 */

import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import * as colors from 'colors/safe.js';

// Get the directory path of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Log header
console.log(colors.cyan.bold('============================================='));
console.log(colors.cyan.bold('🔍 SUPABASE SIMPLE CHECK'));
console.log(colors.cyan.bold('============================================='));
console.log(colors.gray('Testing connectivity with dental_procedures_simplified table\n'));

// Path to the check script
const checkScriptPath = path.join(__dirname, 'simpleCheck.js');

// Execute the script
const child = exec(`node ${checkScriptPath}`, {
  env: { ...process.env, NODE_OPTIONS: '--experimental-modules' }
});

// Handle output
child.stdout.on('data', (data) => {
  console.log(data.toString());
});

child.stderr.on('data', (data) => {
  console.error(colors.red(data.toString()));
});

// Handle script completion
child.on('close', (code) => {
  console.log(colors.cyan.bold('\n============================================='));
  if (code === 0) {
    console.log(colors.green('✅ Check completed successfully'));
  } else {
    console.log(colors.red(`❌ Check failed with code ${code}`));
    console.log(colors.yellow('Next steps:'));
    console.log(colors.yellow('1. Make sure your .env file has the correct Supabase credentials'));
    console.log(colors.yellow('2. Check that the dental_procedures_simplified table exists in your database'));
    console.log(colors.yellow('3. Run the data migration script if needed: node src/services/supabase/runFixSupabaseData.js'));
  }
  console.log(colors.cyan.bold('============================================='));
});
