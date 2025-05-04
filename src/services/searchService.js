// Service for fetching data from Brave Search API
import { dentalCompanies, aestheticCompanies } from '../data/dentalCompanies';

/**
 * Fetches company data from Brave Search API
 * @param {string} industry - The industry to search for companies (dental or aesthetic)
 * @param {number} limit - Number of results to return
 * @returns {Promise<Array>} - Array of company data
 */
export const fetchCompanyData = async (industry, limit = 5) => {
  // In a real implementation, you would use the Brave Search API with your API key
  // For this example, we'll use our local data files
  
  try {
    // Simulate API call latency
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (industry.toLowerCase() === 'dental') {
      return dentalCompanies.slice(0, limit);
    } else if (industry.toLowerCase() === 'aesthetic') {
      return aestheticCompanies.slice(0, limit);
    } else {
      throw new Error(`Unknown industry: ${industry}`);
    }
  } catch (error) {
    console.error('Error fetching company data:', error);
    throw error;
  }
};
