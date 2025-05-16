import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the project root (one level up from scripts directory)
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing Supabase URL or Anon Key in environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Sample news data
const SAMPLE_NEWS_ARTICLES = [
    {
        title: "New Breakthrough in Dental Implant Technology",
        content: "Researchers have developed a new type of dental implant that integrates with bone more effectively, reducing recovery time by 40%.",
        source: "dental-tribune.com",
        url: "https://www.dental-tribune.com/news/breakthrough-dental-implant-technology",
        image_url: "https://example.com/images/dental-implant.jpg",
        published_date: new Date('2025-05-10').toISOString(),
        industry: "dental",
        category: "Implants",
        featured: true
    },
    {
        title: "The Rise of Non-Invasive Aesthetic Procedures",
        content: "Non-invasive aesthetic treatments are seeing record growth as patients seek minimal downtime solutions for facial rejuvenation.",
        source: "modernaesthetics.com",
        url: "https://modernaesthetics.com/news/non-invasive-aesthetic-growth",
        image_url: "https://example.com/images/aesthetic-treatments.jpg",
        published_date: new Date('2025-05-12').toISOString(),
        industry: "aesthetic",
        category: "Injectables"
    },
    {
        title: "Global Dental Market to Reach $60B by 2026",
        content: "The global dental market is projected to grow at a CAGR of 7.2% from 2021 to 2026, driven by increasing demand for cosmetic dentistry.",
        source: "drbicuspid.com",
        url: "https://www.drbicuspid.com/market-trends/dental-market-growth-2026",
        published_date: new Date('2025-05-08').toISOString(),
        industry: "dental",
        category: "Business"
    },
    {
        title: "New Study: Long-Term Effects of Botox",
        content: "A comprehensive 10-year study reveals new insights into the long-term effects and safety profile of Botox treatments.",
        source: "plasticsurgerypractice.com",
        url: "https://plasticsurgerypractice.com/research/botox-long-term-effects",
        image_url: "https://example.com/images/botox-study.jpg",
        published_date: new Date('2025-05-05').toISOString(),
        industry: "aesthetic",
        category: "Injectables"
    },
    {
        title: "AI in Dentistry: The Future of Patient Care",
        content: "Artificial intelligence is transforming dental practices, from diagnostics to treatment planning and patient management.",
        source: "ada.org",
        url: "https://www.ada.org/publications/ada-news/ai-in-dentistry",
        published_date: new Date('2025-05-15').toISOString(),
        industry: "dental",
        category: "Technology"
    }
];

// Sample news categories
const SAMPLE_CATEGORIES = [
    { name: 'Industry News', description: 'General news about the dental and aesthetic industries', industry: 'both' },
    { name: 'Technology', description: 'Latest technological advancements in dental and aesthetic fields', industry: 'both' },
    { name: 'Research', description: 'Clinical studies and research findings', industry: 'both' },
    { name: 'Business', description: 'Market trends and business news', industry: 'both' },
    { name: 'Cosmetic Dentistry', description: 'News about cosmetic dental procedures', industry: 'dental' },
    { name: 'Implants', description: 'Dental implants and related technologies', industry: 'dental' },
    { name: 'Orthodontics', description: 'Braces, aligners, and orthodontic treatments', industry: 'dental' },
    { name: 'Injectables', description: 'Botox, fillers, and other injectable treatments', industry: 'aesthetic' },
    { name: 'Body Contouring', description: 'Non-surgical body shaping procedures', industry: 'aesthetic' },
    { name: 'Skincare', description: 'Advanced skincare treatments and products', industry: 'aesthetic' }
];

// Sample news sources
const SAMPLE_SOURCES = [
    { name: 'Dental Tribune', url: 'https://www.dental-tribune.com', industry: 'dental' },
    { name: 'DrBicuspid', url: 'https://www.drbicuspid.com', industry: 'dental' },
    { name: 'Modern Aesthetics', url: 'https://modernaesthetics.com', industry: 'aesthetic' },
    { name: 'Plastic Surgery Practice', url: 'https://plasticsurgerypractice.com', industry: 'aesthetic' },
    { name: 'MedEsthetics', url: 'https://www.medestheticsmag.com', industry: 'aesthetic' },
    { name: 'ADA News', url: 'https://www.ada.org/publications/ada-news', industry: 'dental' }
];

