import { supabase } from './supabaseClient';
import { supabaseDataService } from './supabaseDataService';

/**
 * A test script to verify that company data is being correctly
 * loaded and parsed from Supabase after our fixes
 */
const testCompanyDataDisplay = async () => {
  try {
    console.log('Testing company data display from Supabase...');
    
    // Test dental companies retrieval
    console.log('\n--- DENTAL COMPANIES ---');
    const dentalCompanies = await supabaseDataService.getDentalCompanies();
    
    // Display count
    console.log(`Found ${dentalCompanies.length} dental companies`);
    
    // Display first company's details for verification
    if (dentalCompanies.length > 0) {
      const firstCompany = dentalCompanies[0];
      console.log('\nSample dental company:');
      console.log(`Name: ${firstCompany.name}`);
      console.log(`Market Share: ${firstCompany.marketShare} (${typeof firstCompany.marketShare})`);
      console.log(`Growth Rate: ${firstCompany.growthRate} (${typeof firstCompany.growthRate})`);
      console.log(`Key Offerings: ${JSON.stringify(firstCompany.keyOfferings)} (${Array.isArray(firstCompany.keyOfferings) ? 'Array' : typeof firstCompany.keyOfferings})`);
      console.log(`Top Products: ${JSON.stringify(firstCompany.topProducts)} (${Array.isArray(firstCompany.topProducts) ? 'Array' : typeof firstCompany.topProducts})`);
    }
    
    // Test aesthetic companies retrieval
    console.log('\n--- AESTHETIC COMPANIES ---');
    const aestheticCompanies = await supabaseDataService.getAestheticCompanies();
    
    // Display count
    console.log(`Found ${aestheticCompanies.length} aesthetic companies`);
    
    // Display first company's details for verification
    if (aestheticCompanies.length > 0) {
      const firstCompany = aestheticCompanies[0];
      console.log('\nSample aesthetic company:');
      console.log(`Name: ${firstCompany.name}`);
      console.log(`Market Share: ${firstCompany.marketShare} (${typeof firstCompany.marketShare})`);
      console.log(`Growth Rate: ${firstCompany.growthRate} (${typeof firstCompany.growthRate})`);
      console.log(`Key Offerings: ${JSON.stringify(firstCompany.keyOfferings)} (${Array.isArray(firstCompany.keyOfferings) ? 'Array' : typeof firstCompany.keyOfferings})`);
      console.log(`Top Products: ${JSON.stringify(firstCompany.topProducts)} (${Array.isArray(firstCompany.topProducts) ? 'Array' : typeof firstCompany.topProducts})`);
    }
    
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Error during test:', error);
  }
};

// Run the test
testCompanyDataDisplay()
  .then(() => {
    console.log('Test finished');
    process.exit(0);
  })
  .catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  });
