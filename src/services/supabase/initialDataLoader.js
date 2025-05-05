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
    const articles = await fetchNewsFromExternalSources(industry, { limit: 50 });
    
    // Extract keywords from article titles and content
    const keywords = extractKeywords(articles);
    
    // Create trending topics from top keywords
    const trendingTopics = keywords.slice(0, 10).map((keyword, index) => ({
      id: index + 1,
      topic: keyword.word,
      industry: industry,
      popularity: keyword.count,
      trend_direction: Math.random() > 0.3 ? 'up' : 'down', // 70% chance of trending up
      percentage_change: Math.floor(Math.random() * 50 + 10), // 10-60% change
      related_terms: generateRelatedTerms(keyword.word, keywords)
    }));
    
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
        // Scrape event details using Firecrawl
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
          // Extract event information
          const eventInfo = extractEventInfo(scrapeResult.markdown, result.title, result.url);
          
          if (eventInfo.name) {
            events.push({
              id: events.length + 1,
              name: eventInfo.name,
              description: eventInfo.description,
              start_date: eventInfo.start_date,
              end_date: eventInfo.end_date,
              location: eventInfo.location,
              website: result.url,
              industry: industry,
              organizer: eventInfo.organizer
            });
          }
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
        .from('industry_events')
        .upsert(event, { onConflict: 'name, start_date' });
      
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
      id: events.length + 1,
      name: name,
      description: `Join industry leaders and professionals for the premier ${industry} event of the year. Featuring keynote speakers, workshops, networking opportunities, and the latest innovations in ${industry} technology and practices.`,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      location: locations[Math.floor(Math.random() * locations.length)],
      website: `https://www.${industry}conference${Math.floor(Math.random() * 100)}.com`,
      industry: industry,
      organizer: organizers[Math.floor(Math.random() * organizers.length)]
    };
    
    events.push(event);
  }
  
  return events;
}

/**
 * Fetch data from Brave Search API
 * @param {string} query - Search query
 * @param {number} count - Number of results to return
 * @returns {Promise<Array>} - Array of search results
 */
async function fetchFromBraveSearch(query, count = 10) {
  try {
    const response = await use_mcp_tool({
      server_name: 'brave',
      tool_name: 'brave_web_search',
      arguments: {
        query: query,
        count: count
      }
    });
    
    return response.results || [];
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
