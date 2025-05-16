import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyTables() {
    try {
        console.log('Verifying tables in the database...');
        
        // Check if companies table exists
        const { data: companies, error: companiesError } = await supabase
            .from('pg_catalog.pg_tables')
            .select('tablename')
            .eq('schemaname', 'public')
            .eq('tablename', 'companies');
            
        console.log('Companies table exists:', companies && companies.length > 0);
        
        // Check if procedures table exists
        const { data: procedures, error: proceduresError } = await supabase
            .from('pg_catalog.pg_tables')
            .select('tablename')
            .eq('schemaname', 'public')
            .eq('tablename', 'procedures');
            
        console.log('Procedures table exists:', procedures && procedures.length > 0);
        
        // Check if procedure_companies table exists
        const { data: procCompanies, error: procCompaniesError } = await supabase
            .from('pg_catalog.pg_tables')
            .select('tablename')
            .eq('schemaname', 'public')
            .eq('tablename', 'procedure_companies');
            
        console.log('Procedure_Companies table exists:', procCompanies && procCompanies.length > 0);
        
    } catch (error) {
        console.error('Error verifying tables:', error);
    }
}

verifyTables();
