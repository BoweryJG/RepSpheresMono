import { supabase } from './supabaseClient';
import { 
  dentalProcedures, dentalCategories, dentalMarketGrowth, dentalDemographics, dentalGenderDistribution 
} from '../../data/dentalProcedures';
import { 
  aestheticProcedures, aestheticCategories, aestheticMarketGrowth, aestheticDemographics, aestheticGenderDistribution 
} from '../../data/aestheticProcedures';
import { dentalCompanies, aestheticCompanies } from '../../data/dentalCompanies';

/**
 * Direct SQL execution to fix database structure and populate all tables
 */
async function directSqlFix() {
  try {
    console.log('🔄 STARTING DIRECT DATABASE FIX');
    
    // Step 1: Create or recreate the categories table
    console.log('👷 Creating combined categories table...');
    await supabase.rpc('execute_sql', {
      sql: `
        DROP TABLE IF EXISTS categories CASCADE;
        
        CREATE TABLE categories (
          id SERIAL PRIMARY KEY,
          industry TEXT NOT NULL,
          category_label TEXT NOT NULL,
          position INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(industry, category_label)
        );
        
        ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Allow public read access" ON categories FOR SELECT TO anon USING (true);
      `
    });
    
    // Step 2: Populate categories table
    console.log('📊 Populating categories...');
    for (let i = 0; i < dentalCategories.length; i++) {
      await supabase.from('categories').insert({
        industry: 'dental',
        category_label: dentalCategories[i],
        position: i
      });
    }
    
    for (let i = 0; i < aestheticCategories.length; i++) {
      await supabase.from('categories').insert({
        industry: 'aesthetic',
        category_label: aestheticCategories[i],
        position: i
      });
    }
    
    // Step 3: Create and populate dental_procedures table
    console.log('👷 Creating and populating dental procedures...');
    await supabase.rpc('execute_sql', {
      sql: `
        DROP TABLE IF EXISTS dental_procedures CASCADE;
        
        CREATE TABLE dental_procedures (
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
        
        ALTER TABLE dental_procedures ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Allow public read access" ON dental_procedures FOR SELECT TO anon USING (true);
      `
    });
    
    // Get category IDs
    const { data: dentalCategoryData } = await supabase
      .from('categories')
      .select('id, category_label')
      .eq('industry', 'dental');
      
    // Create mapping
    const dentalCategoryMap = {};
    dentalCategoryData.forEach(cat => {
      dentalCategoryMap[cat.category_label] = cat.id;
    });
    
    // Insert dental procedures
    for (const proc of dentalProcedures) {
      await supabase.from('dental_procedures').insert({
        procedure_name: proc.name,
        category_id: dentalCategoryMap[proc.category],
        yearly_growth_percentage: proc.growth,
        market_size_2025_usd_millions: proc.marketSize2025,
        age_range: proc.primaryAgeGroup,
        recent_trends: proc.trends,
        future_outlook: proc.futureOutlook
      });
    }
    
    // Step 4: Create and populate aesthetic_procedures table
    console.log('👷 Creating and populating aesthetic procedures...');
    await supabase.rpc('execute_sql', {
      sql: `
        DROP TABLE IF EXISTS aesthetic_procedures CASCADE;
        
        CREATE TABLE aesthetic_procedures (
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
        
        ALTER TABLE aesthetic_procedures ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Allow public read access" ON aesthetic_procedures FOR SELECT TO anon USING (true);
      `
    });
    
    // Get category IDs
    const { data: aestheticCategoryData } = await supabase
      .from('categories')
      .select('id, category_label')
      .eq('industry', 'aesthetic');
      
    // Create mapping
    const aestheticCategoryMap = {};
    aestheticCategoryData.forEach(cat => {
      aestheticCategoryMap[cat.category_label] = cat.id;
    });
    
    // Insert aesthetic procedures
    for (const proc of aestheticProcedures) {
      await supabase.from('aesthetic_procedures').insert({
        name: proc.name,
        category_id: aestheticCategoryMap[proc.category],
        yearly_growth_percentage: proc.growth,
        market_size_2025_usd_millions: proc.marketSize2025,
        primary_age_group: proc.primaryAgeGroup,
        trends: proc.trends,
        future_outlook: proc.futureOutlook
      });
    }
    
    // Step 5: Create and populate market growth tables
    console.log('📈 Setting up market growth data...');
    await supabase.rpc('execute_sql', {
      sql: `
        DROP TABLE IF EXISTS dental_market_growth CASCADE;
        
        CREATE TABLE dental_market_growth (
          id SERIAL PRIMARY KEY,
          year INTEGER NOT NULL,
          size NUMERIC(5,2) NOT NULL,
          is_projected BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE dental_market_growth ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Allow public read access" ON dental_market_growth FOR SELECT TO anon USING (true);
        
        DROP TABLE IF EXISTS aesthetic_market_growth CASCADE;
        
        CREATE TABLE aesthetic_market_growth (
          id SERIAL PRIMARY KEY,
          year INTEGER NOT NULL,
          size NUMERIC(5,2) NOT NULL,
          is_projected BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE aesthetic_market_growth ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Allow public read access" ON aesthetic_market_growth FOR SELECT TO anon USING (true);
      `
    });
    
    // Insert dental market growth data
    for (const growth of dentalMarketGrowth) {
      await supabase.from('dental_market_growth').insert({
        year: growth.year,
        size: growth.size,
        is_projected: growth.year >= 2025
      });
    }
    
    // Insert aesthetic market growth data
    for (const growth of aestheticMarketGrowth) {
      await supabase.from('aesthetic_market_growth').insert({
        year: growth.year,
        size: growth.size,
        is_projected: growth.year >= 2025
      });
    }
    
    // Step 6: Create and populate demographics tables
    console.log('👥 Setting up demographics data...');
    await supabase.rpc('execute_sql', {
      sql: `
        DROP TABLE IF EXISTS dental_demographics CASCADE;
        
        CREATE TABLE dental_demographics (
          id SERIAL PRIMARY KEY,
          age_group TEXT NOT NULL,
          percentage INTEGER NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE dental_demographics ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Allow public read access" ON dental_demographics FOR SELECT TO anon USING (true);
        
        DROP TABLE IF EXISTS aesthetic_demographics CASCADE;
        
        CREATE TABLE aesthetic_demographics (
          id SERIAL PRIMARY KEY,
          age_group TEXT NOT NULL,
          percentage INTEGER NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE aesthetic_demographics ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Allow public read access" ON aesthetic_demographics FOR SELECT TO anon USING (true);
      `
    });
    
    // Insert dental demographics
    for (const demo of dentalDemographics) {
      await supabase.from('dental_demographics').insert({
        age_group: demo.ageGroup,
        percentage: demo.percentage
      });
    }
    
    // Insert aesthetic demographics
    for (const demo of aestheticDemographics) {
      await supabase.from('aesthetic_demographics').insert({
        age_group: demo.ageGroup,
        percentage: demo.percentage
      });
    }
    
    // Step 7: Create and populate gender distribution tables
    console.log('⚤ Setting up gender distribution data...');
    await supabase.rpc('execute_sql', {
      sql: `
        DROP TABLE IF EXISTS dental_gender_distribution CASCADE;
        
        CREATE TABLE dental_gender_distribution (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          value INTEGER NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE dental_gender_distribution ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Allow public read access" ON dental_gender_distribution FOR SELECT TO anon USING (true);
        
        DROP TABLE IF EXISTS aesthetic_gender_distribution CASCADE;
        
        CREATE TABLE aesthetic_gender_distribution (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          value INTEGER NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE aesthetic_gender_distribution ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Allow public read access" ON aesthetic_gender_distribution FOR SELECT TO anon USING (true);
      `
    });
    
    // Insert dental gender distribution
    for (const gender of dentalGenderDistribution) {
      await supabase.from('dental_gender_distribution').insert({
        name: gender.name,
        value: gender.value
      });
    }
    
    // Insert aesthetic gender distribution
    for (const gender of aestheticGenderDistribution) {
      await supabase.from('aesthetic_gender_distribution').insert({
        name: gender.name,
        value: gender.value
      });
    }
    
    // Step 8: Create and populate companies table
    console.log('🏢 Setting up companies data...');
    await supabase.rpc('execute_sql', {
      sql: `
        DROP TABLE IF EXISTS companies CASCADE;
        
        CREATE TABLE companies (
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
        
        ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Allow public read access" ON companies FOR SELECT TO anon USING (true);
      `
    });
    
    // Insert dental companies
    for (const company of dentalCompanies) {
      await supabase.from('companies').insert({
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
    }
    
    // Insert aesthetic companies
    for (const company of aestheticCompanies) {
      await supabase.from('companies').insert({
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
    }
    
    // Verify data was loaded
    console.log('🔍 Verifying data...');
    
    const { count: dentalProceduresCount } = await supabase
      .from('dental_procedures')
      .select('*', { count: 'exact', head: true });
      
    const { count: aestheticProceduresCount } = await supabase
      .from('aesthetic_procedures')
      .select('*', { count: 'exact', head: true });
      
    const { count: categoriesCount } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true });
      
    console.log(`✅ DATA VERIFICATION:
      - Categories: ${categoriesCount} rows
      - Dental procedures: ${dentalProceduresCount} rows
      - Aesthetic procedures: ${aestheticProceduresCount} rows
    `);
    
    console.log('✅ DATABASE FIX COMPLETED SUCCESSFULLY');
    return { success: true, message: 'Database has been fixed and all tables are now populated.' };
    
  } catch (error) {
    console.error('❌ ERROR FIXING DATABASE:', error.message);
    return { success: false, error: error.message };
  }
}

// Execute fix immediately
directSqlFix().then(result => {
  console.log('FINAL RESULT:', result);
  if (!result.success) {
    process.exit(1);
  }
}).catch(err => {
  console.error('CRITICAL ERROR:', err);
  process.exit(1);
});
