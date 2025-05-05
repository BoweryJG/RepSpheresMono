/**
 * News Service - Fetches industry news using the Brave Search API
 */

// Function to fetch dental industry news
export const fetchDentalNews = async () => {
  try {
    // Use the Brave Search MCP to fetch dental industry news
    const response = await window.mcp.brave.brave_web_search({
      query: "dental industry trends news 2025 latest developments technology",
      count: 8
    });
    
    return formatNewsResults(response.web.results);
  } catch (error) {
    console.error("Error fetching dental news:", error);
    return [];
  }
};

// Function to fetch aesthetic industry news
export const fetchAestheticNews = async () => {
  try {
    // Use the Brave Search MCP to fetch aesthetic industry news
    const response = await window.mcp.brave.brave_web_search({
      query: "aesthetic procedures industry trends news 2025 latest innovations technology",
      count: 8
    });
    
    return formatNewsResults(response.web.results);
  } catch (error) {
    console.error("Error fetching aesthetic news:", error);
    return [];
  }
};

// Function to fetch news about a specific company
export const fetchCompanyNews = async (companyName, isDental = true) => {
  try {
    const industry = isDental ? "dental" : "aesthetic";
    const response = await window.mcp.brave.brave_web_search({
      query: `${companyName} ${industry} industry news financial results 2025`,
      count: 5
    });
    
    return formatNewsResults(response.web.results);
  } catch (error) {
    console.error(`Error fetching news for ${companyName}:`, error);
    return [];
  }
};

// Function to fetch local industry news based on location
export const fetchLocalIndustryNews = async (location, isDental = true) => {
  try {
    const industry = isDental ? "dental" : "aesthetic";
    const response = await window.mcp.brave.brave_local_search({
      query: `${industry} clinics news in ${location}`,
      count: 5
    });
    
    return formatLocalResults(response.local?.results || []);
  } catch (error) {
    console.error(`Error fetching local news for ${location}:`, error);
    return [];
  }
};

// Function to fetch trending topics in the industry
export const fetchTrendingTopics = async (isDental = true) => {
  try {
    const industry = isDental ? "dental" : "aesthetic";
    const response = await window.mcp.brave.brave_web_search({
      query: `trending ${industry} topics 2025 innovations breakthroughs`,
      count: 10
    });
    
    // Extract trending topics from search results
    const results = response.web.results || [];
    const topics = extractTrendingTopics(results);
    
    return topics;
  } catch (error) {
    console.error("Error fetching trending topics:", error);
    return [];
  }
};

// Helper function to format news results
const formatNewsResults = (results) => {
  if (!results || !Array.isArray(results)) return [];
  
  return results.map(item => ({
    title: item.title,
    description: item.description,
    url: item.url,
    source: extractDomain(item.url),
    date: item.published_date || 'Recent',
    imageUrl: item.thumbnail || null
  }));
};

// Helper function to format local search results
const formatLocalResults = (results) => {
  if (!results || !Array.isArray(results)) return [];
  
  return results.map(item => ({
    name: item.name,
    address: item.address,
    phone: item.phone,
    rating: item.rating,
    reviewCount: item.review_count,
    url: item.website,
    source: 'Local Search',
    date: 'Current'
  }));
};

// Helper function to extract trending topics from search results
const extractTrendingTopics = (results) => {
  if (!results || !Array.isArray(results)) return [];
  
  // Extract keywords from titles and descriptions
  const allText = results.map(item => `${item.title} ${item.description}`).join(' ');
  
  // Define industry-specific keywords to look for
  const dentalKeywords = [
    'AI', 'artificial intelligence', '3D printing', 'teledentistry', 
    'digital scanning', 'laser dentistry', 'clear aligners', 'dental implants',
    'regenerative dentistry', 'robotics', 'augmented reality', 'virtual reality',
    'preventive care', 'subscription models', 'DSO', 'group practices'
  ];
  
  const aestheticKeywords = [
    'non-invasive', 'minimally invasive', 'AI', 'artificial intelligence',
    'personalized treatments', 'combination therapies', 'regenerative aesthetics',
    'thread lifts', 'body contouring', 'injectables', 'laser treatments',
    'virtual consultations', 'augmented reality', 'medical tourism'
  ];
  
  // Select keywords based on industry
  const keywords = dentalKeywords.concat(aestheticKeywords);
  
  // Find mentions of keywords in the text
  const topics = keywords.filter(keyword => 
    new RegExp(`\\b${keyword}\\b`, 'i').test(allText)
  );
  
  // Remove duplicates and limit to 10 topics
  return [...new Set(topics)].slice(0, 10).map(topic => ({
    name: topic,
    count: countOccurrences(allText, topic)
  })).sort((a, b) => b.count - a.count);
};

// Helper function to count occurrences of a keyword in text
const countOccurrences = (text, keyword) => {
  const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
  return (text.match(regex) || []).length;
};

// Helper function to extract domain from URL
const extractDomain = (url) => {
  try {
    const domain = new URL(url).hostname;
    return domain.replace('www.', '');
  } catch (e) {
    return url;
  }
};
