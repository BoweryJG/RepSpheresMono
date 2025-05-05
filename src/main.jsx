import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';
import theme from './theme';
import { AuthProvider } from './services/auth/AuthContext';

// Create a global MCP object to manage our MCP servers
window.mcp = {
  brave: {
    brave_web_search: async (params) => {
      console.log('Brave Search API called with params:', params);
      // Simulate API response with mock data
      return mockBraveSearchResults(params.query);
    },
    brave_local_search: async (params) => {
      console.log('Brave Local Search API called with params:', params);
      // Simulate API response with mock data
      return mockBraveLocalSearchResults(params.query);
    }
  },
  'github.com/mendableai/firecrawl-mcp-server': {
    firecrawl_scrape: async (params) => {
      console.log('Firecrawl Scrape called with params:', params);
      // Simulate API response with mock data
      return mockFirecrawlScrapeResults(params.url);
    },
    firecrawl_extract: async (params) => {
      console.log('Firecrawl Extract called with params:', params);
      // Simulate API response with mock data
      return mockFirecrawlExtractResults(params.urls, params.prompt);
    },
    firecrawl_deep_research: async (params) => {
      console.log('Firecrawl Deep Research called with params:', params);
      // Simulate API response with mock data
      return mockFirecrawlResearchResults(params.query);
    }
  }
};

// Mock data generators for MCP services
function mockBraveSearchResults(query) {
  const isDental = query.toLowerCase().includes('dental');
  
  const dentalResults = [
    {
      title: "The Future of Dentistry: 2025 Trends and Beyond",
      description: "Explore how AI, 3D printing, and teledentistry are transforming the dental industry in 2025. New research shows adoption rates increasing by 45% year-over-year.",
      url: "https://www.dentistrytoday.com/future-trends-2025",
      published_date: "April 15, 2025"
    },
    {
      title: "Digital Transformation in Dental Practices: 2025 Market Report",
      description: "Market analysis shows 78% of dental practices have adopted at least one form of AI-assisted diagnostic tool, with market size projected to reach $8.2B by end of 2025.",
      url: "https://www.dentaleconomics.com/market-report-2025",
      published_date: "March 22, 2025"
    },
    {
      title: "Staffing Challenges Continue to Impact Dental Industry in 2025",
      description: "New ADA survey reveals 62% of practices report difficulty filling hygienist positions, though graduation rates from dental programs show promising 12% increase.",
      url: "https://www.ada.org/resources/research/staffing-challenges-2025",
      published_date: "May 1, 2025"
    },
    {
      title: "Intraoral Scanner Technology: The 2025 Breakthrough",
      description: "Next-generation scanners with integrated AI diagnostics are revolutionizing chairside care. Market penetration reaches 57% in US dental practices.",
      url: "https://www.dentaltechnology.com/intraoral-scanners-2025",
      published_date: "February 8, 2025"
    },
    {
      title: "Dental Insurance Trends: What to Expect in 2025",
      description: "Analysis of changing reimbursement models and the rise of membership plans as alternatives to traditional insurance in the dental industry.",
      url: "https://www.dentalinsurancereview.com/trends-2025",
      published_date: "January 30, 2025"
    }
  ];
  
  const aestheticResults = [
    {
      title: "Aesthetic Medicine Market Report 2025: Growth and Innovation",
      description: "Non-invasive procedures continue to dominate the market with 23% year-over-year growth. AI-powered treatment planning emerges as game-changer.",
      url: "https://www.aestheticmedicinereport.com/market-2025",
      published_date: "April 10, 2025"
    },
    {
      title: "The Rise of Personalized Aesthetic Treatments in 2025",
      description: "Advanced 3D facial scanning and AI algorithms are creating truly customized treatment plans, increasing patient satisfaction by 37% according to new study.",
      url: "https://www.aestheticsjournal.com/personalized-treatments-2025",
      published_date: "March 15, 2025"
    },
    {
      title: "Virtual Consultations Become Standard in Aesthetic Industry",
      description: "Survey shows 82% of aesthetic practices now offer virtual consultation options, with 45% of initial patient interactions occurring digitally.",
      url: "https://www.modernmedspa.com/virtual-consultations-2025",
      published_date: "February 28, 2025"
    },
    {
      title: "Minimally Invasive Procedures Dominate 2025 Aesthetic Market",
      description: "Procedures with minimal downtime and natural-looking results continue to see highest growth rates, with 28% increase in patient demand year-over-year.",
      url: "https://www.surgery.org/trends/minimally-invasive-2025",
      published_date: "April 22, 2025"
    },
    {
      title: "Aesthetic Industry Technology Report: 2025 Innovations",
      description: "From AI-powered consultations to advanced energy-based devices, technology is reshaping the aesthetic medicine landscape and creating new opportunities.",
      url: "https://www.aesthetictechnology.com/innovations-2025",
      published_date: "January 17, 2025"
    }
  ];

  return {
    web: {
      results: isDental ? dentalResults : aestheticResults,
      total: isDental ? 1245 : 1378
    }
  };
}

