/**
 * Unified Supabase Service Initialization Module
 * 
 * This module exports all data access functions from the unifiedSupabaseService.js file
 * and provides an initialization function to setup the service properly.
 */

import { supabaseClient } from './supabaseClient.js';

// Detect if we're in a production environment
const isProduction = process.env.NODE_ENV === 'production' || 
                    (typeof import.meta !== 'undefined' && import.meta.env?.MODE === 'production') ||
                    (typeof window !== 'undefined' && window.location?.hostname?.includes('netlify.app'));

/**
 * Object containing the unified service interface
 */
export const unifiedSupabaseService = {
  /**
   * Initialize the unified service
   * @returns {Promise<Object>} Initialization result
   */
  initialize: async () => {
    console.log('[Unified Service] Initializing in', isProduction ? 'production' : 'development', 'mode');
    
    let usingMcp = false;
    
    try {
      // Only try to use MCP in development mode
      if (!isProduction && typeof window !== 'undefined' && window.use_mcp_tool) {
        try {
          // Test MCP connection
          const testResult = await window.use_mcp_tool({
            server_name: 'supabase',
            tool_name: 'get_project',
            arguments: {
              id: process.env.VITE_SUPABASE_PROJECT_ID || 'cbopynuvhcymbumjnvay'
            }
          });
          
          console.log('[Unified Service] MCP connection successful', testResult);
          usingMcp = true;
        } catch (mcpError) {
          console.warn('[Unified Service] MCP not available, falling back to direct API:', mcpError);
          
          // Test direct Supabase connection
          const { data, error } = await supabaseClient.from('v_all_procedures').select('count', { count: 'exact', head: true });
          
          if (error) {
            throw new Error(`Direct Supabase connection error: ${error.message}`);
          }
        }
      } else {
        console.log('[Unified Service] MCP not available, using direct Supabase API');
        
        // Test direct Supabase connection
        const { data, error } = await supabaseClient.from('v_all_procedures').select('count', { count: 'exact', head: true });
        
        if (error) {
          throw new Error(`Direct Supabase connection error: ${error.message}`);
        }
      }
      
      return {
        success: true,
        usingMcp: usingMcp,
        environment: isProduction ? 'production' : 'development'
      };
    } catch (error) {
      console.error('[Unified Service] Initialization error:', error);
      return {
        success: false,
        error: error.message,
        usingMcp: false,
        environment: isProduction ? 'production' : 'development'
      };
    }
  }
};

// Implementation of data access functions

/**
 * Get dental procedures from the Supabase database
 * @returns {Promise<Array>} Array of dental procedures
 */
