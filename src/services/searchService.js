// Service for fetching company data from Supabase
import { supabaseClient } from './supabase/supabaseClient';

/**
 * Fetches company data from Supabase
 * @param {string} industry - The industry to search for companies (dental or aesthetic)
 * @param {number} limit - Number of results to return
 * @returns {Promise<Array>} - Array of company data
 */
export const fetchCompanyData = async (industry, limit = 5) => {
  try {
    const { data, error } = await supabaseClient
      .from('companies')
      .select('*')
      .eq('industry', industry.toLowerCase())
      .limit(limit);
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching company data:', error);
    throw error;
  }
};
