import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
    try {
        console.log('Checking database connection...');
        
        // Test connection by listing tables
        const { data: tables, error } = await supabase
            .rpc('get_all_tables');
            
        if (error) {
            console.error('Error fetching tables:', error);
            return;
        }
        
        console.log('Tables in database:', tables);
        
        // Check if our schema exists
        const { data: schemaData, error: schemaError } = await supabase
            .from('information_schema.schemata')
            .select('schema_name')
            .eq('schema_name', 'market_insights');
            
        console.log('Schema check:', schemaData);
        
        // Check if our tables exist
        const { data: tableData, error: tableError } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'market_insights');
            
        console.log('Tables in market_insights schema:', tableData);
        
    } catch (error) {
        console.error('Error checking database:', error);
    }
}

checkDatabase();
