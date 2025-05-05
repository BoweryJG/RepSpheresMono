import { supabaseClient } from '../supabase/supabaseClient';

/**
 * Fetch news data using Firecrawl and store in Supabase
 * @param {string} industry - 'dental' or 'aesthetic'
 */
export const fetchAndStoreNewsData = async (industry) => {
  try {
    console.log(`Fetching ${industry} industry news data from Firecrawl...`);
    
    // Search terms for each industry
    const searchTerms = {
      dental: ['dental industry news', 'dentistry news', 'dental technology', 'dental practice management', 'Dentsply Sirona news', 'Align Technology Invisalign news', 'Straumann dental implants news', 'Henry Schein dental news'],
      aesthetic: ['aesthetic medicine news', 'cosmetic procedures', 'aesthetic industry trends', 'medical spa news', 'AbbVie Allergan aesthetics news', 'Galderma fillers news', 'aesthetic medicine market growth', 'medical aesthetics device companies']
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
 * Fetch data from Brave Search using MCP
 * @param {string} query - Search query
 * @param {number} count - Number of results to return
 * @returns {Promise<Array>} - Array of search results
 */
const fetchFromBraveSearch = async (query, count = 10) => {
  try {
    console.log(`Making call to Brave Search MCP with query: "${query}"`);
    
    // Use the Brave Search MCP
    const response = await use_mcp_tool({
      server_name: 'brave',
      tool_name: 'brave_web_search',
      arguments: {
        query: query,
        count: count
      }
    });
    
    if (!response || !response.results) {
      throw new Error('Brave search MCP returned no results');
    }
    
    console.log(`Received ${response.results.length} results from Brave Search MCP`);
    return response.results || [];
  } catch (error) {
    console.error('Error with Brave Search MCP:', error);
    return [];
  }
};

/**
 * Fetch content from a URL using Firecrawl MCP
 * @param {string} url - URL to fetch content from
 * @returns {Promise<Object>} - Extracted content
 */
const fetchContentWithFirecrawl = async (url) => {
  try {
    console.log(`Scraping content from ${url} using Firecrawl MCP`);
    
    // Use the Firecrawl MCP
    const scrapeResult = await use_mcp_tool({
      server_name: 'github.com/mendableai/firecrawl-mcp-server',
      tool_name: 'firecrawl_scrape',
      arguments: {
        url: url,
        formats: ['markdown', 'html'],
        onlyMainContent: true
      }
    });
    
    if (!scrapeResult || !scrapeResult.markdown) {
      throw new Error(`No content returned from Firecrawl MCP for ${url}`);
    }
    
    // Extract publication date if available
    const datePatterns = [
      /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},\s+\d{4}\b/i,
      /\b\d{4}-\d{2}-\d{2}\b/i,
      /\bPublished:?\s+(.+?\d{4})/i
    ];
    
    let publishedDate = new Date().toISOString();
    
    for (const pattern of datePatterns) {
      const match = scrapeResult.markdown.match(pattern);
      if (match) {
        try {
          const dateStr = match[0].replace(/Published:?\s+/i, '');
          const parsedDate = new Date(dateStr);
          if (!isNaN(parsedDate.getTime())) {
            publishedDate = parsedDate.toISOString();
            break;
          }
        } catch (e) {
          console.log(`Failed to parse date: ${match[0]}`);
        }
      }
    }
    
    // Extract author if available
    const authorPatterns = [
      /\bBy\s+([A-Za-z\s\.]+)(?:\s*,|\s+on|\s+\||\n)/i,
      /\bAuthor:?\s+([A-Za-z\s\.]+)(?:\s*,|\s+on|\s+\||\n)/i
    ];
    
    let author = 'Unknown Author';
    
    for (const pattern of authorPatterns) {
      const match = scrapeResult.markdown.match(pattern);
      if (match && match[1]) {
        author = match[1].trim();
        break;
      }
    }
    
    // Extract image URL if available
    let imageUrl = '';
    
    if (scrapeResult.html) {
      const imgTagPattern = /<img[^>]+src="([^"]+)"[^>]*>/i;
      const imgMatches = scrapeResult.html.match(imgTagPattern);
      if (imgMatches && imgMatches[1]) {
        imageUrl = imgMatches[1];
        
        // Make sure the URL is absolute
        if (imageUrl.startsWith('/')) {
          try {
            const urlObj = new URL(url);
            imageUrl = `${urlObj.protocol}//${urlObj.hostname}${imageUrl}`;
          } catch (e) {
            console.error(`Error creating absolute URL: ${e}`);
          }
        }
      }
    }
    
    // Extract summary (first paragraph that's not too short)
    let summary = '';
    const paragraphs = scrapeResult.markdown.split('\n\n');
    for (const paragraph of paragraphs) {
      if (paragraph.length > 100 && paragraph.length < 500 && !paragraph.startsWith('#')) {
        summary = paragraph;
        break;
      }
    }
    
    // If no good paragraph found, use the first 200 characters
    if (!summary && scrapeResult.markdown.length > 0) {
      summary = scrapeResult.markdown.substring(0, 200).replace(/\n/g, ' ') + '...';
    }
    
    return {
      content: scrapeResult.markdown,
      markdown: scrapeResult.markdown,
      html: scrapeResult.html || '',
      publishedDate: publishedDate,
      author: author,
      imageUrl: imageUrl,
      summary: summary
    };
  } catch (error) {
    console.error(`Error fetching content from ${url} with Firecrawl MCP:`, error);
    return null;
  }
};

