import 'dotenv/config'; // Load .env file into process.env

/**
 * Initial Data Loader Script
 * 
 * This script populates the Supabase database with initial data for companies and news articles
 * using Brave search and Firecrawl. It fetches data for both dental and aesthetic industries.
 */

import { fetchCompanyData } from '../searchService.js';
import { fetchNewsFromExternalSources } from '../newsService.js';
import { supabaseClient } from './supabaseClient.js';

// Configuration
const COMPANY_LIMIT = 20; // Number of companies to fetch per industry
const NEWS_LIMIT = 30;    // Number of news articles to fetch per industry
const INDUSTRIES = ['dental', 'aesthetic'];

/**
 * Load company data for the specified industry
 * @param {string} industry - Industry to load data for
 * @returns {Promise<Array>} - Array of loaded companies
 */
async function loadCompanyData(industry) {
  console.log(`Loading ${industry} company data...`);
  
  try {
    // Fetch company data using the searchService
    const companies = await fetchCompanyData(industry, COMPANY_LIMIT);
    
    console.log(`Successfully loaded ${companies.length} ${industry} companies`);
    return companies;
  } catch (error) {
    console.error(`Error loading ${industry} company data:`, error);
    return [];
  }
}

/**
 * Load news data for the specified industry
 * @param {string} industry - Industry to load data for
 * @returns {Promise<Array>} - Array of loaded news articles
 */
async function loadNewsData(industry) {
  console.log(`Loading ${industry} news data...`);
  
  try {
    // Fetch news data using the newsService
    const articles = await fetchNewsFromExternalSources(industry, { limit: NEWS_LIMIT });
    
    // Mark some articles as featured
    if (articles.length > 0) {
      const featuredCount = Math.min(3, articles.length);
      for (let i = 0; i < featuredCount; i++) {
        articles[i].featured = true;
      }
    }
    
    console.log(`Successfully loaded ${articles.length} ${industry} news articles`);
    return articles;
  } catch (error) {
    console.error(`Error loading ${industry} news data:`, error);
    return [];
  }
}

/**
 * Load trending topics for the specified industry
 * @param {string} industry - Industry to load data for
 * @returns {Promise<Array>} - Array of trending topics
 */
