import { loadAllDataToSupabase } from './dataLoader.js';

console.log('=== STARTING DIRECT DATA LOAD TO SUPABASE ===');

loadAllDataToSupabase()
  .then((result) => {
    console.log('=== RESULT ===');
    console.log(result);
    
    if (result.success) {
      console.log('✅ Data loaded successfully!');
      process.exit(0);
    } else {
      console.error('❌ Data loading failed:', result.error);
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('❌ Error during execution:', error);
    process.exit(1);
  });
