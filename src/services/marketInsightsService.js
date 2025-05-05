/**
 * Market Insights Service
 * 
 * This service provides market data and insights for the dental and aesthetic industries.
 * It fetches data from various sources including news APIs, industry reports, and market analysis.
 */

import { supabaseClient } from './supabase/supabaseClient';

/**
 * Fetch market trends data for the specified industry
 * @param {string} industry - 'dental' or 'aesthetic'
 * @returns {Promise<Array>} - Array of market trend objects
 */
export const getMarketTrends = async (industry) => {
  try {
    const { data, error } = await supabaseClient
      .from('market_trends')
      .select('*')
      .eq('industry', industry)
      .order('importance', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching market trends:', error);
    return [];
  }
};

/**
 * Fetch market size data for the specified industry
 * @param {string} industry - 'dental' or 'aesthetic'
 * @returns {Promise<Object>} - Market size data object
 */
export const getMarketSize = async (industry) => {
  try {
    const { data, error } = await supabaseClient
      .from('market_size')
      .select('*')
      .eq('industry', industry)
      .single();
      
    if (error) throw error;
    return data || null;
  } catch (error) {
    console.error('Error fetching market size:', error);
    return null;
  }
};

/**
 * Fetch key demographic data for the specified industry
 * @param {string} industry - 'dental' or 'aesthetic'
 * @returns {Promise<Object>} - Key demographic data object
 */
export const getKeyDemographics = async (industry) => {
  try {
    const { data, error } = await supabaseClient
      .from('demographics')
      .select('*')
      .eq('industry', industry)
      .single();
      
    if (error) throw error;
    return data || null;
  } catch (error) {
    console.error('Error fetching key demographics:', error);
    return null;
  }
};

/**
 * Fetch industry innovations and emerging technologies
 * @param {string} industry - 'dental' or 'aesthetic'
 * @returns {Promise<Array>} - Array of innovation objects
 */
export const getIndustryInnovations = async (industry) => {
  try {
    const { data, error } = await supabaseClient
      .from('innovations')
      .select('*')
      .eq('industry', industry)
      .order('impact_score', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching industry innovations:', error);
    return [];
  }
};

/**
 * Fetch regulatory updates for the specified industry
 * @param {string} industry - 'dental' or 'aesthetic'
 * @returns {Promise<Array>} - Array of regulatory update objects
 */
export const getRegulatoryUpdates = async (industry) => {
  try {
    const { data, error } = await supabaseClient
      .from('regulatory_updates')
      .select('*')
      .eq('industry', industry)
      .order('published_date', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching regulatory updates:', error);
    return [];
  }
};

/**
 * Fetch consumer trend data for the specified industry
 * @param {string} industry - 'dental' or 'aesthetic'
 * @returns {Promise<Array>} - Array of consumer trend objects
 */
export const getConsumerTrends = async (industry) => {
  try {
    const { data, error } = await supabaseClient
      .from('consumer_trends')
      .select('*')
      .eq('industry', industry)
      .order('trend_strength', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching consumer trends:', error);
    return [];
  }
};

/**
 * Fetch industry forecast data
 * @param {string} industry - 'dental' or 'aesthetic'
 * @returns {Promise<Object>} - Industry forecast data object
 */
export const getIndustryForecast = async (industry) => {
  try {
    const { data, error } = await supabaseClient
      .from('industry_forecasts')
      .select('*')
      .eq('industry', industry)
      .single();
      
    if (error) throw error;
    return data || null;
  } catch (error) {
    console.error('Error fetching industry forecast:', error);
    return null;
  }
};

/**
 * Fetch all market insights data for the specified industry
 * @param {string} industry - 'dental' or 'aesthetic'
 * @returns {Promise<Object>} - Comprehensive market insights object
 */
export const getAllMarketInsights = async (industry) => {
  const [
    marketSize,
    marketTrends,
    keyDemographics,
    industryInnovations,
    regulatoryUpdates,
    consumerTrends,
    industryForecast
  ] = await Promise.all([
    getMarketSize(industry),
    getMarketTrends(industry),
    getKeyDemographics(industry),
    getIndustryInnovations(industry),
    getRegulatoryUpdates(industry),
    getConsumerTrends(industry),
    getIndustryForecast(industry)
  ]);

  return {
    industry,
    marketSize,
    marketTrends,
    keyDemographics,
    industryInnovations,
    regulatoryUpdates,
    consumerTrends,
    industryForecast,
    lastUpdated: new Date().toISOString()
  };
};
