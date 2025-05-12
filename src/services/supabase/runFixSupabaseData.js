import fixSupabaseData from './fixSupabaseData.js';
import { fileURLToPath } from 'url';

// Node.js module handling in ESM mode
const __filename = fileURLToPath(import.meta.url);

// Run the fix
console.log("🔧 Starting Supabase data fix process...");
console.log("🚀 This will fix the tables and populate data in your Supabase database");

fixSupabaseData()
  .then(result => {
    if (result.success) {
      console.log("✅ SUCCESS! Supabase data has been fixed and populated.");
      console.log("🎉 You should now see data in your dashboard!");
    } else {
      console.error("❌ ERROR: Failed to fix Supabase data.");
      console.error(`❌ Error message: ${result.error}`);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error("❌ CRITICAL ERROR:");
    console.error(err);
    process.exit(1);
  });
