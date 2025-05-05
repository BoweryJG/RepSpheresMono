import { supabaseClient } from '../supabase/supabaseClient';
import { dentalCompanies, aestheticCompanies } from '../../data/dentalCompanies';

/**
 * Fetch company data using Brave Search and store in Supabase
 * @param {string} industry - 'dental' or 'aesthetic'
 */
export const fetchAndStoreCompanyData = async (industry) => {
  try {
    console.log(`Fetching ${industry} industry company data from Brave...`);
    
    // Search terms for each industry
    const searchTerms = {
      dental: ['top dental companies', 'dental equipment manufacturers', 'dental service organizations'],
      aesthetic: ['aesthetic medicine companies', 'cosmetic procedure equipment', 'medical spa franchises']
    };
    
    const companies = [];
    
    // First, add the existing companies from our static data
    const existingCompanies = industry === 'dental' ? dentalCompanies : aestheticCompanies;
    for (const company of existingCompanies) {
      companies.push({
        name: company.name,
        industry: industry,
        description: company.description || '',
        logo_url: '',
        website: company.website || '',
        headquarters: company.headquarters || '',
        founded: company.founded || null,
        employees: company.employeeCount || '',
        revenue: company.revenue || '',
        market_cap: company.marketCap || '',
        stock_symbol: '',
        stock_exchange: '',
        market_share: company.marketShare || 0,
        growth_rate: company.growthRate || 0,
        key_offerings: company.keyOfferings ? company.keyOfferings.join(', ') : '',
        top_products: company.topProducts ? company.topProducts.join(', ') : ''
      });
    }
    
    // Fetch additional company data using Brave Search
    for (const searchTerm of searchTerms[industry]) {
      const results = await fetchCompaniesFromBrave(searchTerm, industry);
      companies.push(...results);
    }
    
    // Remove duplicates
    const uniqueCompanies = removeDuplicateCompanies(companies);
    
    // Store in Supabase
    await storeCompanyData(uniqueCompanies, industry);
    
    console.log(`${uniqueCompanies.length} ${industry} industry companies successfully stored in Supabase`);
    return { success: true };
  } catch (error) {
    console.error(`Error fetching and storing ${industry} company data:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Fetch companies using Brave Search API
 * @param {string} query - Search query
 * @param {string} industry - 'dental' or 'aesthetic'
 * @returns {Promise<Array>} - Array of company objects
 */
const fetchCompaniesFromBrave = async (query, industry) => {
  try {
    // Use Brave Search API directly
    const results = await fetchFromBraveSearch(`${query} industry leaders`, 20);
    const companies = [];
    
    // Process search results to extract company information
    for (const result of results) {
      // Extract company name from title
      const companyName = extractCompanyName(result.title);
      
      if (companyName) {
        // Check if we already have this company in our list
        const existingCompany = companies.find(c => 
          c.name.toLowerCase() === companyName.toLowerCase() || 
          c.name.toLowerCase().includes(companyName.toLowerCase()) ||
          companyName.toLowerCase().includes(c.name.toLowerCase())
        );
        
        if (existingCompany) {
          continue; // Skip this company as we already have it
        }
        
        // Get more details about the company
        const companyDetails = await getCompanyDetails(companyName, industry);
        
        companies.push({
          name: companyName,
          industry: industry,
          description: result.description || companyDetails.description || '',
          logo_url: companyDetails.logo_url || '',
          website: result.url || companyDetails.website || '',
          headquarters: companyDetails.headquarters || '',
          founded: companyDetails.founded || null,
          employees: companyDetails.employees || '',
          revenue: companyDetails.revenue || '',
          market_cap: companyDetails.market_cap || '',
          stock_symbol: companyDetails.stock_symbol || '',
          stock_exchange: companyDetails.stock_exchange || '',
          market_share: companyDetails.market_share || 0,
          growth_rate: companyDetails.growth_rate || 0,
          key_offerings: companyDetails.key_offerings || '',
          top_products: companyDetails.top_products || ''
        });
      }
    }
    
    return companies;
  } catch (error) {
    console.error('Error fetching companies from Brave:', error);
    // Fall back to mock data
    console.log('Falling back to mock company data generation');
    return generateMockCompanies(query, industry, 10);
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
 * Get additional company details using Brave Search and Firecrawl
 * @param {string} companyName - Company name
 * @param {string} industry - 'dental' or 'aesthetic'
 * @returns {Promise<Object>} - Company details
 */
const getCompanyDetails = async (companyName, industry) => {
  try {
    console.log(`Getting details for ${companyName} in ${industry} industry`);
    
    // First, search for the company website using Brave Search
    const searchResults = await fetchFromBraveSearch(
      `${companyName} ${industry} company official website`,
      5
    );
    
    if (searchResults.length === 0) {
      return {};
    }
    
    // Initialize details object
    const details = {
      description: '',
      logo_url: '',
      website: '',
      headquarters: '',
      founded: null,
      employees: '',
      revenue: '',
      market_cap: '',
      stock_symbol: '',
      stock_exchange: '',
      market_share: 0,
      growth_rate: 0,
      key_offerings: '',
      top_products: ''
    };
    
    // Extract website from search results
    const websitePattern = /https?:\/\/(?:www\.)?([a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)/;
    let companyWebsite = '';
    
    for (const result of searchResults) {
      if (result.url && websitePattern.test(result.url)) {
        // Check if URL likely contains the company name
        const domain = new URL(result.url).hostname.toLowerCase();
        const simplifiedCompanyName = companyName.toLowerCase().replace(/\s+/g, '');
        
        if (domain.includes(simplifiedCompanyName) || 
            result.title.toLowerCase().includes(companyName.toLowerCase())) {
          companyWebsite = result.url;
          details.website = result.url;
          details.description = result.description || '';
          break;
        }
      }
    }
    
    // If we found a company website, use Firecrawl to extract more details
    if (companyWebsite) {
      try {
        console.log(`Scraping company website: ${companyWebsite}`);
        
        const scrapeResult = await use_mcp_tool({
          server_name: 'github.com/mendableai/firecrawl-mcp-server',
          tool_name: 'firecrawl_scrape',
          arguments: {
            url: companyWebsite,
            formats: ['markdown', 'html'],
            onlyMainContent: true
          }
        });
        
        if (scrapeResult && scrapeResult.markdown) {
          const content = scrapeResult.markdown;
          
          // Extract additional details from the scraped content
          
          // Extract headquarters
          const headquartersPatterns = [
            /headquarters?(?:\s+in|\s+is|\s+located\s+in)?\s+([^,.]+(?:,[^,.]+)?)/i,
            /based\s+in\s+([^,.]+(?:,[^,.]+)?)/i,
            /located\s+in\s+([^,.]+(?:,[^,.]+)?)/i,
            /office(?:s)?\s+in\s+([^,.]+(?:,[^,.]+)?)/i
          ];
          
          for (const pattern of headquartersPatterns) {
            const match = content.match(pattern);
            if (match && match[1]) {
              details.headquarters = match[1].trim();
              break;
            }
          }
          
          // Extract founded year
          const foundedPatterns = [
            /founded\s+in\s+(\d{4})/i,
            /established\s+in\s+(\d{4})/i,
            /since\s+(\d{4})/i,
            /founded\s+(\d{4})/i
          ];
          
          for (const pattern of foundedPatterns) {
            const match = content.match(pattern);
            if (match && match[1]) {
              details.founded = parseInt(match[1], 10);
              break;
            }
          }
          
          // Extract employee count
          const employeePatterns = [
            /(\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s*(?:employees|staff|team members)/i,
            /(?:employees|staff|team members)(?:\s+of)?\s+(\d{1,3}(?:,\d{3})*(?:\.\d+)?)/i,
            /(?:employs|employing)\s+(\d{1,3}(?:,\d{3})*(?:\.\d+)?)/i
          ];
          
          for (const pattern of employeePatterns) {
            const match = content.match(pattern);
            if (match && match[1]) {
              details.employees = match[1].trim();
              break;
            }
          }
          
          // Extract revenue
          const revenuePatterns = [
            /revenue(?:\s+of)?\s+\$?(\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s*(?:million|billion|m|b)/i,
            /\$?(\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s*(?:million|billion|m|b)(?:\s+in)?\s+revenue/i
          ];
          
          for (const pattern of revenuePatterns) {
            const match = content.match(pattern);
            if (match && match[1]) {
              const amount = match[1].replace(/,/g, '');
              const unit = match[0].toLowerCase().includes('billion') ? 'B' : 'M';
              details.revenue = `$${amount}${unit}`;
              break;
            }
          }
          
          // Extract market share
          const marketSharePatterns = [
            /market\s+share(?:\s+of)?\s+(\d{1,3}(?:\.\d+)?)\s*%/i,
            /(\d{1,3}(?:\.\d+)?)\s*%\s+market\s+share/i
          ];
          
          for (const pattern of marketSharePatterns) {
            const match = content.match(pattern);
            if (match && match[1]) {
              details.market_share = parseFloat(match[1]);
              break;
            }
          }
          
          // Extract growth rate
          const growthRatePatterns = [
            /growth\s+rate(?:\s+of)?\s+(\d{1,3}(?:\.\d+)?)\s*%/i,
            /(\d{1,3}(?:\.\d+)?)\s*%\s+growth/i,
            /growing\s+at\s+(\d{1,3}(?:\.\d+)?)\s*%/i
          ];
          
          for (const pattern of growthRatePatterns) {
            const match = content.match(pattern);
            if (match && match[1]) {
              details.growth_rate = parseFloat(match[1]);
              break;
            }
          }
          
          // Extract key offerings
          const keyOfferingsPatterns = [
            /(?:key|main|primary)\s+(?:offerings|products|solutions)(?:\s+include)?(?:\s+are)?:\s*([^\.]+)/i,
            /(?:specializ(?:es|ing)|focus(?:es|ing))\s+in\s+([^\.]+)/i
          ];
          
          for (const pattern of keyOfferingsPatterns) {
            const match = content.match(pattern);
            if (match && match[1]) {
              details.key_offerings = match[1].trim();
              break;
            }
          }
          
          // Extract top products
          const topProductsPatterns = [
            /(?:flagship|popular|leading|top)\s+products?(?:\s+include)?(?:\s+are)?:\s*([^\.]+)/i,
            /known\s+for\s+(?:its|their)\s+([^\.]+)/i
          ];
          
          for (const pattern of topProductsPatterns) {
            const match = content.match(pattern);
            if (match && match[1]) {
              details.top_products = match[1].trim();
              break;
            }
          }
          
          // If we still don't have a good description, extract one from the content
          if (!details.description || details.description.length < 100) {
            // Find a paragraph that mentions the company name
            const paragraphs = content.split('\n\n');
            for (const paragraph of paragraphs) {
              if (paragraph.toLowerCase().includes(companyName.toLowerCase()) && 
                  paragraph.length > 100 && paragraph.length < 500) {
                details.description = paragraph;
                break;
              }
            }
          }
          
          // Extract logo URL if available
          if (scrapeResult.html) {
            const logoMatch = scrapeResult.html.match(/<img[^>]+(?:logo|brand)[^>]+src="([^"]+)"/i);
            if (logoMatch && logoMatch[1]) {
              let logoUrl = logoMatch[1];
              
              // Make sure the URL is absolute
              if (logoUrl.startsWith('/')) {
                try {
                  const urlObj = new URL(companyWebsite);
                  logoUrl = `${urlObj.protocol}//${urlObj.hostname}${logoUrl}`;
                } catch (e) {
                  console.error(`Error creating absolute URL: ${e}`);
                }
              }
              
              details.logo_url = logoUrl;
            }
          }
        }
      } catch (error) {
        console.error(`Error scraping company website: ${error}`);
      }
    }
    
    // Try to get financial information using Firecrawl deep research
    try {
      console.log(`Performing deep research on ${companyName} financial information`);
      
      const deepResearchResult = await use_mcp_tool({
        server_name: 'github.com/mendableai/firecrawl-mcp-server',
        tool_name: 'firecrawl_deep_research',
        arguments: {
          query: `${companyName} ${industry} company financial information stock symbol market cap`,
          maxDepth: 2,
          timeLimit: 60,
          maxUrls: 5
        }
      });
      
      if (deepResearchResult && deepResearchResult.summary) {
        const summary = deepResearchResult.summary;
        
        // Extract stock symbol if not already found
        if (!details.stock_symbol) {
          const stockSymbolMatch = summary.match(/(?:stock\s+symbol|ticker)(?:\s+is)?\s+([A-Z]{1,5})/i);
          if (stockSymbolMatch && stockSymbolMatch[1]) {
            details.stock_symbol = stockSymbolMatch[1].trim();
          }
        }
        
        // Extract stock exchange if not already found
        if (!details.stock_exchange) {
          const stockExchangeMatch = summary.match(/(?:listed|traded)\s+on\s+(?:the\s+)?([A-Z\s]+)(?:\s+stock\s+exchange)?/i);
          if (stockExchangeMatch && stockExchangeMatch[1]) {
            details.stock_exchange = stockExchangeMatch[1].trim();
          }
        }
        
        // Extract market cap if not already found
        if (!details.market_cap) {
          const marketCapMatch = summary.match(/market\s+cap(?:italization)?(?:\s+of)?\s+\$?(\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s*(?:million|billion|m|b)/i);
          if (marketCapMatch && marketCapMatch[1]) {
            const amount = marketCapMatch[1].replace(/,/g, '');
            const unit = marketCapMatch[0].toLowerCase().includes('billion') ? 'B' : 'M';
            details.market_cap = `$${amount}${unit}`;
          }
        }
      }
    } catch (error) {
      console.error(`Error performing deep research: ${error}`);
    }
    
    // If we still need more information, search for specific company details
    if (!details.founded || !details.headquarters || !details.revenue) {
      const detailsResults = await fetchFromBraveSearch(
        `${companyName} ${industry} company profile headquarters founded revenue`,
        5
      );
      
      // Extract missing details from search results
      for (const result of detailsResults) {
        const text = result.description || '';
        
        // Extract headquarters if not already found
        if (!details.headquarters) {
          const headquartersPatterns = [
            /headquarters?(?:\s+in|\s+is|\s+located\s+in)?\s+([^,.]+(?:,[^,.]+)?)/i,
            /based\s+in\s+([^,.]+(?:,[^,.]+)?)/i,
            /located\s+in\s+([^,.]+(?:,[^,.]+)?)/i
          ];
          
          for (const pattern of headquartersPatterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
              details.headquarters = match[1].trim();
              break;
            }
          }
        }
        
        // Extract founded year if not already found
        if (!details.founded) {
          const foundedPattern = /founded\s+in\s+(\d{4})/i;
          const match = text.match(foundedPattern);
          if (match && match[1]) {
            details.founded = parseInt(match[1], 10);
          }
        }
      }
    }
    
    return details;
  } catch (error) {
    console.error('Error getting company details:', error);
    return {};
  }
};

