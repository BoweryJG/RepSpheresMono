import { supabase } from './supabaseClient';
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
 * Main data loading function that loads all market data to Supabase
 */
export const loadAllDataToSupabase = async () => {
  try {
    console.log('Starting data upload to Supabase...');
    
    // Load categories first (needed for foreign keys)
    await loadCategories();

    // Load primary data
    await loadProcedures();
    await loadMarketGrowth();
    await loadDemographics();
    await loadGenderDistribution();
    
    // Load metropolitan market data
    await loadMetropolitanMarkets();
    await loadMarketSizeByState();
    
    // Load regional data
    await loadRegions();
    await loadGrowthRatesByRegion();
    await loadProceduresByRegion();
    await loadDemographicsByRegion();
    
    // Load provider data
    await loadTopProviders();
    
    // Load companies data
    await loadCompaniesData();
    
    console.log('All data successfully loaded to Supabase!');
    return { success: true, message: 'All data successfully loaded to Supabase!' };
  } catch (error) {
    console.error('Error loading data to Supabase:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Load categories to Supabase
 */
const loadCategories = async () => {
  console.log('Loading consolidated categories...');
  
  // Upsert dental categories
  for (const category of dentalCategories) {
    const { error } = await supabase
      .from('categories')
      .upsert(
        { industry: 'dental', category_label: category, position: 0 },
        { onConflict: ['industry', 'category_label'] }
      );
    if (error) throw error;
  }
  // Upsert aesthetic categories
  for (const category of aestheticCategories) {
    const { error } = await supabase
      .from('aesthetic_categories')
      .upsert(
        { name: category },
        { onConflict: 'name' }
      );
    if (error) throw error;
  }
  console.log('Consolidated categories loaded successfully!');
};

/**
 * Load procedures to Supabase
 */
const loadProcedures = async () => {
  console.log('Loading procedures...');
  
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
      .upsert({
        procedure_name: procedure.name,
        category_id: dentalCategoryMap[procedure.category],
        yearly_growth_percentage: procedure.growth,
        market_size_2025_usd_millions: procedure.marketSize2025,
        age_range: procedure.primaryAgeGroup,
        recent_trends: procedure.trends,
        future_outlook: procedure.futureOutlook
      }, { onConflict: 'procedure_name' });
    
    if (error) throw error;
  }
  
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
  
  console.log('Procedures loaded successfully!');
};

/**
 * Load market growth data to Supabase
 */
const loadMarketGrowth = async () => {
  console.log('Loading market growth data...');
  
  // Insert dental market growth data
  for (const growth of dentalMarketGrowth) {
    const isProjected = growth.year >= 2025;
    
    const { error } = await supabase
      .from('dental_market_growth')
      .upsert({
        year: growth.year,
        size: growth.size,
        is_projected: isProjected
      }, { onConflict: 'year' });
    
    if (error) throw error;
  }
  
  // Insert aesthetic market growth data
  for (const growth of aestheticMarketGrowth) {
    const isProjected = growth.year >= 2025;
    
    const { error } = await supabase
      .from('aesthetic_market_growth')
      .upsert({
        year: growth.year,
        size: growth.size,
        is_projected: isProjected
      }, { onConflict: 'year' });
    
    if (error) throw error;
  }
  
  console.log('Market growth data loaded successfully!');
};

/**
 * Load demographics data to Supabase
 */
const loadDemographics = async () => {
  console.log('Loading demographics data...');
  
  // Insert dental demographics data
  for (const demographic of dentalDemographics) {
    const { error } = await supabase
      .from('dental_demographics')
      .upsert({
        age_group: demographic.ageGroup,
        percentage: demographic.percentage
      }, { onConflict: 'age_group' });
    
    if (error) throw error;
  }
  
  // Insert aesthetic demographics data
  for (const demographic of aestheticDemographics) {
    const { error } = await supabase
      .from('aesthetic_demographics')
      .upsert({
        age_group: demographic.ageGroup,
        percentage: demographic.percentage
      }, { onConflict: 'age_group' });
    
    if (error) throw error;
  }
  
  console.log('Demographics data loaded successfully!');
};

/**
 * Load gender distribution data to Supabase
 */
const loadGenderDistribution = async () => {
  console.log('Loading gender distribution data...');
  
  // Insert dental gender distribution data
  for (const gender of dentalGenderDistribution) {
    const { error } = await supabase
      .from('dental_gender_distribution')
      .upsert({
        name: gender.name,
        value: gender.value
      }, { onConflict: 'name' });
    
    if (error) throw error;
  }
  
  // Insert aesthetic gender distribution data
  for (const gender of aestheticGenderDistribution) {
    const { error } = await supabase
      .from('aesthetic_gender_distribution')
      .upsert({
        name: gender.name,
        value: gender.value
      }, { onConflict: 'name' });
    
    if (error) throw error;
  }
  
  console.log('Gender distribution data loaded successfully!');
};

/**
 * Load metropolitan markets data to Supabase
 */
const loadMetropolitanMarkets = async () => {
  console.log('Loading metropolitan markets data...');
  
  for (const market of metropolitanMarkets) {
    const { error } = await supabase
      .from('metropolitan_markets')
      .upsert({
        rank: market.rank,
        metro: market.metro,
        market_size_2023: market.marketSize2023,
        market_size_2030: market.marketSize2030,
        growth_rate: market.growthRate,
        key_procedures: market.keyProcedures,
        provider_density: market.providerDensity,
        insurance_coverage: market.insuranceCoverage,
        disposable_income: market.disposableIncome
      }, { onConflict: 'metro' });
    
    if (error) throw error;
  }
  
  console.log('Metropolitan markets data loaded successfully!');
};

/**
 * Load market size by state data to Supabase
 */
const loadMarketSizeByState = async () => {
  console.log('Loading market size by state data...');
  
  for (const state of marketSizeByState) {
    const { error } = await supabase
      .from('market_size_by_state')
      .upsert({
        state: state.state,
        value: state.value,
        label: state.label
      }, { onConflict: 'state' });
    
    if (error) throw error;
  }
  
  console.log('Market size by state data loaded successfully!');
};

/**
 * Load regions data to Supabase
 */
const loadRegions = async () => {
  console.log('Loading regions data...');
  
  // Extract unique region names from demographicsByRegion
  const regions = demographicsByRegion.map(region => region.region);
  
  for (const region of regions) {
    const { error } = await supabase
      .from('regions')
      .upsert({
        name: region
      }, { onConflict: 'name' });
    
    if (error) throw error;
  }
  
  console.log('Regions data loaded successfully!');
};

/**
 * Load growth rates by region data to Supabase
 */
const loadGrowthRatesByRegion = async () => {
  console.log('Loading growth rates by region data...');
  
  for (const region of growthRatesByRegion) {
    const { error } = await supabase
      .from('growth_rates_by_region')
      .upsert({
        region: region.region,
        growth: region.growth
      }, { onConflict: 'region' });
    
    if (error) throw error;
  }
  
  console.log('Growth rates by region data loaded successfully!');
};

/**
 * Load procedures by region data to Supabase
 */
const loadProceduresByRegion = async () => {
  console.log('Loading procedures by region data...');
  
  // Get regions to find IDs
  const { data: regionsData, error: regionsError } = await supabase
    .from('regions')
    .select('id, name');
  
  if (regionsError) throw regionsError;
  
  // Create a mapping of region names to IDs
  const regionMap = {};
  regionsData.forEach(region => {
    regionMap[region.name] = region.id;
  });
  
  // Insert procedures by region
  for (const region of proceduresByRegion) {
    const regionId = regionMap[region.region];
    
    for (const procedure of region.procedures) {
      const { error } = await supabase
        .from('procedures_by_region')
        .upsert({
          region_id: regionId,
          name: procedure.name,
          percentage: procedure.percentage
        });
      
      if (error) throw error;
    }
  }
  
  console.log('Procedures by region data loaded successfully!');
};

/**
 * Load demographics by region data to Supabase
 */
const loadDemographicsByRegion = async () => {
  console.log('Loading demographics by region data...');
  
  // Get regions to find IDs
  const { data: regionsData, error: regionsError } = await supabase
    .from('regions')
    .select('id, name');
  
  if (regionsError) throw regionsError;
  
  // Create a mapping of region names to IDs
  const regionMap = {};
  regionsData.forEach(region => {
    regionMap[region.name] = region.id;
  });
  
  // Insert demographics by region
  for (const region of demographicsByRegion) {
    const regionId = regionMap[region.region];
    
    // Insert age groups
    for (const ageGroup of region.ageGroups) {
      const { error: ageGroupError } = await supabase
        .from('demographics_by_region')
        .upsert({
          region_id: regionId,
          age_group: ageGroup.group,
          percentage: ageGroup.percentage
        });
      
      if (ageGroupError) throw ageGroupError;
    }
    
    // Insert gender split
    const { error: genderError } = await supabase
      .from('gender_split_by_region')
      .upsert({
        region_id: regionId,
        male: region.genderSplit.male,
        female: region.genderSplit.female,
        income_level: region.incomeLevel
      });
    
    if (genderError) throw genderError;
  }
  
  console.log('Demographics by region data loaded successfully!');
};

/**
 * Load top providers data to Supabase
 */
const loadTopProviders = async () => {
  console.log('Loading top providers data...');
  
  for (const marketData of topProvidersByMarket) {
    for (const provider of marketData.providers) {
      const { error } = await supabase
        .from('top_providers')
        .upsert({
          market: marketData.market,
          provider_name: provider.name,
          provider_type: provider.type,
          market_share: provider.marketShare
        });
      
      if (error) throw error;
    }
  }
  
  console.log('Top providers data loaded successfully!');
};

/**
 * Load dental and aesthetic companies to Supabase
 */
const loadCompaniesData = async () => {
  console.log('Loading companies data...');
  
  // Load dental companies
  for (const company of dentalCompanies) {
    const { error } = await supabase
      .from('companies')
      .upsert({
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
      }, { onConflict: 'name' });
    
    if (error) throw error;
  }
  
  // Load aesthetic companies
  for (const company of aestheticCompanies) {
    const { error } = await supabase
      .from('companies')
      .upsert({
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
      }, { onConflict: 'name' });
    
    if (error) throw error;
  }
  
  console.log('Companies data loaded successfully!');
};

// Function to check if data is already loaded
export const checkDataLoaded = async () => {
  const { count: dentalProceduresCount, error: dentalProceduresError } = await supabase
    .from('dental_procedures')
    .select('*', { count: 'exact', head: true });
  
  if (dentalProceduresError) throw dentalProceduresError;
  
  return dentalProceduresCount > 0;
};
