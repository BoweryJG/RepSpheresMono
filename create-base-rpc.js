import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createBaseRpc() {
    try {
        console.log('Creating base RPC function...');
        const sql = `
            -- Create function to execute SQL directly
            CREATE OR REPLACE FUNCTION public.execute_sql(sql_query text)
            RETURNS void
            LANGUAGE plpgsql
            SECURITY DEFINER
            AS $$
            BEGIN
                EXECUTE sql_query;
            END;
            $$;

            -- Grant execute permission to anon role
            GRANT EXECUTE ON FUNCTION public.execute_sql(text) TO anon;
        `;

        const { error } = await supabase.rpc('execute_sql', { sql });

        if (error) {
            console.error('❌ Error creating base RPC function:', error.message);
            return false;
        }

        console.log('✅ Base RPC function created successfully!');
        return true;
    } catch (error) {
        console.error('❌ Error:', error.message);
        return false;
    }
}

createBaseRpc();
