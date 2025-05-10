import { supabase } from './supabaseClient';
import fs from 'fs';

/**
 * Utility script to verify company data in Supabase
 */
const checkCompanyData = async () => {
  let results = [];
  try {
    results.push('Checking company data in Supabase...');
    
    // Check raw companies table data
    const { data: companies, error } = await supabase
      .from('companies')
      .select('*');
    
    if (error) {
      const errorMsg = `Error fetching companies: ${error.message}`;
      results.push(errorMsg);
      console.error(errorMsg);
      return;
    }
    
    // Check if there are any companies at all
    results.push(`Total companies found: ${companies.length}`);
    
    if (companies.length === 0) {
      results.push('No company data found in the database. Check data loading process.');
      return;
    }
    
    // Check dental companies
    const dentalCompanies = companies.filter(c => c.industry === 'Dental');
    results.push(`Dental companies found: ${dentalCompanies.length}`);
    
    // Check aesthetic companies
    const aestheticCompanies = companies.filter(c => c.industry === 'Aesthetic');
    results.push(`Aesthetic companies found: ${aestheticCompanies.length}`);
    
    // Check if companies have market share and growth rate
    const companiesWithMarketShare = companies.filter(c => c.marketShare !== null && c.marketShare !== undefined);
    results.push(`Companies with market share data: ${companiesWithMarketShare.length}`);
    
    const companiesWithGrowthRate = companies.filter(c => c.growthRate !== null && c.growthRate !== undefined);
    results.push(`Companies with growth rate data: ${companiesWithGrowthRate.length}`);
    
    // Print first company as example
    if (companies.length > 0) {
      results.push('\nSample company data:');
      results.push(JSON.stringify(companies[0], null, 2));
    }
    
    // Check columns
    if (companies.length > 0) {
      results.push('\nAvailable columns:');
      results.push(Object.keys(companies[0]).join(', '));
    }
    
    // Check table schema
    const { data: schemaData, error: schemaError } = await supabase
      .rpc('get_table_schema', { table_name: 'companies' });
    
    if (schemaError) {
      results.push(`Error fetching schema: ${schemaError.message}`);
    } else if (schemaData) {
      results.push('\nTable schema:');
      results.push(JSON.stringify(schemaData, null, 2));
    }
    
  } catch (error) {
    const errorMsg = `Error checking company data: ${error.message}`;
    results.push(errorMsg);
    console.error(errorMsg);
  }
  
  // Write results to file for inspection
  fs.writeFileSync('company_check_results.txt', results.join('\n'));
  console.log('Check completed. Results written to company_check_results.txt');
  
  // Also log to console
  for (const line of results) {
    console.log(line);
  }
};

// Run the check
checkCompanyData()
  .then(() => {
    console.log('Data verification complete');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
