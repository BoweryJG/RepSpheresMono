import { supabase } from './supabaseClient';
import { 
  aestheticProcedures, 
  aestheticCategories, 
} from '../../data/aestheticProcedures';

import {
  dentalCompanies,
  aestheticCompanies
} from '../../data/dentalCompanies';

/**
 * Loads aesthetic procedures and companies data into Supabase
 */
const loadAestheticsAndCompanies = async () => {
  try {
    console.log('Starting targeted data upload to Supabase...');
    
    // First ensure aesthetic categories are loaded
    await loadAestheticCategories();
    
    // Then load aesthetic procedures 
    await loadAestheticProcedures();
    
    // Load companies data
    await loadCompaniesData();
    
    console.log('Aesthetic procedures and companies data successfully loaded to Supabase!');
    return { success: true, message: 'Data successfully loaded!' };
  } catch (error) {
    console.error('Error loading data to Supabase:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Load aesthetic categories to Supabase
 */
const loadAestheticCategories = async () => {
  console.log('Loading aesthetic categories...');
  
  // Load aesthetic categories
  for (const category of aestheticCategories) {
    const { error } = await supabase
      .from('aesthetic_categories')
      .upsert({ name: category }, { onConflict: 'name' });
    
    if (error) throw error;
  }
  
  console.log('Aesthetic categories loaded successfully!');
};

/**
 * Load aesthetic procedures to Supabase
 */
const loadAestheticProcedures = async () => {
  console.log('Loading aesthetic procedures...');
  
  // Get category IDs for aesthetic procedures
  const { data: aestheticCategoryData, error: aestheticCategoryError } = await supabase
    .from('aesthetic_categories')
    .select('id, name');
  
  if (aestheticCategoryError) throw aestheticCategoryError;
  
  // Create a mapping of category names to IDs
  const aestheticCategoryMap = {};
  aestheticCategoryData.forEach(category => {
    aestheticCategoryMap[category.name] = category.id;
  });
  
  // Insert aesthetic procedures
  for (const procedure of aestheticProcedures) {
    const { error } = await supabase
      .from('aesthetic_procedures')
      .upsert({
        name: procedure.name,
        category_id: aestheticCategoryMap[procedure.category],
        yearly_growth_percentage: procedure.growth,
        market_size_2025_usd_millions: procedure.marketSize2025,
        primary_age_group: procedure.primaryAgeGroup,
        trends: procedure.trends,
        future_outlook: procedure.futureOutlook
      }, { onConflict: 'name' });
    
    if (error) throw error;
  }
  
  console.log('Aesthetic procedures loaded successfully!');
};

/**
 * Load companies data to Supabase
 */
const loadCompaniesData = async () => {
  console.log('Loading companies data...');
  
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
  
  // Load dental companies
  for (const company of dentalCompanies) {
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
        marketShare: company.marketShare,
        growthRate: company.growthRate,
        keyOfferings: company.keyOfferings,
        topProducts: company.topProducts
      }, { onConflict: 'name' });
    
    if (error) throw error;
  }
  
  console.log('Dental companies loaded successfully!');
  
  // Load aesthetic companies
  for (const company of aestheticCompanies) {
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
        marketShare: company.marketShare,
        growthRate: company.growthRate,
        keyOfferings: company.keyOfferings,
        topProducts: company.topProducts
      }, { onConflict: 'name' });
    
    if (error) throw error;
  }
  
  console.log('Aesthetic companies loaded successfully!');
};

// Run the loader
loadAestheticsAndCompanies()
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
