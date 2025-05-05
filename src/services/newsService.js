/**
 * News Service
 * 
 * This service provides news data related to the dental and aesthetic industries.
 * It fetches news articles from various sources and provides filtering capabilities.
 */

import { supabaseClient } from './supabase/supabaseClient';

/**
 * Fetch news articles for the specified industry
 * @param {string} industry - 'dental' or 'aesthetic'
 * @param {Object} options - Options for filtering news
 * @param {number} options.limit - Maximum number of articles to return (default: 10)
 * @param {number} options.offset - Number of articles to skip (default: 0)
 * @param {string} options.category - Category to filter by (optional)
 * @param {string} options.source - Source to filter by (optional)
 * @param {string} options.searchTerm - Term to search for in title or content (optional)
 * @returns {Promise<Array>} - Array of news article objects
 */
export const getNewsArticles = async (industry, options = {}) => {
  const { 
    limit = 10, 
    offset = 0, 
    category = null, 
    source = null,
    searchTerm = null
  } = options;

  try {
    let query = supabaseClient
      .from('news_articles')
      .select('*')
      .eq('industry', industry)
      .order('published_date', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (category) {
      query = query.eq('category', category);
    }
    
    if (source) {
      query = query.eq('source', source);
    }
    
    if (searchTerm) {
      query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching news articles:', error);
    return [];
  }
};

/**
 * Fetch news categories for the specified industry
 * @param {string} industry - 'dental' or 'aesthetic'
 * @returns {Promise<Array>} - Array of category objects
 */
export const getNewsCategories = async (industry) => {
  try {
    const { data, error } = await supabaseClient
      .from('news_categories')
      .select('*')
      .eq('industry', industry);
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching news categories:', error);
    return [];
  }
};

/**
 * Fetch news sources for the specified industry
 * @param {string} industry - 'dental' or 'aesthetic'
 * @returns {Promise<Array>} - Array of source objects
 */
export const getNewsSources = async (industry) => {
  try {
    const { data, error } = await supabaseClient
      .from('news_sources')
      .select('*')
      .eq('industry', industry);
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching news sources:', error);
    return [];
  }
};

/**
 * Fetch featured news articles for the specified industry
 * @param {string} industry - 'dental' or 'aesthetic'
 * @param {number} limit - Maximum number of articles to return (default: 3)
 * @returns {Promise<Array>} - Array of featured news article objects
 */
export const getFeaturedNewsArticles = async (industry, limit = 3) => {
  try {
    const { data, error } = await supabaseClient
      .from('news_articles')
      .select('*')
      .eq('industry', industry)
      .eq('featured', true)
      .order('published_date', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching featured news articles:', error);
    return [];
  }
};

/**
 * Fetch trending topics for the specified industry
 * @param {string} industry - 'dental' or 'aesthetic'
 * @param {number} limit - Maximum number of topics to return (default: 5)
 * @returns {Promise<Array>} - Array of trending topic objects
 */
export const getTrendingTopics = async (industry, limit = 5) => {
  try {
    const { data, error } = await supabaseClient
      .from('trending_topics')
      .select('*')
      .eq('industry', industry)
      .order('popularity', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching trending topics:', error);
    return [];
  }
};

/**
 * Fetch upcoming industry events
 * @param {string} industry - 'dental' or 'aesthetic'
 * @param {number} limit - Maximum number of events to return (default: 5)
 * @returns {Promise<Array>} - Array of event objects
 */
export const getUpcomingEvents = async (industry, limit = 5) => {
  const today = new Date().toISOString().split('T')[0];
  
  try {
    const { data, error } = await supabaseClient
      .from('industry_events')
      .select('*')
      .eq('industry', industry)
      .gte('start_date', today)
      .order('start_date', { ascending: true })
      .limit(limit);
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    return [];
  }
};
