/**
 * API Service for connecting to the backend server
 * 
 * This service provides methods for making requests to the backend API.
 * It includes error handling and automatically builds proper URLs.
 */

/**
 * Get environment variable with fallback support for different environments
 * @param {string} key - Environment variable key
 * @param {string} defaultValue - Default value if not found
 * @returns {string} - The environment variable value or default
 */
const getEnv = (key, defaultValue) => {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  return defaultValue;
};

const API_BASE_URL = getEnv('VITE_API_BASE_URL', 'https://osbackend-zl1h.onrender.com');

/**
 * Core API service with methods for different HTTP requests
 */
export const apiService = {
  /**
   * Make a GET request to the backend API
   * @param {string} endpoint - The API endpoint (starting with /)
   * @param {Object} options - Additional fetch options
   * @returns {Promise<any>} - Promise that resolves to the response data
   */
  async get(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          ...options.headers
        },
        ...options
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} - ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API GET request failed for ${endpoint}:`, error);
      throw error;
    }
  },

  /**
   * Make a POST request to the backend API
   * @param {string} endpoint - The API endpoint (starting with /)
   * @param {Object} data - The data to send in the request body
   * @param {Object} options - Additional fetch options
   * @returns {Promise<any>} - Promise that resolves to the response data
   */
  async post(endpoint, data, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers
        },
        body: JSON.stringify(data),
        ...options
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} - ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API POST request failed for ${endpoint}:`, error);
      throw error;
    }
  },

  /**
   * Make a PUT request to the backend API
   * @param {string} endpoint - The API endpoint (starting with /)
   * @param {Object} data - The data to send in the request body
   * @param {Object} options - Additional fetch options
   * @returns {Promise<any>} - Promise that resolves to the response data
   */
  async put(endpoint, data, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers
        },
        body: JSON.stringify(data),
        ...options
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} - ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API PUT request failed for ${endpoint}:`, error);
      throw error;
    }
  },

  /**
   * Make a DELETE request to the backend API
   * @param {string} endpoint - The API endpoint (starting with /)
   * @param {Object} options - Additional fetch options
   * @returns {Promise<any>} - Promise that resolves to the response data
   */
  async delete(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          ...options.headers
        },
        ...options
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} - ${response.statusText}`);
      }
      
      // Some DELETE endpoints may not return content
      if (response.status === 204) {
        return { success: true };
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API DELETE request failed for ${endpoint}:`, error);
      throw error;
    }
  },
  
  /**
   * Check if the backend API is reachable
   * @returns {Promise<boolean>} - Promise that resolves to true if API is reachable
   */
  async checkConnection() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.ok;
    } catch (error) {
      console.error('Backend connection check failed:', error);
      return false;
    }
  }
};

export default apiService;
