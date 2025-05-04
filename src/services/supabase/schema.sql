-- Supabase Schema for Market Insights Application

-- Categories tables
CREATE TABLE IF NOT EXISTS dental_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS aesthetic_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

-- Procedures tables
CREATE TABLE IF NOT EXISTS dental_procedures (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category_id INTEGER REFERENCES dental_categories(id),
  growth NUMERIC(5,2) NOT NULL,
  market_size_2025 NUMERIC(5,2) NOT NULL,
  primary_age_group TEXT NOT NULL,
  trends TEXT NOT NULL,
  future_outlook TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS aesthetic_procedures (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category_id INTEGER REFERENCES aesthetic_categories(id),
  growth NUMERIC(5,2) NOT NULL,
  market_size_2025 NUMERIC(5,2) NOT NULL,
  primary_age_group TEXT NOT NULL,
  trends TEXT NOT NULL,
  future_outlook TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Market growth tables
CREATE TABLE IF NOT EXISTS dental_market_growth (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  size NUMERIC(5,2) NOT NULL,
  is_projected BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS aesthetic_market_growth (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  size NUMERIC(5,2) NOT NULL,
  is_projected BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Demographics tables
CREATE TABLE IF NOT EXISTS dental_demographics (
  id SERIAL PRIMARY KEY,
  age_group TEXT NOT NULL,
  percentage INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS aesthetic_demographics (
  id SERIAL PRIMARY KEY,
  age_group TEXT NOT NULL,
  percentage INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gender distribution tables
CREATE TABLE IF NOT EXISTS dental_gender_distribution (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  value INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS aesthetic_gender_distribution (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  value INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Metropolitan markets table
CREATE TABLE IF NOT EXISTS metropolitan_markets (
  id SERIAL PRIMARY KEY,
  rank INTEGER NOT NULL,
  metro TEXT NOT NULL,
  market_size_2023 NUMERIC(5,2) NOT NULL,
  market_size_2030 NUMERIC(5,2) NOT NULL,
  growth_rate NUMERIC(5,2) NOT NULL,
  key_procedures TEXT[] NOT NULL,
  provider_density NUMERIC(5,2) NOT NULL,
  insurance_coverage INTEGER NOT NULL,
  disposable_income TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- State market size table
CREATE TABLE IF NOT EXISTS market_size_by_state (
  id SERIAL PRIMARY KEY,
  state TEXT NOT NULL,
  value NUMERIC(5,2) NOT NULL,
  label TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Regional growth rates
CREATE TABLE IF NOT EXISTS growth_rates_by_region (
  id SERIAL PRIMARY KEY,
  region TEXT NOT NULL,
  growth NUMERIC(5,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Procedures by region
CREATE TABLE IF NOT EXISTS regions (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS procedures_by_region (
  id SERIAL PRIMARY KEY,
  region_id INTEGER REFERENCES regions(id),
  name TEXT NOT NULL,
  percentage INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Demographics by region
CREATE TABLE IF NOT EXISTS demographics_by_region (
  id SERIAL PRIMARY KEY,
  region_id INTEGER REFERENCES regions(id),
  age_group TEXT NOT NULL,
  percentage INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gender_split_by_region (
  id SERIAL PRIMARY KEY,
  region_id INTEGER REFERENCES regions(id),
  male INTEGER NOT NULL,
  female INTEGER NOT NULL,
  income_level TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Top providers by market
CREATE TABLE IF NOT EXISTS top_providers (
  id SERIAL PRIMARY KEY,
  market TEXT NOT NULL,
  provider_name TEXT NOT NULL,
  provider_type TEXT NOT NULL,
  market_share NUMERIC(5,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE dental_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE aesthetic_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE dental_procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE aesthetic_procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE dental_market_growth ENABLE ROW LEVEL SECURITY;
ALTER TABLE aesthetic_market_growth ENABLE ROW LEVEL SECURITY;
ALTER TABLE dental_demographics ENABLE ROW LEVEL SECURITY;
ALTER TABLE aesthetic_demographics ENABLE ROW LEVEL SECURITY;
ALTER TABLE dental_gender_distribution ENABLE ROW LEVEL SECURITY;
ALTER TABLE aesthetic_gender_distribution ENABLE ROW LEVEL SECURITY;
ALTER TABLE metropolitan_markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_size_by_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_rates_by_region ENABLE ROW LEVEL SECURITY;
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedures_by_region ENABLE ROW LEVEL SECURITY;
ALTER TABLE demographics_by_region ENABLE ROW LEVEL SECURITY;
ALTER TABLE gender_split_by_region ENABLE ROW LEVEL SECURITY;
ALTER TABLE top_providers ENABLE ROW LEVEL SECURITY;

-- Create access policies
-- Example policy for authenticated users
CREATE POLICY "Allow authenticated users to read data" 
ON dental_procedures 
FOR SELECT 
TO authenticated 
USING (true);

-- Create similar policies for all tables