async function loadTrendingTopics(industry) {
  console.log(`Generating trending topics for ${industry}...`);
  
  try {
    // Generate trending topics based on news articles
    let articles = [];
    const searchTerm = `${industry} industry news latest developments`; // More specific search term for topics

    if (process.env.NODE_ENV !== 'production' && typeof use_mcp_tool === 'function') {
      console.log(`[Dev Only] Attempting to use Firecrawl search for trending topics in ${industry}`);
      try {
        const firecrawlResults = await use_mcp_tool({
          server_name: 'github.com/mendableai/firecrawl-mcp-server',
          tool_name: 'firecrawl_search',
          arguments: {
            query: searchTerm,
            limit: 50, // Fetch more for better keyword analysis
            scrapeOptions: { formats: ['markdown'] }
          }
        });
        // Assuming firecrawlResults is an array of objects with a markdown property
        if (firecrawlResults && firecrawlResults.length > 0) {
          articles = firecrawlResults.map(fr => ({ 
            title: fr.title || '', // Firecrawl search might provide title directly
            content: fr.markdown || '', // Or fr.content if that's the field
            summary: fr.description || ''
          }));
          console.log(`[Dev Only] Fetched ${articles.length} potential articles/pages via Firecrawl search for trending topics.`);
        }
      } catch (fcError) {
        console.warn('[Dev Only] Firecrawl search for trending topics failed, will fall back to Brave Search.', fcError);
      }
    }

    if (articles.length === 0) {
      console.log(`Falling back to Brave Search for trending topics in ${industry}.`);
      // Use the local fetchFromBraveSearch in this file
      const braveSearchResults = await fetchFromBraveSearch(searchTerm, 50); 
      // We need to adapt braveSearchResults to look like articles for extractKeywords
      // Brave search results usually have { title, description, url }
      articles = braveSearchResults.map(bsr => ({ 
        title: bsr.title || '', 
        content: bsr.description || '', // Using description as content for keyword extraction
        summary: bsr.description || ''
      }));
      console.log(`Fetched ${articles.length} results via Brave Search for trending topics.`);
    }
    
    if (articles.length === 0) {
      console.log(`No articles found to generate trending topics for ${industry}.`);
      return [];
    }

    // Extract keywords from article titles and content
    const keywords = extractKeywords(articles);
    
    // Create trending topics from top keywords, aligning with schema.sql
    const trendingTopics = keywords.slice(0, 10).map((keyword, index) => {
      const related = generateRelatedTerms(keyword.word, keywords);
      return {
        // id is SERIAL PRIMARY KEY, no need to set it explicitly during insert/upsert
        topic: keyword.word,
        industry: industry,
        relevance_score: keyword.count, // Use keyword count as relevance score for now
        source_articles_count: keyword.count, // Use keyword count as source articles count
        keywords: related.join(', ') // Store related terms as comma-separated string
        // Removed: popularity, trend_direction, percentage_change, related_terms (array)
      };
    });
    
    // Store trending topics in Supabase
    for (const topic of trendingTopics) {
      const { error } = await supabaseClient
        .from('trending_topics')
        .upsert(topic, { onConflict: 'topic, industry' });
      
      if (error) {
        console.error('Error storing trending topic:', error);
      }
    }
    
    console.log(`Successfully generated ${trendingTopics.length} trending topics for ${industry}`);
    return trendingTopics;
  } catch (error) {
    console.error(`Error generating trending topics for ${industry}:`, error);
    return [];
  }
}

/**
 * Extract keywords from articles
 * @param {Array} articles - Array of news articles
 * @returns {Array} - Array of keyword objects with word and count
 */
function extractKeywords(articles) {
  // Common words to exclude
  const stopWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with',
    'by', 'about', 'as', 'of', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
    'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'shall',
    'should', 'may', 'might', 'must', 'can', 'could', 'this', 'that', 'these',
    'those', 'it', 'its', 'they', 'them', 'their', 'he', 'him', 'his', 'she',
    'her', 'hers', 'we', 'us', 'our', 'you', 'your', 'yours'
  ]);
  
  // Count word occurrences
  const wordCounts = {};
  
  for (const article of articles) {
    // Combine title and content
    const text = `${article.title} ${article.content || article.summary || ''}`;
    
    // Split into words and count
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .split(/\s+/); // Split by whitespace
    
    for (const word of words) {
      // Skip short words and stop words
      if (word.length < 4 || stopWords.has(word)) continue;
      
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    }
  }
  
  // Convert to array and sort by count
  const keywords = Object.entries(wordCounts)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count);
  
  return keywords;
}

/**
 * Generate related terms for a keyword
 * @param {string} keyword - Main keyword
 * @param {Array} allKeywords - All extracted keywords
 * @returns {Array} - Array of related terms
 */
function generateRelatedTerms(keyword, allKeywords) {
  // Filter keywords that might be related (exclude the keyword itself)
  const potentialRelated = allKeywords.filter(k => 
    k.word !== keyword && 
    (k.word.includes(keyword) || keyword.includes(k.word) || k.count > allKeywords[0].count / 2)
  );
  
  // Take up to 5 related terms
  return potentialRelated.slice(0, 5).map(k => k.word);
}

/**
 * Load upcoming events for the specified industry
 * @param {string} industry - Industry to load data for
 * @returns {Promise<Array>} - Array of upcoming events
 */
