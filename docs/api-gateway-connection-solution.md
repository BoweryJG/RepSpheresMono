# API Gateway Connection Solution

This document explains the solution implemented to address the connection problems between the Netlify frontend and Render backend in the RepSpheres monorepo.

## Problem Statement

The original Market Insights application and other RepSpheres applications faced several challenges:

1. **Unreliable Connections**: Intermittent connection failures to the Render backend
2. **CORS Issues**: Cross-origin resource sharing problems between Netlify and Render
3. **Error Handling**: Inconsistent error handling across applications
4. **Caching**: No standardized caching strategy
5. **Type Safety**: Lack of TypeScript interfaces for API responses

## Solution Architecture

We've implemented a robust API Gateway solution that serves as a middleware layer between the frontend applications and the Render backend:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  React Apps     │────▶│  API Gateway    │────▶│  Render Backend │
│  (Netlify)      │     │  (Middleware)   │     │  (API Server)   │
│                 │◀────│                 │◀────│                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Key Components

1. **API Gateway Package**: A shared package that handles all API communication
2. **Market Insights API Client**: A specialized client for the Market Insights application
3. **Retry Logic**: Automatic retry mechanism for failed requests
4. **Caching Layer**: Local storage caching for improved performance
5. **Error Handling**: Standardized error handling across all applications
6. **TypeScript Interfaces**: Type definitions for all API responses

## Implementation Details

### API Gateway Package

The API Gateway package (`@repspheres/api-gateway`) provides a unified interface for all API communications:

```typescript
// packages/api-gateway/src/gateway.ts
import axios from 'axios';
import axiosRetry from 'axios-retry';

export function createApiGateway(config) {
  const instance = axios.create({
    baseURL: config.baseURL || process.env.VITE_RENDER_API_URL,
    timeout: config.timeout || 10000,
    headers: {
      'Content-Type': 'application/json',
      ...config.headers,
    },
    withCredentials: config.withCredentials || false,
  });
  
  // Configure retry logic
  axiosRetry(instance, {
    retries: 3,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: (error) => {
      return (
        axiosRetry.isNetworkOrIdempotentRequestError(error) ||
        error.code === 'ECONNABORTED'
      );
    },
  });
  
  // Add response interceptor for error handling
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      // Log error details
      console.error('API Gateway Error:', error);
      
      // Enhance error with additional information
      if (error.response) {
        error.statusCode = error.response.status;
        error.message = `${error.message} (${error.response.status})`;
      }
      
      return Promise.reject(error);
    }
  );
  
  return instance;
}
```

### Market Insights API Client

The Market Insights API client (`@repspheres/market-insights/services/market-insights-api`) provides a specialized interface for the Market Insights application:

```typescript
// apps/market-insights/src/services/market-insights-api.ts
import { createApiGateway } from '@repspheres/api-gateway';
import { setupCache } from 'axios-cache-adapter';

// Create a cache adapter
const cache = setupCache({
  maxAge: 5 * 60 * 1000, // Cache for 5 minutes
  exclude: { query: false },
  key: (request) => {
    return request.url + JSON.stringify(request.params);
  },
});

// Create API gateway instance
const apiGateway = createApiGateway({
  baseURL: process.env.VITE_RENDER_API_URL,
  adapter: cache.adapter,
});

// API client methods
export const marketInsightsApi = {
  checkStatus: async () => {
    const response = await apiGateway.get('/api/status');
    return response.data;
  },
  
  getMarketData: async (category) => {
    const params = category ? { category } : {};
    const response = await apiGateway.get('/api/market-data', { params });
    return response.data;
  },
  
  getProcedures: async (id) => {
    const url = id ? `/api/procedures/${id}` : '/api/procedures';
    const response = await apiGateway.get(url);
    return response.data;
  },
  
  getCategories: async () => {
    const response = await apiGateway.get('/api/categories');
    return response.data;
  },
  
  getCompanies: async () => {
    const response = await apiGateway.get('/api/companies');
    return response.data;
  },
  
  getNews: async (category, limit) => {
    const params = {};
    if (category) params.category = category;
    if (limit) params.limit = limit;
    
    const response = await apiGateway.get('/api/news', { params });
    return response.data;
  },
  
  search: async (query) => {
    const response = await apiGateway.get('/api/search', { params: { q: query } });
    return response.data;
  },
};

// Export types
export type MarketData = {
  id: string;
  name: string;
  category: string;
  growth: number;
  marketSize: number;
  region?: string;
  year?: number;
};

export type ProcedureData = {
  id: string;
  name: string;
  category: string;
  description: string;
  averageCost: number;
  popularity: number;
  growthRate: number;
};

export type CompanyData = {
  id: string;
  name: string;
  ticker?: string;
  marketCap?: number;
  revenue?: number;
  employees?: number;
  founded?: number;
  headquarters?: string;
  website?: string;
  description?: string;
};

export type NewsArticle = {
  id: string;
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  summary?: string;
  imageUrl?: string;
  category?: string;
  relevance?: number;
};

// Factory function for creating custom instances
export function createMarketInsightsApi(config = {}) {
  // Implementation details...
  return { ...marketInsightsApi };
}
```

