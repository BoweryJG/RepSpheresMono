// This script populates the Supabase database with mock data for companies and news
// It uses the Brave search and Firecrawl MCP tools to fetch real data where possible
// and falls back to generated mock data when necessary

import { fetchCompanyData } from '../searchService.js';
import { getNewsArticles, getFeaturedNewsArticles, getTrendingTopics, getUpcomingEvents } from '../newsService.js';

/**
 * Main function to populate all data
 */
export async function populateAllData() {
  console.log('Starting data population process...');
  
  try {
    // Populate dental industry data
    await populateIndustryData('dental');
    
    // Populate aesthetic industry data
    await populateIndustryData('aesthetic');
    
    console.log('Data population completed successfully!');
  } catch (error) {
    console.error('Error during data population:', error);
  }
}

/**
 * Populate data for a specific industry
 * @param {string} industry - The industry to populate data for (dental or aesthetic)
 */
async function populateIndustryData(industry) {
  console.log(`Populating ${industry} industry data...`);
  
  try {
    // Populate company data
    console.log(`Fetching ${industry} company data...`);
    const companies = await fetchCompanyData(industry, 10);
    console.log(`Retrieved ${companies.length} ${industry} companies`);
    
    // Populate news articles
    console.log(`Fetching ${industry} news articles...`);
    const newsArticles = await getNewsArticles(industry, { limit: 15 });
    console.log(`Retrieved ${newsArticles.length} ${industry} news articles`);
    
    // Populate featured news
    console.log(`Fetching ${industry} featured news...`);
    const featuredNews = await getFeaturedNewsArticles(industry, 3);
    console.log(`Retrieved ${featuredNews.length} ${industry} featured news articles`);
    
    // Populate trending topics
    console.log(`Fetching ${industry} trending topics...`);
    const trendingTopics = await getTrendingTopics(industry, 8);
    console.log(`Retrieved ${trendingTopics.length} ${industry} trending topics`);
    
    // Populate upcoming events
    console.log(`Fetching ${industry} upcoming events...`);
    const upcomingEvents = await getUpcomingEvents(industry, 5);
    console.log(`Retrieved ${upcomingEvents.length} ${industry} upcoming events`);
    
    console.log(`${industry} industry data population completed!`);
  } catch (error) {
    console.error(`Error populating ${industry} industry data:`, error);
  }
}