async function loadUpcomingEvents(industry) {
  console.log(`Generating upcoming events for ${industry}...`);
  
  try {
    // Search for industry events using Brave search
    const searchQuery = `${industry} industry conferences events 2025`;
    const braveResults = await fetchFromBraveSearch(searchQuery, 10);
    
    const events = [];
    
    for (const result of braveResults) {
      try {
        // Scrape event details using Firecrawl - ONLY IN DEVELOPMENT
        let eventInfo;
        if (process.env.NODE_ENV !== 'production') {
          console.log(`[Dev Only] Attempting to scrape event details via Firecrawl for: ${result.url}`)
          // Ensure use_mcp_tool is defined or handled if you intend to use it in dev
          // For now, we assume this block might not run if use_mcp_tool is not set up for Node scripts
          if (typeof use_mcp_tool === 'function') { 
            const scrapeResult = await use_mcp_tool({
              server_name: 'github.com/mendableai/firecrawl-mcp-server',
              tool_name: 'firecrawl_scrape',
              arguments: {
                url: result.url,
                formats: ['markdown'],
                onlyMainContent: true
              }
            });
            if (scrapeResult && scrapeResult.markdown) {
              eventInfo = extractEventInfo(scrapeResult.markdown, result.title, result.url);
            }
          } else {
            console.warn('[Dev Only] use_mcp_tool is not available. Skipping Firecrawl scrape.');
            // Fallback: Use basic info from Brave result if Firecrawl fails or is skipped
            eventInfo = { name: result.title, url: result.url, date: 'N/A', location: 'N/A', description: result.description || result.title };
          }
        } else {
          console.log('[Prod] Skipping Firecrawl scrape for event details.');
          // Fallback for production: Use basic info from Brave result
          eventInfo = { name: result.title, url: result.url, date: 'N/A', location: 'N/A', description: result.description || result.title };
        }

        if (eventInfo && eventInfo.name && result.url) { // Ensure we have a title and URL
          // Prepare data for Supabase, ensuring correct types and handling missing values
          const supabaseEvent = {
            title: eventInfo.name, // Map name to title
            description: eventInfo.description || null,
            url: result.url, // Use the result URL which is guaranteed
            // Attempt to parse dates, default to null if invalid
            event_date_start: eventInfo.start_date && !isNaN(new Date(eventInfo.start_date)) ? new Date(eventInfo.start_date).toISOString() : null,
            event_date_end: eventInfo.end_date && !isNaN(new Date(eventInfo.end_date)) ? new Date(eventInfo.end_date).toISOString() : null,
            location: eventInfo.location === 'N/A' ? null : eventInfo.location, // Handle 'N/A'
            city: null, // Add if extractEventInfo provides it
            country: null, // Add if extractEventInfo provides it
            industry: industry, // Already correct
            source: 'BraveSearch', // Indicate source
            // organizer: eventInfo.organizer || null // Add if extractEventInfo provides it
          };
          events.push(supabaseEvent);
        }
      } catch (error) {
        console.error('Error processing event:', error);
      }
      
      // If we have enough events, stop
      if (events.length >= 5) {
        break;
      }
    }
    
    // If we couldn't find enough events, generate some mock events
    if (events.length < 5) {
      const mockEvents = generateMockEvents(industry, 5 - events.length);
      events.push(...mockEvents);
    }
    
    // Store events in Supabase
    for (const event of events) {
      const { error } = await supabaseClient
        .from('events') // Corrected table name
        .upsert(event, { 
          onConflict: 'url', // Correct conflict target
          ignoreDuplicates: false // Ensure updates happen if URL exists
         }); 
      
      if (error) {
        console.error('Error storing event:', error);
      }
    }
    
    console.log(`Successfully generated ${events.length} upcoming events for ${industry}`);
    return events;
  } catch (error) {
    console.error(`Error generating upcoming events for ${industry}:`, error);
    return [];
  }
}

/**
 * Extract event information from content
 * @param {string} content - Content to extract event info from
 * @param {string} title - Event title
 * @param {string} url - Event URL
 * @returns {Object} - Event information
 */