async function checkAndPopulateNews() {
    try {
        console.log('Checking database for news tables...');
        
        // Check if tables exist by trying to select from them
        let tablesExist = {
            news_articles: false,
            news_categories: false,
            news_sources: false
        };

        try {
            // Try to select from each table
            const { data: articlesData, error: articlesError } = await supabase
                .from('news_articles')
                .select('*')
                .limit(1);
            tablesExist.news_articles = !articlesError;
        } catch (e) {
            tablesExist.news_articles = false;
        }

        try {
            const { data: categoriesData, error: categoriesError } = await supabase
                .from('news_categories')
                .select('*')
                .limit(1);
            tablesExist.news_categories = !categoriesError;
        } catch (e) {
            tablesExist.news_categories = false;
        }

        try {
            const { data: sourcesData, error: sourcesError } = await supabase
                .from('news_sources')
                .select('*')
                .limit(1);
            tablesExist.news_sources = !sourcesError;
        } catch (e) {
            tablesExist.news_sources = false;
        }

        console.log('Tables exist status:', tablesExist);
        
        // Create tables if they don't exist
        if (!tablesExist.news_articles || !tablesExist.news_categories || !tablesExist.news_sources) {
            console.log('Creating missing tables...');
            await createTables();
        }
        
        // Check if we have any articles
        let articleCount = 0;
        try {
            const { count, error } = await supabase
                .from('news_articles')
                .select('*', { count: 'exact', head: true });
            
            if (!error && count !== null) {
                articleCount = count;
            }
        } catch (e) {
            console.error('Error counting articles:', e);
        }
        
        if (articleCount === 0) {
            console.log('No articles found. Populating with sample data...');
            await populateSampleData();
        } else {
            console.log(`Found ${articleCount} existing articles.`);
            
            // List the articles using direct Supabase client
            const { data: articles, error: articlesError } = await supabase
                .from('news_articles')
                .select('*')
                .order('published_date', { ascending: false })
                .limit(5);
                
            if (articlesError) {
                console.error('Error fetching articles:', articlesError);
            } else {
                console.log('\nLatest articles:');
                articles.forEach(article => {
                    console.log(`- ${article.title} (${new Date(article.published_date).toLocaleDateString()})`);
                });
            }
        }
        
    } catch (error) {
        console.error('Error in checkAndPopulateNews:', error);
    }
}

async function createTables() {
    try {
        // For now, we'll just log that we would create tables here
        // In a real implementation, you would need to use the Supabase SQL editor
        // or a migration tool to create these tables
        console.log('Please create the following tables in your Supabase SQL editor:');
        console.log(`
-- Run this in your Supabase SQL Editor:

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create news_articles table
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

-- Create news_categories table
CREATE TABLE IF NOT EXISTS public.news_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    industry TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create news_sources table
CREATE TABLE IF NOT EXISTS public.news_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    url TEXT,
    industry TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for news_articles
DROP TRIGGER IF EXISTS update_news_articles_updated_at ON public.news_articles;
CREATE TRIGGER update_news_articles_updated_at
BEFORE UPDATE ON public.news_articles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
        `);
        
        // Since we can't create tables programmatically, we'll assume they'll be created manually
        // and continue with the script
        console.log('\nAfter creating the tables, please run this script again to populate them with sample data.');
        process.exit(0);
        
    } catch (error) {
        console.error('Error setting up database:', error);
        throw error;
    }
}

async function populateSampleData() {
    try {
        console.log('Preparing to insert sample data...');
        
        // Insert categories
        console.log('Inserting categories...');
        for (const category of SAMPLE_CATEGORIES) {
            try {
                const { data, error } = await supabase
                    .from('news_categories')
                    .upsert(category, { onConflict: 'name' });
                    
                if (error) {
                    console.error('Error inserting category:', category.name, error);
                } else {
                    console.log(`- Added/Updated category: ${category.name}`);
                }
            } catch (e) {
                console.error(`Error with category ${category.name}:`, e);
            }
        }
        
        // Insert sources
        console.log('\nInserting sources...');
        for (const source of SAMPLE_SOURCES) {
            try {
                const { data, error } = await supabase
                    .from('news_sources')
                    .upsert(source, { onConflict: 'name' });
                    
                if (error) {
                    console.error('Error inserting source:', source.name, error);
                } else {
                    console.log(`- Added/Updated source: ${source.name}`);
                }
            } catch (e) {
                console.error(`Error with source ${source.name}:`, e);
            }
        }
        
        // Insert articles
        console.log('\nInserting articles...');
        for (const article of SAMPLE_NEWS_ARTICLES) {
            try {
                const { data, error } = await supabase
                    .from('news_articles')
                    .upsert(article, { onConflict: 'url' });
                    
                if (error) {
                    console.error('Error inserting article:', article.title, error);
                } else {
                    console.log(`- Added/Updated article: ${article.title}`);
                }
            } catch (e) {
                console.error(`Error with article ${article.title}:`, e);
            }
            
            // Add a small delay between inserts
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        console.log('\nSuccessfully populated database with sample news data');
        
    } catch (error) {
        console.error('Error populating sample data:', error);
        throw error;
    }
}

// Run the script
checkAndPopulateNews().catch(console.error);
