import { supabase } from './supabaseClient';
import { 
  dentalCompanies,
  aestheticCompanies
} from '../../data/dentalCompanies';

/**
 * Fixed script to properly load company data into Supabase
 */
const loadCompanyData = async () => {
  try {
    console.log('Starting fixed company data upload to Supabase...');
    
    // First, delete existing company records to avoid duplicates
    const { error: deleteError } = await supabase
      .from('companies')
      .delete()
      .neq('id', 0); // This will delete all records
    
    if (deleteError) {
      console.warn('Error clearing existing companies data:', deleteError);
      console.log('Will attempt to proceed with upsert operations...');
    } else {
      console.log('Existing companies data cleared successfully');
    }
    
    console.log('Loading dental companies...');
    // Load dental companies with proper JSON parsing for arrays
    for (const company of dentalCompanies) {
      // For debugging
      console.log(`Processing company: ${company.name}`);
      console.log(`Market share: ${company.marketShare}, Growth rate: ${company.growthRate}`);
      
      const { error } = await supabase
        .from('companies')
        .upsert({
          name: company.name,
          industry: 'Dental',
          description: company.description,
          website: company.website,
          headquarters: company.headquarters,
          founded: company.founded,
          timeInMarket: company.timeInMarket,
          parentCompany: company.parentCompany,
          employeeCount: company.employeeCount,
          revenue: company.revenue,
          marketCap: company.marketCap,
          marketShare: parseFloat(company.marketShare),  // Ensure numeric value
          growthRate: parseFloat(company.growthRate),    // Ensure numeric value
          keyOfferings: JSON.stringify(company.keyOfferings),  // Properly serialize arrays
          topProducts: JSON.stringify(company.topProducts)     // Properly serialize arrays
        }, { 
          onConflict: 'name',
          returning: 'minimal'  // For better performance
        });
      
      if (error) {
        console.error(`Error inserting dental company ${company.name}:`, error);
        throw error;
      }
    }
    
    console.log('Dental companies loaded successfully!');
    
    console.log('Loading aesthetic companies...');
    // Load aesthetic companies with proper JSON parsing for arrays
    for (const company of aestheticCompanies) {
      console.log(`Processing company: ${company.name}`);
      console.log(`Market share: ${company.marketShare}, Growth rate: ${company.growthRate}`);
      
      const { error } = await supabase
        .from('companies')
        .upsert({
          name: company.name,
          industry: 'Aesthetic',
          description: company.description,
          website: company.website,
          headquarters: company.headquarters,
          founded: company.founded,
          timeInMarket: company.timeInMarket,
          parentCompany: company.parentCompany,
          employeeCount: company.employeeCount,
          revenue: company.revenue,
          marketCap: company.marketCap,
          marketShare: parseFloat(company.marketShare),  // Ensure numeric value
          growthRate: parseFloat(company.growthRate),    // Ensure numeric value
          keyOfferings: JSON.stringify(company.keyOfferings),  // Properly serialize arrays
          topProducts: JSON.stringify(company.topProducts)     // Properly serialize arrays
        }, { 
          onConflict: 'name',
          returning: 'minimal'  // For better performance
        });
      
      if (error) {
        console.error(`Error inserting aesthetic company ${company.name}:`, error);
        throw error;
      }
    }
    
    console.log('Aesthetic companies loaded successfully!');
    console.log('Company data upload completed successfully!');
    
    return { success: true, message: 'Companies data successfully loaded to Supabase!' };
  } catch (error) {
    console.error('Error loading company data to Supabase:', error);
    return { success: false, error: error.message };
  }
};

// Run the loader
loadCompanyData()
  .then(result => {
    if (result.success) {
      console.log('SUCCESS:', result.message);
      process.exit(0);
    } else {
      console.error('FAILED:', result.error);
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('ERROR:', error);
    process.exit(1);
  });
