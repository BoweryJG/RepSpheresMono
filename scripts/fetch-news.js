import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const BRAVE_API_KEY = process.env.BRAVE_API_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing Supabase URL or Anon Key in environment variables');
    process.exit(1);
}

if (!BRAVE_API_KEY) {
    console.error('Error: Missing BRAVE_API_KEY in environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Common news sources for dental and aesthetic industries
const NEWS_SOURCES = [
    { name: 'Dental Tribune', url: 'https://www.dental-tribune.com', industry: 'dental' },
    { name: 'DrBicuspid', url: 'https://www.drbicuspid.com', industry: 'dental' },
    { name: 'Modern Aesthetics', url: 'https://modernaesthetics.com', industry: 'aesthetic' },
    { name: 'Plastic Surgery Practice', url: 'https://plasticsurgerypractice.com', industry: 'aesthetic' },
    { name: 'MedEsthetics', url: 'https://www.medestheticsmag.com', industry: 'aesthetic' },
    { name: 'ADA News', url: 'https://www.ada.org/publications/ada-news', industry: 'dental' }
];

// Common news categories
const NEWS_CATEGORIES = [
    { name: 'Industry News', industry: 'both' },
    { name: 'Technology', industry: 'both' },
    { name: 'Research', industry: 'both' },
    { name: 'Business', industry: 'both' },
    { name: 'Cosmetic Dentistry', industry: 'dental' },
    { name: 'Implants', industry: 'dental' },
    { name: 'Orthodontics', industry: 'dental' },
    { name: 'Injectables', industry: 'aesthetic' },
    { name: 'Body Contouring', industry: 'aesthetic' },
    { name: 'Skincare', industry: 'aesthetic' }
];

// Initialize news sources and categories in the database
async function initializeNewsSourcesAndCategories() {
    console.log('Initializing news sources and categories...');
    
    // Insert sources
    for (const source of NEWS_SOURCES) {
        const { data, error } = await supabase
            .from('news_sources')
            .upsert(
                { name: source.name, url: source.url, industry: source.industry },
                { onConflict: 'name' }
            );
        
        if (error) {
            console.error(`Error inserting source ${source.name}:`, error);
        }
    }
    
    // Insert categories
    for (const category of NEWS_CATEGORIES) {
        const { data, error } = await supabase
            .from('news_categories')
            .upsert(
                { 
                    name: category.name, 
                    description: `${category.name} in the ${category.industry === 'both' ? 'dental and aesthetic' : category.industry} industry`,
                    industry: category.industry
                },
                { onConflict: 'name' }
            );
        
        if (error) {
            console.error(`Error inserting category ${category.name}:`, error);
        }
    }
    
    console.log('News sources and categories initialized');
}

// Fetch news from Brave Search API
async function fetchNewsFromBrave(query, industry) {
    try {
        console.log(`Fetching news for query: ${query}`);
        
        const response = await axios.get('https://api.search.brave.com/res/v1/news/search', {
            params: { q: query, count: 10 },
            headers: { 'X-Subscription-Token': BRAVE_API_KEY }
        });
        
        const articles = response.data.web?.results || [];
        console.log(`Found ${articles.length} articles for query: ${query}`);
        
        // Process and store articles
        const processedArticles = articles.map(article => ({
            title: article.title,
            content: article.description,
            source: article.meta_url?.hostname || 'Unknown',
            url: article.url,
            image_url: article.thumbnail?.src || null,
            published_date: new Date(article.published_date).toISOString(),
            industry,
            category: determineCategory(article.title + ' ' + article.description, industry)
        }));
        
        await storeArticles(processedArticles);
        return processedArticles;
    } catch (error) {
        console.error('Error fetching news from Brave:', error.response?.data || error.message);
        return [];
    }
}

// Determine article category based on content
function determineCategory(content, industry) {
    if (!content) return 'Industry News';
    
    const lowerContent = content.toLowerCase();
    
    // Check for specific categories based on content
    if (industry === 'dental') {
        if (lowerContent.includes('implant') || lowerContent.includes('dental implant')) 
            return 'Implants';
        if (lowerContent.includes('cosmetic') || lowerContent.includes('whitening') || lowerContent.includes('veneers'))
            return 'Cosmetic Dentistry';
        if (lowerContent.includes('orthodont') || lowerContent.includes('braces') || lowerContent.includes('invisalign'))
            return 'Orthodontics';
    } else if (industry === 'aesthetic') {
        if (lowerContent.includes('botox') || lowerContent.includes('filler') || lowerContent.includes('injectable'))
            return 'Injectables';
        if (lowerContent.includes('body') || lowerContent.includes('contouring') || lowerContent.includes('sculpting'))
            return 'Body Contouring';
        if (lowerContent.includes('skin') || lowerContent.includes('facial') || lowerContent.includes('laser'))
            return 'Skincare';
    }
    
    // Check for general categories
    if (lowerContent.includes('research') || lowerContent.includes('study') || lowerContent.includes('clinical trial'))
        return 'Research';
    if (lowerContent.includes('tech') || lowerContent.includes('digital') || lowerContent.includes('AI') || lowerContent.includes('software'))
        return 'Technology';
    if (lowerContent.includes('business') || lowerContent.includes('market') || lowerContent.includes('revenue') || lowerContent.includes('acquisition'))
        return 'Business';
    
    return 'Industry News';
}

// Store articles in the database
async function storeArticles(articles) {
    if (!articles || articles.length === 0) return [];
    
    const storedArticles = [];
    
    for (const article of articles) {
        try {
            const { data, error } = await supabase
                .from('news_articles')
                .upsert(
                    { 
                        ...article,
                        // Mark the first article as featured
                        featured: storedArticles.length === 0
                    },
                    { onConflict: 'url' }
                )
                .select();
            
            if (error) throw error;
            
            if (data && data.length > 0) {
                storedArticles.push(data[0]);
            }
        } catch (error) {
            console.error('Error storing article:', error);
        }
    }
    
    return storedArticles;
}

// Main function to fetch and store news
async function fetchAndStoreNews() {
    try {
        // Initialize sources and categories
        await initializeNewsSourcesAndCategories();
        
        // Define search queries for each industry
        const queries = [
            { query: 'dental industry news', industry: 'dental' },
            { query: 'dental technology', industry: 'dental' },
            { query: 'dental research', industry: 'dental' },
            { query: 'aesthetic medicine news', industry: 'aesthetic' },
            { query: 'cosmetic procedures', industry: 'aesthetic' },
            { query: 'medical aesthetics research', industry: 'aesthetic' }
        ];
        
        // Fetch news for each query
        for (const { query, industry } of queries) {
            await fetchNewsFromBrave(query, industry);
            // Add a small delay between requests to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        console.log('News fetching and storage complete!');
    } catch (error) {
        console.error('Error in fetchAndStoreNews:', error);
    }
}

// Run the script
fetchAndStoreNews().catch(console.error);
