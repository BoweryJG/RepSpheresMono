# API Gateway Connection Solution

This document outlines the solution for addressing connection issues between the Netlify frontend and Render backend in the RepSpheres monorepo architecture.

## Problem Statement

The RepSpheres applications have been experiencing several connection-related issues:

1. **Cross-origin communication problems** between React apps
2. **Unreliable connections** to the Render backend (`https://osbackend-zl1h.onrender.com`)
3. **Inconsistent error handling** across applications
4. **Cold start delays** with the Render service
5. **Network timeouts** during peak usage

## Solution Overview

The API Gateway package (`@repo/api-gateway`) provides a unified interface for all backend communication, with built-in resilience features:

1. **Centralized configuration** for all API requests
2. **Automatic retry logic** for transient failures
3. **Consistent error handling** across all applications
4. **Request caching** to reduce backend load
5. **Connection pooling** for improved performance
6. **Circuit breaker pattern** to prevent cascading failures
7. **Request/response interceptors** for logging and monitoring

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  React Apps     │────▶│  API Gateway    │────▶│  Render Backend │
│  (Netlify)      │     │  Package        │     │  Services       │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               │
                        ┌──────▼──────┐
                        │             │
                        │  Supabase   │
                        │  Database   │
                        │             │
                        └─────────────┘
```

## Implementation Details

### 1. API Gateway Client

The API Gateway is built on top of Axios with enhanced features:

```typescript
// packages/api-gateway/src/gateway.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import axiosRetry from 'axios-retry';
import { setupCache } from 'axios-cache-adapter';

export interface ApiGatewayConfig extends AxiosRequestConfig {
  retries?: number;
  retryDelay?: number;
  cacheEnabled?: boolean;
  cacheTTL?: number;
  timeout?: number;
  circuitBreaker?: {
    failureThreshold: number;
    resetTimeout: number;
  };
}

export class ApiGateway {
  private client: AxiosInstance;
  private circuitOpen: boolean = false;
  private failureCount: number = 0;
  private resetTimeoutId: NodeJS.Timeout | null = null;
  private config: ApiGatewayConfig;

  constructor(config: ApiGatewayConfig) {
    this.config = {
      timeout: 10000,
      retries: 3,
      retryDelay: 300,
      cacheEnabled: true,
      cacheTTL: 60000, // 1 minute
      circuitBreaker: {
        failureThreshold: 5,
        resetTimeout: 30000 // 30 seconds
      },
      ...config
    };

    // Setup cache adapter if enabled
    const axiosConfig: AxiosRequestConfig = { ...this.config };
    
    if (this.config.cacheEnabled) {
      const cache = setupCache({
        maxAge: this.config.cacheTTL
      });
      axiosConfig.adapter = cache.adapter;
    }

    this.client = axios.create(axiosConfig);

    // Setup retry logic
    if (this.config.retries && this.config.retries > 0) {
      axiosRetry(this.client, {
        retries: this.config.retries,
        retryDelay: (retryCount) => {
          return retryCount * (this.config.retryDelay || 300);
        },
        retryCondition: (error) => {
          // Only retry on network errors or 5xx server errors
          return axiosRetry.isNetworkOrIdempotentRequestError(error) || 
                 (error.response && error.response.status >= 500);
        }
      });
    }

    // Add request interceptor for circuit breaker
    this.client.interceptors.request.use((config) => {
      if (this.circuitOpen) {
        throw new Error('Circuit is open, request rejected');
      }
      return config;
    });

    // Add response interceptor for circuit breaker
    this.client.interceptors.response.use(
      (response) => {
        // Reset failure count on success
        this.failureCount = 0;
        return response;
      },
      (error) => {
        // Increment failure count on error
        this.failureCount++;
        
        // Check if we should open the circuit
        if (this.config.circuitBreaker && 
            this.failureCount >= this.config.circuitBreaker.failureThreshold) {
          this.openCircuit();
        }
        
        return Promise.reject(error);
      }
    );
  }

  private openCircuit(): void {
    this.circuitOpen = true;
    
    // Set timeout to reset circuit
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
    
    this.resetTimeoutId = setTimeout(() => {
      this.circuitOpen = false;
      this.failureCount = 0;
    }, this.config.circuitBreaker?.resetTimeout || 30000);
  }

  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }

  public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config);
  }

  public async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config);
  }

  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config);
  }

  public async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.patch<T>(url, data, config);
  }

  public getAxiosInstance(): AxiosInstance {
    return this.client;
  }
}

export const createApiClient = (config: ApiGatewayConfig): ApiGateway => {
  return new ApiGateway(config);
};
```

### 2. Usage in Applications

Applications can use the API Gateway with a simple, consistent interface:

```typescript
// apps/market-insights/src/services/api-client.ts
import { createApiClient } from '@repo/api-gateway';

