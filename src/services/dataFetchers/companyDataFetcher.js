import { supabase } from '../supabase/supabaseClient';

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
    
    // Fetch company data using Brave Search
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
 * Fetch companies using Brave Search
 * @param {string} query - Search query
 * @param {string} industry - 'dental' or 'aesthetic'
 * @returns {Promise<Array>} - Array of company objects
 */
const fetchCompaniesFromBrave = async (query, industry) => {
  try {
    // Use Brave MCP tool to search for companies
    const response = await use_mcp_tool({
      server_name: 'brave',
      tool_name: 'brave_web_search',
      arguments: {
        query: `${query} industry leaders`,
        count: 20
      }
    });
    
    const results = response.results || [];
    const companies = [];
    
    // Process search results to extract company information
    for (const result of results) {
      // Extract company name from title
      const companyName = extractCompanyName(result.title);
      
      if (companyName) {
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
          stock_exchange: companyDetails.stock_exchange || ''
        });
      }
    }
    
    return companies;
  } catch (error) {
    console.error('Error fetching companies from Brave:', error);
    throw error;
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
 * Get additional company details
 * @param {string} companyName - Company name
 * @param {string} industry - 'dental' or 'aesthetic'
 * @returns {Promise<Object>} - Company details
 */
const getCompanyDetails = async (companyName, industry) => {
  try {
    // Use Brave MCP tool to search for company details
    const response = await use_mcp_tool({
      server_name: 'brave',
      tool_name: 'brave_web_search',
      arguments: {
        query: `${companyName} ${industry} company profile headquarters founded`,
        count: 5
      }
    });
    
    const results = response.results || [];
    
    if (results.length === 0) {
      return {};
    }
    
    // Extract details from search results
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
      stock_exchange: ''
    };
    
    // Combine descriptions from results
    details.description = results[0].description || '';
    
    // Extract website
    const websitePattern = /https?:\/\/(?:www\.)?([a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)/;
    for (const result of results) {
      if (result.url && websitePattern.test(result.url)) {
        details.website = result.url;
        break;
      }
    }
    
    // Extract headquarters
    const headquartersPatterns = [
      /headquarters?(?:\s+in|\s+is|\s+located\s+in)?\s+([^,.]+(?:,[^,.]+)?)/i,
      /based\s+in\s+([^,.]+(?:,[^,.]+)?)/i,
      /located\s+in\s+([^,.]+(?:,[^,.]+)?)/i
    ];
    
    for (const result of results) {
      const text = result.description || '';
      for (const pattern of headquartersPatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
          details.headquarters = match[1].trim();
          break;
        }
      }
      if (details.headquarters) break;
    }
    
    // Extract founded year
    const foundedPattern = /founded\s+in\s+(\d{4})/i;
    for (const result of results) {
      const text = result.description || '';
      const match = text.match(foundedPattern);
      if (match && match[1]) {
        details.founded = parseInt(match[1], 10);
        break;
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
      const { error } = await supabase
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
