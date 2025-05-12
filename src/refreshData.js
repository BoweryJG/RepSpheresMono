import { supabase } from './services/supabase/supabaseClient';
import { loadAllDataToSupabase } from './services/supabase/dataLoader';
import { populateAllNewsArticles } from './services/supabase/populateNewsArticles';

/**
 * Refresh all data in Supabase
 * This function clears existing data and reloads everything
 */
export const refreshAllData = async () => {
  try {
    console.log('Starting full data refresh process...');
    
    // Clear existing data
    console.log('Clearing existing data...');
    await clearAllTables();
    
    // Reload all data 
    console.log('Reloading all data...');
    const result = await loadAllDataToSupabase();
    
    // Populate news articles from external sources
    console.log('Populating news articles from external sources...');
    const newsResult = await populateAllNewsArticles();
    console.log(`Populated ${Object.values(newsResult).flat().length} news articles`);
    
    console.log('Data refresh complete!', result);
    return { success: true, message: 'Data successfully refreshed!' };
  } catch (error) {
    console.error('Error refreshing data:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Clear all tables before reloading data
 */
const clearAllTables = async () => {
  const tables = [
    'dental_procedures',
    'aesthetic_procedures',
    'categories',
    'aesthetic_categories',
    'dental_market_growth',
    'aesthetic_market_growth',
    'dental_demographics',
    'aesthetic_demographics',
    'dental_gender_distribution',
    'aesthetic_gender_distribution',
    'metropolitan_markets',
    'market_size_by_state',
    'regions',
    'growth_rates_by_region',
    'procedures_by_region',
    'demographics_by_region',
    'gender_split_by_region',
    'top_providers',
    'companies',
    'news_articles'
  ];
  
  for (const table of tables) {
    const { error } = await supabase.from(table).delete().neq('id', 0);
    // Ignore foreign key constraint errors, as some tables may be referenced by others
    if (error && !error.message.includes('foreign key constraint')) {
      console.warn(`Error clearing table ${table}:`, error);
    }
  }
  
  console.log('All tables cleared successfully!');
};