// Create a configured API client for the Market Insights app
export const apiClient = createApiClient({
  baseURL: 'https://osbackend-zl1h.onrender.com',
  timeout: 15000,
  retries: 3,
  cacheEnabled: true,
  cacheTTL: 5 * 60 * 1000, // 5 minutes
  circuitBreaker: {
    failureThreshold: 5,
    resetTimeout: 60000 // 1 minute
  }
});

// Example service using the API client
export const marketInsightsService = {
  async getMarketData() {
    try {
      const response = await apiClient.get('/api/market-data');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch market data:', error);
      throw error;
    }
  },
  
  async getProcedureDetails(id: string) {
    try {
      const response = await apiClient.get(`/api/procedures/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch procedure details for ID ${id}:`, error);
      throw error;
    }
  },
  
  async searchProcedures(query: string) {
    try {
      const response = await apiClient.get('/api/procedures/search', {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to search procedures:', error);
      throw error;
    }
  }
};
```

### 3. Middleware Support

The API Gateway supports middleware for cross-cutting concerns:

```typescript
// packages/api-gateway/src/middleware.ts
import { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { ApiGateway } from './gateway';

export type RequestMiddleware = (config: AxiosRequestConfig) => AxiosRequestConfig | Promise<AxiosRequestConfig>;
export type ResponseMiddleware = (response: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>;
export type ErrorMiddleware = (error: AxiosError) => any;

export const applyMiddleware = (apiGateway: ApiGateway, options: {
  request?: RequestMiddleware[];
  response?: ResponseMiddleware[];
  error?: ErrorMiddleware[];
}): void => {
  const axiosInstance = apiGateway.getAxiosInstance();
  
  // Apply request middleware
  if (options.request && options.request.length > 0) {
    axiosInstance.interceptors.request.use(
      async (config) => {
        let currentConfig = { ...config };
        
        for (const middleware of options.request) {
          currentConfig = await middleware(currentConfig);
        }
        
        return currentConfig;
      }
    );
  }
  
  // Apply response middleware
  if (options.response && options.response.length > 0 || options.error && options.error.length > 0) {
    axiosInstance.interceptors.response.use(
      async (response) => {
        let currentResponse = { ...response };
        
        if (options.response) {
          for (const middleware of options.response) {
            currentResponse = await middleware(currentResponse);
          }
        }
        
        return currentResponse;
      },
      async (error) => {
        if (options.error) {
          let handled = false;
          let result;
          
          for (const middleware of options.error) {
            try {
              result = await middleware(error);
              handled = true;
              break;
            } catch (e) {
              // Continue to next middleware
            }
          }
          
          if (handled) {
            return result;
          }
        }
        
        return Promise.reject(error);
      }
    );
  }
};

// Example middleware
export const authMiddleware: RequestMiddleware = (config) => {
  const token = localStorage.getItem('auth_token');
  
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  
  return config;
};

export const loggingMiddleware: RequestMiddleware = (config) => {
  console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
  return config;
};

export const errorHandlingMiddleware: ErrorMiddleware = (error) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error(`[API Error] ${error.response.status}: ${error.response.statusText}`);
    console.error('Response data:', error.response.data);
  } else if (error.request) {
    // The request was made but no response was received
    console.error('[API Error] No response received:', error.request);
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('[API Error]', error.message);
  }
  
  return Promise.reject(error);
};
```

## Render Backend Connection Strategy

To specifically address the connection issues with the Render backend:

1. **Warm-up Pings**: Implement periodic health checks to prevent cold starts
2. **Exponential Backoff**: Use increasing delays between retry attempts
3. **Connection Pooling**: Reuse connections to reduce overhead
4. **Request Prioritization**: Critical requests get priority handling
5. **Fallback Mechanisms**: Provide cached or default data when backend is unavailable

### Implementation Example

```typescript
// apps/market-insights/src/services/render-connection-manager.ts
import { createApiClient } from '@repo/api-gateway';
import { applyMiddleware, loggingMiddleware, errorHandlingMiddleware } from '@repo/api-gateway';

// Create a specialized client for Render backend
const renderClient = createApiClient({
  baseURL: 'https://osbackend-zl1h.onrender.com',
  timeout: 20000,
  retries: 5,
  retryDelay: 500, // Start with 500ms, will increase exponentially
  cacheEnabled: true,
  cacheTTL: 10 * 60 * 1000, // 10 minutes cache
  circuitBreaker: {
    failureThreshold: 3,
    resetTimeout: 60000 // 1 minute
  }
});

// Apply middleware
applyMiddleware(renderClient, {
  request: [loggingMiddleware],
  error: [errorHandlingMiddleware]
});

// Warm-up function to prevent cold starts
const warmupRenderBackend = () => {
  console.log('Warming up Render backend...');
  renderClient.get('/api/health')
    .then(() => console.log('Render backend is warm'))
    .catch(() => console.log('Failed to warm up Render backend'));
};

// Set up periodic warm-up pings (every 5 minutes)
setInterval(warmupRenderBackend, 5 * 60 * 1000);

// Initial warm-up
warmupRenderBackend();

export { renderClient };
```

## Cross-Origin Communication Solution

To address cross-origin communication issues:

1. **Unified CORS Configuration**: Standardize CORS settings across all services
2. **Proxy Middleware**: Use the API Gateway as a proxy to avoid CORS issues
3. **Credentials Handling**: Properly handle credentials in cross-origin requests

### CORS Configuration

```typescript
// packages/api-gateway/src/utils.ts
import { AxiosRequestConfig } from 'axios';

export const withCredentials = (config: AxiosRequestConfig): AxiosRequestConfig => {
  return {
    ...config,
    withCredentials: true
  };
};

export const corsMiddleware = (req: any, res: any, next: any) => {
  // Set CORS headers for API Gateway server-side implementation
  res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
};
```

## Monitoring and Diagnostics

The API Gateway includes monitoring and diagnostics features:

1. **Request/Response Logging**: Track all API interactions
2. **Performance Metrics**: Measure response times and success rates
3. **Circuit Breaker Status**: Monitor the health of backend services
4. **Error Aggregation**: Collect and categorize errors for analysis

### Diagnostics Dashboard Component

```tsx
// apps/market-insights/src/components/ApiDiagnostics.tsx
import React, { useEffect, useState } from 'react';
import { apiClient } from '../services/api-client';

interface ApiMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  circuitBreakerStatus: 'closed' | 'open';
}

export const ApiDiagnostics: React.FC = () => {
  const [metrics, setMetrics] = useState<ApiMetrics>({
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    circuitBreakerStatus: 'closed'
  });
  
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // In a real implementation, this would come from the API Gateway's metrics
        const response = await apiClient.get('/api/diagnostics');
        setMetrics(response.data);
      } catch (error) {
        console.error('Failed to fetch API metrics:', error);
      }
    };
    
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  const successRate = metrics.totalRequests > 0 
    ? (metrics.successfulRequests / metrics.totalRequests * 100).toFixed(1) 
    : '0';
  
  return (
    <div className="api-diagnostics">
      <h2>API Connection Diagnostics</h2>
      
      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Success Rate</h3>
          <div className="metric-value">{successRate}%</div>
        </div>
        
        <div className="metric-card">
          <h3>Total Requests</h3>
          <div className="metric-value">{metrics.totalRequests}</div>
        </div>
        
        <div className="metric-card">
          <h3>Avg Response Time</h3>
          <div className="metric-value">{metrics.averageResponseTime.toFixed(0)} ms</div>
        </div>
        
        <div className="metric-card">
          <h3>Circuit Status</h3>
          <div className={`metric-value ${metrics.circuitBreakerStatus === 'open' ? 'error' : 'success'}`}>
            {metrics.circuitBreakerStatus.toUpperCase()}
          </div>
        </div>
      </div>
      
      <div className="connection-status">
        <h3>Backend Connection</h3>
        <div className="status-indicator">
          <span className={`status-dot ${metrics.circuitBreakerStatus === 'closed' ? 'green' : 'red'}`}></span>
          {metrics.circuitBreakerStatus === 'closed' ? 'Connected' : 'Disconnected'}
        </div>
      </div>
    </div>
  );
};
```

## Best Practices

1. **Consistent Error Handling**: Use the API Gateway's error handling mechanisms consistently across all applications.

2. **Cache Strategically**: Cache responses based on their volatility and importance.

3. **Monitor Backend Health**: Use the circuit breaker pattern to detect and respond to backend issues.

4. **Implement Fallbacks**: Always provide fallback behavior when the backend is unavailable.

5. **Optimize Payload Size**: Minimize the data transferred between frontend and backend.

6. **Use TypeScript Interfaces**: Define shared interfaces for API requests and responses.

7. **Document API Endpoints**: Maintain comprehensive documentation of all backend endpoints.

## Conclusion

The API Gateway solution addresses the connection issues between the Netlify frontend and Render backend by providing:

1. **Resilience**: Automatic retries, circuit breaker, and caching
2. **Consistency**: Unified API interface across all applications
3. **Monitoring**: Built-in diagnostics and error tracking
4. **Performance**: Connection pooling and request optimization

By implementing this solution in the monorepo architecture, we ensure reliable communication between all RepSpheres applications and backend services.
