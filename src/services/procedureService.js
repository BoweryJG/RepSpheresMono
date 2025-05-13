// procedureService.js
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config';

// Get featured procedures
export async function getFeaturedProcedures(industry = null, limit = 10) {
  const url = new URL(`${SUPABASE_URL}/functions/v1/procedures-api`);
  url.searchParams.append('action', 'featured');
  if (industry) url.searchParams.append('param1', industry);
  url.searchParams.append('param2', limit.toString());
  
  const response = await fetch(url, {
    headers: {
      'apikey': SUPABASE_ANON_KEY
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch featured procedures');
  }
  
  return await response.json();
}

// Get procedures by category
export async function getProceduresByCategory(category) {
  const url = new URL(`${SUPABASE_URL}/functions/v1/procedures-api`);
  url.searchParams.append('action', 'category');
  url.searchParams.append('param1', category);
  
  const response = await fetch(url, {
    headers: {
      'apikey': SUPABASE_ANON_KEY
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch procedures by category');
  }
  
  return await response.json();
}

// Get procedures by industry
export async function getProceduresByIndustry(industry) {
  const url = new URL(`${SUPABASE_URL}/functions/v1/procedures-api`);
  url.searchParams.append('action', 'industry');
  url.searchParams.append('param1', industry);
  
  const response = await fetch(url, {
    headers: {
      'apikey': SUPABASE_ANON_KEY
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch procedures by industry');
  }
  
  return await response.json();
}

// Get trending procedures
export async function getTrendingProcedures(industry = null, limit = 10) {
  const url = new URL(`${SUPABASE_URL}/functions/v1/procedures-api`);
  url.searchParams.append('action', 'trending');
  if (industry) url.searchParams.append('param1', industry);
  url.searchParams.append('param2', limit.toString());
  
  const response = await fetch(url, {
    headers: {
      'apikey': SUPABASE_ANON_KEY
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch trending procedures');
  }
  
  return await response.json();
}

// Get all categories
export async function getAllCategories(industry = null) {
  const url = new URL(`${SUPABASE_URL}/functions/v1/procedures-api`);
  url.searchParams.append('action', 'categories');
  if (industry) url.searchParams.append('param1', industry);
  
  const response = await fetch(url, {
    headers: {
      'apikey': SUPABASE_ANON_KEY
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }
  
  return await response.json();
}

// Get procedure details
export async function getProcedureDetails(id) {
  const url = new URL(`${SUPABASE_URL}/functions/v1/procedures-api`);
  url.searchParams.append('action', 'detail');
  url.searchParams.append('param1', id.toString());
  
  const response = await fetch(url, {
    headers: {
      'apikey': SUPABASE_ANON_KEY
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch procedure details');
  }
  
  return await response.json();
}

// Advanced search for procedures
export async function searchProcedures(query, filters = {}) {
  const url = new URL(`${SUPABASE_URL}/functions/v1/procedures-search`);
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query,
      filters
    })
  });
  
  if (!response.ok) {
    throw new Error('Failed to search procedures');
  }
  
  return await response.json();
}
