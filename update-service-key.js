// Script to update the Supabase service key in .env
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';
import dotenv from 'dotenv';
import colors from 'colors';

// Enable colors
colors.enable();

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envFilePath = path.join(__dirname, '.env');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Load current environment variables
dotenv.config();

console.log('\n=================================================='.cyan);
console.log('🔑 SUPABASE SERVICE KEY UPDATE'.brightWhite.bold);
console.log('==================================================\n'.cyan);

console.log('This script will update your SUPABASE_SERVICE_KEY in the .env file.\n'.yellow);
console.log('You can find your service key in the Supabase dashboard:'.yellow);
console.log('1. Go to https://app.supabase.com/project/_/settings/api'.gray);
console.log('2. Look for "service_role secret" under "Project API keys"'.gray);
console.log('3. Copy that value\n'.gray);

// Check if current service key exists
const currentServiceKey = process.env.SUPABASE_SERVICE_KEY || '';
if (currentServiceKey) {
  const maskedKey = currentServiceKey.substring(0, 8) + '...' + 
    currentServiceKey.substring(currentServiceKey.length - 8);
  console.log(`Current service key: ${maskedKey}`.gray);
}

// Prompt for new service key
rl.question('Enter your new SUPABASE_SERVICE_KEY: '.cyan, (newKey) => {
  if (!newKey || newKey.trim() === '') {
    console.log('❌ No key provided. Operation cancelled.'.red);
    rl.close();
    return;
  }

  try {
    // Read the current .env file
    let envContent = '';
    if (fs.existsSync(envFilePath)) {
      envContent = fs.readFileSync(envFilePath, 'utf8');
    }

    // Check if the key already exists in the file
    const serviceKeyRegex = /^SUPABASE_SERVICE_KEY=.*/m;
    
    if (serviceKeyRegex.test(envContent)) {
      // Replace the existing key
      envContent = envContent.replace(serviceKeyRegex, `SUPABASE_SERVICE_KEY=${newKey.trim()}`);
    } else {
      // Add the new key
      envContent += `\n# Added by update-service-key.js script\nSUPABASE_SERVICE_KEY=${newKey.trim()}\n`;
    }

    // Write the updated content back to the file
    fs.writeFileSync(envFilePath, envContent);
    
    console.log('\n✅ SUPABASE_SERVICE_KEY has been updated successfully!'.green);
    console.log('\nNext steps:'.cyan);
    console.log('1. Run the connection repair tool again:'.cyan);
    console.log('   node fix-supabase-connection.js'.gray);
    console.log('2. If that works, proceed with setting up RLS policies:'.cyan);
    console.log('   node src/services/supabase/runSetupRls.js'.gray);
    
    rl.close();
  } catch (err) {
    console.error(`❌ Error updating .env file: ${err.message}`.red);
    rl.close();
  }
});
