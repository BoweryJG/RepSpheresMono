import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSqlConnection() {
    try {
        console.log('Testing SQL connection...');
        
        // Test a simple SQL query
        const { data, error } = await supabase
            .from('market_insights.procedures')
            .select('*')
            .limit(1);

        if (error) {
            console.error('❌ Error:', error.message);
            return false;
        }

        console.log('✅ SQL connection successful!');
        return true;
    } catch (error) {
        console.error('❌ Error:', error.message);
        return false;
    }
}

testSqlConnection();
