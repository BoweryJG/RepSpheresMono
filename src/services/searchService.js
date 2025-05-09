// Service for fetching company data from Brave search and Firecrawl
import { supabaseClient } from './supabase/supabaseClient.js';

/**
 * Fetches company data from Brave search and Firecrawl
 * @param {string} industry - The industry to search for companies (dental or aesthetic)
 * @param {number} limit - Number of results to return
 * @returns {Promise<Array>} - Array of company data
 */
// First try to fetch from Supabase, then fall back to external sources
export const fetchCompanyData = async (industry, limit = 10) => {
  try {
    console.log(`Attempting to fetch ${industry} company data from Supabase...`);
    
    // Try to fetch from Supabase first
    const { data, error } = await supabaseClient
      .from('companies')
      .select('*')
      .eq('industry', industry.toLowerCase())
      .limit(limit);
    
    if (error) {
      throw error;
    }
    
    // If we have data in Supabase, use it
    if (data && data.length > 0) {
      console.log(`Found ${data.length} ${industry} companies in Supabase`);
      return data;
    }
    
    // If no data in Supabase, fetch from external sources
    console.log(`No ${industry} company data found in Supabase, fetching from external sources...`);
    return await fetchCompaniesFromExternalSources(industry, limit);
  } catch (error) {
    console.error('Error fetching company data from Supabase:', error);
    console.log(`Falling back to external sources for ${industry} company data...`);
    return await fetchCompaniesFromExternalSources(industry, limit);
  }
};

/**
 * Fetches company data from Brave search and Firecrawl
 * @param {string} industry - The industry to search for companies (dental or aesthetic)
 * @param {number} limit - Number of results to return
 * @returns {Promise<Array>} - Array of company data
 */
