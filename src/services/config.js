// config.js
export const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://cbopynuvhcymbumjnvay.supabase.co';
export const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNib3B5bnV2aGN5bWJ1bWpudmF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5OTUxNzMsImV4cCI6MjA1OTU3MTE3M30.UZElMkoHugIt984RtYWyfrRuv2rB67opQdCrFVPCfzU';

// Backend API configuration
export const API_CONFIG = {
  BASE_URL: 'https://osbackend-zl1h.onrender.com',
  MARKET_INSIGHTS_ENDPOINT: '/api/data/market_insights',
  MODULE_ACCESS_ENDPOINT: '/api/modules/access',
  TIMEOUT: 30000 // 30 seconds
};
