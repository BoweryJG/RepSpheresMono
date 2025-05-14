# API Gateway Connection Solution

This document outlines the solution for handling connections between Netlify frontend applications and Render backend services in the RepSpheres monorepo.

## Problem Statement

The Market Insights application, deployed on Netlify, has been experiencing intermittent connection issues when communicating with backend services hosted on Render. These issues include:

1. Connection timeouts during periods of high traffic
2. Failed requests when the Render service "spins up" from sleep mode
3. Inconsistent error handling across different API endpoints
4. Lack of retry mechanisms for transient failures
5. No standardized approach to caching frequently accessed data

## Solution Architecture

The API Gateway package provides a robust solution to these issues by implementing:

1. A unified client for all API requests
2. Intelligent retry mechanisms with exponential backoff
3. Connection status monitoring
4. Request caching
5. Standardized error handling

### High-Level Architecture

```
┌─────────────────┐     ┌───────────────────┐     ┌─────────────────┐
│                 │     │                   │     │                 │
│  Netlify Apps   │ ──► │   API Gateway    │ ──► │  Render Backend │
│  (Frontend)     │     │   (Middleware)    │     │  (Services)     │
│                 │     │                   │     │                 │
└─────────────────┘     └───────────────────┘     └─────────────────┘
```

## Implementation Details

### 1. API Client Creation

The API Gateway package provides a factory function to create API clients with built-in resilience features:

```typescript
import { createApiClient } from '@repo/api-gateway';

const apiClient = createApiClient({
  baseURL: 'https://your-render-service.onrender.com',
  timeout: 10000,
  retries: 3,
  retryDelay: 1000,
  cacheEnabled: true,
  cacheTTL: 300000 // 5 minutes
});
```

### 2. Retry Mechanism

The API Gateway implements an intelligent retry strategy:

- **Exponential Backoff**: Increasing delay between retry attempts
- **Retry Conditions**: Only retry on network errors, timeouts, and 5xx responses
- **Maximum Retries**: Configurable maximum retry attempts
- **Retry Delay**: Configurable base delay with exponential increase

```typescript
// Example of retry configuration
const apiClient = createApiClient({
  baseURL: 'https://your-render-service.onrender.com',
  retries: 3,
  retryDelay: 1000, // Base delay in ms
  retryCondition: (error) => {
    // Custom retry condition
    return error.isNetworkError || error.response?.status >= 500;
  }
});
```

### 3. Connection Status Monitoring

The API Gateway provides real-time connection status monitoring:

```typescript
import { createApiClient, ConnectionStatus } from '@repo/api-gateway';

const apiClient = createApiClient({
  baseURL: 'https://your-render-service.onrender.com',
  onStatusChange: (status: ConnectionStatus) => {
    console.log(`Connection status changed to: ${status}`);
    // Update UI or take appropriate action
  }
});
```

Connection statuses include:
- `CONNECTED`: Successfully connected to the backend
- `CONNECTING`: Attempting to connect to the backend
- `DISCONNECTED`: Not connected to the backend
- `RECONNECTING`: Attempting to reconnect after a failure

### 4. Request Caching

The API Gateway implements a configurable caching mechanism to reduce load on backend services:

```typescript
const apiClient = createApiClient({
  baseURL: 'https://your-render-service.onrender.com',
  cacheEnabled: true,
  cacheTTL: 300000, // 5 minutes in milliseconds
  cacheExclusions: ['/auth', '/user/profile'], // Endpoints to exclude from caching
  cacheKeyGenerator: (request) => {
    // Custom cache key generation
    return `${request.method}:${request.url}:${JSON.stringify(request.params)}`;
  }
});
```

### 5. Error Handling

Standardized error handling with detailed error information:

```typescript
try {
  const data = await apiClient.get('/market-data');
  // Process data
} catch (error) {
  if (error.isNetworkError) {
    // Handle network errors
    console.error('Network error:', error.message);
  } else if (error.isTimeoutError) {
    // Handle timeout errors
    console.error('Request timed out:', error.message);
  } else if (error.response) {
    // Handle API errors with response
    console.error(`API error ${error.response.status}:`, error.response.data);
  } else {
    // Handle other errors
    console.error('Unknown error:', error);
  }
}
```

## Usage Examples

### Basic Usage

