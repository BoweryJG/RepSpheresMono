/**
 * Backend Service
 * 
 * This service provides methods for interacting with the backend API
 * at https://osbackend-zl1h.onrender.com. It handles fetching data
 * and transforming responses to be used in the application.
 */

import apiService from './apiService';
import marketInsightsApiService from './marketInsightsApiService';

/**
 * Backend Service with methods for different data fetching operations
 */
export const backendService = {
  /**
   * Check if the backend service is available
   * @returns {Promise<boolean>} - True if backend is reachable
   */
  async checkConnection() {
    return await apiService.checkConnection();
  },

  /**
   * Fetch procedures from the backend
   * @param {string} industry - 'dental' or 'aesthetic'
   * @param {Object} options - Optional parameters
   * @returns {Promise<Array>} - Array of procedures
   */
  async getProcedures(industry, options = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (options.limit) queryParams.append('limit', options.limit);
      if (options.category) queryParams.append('category', options.category);
      
      const endpoint = `/procedures?industry=${industry}&${queryParams.toString()}`;
      return await apiService.get(endpoint);
    } catch (error) {
      console.error('Error fetching procedures from backend:', error);
      throw error;
    }
  },

  /**
   * Fetch categories from the backend
   * @param {string} industry - 'dental' or 'aesthetic'
   * @returns {Promise<Array>} - Array of category names
   */
  async getCategories(industry) {
    try {
      const endpoint = `/categories?industry=${industry}`;
      return await apiService.get(endpoint);
    } catch (error) {
      console.error('Error fetching categories from backend:', error);
      throw error;
    }
  },

  /**
   * Fetch companies from the backend
   * @param {string} industry - 'dental' or 'aesthetic'
   * @param {Object} options - Optional parameters
   * @returns {Promise<Array>} - Array of companies
   */
  async getCompanies(industry, options = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (options.limit) queryParams.append('limit', options.limit);
      if (options.sort) queryParams.append('sort', options.sort);
      
      const endpoint = `/companies?industry=${industry}&${queryParams.toString()}`;
      return await apiService.get(endpoint);
    } catch (error) {
      console.error('Error fetching companies from backend:', error);
      throw error;
    }
  },

  /**
   * Fetch news articles from the backend
   * @param {string} industry - 'dental' or 'aesthetic'
   * @param {Object} options - Optional parameters
   * @returns {Promise<Array>} - Array of news articles
   */
  async getNews(industry, options = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (options.limit) queryParams.append('limit', options.limit);
      if (options.category) queryParams.append('category', options.category);
      if (options.source) queryParams.append('source', options.source);
      if (options.featured) queryParams.append('featured', options.featured);
      
      const endpoint = `/news?industry=${industry}&${queryParams.toString()}`;
      return await apiService.get(endpoint);
    } catch (error) {
      console.error('Error fetching news from backend:', error);
      throw error;
    }
  },

  /**
   * Fetch market growth data from the backend
   * @param {string} industry - 'dental' or 'aesthetic'
   * @returns {Promise<Array>} - Array of market growth data
   */
  async getMarketGrowth(industry) {
    try {
      const endpoint = `/market-growth?industry=${industry}`;
      return await apiService.get(endpoint);
    } catch (error) {
      console.error('Error fetching market growth from backend:', error);
      throw error;
    }
  },

  /**
   * Fetch demographics data from the backend
   * @param {string} industry - 'dental' or 'aesthetic'
   * @returns {Promise<Array>} - Array of demographics data
   */
  async getDemographics(industry) {
    try {
      const endpoint = `/demographics?industry=${industry}`;
      return await apiService.get(endpoint);
    } catch (error) {
      console.error('Error fetching demographics from backend:', error);
      throw error;
    }
  },

  /**
   * Fetch metropolitan markets data from the backend
   * @returns {Promise<Array>} - Array of metropolitan market data
   */
  async getMetropolitanMarkets() {
    try {
      const endpoint = '/metropolitan-markets';
      return await apiService.get(endpoint);
    } catch (error) {
      console.error('Error fetching metropolitan markets from backend:', error);
      throw error;
    }
  },

  /**
   * Store market insights data for a user
   * @param {string} userId - User identifier (email or ID)
   * @param {Object} data - Market insights data to store
   * @returns {Promise<Object>} - Promise that resolves to the response data
   */
  async storeMarketInsights(userId, data) {
    try {
      return await marketInsightsApiService.storeMarketInsights(userId, data);
    } catch (error) {
      console.error('Error storing market insights data:', error);
      throw error;
    }
  },

  /**
   * Retrieve market insights data for a user
   * @param {string} userId - User identifier (email or ID)
   * @returns {Promise<Object>} - Promise that resolves to the market insights data
   */
  async getMarketInsights(userId) {
    try {
      return await marketInsightsApiService.getMarketInsights(userId);
    } catch (error) {
      console.error('Error retrieving market insights data:', error);
      throw error;
    }
  },

  /**
   * Check if the user has access to specific modules
   * @returns {Promise<Object>} - Promise that resolves to the module access status
   */
  async checkModuleAccess() {
    try {
      return await marketInsightsApiService.checkModuleAccess();
    } catch (error) {
      console.error('Error checking module access:', error);
      // Always return true as specified in the requirements
      return { access: true };
    }
  }
};

export default backendService;
