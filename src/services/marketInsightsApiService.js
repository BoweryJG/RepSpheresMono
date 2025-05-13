/**
 * Market Insights API Service
 * 
 * This service provides methods for interacting with the market insights API endpoints
 * on the Render backend at https://osbackend-zl1h.onrender.com.
 * It handles storing and retrieving market data, as well as module access checks.
 */

import apiService from './apiService';
import { API_CONFIG } from './config';

/**
 * Market Insights API Service with methods for different data operations
 */
export const marketInsightsApiService = {
  /**
   * Store market insights data for a user
   * @param {string} userId - User identifier (email or ID)
   * @param {Object} data - Market insights data to store
   * @returns {Promise<Object>} - Promise that resolves to the response data
   */
  async storeMarketInsights(userId, data) {
    try {
      return await apiService.post('/api/data/market_insights', {
        userId: userId,
        data: data
      });
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
      return await apiService.get(`/api/data/market_insights?userId=${userId}`);
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
      return await apiService.get('/api/modules/access');
    } catch (error) {
      console.error('Error checking module access:', error);
      // Always return true as specified in the requirements
      return { access: true };
    }
  },

  /**
   * Direct method to store market insights data using fetch
   * This method bypasses the apiService for direct access if needed
   * @param {string} userId - User identifier (email or ID)
   * @param {Object} data - Market insights data to store
   * @returns {Promise<Response>} - Promise that resolves to the fetch response
   */
  async directStoreMarketInsights(userId, data) {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.MARKET_INSIGHTS_ENDPOINT}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          data: data
        })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} - ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error directly storing market insights data:', error);
      throw error;
    }
  },

  /**
   * Direct method to retrieve market insights data using fetch
   * This method bypasses the apiService for direct access if needed
   * @param {string} userId - User identifier (email or ID)
   * @returns {Promise<Object>} - Promise that resolves to the market insights data
   */
  async directGetMarketInsights(userId) {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.MARKET_INSIGHTS_ENDPOINT}?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} - ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error directly retrieving market insights data:', error);
      throw error;
    }
  },

  /**
   * Direct method to check module access using fetch
   * This method bypasses the apiService for direct access if needed
   * @returns {Promise<Object>} - Promise that resolves to the module access status
   */
  async directCheckModuleAccess() {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.MODULE_ACCESS_ENDPOINT}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} - ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error directly checking module access:', error);
      // Always return true as specified in the requirements
      return { access: true };
    }
  }
};

export default marketInsightsApiService;
