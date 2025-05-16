import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing Supabase URL or Anon Key in environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    db: {
        schema: 'public'
    }
});

async function executeSQLFile(filePath) {
    try {
        console.log(`Executing SQL file: ${filePath}`);
        
        // Read the SQL file
        const sql = fs.readFileSync(filePath, 'utf8');
        
        // Split the SQL into individual statements
        const statements = sql
            .split(';')
            .map(statement => statement.trim())
            .filter(statement => statement.length > 0);
        
        console.log(`Found ${statements.length} SQL statements to execute`);
        
        // Execute each statement
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (!statement.trim()) continue;
            
            console.log(`\nExecuting statement ${i + 1}/${statements.length}...`);
            console.log(statement.substring(0, 100) + (statement.length > 100 ? '...' : ''));
            
            try {
                const { data, error } = await supabase.rpc('pg_query', { query: statement });
                
                if (error) {
                    // Skip "already exists" errors
                    if (error.message && error.message.includes('already exists')) {
                        console.log('  → Table already exists, skipping...');
                        continue;
                    }
                    console.error('  → Error:', error.message);
                } else {
                    console.log('  → Success');
                }
            } catch (err) {
                console.error('  → Error executing statement:', err.message);
            }
        }
        
        console.log('\n✅ SQL execution completed');
        return true;
        
    } catch (error) {
        console.error('❌ Error executing SQL file:');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        return false;
    }
}

// Get the SQL file path from command line arguments or use default
const sqlFile = process.argv[2] || path.join('sql', 'create_schema.sql');

// Execute the SQL file
executeSQLFile(sqlFile).then(success => {
    process.exit(success ? 0 : 1);
});
