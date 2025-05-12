-- Supabase Schema for Market Insights Application

-- Categories tables
CREATE TABLE IF NOT EXISTS dental_categories (
  id SERIAL PRIMARY KEY,
  category_label TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS aesthetic_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

-- Procedures tables
CREATE TABLE IF NOT EXISTS dental_procedures (
  id SERIAL PRIMARY KEY,
  procedure_name TEXT NOT NULL,
  category_id INTEGER REFERENCES dental_categories(id),
  yearly_growth_percentage NUMERIC(5,2) NOT NULL,
  market_size_2025_usd_millions NUMERIC(5,2) NOT NULL,
  age_range TEXT NOT NULL,
  recent_trends TEXT NOT NULL,
  future_outlook TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS aesthetic_procedures (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category_id INTEGER REFERENCES aesthetic_categories(id),
  yearly_growth_percentage NUMERIC(5,2) NOT NULL,
  market_size_2025_usd_millions NUMERIC(5,2) NOT NULL,
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

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT UNIQUE NOT NULL,
  event_date_start TIMESTAMP WITH TIME ZONE,
  event_date_end TIMESTAMP WITH TIME ZONE,
  location TEXT,
  city TEXT,
  country TEXT,
  industry TEXT NOT NULL,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  industry TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  website TEXT,
  headquarters TEXT,
  founded INTEGER, 
  time_in_market INTEGER, 
  parent_company TEXT,
  employee_count TEXT, 
  revenue TEXT, 
  market_cap TEXT, 
  market_share NUMERIC(5,2), 
  growth_rate NUMERIC(5,2), 
  key_offerings TEXT[], 
  top_products TEXT[], 
  stock_symbol TEXT,
  stock_exchange TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- News articles table
CREATE TABLE IF NOT EXISTS news_articles (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  image_url TEXT,
  url TEXT NOT NULL UNIQUE,
  published_date TIMESTAMP WITH TIME ZONE,
  author TEXT,
  source TEXT,
  category TEXT,
  industry TEXT NOT NULL,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- News categories table
CREATE TABLE IF NOT EXISTS news_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  industry TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- News sources table
CREATE TABLE IF NOT EXISTS news_sources (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  industry TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trending topics table
CREATE TABLE IF NOT EXISTS trending_topics (
  id SERIAL PRIMARY KEY,
  industry TEXT NOT NULL,
  topic TEXT NOT NULL, 
  keywords TEXT, 
  relevance_score NUMERIC(10,4), 
  source_articles_count INTEGER, 
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT uq_industry_topic UNIQUE (industry, topic) 
);

-- Industry events table
CREATE TABLE IF NOT EXISTS industry_events (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  location TEXT,
  website TEXT,
  industry TEXT NOT NULL,
  organizer TEXT,
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
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE trending_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE industry_events ENABLE ROW LEVEL SECURITY;

-- Create access policies
-- Example policy for authenticated users
CREATE POLICY "Allow public to read data" 
ON dental_procedures 
FOR SELECT 
TO anon 
USING (true);

-- Create similar policies for all tables

-- NOTE: The contacts table/tab should remain private. If/when a contacts table is added, ensure its SELECT policy is restricted to authenticated users only:
-- Example:
-- CREATE POLICY "Allow authenticated users to read contacts" 
-- ON contacts 
-- FOR SELECT 
-- TO authenticated 
-- USING (true);

-- Create access policies for events table
CREATE POLICY "Allow public to read events" 
ON events 
FOR SELECT 
TO anon 
USING (true);

CREATE POLICY "Allow authenticated users to insert events" 
ON events 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update their own events" 
ON events 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = (SELECT user_id FROM user_profiles WHERE user_profiles.id = events.created_by_user_id))
WITH CHECK (auth.uid() = (SELECT user_id FROM user_profiles WHERE user_profiles.id = events.created_by_user_id));

CREATE POLICY "Allow authenticated users to delete their own events" 
ON events 
FOR DELETE 
TO authenticated 
USING (auth.uid() = (SELECT user_id FROM user_profiles WHERE user_profiles.id = events.created_by_user_id));

-- Create access policies for companies table
CREATE POLICY "Allow public to read companies" 
ON companies 
FOR SELECT 
TO anon 
USING (true);

CREATE POLICY "Allow authenticated users to insert companies" 
ON companies 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update their own companies" 
ON companies 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = (SELECT user_id FROM user_profiles WHERE user_profiles.id = companies.created_by_user_id))
WITH CHECK (auth.uid() = (SELECT user_id FROM user_profiles WHERE user_profiles.id = companies.created_by_user_id));

CREATE POLICY "Allow authenticated users to delete their own companies" 
ON companies 
FOR DELETE 
TO authenticated 
USING (auth.uid() = (SELECT user_id FROM user_profiles WHERE user_profiles.id = companies.created_by_user_id));
