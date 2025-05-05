import { fetchAndStoreNewsData } from './dataFetchers/newsDataFetcher';
import { fetchAndStoreCompanyData } from './dataFetchers/companyDataFetcher';

/**
 * Refresh all data from external sources
 */
export const refreshAllData = async () => {
  try {
    console.log('Starting data refresh...');
    
    // Refresh dental industry data
    await fetchAndStoreNewsData('dental');
    await fetchAndStoreCompanyData('dental');
    
    // Refresh aesthetic industry data
    await fetchAndStoreNewsData('aesthetic');
    await fetchAndStoreCompanyData('aesthetic');
    
    console.log('Data refresh completed successfully');
    return { success: true };
  } catch (error) {
    console.error('Error refreshing data:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Schedule periodic data refresh
 * @param {number} intervalHours - Refresh interval in hours
 */
export const scheduleDataRefresh = (intervalHours = 24) => {
  const intervalMs = intervalHours * 60 * 60 * 1000;
  
  // Initial refresh
  refreshAllData();
  
  // Schedule periodic refresh
  setInterval(refreshAllData, intervalMs);
};

/**
 * Check if data exists in Supabase and refresh if needed
 * This is useful for initialization when the app starts
 */
export const ensureDataExists = async () => {
  try {
    console.log('Checking if data exists in Supabase...');
    
    // Check if news data exists
    const newsDataExists = await checkNewsDataExists();
    
    // Check if company data exists
    const companyDataExists = await checkCompanyDataExists();
    
    if (!newsDataExists || !companyDataExists) {
      console.log('Some data is missing, refreshing...');
      await refreshAllData();
    } else {
      console.log('All data exists in Supabase');
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error checking data existence:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Check if news data exists in Supabase
 * @returns {Promise<boolean>} - Whether news data exists
 */
const checkNewsDataExists = async () => {
  try {
    const { supabase } = await import('./supabase/supabaseClient');
    
    // Check dental news
    const { count: dentalNewsCount, error: dentalNewsError } = await supabase
      .from('news_articles')
      .select('*', { count: 'exact', head: true })
      .eq('industry', 'dental');
    
    if (dentalNewsError) throw dentalNewsError;
    
    // Check aesthetic news
    const { count: aestheticNewsCount, error: aestheticNewsError } = await supabase
      .from('news_articles')
      .select('*', { count: 'exact', head: true })
      .eq('industry', 'aesthetic');
    
    if (aestheticNewsError) throw aestheticNewsError;
    
    return dentalNewsCount > 0 && aestheticNewsCount > 0;
  } catch (error) {
    console.error('Error checking news data existence:', error);
    return false;
  }
};

/**
 * Check if company data exists in Supabase
 * @returns {Promise<boolean>} - Whether company data exists
 */
const checkCompanyDataExists = async () => {
  try {
    const { supabase } = await import('./supabase/supabaseClient');
    
    // Check dental companies
    const { count: dentalCompanyCount, error: dentalCompanyError } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true })
      .eq('industry', 'dental');
    
    if (dentalCompanyError) throw dentalCompanyError;
    
    // Check aesthetic companies
    const { count: aestheticCompanyCount, error: aestheticCompanyError } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true })
      .eq('industry', 'aesthetic');
    
    if (aestheticCompanyError) throw aestheticCompanyError;
    
    return dentalCompanyCount > 0 && aestheticCompanyCount > 0;
  } catch (error) {
    console.error('Error checking company data existence:', error);
    return false;
  }
};
