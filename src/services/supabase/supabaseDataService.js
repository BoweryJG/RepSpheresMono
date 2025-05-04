import { supabase } from './supabaseClient';
import { loadAllDataToSupabase, checkDataLoaded } from './dataLoader';

/**
 * Class to fetch market insight data from Supabase
 */
class SupabaseDataService {
  
  /**
   * Initialize the service by checking if data is loaded, and loading it if not
   */
  async initialize() {
    try {
      const isDataLoaded = await checkDataLoaded();
      
      if (!isDataLoaded) {
        console.log('Data not found in Supabase, loading it now...');
        await loadAllDataToSupabase();
      } else {
        console.log('Data already loaded in Supabase');
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error initializing Supabase data service:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Get dental procedures
   */
  async getDentalProcedures() {
    try {
      const { data, error } = await supabase
        .from('dental_procedures')
        .select(`
          id,
          name,
          growth,
          market_size_2025,
          primary_age_group,
          trends,
          future_outlook,
          dental_categories(name)
        `);
      
      if (error) throw error;
      
      // Transform data to match original structure
      return data.map(proc => ({
        name: proc.name,
        category: proc.dental_categories.name,
        growth: proc.growth,
        marketSize2025: proc.market_size_2025,
        primaryAgeGroup: proc.primary_age_group,
        trends: proc.trends,
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
      const { data, error } = await supabase
        .from('aesthetic_procedures')
        .select(`
          id,
          name,
          growth,
          market_size_2025,
          primary_age_group,
          trends,
          future_outlook,
          aesthetic_categories(name)
        `);
      
      if (error) throw error;
      
      // Transform data to match original structure
      return data.map(proc => ({
        name: proc.name,
        category: proc.aesthetic_categories.name,
        growth: proc.growth,
        marketSize2025: proc.market_size_2025,
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
      const { data, error } = await supabase
        .from('dental_categories')
        .select('name');
      
      if (error) throw error;
      
      // Transform to simple array of category names
      return data.map(category => category.name);
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
      const { data, error } = await supabase
        .from('aesthetic_categories')
        .select('name');
      
      if (error) throw error;
      
      // Transform to simple array of category names
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
      // First get all regions
      const { data: regionsData, error: regionsError } = await supabase
        .from('regions')
        .select('id, name');
      
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
      // First get all regions
      const { data: regionsData, error: regionsError } = await supabase
        .from('regions')
        .select('id, name');
      
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
}

export const supabaseDataService = new SupabaseDataService();