```typescript
import { createApiClient } from '@repo/api-gateway';

// Create an API client
const apiClient = createApiClient({
  baseURL: 'https://market-insights-api.onrender.com',
  timeout: 10000,
  retries: 3
});

// Use the client
async function fetchMarketData(category) {
  try {
    const response = await apiClient.get('/market-data', {
      params: { category }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching market data:', error);
    throw error;
  }
}
```

### With TypeScript

```typescript
import { createApiClient } from '@repo/api-gateway';
import { MarketData, Category } from '../types';

// Create a typed API client
const apiClient = createApiClient<{
  getMarketData: (category: string) => Promise<MarketData[]>;
  getCategories: () => Promise<Category[]>;
}>({
  baseURL: 'https://market-insights-api.onrender.com',
  timeout: 10000,
  retries: 3
});

// Use the client with type safety
async function fetchMarketData(category: string): Promise<MarketData[]> {
  return apiClient.getMarketData(category);
}

async function fetchCategories(): Promise<Category[]> {
  return apiClient.getCategories();
}
```

### With React Hooks

```typescript
import { useEffect, useState } from 'react';
import { createApiClient } from '@repo/api-gateway';
import { MarketData } from '../types';

const apiClient = createApiClient({
  baseURL: 'https://market-insights-api.onrender.com',
  timeout: 10000,
  retries: 3
});

function useMarketData(category) {
  const [data, setData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/market-data', {
          params: { category }
        });
        setData(response.data);
        setError(null);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [category]);

  return { data, loading, error };
}
```

## Advanced Configuration

### Custom Middleware

You can add custom middleware to the API Gateway:

```typescript
import { createApiClient, createMiddleware } from '@repo/api-gateway';

// Create a custom middleware
const loggingMiddleware = createMiddleware({
  request: (config) => {
    console.log(`Request: ${config.method} ${config.url}`);
    return config;
  },
  response: (response) => {
    console.log(`Response: ${response.status} from ${response.config.url}`);
    return response;
  },
  error: (error) => {
    console.error(`Error: ${error.message}`);
    return Promise.reject(error);
  }
});

// Add the middleware to the client
const apiClient = createApiClient({
  baseURL: 'https://market-insights-api.onrender.com',
  middleware: [loggingMiddleware]
});
```

### Request Interceptors

Add custom request interceptors:

```typescript
const apiClient = createApiClient({
  baseURL: 'https://market-insights-api.onrender.com',
  requestInterceptors: [
    {
      onFulfilled: (config) => {
        // Add authentication token
        config.headers.Authorization = `Bearer ${getToken()}`;
        return config;
      },
      onRejected: (error) => {
        return Promise.reject(error);
      }
    }
  ]
});
```

### Response Interceptors

Add custom response interceptors:

```typescript
const apiClient = createApiClient({
  baseURL: 'https://market-insights-api.onrender.com',
  responseInterceptors: [
    {
      onFulfilled: (response) => {
        // Transform response data
        response.data = transformData(response.data);
        return response;
      },
      onRejected: (error) => {
        // Handle authentication errors
        if (error.response?.status === 401) {
          // Redirect to login
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    }
  ]
});
```

## Monitoring and Diagnostics

The API Gateway provides built-in monitoring and diagnostics capabilities:

### Connection Monitoring

```typescript
import { createApiClient, ConnectionStatus } from '@repo/api-gateway';

const apiClient = createApiClient({
  baseURL: 'https://market-insights-api.onrender.com',
  onStatusChange: (status: ConnectionStatus) => {
    // Update UI based on connection status
    updateConnectionStatusIndicator(status);
  }
});

// Check connection status manually
const status = apiClient.getConnectionStatus();
```

### Request Metrics

```typescript
import { createApiClient } from '@repo/api-gateway';

const apiClient = createApiClient({
  baseURL: 'https://market-insights-api.onrender.com',
  collectMetrics: true
});

// Get metrics
const metrics = apiClient.getMetrics();
console.log(`Total requests: ${metrics.totalRequests}`);
console.log(`Successful requests: ${metrics.successfulRequests}`);
console.log(`Failed requests: ${metrics.failedRequests}`);
console.log(`Average response time: ${metrics.averageResponseTime}ms`);
```

### Diagnostics Panel

The API Gateway package includes a React component for displaying connection diagnostics:

