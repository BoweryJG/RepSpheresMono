import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing Supabase URL or Anon Key in environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

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
                // Use the Supabase client's query method
                const { data, error } = await supabase.rpc('pg_temp.execute', { query: statement });
                
                if (error) {
                    // Skip "already exists" errors
                    if (error.message && error.message.includes('already exists')) {
                        console.log('  → Already exists, skipping...');
                        continue;
                    }
                    throw error;
                }
                
                console.log('  → Success');
                if (data) {
                    console.log('  → Result:', data);
                }
            } catch (error) {
                console.error('  → Error:', error.message);
                // Continue with next statement even if one fails
            }
        }
        
        console.log('\n✅ SQL execution completed');
    } catch (error) {
        console.error('Error executing SQL file:', error);
        process.exit(1);
    }
}

// Get the SQL file path from command line arguments or use default
const sqlFile = process.argv[2] || 'sql/create_public_schema.sql';

// Execute the SQL file
executeSQLFile(sqlFile).catch(console.error);
