import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cbopynuvhcymbumjnvay.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNib3B5bnV2aGN5bWJ1bWpudmF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5OTUxNzMsImV4cCI6MjA1OTU3MTE3M30.UZElMkoHugIt984RtYWyfrRuv2rB67opQdCrFVPCfzU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    
    console.log('✅ Connection successful!');
    console.log('Session:', data);
    
    // Test a simple query
    const { data: tableData, error: queryError } = await supabase
      .from('market_growth')
      .select('id')
      .limit(1);
    
    if (queryError) throw queryError;
    
    console.log('✅ Database query successful!');
    console.log('Sample data:', tableData);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testConnection();
