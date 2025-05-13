/**
 * Enhanced Market Insights API Service
 * 
 * This service provides methods for interacting with the market insights API endpoints
 * on the Render backend at https://osbackend-zl1h.onrender.com.
 * It includes improved error handling, retry logic, and a wake-up mechanism for the Render service.
 */

import apiService from './apiService';
import { API_CONFIG } from './config';

// Maximum number of retries for API calls
const MAX_RETRIES = 3;
// Delay between retries in milliseconds
const RETRY_DELAY = 1000;

/**
 * Sleep function for delay between retries
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Enhanced Market Insights API Service with methods for different data operations
 */
export const marketInsightsApiService = {
  /**
   * Wake up the Render service before making API calls
   * @returns {Promise<boolean>} - Promise that resolves to true if service is awake
   */
  async wakeUpService() {
    try {
      console.log('Attempting to wake up Render service...');
      const response = await fetch(`${API_CONFIG.BASE_URL}/health`, {
        timeout: API_CONFIG.TIMEOUT
      });
      
      if (response.ok) {
        console.log('Render service is awake');
        return true;
      } else {
        console.warn(`Render service returned status: ${response.status}`);
        return false;
      }
    } catch (error) {
      console.error('Error waking up Render service:', error);
      return false;
    }
  },

  /**
   * Store market insights data for a user with retry logic
   * @param {string} userId - User identifier (email or ID)
   * @param {Object} data - Market insights data to store
   * @param {number} retries - Number of retries (internal use)
   * @returns {Promise<Object>} - Promise that resolves to the response data
   */
  async storeMarketInsights(userId, data, retries = 0) {
    try {
      // Try to wake up the service first if this is the first attempt
      if (retries === 0) {
        await this.wakeUpService();
      }
      
      const response = await apiService.post('/api/data/market_insights', {
        userId: userId || 'anonymous',
        data: data || {}
      });
      
      return response;
    } catch (error) {
      console.error(`Error storing market insights data (attempt ${retries + 1}):`, error);
      
      // Retry logic
      if (retries < MAX_RETRIES) {
        console.log(`Retrying in ${RETRY_DELAY}ms...`);
        await sleep(RETRY_DELAY);
        return this.storeMarketInsights(userId, data, retries + 1);
      }
      
      // Return a safe default after all retries fail
      console.warn('All retries failed. Returning default empty response.');
      return { success: false, error: error.message };
    }
  },

  /**
   * Retrieve market insights data for a user with retry logic
   * @param {string} userId - User identifier (email or ID)
   * @param {number} retries - Number of retries (internal use)
   * @returns {Promise<Object>} - Promise that resolves to the market insights data
   */
  async getMarketInsights(userId, retries = 0) {
    try {
      // Try to wake up the service first if this is the first attempt
      if (retries === 0) {
        await this.wakeUpService();
      }
      
      const response = await apiService.get(`/api/data/market_insights?userId=${userId || 'anonymous'}`);
      
      // Add safety checks for undefined properties
      if (!response || !response.data) {
        console.warn('Received empty or invalid response from market insights API');
        return { data: {} };
      }
      
      return response;
    } catch (error) {
      console.error(`Error retrieving market insights data (attempt ${retries + 1}):`, error);
      
      // Retry logic
      if (retries < MAX_RETRIES) {
        console.log(`Retrying in ${RETRY_DELAY}ms...`);
        await sleep(RETRY_DELAY);
        return this.getMarketInsights(userId, retries + 1);
      }
      
      // Return a safe default after all retries fail
      console.warn('All retries failed. Returning default empty response.');
      return { data: {} };
    }
  },

  /**
   * Check if the user has access to specific modules with retry logic
   * @param {number} retries - Number of retries (internal use)
   * @returns {Promise<Object>} - Promise that resolves to the module access status
   */
  async checkModuleAccess(retries = 0) {
    try {
      // Try to wake up the service first if this is the first attempt
      if (retries === 0) {
        await this.wakeUpService();
      }
      
      // Try to get the module access status from the API
      const response = await apiService.get('/api/modules/access');
      
      // Add safety check for undefined properties
      if (!response) {
        console.warn('Received empty response from module access API');
        return { access: true };
      }
      
      return response;
    } catch (error) {
      console.error(`Error checking module access (attempt ${retries + 1}):`, error);
      
      // Retry logic
      if (retries < MAX_RETRIES) {
        console.log(`Retrying in ${RETRY_DELAY}ms...`);
        await sleep(RETRY_DELAY);
        return this.checkModuleAccess(retries + 1);
      }
      
      // Always return true as specified in the requirements
      console.warn('All retries failed. Returning default access: true');
      return { access: true };
    }
  },

  /**
   * Direct method to store market insights data using fetch with retry logic
   * This method bypasses the apiService for direct access if needed
   * @param {string} userId - User identifier (email or ID)
   * @param {Object} data - Market insights data to store
   * @param {number} retries - Number of retries (internal use)
   * @returns {Promise<Response>} - Promise that resolves to the fetch response
   */
  async directStoreMarketInsights(userId, data, retries = 0) {
    try {
      // Try to wake up the service first if this is the first attempt
      if (retries === 0) {
        await this.wakeUpService();
      }
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.MARKET_INSIGHTS_ENDPOINT}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId || 'anonymous',
          data: data || {}
        })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} - ${response.statusText}`);
      }
      
      const responseData = await response.json();
      
      // Add safety check for undefined properties
      if (!responseData) {
        console.warn('Received empty response from direct market insights API');
        return { success: true };
      }
      
      return responseData;
    } catch (error) {
      console.error(`Error directly storing market insights data (attempt ${retries + 1}):`, error);
      
      // Retry logic
      if (retries < MAX_RETRIES) {
        console.log(`Retrying in ${RETRY_DELAY}ms...`);
        await sleep(RETRY_DELAY);
        return this.directStoreMarketInsights(userId, data, retries + 1);
      }
      
      // Return a safe default after all retries fail
      console.warn('All retries failed. Returning default empty response.');
      return { success: false, error: error.message };
    }
  },

  /**
   * Direct method to retrieve market insights data using fetch with retry logic
   * This method bypasses the apiService for direct access if needed
   * @param {string} userId - User identifier (email or ID)
   * @param {number} retries - Number of retries (internal use)
   * @returns {Promise<Object>} - Promise that resolves to the market insights data
   */
  async directGetMarketInsights(userId, retries = 0) {
    try {
      // Try to wake up the service first if this is the first attempt
      if (retries === 0) {
        await this.wakeUpService();
      }
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.MARKET_INSIGHTS_ENDPOINT}?userId=${userId || 'anonymous'}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} - ${response.statusText}`);
      }
      
      const responseData = await response.json();
      
      // Add safety check for undefined properties
      if (!responseData || !responseData.data) {
        console.warn('Received empty or invalid response from direct market insights API');
        return { data: {} };
      }
      
      return responseData;
    } catch (error) {
      console.error(`Error directly retrieving market insights data (attempt ${retries + 1}):`, error);
      
      // Retry logic
      if (retries < MAX_RETRIES) {
        console.log(`Retrying in ${RETRY_DELAY}ms...`);
        await sleep(RETRY_DELAY);
        return this.directGetMarketInsights(userId, retries + 1);
      }
      
      // Return a safe default after all retries fail
      console.warn('All retries failed. Returning default empty response.');
      return { data: {} };
    }
  },

  /**
   * Direct method to check module access using fetch with retry logic
   * This method bypasses the apiService for direct access if needed
   * @param {number} retries - Number of retries (internal use)
   * @returns {Promise<Object>} - Promise that resolves to the module access status
   */
  async directCheckModuleAccess(retries = 0) {
    try {
      // Try to wake up the service first if this is the first attempt
      if (retries === 0) {
        await this.wakeUpService();
      }
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.MODULE_ACCESS_ENDPOINT}`);
      
      if (!response.ok) {
        console.warn(`Module access endpoint returned status: ${response.status}. Returning default access: true`);
        return { access: true };
      }
      
      const responseData = await response.json();
      
      // Add safety check for undefined properties
      if (!responseData) {
        console.warn('Received empty response from direct module access API');
        return { access: true };
      }
      
      return responseData;
    } catch (error) {
      console.error(`Error directly checking module access (attempt ${retries + 1}):`, error);
      
      // Retry logic
      if (retries < MAX_RETRIES) {
        console.log(`Retrying in ${RETRY_DELAY}ms...`);
        await sleep(RETRY_DELAY);
        return this.directCheckModuleAccess(retries + 1);
      }
      
      // Always return true as specified in the requirements
      console.warn('All retries failed. Returning default access: true');
      return { access: true };
    }
  }
};

export default marketInsightsApiService;
