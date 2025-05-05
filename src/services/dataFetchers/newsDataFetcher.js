import { supabase } from '../supabase/supabaseClient';

/**
 * Fetch news data using Firecrawl and store in Supabase
 * @param {string} industry - 'dental' or 'aesthetic'
 */
export const fetchAndStoreNewsData = async (industry) => {
  try {
    console.log(`Fetching ${industry} industry news data from Firecrawl...`);
    
    // Search terms for each industry
    const searchTerms = {
      dental: ['dental industry news', 'dentistry news', 'dental technology', 'dental practice management'],
      aesthetic: ['aesthetic medicine news', 'cosmetic procedures', 'aesthetic industry trends', 'medical spa news']
    };
    
    // Fetch news articles using Firecrawl
    for (const searchTerm of searchTerms[industry]) {
      const results = await fetchNewsFromFirecrawl(searchTerm);
      await storeNewsArticles(results, industry);
    }
    
    // Extract and store categories
    await extractAndStoreCategories(industry);
    
    // Extract and store sources
    await extractAndStoreSources(industry);
    
    // Generate trending topics
    await generateAndStoreTrendingTopics(industry);
    
    // Fetch and store events
    await fetchAndStoreEvents(industry);
    
    console.log(`${industry} industry news data successfully stored in Supabase`);
    return { success: true };
  } catch (error) {
    console.error(`Error fetching and storing ${industry} news data:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Fetch news articles using Firecrawl
 * @param {string} query - Search query
 */
const fetchNewsFromFirecrawl = async (query) => {
  try {
    // Use Firecrawl MCP tool to search for news
    const response = await use_mcp_tool({
      server_name: 'github.com/mendableai/firecrawl-mcp-server',
      tool_name: 'firecrawl_search',
      arguments: {
        query: query,
        limit: 20,
        scrapeOptions: {
          formats: ['markdown'],
          onlyMainContent: true
        }
      }
    });
    
    return response.results || [];
  } catch (error) {
    console.error('Error fetching news from Firecrawl:', error);
    throw error;
  }
};

/**
 * Store news articles in Supabase
 * @param {Array} articles - News articles
 * @param {string} industry - 'dental' or 'aesthetic'
 */
const storeNewsArticles = async (articles, industry) => {
  // Process and transform articles
  const processedArticles = articles.map(article => {
    // Extract category from content or title
    const category = determineCategory(article.title, article.content);
    
    // Determine if article should be featured
    const featured = article.title.toLowerCase().includes('breakthrough') || 
                     article.title.toLowerCase().includes('revolutionary');
    
    return {
      title: article.title,
      summary: article.description || article.title,
      content: article.content || article.markdown || '',
      image_url: article.image || '',
      published_date: article.publishedDate || new Date().toISOString().split('T')[0],
      source: article.source || extractSourceFromUrl(article.url),
      author: article.author || 'Staff Writer',
      category: category,
      url: article.url,
      industry: industry,
      featured: featured
    };
  });
  
  // Store in Supabase
  for (const article of processedArticles) {
    const { error } = await supabase
      .from('news_articles')
      .upsert(article, { onConflict: 'url' });
    
    if (error) throw error;
  }
};

/**
 * Determine category based on article title and content
 * @param {string} title - Article title
 * @param {string} content - Article content
 * @returns {string} - Category name
 */
const determineCategory = (title, content) => {
  const text = (title + ' ' + (content || '')).toLowerCase();
  
  if (text.includes('technology') || text.includes('digital') || text.includes('software') || text.includes('ai')) {
    return 'Technology';
  } else if (text.includes('business') || text.includes('market') || text.includes('finance') || text.includes('revenue')) {
    return 'Business';
  } else if (text.includes('clinical') || text.includes('treatment') || text.includes('procedure') || text.includes('patient care')) {
    return 'Clinical';
  } else if (text.includes('regulation') || text.includes('compliance') || text.includes('law') || text.includes('fda')) {
    return 'Regulatory';
  } else if (text.includes('event') || text.includes('conference') || text.includes('webinar') || text.includes('summit')) {
    return 'Events';
  } else {
    return 'Industry Trends';
  }
};

/**
 * Extract source from URL
 * @param {string} url - Article URL
 * @returns {string} - Source name
 */
const extractSourceFromUrl = (url) => {
  try {
    if (!url) return 'Unknown Source';
    
    const hostname = new URL(url).hostname;
    const parts = hostname.split('.');
    
    // Remove common TLDs and www
    const name = parts
      .filter(part => !['com', 'org', 'net', 'io', 'co', 'www'].includes(part))
      .join(' ');
    
    // Capitalize first letter of each word
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  } catch (error) {
    return 'Unknown Source';
  }
};

/**
 * Extract and store categories from news articles
 * @param {string} industry - 'dental' or 'aesthetic'
 */
const extractAndStoreCategories = async (industry) => {
  try {
    // Get all categories from news articles
    const { data, error } = await supabase
      .from('news_articles')
      .select('category')
      .eq('industry', industry)
      .order('category');
    
    if (error) throw error;
    
    // Extract unique categories
    const categories = [...new Set(data.map(item => item.category))];
    
    // Store categories in Supabase
    for (const [index, name] of categories.entries()) {
      const { error } = await supabase
        .from('news_categories')
        .upsert({
          id: index + 1,
          name,
          industry
        }, { onConflict: 'name, industry' });
      
      if (error) throw error;
    }
  } catch (error) {
    console.error('Error extracting and storing categories:', error);
    throw error;
  }
};

/**
 * Extract and store sources from news articles
 * @param {string} industry - 'dental' or 'aesthetic'
 */
const extractAndStoreSources = async (industry) => {
  try {
    // Get all sources from news articles
    const { data, error } = await supabase
      .from('news_articles')
      .select('source, url')
      .eq('industry', industry)
      .order('source');
    
    if (error) throw error;
    
    // Extract unique sources with URLs
    const sourcesMap = {};
    data.forEach(item => {
      if (!sourcesMap[item.source]) {
        sourcesMap[item.source] = item.url;
      }
    });
    
    // Store sources in Supabase
    let index = 1;
    for (const [name, url] of Object.entries(sourcesMap)) {
      const { error } = await supabase
        .from('news_sources')
        .upsert({
          id: index++,
          name,
          industry,
          url: extractBaseUrl(url)
        }, { onConflict: 'name, industry' });
      
      if (error) throw error;
    }
  } catch (error) {
    console.error('Error extracting and storing sources:', error);
    throw error;
  }
};

/**
 * Extract base URL
 * @param {string} url - Full URL
 * @returns {string} - Base URL
 */
const extractBaseUrl = (url) => {
  try {
    if (!url) return '';
    
    const urlObj = new URL(url);
    return `${urlObj.protocol}//${urlObj.hostname}`;
  } catch (error) {
    return '';
  }
};

/**
 * Generate and store trending topics
 * @param {string} industry - 'dental' or 'aesthetic'
 */
const generateAndStoreTrendingTopics = async (industry) => {
  try {
    // Get all news articles
    const { data, error } = await supabase
      .from('news_articles')
      .select('title, content')
      .eq('industry', industry);
    
    if (error) throw error;
    
    // Extract keywords from titles and content
    const keywords = extractKeywords(data);
    
    // Count keyword occurrences
    const keywordCounts = {};
    keywords.forEach(keyword => {
      keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
    });
    
    // Sort keywords by count
    const sortedKeywords = Object.entries(keywordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    // Store trending topics in Supabase
    for (const [index, [name, count]] of sortedKeywords.entries()) {
      const popularity = Math.round(100 - (index * 5)); // Decreasing popularity
      
      const { error } = await supabase
        .from('trending_topics')
        .upsert({
          id: index + 1,
          name,
          industry,
          popularity,
          article_count: count
        }, { onConflict: 'name, industry' });
      
      if (error) throw error;
    }
  } catch (error) {
    console.error('Error generating and storing trending topics:', error);
    throw error;
  }
};

/**
 * Extract keywords from news articles
 * @param {Array} articles - News articles
 * @returns {Array} - Keywords
 */
const extractKeywords = (articles) => {
  // Common words to exclude
  const stopWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with',
    'by', 'about', 'as', 'into', 'like', 'through', 'after', 'over', 'between',
    'out', 'of', 'from', 'up', 'down', 'is', 'are', 'was', 'were', 'be', 'been',
    'being', 'have', 'has', 'had', 'do', 'does', 'did', 'doing', 'this', 'that',
    'these', 'those', 'it', 'its', 'they', 'them', 'their', 'what', 'which', 'who',
    'whom', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few',
    'more', 'most', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so',
    'than', 'too', 'very', 'can', 'will', 'just', 'should', 'now'
  ]);
  
  const keywords = [];
  
  articles.forEach(article => {
    const text = (article.title + ' ' + (article.content || '')).toLowerCase();
    
    // Split text into words
    const words = text.split(/\W+/);
    
    // Filter out stop words and short words
    const filteredWords = words.filter(word => 
      word.length > 3 && !stopWords.has(word)
    );
    
    // Add to keywords
    keywords.push(...filteredWords);
  });
  
  return keywords;
};

