import { supabase } from './supabaseClient.js';
import { loadAllDataToSupabase, checkDataLoaded } from './dataLoader.js';
import { getCurrentSession, signInWithEmail } from './supabaseAuth.js';
import { runFullVerification, checkTables } from './verifySupabaseData.js';

/**
 * Class to fetch market insight data from Supabase
 */
class SupabaseDataService {
  constructor() {
    this.isAuthenticated = false;
    this.dataVerified = false;
    this.lastVerification = null;
    this.verificationResult = null;
  }

  /**
   * Ensure authentication before making data requests
   * @returns {Promise<boolean>} Authentication status
   */
  async ensureAuthentication() {
    try {
      // First check if we already have a session
      const sessionResult = await getCurrentSession();
      if (sessionResult.success && sessionResult.session) {
        this.isAuthenticated = true;
        return true;
      }
      
      // Try automatic login with environment variables
      if (import.meta.env.VITE_SUPABASE_USER && import.meta.env.VITE_SUPABASE_PASSWORD) {
        const loginResult = await signInWithEmail(
          import.meta.env.VITE_SUPABASE_USER,
          import.meta.env.VITE_SUPABASE_PASSWORD
        );
        
        if (loginResult.success) {
          this.isAuthenticated = true;
          console.log('Auto-authenticated with Supabase');
          return true;
        }
      }
      
      // Not authenticated, but we'll continue anyway with reduced functionality
      console.warn('Not authenticated with Supabase - some operations may fail');
      return false;
    } catch (error) {
      console.error('Authentication check failed:', error);
      return false;
    }
  }

  /**
   * Initialize the Supabase data service
   * Enhanced for Netlify deployment with better error handling and production support
   * @returns {Promise<{success: boolean, error?: string, verificationResult?: object}>}
   */
  async initialize() {
    try {
      // Determine environment
      const isProduction = typeof import.meta !== 'undefined' && 
                           import.meta.env && 
                           import.meta.env.PROD === true;
      
      const isNetlify = typeof import.meta !== 'undefined' && 
                        import.meta.env && 
                        import.meta.env.NETLIFY === 'true';
                        
      console.log(`[Supabase Service] Initializing in ${isProduction ? 'production' : 'development'} mode. ${isNetlify ? '(Netlify)' : ''}`);

      // Try to authenticate first
      const authResult = await this.ensureAuthentication();
      console.log(`[Supabase Service] Authentication ${authResult ? 'successful' : 'skipped'}`);

      // Enhanced verification process for production environments
      if (isProduction) {
        console.log('[Supabase Service] Production initialization process starting');
        
        // For production, first check basic connectivity
        try {
          const { data, error } = await supabase.from('dental_procedures_simplified').select('count', { count: 'exact', head: true });
          if (error) {
            throw new Error(`Connection error: ${error.message}`);
          }
          console.log('[Supabase Service] Basic connectivity check passed');
        } catch (connErr) {
          console.error('[Supabase Service] Basic connectivity check failed:', connErr.message);
          
          // In production, log but don't fail so UI can still load
          this.dataVerified = false;
          return { 
            success: false, 
            error: `Supabase connection failed: ${connErr.message}`,
            inProduction: true
          };
        }

        // In production (especially Netlify), try a lightweight verification approach
        console.log('[Supabase Service] Running lightweight verification for production');
        
        // Perform a simple schema check rather than full verification
        const simpleVerification = await this.lightweightVerification();
        
        if (!simpleVerification.success) {
          console.warn('[Supabase Service] Production verification warning:', simpleVerification.message);
          // Continue anyway but with a warning - we'll try to display whatever data is available
        }
        
        this.dataVerified = true;
        console.log('[Supabase Service] Production initialization complete');
        return { 
          success: true, 
          message: 'Supabase service initialized for production',
          verificationResult: simpleVerification
        };
      }

      // Regular verification for development environments
      console.log('[Supabase Service] Running full verification for development');
      const verificationResult = await runFullVerification();
      this.verificationResult = verificationResult;
      this.lastVerification = new Date();
      
      // If verification failed due to connection issues, bail early
      if (!verificationResult.connection.success) {
        console.error('[Supabase Service] Connection verification failed:', verificationResult.connection.error);
        return { 
          success: false, 
          error: 'Could not connect to Supabase database', 
          verificationResult 
        };
      }
      
      console.log('[Supabase Service] Connection verified. Checking data availability...');
      
      // Check if data is already loaded
      const isDataAlreadyLoaded = await checkDataLoaded();
      
      if (!isDataAlreadyLoaded) {
        console.log('[Supabase Service] Data not loaded yet. Setting up schema and loading data...');
        // Setup schema and load data
        await this.setupSchema();
        await loadAllDataToSupabase();
        
        // Verify again after loading
        const postLoadVerification = await checkTables();
        if (!postLoadVerification.success) {
          console.warn('[Supabase Service] Some tables still missing after data load:', postLoadVerification.tables);
        }
      } else {
        console.log('[Supabase Service] Data already loaded in Supabase');
      }
      
      console.log('[Supabase Service] Development initialization complete');
      this.dataVerified = true;

      return { 
        success: true, 
        message: 'Supabase data service initialized successfully', 
        verificationResult 
      };
    } catch (error) {
      console.error('[Supabase Service] Error during initialization:', error);
      // For production environments, try to continue despite errors
      const isProduction = typeof import.meta !== 'undefined' && 
                           import.meta.env && 
                           import.meta.env.PROD === true;
                           
      if (isProduction) {
        this.dataVerified = false;
        console.warn('[Supabase Service] Continuing in production despite initialization error');
        return { 
          success: false, 
          error: `Initialization error (continuing anyway): ${error.message}`,
          verificationResult: this.verificationResult,
          inProduction: true
        };
      }
      
      return { 
        success: false, 
        error: error.message,
        verificationResult: this.verificationResult
      };
    }
  }
  
