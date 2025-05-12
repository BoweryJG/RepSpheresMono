import { supabase } from './supabaseClient';
import { fileURLToPath } from 'url';
import * as url from 'url';
import { 
  dentalProcedures, 
  dentalCategories, 
  dentalMarketGrowth, 
  dentalDemographics, 
  dentalGenderDistribution 
} from '../../data/dentalProcedures';

import { 
  aestheticProcedures, 
  aestheticCategories, 
  aestheticMarketGrowth, 
  aestheticDemographics, 
  aestheticGenderDistribution 
} from '../../data/aestheticProcedures';

import {
  dentalCompanies,
  aestheticCompanies
} from '../../data/dentalCompanies';

import { 
  metropolitanMarkets,
  marketSizeByState,
  growthRatesByRegion,
  proceduresByRegion,
  demographicsByRegion,
  topProvidersByMarket
} from '../../data/metropolitanMarkets';

/**
 * Direct function to fix Supabase data population issues and ensure all tables are correctly created
 * and populated with data. This function solves the issue where data isn't showing in the UI by
 * ensuring the correct tables exist and have the right schema.
 */
export const fixSupabaseData = async () => {
  try {
    console.log('🚀 FixSupabaseData: Starting direct database repair...');
    
    // Step 1: Setup categories tables correctly
    // This fixes the mismatch between the schema and data loader
    await setupCombinedCategoriesTable();
    
    // Step 2: Create all required tables if they don't exist
    await createRequiredTables();
    
    // Step 3: Load all data
    await loadAllData();
    
    // Step 4: Fix permissions and RLS policies
    await fixPermissions();
    
    console.log('✅ FixSupabaseData: Database repair completed successfully!');
    return { success: true, message: 'Database repair completed successfully.' };
  } catch (error) {
    console.error('❌ Error fixing Supabase data:', error);
    return { success: false, error: error.message || 'Unknown error occurred' };
  }
};

/**
 * Create and setup the combined categories table to match what the app actually uses
 */