export async function getDentalProcedures() {
  console.log('[Unified Service] Fetching dental procedures');
  try {
    // Try to use MCP in development
    if (!isProduction && typeof window !== 'undefined' && window.use_mcp_tool) {
      try {
        const result = await window.use_mcp_tool({
          server_name: 'supabase',
          tool_name: 'execute_sql',
          arguments: {
            project_id: process.env.VITE_SUPABASE_PROJECT_ID || 'cbopynuvhcymbumjnvay',
            query: 'SELECT * FROM v_dental_procedures ORDER BY name ASC'
          }
        });
        
        console.log('[Unified Service] Dental procedures fetched via MCP:', result?.data?.length || 0);
        return result?.data || [];
      } catch (mcpError) {
        console.warn('[Unified Service] MCP fetch failed, falling back to direct API:', mcpError);
      }
    }
    
    // Direct Supabase query as fallback or in production
    const { data, error } = await supabaseClient
      .from('v_dental_procedures')
      .select('*')
      .order('name', { ascending: true });
      
    if (error) throw error;
    
    console.log('[Unified Service] Dental procedures fetched via direct API:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('[Unified Service] Error fetching dental procedures:', error);
    return [];
  }
}

/**
 * Get aesthetic procedures from the Supabase database
 * @returns {Promise<Array>} Array of aesthetic procedures
 */
export async function getAestheticProcedures() {
  console.log('[Unified Service] Fetching aesthetic procedures');
  try {
    // Try to use MCP in development
    if (!isProduction && typeof window !== 'undefined' && window.use_mcp_tool) {
      try {
        const result = await window.use_mcp_tool({
          server_name: 'supabase',
          tool_name: 'execute_sql',
          arguments: {
            project_id: process.env.VITE_SUPABASE_PROJECT_ID || 'cbopynuvhcymbumjnvay',
            query: 'SELECT * FROM v_aesthetic_procedures ORDER BY name ASC'
          }
        });
        
        console.log('[Unified Service] Aesthetic procedures fetched via MCP:', result?.data?.length || 0);
        return result?.data || [];
      } catch (mcpError) {
        console.warn('[Unified Service] MCP fetch failed, falling back to direct API:', mcpError);
      }
    }
    
    // Direct Supabase query as fallback or in production
    const { data, error } = await supabaseClient
      .from('v_aesthetic_procedures')
      .select('*')
      .order('name', { ascending: true });
      
    if (error) throw error;
    
    console.log('[Unified Service] Aesthetic procedures fetched via direct API:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('[Unified Service] Error fetching aesthetic procedures:', error);
    return [];
  }
}

/**
 * Get dental companies from the Supabase database
 * @returns {Promise<Array>} Array of dental companies
 */
export async function getDentalCompanies() {
  console.log('[Unified Service] Fetching dental companies');
  try {
    // Try to use MCP in development
    if (!isProduction && typeof window !== 'undefined' && window.use_mcp_tool) {
      try {
        const result = await window.use_mcp_tool({
          server_name: 'supabase',
          tool_name: 'execute_sql',
          arguments: {
            project_id: process.env.VITE_SUPABASE_PROJECT_ID || 'cbopynuvhcymbumjnvay',
            query: 'SELECT * FROM v_dental_companies ORDER BY name ASC'
          }
        });
        
        console.log('[Unified Service] Dental companies fetched via MCP:', result?.data?.length || 0);
        return result?.data || [];
      } catch (mcpError) {
        console.warn('[Unified Service] MCP fetch failed, falling back to direct API:', mcpError);
      }
    }
    
    // Direct Supabase query as fallback or in production
    const { data, error } = await supabaseClient
      .from('v_dental_companies')
      .select('*')
      .order('name', { ascending: true });
      
    if (error) throw error;
    
    console.log('[Unified Service] Dental companies fetched via direct API:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('[Unified Service] Error fetching dental companies:', error);
    return [];
  }
}

/**
 * Get aesthetic companies from the Supabase database
 * @returns {Promise<Array>} Array of aesthetic companies
 */
export async function getAestheticCompanies() {
  console.log('[Unified Service] Fetching aesthetic companies');
  try {
    // Try to use MCP in development
    if (!isProduction && typeof window !== 'undefined' && window.use_mcp_tool) {
      try {
        const result = await window.use_mcp_tool({
          server_name: 'supabase',
          tool_name: 'execute_sql',
          arguments: {
            project_id: process.env.VITE_SUPABASE_PROJECT_ID || 'cbopynuvhcymbumjnvay',
            query: 'SELECT * FROM v_aesthetic_companies ORDER BY name ASC'
          }
        });
        
        console.log('[Unified Service] Aesthetic companies fetched via MCP:', result?.data?.length || 0);
        return result?.data || [];
      } catch (mcpError) {
        console.warn('[Unified Service] MCP fetch failed, falling back to direct API:', mcpError);
      }
    }
    
    // Direct Supabase query as fallback or in production
    const { data, error } = await supabaseClient
      .from('v_aesthetic_companies')
      .select('*')
      .order('name', { ascending: true });
      
    if (error) throw error;
    
    console.log('[Unified Service] Aesthetic companies fetched via direct API:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('[Unified Service] Error fetching aesthetic companies:', error);
    return [];
  }
}

/**
 * Get market growth data from the Supabase database
 * @param {string} industry - The industry to get data for ('dental' or 'aesthetic')
 * @returns {Promise<Array>} Array of market growth data points
 */
export async function getMarketGrowthData(industry = 'dental') {
  console.log(`[Unified Service] Fetching ${industry} market growth data`);
  try {
    const table = industry === 'aesthetic' ? 'v_aesthetic_market_growth' : 'v_dental_market_growth';
    
    // Try to use MCP in development
    if (!isProduction && typeof window !== 'undefined' && window.use_mcp_tool) {
      try {
        const result = await window.use_mcp_tool({
          server_name: 'supabase',
          tool_name: 'execute_sql',
          arguments: {
            project_id: process.env.VITE_SUPABASE_PROJECT_ID || 'cbopynuvhcymbumjnvay',
            query: `SELECT * FROM ${table} ORDER BY year ASC`
          }
        });
        
        console.log(`[Unified Service] ${industry} market growth data fetched via MCP:`, result?.data?.length || 0);
        return result?.data || [];
      } catch (mcpError) {
        console.warn('[Unified Service] MCP fetch failed, falling back to direct API:', mcpError);
      }
    }
    
    // Direct Supabase query as fallback or in production
    const { data, error } = await supabaseClient
      .from(table)
      .select('*')
      .order('year', { ascending: true });
      
    if (error) throw error;
    
    console.log(`[Unified Service] ${industry} market growth data fetched via direct API:`, data?.length || 0);
    return data || [];
  } catch (error) {
    console.error(`[Unified Service] Error fetching ${industry} market growth data:`, error);
    return [];
  }
}

/**
 * Get news articles from the Supabase database
 * @param {string} industry - The industry to get news for ('dental' or 'aesthetic')
 * @returns {Promise<Array>} Array of news articles
 */
export async function getNewsArticles(industry = 'dental') {
  console.log(`[Unified Service] Fetching ${industry} news articles`);
  try {
    const table = industry === 'aesthetic' ? 'v_aesthetic_news' : 'v_dental_news';
    
    // Try to use MCP in development
    if (!isProduction && typeof window !== 'undefined' && window.use_mcp_tool) {
      try {
        const result = await window.use_mcp_tool({
          server_name: 'supabase',
          tool_name: 'execute_sql',
          arguments: {
            project_id: process.env.VITE_SUPABASE_PROJECT_ID || 'cbopynuvhcymbumjnvay',
            query: `SELECT * FROM ${table} ORDER BY published_date DESC LIMIT 10`
          }
        });
        
        console.log(`[Unified Service] ${industry} news articles fetched via MCP:`, result?.data?.length || 0);
        return result?.data || [];
      } catch (mcpError) {
        console.warn('[Unified Service] MCP fetch failed, falling back to direct API:', mcpError);
      }
    }
    
    // Direct Supabase query as fallback or in production
    const { data, error } = await supabaseClient
      .from(table)
      .select('*')
      .order('published_date', { ascending: false })
      .limit(10);
      
    if (error) throw error;
    
    console.log(`[Unified Service] ${industry} news articles fetched via direct API:`, data?.length || 0);
    return data || [];
  } catch (error) {
    console.error(`[Unified Service] Error fetching ${industry} news articles:`, error);
    return [];
  }
}

/**
 * Get upcoming events from the Supabase database
 * @param {string} industry - The industry to get events for ('dental' or 'aesthetic')
 * @returns {Promise<Array>} Array of upcoming events
 */
export async function getUpcomingEvents(industry = 'dental') {
  console.log(`[Unified Service] Fetching ${industry} upcoming events`);
  try {
    const table = industry === 'aesthetic' ? 'v_aesthetic_events' : 'v_dental_events';
    
    // Try to use MCP in development
    if (!isProduction && typeof window !== 'undefined' && window.use_mcp_tool) {
      try {
        const result = await window.use_mcp_tool({
          server_name: 'supabase',
          tool_name: 'execute_sql',
          arguments: {
            project_id: process.env.VITE_SUPABASE_PROJECT_ID || 'cbopynuvhcymbumjnvay',
            query: `SELECT * FROM ${table} WHERE event_date_start >= CURRENT_DATE ORDER BY event_date_start ASC LIMIT 10`
          }
        });
        
        console.log(`[Unified Service] ${industry} upcoming events fetched via MCP:`, result?.data?.length || 0);
        return result?.data || [];
      } catch (mcpError) {
        console.warn('[Unified Service] MCP fetch failed, falling back to direct API:', mcpError);
      }
    }
    
    // Direct Supabase query as fallback or in production
    const { data, error } = await supabaseClient
      .from(table)
      .select('*')
      .gte('event_date_start', new Date().toISOString().split('T')[0])
      .order('event_date_start', { ascending: true })
      .limit(10);
      
    if (error) throw error;
    
    console.log(`[Unified Service] ${industry} upcoming events fetched via direct API:`, data?.length || 0);
    return data || [];
  } catch (error) {
    console.error(`[Unified Service] Error fetching ${industry} upcoming events:`, error);
    return [];
  }
}

/**
 * Get trending topics from the Supabase database
 * @param {string} industry - The industry to get trending topics for ('dental' or 'aesthetic')
 * @returns {Promise<Array>} Array of trending topics
 */
export async function getTrendingTopics(industry = 'dental') {
  console.log(`[Unified Service] Fetching ${industry} trending topics`);
  try {
    const table = industry === 'aesthetic' ? 'v_aesthetic_trends' : 'v_dental_trends';
    
    // Try to use MCP in development
    if (!isProduction && typeof window !== 'undefined' && window.use_mcp_tool) {
      try {
        const result = await window.use_mcp_tool({
          server_name: 'supabase',
          tool_name: 'execute_sql',
          arguments: {
            project_id: process.env.VITE_SUPABASE_PROJECT_ID || 'cbopynuvhcymbumjnvay',
            query: `SELECT * FROM ${table} ORDER BY relevance_score DESC LIMIT 6`
          }
        });
        
        console.log(`[Unified Service] ${industry} trending topics fetched via MCP:`, result?.data?.length || 0);
        return result?.data || [];
      } catch (mcpError) {
        console.warn('[Unified Service] MCP fetch failed, falling back to direct API:', mcpError);
      }
    }
    
    // Direct Supabase query as fallback or in production
    const { data, error } = await supabaseClient
      .from(table)
      .select('*')
      .order('relevance_score', { ascending: false })
      .limit(6);
      
    if (error) throw error;
    
    console.log(`[Unified Service] ${industry} trending topics fetched via direct API:`, data?.length || 0);
    return data || [];
  } catch (error) {
    console.error(`[Unified Service] Error fetching ${industry} trending topics:`, error);
    return [];
  }
}
