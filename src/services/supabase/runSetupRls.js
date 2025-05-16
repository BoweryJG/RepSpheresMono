// Runner script for setting up RLS policies on Supabase tables
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import colors from '../../utils/consoleColors';

// Enable colors
colors.enable();

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the setup script
const setupScriptPath = resolve(__dirname, 'setupRlsPolicies.js');

console.log('\n=================================================='.cyan);
console.log('🚀 RUNNING SUPABASE RLS POLICY SETUP'.brightWhite.bold);
console.log('==================================================\n'.cyan);

console.log(`Executing script: ${setupScriptPath}`.yellow);

// Execute the setup script
const child = exec(`node ${setupScriptPath}`, {
  // Maximum buffer size increased to handle large outputs
  maxBuffer: 1024 * 1024 * 10,
});

// Forward output from the setup script
child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stderr);

// Handle process completion
child.on('exit', (code) => {
  if (code === 0) {
    console.log('\n✅ RLS Policy setup completed successfully'.green);
    
    console.log('\n=================================================='.cyan);
    console.log('📋 NEXT STEPS:'.brightWhite.bold);
    console.log('==================================================\n'.cyan);
    
    console.log('1. Start your application to verify data access:'.cyan);
    console.log('   npm run dev'.gray);
    
    console.log('\n2. If problems persist, check your database connection:'.cyan);
    console.log('   node src/services/supabase/nodeDatabaseTest.js'.gray);
    
    console.log('\n3. For data population issues, you can run:'.cyan);
    console.log('   node src/services/supabase/runFullDataProcess.js'.gray);
    
    console.log('\n==================================================\n'.cyan);
  } else {
    console.error('\n❌ RLS Policy setup failed'.red);
    console.error(`Exit code: ${code}`.red);
    
    console.log('\n=================================================='.cyan);
    console.log('🔧 TROUBLESHOOTING:'.brightWhite.bold);
    console.log('==================================================\n'.cyan);
    
    console.log('1. Check Supabase connection:'.cyan);
    console.log('   node src/services/supabase/checkProjectAvailability.js'.gray);
    
    console.log('\n2. Verify your .env file has the correct credentials:'.cyan);
    console.log('   VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set correctly'.gray);
    
    console.log('\n3. Check Supabase dashboard to ensure your project is running'.cyan);
    console.log('   https://app.supabase.com'.gray);
    
    console.log('\n4. For manual setup, see:'.cyan);
    console.log('   SUPABASE_FIXES.md'.gray);
    
    console.log('\n==================================================\n'.cyan);
  }
});
