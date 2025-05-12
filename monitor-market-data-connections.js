// Script to monitor and ensure market data connections between tables
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import colors from 'colors';

colors.enable();

// Load environment variables
dotenv.config();

console.log('\n=================================================='.cyan);
console.log('🔍 MARKET DATA CONNECTIONS MONITORING TOOL'.brightWhite.bold);
console.log('==================================================\n'.cyan);

// Get timestamp for logging
const timestamp = new Date().toLocaleString();
console.log(`Monitoring started at: ${timestamp}`.gray);

// Environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_SERVICE_KEY;

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('\n❌ Error: Missing essential Supabase credentials'.red);
  console.log('Please check your .env file and make sure SUPABASE_URL and SUPABASE_SERVICE_KEY are set');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Tables to check
const TABLES_TO_CHECK = [
  'dental_procedures_simplified',
  'aesthetic_procedures',
  'companies',
  'categories',
  'aesthetic_categories',
  'dental_market_growth',
  'aesthetic_market_growth'
];

// Monitor connections function
async function monitorConnections() {
  console.log('\nChecking data connections between market data tables...'.yellow);
  
  const tablesStatus = {};
  const connectionsStatus = {};
  
  // Check if tables exist and have data
  for (const tableName of TABLES_TO_CHECK) {
    console.log(`\nChecking table: ${tableName}`.cyan);
    
    try {
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
        
      if (error) {
        console.log(`❌ Table ${tableName} error: ${error.message}`.red);
        tablesStatus[tableName] = { exists: false, error: error.message };
      } else {
        console.log(`✅ Table ${tableName} exists with ${count} records`.green);
        tablesStatus[tableName] = { exists: true, recordCount: count };
        
        // If table exists, get a sample of data
        if (count > 0) {
          const { data: sampleData, error: sampleError } = await supabase
            .from(tableName)
            .select('*')
            .limit(5);
            
          if (!sampleError && sampleData) {
            tablesStatus[tableName].sampleData = sampleData;
          }
        }
      }
    } catch (err) {
      console.log(`❌ Error checking table ${tableName}: ${err.message}`.red);
      tablesStatus[tableName] = { exists: false, error: err.message };
    }
  }
  
  // Check connections between tables
  if (tablesStatus['dental_market_growth']?.exists && tablesStatus['categories']?.exists) {
    await checkConnection(
      'dental_market_growth', 
      'categories', 
      'category_id', 
      'id', 
      connectionsStatus
    );
  }
  
  if (tablesStatus['dental_market_growth']?.exists && tablesStatus['dental_procedures_simplified']?.exists) {
    await checkConnection(
      'dental_market_growth', 
      'dental_procedures_simplified', 
      'procedure_id', 
      'id', 
      connectionsStatus
    );
  }
  
  if (tablesStatus['aesthetic_market_growth']?.exists && tablesStatus['aesthetic_categories']?.exists) {
    await checkConnection(
      'aesthetic_market_growth', 
      'aesthetic_categories', 
      'category_id', 
      'id', 
      connectionsStatus
    );
  }
  
  if (tablesStatus['aesthetic_market_growth']?.exists && tablesStatus['aesthetic_procedures']?.exists) {
    await checkConnection(
      'aesthetic_market_growth', 
      'aesthetic_procedures', 
      'procedure_id', 
      'id', 
      connectionsStatus
    );
  }
  
  return { tablesStatus, connectionsStatus };
}

// Function to check connection between tables
async function checkConnection(sourceTable, targetTable, sourceCol, targetCol, statusObj) {
  console.log(`\nChecking connection: ${sourceTable}.${sourceCol} -> ${targetTable}.${targetCol}`.yellow);
  
  const connectionKey = `${sourceTable}.${sourceCol}->${targetTable}.${targetCol}`;
  
  try {
    // First check if we can get data from the source table with a non-null source column
    const { data: sourceData, error: sourceError } = await supabase
      .from(sourceTable)
      .select(`id, ${sourceCol}`)
      .not(sourceCol, 'is', null)
      .limit(1);
      
    if (sourceError) {
      console.log(`❌ Error fetching source data: ${sourceError.message}`.red);
      statusObj[connectionKey] = { valid: false, error: sourceError.message };
      return;
    }
    
    if (!sourceData || sourceData.length === 0) {
      console.log(`⚠️ No records with non-null ${sourceCol} in ${sourceTable}`.yellow);
      statusObj[connectionKey] = { valid: false, reason: `No non-null ${sourceCol} values in ${sourceTable}` };
      return;
    }
    
    // Now check if the target reference exists
    const sourceId = sourceData[0][sourceCol];
    
    const { data: targetData, error: targetError } = await supabase
      .from(targetTable)
      .select('id')
      .eq(targetCol, sourceId)
      .limit(1);
      
    if (targetError) {
      console.log(`❌ Error fetching target data: ${targetError.message}`.red);
      statusObj[connectionKey] = { valid: false, error: targetError.message };
      return;
    }
    
    if (!targetData || targetData.length === 0) {
      console.log(`❌ Reference not found: ${sourceTable}.${sourceCol}=${sourceId} -> ${targetTable}.${targetCol}`.red);
      statusObj[connectionKey] = { 
        valid: false, 
        reason: `Reference ${sourceId} not found in ${targetTable}.${targetCol}`
      };
      return;
    }
    
    console.log(`✅ Valid reference: ${sourceTable}.${sourceCol}=${sourceId} -> ${targetTable}.${targetCol}`.green);
    statusObj[connectionKey] = { valid: true, testedValue: sourceId };
    
  } catch (err) {
    console.log(`❌ Error checking connection: ${err.message}`.red);
    statusObj[connectionKey] = { valid: false, error: err.message };
  }
}

