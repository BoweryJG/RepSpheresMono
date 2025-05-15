// Simple script to test if environment variables are properly loaded (CommonJS version)
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

console.log('=== ENV VARIABLES TEST ===');
console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL?.substring(0, 30) + '...');
console.log('VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? 'PRESENT' : 'MISSING');
console.log('SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? 'PRESENT' : 'MISSING');
console.log('=== END TEST ===');

// Create Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Test connection
const main = async () => {
  try {
    console.log('Testing Supabase connection...');
    const { error } = await supabase.from('dental_procedures_simplified').select('count', { count: 'exact', head: true });
    if (error) {
      console.error('Connection test error:', error.message);
    } else {
      console.log('Connection successful!');
    }
  } catch (err) {
    console.error('Connection test exception:', err.message);
  }
};

main();