function extractEventInfo(content, title, url) {
  const eventInfo = {
    name: title,
    description: '',
    start_date: null,
    end_date: null,
    location: '',
    organizer: ''
  };
  
  // Extract description (first 200 characters)
  if (content.length > 0) {
    eventInfo.description = content.substring(0, 300).replace(/\n/g, ' ') + '...';
  }
  
  // Extract date range
  const dateRangePatterns = [
    /(\w+\s+\d{1,2}(?:\s*-\s*\d{1,2})?,\s*\d{4})/i,
    /(\w+\s+\d{1,2}\s*-\s*\w+\s+\d{1,2},\s*\d{4})/i,
    /(\d{1,2}\s*-\s*\d{1,2}\s+\w+,\s*\d{4})/i
  ];
  
  for (const pattern of dateRangePatterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      const dateText = match[1];
      
      // Try to parse start and end dates
      if (dateText.includes('-')) {
        const [startText, endText] = dateText.split('-').map(d => d.trim());
        
        // If end text doesn't have month/year, copy from start text
        let fullEndText = endText;
        if (!endText.includes(',')) {
          const month = startText.match(/(\w+)/)[1];
          const year = startText.match(/(\d{4})/)[1];
          fullEndText = `${endText} ${month}, ${year}`;
        }
        
        try {
          eventInfo.start_date = new Date(startText).toISOString().split('T')[0];
          eventInfo.end_date = new Date(fullEndText).toISOString().split('T')[0];
        } catch (e) {
          console.error('Error parsing date range:', e);
        }
      } else {
        try {
          const date = new Date(dateText);
          eventInfo.start_date = date.toISOString().split('T')[0];
          
          // Set end date to start date + 2 days if not found
          const endDate = new Date(date);
          endDate.setDate(endDate.getDate() + 2);
          eventInfo.end_date = endDate.toISOString().split('T')[0];
        } catch (e) {
          console.error('Error parsing single date:', e);
        }
      }
      
      break;
    }
  }
  
  // If no dates found, generate random future dates
  if (!eventInfo.start_date) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 180) + 30); // 30-210 days in future
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 3) + 1); // 1-3 days long
    
    eventInfo.start_date = startDate.toISOString().split('T')[0];
    eventInfo.end_date = endDate.toISOString().split('T')[0];
  }
  
  // Extract location
  const locationPatterns = [
    /location:\s*([^,.]+(?:,[^,.]+)?)/i,
    /venue:\s*([^,.]+(?:,[^,.]+)?)/i,
    /in\s+([^,.]+(?:,[^,.]+)?)/i,
    /at\s+([^,.]+(?:,[^,.]+)?)/i
  ];
  
  for (const pattern of locationPatterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      eventInfo.location = match[1].trim();
      break;
    }
  }
  
  // Extract organizer
  const organizerPatterns = [
    /organized by\s+([^,.]+)/i,
    /organizer:\s*([^,.]+)/i,
    /hosted by\s+([^,.]+)/i
  ];
  
  for (const pattern of organizerPatterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      eventInfo.organizer = match[1].trim();
      break;
    }
  }
  
  return eventInfo;
}

/**
 * Generate mock events
 * @param {string} industry - Industry
 * @param {number} count - Number of events to generate
 * @returns {Array} - Array of mock events
 */
