// Simple check script to verify the dental_procedures_simplified table

import { supabase } from './supabaseClient.js';

/**
 * Simple function to check if we can access the dental_procedures_simplified table
 */
const checkDentalProceduresTable = async () => {
  try {
    console.log('Checking dental_procedures_simplified table...');
    
    const { data, error, count } = await supabase
      .from('dental_procedures_simplified')
      .select('*', { count: 'exact' })
      .limit(5);
    
    if (error) {
      console.error('❌ Error accessing dental_procedures_simplified table:', error.message);
      return false;
    }
    
    console.log(`✅ Successfully connected to dental_procedures_simplified table!`);
    console.log(`Found ${count} total rows. First ${Math.min(count, 5)} rows:`);
    
    if (data && data.length > 0) {
      data.forEach((row, index) => {
        console.log(`[${index + 1}] ${row.procedure_name} - Growth: ${row.yearly_growth_percentage}% - Market Size: $${row.market_size_2025_usd_millions}B`);
      });
    } else {
      console.log('No data found in the table.');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
};

// Execute the check function
checkDentalProceduresTable()
  .then(success => {
    if (success) {
      console.log('✅ Check completed successfully');
    } else {
      console.error('❌ Check failed');
    }
    // Exit in node environment
    if (typeof process !== 'undefined' && process.exit) {
      process.exit(success ? 0 : 1);
    }
  });
