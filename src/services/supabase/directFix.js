import fixSupabaseData from './fixSupabaseData.js';

// Directly run the fix function without any URL handling
console.log("🔧 Starting direct Supabase data fix...");

fixSupabaseData()
  .then(result => {
    console.log("✅ Fix completed with result:", result);
    if (!result.success) {
      console.error("Error details:", result.error);
      process.exit(1);
    }
  })
  .catch(error => {
    console.error("❌ ERROR:", error);
    process.exit(1);
  });
