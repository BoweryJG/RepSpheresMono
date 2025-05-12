// Runner for the setupBasicTables script
import { exec } from 'child_process';
import colors from 'colors';

colors.enable();

console.log('\n=================================================='.cyan);
console.log('🚀 RUNNING BASIC TABLES SETUP'.brightWhite.bold);
console.log('==================================================\n'.cyan);

// Execute the setupBasicTables.js script
const proc = exec('node src/services/supabase/setupBasicTables.js');

// Forward stdout to console
proc.stdout.on('data', (data) => {
  process.stdout.write(data);
});

// Forward stderr to console
proc.stderr.on('data', (data) => {
  process.stderr.write(data);
});

// Handle process completion
proc.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ Basic tables setup completed successfully!'.green.bold);
  } else {
    console.log(`\n❌ Basic tables setup failed with code ${code}`.red.bold);
  }
});

// Handle any errors
proc.on('error', (err) => {
  console.error(`\n❌ Error executing script: ${err.message}`.red.bold);
});
