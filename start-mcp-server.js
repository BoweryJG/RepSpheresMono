/**
 * MCP Server Starter Script
 * This script starts the Supabase MCP server
 */

import { spawn } from 'child_process';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import http from 'http';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the MCP configuration
const mcpConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'mcp-config.json'), 'utf8'));

// Get the Supabase MCP server configuration
const supabaseConfig = mcpConfig.mcpServers.supabase;

if (!supabaseConfig) {
  console.error('Supabase MCP server configuration not found in mcp-config.json');
  process.exit(1);
}

// Create a simple HTTP server to handle MCP requests
const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    // Handle CORS preflight requests
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    });
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // Handle MCP requests
  if (req.url === '/mcp/tool') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        const { server_name, tool_name, arguments: args } = JSON.parse(body);
        
        if (server_name !== 'supabase') {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid server name' }));
          return;
        }
        
        console.log(`MCP tool request: ${tool_name}`, args);
        
        // Process the tool request
        let result;
        try {
          // Here we would normally call the Supabase API
          // For now, we'll return mock data
          result = await mockSupabaseToolResponse(tool_name, args);
        } catch (error) {
          console.error(`Error processing tool ${tool_name}:`, error);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: error.message }));
          return;
        }
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (error) {
        console.error('Error parsing request:', error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid request format' }));
      }
    });
  } else if (req.url === '/mcp/resource') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        const { server_name, uri } = JSON.parse(body);
        
        if (server_name !== 'supabase') {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid server name' }));
          return;
        }
        
        console.log(`MCP resource request: ${uri}`);
        
        // Process the resource request
        let result;
        try {
          // Here we would normally fetch the resource from Supabase
          // For now, we'll return mock data
          result = await mockSupabaseResourceResponse(uri);
        } catch (error) {
          console.error(`Error accessing resource ${uri}:`, error);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: error.message }));
          return;
        }
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (error) {
        console.error('Error parsing request:', error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid request format' }));
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

// Import dental data for real data processing
import { 
  dentalProcedures, 
  dentalCategories, 
  dentalMarketGrowth, 
  dentalDemographics, 
  dentalGenderDistribution 
} from './src/data/dentalProcedures.js';

import { 
  aestheticProcedures, 
  aestheticCategories, 
  aestheticMarketGrowth, 
  aestheticDemographics, 
  aestheticGenderDistribution 
} from './src/data/aestheticProcedures.js';

import { 
  metropolitanMarkets
} from './src/data/metropolitanMarkets.js';

// Process Supabase tool requests with real data
async function mockSupabaseToolResponse(toolName, args) {
  switch (toolName) {
    case 'list_projects':
      return [
        {
          id: 'cbopynuvhcymbumjnvay',
          name: 'Market Insights',
          organization_id: 'org123',
          created_at: '2025-05-01T00:00:00.000Z',
          status: 'active'
        }
      ];
    
    case 'get_project':
      return {
        id: args.id || 'cbopynuvhcymbumjnvay',
        name: 'Market Insights',
        organization_id: 'org123',
        created_at: '2025-05-01T00:00:00.000Z',
        status: 'active'
      };
    
    case 'list_tables':
      return [
        {
          id: 1,
          name: 'dental_procedures',
          schema: args.schemas[0] || 'public',
          comment: 'Dental procedures and market data'
        },
        {
          id: 2,
          name: 'aesthetic_procedures',
          schema: args.schemas[0] || 'public',
          comment: 'Aesthetic procedures and market data'
        },
        {
          id: 3,
          name: 'dental_categories',
          schema: args.schemas[0] || 'public',
          comment: 'Dental categories'
        },
        {
          id: 4,
          name: 'aesthetic_categories',
          schema: args.schemas[0] || 'public',
          comment: 'Aesthetic categories'
        },
        {
          id: 5,
          name: 'dental_market_growth',
          schema: args.schemas[0] || 'public',
          comment: 'Dental market growth data'
        },
        {
          id: 6,
          name: 'aesthetic_market_growth',
          schema: args.schemas[0] || 'public',
          comment: 'Aesthetic market growth data'
        },
        {
          id: 7,
          name: 'dental_demographics',
          schema: args.schemas[0] || 'public',
          comment: 'Dental demographics data'
        },
        {
          id: 8,
          name: 'aesthetic_demographics',
          schema: args.schemas[0] || 'public',
          comment: 'Aesthetic demographics data'
        },
        {
          id: 9,
          name: 'dental_gender_distribution',
          schema: args.schemas[0] || 'public',
          comment: 'Dental gender distribution data'
        },
        {
          id: 10,
          name: 'aesthetic_gender_distribution',
          schema: args.schemas[0] || 'public',
          comment: 'Aesthetic gender distribution data'
        },
        {
          id: 11,
          name: 'metropolitan_markets',
          schema: args.schemas[0] || 'public',
          comment: 'Metropolitan markets and demographic data'
        }
      ];
    
    case 'execute_sql':
      if (args.query.toLowerCase().includes('select') && args.query.toLowerCase().includes('dental_procedures')) {
        // Real dental procedures data
        const categoryMap = {};
        dentalCategories.forEach((cat, index) => {
          categoryMap[cat] = index + 1;
        });
        
        return {
          data: dentalProcedures.map((proc, index) => ({
            id: index + 1,
            procedure_name: proc.name,
            category_id: categoryMap[proc.category] || 1,
            yearly_growth_percentage: proc.growth,
            market_size_2025_usd_millions: proc.marketSize2025,
            age_range: proc.primaryAgeGroup,
            recent_trends: proc.trends,
            future_outlook: proc.futureOutlook
          }))
        };
      }
      
      if (args.query.toLowerCase().includes('select') && args.query.toLowerCase().includes('aesthetic_procedures')) {
        // Real aesthetic procedures data
        const categoryMap = {};
        aestheticCategories.forEach((cat, index) => {
          categoryMap[cat] = index + 1;
        });
        
        return {
          data: aestheticProcedures.map((proc, index) => ({
            id: index + 1,
            name: proc.name,
            category_id: categoryMap[proc.category] || 1,
            yearly_growth_percentage: proc.growth,
            market_size_2025_usd_millions: proc.marketSize2025,
            primary_age_group: proc.primaryAgeGroup,
            trends: proc.trends,
            future_outlook: proc.futureOutlook
          }))
        };
      }
      
      if (args.query.toLowerCase().includes('select') && args.query.toLowerCase().includes('dental_categories')) {
        return {
          data: dentalCategories.map((category, index) => ({
            id: index + 1,
            category_label: category
          }))
        };
      }
      
      if (args.query.toLowerCase().includes('select') && args.query.toLowerCase().includes('aesthetic_categories')) {
        return {
          data: aestheticCategories.map((category, index) => ({
            id: index + 1,
            name: category
          }))
        };
      }
      
      if (args.query.toLowerCase().includes('select') && args.query.toLowerCase().includes('dental_market_growth')) {
        return {
          data: dentalMarketGrowth.map((growth, index) => ({
            id: index + 1,
            year: growth.year,
            size: growth.size,
            is_projected: growth.year >= 2025
          }))
        };
      }
      
      if (args.query.toLowerCase().includes('select') && args.query.toLowerCase().includes('aesthetic_market_growth')) {
        return {
          data: aestheticMarketGrowth.map((growth, index) => ({
            id: index + 1,
            year: growth.year,
            size: growth.size,
            is_projected: growth.year >= 2025
          }))
        };
      }
      
      if (args.query.toLowerCase().includes('select') && args.query.toLowerCase().includes('dental_demographics')) {
        return {
          data: dentalDemographics.map((demo, index) => ({
            id: index + 1,
            age_group: demo.ageGroup,
            percentage: demo.percentage
          }))
        };
      }
      
      if (args.query.toLowerCase().includes('select') && args.query.toLowerCase().includes('aesthetic_demographics')) {
        return {
          data: aestheticDemographics.map((demo, index) => ({
            id: index + 1,
            age_group: demo.ageGroup,
            percentage: demo.percentage
          }))
        };
      }
      
      if (args.query.toLowerCase().includes('select') && args.query.toLowerCase().includes('dental_gender_distribution')) {
        return {
          data: dentalGenderDistribution.map((gender, index) => ({
            id: index + 1,
            name: gender.name,
            value: gender.value
          }))
        };
      }
      
      if (args.query.toLowerCase().includes('select') && args.query.toLowerCase().includes('aesthetic_gender_distribution')) {
        return {
          data: aestheticGenderDistribution.map((gender, index) => ({
            id: index + 1,
            name: gender.name,
            value: gender.value
          }))
        };
      }
      
      if (args.query.toLowerCase().includes('select') && args.query.toLowerCase().includes('metropolitan_markets')) {
        return {
          data: metropolitanMarkets.map((market, index) => ({
            id: index + 1,
            rank: market.rank,
            metro: market.metro,
            market_size_2023: market.marketSize2023,
            market_size_2030: market.marketSize2030,
            growth_rate: market.growthRate,
            key_procedures: market.keyProcedures,
            provider_density: market.providerDensity,
            insurance_coverage: market.insuranceCoverage,
            disposable_income: market.disposableIncome
          }))
        };
      }
      
      return { data: [] };
    
    case 'get_project_url':
      return {
        url: 'https://cbopynuvhcymbumjnvay.supabase.co'
      };
    
    case 'get_anon_key':
      return {
        anon_key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNib3B5bnV2aGN5bWJ1bWpudmF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5OTUxNzMsImV4cCI6MjA1OTU3MTE3M30.UZElMkoHugIt984RtYWyfrRuv2rB67opQdCrFVPCfzU'
      };
    
    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

// Process Supabase resource requests with actual data
async function mockSupabaseResourceResponse(uri) {
  if (uri.includes('project')) {
    return {
      id: 'cbopynuvhcymbumjnvay',
      name: 'Market Insights',
      organization_id: 'org123',
      created_at: '2025-05-01T00:00:00.000Z',
      status: 'active'
    };
  }
  
  if (uri.includes('tables')) {
    return [
      {
        id: 1,
        name: 'dental_procedures',
        schema: 'public',
        comment: 'Dental procedures and market data'
      },
      {
        id: 2,
        name: 'aesthetic_procedures',
        schema: 'public',
        comment: 'Aesthetic procedures and market data'
      },
      {
        id: 3,
        name: 'dental_categories',
        schema: 'public',
        comment: 'Dental categories'
      },
      {
        id: 4,
        name: 'aesthetic_categories',
        schema: 'public',
        comment: 'Aesthetic categories'
      },
      {
        id: 5,
        name: 'dental_market_growth',
        schema: 'public',
        comment: 'Dental market growth data'
      },
      {
        id: 6,
        name: 'aesthetic_market_growth',
        schema: 'public',
        comment: 'Aesthetic market growth data'
      },
      {
        id: 7,
        name: 'dental_demographics',
        schema: 'public',
        comment: 'Dental demographics data'
      },
      {
        id: 8,
        name: 'aesthetic_demographics',
        schema: 'public',
        comment: 'Aesthetic demographics data'
      },
      {
        id: 9,
        name: 'dental_gender_distribution',
        schema: 'public',
        comment: 'Dental gender distribution data'
      },
      {
        id: 10,
        name: 'aesthetic_gender_distribution',
        schema: 'public',
        comment: 'Aesthetic gender distribution data'
      },
      {
        id: 11,
        name: 'metropolitan_markets',
        schema: 'public',
        comment: 'Metropolitan markets and demographic data'
      }
    ];
  }
  
  // Return actual dental procedures data if requested
  if (uri.includes('dental_procedures')) {
    const categoryMap = {};
    dentalCategories.forEach((cat, index) => {
      categoryMap[cat] = index + 1;
    });
    
    return dentalProcedures.map((proc, index) => ({
      id: index + 1,
      procedure_name: proc.name,
      category_id: categoryMap[proc.category] || 1,
      yearly_growth_percentage: proc.growth,
      market_size_2025_usd_millions: proc.marketSize2025,
      age_range: proc.primaryAgeGroup,
      recent_trends: proc.trends,
      future_outlook: proc.futureOutlook
    }));
  }
  
  throw new Error(`Unknown resource URI: ${uri}`);
}

// Start the MCP server
const PORT = 3333;
server.listen(PORT, () => {
  console.log(`MCP server listening on port ${PORT}`);
});

// Also start the Supabase MCP server as configured in mcp-config.json
console.log('Starting Supabase MCP server...');

// Start the Supabase MCP server
const supabaseMcp = spawn(supabaseConfig.command, supabaseConfig.args, {
  stdio: 'inherit',
  shell: true
});

supabaseMcp.on('error', (error) => {
  console.error('Failed to start Supabase MCP server:', error);
});

supabaseMcp.on('close', (code) => {
  if (code !== 0) {
    console.error(`Supabase MCP server exited with code ${code}`);
  } else {
    console.log('Supabase MCP server stopped');
  }
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Stopping servers...');
  server.close();
  supabaseMcp.kill();
  process.exit();
});

console.log('MCP servers started. Press Ctrl+C to stop.');