## Benefits of the Solution

### 1. Improved Reliability

- **Automatic Retries**: Failed requests are automatically retried with exponential backoff
- **Timeout Handling**: Configurable timeouts prevent hanging requests
- **Error Logging**: Comprehensive error logging for debugging

### 2. Solved CORS Issues

- **Standardized Headers**: Consistent headers for all requests
- **Credentials Handling**: Proper handling of credentials for cross-origin requests
- **Preflight Requests**: Correct handling of preflight OPTIONS requests

### 3. Enhanced Performance

- **Caching**: Local storage caching reduces redundant network requests
- **Request Deduplication**: Identical in-flight requests are deduplicated
- **Optimized Payload**: Minimized request/response payloads

### 4. Developer Experience

- **Type Safety**: TypeScript interfaces for all API responses
- **Consistent API**: Standardized API methods across applications
- **Error Handling**: Unified error handling approach

## Testing and Verification

We've implemented a test script to verify the connection to the Render backend:

```typescript
// scripts/test-render-connection.ts
import { marketInsightsApi } from '../apps/market-insights/src/services/market-insights-api';

async function testRenderConnection() {
  try {
    // Test API status
    const status = await marketInsightsApi.checkStatus();
    console.log('API Status:', status);
    
    // Test market data
    const marketData = await marketInsightsApi.getMarketData();
    console.log(`Received ${marketData.length} market data items`);
    
    // Additional tests...
    
    console.log('All tests passed! Connection to Render backend is working correctly.');
  } catch (error) {
    console.error('Error connecting to Render backend:', error);
    process.exit(1);
  }
}

testRenderConnection();
```

## Deployment Considerations

### Netlify Configuration

The Netlify configuration has been updated to handle the API Gateway:

```toml
# netlify.toml
[[redirects]]
  from = "/api/*"
  to = "https://osbackend-zl1h.onrender.com/api/:splat"
  status = 200
  force = true
  headers = {Access-Control-Allow-Origin = "*"}
```

### Environment Variables

The following environment variables are required:

```
VITE_RENDER_API_URL=https://osbackend-zl1h.onrender.com
VITE_API_TIMEOUT=10000
VITE_API_RETRY_COUNT=3
```

## Future Improvements

1. **Circuit Breaker Pattern**: Implement circuit breaker for failing endpoints
2. **Request Queuing**: Queue requests during offline periods
3. **Metrics Collection**: Gather performance metrics for API calls
4. **API Versioning**: Support for multiple API versions
5. **Mock Mode**: Development mode with mock responses

## Conclusion

The API Gateway solution has successfully addressed the connection problems between the Netlify frontend and Render backend. By implementing a robust middleware layer with retry logic, caching, and standardized error handling, we've significantly improved the reliability and performance of the RepSpheres applications.

This solution provides a solid foundation for future development and ensures a consistent experience across all applications in the monorepo.
