import { exec } from 'child_process';
import { promisify } from 'util';

const execP = promisify(exec);

/**
 * Run a npm script and return the output
 * @param {string} scriptName - Script name (without the 'npm run' part)
 * @returns {Promise<{stdout: string, stderr: string}>}
 */
const runNpmScript = async (scriptName) => {
  console.log(`\n\n=== RUNNING: npm run ${scriptName} ===\n`);
  
  try {
    const { stdout, stderr } = await execP(`npm run ${scriptName}`);
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    return { stdout, stderr, success: true };
  } catch (error) {
    console.error(`Error running ${scriptName}:`, error.message);
    if (error.stdout) console.log(error.stdout);
    if (error.stderr) console.error(error.stderr);
    return { stdout: error.stdout, stderr: error.stderr, success: false, error };
  }
};

/**
 * Run the full data processing pipeline
 */
const runFullProcess = async () => {
  console.log("\n=== STARTING FULL SUPABASE DATA PROCESS ===\n");
  console.log("This script will:");
  console.log("1. Debug Supabase connection");
  console.log("2. Set up the database schema");
  console.log("3. Load all data to Supabase");
  console.log("4. Verify the data was loaded correctly");
  console.log("\n===========================================\n");
  
  try {
    // Step 1: Debug Supabase connection
    console.log("🔍 Step 1: Debugging Supabase connection...");
    const debugResult = await runNpmScript('debug-supabase');
    
    if (!debugResult.success) {
      console.error("❌ Supabase connection debugging failed. Stopping process.");
      process.exit(1);
    }
    
    console.log("✅ Supabase connection debugging completed.\n");
    
    // Step 2: Set up the database schema
    console.log("🏗️ Step 2: Setting up database schema...");
    const schemaResult = await runNpmScript('setup-schema');
    
    if (!schemaResult.success) {
      console.error("❌ Schema setup failed. Stopping process.");
      process.exit(1);
    }
    
    console.log("✅ Schema setup completed.\n");
    
    // Step 3: Load all data to Supabase
    console.log("📊 Step 3: Loading all data to Supabase...");
    const loadResult = await runNpmScript('load-direct');
    
    if (!loadResult.success) {
      console.error("⚠️ Data loading may have encountered issues.");
      console.log("Will proceed to verification step to check what was loaded...");
    } else {
      console.log("✅ Data loading completed.\n");
    }
    
    // Step 4: Verify the data was loaded correctly
    console.log("🔎 Step 4: Verifying data...");
    const verifyResult = await runNpmScript('verify-data');
    
    if (!verifyResult.success) {
      console.error("❌ Data verification failed.");
      process.exit(1);
    }
    
    console.log("✅ Data verification completed.\n");
    
    // Final summary
    console.log("\n=== PROCESS SUMMARY ===\n");
    console.log("✅ Debug Supabase: Success");
    console.log(`✅ Setup Schema: ${schemaResult.success ? 'Success' : 'Issues encountered'}`);
    console.log(`${loadResult.success ? '✅' : '⚠️'} Load Data: ${loadResult.success ? 'Success' : 'Issues encountered'}`);
    console.log(`✅ Verify Data: Success`);
    
    console.log("\n=== FULL PROCESS COMPLETED SUCCESSFULLY ===\n");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ PROCESS FAILED:", error);
    process.exit(1);
  }
};

// Run the full process
runFullProcess();