```tsx
import { DiagnosticsPanel } from '@repo/api-gateway/react';
import { createApiClient } from '@repo/api-gateway';

const apiClient = createApiClient({
  baseURL: 'https://market-insights-api.onrender.com'
});

function App() {
  return (
    <div>
      <h1>Market Insights</h1>
      {/* Only show in development */}
      {process.env.NODE_ENV === 'development' && (
        <DiagnosticsPanel apiClient={apiClient} />
      )}
      {/* Rest of your app */}
    </div>
  );
}
```

## Integration with Market Insights

To integrate the API Gateway with the Market Insights application:

1. Replace direct API calls with the API Gateway client
2. Add connection status monitoring to the UI
3. Configure retry mechanisms for Render backend connections
4. Implement caching for frequently accessed data

Example integration:

```typescript
// src/services/marketInsightsApiService.ts
import { createApiClient } from '@repo/api-gateway';
import { MarketData, Category, Company } from '../types';

// Create API client
export const apiClient = createApiClient({
  baseURL: process.env.RENDER_API_URL || 'https://market-insights-api.onrender.com',
  timeout: 15000,
  retries: 3,
  retryDelay: 1000,
  cacheEnabled: true,
  cacheTTL: 300000, // 5 minutes
  onStatusChange: (status) => {
    // Update global connection status
    window.dispatchEvent(new CustomEvent('api-connection-status', { detail: status }));
  }
});

// API methods
export const fetchMarketData = async (category: string): Promise<MarketData[]> => {
  const response = await apiClient.get('/market-data', { params: { category } });
  return response.data;
};

export const fetchCategories = async (): Promise<Category[]> => {
  const response = await apiClient.get('/categories');
  return response.data;
};

export const fetchCompanies = async (industry: string): Promise<Company[]> => {
  const response = await apiClient.get('/companies', { params: { industry } });
  return response.data;
};
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Connection Timeouts

**Issue**: API requests are timing out when connecting to Render backend.

**Solution**: Increase the timeout value and implement retry logic:

```typescript
const apiClient = createApiClient({
  baseURL: 'https://market-insights-api.onrender.com',
  timeout: 30000, // 30 seconds
  retries: 3,
  retryDelay: 2000 // 2 seconds
});
```

#### 2. Cold Start Delays

**Issue**: First request after Render service has been inactive fails due to "cold start" delay.

**Solution**: Implement retry logic with longer initial delay:

```typescript
const apiClient = createApiClient({
  baseURL: 'https://market-insights-api.onrender.com',
  retries: 5,
  retryDelay: 3000, // 3 seconds initial delay
  retryDelayFactor: 2 // Double the delay for each retry
});
```

#### 3. Caching Issues

**Issue**: Stale data being served from cache.

**Solution**: Adjust cache TTL or implement cache invalidation:

```typescript
const apiClient = createApiClient({
  baseURL: 'https://market-insights-api.onrender.com',
  cacheEnabled: true,
  cacheTTL: 60000, // 1 minute
  cacheInvalidation: {
    patterns: [
      { method: 'GET', url: '/market-data' }
    ],
    triggers: [
      { method: 'POST', url: '/market-data' },
      { method: 'PUT', url: '/market-data/*' },
      { method: 'DELETE', url: '/market-data/*' }
    ]
  }
});
```

#### 4. Authentication Issues

**Issue**: Authentication tokens not being sent or refreshed properly.

**Solution**: Implement an authentication interceptor:

```typescript
const apiClient = createApiClient({
  baseURL: 'https://market-insights-api.onrender.com',
  requestInterceptors: [
    {
      onFulfilled: (config) => {
        const token = getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      }
    }
  ],
  responseInterceptors: [
    {
      onRejected: async (error) => {
        if (error.response?.status === 401) {
          // Try to refresh token
          const newToken = await refreshToken();
          if (newToken) {
            // Retry the original request with new token
            error.config.headers.Authorization = `Bearer ${newToken}`;
            return apiClient.request(error.config);
          }
        }
        return Promise.reject(error);
      }
    }
  ]
});
```

## Conclusion

The API Gateway package provides a robust solution for handling connections between Netlify frontend applications and Render backend services. By implementing intelligent retry mechanisms, connection status monitoring, request caching, and standardized error handling, it addresses the connection issues experienced by the Market Insights application.

For more detailed information, refer to the API Gateway package documentation and examples.