/**
 * Fetch and store industry events
 * @param {string} industry - 'dental' or 'aesthetic'
 */
const fetchAndStoreEvents = async (industry) => {
  try {
    console.log(`Fetching ${industry} industry events from Firecrawl...`);
    
    // Search terms for each industry
    const searchTerms = {
      dental: [`${industry} industry events`, `${industry} conferences 2025`, `${industry} symposium`],
      aesthetic: [`${industry} industry events`, `${industry} conferences 2025`, `${industry} symposium`]
    };
    
    const events = [];
    
    // Fetch events using Firecrawl
    for (const searchTerm of searchTerms[industry]) {
      const response = await use_mcp_tool({
        server_name: 'github.com/mendableai/firecrawl-mcp-server',
        tool_name: 'firecrawl_search',
        arguments: {
          query: searchTerm,
          limit: 10,
          scrapeOptions: {
            formats: ['markdown'],
            onlyMainContent: true
          }
        }
      });
      
      const results = response.results || [];
      
      // Process results to extract event information
      for (const result of results) {
        const eventInfo = extractEventInfo(result, industry);
        if (eventInfo) {
          events.push(eventInfo);
        }
      }
    }
    
    // Remove duplicates
    const uniqueEvents = removeDuplicateEvents(events);
    
    // Store events in Supabase
    for (const [index, event] of uniqueEvents.entries()) {
      const { error } = await supabase
        .from('industry_events')
        .upsert({
          id: index + 1,
          ...event
        }, { onConflict: 'name, start_date' });
      
      if (error) throw error;
    }
    
    console.log(`${uniqueEvents.length} ${industry} industry events successfully stored in Supabase`);
  } catch (error) {
    console.error(`Error fetching and storing ${industry} events:`, error);
    throw error;
  }
};

