// Simple wrapper to execute the populateData script
import { populateAllData } from './populateData.js';

console.log('Starting data population process...');

// Execute the populate function
populateAllData()
  .then(() => console.log('Data population process completed!'))
  .catch(error => console.error('Error during data population:', error));
