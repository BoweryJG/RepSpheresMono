import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials. Please check your .env file.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabase() {
    try {
        console.log('Testing Supabase connection...');
        
        // Test connection
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        console.log('✅ Connection successful!');

        // Create RPC functions first
        console.log('\nCreating RPC functions...');
        const sqlPath = path.join(process.cwd(), 'data', 'create_rpc_functions.sql');
        const sql = await fs.readFile(sqlPath, 'utf8');
        const { error: createRpcError } = await supabase.rpc('execute_sql', { sql });
        
        if (createRpcError) {
            console.error(`❌ Error creating RPC functions: ${createRpcError.message}`);
            return;
        }
        console.log('✅ RPC functions created successfully!');

        // Test schema creation
        console.log('\nTesting schema creation...');
        const { error: createError } = await supabase.rpc('create_market_insights_schema', {});
        if (createError) {
            console.error(`❌ Error creating schema: ${createError.message}`);
        } else {
            console.log('✅ Schema created successfully!');
        }

        // Test data insertion
        console.log('\nTesting data insertion...');
        const { error: insertError } = await supabase
            .from('market_insights.procedures')
            .insert([{
                name: 'Test Procedure',
                category: 'Test',
                type: 'Test',
                growth_rate: 0,
                market_size_2025: 0,
                primary_age_group: 'Test',
                trends: 'Test',
                future_outlook: 'Test'
            }]);

        if (insertError) {
            console.error(`❌ Error inserting test data: ${insertError.message}`);
        } else {
            console.log('✅ Test data inserted successfully!');
        }

        // Test data retrieval
        console.log('\nTesting data retrieval...');
        const { data: testData, error: testError } = await supabase
            .from('market_insights.procedures')
            .select('*')
            .limit(1);

        if (testError) {
            console.error(`❌ Error retrieving data: ${testError.message}`);
        } else if (testData && testData.length > 0) {
            console.log('✅ Data retrieval successful!');
            console.log('Sample data:', testData[0]);
        } else {
            console.error('❌ No data found in database');
        }

        console.log('\n✅ All tests completed successfully!');
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

testDatabase();
