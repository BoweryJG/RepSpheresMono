// Script to check if the Supabase project is accessible
import fetch from 'node-fetch';
import colors from '../../utils/consoleColors';
import dotenv from 'dotenv';

// Configure colors
colors.enable();

// Load environment variables
dotenv.config();

console.log('\n=================================================='.cyan);
console.log('🔍 SUPABASE PROJECT ACCESSIBILITY CHECK'.brightWhite.bold);
console.log('==================================================\n'.cyan);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const maskedSupabaseKey = process.env.VITE_SUPABASE_ANON_KEY ? 
  `${process.env.VITE_SUPABASE_ANON_KEY.substring(0, 5)}...${process.env.VITE_SUPABASE_ANON_KEY.substring(process.env.VITE_SUPABASE_ANON_KEY.length - 5)}` : 
  'Not set';

console.log(`Supabase URL: ${supabaseUrl || 'Not set'}`.yellow);
console.log(`Supabase Anon Key: ${maskedSupabaseKey}`.yellow);

// Check if environment variables are set
if (!supabaseUrl) {
  console.error('❌ VITE_SUPABASE_URL is not set in your .env file'.red);
  process.exit(1);
}

if (!process.env.VITE_SUPABASE_ANON_KEY) {
  console.error('❌ VITE_SUPABASE_ANON_KEY is not set in your .env file'.red);
  process.exit(1);
}

// Function to check project accessibility
async function checkProjectAccessibility() {
  console.log('\nChecking Supabase project accessibility...'.cyan);

  try {
    // Try accessing the Supabase health endpoint
    const healthEndpoint = `${supabaseUrl}/rest/v1/`;
    
    console.log(`Testing endpoint: ${healthEndpoint}`.gray);
    
    const response = await fetch(healthEndpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.VITE_SUPABASE_ANON_KEY
      }
    });
    
    if (response.ok) {
      console.log('✅ Supabase project is accessible!'.green);
      console.log(`   Response status: ${response.status} ${response.statusText}`.gray);
      
      // Check Supabase version
      const versionResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/version`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`
        }
      });
      
      if (versionResponse.ok) {
        const versionData = await versionResponse.json();
        console.log(`   Supabase version: ${JSON.stringify(versionData)}`.gray);
      } else {
        console.log(`   Could not retrieve Supabase version: ${versionResponse.status} ${versionResponse.statusText}`.yellow);
      }
      
      // Check PostgreSQL version
      const pgVersionResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/pg_version`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`
        }
      });
      
      if (pgVersionResponse.ok) {
        const pgVersionData = await pgVersionResponse.json();
        console.log(`   PostgreSQL version: ${JSON.stringify(pgVersionData)}`.gray);
      } else {
        console.log(`   Could not retrieve PostgreSQL version: ${pgVersionResponse.status} ${pgVersionResponse.statusText}`.yellow);
      }
      
      return true;
    } else {
      console.error('❌ Could not access Supabase project!'.red);
      console.error(`   Response status: ${response.status} ${response.statusText}`.gray);
      
      // Try to get more details
      try {
        const errorText = await response.text();
        console.error(`   Error details: ${errorText}`.gray);
      } catch (e) {
        console.error('   Could not retrieve error details'.gray);
      }
      
      return false;
    }
  } catch (error) {
    console.error('❌ Network error when accessing Supabase project:'.red);
    console.error(`   ${error.message}`.red);
    
    // Check if it's a DNS error
    if (error.code === 'ENOTFOUND') {
      console.error('\n⚠️  DNS resolution failed - The Supabase domain could not be found.'.yellow);
      console.error('   This suggests either:'.yellow);
      console.error('   1. The Supabase URL is incorrect in your .env file'.yellow);
      console.error('   2. Your internet connection is down'.yellow);
      console.error('   3. DNS resolution is failing on your network'.yellow);
    }
    
    // Check if it's a connection refused error
    if (error.code === 'ECONNREFUSED') {
      console.error('\n⚠️  Connection refused - The Supabase server actively refused the connection.'.yellow);
      console.error('   This suggests either:'.yellow);
      console.error('   1. Your Supabase project is paused or in maintenance mode'.yellow);
      console.error('   2. There is a firewall blocking the connection'.yellow);
      console.error('   3. The Supabase instance is not running'.yellow);
    }
    
    // Check if it's a timeout
    if (error.code === 'ETIMEDOUT') {
      console.error('\n⚠️  Connection timed out - The Supabase server did not respond in time.'.yellow);
      console.error('   This suggests either:'.yellow);
      console.error('   1. The Supabase server is overloaded'.yellow);
      console.error('   2. Network latency is very high'.yellow);
      console.error('   3. The server might be up but very slow to respond'.yellow);
    }
    
    return false;
  }
}

// Function to provide recommendations based on the check result
function provideRecommendations(isAccessible) {
  console.log('\n=================================================='.cyan);
  console.log('🔧 RECOMMENDATIONS'.brightWhite.bold);
  console.log('==================================================\n'.cyan);
  
  if (isAccessible) {
    console.log('✅ Your Supabase project is accessible!'.green);
    console.log('\nNext steps:'.cyan);
    console.log('1. Run the full diagnostic test to check database tables and RLS policies:'.cyan);
    console.log('   node src/services/supabase/nodeDatabaseTest.js'.gray);
    console.log('2. If you still have issues, check Row Level Security (RLS) policies:'.cyan);
    console.log('   node src/services/supabase/runSetupRls.js'.gray);
  } else {
    console.log('❌ Your Supabase project is not accessible.'.red);
    console.log('\nTry these solutions:'.cyan);
    
    console.log('\n1. Verify your environment variables in .env file:'.yellow);
    console.log('   - Check that VITE_SUPABASE_URL is correct'.gray);
    console.log('   - Check that VITE_SUPABASE_ANON_KEY is correct'.gray);
    console.log('   - Make sure there are no extra spaces or quotes'.gray);
    
    console.log('\n2. Check your Supabase project status:'.yellow);
    console.log('   - Go to https://app.supabase.com/'.gray);
    console.log('   - Check if your project is running or in maintenance mode'.gray);
    console.log('   - If paused, resume the project and wait a few minutes'.gray);
    
    console.log('\n3. Test basic connectivity:'.yellow);
    console.log('   - Try accessing the Supabase URL in a browser'.gray);
    console.log('   - Run a basic ping test: ping ' + supabaseUrl.replace('https://', '').replace('http://', '').split('/')[0].gray);
    
    console.log('\n4. Check for network issues:'.yellow);
    console.log('   - Try connecting from a different network (e.g., mobile hotspot)'.gray);
    console.log('   - Verify your firewall or VPN isn\'t blocking the connection'.gray);
    console.log('   - Check if you need to configure proxy settings'.gray);
  }
}

// Main function
async function main() {
  const isAccessible = await checkProjectAccessibility();
  provideRecommendations(isAccessible);
  
  console.log('\nCheck completed at', new Date().toLocaleString());
  console.log('\n==================================================\n'.cyan);
}

// Run the main function
main().catch(err => {
  console.error('Unexpected error during check:'.red, err);
  process.exit(1);
});
