import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createSchema() {
    try {
        console.log('Reading SQL file...');
        const sqlPath = './data/create_schema.sql';
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        console.log('Executing schema creation...');
        const { error } = await supabase
            .rpc('execute_sql', { sql });

        if (error) {
            console.error('❌ Error creating schema:', error.message);
            return false;
        }

        console.log('✅ Schema created successfully!');
        return true;
    } catch (error) {
        console.error('❌ Error:', error.message);
        return false;
    }
}

createSchema();
