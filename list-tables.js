import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
    try {
        console.log('Listing all tables in the database...');
        
        // Get all schemas
        const { data: schemas, error: schemaError } = await supabase
            .rpc('list_schemas');
            
        if (schemaError) {
            console.error('Error listing schemas:', schemaError);
            return;
        }
        
        console.log('Schemas:', schemas);
        
        // For each schema, list tables
        for (const schema of schemas) {
            try {
                const { data: tables, error: tableError } = await supabase
                    .rpc('list_tables', { schema_name: schema });
                
                if (tableError) {
                    console.error(`Error listing tables in schema ${schema}:`, tableError);
                    continue;
                }
                
                console.log(`\nTables in schema ${schema}:`);
                console.table(tables);
                
            } catch (error) {
                console.error(`Error processing schema ${schema}:`, error);
            }
        }
        
    } catch (error) {
        console.error('Error listing tables:', error);
    }
}

listTables();
