import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createSchema() {
    try {
        console.log('Creating database schema...');
        
        // Create schema if it doesn't exist
        const createSchemaSQL = `
            CREATE SCHEMA IF NOT EXISTS market_insights;
            
            -- Companies table
            CREATE TABLE IF NOT EXISTS market_insights.companies (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                name TEXT NOT NULL UNIQUE,
                industry TEXT,
                description TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            
            -- Procedures table
            CREATE TABLE IF NOT EXISTS market_insights.procedures (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                name TEXT NOT NULL,
                category TEXT,
                description TEXT,
                growth NUMERIC,
                market_size_2025 NUMERIC,
                primary_age_group TEXT,
                trends TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                UNIQUE(name, category)
            );
            
            -- Procedure-Companies relationship table
            CREATE TABLE IF NOT EXISTS market_insights.procedure_companies (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                procedure_id UUID REFERENCES market_insights.procedures(id) ON DELETE CASCADE,
                company_id UUID REFERENCES market_insights.companies(id) ON DELETE CASCADE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                UNIQUE(procedure_id, company_id)
            );
            
            -- Create function for updating timestamps
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = NOW();
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
            
            -- Create triggers for updated_at
            DROP TRIGGER IF EXISTS update_companies_updated_at ON market_insights.companies;
            CREATE TRIGGER update_companies_updated_at
            BEFORE UPDATE ON market_insights.companies
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
            
            DROP TRIGGER IF EXISTS update_procedures_updated_at ON market_insights.procedures;
            CREATE TRIGGER update_procedures_updated_at
            BEFORE UPDATE ON market_insights.procedures
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        `;
        
        // Enable UUID extension if not exists
        const { error: uuidError } = await supabase.rpc('pg_extension_create', { extname: 'uuid-ossp' });
        if (uuidError && !uuidError.message.includes('already exists')) {
            console.error('Error enabling UUID extension:', uuidError);
            return false;
        }
        
        // Execute the schema creation SQL
        const { error } = await supabase.rpc('pg_query', { query: createSchemaSQL });
        
        if (error) {
            if (error.message.includes('already exists')) {
                console.log('Schema already exists, continuing...');
                return true;
            }
            throw error;
        }
        
        console.log('✅ Database schema created successfully!');
        return true;
        
    } catch (error) {
        console.error('❌ Error creating database schema:');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
        console.error('Error details:', error.details);
        return false;
    }
}

// Run the schema creation
createSchema().then(success => {
    process.exit(success ? 0 : 1);
});
