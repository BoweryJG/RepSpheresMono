-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Companies table
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    industry TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Procedures table
CREATE TABLE IF NOT EXISTS public.procedures (
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
CREATE TABLE IF NOT EXISTS public.procedure_companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    procedure_id UUID REFERENCES public.procedures(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(procedure_id, company_id)
);

-- Create triggers for updated_at
DO $$
BEGIN
    -- Drop existing triggers if they exist
    DROP TRIGGER IF EXISTS update_companies_updated_at ON public.companies;
    DROP TRIGGER IF EXISTS update_procedures_updated_at ON public.procedures;
    
    -- Create new triggers
    EXECUTE 'CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON public.companies
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()';
    
    EXECUTE 'CREATE TRIGGER update_procedures_updated_at
    BEFORE UPDATE ON public.procedures
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()';
END $$;

-- News Articles table
CREATE TABLE IF NOT EXISTS public.news_articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT,
    source TEXT,
    url TEXT UNIQUE,
    image_url TEXT,
    published_date TIMESTAMP WITH TIME ZONE,
    industry TEXT NOT NULL,
    category TEXT,
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- News Categories table
CREATE TABLE IF NOT EXISTS public.news_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    industry TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- News Sources table
CREATE TABLE IF NOT EXISTS public.news_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    url TEXT,
    industry TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trigger for news_articles updated_at
CREATE OR REPLACE TRIGGER update_news_articles_updated_at
BEFORE UPDATE ON public.news_articles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_news_articles_industry ON public.news_articles(industry);
CREATE INDEX IF NOT EXISTS idx_news_articles_category ON public.news_articles(category);
CREATE INDEX IF NOT EXISTS idx_news_articles_published_date ON public.news_articles(published_date DESC);
CREATE INDEX IF NOT EXISTS idx_news_articles_featured ON public.news_articles(featured) WHERE featured = true;
