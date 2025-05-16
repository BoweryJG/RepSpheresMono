import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
    try {
        console.log('Checking tables...');
        
        // Check if companies table exists and get its structure
        const { data: companies, error: companiesError } = await supabase
            .from('companies')
            .select('*')
            .limit(1);
            
        if (companiesError) {
            console.error('Error checking companies table:', companiesError);
        } else {
            console.log('Companies table structure:', Object.keys(companies[0] || {}));
        }
        
        // Check if procedures table exists and get its structure
        const { data: procedures, error: proceduresError } = await supabase
            .from('procedures')
            .select('*')
            .limit(1);
            
        if (proceduresError) {
            console.error('Error checking procedures table:', proceduresError);
        } else {
            console.log('Procedures table structure:', Object.keys(procedures[0] || {}));
        }
        
        // Check if procedure_companies table exists and get its structure
        const { data: procCompanies, error: procCompaniesError } = await supabase
            .from('procedure_companies')
            .select('*')
            .limit(1);
            
        if (procCompaniesError) {
            console.error('Error checking procedure_companies table:', procCompaniesError);
        } else {
            console.log('Procedure_Companies table structure:', Object.keys(procCompanies[0] || {}));
        }
        
    } catch (error) {
        console.error('Error checking tables:', error);
    }
}

checkTables();
