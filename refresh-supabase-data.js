#!/usr/bin/env node

/**
 * This script refreshes all Supabase data to ensure the application
 * is using live data from Supabase instead of mock data.
 * 
 * Run this script with: node refresh-supabase-data.js
 */

// Use ESM import syntax
import('./src/services/supabase/refreshSupabaseData.js')
  .then(() => {
    // Script will execute automatically
    console.log('Script loaded successfully.');
  })
  .catch(error => {
    console.error('Failed to load refresh script:', error);
  });