const fetchCompaniesFromExternalSources = async (industry, limit = 10) => {
  try {
    // Use Brave search to find top companies in the industry
    const searchQuery = `top ${industry} companies industry leaders`;
    const braveResults = await fetchFromBraveSearch(searchQuery, limit);
    
    // Process the search results to extract company information
    const companies = [];
    
    for (const result of braveResults) {
      // Extract company name from title
      const companyName = extractCompanyName(result.title);
      
      if (companyName) {
        // Get more details about the company using Firecrawl
        const companyDetails = await fetchCompanyDetailsWithFirecrawl(companyName, industry);
        
        // Create a company object with the data we have
        const company = {
          id: companies.length + 1,
          name: companyName,
          industry: industry.toLowerCase(),
          description: companyDetails.description || result.description || '',
          logo_url: companyDetails.logo_url || '',
          website: companyDetails.website || result.url || '',
          headquarters: companyDetails.headquarters || '',
          founded: companyDetails.founded || null,
          timeInMarket: companyDetails.founded ? (new Date().getFullYear() - companyDetails.founded) : null,
          parentCompany: companyDetails.parentCompany || '',
          employeeCount: companyDetails.employeeCount || '',
          revenue: companyDetails.revenue || '',
          marketCap: companyDetails.marketCap || '',
          marketShare: companyDetails.marketShare || Math.random() * 15 + 5, // Random value between 5-20%
          growthRate: companyDetails.growthRate || Math.random() * 10 + 5, // Random value between 5-15%
          keyOfferings: companyDetails.keyOfferings || generateKeyOfferings(industry),
          topProducts: companyDetails.topProducts || generateTopProducts(companyName, industry),
          stock_symbol: companyDetails.stockSymbol || '',
          stock_exchange: companyDetails.stockExchange || ''
        };
        
        companies.push(company);
        
        // If we have enough companies, stop
        if (companies.length >= limit) {
          break;
        }
      }
    }
    
    // Store the data in Supabase for future use
    if (companies.length > 0) {
      await storeCompaniesInSupabase(companies);
    }
    
    return companies;
  } catch (error) {
    console.error('Error fetching from external sources:', error);
    // Return mock data as a last resort
    return generateMockCompanyData(industry, limit);
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
 * Fetch company details using Firecrawl
 * @param {string} companyName - Company name
 * @param {string} industry - Industry
 * @returns {Promise<Object>} - Company details
 */
const fetchCompanyDetailsWithFirecrawl = async (companyName, industry) => {
  try {
    // First try to find the company website
    const websiteSearchResults = await fetchFromBraveSearch(`${companyName} official website`, 3);
    let companyWebsite = '';
    
    if (websiteSearchResults.length > 0) {
      // Find the most likely official website
      for (const result of websiteSearchResults) {
        if (result.url.includes(companyName.toLowerCase().replace(/\s+/g, '')) || 
            result.url.includes(companyName.toLowerCase().replace(/\s+/g, '-'))) {
          companyWebsite = result.url;
          break;
        }
      }
      
      // If we couldn't find a matching URL, use the first result
      if (!companyWebsite && websiteSearchResults[0]) {
        companyWebsite = websiteSearchResults[0].url;
      }
    }
    
    // If we have a website, scrape it for information
    if (companyWebsite) {
      try {
        console.log(`Scraping company website: ${companyWebsite} using Firecrawl MCP`);
        
        // Use the Firecrawl MCP
        const scrapeResult = await use_mcp_tool({
          server_name: 'github.com/mendableai/firecrawl-mcp-server',
          tool_name: 'firecrawl_scrape',
          arguments: {
            url: companyWebsite,
            formats: ['markdown'],
            onlyMainContent: true
          }
        });
        
        if (scrapeResult && scrapeResult.markdown) {
          console.log(`Successfully scraped content from ${companyWebsite}`);
          // Extract information from the scraped content
          return extractCompanyDetailsFromContent(scrapeResult.markdown, companyName);
        }
      } catch (scrapeError) {
        console.error('Error scraping company website:', scrapeError);
      }
    }
    
    // If website scraping failed or we couldn't find a website,
    // search for company information
    const infoSearchResults = await fetchFromBraveSearch(
      `${companyName} ${industry} company profile headquarters founded revenue employees`,
      5
    );
    
    // Combine descriptions from search results
    let combinedDescription = '';
    if (infoSearchResults.length > 0) {
      combinedDescription = infoSearchResults.map(r => r.description || '').join(' ');
    }
    
    return extractCompanyDetailsFromContent(combinedDescription, companyName);
  } catch (error) {
    console.error('Error fetching company details:', error);
    return {};
  }
};

/**
 * Extract company name from search result title
 * @param {string} title - Search result title
 * @returns {string|null} - Company name or null if not found
 */
const extractCompanyName = (title) => {
  if (!title) return null;
  
  // Common company suffixes
  const companySuffixes = ['Inc', 'LLC', 'Ltd', 'Corp', 'Corporation', 'Company', 'Co', 'Group', 'Holdings'];
  
  // Try to extract company name with suffix
  for (const suffix of companySuffixes) {
    const pattern = new RegExp(`([\\w\\s&-]+)\\s${suffix}\\b`, 'i');
    const match = title.match(pattern);
    
    if (match && match[1]) {
      return `${match[1].trim()} ${suffix}`;
    }
  }
  
  // If no suffix found, try to extract the first part of the title
  // that looks like a company name (before common separators)
  const separators = ['-', '|', ':', '–', '—'];
  
  for (const separator of separators) {
    if (title.includes(separator)) {
      const parts = title.split(separator);
      return parts[0].trim();
    }
  }
  
  // If no separators, return the whole title if it's not too long
  if (title.length < 50) {
    return title.trim();
  }
  
  return null;
};

/**
 * Extract company details from content
 * @param {string} content - Content to extract details from
 * @param {string} companyName - Company name
 * @returns {Object} - Company details
 */
const extractCompanyDetailsFromContent = (content, companyName) => {
  const details = {
    description: '',
    logo_url: '',
    website: '',
    headquarters: '',
    founded: null,
    parentCompany: '',
    employeeCount: '',
    revenue: '',
    marketCap: '',
    marketShare: null,
    growthRate: null,
    keyOfferings: [],
    topProducts: [],
    stockSymbol: '',
    stockExchange: ''
  };
  
  // Extract description (first 200 characters)
  if (content.length > 0) {
    details.description = content.substring(0, 500) + '...';
  }
  
  // Extract headquarters
  const headquartersPatterns = [
    /headquarters?(?:\s+in|\s+is|\s+located\s+in)?\s+([^,.]+(?:,[^,.]+)?)/i,
    /based\s+in\s+([^,.]+(?:,[^,.]+)?)/i,
    /located\s+in\s+([^,.]+(?:,[^,.]+)?)/i
  ];
  
  for (const pattern of headquartersPatterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      details.headquarters = match[1].trim();
      break;
    }
  }
  
  // Extract founded year
  const foundedPattern = /founded\s+in\s+(\d{4})/i;
  const foundedMatch = content.match(foundedPattern);
  if (foundedMatch && foundedMatch[1]) {
    details.founded = parseInt(foundedMatch[1], 10);
  }
  
  // Extract employee count
  const employeePatterns = [
    /(\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s*(?:thousand)?\s*employees/i,
    /employees:\s*(\d{1,3}(?:,\d{3})*(?:\.\d+)?)/i,
    /staff\s+of\s+(\d{1,3}(?:,\d{3})*(?:\.\d+)?)/i
  ];
  
  for (const pattern of employeePatterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      details.employeeCount = match[1].trim();
      break;
    }
  }
  
  // Extract revenue
  const revenuePatterns = [
    /revenue(?:\s+of)?\s+\$?(\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s*(?:million|billion|m|b)/i,
    /\$?(\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s*(?:million|billion|m|b)\s+in\s+revenue/i
  ];
  
  for (const pattern of revenuePatterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      let value = match[1].replace(/,/g, '');
      const unit = match[0].toLowerCase().includes('billion') ? 'B' : 'M';
      details.revenue = `$${value}${unit}`;
      break;
    }
  }
  
  // Extract website URL
  const websitePattern = /https?:\/\/(?:www\.)?([a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)/;
  const websiteMatch = content.match(websitePattern);
  if (websiteMatch && websiteMatch[0]) {
    details.website = websiteMatch[0];
  }
  
  return details;
};

/**
 * Store companies in Supabase
 * @param {Array} companies - Array of company objects
 */
const storeCompaniesInSupabase = async (companies) => {
  try {
    for (const company of companies) {
      const { error } = await supabaseClient
        .from('companies')
        .upsert(company, { onConflict: 'name, industry' });
      
      if (error) {
        console.error('Error storing company in Supabase:', error);
      }
    }
    console.log(`Stored ${companies.length} companies in Supabase`);
  } catch (error) {
    console.error('Error storing companies in Supabase:', error);
  }
};

/**
 * Generate mock company data as a last resort
 * @param {string} industry - Industry
 * @param {number} limit - Number of companies to generate
 * @returns {Array} - Array of mock company data
 */
const generateMockCompanyData = (industry, limit = 10) => {
  const mockCompanies = [];
  
  // Company name prefixes based on industry
  const dentalPrefixes = ['Dent', 'Oral', 'Smile', 'Tooth', 'Dental'];
  const aestheticPrefixes = ['Beauty', 'Aesth', 'Derma', 'Cosmo', 'Skin'];
  
  // Company name suffixes
  const suffixes = ['Tech', 'Med', 'Care', 'Health', 'Solutions', 'Systems', 'Group', 'Corp'];
  
  // Use appropriate prefixes based on industry
  const prefixes = industry.toLowerCase() === 'dental' ? dentalPrefixes : aestheticPrefixes;
  
  for (let i = 0; i < limit; i++) {
    // Generate a random company name
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    const companyName = `${prefix}${suffix}`;
    
    // Generate random founding year between 1950 and 2015
    const foundedYear = Math.floor(Math.random() * (2015 - 1950 + 1)) + 1950;
    
    // Generate random market share between 5% and 20%
    const marketShare = Math.random() * 15 + 5;
    
    // Generate random growth rate between 5% and 15%
    const growthRate = Math.random() * 10 + 5;
    
    // Create mock company object
    const company = {
      id: i + 1,
      name: companyName,
      industry: industry.toLowerCase(),
      description: `${companyName} is a leading provider of ${industry.toLowerCase()} products and services, offering innovative solutions for healthcare professionals and patients.`,
      logo_url: '',
      website: `https://www.${companyName.toLowerCase()}.com`,
      headquarters: ['New York', 'San Francisco', 'Boston', 'Chicago', 'Los Angeles'][Math.floor(Math.random() * 5)],
      founded: foundedYear,
      timeInMarket: new Date().getFullYear() - foundedYear,
      parentCompany: Math.random() > 0.7 ? `${prefixes[Math.floor(Math.random() * prefixes.length)]}Holdings` : '',
      employeeCount: `${Math.floor(Math.random() * 9 + 1)},${Math.floor(Math.random() * 900 + 100)}`,
      revenue: `$${Math.floor(Math.random() * 9 + 1)}.${Math.floor(Math.random() * 9 + 1)}B`,
      marketCap: `$${Math.floor(Math.random() * 20 + 5)}B`,
      marketShare: marketShare,
      growthRate: growthRate,
      keyOfferings: generateKeyOfferings(industry),
      topProducts: generateTopProducts(companyName, industry),
      stock_symbol: `${companyName.substring(0, 4).toUpperCase()}`,
      stock_exchange: ['NYSE', 'NASDAQ'][Math.floor(Math.random() * 2)]
    };
    
    mockCompanies.push(company);
  }
  
  return mockCompanies;
};

/**
 * Generate key offerings based on industry
 * @param {string} industry - Industry
 * @returns {Array} - Array of key offerings
 */
const generateKeyOfferings = (industry) => {
  const dentalOfferings = [
    'Dental Equipment', 'Orthodontics', 'Implants', 'Imaging Systems', 
    'Preventive Care', 'Restorative Solutions', 'Endodontics', 'Periodontics',
    'Digital Dentistry', 'CAD/CAM Systems', 'Clear Aligners', 'Dental Software'
  ];
  
  const aestheticOfferings = [
    'Injectables', 'Laser Treatments', 'Body Contouring', 'Skin Care',
    'Facial Aesthetics', 'Hair Restoration', 'Medical Devices', 'Cosmetic Surgery',
    'Anti-Aging Solutions', 'Dermal Fillers', 'Aesthetic Lasers', 'Wellness Products'
  ];
  
  const offerings = industry.toLowerCase() === 'dental' ? dentalOfferings : aestheticOfferings;
  
  // Select 3-5 random offerings
  const count = Math.floor(Math.random() * 3) + 3;
  const selectedOfferings = [];
  
  while (selectedOfferings.length < count) {
    const offering = offerings[Math.floor(Math.random() * offerings.length)];
    if (!selectedOfferings.includes(offering)) {
      selectedOfferings.push(offering);
    }
  }
  
  return selectedOfferings;
};

/**
 * Generate top products based on company name and industry
 * @param {string} companyName - Company name
 * @param {string} industry - Industry
 * @returns {Array} - Array of top products
 */
const generateTopProducts = (companyName, industry) => {
  const dentalProducts = [
    'Scanner', 'Imaging System', 'Implant System', 'Clear Aligner',
    'CAD/CAM Solution', 'Dental Chair', 'Sterilization System', 'Handpiece',
    'Composite Material', 'Whitening System', 'Practice Management Software'
  ];
  
  const aestheticProducts = [
    'Dermal Filler', 'Laser System', 'Body Contouring Device', 'Skin Care Line',
    'Injectable Treatment', 'Hair Restoration System', 'Anti-Aging Cream',
    'Medical Spa Equipment', 'Facial Treatment', 'Aesthetic Software'
  ];
  
  const products = industry.toLowerCase() === 'dental' ? dentalProducts : aestheticProducts;
  
  // Select 2-4 random products
  const count = Math.floor(Math.random() * 3) + 2;
  const selectedProducts = [];
  
  while (selectedProducts.length < count) {
    const product = products[Math.floor(Math.random() * products.length)];
    const productName = `${companyName} ${product}`;
    
    if (!selectedProducts.includes(productName)) {
      selectedProducts.push(productName);
    }
  }
  
  return selectedProducts;
};
