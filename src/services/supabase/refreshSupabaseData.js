import { refreshAllData } from '../../refreshData';

/**
 * This script refreshes all Supabase data to ensure the application
 * is using live data from Supabase instead of mock data.
 * 
 * It clears all existing tables and reloads data from the source files.
 */
async function refreshSupabaseData() {
  console.log('Starting Supabase data refresh process...');
  
  try {
    const result = await refreshAllData();
    
    if (result.success) {
      console.log('✅ Supabase data refresh completed successfully!');
      console.log('All tables have been cleared and repopulated with fresh data.');
      console.log('The application will now use live data from Supabase.');
    } else {
      console.error('❌ Supabase data refresh failed:', result.error);
      console.error('Please check your Supabase connection and try again.');
    }
  } catch (error) {
    console.error('❌ Error during Supabase data refresh:', error);
    console.error('Please check your Supabase connection and try again.');
  }
}

// Execute the refresh function
refreshSupabaseData();
