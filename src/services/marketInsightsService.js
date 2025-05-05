/**
 * Market Insights Service - Fetches industry insights using Firecrawl MCP
 */

// Function to fetch dental industry insights from authoritative sources
export const fetchDentalInsights = async () => {
  try {
    // Use Firecrawl to extract structured information from dental industry websites
    const response = await window.mcp['github.com/mendableai/firecrawl-mcp-server'].firecrawl_extract({
      urls: [
        "https://www.ada.org/resources/research/health-policy-institute",
        "https://www.dentistrytoday.com/",
        "https://www.dentaleconomics.com/",
        "https://www.dso.org/industry-insights",
        "https://www.dentistry.com/trends-insights/"
      ],
      prompt: "Extract the latest trends, challenges, and growth predictions for the dental industry in 2025. Focus on technological advancements, market size, and industry challenges.",
      systemPrompt: "You are an expert dental industry analyst. Extract and summarize key market insights from these websites."
    });
    
    return formatInsights(response.results);
  } catch (error) {
    console.error("Error fetching dental insights:", error);
    return [];
  }
};

// Function to fetch aesthetic industry insights from authoritative sources
export const fetchAestheticInsights = async () => {
  try {
    // Use Firecrawl to extract structured information from aesthetic industry websites
    const response = await window.mcp['github.com/mendableai/firecrawl-mcp-server'].firecrawl_extract({
      urls: [
        "https://www.americanmedspa.org/",
        "https://www.plasticsurgery.org/news/plastic-surgery-statistics",
        "https://www.surgery.org/media/statistics",
        "https://www.isaps.org/medical-professionals/isaps-global-statistics/",
        "https://www.aestheticsociety.org/news/statistics"
      ],
      prompt: "Extract the latest trends, challenges, and growth predictions for the aesthetic procedures industry in 2025. Focus on popular procedures, technological advancements, and market growth.",
      systemPrompt: "You are an expert aesthetic industry analyst. Extract and summarize key market insights from these websites."
    });
    
    return formatInsights(response.results);
  } catch (error) {
    console.error("Error fetching aesthetic insights:", error);
    return [];
  }
};

// Function to perform deep research on a specific industry topic
export const researchIndustryTopic = async (query, isDental = true) => {
  try {
    // Use Firecrawl deep research to analyze a specific topic
    const industryContext = isDental ? "dental industry" : "aesthetic procedures industry";
    const response = await window.mcp['github.com/mendableai/firecrawl-mcp-server'].firecrawl_deep_research({
      query: `${query} in the ${industryContext} 2025`,
      maxDepth: 5,
      timeLimit: 180,
      maxUrls: 15
    });
    
    return {
      summary: response.summary,
      keyFindings: response.keyFindings || [],
      sources: response.sources || []
    };
  } catch (error) {
    console.error("Error researching industry topic:", error);
    return {
      summary: "Unable to retrieve research at this time.",
      keyFindings: [],
      sources: []
    };
  }
};

// Function to get market trend analysis
export const getMarketTrendAnalysis = async (topic, isDental = true) => {
  try {
    const industry = isDental ? "dental" : "aesthetic";
    const response = await window.mcp['github.com/mendableai/firecrawl-mcp-server'].firecrawl_search({
      query: `${topic} ${industry} industry trends analysis 2025`,
      limit: 5,
      scrapeOptions: {
        formats: ["markdown"],
        onlyMainContent: true
      }
    });
    
    // Use Context7 to get additional library documentation if needed
    let libraryDocs = {};
    if (topic.toLowerCase().includes('ai') || topic.toLowerCase().includes('machine learning')) {
      const libraryId = await window.mcp.context7.resolve_library_id({
        libraryName: "tensorflow.js"
      });
      
      if (libraryId) {
        libraryDocs = await window.mcp.context7.get_library_docs({
          context7CompatibleLibraryID: libraryId,
          topic: "healthcare applications"
        });
      }
    }
    
    return {
      searchResults: response.results || [],
      libraryDocs: libraryDocs.documentation || "",
      analysisDate: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error getting market trend analysis:", error);
    return {
      searchResults: [],
      libraryDocs: "",
      analysisDate: new Date().toISOString()
    };
  }
};

// Function to get competitive intelligence
export const getCompetitiveIntelligence = async (companyName, isDental = true) => {
  try {
    const industry = isDental ? "dental" : "aesthetic";
    
    // Use GitHub MCP to search for company information
    const githubResults = await window.mcp.github.search_repositories({
      query: `${companyName} ${industry} technology`
    });
    
    // Use Brave Search for company news
    const newsResults = await window.mcp.brave.brave_web_search({
      query: `${companyName} ${industry} industry news financial results 2025`,
      count: 5
    });
    
    return {
      companyName,
      githubProjects: githubResults.items || [],
      newsArticles: newsResults.web?.results || [],
      analysisDate: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error getting competitive intelligence:", error);
    return {
      companyName,
      githubProjects: [],
      newsArticles: [],
      analysisDate: new Date().toISOString()
    };
  }
};

// Helper function to format insights from Firecrawl
const formatInsights = (results) => {
  if (!results || !Array.isArray(results)) return [];
  
  return results.map(item => ({
    source: item.url ? extractDomain(item.url) : 'Industry Source',
    insights: item.content || item.extract || "No insights available",
    url: item.url || "",
    date: item.date || new Date().toISOString().split('T')[0]
  }));
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
