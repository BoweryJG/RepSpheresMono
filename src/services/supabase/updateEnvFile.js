// Script to update or create .env file with Supabase credentials
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';
import colors from 'colors';

// Enable colors
colors.enable();

// Get the directory of the current module and project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = path.resolve(__dirname, '../../..');

// Path to the .env file
const envFilePath = path.join(rootDir, '.env');
const envExamplePath = path.join(rootDir, '.env.example');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to read the existing .env file if it exists
function readEnvFile() {
  try {
    if (fs.existsSync(envFilePath)) {
      const envContent = fs.readFileSync(envFilePath, 'utf8');
      const envVars = {};
      
      envContent.split('\n').forEach(line => {
        // Skip comments and empty lines
        if (line.trim() && !line.startsWith('#')) {
          const [key, ...valueParts] = line.split('=');
          const value = valueParts.join('='); // Rejoin in case value contains '=' characters
          if (key && value) {
            envVars[key.trim()] = value.trim();
          }
        }
      });
      
      return envVars;
    }
  } catch (err) {
    console.error('Error reading .env file:', err);
  }
  
  return {};
}

// Function to read the .env.example file
function readEnvExampleFile() {
  try {
    if (fs.existsSync(envExamplePath)) {
      return fs.readFileSync(envExamplePath, 'utf8');
    }
  } catch (err) {
    console.error('Error reading .env.example file:', err);
  }
  
  return '';
}

// Function to write the updated .env file
function writeEnvFile(envVars) {
  try {
    let envExample = readEnvExampleFile();
    let envContent = '';
    
    if (envExample) {
      // Use the structure of .env.example but replace values
      envExample.split('\n').forEach(line => {
        if (line.trim() && !line.startsWith('#')) {
          const [key] = line.split('=');
          if (key && key.trim() && envVars[key.trim()]) {
            envContent += `${key.trim()}=${envVars[key.trim()]}\n`;
          } else {
            envContent += `${line}\n`;
          }
        } else {
          envContent += `${line}\n`;
        }
      });
      
      // Add any additional variables not in .env.example
      Object.entries(envVars).forEach(([key, value]) => {
        if (!envExample.includes(key)) {
          envContent += `${key}=${value}\n`;
        }
      });
    } else {
      // Simply convert the envVars object to string
      Object.entries(envVars).forEach(([key, value]) => {
        envContent += `${key}=${value}\n`;
      });
    }
    
    fs.writeFileSync(envFilePath, envContent);
    console.log(`✅ .env file has been updated at ${envFilePath}`.green);
    return true;
  } catch (err) {
    console.error('Error writing .env file:', err);
    return false;
  }
}

// Function to prompt the user for Supabase credentials
function promptForCredentials(currentVars) {
  return new Promise((resolve) => {
    console.log('\n=================================================='.cyan);
    console.log('🔑 SUPABASE CREDENTIALS SETUP'.brightWhite.bold);
    console.log('==================================================\n'.cyan);
    
    console.log('Enter your Supabase credentials below.'.yellow);
    console.log('These can be found in your Supabase dashboard under Project Settings > API.'.yellow);
    console.log('Leave blank to keep current value (if any).\n'.gray);
    
    const currentUrl = currentVars.VITE_SUPABASE_URL || '';
    const currentKey = currentVars.VITE_SUPABASE_ANON_KEY || '';
    
    if (currentUrl) {
      console.log(`Current VITE_SUPABASE_URL: ${currentUrl}`.gray);
    }
    
    rl.question('VITE_SUPABASE_URL: '.cyan, (url) => {
      const supabaseUrl = url.trim() || currentUrl;
      
      if (currentKey) {
        const maskedKey = currentKey.substring(0, 5) + '...' + 
          currentKey.substring(currentKey.length - 5);
        console.log(`Current VITE_SUPABASE_ANON_KEY: ${maskedKey}`.gray);
      }
      
      rl.question('VITE_SUPABASE_ANON_KEY: '.cyan, (key) => {
        const supabaseAnonKey = key.trim() || currentKey;
        
        resolve({
          VITE_SUPABASE_URL: supabaseUrl,
          VITE_SUPABASE_ANON_KEY: supabaseAnonKey
        });
        
        rl.close();
      });
    });
  });
}

// Main function
async function main() {
  try {
    // Read existing .env file
    const currentEnvVars = readEnvFile();
    
    // Check if Supabase credentials are already set
    const hasSupabaseUrl = currentEnvVars.VITE_SUPABASE_URL && currentEnvVars.VITE_SUPABASE_URL.trim() !== '';
    const hasSupabaseKey = currentEnvVars.VITE_SUPABASE_ANON_KEY && currentEnvVars.VITE_SUPABASE_ANON_KEY.trim() !== '';
    
    if (hasSupabaseUrl && hasSupabaseKey) {
      console.log('\n✅ Supabase credentials are already set in your .env file.'.green);
      rl.question('Do you want to update them? (y/N): '.cyan, (answer) => {
        if (answer.trim().toLowerCase() === 'y') {
          updateCredentials(currentEnvVars);
        } else {
          console.log('✓ Keeping existing credentials.'.green);
          rl.close();
        }
      });
    } else {
      console.log('\n⚠️ Supabase credentials are not fully set in your .env file.'.yellow);
      updateCredentials(currentEnvVars);
    }
  } catch (err) {
    console.error('An error occurred:', err);
    rl.close();
  }
}

// Function to update credentials
async function updateCredentials(currentEnvVars) {
  try {
    // Prompt for credentials
    const supabaseCredentials = await promptForCredentials(currentEnvVars);
    
    // Merge with existing env vars
    const updatedEnvVars = { ...currentEnvVars, ...supabaseCredentials };
    
    // Write back to .env file
    const success = writeEnvFile(updatedEnvVars);
    
    if (success) {
      console.log('\n🎉 Supabase credentials have been updated successfully!'.green);
      console.log('\nNext steps:'.cyan);
      console.log('1. Check your Supabase connection:'.cyan);
      console.log('   node src/services/supabase/checkProjectAvailability.js'.gray);
      console.log('2. Set up RLS policies:'.cyan);
      console.log('   node src/services/supabase/runSetupRls.js'.gray);
    } else {
      console.error('\n❌ Failed to update Supabase credentials.'.red);
      console.log('Please check file permissions or update the .env file manually.'.yellow);
    }
  } catch (err) {
    console.error('An error occurred:', err);
  }
}

// Helper function to get directory name
function dirname(path) {
  return path.split('/').slice(0, -1).join('/');
}

// Start the script
main();
