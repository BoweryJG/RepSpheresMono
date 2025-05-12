/**
 * Populate News Articles Script
 * 
 * This script populates the news_articles table in Supabase with recent articles
 * for both dental and aesthetic industries. It fetches 10 articles for each industry
 * from the past week, alternating between Brave search and Firecrawl.
 */

import { supabaseClient } from './supabaseClient.js';
import { fetchNewsFromExternalSources } from '../newsService.js';

/**
 * Populate news articles for a specific industry
 * @param {string} industry - 'dental' or 'aesthetic'
 * @param {string} specificQuery - Optional specific query to focus on (e.g., 'dental implants')
 * @returns {Promise<Array>} - Array of stored articles
 */
export const populateNewsArticlesForIndustry = async (industry, specificQuery = null) => {
  try {
    console.log(`Populating news articles for ${industry} industry${specificQuery ? ` (${specificQuery})` : ''}...`);
    
    // Build the search query
    let searchQuery = specificQuery 
      ? `${industry} ${specificQuery}` 
      : `${industry} industry`;
    
    // Add time constraint to get only recent news
    searchQuery += " past week";
    
    // Fetch articles from external sources
    const articles = await fetchNewsFromExternalSources(industry, {
      limit: 10,
      searchTerm: searchQuery
    });
    
    if (!articles || articles.length === 0) {
      console.log(`No articles found for ${industry} industry${specificQuery ? ` (${specificQuery})` : ''}`);
      return [];
    }
    
    console.log(`Found ${articles.length} articles for ${industry} industry${specificQuery ? ` (${specificQuery})` : ''}`);
    
    // Mark the first article as featured
    if (articles.length > 0) {
      articles[0].featured = true;
    }
    
    // Store articles in Supabase
    const storedArticles = [];
    for (const article of articles) {
      const { data, error } = await supabaseClient
        .from('news_articles')
        .upsert(article, { 
          onConflict: 'url, industry',
          returning: 'minimal'
        });
      
      if (error) {
        console.error(`Error storing article "${article.title}":`, error);
      } else {
        storedArticles.push(article);
        console.log(`Stored article: ${article.title}`);
      }
    }
    
    return storedArticles;
  } catch (error) {
    console.error(`Error populating news articles for ${industry} industry:`, error);
    return [];
  }
};

/**
 * Populate news articles for both dental and aesthetic industries
 * @returns {Promise<Object>} - Object containing arrays of stored articles for each industry
 */
export const populateAllNewsArticles = async () => {
  try {
    console.log('Starting news articles population process...');
    
    // Populate dental articles (general and implant-specific)
    const dentalArticles = await populateNewsArticlesForIndustry('dental');
    const dentalImplantArticles = await populateNewsArticlesForIndustry('dental', 'implants');
    
    // Populate aesthetic articles
    const aestheticArticles = await populateNewsArticlesForIndustry('aesthetic');
    
    console.log('News articles population complete!');
    console.log(`Stored ${dentalArticles.length} general dental articles`);
    console.log(`Stored ${dentalImplantArticles.length} dental implant articles`);
    console.log(`Stored ${aestheticArticles.length} aesthetic articles`);
    
    return {
      dental: dentalArticles,
      dentalImplants: dentalImplantArticles,
      aesthetic: aestheticArticles
    };
  } catch (error) {
    console.error('Error populating all news articles:', error);
    return {
      dental: [],
      dentalImplants: [],
      aesthetic: []
    };
  }
};

// If this file is run directly, execute the population process
if (import.meta.url === import.meta.main) {
  populateAllNewsArticles()
    .then(() => {
      console.log('News articles population script completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('Error running news articles population script:', error);
      process.exit(1);
    });
}