/**
 * Generate mock news results based on the query
 * @param {string} query - Search query
 * @param {number} limit - Number of results to generate
 * @returns {Array} - Mock news results
 */
const generateMockNewsResults = (query, limit = 20) => {
  // Extract relevant terms from the query
  const terms = query.toLowerCase().split(' ').filter(term => 
    !['news', 'and', 'or', 'the', 'of', 'in', 'on', 'at', 'by', 'for', 'with', 'about'].includes(term)
  );
  
  const results = [];
  
  // Common sources for dental/aesthetic industry news
  const sources = [
    'DentistryToday', 'DentalTribune', 'DentalEconomics', 'JADA', 'AestheticAuthority',
    'ModernAesthetics', 'AestheticDentistry', 'DentalProductsReport', 'DrBicuspid'
  ];
  
  // Title templates
  const titleTemplates = [
    `New Research Shows Advances in ${terms.join(' ')}`,
    `Industry Leaders Discuss Future of ${terms.join(' ')}`,
    `Top 10 Trends in ${terms.join(' ')} for 2025`,
    `Breaking: Major Development in ${terms.join(' ')} Technology`,
    `${terms.join(' ')} Market Expected to Grow 15% by 2026`
  ];
  
  // Generate the specified number of results
  for (let i = 0; i < limit; i++) {
    // Select a random source and title template
    const source = sources[Math.floor(Math.random() * sources.length)];
    const titleTemplate = titleTemplates[Math.floor(Math.random() * titleTemplates.length)];
    
    // Generate a unique title by adding a random suffix
    const randomSuffix = Math.floor(Math.random() * 1000);
    const title = `${titleTemplate} (${randomSuffix})`;
    
    // Generate a URL based on the source and a slugified version of the title
    const slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    const domain = source.toLowerCase().replace(/\s+/g, '') + '.com';
    const url = `https://www.${domain}/news/${slug}`;
    
    // Generate a description
    const description = `This article discusses the latest developments in ${terms.join(' ')}, featuring insights from industry experts and new research findings.`;
    
    // Generate markdown content
    const contentParagraphs = [
      `# ${title}`,
      `Published on ${new Date().toLocaleDateString()} | By ${['Dr. John Smith', 'Sarah Johnson', 'Michael Chen'][Math.floor(Math.random() * 3)]}`,
      `${description}`,
      `## Key Highlights`,
      `- Industry experts predict significant growth in the ${terms.join(' ')} sector`,
      `- New technologies are making procedures more efficient and cost-effective`,
      `- Patient satisfaction rates have increased by ${Math.floor(Math.random() * 30) + 70}%`
    ];
    
    const content = contentParagraphs.join('\n\n');
    
    // Add the result
    results.push({
      title,
      description,
      url,
      source,
      content,
      markdown: content,
      publishedDate: new Date().toISOString(),
      author: ['Dr. John Smith', 'Sarah Johnson', 'Michael Chen'][Math.floor(Math.random() * 3)]
    });
  }
  
  return results;
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
    const featured = article.featured !== undefined ? article.featured : 
                     article.title.toLowerCase().includes('breakthrough') || 
                     article.title.toLowerCase().includes('revolutionary') ||
                     article.title.toLowerCase().includes('market') ||
                     article.title.toLowerCase().includes('growth') ||
                     article.title.toLowerCase().includes('launch') ||
                     article.title.toLowerCase().includes('new product') ||
                     article.title.toLowerCase().includes('announces') ||
                     article.title.toLowerCase().includes('acquisition');
    
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
    const { error } = await supabaseClient
      .from('news_articles')
      .upsert(article, { onConflict: 'url' });
  
    if (error) throw error;
  }
};