/**
 * Extract event information from search result
 * @param {Object} result - Search result
 * @param {string} industry - 'dental' or 'aesthetic'
 * @returns {Object|null} - Event information or null if not an event
 */
const extractEventInfo = (result, industry) => {
  const { title, content, description } = result;
  const text = (title + ' ' + (content || description || '')).toLowerCase();
  
  // Check if this is likely an event
  if (!text.includes('event') && !text.includes('conference') && 
      !text.includes('symposium') && !text.includes('summit') && 
      !text.includes('workshop') && !text.includes('meeting')) {
    return null;
  }
  
  // Extract dates
  const datePattern = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]* \d{1,2}[-–—]?\d{0,2},? \d{4}\b/gi;
  const dateMatches = text.match(datePattern) || [];
  
  if (dateMatches.length < 1) {
    return null;
  }
  
  // Extract location
  const locationPattern = /\b([A-Z][a-z]+(,| )[A-Z]{2}|[A-Z][a-z]+(,| )[A-Z][a-z]+)\b/g;
  const locationMatches = (content || description || '').match(locationPattern) || [];
  const location = locationMatches.length > 0 ? locationMatches[0] : 'TBD';
  
  // Parse dates
  let startDate, endDate;
  try {
    const dateStr = dateMatches[0];
    if (dateMatches.length >= 2) {
      startDate = new Date(dateMatches[0]).toISOString().split('T')[0];
      endDate = new Date(dateMatches[1]).toISOString().split('T')[0];
    } else if (dateStr.includes('-') || dateStr.includes('–') || dateStr.includes('—')) {
      const parts = dateStr.split(/[-–—]/);
      startDate = new Date(parts[0]).toISOString().split('T')[0];
      
      // If the second part doesn't have a year, use the year from the first part
      const firstDateParts = parts[0].trim().split(' ');
      const year = firstDateParts[firstDateParts.length - 1];
      
      if (parts[1].includes(year)) {
        endDate = new Date(parts[1]).toISOString().split('T')[0];
      } else {
        endDate = new Date(parts[1] + ' ' + year).toISOString().split('T')[0];
      }
    } else {
      startDate = new Date(dateStr).toISOString().split('T')[0];
      // Default to a 2-day event
      const end = new Date(dateStr);
      end.setDate(end.getDate() + 2);
      endDate = end.toISOString().split('T')[0];
    }
  } catch (error) {
    // If date parsing fails, use future dates
    const now = new Date();
    startDate = new Date(now.setMonth(now.getMonth() + 3)).toISOString().split('T')[0];
    endDate = new Date(now.setDate(now.getDate() + 2)).toISOString().split('T')[0];
  }
  
  // Extract website
  const websitePattern = /https?:\/\/[^\s"'<>]+/g;
  const websiteMatches = (content || description || '').match(websitePattern) || [];
  const website = websiteMatches.length > 0 ? websiteMatches[0] : '';
  
  return {
    name: title,
    description: description || content?.substring(0, 200) || '',
    location,
    start_date: startDate,
    end_date: endDate,
    website,
    industry
  };
};

/**
 * Remove duplicate events
 * @param {Array} events - Events array
 * @returns {Array} - Unique events
 */
const removeDuplicateEvents = (events) => {
  const uniqueEvents = [];
  const eventNames = new Set();
  
  for (const event of events) {
    // Create a key using name and start date
    const key = `${event.name.toLowerCase()}_${event.start_date}`;
    
    if (!eventNames.has(key)) {
      eventNames.add(key);
      uniqueEvents.push(event);
    }
  }
  
  return uniqueEvents;
};