// Count valid and invalid connections
function summarizeConnections(connectionsStatus) {
  const summary = {
    total: Object.keys(connectionsStatus).length,
    valid: 0,
    invalid: 0
  };
  
  for (const key in connectionsStatus) {
    if (connectionsStatus[key].valid) {
      summary.valid++;
    } else {
      summary.invalid++;
    }
  }
  
  return summary;
}

// Main function
async function main() {
  try {
    // Check database connection
    console.log('Checking database connection...'.yellow);
    
    const { data: healthCheck, error: healthError } = await supabase
      .from('aesthetic_categories')
      .select('id')
      .limit(1);
      
    if (healthError) {
      console.error(`❌ Database connection error: ${healthError.message}`.red);
      console.log('Please check your .env file and ensure SUPABASE_SERVICE_KEY is correct');
      process.exit(1);
    }
    
    console.log('✅ Database connection successful'.green);
    
    // Monitor connections
    const { tablesStatus, connectionsStatus } = await monitorConnections();
    
    // Generate report
    console.log('\n=================================================='.cyan);
    console.log('📊 MONITORING REPORT'.brightWhite.bold);
    console.log('==================================================\n'.cyan);
    
    // Table status summary
    const existingTables = Object.keys(tablesStatus).filter(table => tablesStatus[table].exists);
    const missingTables = Object.keys(tablesStatus).filter(table => !tablesStatus[table].exists);
    
    console.log(`Tables found: ${existingTables.length}/${TABLES_TO_CHECK.length}`.cyan);
    console.log(`Tables missing: ${missingTables.length}/${TABLES_TO_CHECK.length}`.cyan);
    
    if (missingTables.length > 0) {
      console.log('\nMissing tables:'.yellow);
      missingTables.forEach(table => {
        console.log(`- ${table}: ${tablesStatus[table].error || 'Not found'}`);
      });
    }
    
    // Connection status summary
    const connectionSummary = summarizeConnections(connectionsStatus);
    console.log(`\nConnections checked: ${connectionSummary.total}`.cyan);
    console.log(`Valid connections: ${connectionSummary.valid}`.green);
    console.log(`Invalid connections: ${connectionSummary.invalid}`.red);
    
    if (connectionSummary.invalid > 0) {
      console.log('\nInvalid connections:'.yellow);
      Object.keys(connectionsStatus).forEach(key => {
        if (!connectionsStatus[key].valid) {
          console.log(`- ${key}: ${connectionsStatus[key].error || connectionsStatus[key].reason}`);
        }
      });
    }
    
    // Overall health status
    const isHealthy = missingTables.length === 0 && connectionSummary.invalid === 0;
    
    console.log('\n=================================================='.cyan);
    console.log(`Overall market data health: ${isHealthy ? '✅ HEALTHY'.green : '❌ ISSUES DETECTED'.red}`);
    console.log('==================================================\n'.cyan);
    
    // Recommendations
    if (!isHealthy) {
      console.log('Recommended actions:'.yellow);
      
      if (missingTables.length > 0) {
        console.log('1. Run fix-supabase-connection.js to create missing tables');
      }
      
      if (connectionSummary.invalid > 0) {
        console.log('2. Run fix-column-references.js to repair table relationships');
        console.log('3. Run populate-market-growth.js to add proper category references');
      }
    } else {
      console.log('✅ All market data tables and connections are healthy'.green);
      console.log('The dashboard should be able to display market data correctly');
    }
    
    console.log('\n==================================================\n'.cyan);
  } catch (err) {
    console.error(`❌ Monitoring error: ${err.message}`.red);
    process.exit(1);
  }
}

// Run the main function
main();
