// Script to load the procedures data to Supabase
import { loadAllDataToSupabase } from './dataLoader.js';

console.log('Starting to load procedures data to Supabase...');

// Execute the data loading function
loadAllDataToSupabase()
  .then(result => {
    console.log('Result:', result.message);
    console.log('Data loading completed!');
  })
  .catch(error => {
    console.error('Error during data loading:', error);
  });
