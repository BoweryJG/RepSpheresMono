-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create schema
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
CREATE OR REPLACE FUNCTION market_insights.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DO $$
BEGIN
    -- Drop existing triggers if they exist
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_companies_updated_at') THEN
        DROP TRIGGER update_companies_updated_at ON market_insights.companies;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_procedures_updated_at') THEN
        DROP TRIGGER update_procedures_updated_at ON market_insights.procedures;
    END IF;
    
    -- Create new triggers
    EXECUTE 'CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON market_insights.companies
    FOR EACH ROW EXECUTE FUNCTION market_insights.update_updated_at_column()';
    
    EXECUTE 'CREATE TRIGGER update_procedures_updated_at
    BEFORE UPDATE ON market_insights.procedures
    FOR EACH ROW EXECUTE FUNCTION market_insights.update_updated_at_column()';
END $$;
