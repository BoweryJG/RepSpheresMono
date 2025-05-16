import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabaseStructure() {
    try {
        console.log('Checking database structure...');
        
        // 1. Check if the schema exists
        const schemaCheck = await supabase.rpc('execute_sql', {
            sql: `
                SELECT schema_name 
                FROM information_schema.schemata 
                WHERE schema_name = 'market_insights';
            `
        });
        
        console.log('Schema check:', schemaCheck);
        
        // 2. Check if tables exist in the schema
        const tablesCheck = await supabase.rpc('execute_sql', {
            sql: `
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'market_insights';
            `
        });
        
        console.log('Tables in market_insights schema:', tablesCheck);
        
        // 3. Check if we can insert a test record
        try {
            const testInsert = await supabase.rpc('execute_sql', {
                sql: `
                    INSERT INTO market_insights.companies (name, industry, services)
                    VALUES ('Test Company', 'Test', 'Test Services')
                    RETURNING id;
                `
            });
            console.log('Test insert result:', testInsert);
            
            // Clean up
            if (testInsert.data) {
                await supabase.rpc('execute_sql', {
                    sql: `
                        DELETE FROM market_insights.companies 
                        WHERE name = 'Test Company';
                    `
                });
            }
        } catch (insertError) {
            console.error('Test insert failed:', insertError);
        }
        
    } catch (error) {
        console.error('Error checking database structure:', error);
    }
}

checkDatabaseStructure();