function generateMockEvents(industry, count) {
  const events = [];
  
  // Event name templates
  const eventTemplates = [
    '[INDUSTRY] Innovation Summit [YEAR]',
    'International [INDUSTRY] Conference',
    '[INDUSTRY] Professionals Expo',
    'Global [INDUSTRY] Forum',
    'Advanced [INDUSTRY] Techniques Symposium',
    '[INDUSTRY] Business & Technology Conference',
    'Future of [INDUSTRY] Summit',
    '[INDUSTRY] Leaders Congress',
    '[INDUSTRY] World Conference',
    'Next-Gen [INDUSTRY] Expo'
  ];
  
  // Locations
  const locations = [
    'Las Vegas, NV',
    'Chicago, IL',
    'New York, NY',
    'San Francisco, CA',
    'Miami, FL',
    'Boston, MA',
    'Orlando, FL',
    'Washington, DC',
    'Dallas, TX',
    'Los Angeles, CA'
  ];
  
  // Organizers
  const organizers = [
    `${industry.charAt(0).toUpperCase() + industry.slice(1)} Association of America`,
    `International ${industry.charAt(0).toUpperCase() + industry.slice(1)} Organization`,
    `${industry.charAt(0).toUpperCase() + industry.slice(1)} Industry Group`,
    `Global ${industry.charAt(0).toUpperCase() + industry.slice(1)} Alliance`,
    `${industry.charAt(0).toUpperCase() + industry.slice(1)} Professionals Network`
  ];
  
  // Generate events
  for (let i = 0; i < count; i++) {
    // Generate random future date
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 180) + 30); // 30-210 days in future
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 3) + 1); // 1-3 days long
    
    // Select random template and customize
    let name = eventTemplates[Math.floor(Math.random() * eventTemplates.length)];
    name = name
      .replace('[INDUSTRY]', industry.charAt(0).toUpperCase() + industry.slice(1))
      .replace('[YEAR]', new Date().getFullYear().toString());
    
    // Create event object
    const event = {
      title: name,
      description: `Join industry leaders and professionals for the premier ${industry} event of the year. Featuring keynote speakers, workshops, networking opportunities, and the latest innovations in ${industry} technology and practices.`,
      url: `https://www.${industry}conference${Math.floor(Math.random() * 100)}.com`,
      event_date_start: startDate.toISOString().split('T')[0],
      event_date_end: endDate.toISOString().split('T')[0],
      location: locations[Math.floor(Math.random() * locations.length)],
      city: null, // Add if extractEventInfo provides it
      country: null, // Add if extractEventInfo provides it
      industry: industry,
      source: 'Mock',
      // organizer: organizers[Math.floor(Math.random() * organizers.length)]
    };
    
    events.push(event);
  }
  
  return events;
}

/**
 * Fetch data from Brave Search API (Directly)
 * @param {string} query - Search query
 * @param {number} count - Number of results to return
 * @returns {Promise<Array>} - Array of search results
 */
async function fetchFromBraveSearch(query, count = 10) {
  const apiKey = process.env.BRAVE_SEARCH_API_KEY || process.env.VITE_BRAVE_SEARCH_API_KEY;
  if (!apiKey) {
    console.error('Brave Search API key not found in environment variables for initialDataLoader.js');
    return [];
  }

  const effectiveCount = Math.min(count, 20); // Cap at 20
  const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${effectiveCount}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-Subscription-Token': apiKey,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Brave Search API request failed with status ${response.status}: ${errorBody}`);
      return [];
    }

    const data = await response.json();
    return data.web && data.web.results ? data.web.results.map(r => ({ title: r.title, url: r.url, description: r.description })) : [];
  } catch (error) {
    console.error('Error fetching from Brave Search:', error);
    return [];
  }
}

/**
 * Main function to load all data
 */
async function loadAllData() {
  console.log('Starting initial data load...');
  
  for (const industry of INDUSTRIES) {
    console.log(`\n=== Loading ${industry.toUpperCase()} industry data ===\n`);
    
    // Load company data
    await loadCompanyData(industry);
    
    // Load news data
    await loadNewsData(industry);
    
    // Load trending topics
    await loadTrendingTopics(industry);
    
    // Load upcoming events
    await loadUpcomingEvents(industry);
  }
  
  console.log('\nInitial data load complete!');
}

// Run the data loader
loadAllData()
  .then(() => {
    console.log('Data loading process finished successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error in data loading process:', error);
    process.exit(1);
  });