const setupCombinedCategoriesTable = async () => {
  console.log('Setting up combined categories table...');
  
  // Check if the categories table exists
  const { error: checkError } = await supabase.rpc('list_all_tables')
    .eq('tablename', 'categories')
    .single();
  
  const tableExists = !checkError;
  
  if (!tableExists) {
    // Create the combined categories table
    const { error: createError } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS categories (
          id SERIAL PRIMARY KEY,
          industry TEXT NOT NULL,
          category_label TEXT NOT NULL,
          position INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(industry, category_label)
        );
        
        ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Allow public to read categories"
        ON categories
        FOR SELECT
        TO anon
        USING (true);
      `
    });
    
    if (createError) throw new Error(`Failed to create categories table: ${createError.message}`);
    
    console.log('✅ Combined categories table created successfully!');
  } else {
    console.log('✅ Combined categories table already exists');
  }
  
  // Handle aesthetic_categories table if it exists but uses a different schema
  const { error: aestheticCatCheckError } = await supabase.rpc('list_all_tables')
    .eq('tablename', 'aesthetic_categories')
    .single();
  
  if (!aestheticCatCheckError) {
    // If the table exists, check if it has category_label column 
    const { data: columns, error: columnsError } = await supabase.rpc('execute_sql', {
      sql: `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'aesthetic_categories'
        AND column_name = 'category_label';
      `
    });
    
    if (columnsError) console.warn('Error checking aesthetic_categories columns:', columnsError.message);
    
    if (!columns || columns.length === 0) {
      // Need to add category_label column or rename name column
      const { error: alterError } = await supabase.rpc('execute_sql', {
        sql: `
          ALTER TABLE aesthetic_categories
          ADD COLUMN IF NOT EXISTS category_label TEXT;
          
          UPDATE aesthetic_categories
          SET category_label = name
          WHERE category_label IS NULL;
        `
      });
      
      if (alterError) console.warn('Error updating aesthetic_categories schema:', alterError.message);
    }
  }
};

/**
 * Create all required tables
 */
const createRequiredTables = async () => {
  console.log('Creating required tables if they don\'t exist...');
  
  const { error: schemaError } = await supabase.rpc('execute_sql', {
    sql: `
      -- Procedures tables
      CREATE TABLE IF NOT EXISTS dental_procedures (
        id SERIAL PRIMARY KEY,
        procedure_name TEXT NOT NULL,
        category_id INTEGER,
        yearly_growth_percentage NUMERIC(5,2) NOT NULL,
        market_size_2025_usd_millions NUMERIC(5,2) NOT NULL,
        age_range TEXT NOT NULL,
        recent_trends TEXT NOT NULL,
        future_outlook TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS aesthetic_procedures (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        category_id INTEGER,
        yearly_growth_percentage NUMERIC(5,2) NOT NULL,
        market_size_2025_usd_millions NUMERIC(5,2) NOT NULL,
        primary_age_group TEXT NOT NULL,
        trends TEXT NOT NULL,
        future_outlook TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Market growth tables
      CREATE TABLE IF NOT EXISTS dental_market_growth (
        id SERIAL PRIMARY KEY,
        year INTEGER NOT NULL,
        size NUMERIC(5,2) NOT NULL,
        is_projected BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS aesthetic_market_growth (
        id SERIAL PRIMARY KEY,
        year INTEGER NOT NULL,
        size NUMERIC(5,2) NOT NULL,
        is_projected BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Demographics tables
      CREATE TABLE IF NOT EXISTS dental_demographics (
        id SERIAL PRIMARY KEY,
        age_group TEXT NOT NULL,
        percentage INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS aesthetic_demographics (
        id SERIAL PRIMARY KEY,
        age_group TEXT NOT NULL,
        percentage INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Gender distribution tables
      CREATE TABLE IF NOT EXISTS dental_gender_distribution (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        value INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS aesthetic_gender_distribution (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        value INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Metropolitan markets table
      CREATE TABLE IF NOT EXISTS metropolitan_markets (
        id SERIAL PRIMARY KEY,
        rank INTEGER NOT NULL,
        metro TEXT NOT NULL,
        market_size_2023 NUMERIC(5,2) NOT NULL,
        market_size_2030 NUMERIC(5,2) NOT NULL,
        growth_rate NUMERIC(5,2) NOT NULL,
        key_procedures TEXT[] NOT NULL,
        provider_density NUMERIC(5,2) NOT NULL,
        insurance_coverage INTEGER NOT NULL,
        disposable_income TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Companies table
      CREATE TABLE IF NOT EXISTS companies (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        industry TEXT NOT NULL,
        description TEXT,
        logo_url TEXT,
        website TEXT,
        headquarters TEXT,
        founded INTEGER,
        timeInMarket INTEGER,
        parentCompany TEXT,
        employeeCount TEXT,
        revenue TEXT,
        marketCap TEXT,
        marketShare NUMERIC(5,2),
        growthRate NUMERIC(5,2),
        keyOfferings TEXT[],
        topProducts TEXT[],
        stock_symbol TEXT,
        stock_exchange TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
  });

  if (schemaError) throw new Error(`Failed to create required tables: ${schemaError.message}`);
  
  console.log('✅ Required tables created successfully!');
};

/**
 * Load all data to Supabase
 */
const loadAllData = async () => {
  try {
    console.log('Loading all data to Supabase...');
    
    // Step 1: Load categories first (needed for foreign keys)
    console.log('1. Loading categories...');
    await loadCategories();
    
    // Step 2: Load procedures
    console.log('2. Loading procedures...');
    await loadProcedures();
    
    // Step 3: Load market growth data
    console.log('3. Loading market growth data...');
    await loadMarketGrowth();
    
    // Step 4: Load demographics
    console.log('4. Loading demographics data...');
    await loadDemographics();
    
    // Step 5: Load gender distribution
    console.log('5. Loading gender distribution data...');
    await loadGenderDistribution();
    
    // Step 6: Load companies
    console.log('6. Loading companies data...');
    await loadCompaniesData();
    
    console.log('✅ All data loaded to Supabase successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error loading data to Supabase:', error);
    throw error;
  }
};

/**
 * Load categories to Supabase
 */
const loadCategories = async () => {
  // Upsert dental categories
  for (let i = 0; i < dentalCategories.length; i++) {
    const category = dentalCategories[i];
    const { error } = await supabase
      .from('categories')
      .upsert(
        { industry: 'dental', category_label: category, position: i },
        { onConflict: 'industry,category_label' }
      );
    if (error) {
      console.error('Error upserting dental category:', category, error);
      throw error;
    }
  }
  
  // Upsert aesthetic categories
  for (let i = 0; i < aestheticCategories.length; i++) {
    const category = aestheticCategories[i];
    const { error } = await supabase
      .from('categories')
      .upsert(
        { industry: 'aesthetic', category_label: category, position: i },
        { onConflict: 'industry,category_label' }
      );
    if (error) {
      console.error('Error upserting aesthetic category:', category, error);
      throw error;
    }
  }
};

/**
 * Load procedures to Supabase
 */
const loadProcedures = async () => {
  // Clear existing procedures first
  const { error: clearDentalError } = await supabase
    .from('dental_procedures')
    .delete()
    .neq('id', 0); // Delete all
  
  const { error: clearAestheticError } = await supabase
    .from('aesthetic_procedures')
    .delete()
    .neq('id', 0); // Delete all
  
  if (clearDentalError) console.warn('Error clearing dental procedures:', clearDentalError);
  if (clearAestheticError) console.warn('Error clearing aesthetic procedures:', clearAestheticError);
  
  // Get category IDs for dental procedures
  const { data: dentalCategoryData, error: dentalCategoryError } = await supabase
    .from('categories')
    .select('id, category_label')
    .eq('industry', 'dental');
  
  if (dentalCategoryError) throw dentalCategoryError;
  
  // Create a mapping of category names to IDs
  const dentalCategoryMap = {};
  dentalCategoryData.forEach(category => {
    dentalCategoryMap[category.category_label] = category.id;
  });
  
  // Insert dental procedures
  for (const procedure of dentalProcedures) {
    const { error } = await supabase
      .from('dental_procedures')
      .insert({
        procedure_name: procedure.name,
        category_id: dentalCategoryMap[procedure.category],
        yearly_growth_percentage: procedure.growth,
        market_size_2025_usd_millions: procedure.marketSize2025,
        age_range: procedure.primaryAgeGroup,
        recent_trends: procedure.trends,
        future_outlook: procedure.futureOutlook
      });
    
    if (error) {
      console.error('Error inserting dental procedure:', procedure.name, error);
      throw error;
    }
  }
  
  // Get category IDs for aesthetic procedures
  const { data: aestheticCategoryData, error: aestheticCategoryError } = await supabase
    .from('categories')
    .select('id, category_label')
    .eq('industry', 'aesthetic');
  
  if (aestheticCategoryError) throw aestheticCategoryError;
  
  // Create a mapping of category names to IDs
  const aestheticCategoryMap = {};
  aestheticCategoryData.forEach(category => {
    aestheticCategoryMap[category.category_label] = category.id;
  });
  
  // Insert aesthetic procedures
  for (const procedure of aestheticProcedures) {
    const categoryId = aestheticCategoryMap[procedure.category];
    
    const { error } = await supabase
      .from('aesthetic_procedures')
      .insert({
        name: procedure.name,
        category_id: categoryId,
        yearly_growth_percentage: procedure.growth,
        market_size_2025_usd_millions: procedure.marketSize2025,
        primary_age_group: procedure.primaryAgeGroup,
        trends: procedure.trends,
        future_outlook: procedure.futureOutlook
      });
    
    if (error) {
      console.error('Error inserting aesthetic procedure:', procedure.name, error);
      throw error;
    }
  }
};

/**
 * Load market growth data to Supabase
 */
const loadMarketGrowth = async () => {
  // Clear existing market growth data first
  const { error: clearDentalError } = await supabase
    .from('dental_market_growth')
    .delete()
    .neq('id', 0); // Delete all
  
  const { error: clearAestheticError } = await supabase
    .from('aesthetic_market_growth')
    .delete()
    .neq('id', 0); // Delete all
  
  if (clearDentalError) console.warn('Error clearing dental market growth:', clearDentalError);
  if (clearAestheticError) console.warn('Error clearing aesthetic market growth:', clearAestheticError);
  
  // Insert dental market growth data
  for (const growth of dentalMarketGrowth) {
    const isProjected = growth.year >= 2025;
    
    const { error } = await supabase
      .from('dental_market_growth')
      .insert({
        year: growth.year,
        size: growth.size,
        is_projected: isProjected
      });
    
    if (error) {
      console.error('Error inserting dental market growth:', growth.year, error);
      throw error;
    }
  }
  
  // Insert aesthetic market growth data
  for (const growth of aestheticMarketGrowth) {
    const isProjected = growth.year >= 2025;
    
    const { error } = await supabase
      .from('aesthetic_market_growth')
      .insert({
        year: growth.year,
        size: growth.size,
        is_projected: isProjected
      });
    
    if (error) {
      console.error('Error inserting aesthetic market growth:', growth.year, error);
      throw error;
    }
  }
};

/**
 * Load demographics data to Supabase
 */
const loadDemographics = async () => {
  // Clear existing demographics data first
  const { error: clearDentalError } = await supabase
    .from('dental_demographics')
    .delete()
    .neq('id', 0); // Delete all
  
  const { error: clearAestheticError } = await supabase
    .from('aesthetic_demographics')
    .delete()
    .neq('id', 0); // Delete all
  
  if (clearDentalError) console.warn('Error clearing dental demographics:', clearDentalError);
  if (clearAestheticError) console.warn('Error clearing aesthetic demographics:', clearAestheticError);
  
  // Insert dental demographics data
  for (const demographic of dentalDemographics) {
    const { error } = await supabase
      .from('dental_demographics')
      .insert({
        age_group: demographic.ageGroup,
        percentage: demographic.percentage
      });
    
    if (error) {
      console.error('Error inserting dental demographic:', demographic.ageGroup, error);
      throw error;
    }
  }
  
  // Insert aesthetic demographics data
  for (const demographic of aestheticDemographics) {
    const { error } = await supabase
      .from('aesthetic_demographics')
      .insert({
        age_group: demographic.ageGroup,
        percentage: demographic.percentage
      });
    
    if (error) {
      console.error('Error inserting aesthetic demographic:', demographic.ageGroup, error);
      throw error;
    }
  }
};

/**
 * Load gender distribution data to Supabase
 */
const loadGenderDistribution = async () => {
  // Clear existing gender distribution data first
  const { error: clearDentalError } = await supabase
    .from('dental_gender_distribution')
    .delete()
    .neq('id', 0); // Delete all
  
  const { error: clearAestheticError } = await supabase
    .from('aesthetic_gender_distribution')
    .delete()
    .neq('id', 0); // Delete all
  
  if (clearDentalError) console.warn('Error clearing dental gender distribution:', clearDentalError);
  if (clearAestheticError) console.warn('Error clearing aesthetic gender distribution:', clearAestheticError);
  
  // Insert dental gender distribution data
  for (const gender of dentalGenderDistribution) {
    const { error } = await supabase
      .from('dental_gender_distribution')
      .insert({
        name: gender.name,
        value: gender.value
      });
    
    if (error) {
      console.error('Error inserting dental gender distribution:', gender.name, error);
      throw error;
    }
  }
  
  // Insert aesthetic gender distribution data
  for (const gender of aestheticGenderDistribution) {
    const { error } = await supabase
      .from('aesthetic_gender_distribution')
      .insert({
        name: gender.name,
        value: gender.value
      });
    
    if (error) {
      console.error('Error inserting aesthetic gender distribution:', gender.name, error);
      throw error;
    }
  }
};

/**
 * Load dental and aesthetic companies to Supabase
 */
const loadCompaniesData = async () => {
  // Clear existing companies data first
  const { error: clearError } = await supabase
    .from('companies')
    .delete()
    .neq('id', 0); // Delete all
  
  if (clearError) console.warn('Error clearing companies:', clearError);
  
  // Load dental companies
  for (const company of dentalCompanies) {
    const { error } = await supabase
      .from('companies')
      .insert({
        name: company.name,
        industry: 'dental',
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
      });
    
    if (error) {
      console.error('Error inserting dental company:', company.name, error);
      throw error;
    }
  }
  
  // Load aesthetic companies
  for (const company of aestheticCompanies) {
    const { error } = await supabase
      .from('companies')
      .insert({
        name: company.name,
        industry: 'aesthetic',
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
      });
    
    if (error) {
      console.error('Error inserting aesthetic company:', company.name, error);
      throw error;
    }
  }
};

/**
 * Fix RLS permissions and policies to ensure data is accessible
 */
const fixPermissions = async () => {
  console.log('Fixing permissions and RLS policies...');
  
  const { error } = await supabase.rpc('execute_sql', {
    sql: `
      -- Enable RLS on all tables
      ALTER TABLE IF EXISTS categories ENABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS dental_procedures ENABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS aesthetic_procedures ENABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS dental_market_growth ENABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS aesthetic_market_growth ENABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS dental_demographics ENABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS aesthetic_demographics ENABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS dental_gender_distribution ENABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS aesthetic_gender_distribution ENABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS companies ENABLE ROW LEVEL SECURITY;
      
      -- Create or replace policies for public read access
      -- Categories
      DROP POLICY IF EXISTS "Allow public to read categories" ON categories;
      CREATE POLICY "Allow public to read categories"
        ON categories
        FOR SELECT
        TO anon
        USING (true);
      
      -- Dental procedures
      DROP POLICY IF EXISTS "Allow public to read dental procedures" ON dental_procedures;
      CREATE POLICY "Allow public to read dental procedures"
        ON dental_procedures
        FOR SELECT
        TO anon
        USING (true);
      
      -- Aesthetic procedures
      DROP POLICY IF EXISTS "Allow public to read aesthetic procedures" ON aesthetic_procedures;
      CREATE POLICY "Allow public to read aesthetic procedures"
        ON aesthetic_procedures
        FOR SELECT
        TO anon
        USING (true);
      
      -- Dental market growth
      DROP POLICY IF EXISTS "Allow public to read dental market growth" ON dental_market_growth;
      CREATE POLICY "Allow public to read dental market growth"
        ON dental_market_growth
        FOR SELECT
        TO anon
        USING (true);
      
      -- Aesthetic market growth
      DROP POLICY IF EXISTS "Allow public to read aesthetic market growth" ON aesthetic_market_growth;
      CREATE POLICY "Allow public to read aesthetic market growth"
        ON aesthetic_market_growth
        FOR SELECT
        TO anon
        USING (true);
      
      -- Dental demographics
      DROP POLICY IF EXISTS "Allow public to read dental demographics" ON dental_demographics;
      CREATE POLICY "Allow public to read dental demographics"
        ON dental_demographics
        FOR SELECT
        TO anon
        USING (true);
      
      -- Aesthetic demographics
      DROP POLICY IF EXISTS "Allow public to read aesthetic demographics" ON aesthetic_demographics;
      CREATE POLICY "Allow public to read aesthetic demographics"
        ON aesthetic_demographics
        FOR SELECT
        TO anon
        USING (true);
      
      -- Dental gender distribution
      DROP POLICY IF EXISTS "Allow public to read dental gender distribution" ON dental_gender_distribution;
      CREATE POLICY "Allow public to read dental gender distribution"
        ON dental_gender_distribution
        FOR SELECT
        TO anon
        USING (true);
      
      -- Aesthetic gender distribution
      DROP POLICY IF EXISTS "Allow public to read aesthetic gender distribution" ON aesthetic_gender_distribution;
      CREATE POLICY "Allow public to read aesthetic gender distribution"
        ON aesthetic_gender_distribution
        FOR SELECT
        TO anon
        USING (true);
      
      -- Companies
      DROP POLICY IF EXISTS "Allow public to read companies" ON companies;
      CREATE POLICY "Allow public to read companies"
        ON companies
        FOR SELECT
        TO anon
        USING (true);
    `
  });
  
  if (error) {
    console.error('Error fixing permissions:', error.message);
    throw new Error(`Failed to fix permissions: ${error.message}`);
  }
  
  console.log('✅ Fixed permissions and RLS policies!');
};

/**
 * Run this function directly when this file is executed
 */
if (import.meta.url === url.pathToFileURL(process.argv[1]).href) {
  fixSupabaseData()
    .then(result => {
      console.log('Script completed with result:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch(err => {
      console.error('Script failed with error:', err);
      process.exit(1);
    });
}

export default fixSupabaseData;