  /**
   * Lightweight verification for production environments
   * Especially useful for Netlify where full verification might fail
   * @returns {Promise<{success: boolean, message: string, tables: object}>}
   */
  async lightweightVerification() {
    try {
      // List of critical tables to check
      const criticalTables = [
        'dental_procedures_simplified',
        'companies',
        'aesthetic_procedures'
      ];
      
      const tableResults = {};
      let overallSuccess = true;
      
      // Check each critical table
      for (const table of criticalTables) {
        try {
          const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });
            
          if (error) {
            tableResults[table] = { exists: false, error: error.message };
            overallSuccess = false;
          } else {
            tableResults[table] = { exists: true, count };
          }
        } catch (err) {
          tableResults[table] = { exists: false, error: err.message };
          overallSuccess = false;
        }
      }
      
      return {
        success: overallSuccess,
        message: overallSuccess ? 
          'All critical tables verified' : 
          'Some critical tables are missing or inaccessible',
        tables: tableResults
      };
    } catch (error) {
      console.error('[Supabase Service] Error during lightweight verification:', error);
      return {
        success: false,
        message: `Verification error: ${error.message}`,
        tables: {}
      };
    }
  }

  /**
   * Setup the database schema using direct Supabase calls
   * This is a browser-compatible version that doesn't rely on child_process
   */
  async setupSchema() {
    try {
      console.log('Setting up Supabase schema in browser environment...');
      
      // In browser environments, we'll use a simplified approach to check table existence
      // No exec or child_process available in browser
      
      // Check if news_articles table exists as a simple test
      const { count, error } = await supabase
        .from('news_articles')
        .select('*', { count: 'exact', head: true });
        
      if (error) {
        console.warn('Schema might not be fully set up:', error.message);
        // Continue anyway - we'll still try to use the tables that do exist
      } else {
        console.log('Schema appears to be already set up.');
      }
      
      return true;
    } catch (error) {
      console.error('Error during schema setup:', error);
      // Don't throw the error - return success anyway to allow the app to continue
      // This will let the app work with whatever tables do exist
      return true;
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
        .from('dental_procedures_simplified')
        .select('*');
      if (procError) throw procError;
      
      if (!procedures || procedures.length === 0) {
        console.warn('No dental procedures found in database');
        return [];
      }
      
      // Fetch categories
      const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('id, category_label')
        .eq('industry', 'dental')
        .order('position', { ascending: true });
      if (catError) throw catError;
      
      // Map category_id to category name
      const categoryMap = Object.fromEntries(categories.map(cat => [cat.id, cat.category_label]));
      return procedures.map(proc => ({
        name: proc.name, // Using 'name' instead of 'procedure_name'
        category: proc.category || categoryMap[proc.category_id] || '', // Try direct category field first
        growth: proc.yearly_growth_percentage,
        marketSize2025: proc.market_size_2025_usd_millions,
        primaryAgeGroup: "All Ages", // Default value since field doesn't exist
        trends: proc.description || "No trend data available", // Using description as trends
        futureOutlook: "Growth potential"
      }));
    } catch (error) {
      console.error('Error fetching dental procedures:', error);
      // Return empty array instead of throwing to prevent UI crash
      return [];
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
      
      if (!procedures || procedures.length === 0) {
        console.warn('No aesthetic procedures found in database');
        return [];
      }
      
      // Fetch categories
      const { data: categories, error: catError } = await supabase
        .from('aesthetic_categories')
        .select('id, category_label');
      if (catError) throw catError;
      
      // Map category_id to category name
      const categoryMap = Object.fromEntries(categories.map(cat => [cat.id, cat.category_label]));
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
      // Return empty array instead of throwing to prevent UI crash
      return [];
    }
  }
  
  /**
   * Get dental categories
   */
  async getDentalCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('category_label')
        .eq('industry', 'dental')
        .order('position', { ascending: true });
      
      if (error) throw error;
      
      return data.map(category => category.category_label);
    } catch (error) {
      console.error('Error fetching dental categories:', error); 
      return [];
    }
  }
  
  /**
   * Get aesthetic categories
   */
  async getAestheticCategories() {
    try {
      const { data, error } = await supabase
        .from('aesthetic_categories')
        .select('category_label');
      
      if (error) throw error;
      
      return data.map(category => category.category_label);
    } catch (error) {
      console.error('Error fetching aesthetic categories:', error); 
      return [];
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
      
      return data.map(growth => ({
        year: growth.year,
        size: growth.size
      }));
    } catch (error) {
      console.error('Error fetching dental market growth:', error);
      return [];
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
      
      return data.map(growth => ({
        year: growth.year,
        size: growth.size
      }));
    } catch (error) {
      console.error('Error fetching aesthetic market growth:', error);
      return [];
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
      
      return data.map(demo => ({
        ageGroup: demo.age_group,
        percentage: demo.percentage
      }));
    } catch (error) {
      console.error('Error fetching dental demographics:', error);
      return [];
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
      
      return data.map(demo => ({
        ageGroup: demo.age_group,
        percentage: demo.percentage
      }));
    } catch (error) {
      console.error('Error fetching aesthetic demographics:', error);
      return [];
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
      
      return data;
    } catch (error) {
      console.error('Error fetching dental gender distribution:', error);
      return [];
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
      
      return data;
    } catch (error) {
      console.error('Error fetching aesthetic gender distribution:', error);
      return [];
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
      return [];
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
      
      return data;
    } catch (error) {
      console.error('Error fetching market size by state:', error);
      return [];
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
      
      return data;
    } catch (error) {
      console.error('Error fetching growth rates by region:', error);
      return [];
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
      return [];
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
      return [];
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
      return [];
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
      return [];
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
      return [];
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
      return [];
    }
  }
  
  /**
   * Verify data integrity and reload if necessary
   * @returns {Promise<boolean>} Success status
   */
  async verifyAndReloadDataIfNeeded() {
    try {
      console.log('Verifying data integrity...');
      
      // Run verification check
      const verificationResult = await runFullVerification();
      this.verificationResult = verificationResult;
      this.lastVerification = new Date();
      
      if (!verificationResult.success) {
        console.warn('Data verification failed, attempting to reload data...');
        
        // Try to reload all data
        await loadAllDataToSupabase();
        
        // Verify again after reloading
        const reVerificationResult = await runFullVerification();
        if (!reVerificationResult.success) {
          console.error('Data still invalid after reload attempt');
          return false;
        }
        
        console.log('Data successfully reloaded');
        return true;
      }
      
      console.log('Data verification passed');
      return true;
    } catch (error) {
      console.error('Error during data verification and reload:', error);
      return false;
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