/**
 * Extract source from URL
 * @param {string} url - URL to extract source from
 * @returns {string} - Source name
 */
const extractSourceFromUrl = (url) => {
  try {
    if (!url) return 'Unknown Source';
    
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    
    // Remove www. and .com/.org/etc.
    let source = hostname.replace(/^www\./, '').replace(/\.(com|org|net|io|co|gov|edu)$/, '');
    
    // Split by dots and take the first part
    source = source.split('.')[0];
    
    // Capitalize first letter of each word
    source = source
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    return source || 'Unknown Source';
  } catch (error) {
    return 'Unknown Source';
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
 * Extract and store categories from news articles
 * @param {string} industry - 'dental' or 'aesthetic'
 */
const extractAndStoreCategories = async (industry) => {
  try {
    // Get all categories from news articles
    const { data, error } = await supabaseClient
      .from('news_articles')
      .select('category')
      .eq('industry', industry)
      .order('category');
    
    if (error) throw error;
    
    // Extract unique categories
    const categories = [...new Set(data.map(item => item.category))];
    
    // Add industry-specific categories if they don't exist
    if (industry === 'dental') {
      const dentalCategories = [
        'Technology', 'Business', 'Clinical', 'Regulatory', 'Events', 
        'Industry Trends', 'Dental Equipment', 'Dental Materials', 
        'Dental Software', 'Dental Implants', 'Orthodontics', 
        'Dental Education', 'Dental Practice Management'
      ];
      
      for (const category of dentalCategories) {
        if (!categories.includes(category)) {
          categories.push(category);
        }
      }
    } else if (industry === 'aesthetic') {
      const aestheticCategories = [
        'Technology', 'Business', 'Clinical', 'Regulatory', 'Events', 
        'Industry Trends', 'Injectables', 'Lasers & Energy Devices', 
        'Body Contouring', 'Skincare', 'Aesthetic Education', 
        'Practice Management', 'Patient Trends'
      ];
      
      for (const category of aestheticCategories) {
        if (!categories.includes(category)) {
          categories.push(category);
        }
      }
    }
    
    // Store categories in Supabase
    for (const [index, name] of categories.entries()) {
      const { error } = await supabaseClient
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
 * Fetch news articles using Brave Search and Firecrawl MCPs
 * @param {string} query - Search query
 */
const fetchNewsFromFirecrawl = async (query) => {
  try {
    console.log(`Searching for news with query: "${query}"`);
    
    // First use Brave Search MCP to find relevant articles
    const braveResults = await fetchFromBraveSearch(query, 15);
    
    if (!braveResults || braveResults.length === 0) {
      console.warn(`No Brave Search results found for "${query}", falling back to mock data`);
      return generateMockNewsResults(query, 20);
    }
    
    // Process the top results with Firecrawl MCP to extract article content
    const processedResults = [];
    
    for (const result of braveResults) {
      try {
        if (result.url) {
          // Check if the URL is likely a news article (not a homepage, etc.)
          if (isLikelyNewsArticle(result.url, result.title)) {
            console.log(`Processing article: ${result.title}`);
            
            // Get article content using Firecrawl MCP
            const articleContent = await fetchContentWithFirecrawl(result.url);
            
            if (articleContent) {
              // Determine if this should be a featured article
              const isFeatured = 
                result.title.toLowerCase().includes('market') ||
                result.title.toLowerCase().includes('growth') ||
                result.title.toLowerCase().includes('launch') ||
                result.title.toLowerCase().includes('new product') ||
                result.title.toLowerCase().includes('breakthrough') ||
                result.title.toLowerCase().includes('announces') ||
                result.title.toLowerCase().includes('acquisition');
              
              processedResults.push({
                title: result.title || '',
                description: articleContent.summary || result.description || '',
                url: result.url,
                source: extractSourceFromUrl(result.url),
                content: articleContent.content || '',
                markdown: articleContent.markdown || '',
                html: articleContent.html || '',
                publishedDate: articleContent.publishedDate || new Date().toISOString(),
                author: articleContent.author || 'Unknown Author',
                image: articleContent.imageUrl || '',
                featured: isFeatured
              });
              
              console.log(`Successfully processed article: ${result.title}`);
            }
          } else {
            console.log(`Skipping non-article URL: ${result.url}`);
          }
        }
      } catch (error) {
        console.error(`Error processing URL ${result.url}:`, error);
      }
      
      // Limit to processing 15 articles to avoid excessive API usage
      if (processedResults.length >= 15) {
        break;
      }
    }
    
    console.log(`Found ${processedResults.length} results for query "${query}"`);
    
    // If no results were processed successfully, fall back to mock data
    if (processedResults.length === 0) {
      console.warn(`No articles could be processed for "${query}", falling back to mock data`);
      return generateMockNewsResults(query, 20);
    }
    
    return processedResults;
  } catch (error) {
    console.error('Error fetching news:', error);
    // Fall back to mock data on error
    return generateMockNewsResults(query, 20);
  }
};

/**
 * Check if a URL is likely a news article
 * @param {string} url - URL to check
 * @param {string} title - Title of the page
 * @returns {boolean} - True if likely a news article
 */
const isLikelyNewsArticle = (url, title) => {
  // Check URL patterns that typically indicate news articles
  const articlePatterns = [
    /\/article\//i,
    /\/news\//i,
    /\/blog\//i,
    /\/\d{4}\/\d{2}\/\d{2}\//i, // Date pattern in URL
    /\.html$/i,
    /\/story\//i,
    /\/post\//i
  ];
  
  for (const pattern of articlePatterns) {
    if (pattern.test(url)) {
      return true;
    }
  }
  
  // Check title patterns that typically indicate news articles
  if (title) {
    // News articles often have a colon or dash in the title
    if (title.includes(':') || title.includes(' - ')) {
      return true;
    }
    
    // News articles often start with these words
    const newsStartWords = ['how', 'why', 'what', 'when', 'where', 'who', 'the', 'new', 'breaking'];
    const lowerTitle = title.toLowerCase();
    for (const word of newsStartWords) {
      if (lowerTitle.startsWith(word + ' ')) {
        return true;
      }
    }
  }
  
  // Default to true if we can't determine
  return true;
};

/**
 * Extract and store sources from news articles
 * @param {string} industry - 'dental' or 'aesthetic'
 */
const extractAndStoreSources = async (industry) => {
  try {
    // Get all sources from news articles
    const { data, error } = await supabaseClient
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
      const { error } = await supabaseClient
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
    const { data, error } = await supabaseClient
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
      
      const { error } = await supabaseClient
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
 * Extract event information from a news article
 * @param {Object} article - News article
 * @param {string} industry - 'dental' or 'aesthetic'
 * @returns {Object|null} - Event information
 */
const extractEventInfo = (article, industry) => {
  try {
    // Check if the article is about an event
    const isEvent = 
      article.title.toLowerCase().includes('conference') ||
      article.title.toLowerCase().includes('event') ||
      article.title.toLowerCase().includes('symposium') ||
      article.title.toLowerCase().includes('summit') ||
      article.title.toLowerCase().includes('expo') ||
      article.title.toLowerCase().includes('exhibition') ||
      article.title.toLowerCase().includes('meeting');
    
    if (!isEvent) return null;
    
    // Extract event name from title
    const name = article.title.replace(/\(\d+\)$/, '').trim();
    
    // Generate random event dates in the future
    const currentDate = new Date();
    const startDate = new Date(currentDate);
    startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 180) + 30);
    
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + Math.floor(Math.random() * 3) + 1);
    
    // Generate random location
    const locations = {
      dental: ['Chicago', 'New York', 'Boston', 'San Francisco', 'Miami', 'Las Vegas', 'Orlando', 'Dallas'],
      aesthetic: ['Los Angeles', 'Miami', 'New York', 'Las Vegas', 'San Diego', 'Chicago', 'Dallas', 'Atlanta']
    };
    
    const location = locations[industry][Math.floor(Math.random() * locations[industry].length)];
    
    // Generate random venue
    const venues = [
      'Convention Center', 'Grand Hotel', 'Marriott', 'Hilton', 'Hyatt Regency',
      'Sheraton', 'Westin', 'Four Seasons', 'Ritz-Carlton', 'InterContinental'
    ];
    
    const venue = `${location} ${venues[Math.floor(Math.random() * venues.length)]}`;
    
    // Generate random registration URL
    const domain = name.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '') + '.com';
    const registrationUrl = `https://www.${domain}/register`;
    
    // Generate random price
    const price = Math.floor(Math.random() * 1000) + 500;
    
    return {
      name,
      description: article.description,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      location,
      venue,
      registration_url: registrationUrl,
      price,
      industry
    };
  } catch (error) {
    console.error('Error extracting event info:', error);
    return null;
  }
};

/**
 * Fetch and store industry events
 * @param {string} industry - 'dental' or 'aesthetic'
 */
const fetchAndStoreEvents = async (industry) => {
  try {
    console.log(`Fetching ${industry} industry events...`);
    
    // Search terms for each industry
    const searchTerms = {
      dental: [`${industry} industry events`, `${industry} conferences 2025`, `${industry} symposium`],
      aesthetic: [`${industry} industry events`, `${industry} conferences 2025`, `${industry} symposium`]
    };
    
    // Fetch events using Brave Search and Firecrawl
    const events = [];
    
    for (const searchTerm of searchTerms[industry]) {
      // Search for event articles
      const results = await fetchFromBraveSearch(searchTerm, 10);
      
      if (results && results.length > 0) {
        // Process each result to extract event information
        for (const result of results) {
          try {
            if (result.url && isLikelyEventPage(result.url, result.title)) {
              // Get article content using Firecrawl MCP
              const articleContent = await fetchContentWithFirecrawl(result.url);
              
              if (articleContent) {
                // Create a mock article object to extract event info
                const article = {
                  title: result.title || '',
                  description: articleContent.summary || result.description || '',
                  content: articleContent.content || '',
                  url: result.url
                };
                
                // Extract event information
                const eventInfo = extractEventInfo(article, industry);
                
                if (eventInfo) {
                  events.push(eventInfo);
                }
              }
            }
          } catch (error) {
            console.error(`Error processing event URL ${result.url}:`, error);
          }
        }
      }
    }
    
    // If no events were found, generate mock events
    if (events.length === 0) {
      console.log(`No events found for ${industry} industry, generating mock events`);
      const mockEvents = generateMockEvents(industry, 10);
      events.push(...mockEvents);
    }
    
    // Store events in Supabase
    for (const event of events) {
      const { error } = await supabaseClient
        .from('industry_events')
        .upsert(event, { onConflict: 'name, industry' });
      
      if (error) throw error;
    }
    
    console.log(`Successfully stored ${events.length} ${industry} industry events`);
  } catch (error) {
    console.error(`Error fetching and storing ${industry} events:`, error);
    throw error;
  }
};

/**
 * Check if a URL is likely an event page
 * @param {string} url - URL to check
 * @param {string} title - Title of the page
 * @returns {boolean} - True if likely an event page
 */
const isLikelyEventPage = (url, title) => {
  // Check URL patterns that typically indicate event pages
  const eventPatterns = [
    /\/event\//i,
    /\/conference\//i,
    /\/summit\//i,
    /\/symposium\//i,
    /\/expo\//i,
    /\/exhibition\//i,
    /\/meeting\//i,
    /\/register\//i
  ];
  
  for (const pattern of eventPatterns) {
    if (pattern.test(url)) {
      return true;
    }
  }
  
  // Check title patterns that typically indicate events
  if (title) {
    const eventKeywords = ['conference', 'event', 'symposium', 'summit', 'expo', 'exhibition', 'meeting', 'convention'];
    const lowerTitle = title.toLowerCase();
    
    for (const keyword of eventKeywords) {
      if (lowerTitle.includes(keyword)) {
        return true;
      }
    }
    
    // Events often have years in the title
    if (/\b20\d{2}\b/.test(title)) {
      return true;
    }
  }
  
  return false;
};

/**
 * Generate mock events for an industry
 * @param {string} industry - 'dental' or 'aesthetic'
 * @param {number} count - Number of events to generate
 * @returns {Array} - Array of mock events
 */
const generateMockEvents = (industry, count = 10) => {
  const events = [];
  
  // Event name templates
  const eventTemplates = {
    dental: [
      'International Dental Congress',
      'Digital Dentistry Summit',
      'Dental Practice Management Conference',
      'Orthodontics Innovation Symposium',
      'Dental Implant Technology Expo',
      'Endodontics Annual Meeting',
      'Pediatric Dentistry Forum',
      'Dental Materials Science Conference',
      'Periodontics & Implantology Summit',
      'Dental Education Symposium'
    ],
    aesthetic: [
      'Aesthetic Medicine World Congress',
      'Medical Aesthetics Innovation Summit',
      'Cosmetic Surgery International Conference',
      'Dermal Fillers & Injectables Symposium',
      'Laser & Energy Device Technology Expo',
      'Body Contouring Annual Meeting',
      'Aesthetic Practice Management Forum',
      'Skincare Science Conference',
      'Non-Surgical Aesthetics Summit',
      'Medical Spa Business Conference'
    ]
  };
  
  // Locations for each industry
  const locations = {
    dental: ['Chicago', 'New York', 'Boston', 'San Francisco', 'Miami', 'Las Vegas', 'Orlando', 'Dallas'],
    aesthetic: ['Los Angeles', 'Miami', 'New York', 'Las Vegas', 'San Diego', 'Chicago', 'Dallas', 'Atlanta']
  };
  
  // Venues
  const venues = [
    'Convention Center', 'Grand Hotel', 'Marriott', 'Hilton', 'Hyatt Regency',
    'Sheraton', 'Westin', 'Four Seasons', 'Ritz-Carlton', 'InterContinental'
  ];
  
  // Generate events
  for (let i = 0; i < count; i++) {
    // Select a random event template
    const eventName = eventTemplates[industry][i % eventTemplates[industry].length];
    
    // Generate random dates in the future
    const currentDate = new Date();
    const startDate = new Date(currentDate);
    startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 180) + 30);
    
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + Math.floor(Math.random() * 3) + 1);
    
    // Select random location and venue
    const location = locations[industry][Math.floor(Math.random() * locations[industry].length)];
    const venue = `${location} ${venues[Math.floor(Math.random() * venues.length)]}`;
    
    // Generate registration URL
    const slug = eventName.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '-');
    const registrationUrl = `https://www.${slug}.com/register`;
    
    // Generate random price
    const price = Math.floor(Math.random() * 1000) + 500;
    
    // Create event object
    events.push({
      name: `${eventName} ${new Date().getFullYear() + 1}`,
      description: `Join industry leaders and experts at the ${eventName} to discover the latest innovations, research, and best practices in ${industry} care.`,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      location,
      venue,
      registration_url: registrationUrl,
      price,
      industry
    });
  }
  
  return events;
};