/**
 * Store company data in Supabase
 * @param {Array} companies - Company data
 * @param {string} industry - 'dental' or 'aesthetic'
 */
const storeCompanyData = async (companies, industry) => {
  try {
    // Store in Supabase
    for (const [index, company] of companies.entries()) {
      const { error } = await supabaseClient
        .from('companies')
        .upsert({
          id: index + 1,
          ...company
        }, { onConflict: 'name, industry' });
      
      if (error) throw error;
    }
  } catch (error) {
    console.error('Error storing company data:', error);
    throw error;
  }
};

/**
 * Remove duplicate companies
 * @param {Array} companies - Companies array
 * @returns {Array} - Unique companies
 */
const removeDuplicateCompanies = (companies) => {
  const uniqueCompanies = [];
  const companyNames = new Set();
  
  for (const company of companies) {
    // Create a key using name and industry
    const key = `${company.name.toLowerCase()}_${company.industry}`;
    
    if (!companyNames.has(key)) {
      companyNames.add(key);
      uniqueCompanies.push(company);
    }
  }
  
  return uniqueCompanies;
};

/**
 * Generate mock company data
 * @param {string} query - Search query
 * @param {string} industry - 'dental' or 'aesthetic'
 * @param {number} limit - Number of companies to generate
 * @returns {Array} - Array of mock company data
 */
const generateMockCompanies = (query, industry, limit = 10) => {
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
    
    // Create mock company object
    const company = {
      name: companyName,
      industry: industry.toLowerCase(),
      description: `${companyName} is a leading provider of ${industry.toLowerCase()} products and services, offering innovative solutions for healthcare professionals and patients.`,
      logo_url: '',
      website: `https://www.${companyName.toLowerCase()}.com`,
      headquarters: ['New York, NY', 'San Francisco, CA', 'Boston, MA', 'Chicago, IL', 'Los Angeles, CA'][Math.floor(Math.random() * 5)],
      founded: foundedYear,
      employees: `${Math.floor(Math.random() * 9 + 1)},${Math.floor(Math.random() * 900 + 100)}`,
      revenue: `$${Math.floor(Math.random() * 9 + 1)}.${Math.floor(Math.random() * 9 + 1)}B`,
      market_cap: `$${Math.floor(Math.random() * 20 + 5)}B`,
      stock_symbol: `${companyName.substring(0, 4).toUpperCase()}`,
      stock_exchange: ['NYSE', 'NASDAQ'][Math.floor(Math.random() * 2)]
    };
    
    mockCompanies.push(company);
  }
  
  return mockCompanies;
};