function mockBraveLocalSearchResults(query) {
  const isDental = query.toLowerCase().includes('dental');
  
  const dentalResults = [
    {
      name: "Advanced Dental Associates",
      address: "123 Main Street, Boston, MA 02108",
      rating: 4.8,
      review_count: 142,
      phone: "(617) 555-1234",
      website: "https://www.advanceddentalboston.com",
      hours: "Mon-Fri: 8AM-6PM, Sat: 9AM-2PM"
    },
    {
      name: "Downtown Dental Specialists",
      address: "456 Washington Street, Boston, MA 02111",
      rating: 4.7,
      review_count: 98,
      phone: "(617) 555-5678",
      website: "https://www.downtowndentalboston.com",
      hours: "Mon-Thu: 7AM-7PM, Fri: 8AM-3PM"
    },
    {
      name: "Boston Smile Center",
      address: "789 Newbury Street, Boston, MA 02116",
      rating: 4.9,
      review_count: 215,
      phone: "(617) 555-9012",
      website: "https://www.bostonsmilecenter.com",
      hours: "Mon-Fri: 8AM-5PM"
    }
  ];
  
  const aestheticResults = [
    {
      name: "Boston Aesthetic Medicine",
      address: "100 Beacon Street, Boston, MA 02116",
      rating: 4.9,
      review_count: 187,
      phone: "(617) 555-3456",
      website: "https://www.bostonaestheticmedicine.com",
      hours: "Mon-Fri: 9AM-7PM, Sat: 10AM-4PM"
    },
    {
      name: "Newbury Street Medspa",
      address: "350 Newbury Street, Boston, MA 02115",
      rating: 4.8,
      review_count: 156,
      phone: "(617) 555-7890",
      website: "https://www.newburymedspa.com",
      hours: "Tue-Sat: 10AM-8PM"
    },
    {
      name: "Beacon Hill Aesthetics",
      address: "42 Charles Street, Boston, MA 02114",
      rating: 4.7,
      review_count: 112,
      phone: "(617) 555-2345",
      website: "https://www.beaconhillaesthetics.com",
      hours: "Mon-Fri: 9AM-6PM"
    }
  ];

  return {
    local: {
      results: isDental ? dentalResults : aestheticResults,
      total: isDental ? 87 : 64
    }
  };
}

function mockFirecrawlScrapeResults(url) {
  return {
    url: url,
    title: url.includes('dental') ? 
      "Dental Industry Insights 2025" : 
      "Aesthetic Medicine Trends 2025",
    content: url.includes('dental') ?
      "The dental industry continues to evolve with technological advancements driving significant changes in practice management and patient care. AI-assisted diagnostics, 3D printing, and cloud-based practice management solutions are among the top trends in 2025." :
      "The aesthetic medicine industry is seeing rapid growth in 2025, with minimally invasive procedures and personalized treatment plans leading the way. Virtual consultations and AI-powered treatment planning are becoming standard practice across the industry."
  };
}

