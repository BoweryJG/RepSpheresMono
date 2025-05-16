-- Market Insights Database Schema
-- Created: 2025-05-15

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create schema
CREATE SCHEMA IF NOT EXISTS market_insights;

-- Procedures table
CREATE TABLE IF NOT EXISTS market_insights.procedures (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    growth_rate DECIMAL(5,2) NOT NULL,
    market_size_2025 DECIMAL(10,2) NOT NULL,
    primary_age_group VARCHAR(50) NOT NULL,
    trends TEXT,
    future_outlook TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Companies table
CREATE TABLE IF NOT EXISTS market_insights.companies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(50) NOT NULL,
    services TEXT,
    market_share DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Procedure-Company relationships
CREATE TABLE IF NOT EXISTS market_insights.procedure_companies (
    procedure_id UUID REFERENCES market_insights.procedures(id),
    company_id UUID REFERENCES market_insights.companies(id),
    service_description TEXT,
    PRIMARY KEY (procedure_id, company_id)
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION market_insights.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to update timestamps
CREATE TRIGGER update_procedures_timestamp
    BEFORE UPDATE ON market_insights.procedures
    FOR EACH ROW
    EXECUTE FUNCTION market_insights.update_updated_at_column();

CREATE TRIGGER update_companies_timestamp
    BEFORE UPDATE ON market_insights.companies
    FOR EACH ROW
    EXECUTE FUNCTION market_insights.update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_procedures_name ON market_insights.procedures(name);
CREATE INDEX IF NOT EXISTS idx_procedures_category ON market_insights.procedures(category);
CREATE INDEX IF NOT EXISTS idx_companies_name ON market_insights.companies(name);
CREATE INDEX IF NOT EXISTS idx_companies_industry ON market_insights.companies(industry);
