import { supabase } from './supabaseClient';
import { loadAllDataToSupabase, checkDataLoaded } from './dataLoader';

/**
 * Class to fetch market insight data from Supabase
 */
class SupabaseDataService {
  constructor() {
    // No MCP flag needed
  }
  
  /**
   * Initialize the service by checking if data is loaded, and loading it if not
   */
  async initialize() {
    try {
      console.log('Initializing Supabase Data Service...');
      
      // Try to check if data is loaded
      try {
        const isDataLoaded = await checkDataLoaded();
        
        if (!isDataLoaded) {
          console.log('Data not found in Supabase, attempting to load it now...');
          
          // First try to set up the schema
          console.log('Setting up database schema...');
          await this.setupSchema();
          
          // Then load the data
          console.log('Loading data to Supabase tables...');
          await loadAllDataToSupabase();
          
          console.log('Data loaded successfully!');
        } else {
          console.log('Data already loaded in Supabase');
        }
      } catch (dataError) {
        console.error('Error checking/loading data:', dataError);
        console.log('Will proceed with direct connection anyway.');
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error initializing Supabase data service:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Setup the database schema using the SQL script
   */
  async setupSchema() {
    try {
      console.log('Setting up Supabase schema...');
      
      // Execute schema setup command (expects setupSchema.js to be available)
      const { exec } = await import('child_process');
      
      return new Promise((resolve, reject) => {
        exec('npm run setup-schema', (error, stdout, stderr) => {
          if (error) {
            console.error('Error setting up schema:', error);
            console.error(stderr);
            reject(error);
            return;
          }
          
          console.log('Schema setup output:', stdout);
          resolve(true);
        });
      });
    } catch (error) {
      console.error('Error during schema setup:', error);
      throw error;
    }
  }
  
  /**
   * Get dental procedures
   */
  async getDentalProcedures() {
    try {
      // Direct Supabase connection
      // Fetch procedures
      const { data: procedures, error: procError } = await supabase
        .from('dental_procedures')
        .select('*');
      if (procError) throw procError;
      // Fetch categories
      const { data: categories, error: catError } = await supabase
        .from('dental_categories')
        .select('*');
      if (catError) throw catError;
      // Map category_id to category name
      const categoryMap = Object.fromEntries(categories.map(cat => [cat.id, cat.category_label]));
      return procedures.map(proc => ({
        name: proc.procedure_name,
        category: categoryMap[proc.category_id] || '',
        growth: proc.yearly_growth_percentage,
        marketSize2025: proc.market_size_2025_usd_millions,
        primaryAgeGroup: proc.age_range,
        trends: proc.recent_trends,
        futureOutlook: proc.future_outlook
      }));
    } catch (error) {
      console.error('Error fetching dental procedures:', error);
      throw error;
    }
  }
  
  /**
   * Get aesthetic procedures
   */
  async getAestheticProcedures() {
    try {
      // Direct Supabase connection
      // Fetch procedures
      const { data: procedures, error: procError } = await supabase
        .from('aesthetic_procedures')
        .select('*');
      if (procError) throw procError;
      // Fetch categories
      const { data: categories, error: catError } = await supabase
        .from('aesthetic_categories')
        .select('*');
      if (catError) throw catError;
      // Map category_id to category name
      const categoryMap = Object.fromEntries(categories.map(cat => [cat.id, cat.name]));
      return procedures.map(proc => ({
        name: proc.name,
        category: categoryMap[proc.category_id] || '',
        growth: proc.yearly_growth_percentage,
        marketSize2025: proc.market_size_2025_usd_millions,
        primaryAgeGroup: proc.primary_age_group,
        trends: proc.trends,
        futureOutlook: proc.future_outlook
      }));
    } catch (error) {
      console.error('Error fetching aesthetic procedures:', error);
      throw error;
    }
  }
  
  /**
   * Get dental categories
   */
  async getDentalCategories() {
    try {
      // Direct Supabase connection
      const { data, error } = await supabase
        .from('dental_categories')
        .select('*');
      
      if (error) throw error;
      
      // Transform to simple array of category names for Dashboard.jsx
      return data.map(category => category.category_label);
    } catch (error) {
      console.error('Error fetching dental categories:', error); 
      throw error;
    }
  }
  
  /**
   * Get aesthetic categories
   */
  async getAestheticCategories() {
    try {
      // Direct Supabase connection
      const { data, error } = await supabase
        .from('aesthetic_categories')
        .select('*');
      
      if (error) throw error;
      
      // Transform to simple array of category names for Dashboard.jsx
      return data.map(category => category.name);
    } catch (error) {
      console.error('Error fetching aesthetic categories:', error); 
      throw error;
    }
  }
  
  /**
   * Get dental market growth data
   */
  async getDentalMarketGrowth() {
    try {
      // Direct Supabase connection
      const { data, error } = await supabase
        .from('dental_market_growth')
        .select('*')
        .order('year', { ascending: true });
      
      if (error) throw error;
      
      // Transform to match original structure
      return data.map(growth => ({
        year: growth.year,
        size: growth.size
      }));
    } catch (error) {
      console.error('Error fetching dental market growth:', error);
      throw error;
    }
  }
  
  /**
   * Get aesthetic market growth data
   */
  async getAestheticMarketGrowth() {
    try {
      // Direct Supabase connection
      const { data, error } = await supabase
        .from('aesthetic_market_growth')
        .select('*')
        .order('year', { ascending: true });
      
      if (error) throw error;
      
      // Transform to match original structure
      return data.map(growth => ({
        year: growth.year,
        size: growth.size
      }));
    } catch (error) {
      console.error('Error fetching aesthetic market growth:', error);
      throw error;
    }
  }
  
  /**
   * Get dental demographics
   */
  async getDentalDemographics() {
    try {
      // Direct Supabase connection
      const { data, error } = await supabase
        .from('dental_demographics')
        .select('*');
      
      if (error) throw error;
      
      // Transform to match original structure
      return data.map(demo => ({
        ageGroup: demo.age_group,
        percentage: demo.percentage
      }));
    } catch (error) {
      console.error('Error fetching dental demographics:', error);
      throw error;
    }
  }
  
  /**
   * Get aesthetic demographics
   */
  async getAestheticDemographics() {
    try {
      // Direct Supabase connection
      const { data, error } = await supabase
        .from('aesthetic_demographics')
        .select('*');
      
      if (error) throw error;
      
      // Transform to match original structure
      return data.map(demo => ({
        ageGroup: demo.age_group,
        percentage: demo.percentage
      }));
    } catch (error) {
      console.error('Error fetching aesthetic demographics:', error);
      throw error;
    }
  }
  
  /**
   * Get dental gender distribution
   */
  async getDentalGenderDistribution() {
    try {
      // Direct Supabase connection
      const { data, error } = await supabase
        .from('dental_gender_distribution')
        .select('*');
      
      if (error) throw error;
      
      // Return as is since structure matches
      return data;
    } catch (error) {
      console.error('Error fetching dental gender distribution:', error);
      throw error;
    }
  }
  
  /**
   * Get aesthetic gender distribution
   */
  async getAestheticGenderDistribution() {
    try {
      // Direct Supabase connection
      const { data, error } = await supabase
        .from('aesthetic_gender_distribution')
        .select('*');
      
      if (error) throw error;
      
      // Return as is since structure matches
      return data;
    } catch (error) {
      console.error('Error fetching aesthetic gender distribution:', error);
      throw error;
    }
  }
  
  /**
   * Get metropolitan markets
   */
  async getMetropolitanMarkets() {
    try {
      // Direct Supabase connection
      const { data, error } = await supabase
        .from('metropolitan_markets')
        .select('*')
        .order('rank', { ascending: true });
      
      if (error) throw error;
      
      // Transform to match original structure
      return data.map(market => ({
        rank: market.rank,
        metro: market.metro,
        marketSize2023: market.market_size_2023,
        marketSize2030: market.market_size_2030,
        growthRate: market.growth_rate,
        keyProcedures: market.key_procedures,
        providerDensity: market.provider_density,
        insuranceCoverage: market.insurance_coverage,
        disposableIncome: market.disposable_income
      }));
    } catch (error) {
      console.error('Error fetching metropolitan markets:', error);
      throw error;
    }
  }
  
  /**
   * Get market size by state
   */
  async getMarketSizeByState() {
    try {
      // Direct Supabase connection
      const { data, error } = await supabase
        .from('market_size_by_state')
        .select('*')
        .order('value', { ascending: false });
      
      if (error) throw error;
      
      // Return as is since structure matches
      return data;
    } catch (error) {
      console.error('Error fetching market size by state:', error);
      throw error;
    }
  }
  
  /**
   * Get growth rates by region
   */
  async getGrowthRatesByRegion() {
    try {
      // Direct Supabase connection
      const { data, error } = await supabase
        .from('growth_rates_by_region')
        .select('*');
      
      if (error) throw error;
      
      // Return as is since structure matches
      return data;
    } catch (error) {
      console.error('Error fetching growth rates by region:', error);
      throw error;
    }
  }
  
  /**
   * Get procedures by region
   */
  async getProceduresByRegion() {
    try {
      // Direct Supabase connection
      // First get all regions
      const { data: regionsData, error: regionsError } = await supabase
        .from('regions')
        .select('*');
      
      if (regionsError) throw regionsError;
      
      const result = [];
      
      // For each region, get its procedures
      for (const region of regionsData) {
        const { data: proceduresData, error: proceduresError } = await supabase
          .from('procedures_by_region')
          .select('name, percentage')
          .eq('region_id', region.id);
        
        if (proceduresError) throw proceduresError;
        
        result.push({
          region: region.name,
          procedures: proceduresData
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error fetching procedures by region:', error);
      throw error;
    }
  }
  
  /**
   * Get demographics by region
   */
  async getDemographicsByRegion() {
    try {
      // Direct Supabase connection
      // First get all regions
      const { data: regionsData, error: regionsError } = await supabase
        .from('regions')
        .select('*');
      
      if (regionsError) throw regionsError;
      
      const result = [];
      
      // For each region, get its demographics and gender split
      for (const region of regionsData) {
        // Get age groups
        const { data: demographicsData, error: demographicsError } = await supabase
          .from('demographics_by_region')
          .select('age_group, percentage')
          .eq('region_id', region.id);
        
        if (demographicsError) throw demographicsError;
        
        // Get gender split
        const { data: genderData, error: genderError } = await supabase
          .from('gender_split_by_region')
          .select('male, female, income_level')
          .eq('region_id', region.id)
          .single();
        
        if (genderError) throw genderError;
        
        result.push({
          region: region.name,
          ageGroups: demographicsData.map(demo => ({
            group: demo.age_group,
            percentage: demo.percentage
          })),
          genderSplit: {
            male: genderData.male,
            female: genderData.female
          },
          incomeLevel: genderData.income_level
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error fetching demographics by region:', error);
      throw error;
    }
  }
  
  /**
   * Get top providers by market
   */
  async getTopProvidersByMarket() {
    try {
      // Direct Supabase connection
      // Get unique markets
      const { data: marketsData, error: marketsError } = await supabase
        .from('top_providers')
        .select('market')
        .distinct();
      
      if (marketsError) throw marketsError;
      
      const result = [];
      
      // For each market, get its providers
      for (const marketObj of marketsData) {
        const market = marketObj.market;
        
        const { data: providersData, error: providersError } = await supabase
          .from('top_providers')
          .select('provider_name, provider_type, market_share')
          .eq('market', market);
        
        if (providersError) throw providersError;
        
        result.push({
          market,
          providers: providersData.map(provider => ({
            name: provider.provider_name,
            type: provider.provider_type,
            marketShare: provider.market_share
          }))
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error fetching top providers by market:', error);
      throw error;
    }
  }
  
  /**
   * Get dental companies
   */
  async getDentalCompanies() {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('industry', 'dental');
      
      if (error) throw error;
      
      // Transform the data to match expected format and parse JSON strings
      return data.map(company => ({
        ...company,
        marketShare: parseFloat(company.marketShare) || 0,
        growthRate: parseFloat(company.growthRate) || 0,
        keyOfferings: this._parseJsonField(company.keyOfferings, []),
        topProducts: this._parseJsonField(company.topProducts, []),
        timeInMarket: company.timeInMarket || 0
      }));
    } catch (error) {
      console.error('Error fetching dental companies:', error);
      throw error;
    }
  }
  
  /**
   * Get aesthetic companies
   */
  async getAestheticCompanies() {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('industry', 'aesthetic');
      
      if (error) throw error;
      
      // Transform the data to match expected format and parse JSON strings
      return data.map(company => ({
        ...company,
        marketShare: parseFloat(company.marketShare) || 0,
        growthRate: parseFloat(company.growthRate) || 0,
        keyOfferings: this._parseJsonField(company.keyOfferings, []),
        topProducts: this._parseJsonField(company.topProducts, []),
        timeInMarket: company.timeInMarket || 0
      }));
    } catch (error) {
      console.error('Error fetching aesthetic companies:', error);
      throw error;
    }
  }
  
  /**
   * Get all companies
   */
  async getAllCompanies() {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('industry', { ascending: true })
        .order('marketShare', { ascending: false });
      
      if (error) throw error;
      
      // Transform the data to match expected format and parse JSON strings
      return data.map(company => ({
        ...company,
        marketShare: parseFloat(company.marketShare) || 0,
        growthRate: parseFloat(company.growthRate) || 0,
        keyOfferings: this._parseJsonField(company.keyOfferings, []),
        topProducts: this._parseJsonField(company.topProducts, []),
        timeInMarket: company.timeInMarket || 0
      }));
    } catch (error) {
      console.error('Error fetching all companies:', error);
      throw error;
    }
  }
  
  /**
   * Helper method to parse JSON field with error handling
   * @param {string} jsonString - The JSON string to parse
   * @param {array} defaultValue - Default value if parsing fails
   * @returns {array} Parsed array or default value
   */
  _parseJsonField(jsonString, defaultValue = []) {
    if (!jsonString) return defaultValue;
    
    try {
      // Handle both string JSON and already parsed objects
      if (typeof jsonString === 'string') {
        return JSON.parse(jsonString);
      } else if (Array.isArray(jsonString)) {
        return jsonString;
      } else {
        console.warn('Expected JSON string or array, got:', typeof jsonString);
        return defaultValue;
      }
    } catch (error) {
      console.warn('Error parsing JSON field:', error);
      return defaultValue;
    }
  }
}

export const supabaseDataService = new SupabaseDataService();
