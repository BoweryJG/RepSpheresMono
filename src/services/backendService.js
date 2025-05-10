/**
 * Backend Service
 * 
 * This service provides methods for interacting with the backend API
 * at https://osbackend-zl1h.onrender.com. It handles fetching data
 * and transforming responses to be used in the application.
 */

import apiService from './apiService';

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
  }
};

export default backendService;