function mockFirecrawlExtractResults(urls, prompt) {
  const isDental = urls.some(url => url.includes('dental') || url.includes('ada.org'));
  
  const dentalInsights = [
    {
      url: "https://www.ada.org/resources/research/health-policy-institute",
      extract: "According to the ADA Health Policy Institute, dental practices are facing three major challenges in 2025: staffing shortages (particularly dental hygienists), insurance reimbursement issues, and rising overhead costs. However, digital technology adoption is helping practices overcome these challenges through improved efficiency and new service offerings."
    },
    {
      url: "https://www.dentistrytoday.com/",
      extract: "Dentistry Today reports that AI adoption in dental practices has reached 18% in 2025, with another 66% of practices planning to implement AI solutions within the next 12 months. The primary applications include radiograph analysis, treatment planning assistance, and practice management optimization."
    },
    {
      url: "https://www.dentaleconomics.com/",
      extract: "The dental industry market size is projected to reach $63.5 billion by the end of 2025, with a compound annual growth rate of 9.6%. Digital dentistry, particularly intraoral scanners and 3D printing, is driving significant growth and efficiency improvements."
    }
  ];
  
  const aestheticInsights = [
    {
      url: "https://www.americanmedspa.org/",
      extract: "The American Med Spa Association reports that the aesthetic medicine market is expected to reach $83.9 billion by the end of 2025, with non-invasive procedures showing the strongest growth at 23% year-over-year. Patient demographics are expanding, with millennials now representing 35% of the market."
    },
    {
      url: "https://www.plasticsurgery.org/news/plastic-surgery-statistics",
      extract: "According to the American Society of Plastic Surgeons, minimally invasive procedures continue to dominate the market in 2025, with a 28% increase in demand compared to 2023. Virtual consultations have become standard practice, with 82% of practices offering this option."
    },
    {
      url: "https://www.surgery.org/media/statistics",
      extract: "The Aesthetic Society reports that personalized treatment plans powered by AI and 3D facial scanning technology have increased patient satisfaction rates by 37% in 2025. The most popular procedures continue to be neurotoxins, fillers, and energy-based skin treatments."
    }
  ];
  
  return {
    results: isDental ? dentalInsights : aestheticInsights
  };
}

function mockFirecrawlResearchResults(query) {
  const isDental = query.toLowerCase().includes('dental');
  
  const dentalResearch = {
    summary: "The dental industry is experiencing significant technological transformation in 2025, with AI, 3D printing, and cloud-based solutions leading the way. Practices that adopt these technologies are seeing improved efficiency, better patient outcomes, and increased profitability despite challenges like staffing shortages and insurance issues.",
    keyFindings: [
      "AI adoption in dental practices has reached 18% in 2025, with diagnostic applications showing 92% accuracy in clinical trials.",
      "Intraoral scanner penetration has reached 57% of US dental practices, with multi-functional devices becoming the new standard.",
      "3D printing is now used in 15% of dental practices, primarily for surgical guides, models, and temporary restorations.",
      "Cloud-based practice management solutions that integrate multiple technologies are showing 34% efficiency improvements.",
      "Staffing shortages remain a significant challenge, with 62% of practices reporting difficulty filling hygienist positions."
    ],
    sources: [
      {
        title: "ADA Health Policy Institute: 2025 Dental Industry Report",
        url: "https://www.ada.org/resources/research/health-policy-institute/dental-industry-report-2025"
      },
      {
        title: "Journal of Digital Dentistry: Technology Adoption Trends",
        url: "https://www.journalofdigitaldentistry.org/tech-adoption-2025"
      },
      {
        title: "Dental Economics: Market Size and Growth Projections",
        url: "https://www.dentaleconomics.com/market-projections-2025"
      }
    ]
  };
  
  const aestheticResearch = {
    summary: "The aesthetic medicine industry continues to show strong growth in 2025, driven by technological innovations, changing patient demographics, and increasing acceptance of aesthetic procedures. Minimally invasive treatments, personalized care plans, and digital-first patient experiences are defining the market landscape.",
    keyFindings: [
      "Non-invasive and minimally invasive procedures represent 78% of the total aesthetic medicine market in 2025.",
      "AI-powered treatment planning tools have been adopted by 42% of aesthetic practices, with 37% improvement in patient satisfaction.",
      "Virtual consultations now account for 45% of initial patient interactions across the industry.",
      "3D facial scanning technology has become standard in 53% of practices, enabling more precise treatment planning.",
      "The patient demographic is expanding, with millennials now representing 35% of the market and Gen Z showing the fastest growth rate at 18% year-over-year."
    ],
    sources: [
      {
        title: "Aesthetic Medicine Market Report 2025",
        url: "https://www.aestheticmedicinereport.com/market-2025"
      },
      {
        title: "American Society for Aesthetic Plastic Surgery: Annual Statistics",
        url: "https://www.surgery.org/media/statistics-2025"
      },
      {
        title: "Journal of Cosmetic Dermatology: Technology Trends",
        url: "https://www.cosmeticdermatologyjournal.org/tech-trends-2025"
      }
    ]
  };
  
  return isDental ? dentalResearch : aestheticResearch;
}

// Initialize React app
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
