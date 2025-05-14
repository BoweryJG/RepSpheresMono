import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { CacheConfig, CacheItem, RetryConfig } from './types';

/**
 * Response cache implementation
 */
export class ResponseCache {
  private cache: Map<string, CacheItem>;
  private config: CacheConfig;

  constructor(config: CacheConfig) {
    this.cache = new Map<string, CacheItem>();
    this.config = config;
  }

  /**
   * Generate a cache key from request config
   * @param config Request config
   * @returns Cache key
   */
  private generateCacheKey(config: AxiosRequestConfig): string {
    const { url = '', method, params, data } = config;
    return JSON.stringify({
      url,
      method: method?.toLowerCase() || 'get',
      params: params ? JSON.stringify(params) : undefined,
      data: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * Check if a response is cacheable
   * @param config Request config
   * @returns Whether the response is cacheable
   */
  private isCacheable(config: AxiosRequestConfig): boolean {
    if (!this.config.enabled) {
      return false;
    }

    const method = config.method?.toUpperCase() || 'GET';
    
    // Only cache GET requests by default
    if (method !== 'GET' && !this.config.cacheNonGetRequests) {
      return false;
    }

    return true;
  }

  /**
   * Get a cached response
   * @param config Request config
   * @returns Cached response or undefined
   */
  get(config: AxiosRequestConfig): AxiosResponse | undefined {
    if (!this.isCacheable(config)) {
      return undefined;
    }

    const key = this.generateCacheKey(config);
    const item = this.cache.get(key);

    if (!item) {
      return undefined;
    }

    // Check if the item is expired
    const now = Date.now();
    if (now - item.timestamp > this.config.ttl) {
      this.cache.delete(key);
      return undefined;
    }

    return item.response;
  }

  /**
   * Set a response in the cache
   * @param config Request config
   * @param response Response to cache
   */
  set(config: AxiosRequestConfig, response: AxiosResponse): void {
    if (!this.isCacheable(config)) {
      return;
    }

    const key = this.generateCacheKey(config);
    
    // Store the response in the cache
    this.cache.set(key, {
      response,
      timestamp: Date.now(),
    });

    // Enforce cache size limit
    if (this.config.maxSize && this.cache.size > this.config.maxSize) {
      // Remove the oldest entry
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Clear the cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Update the cache configuration
   * @param config New cache configuration
   */
  updateConfig(config: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...config };
    
    // If cache is disabled, clear it
    if (!this.config.enabled) {
      this.clear();
    }
  }
}

/**
 * Calculate exponential backoff delay
 * @param retryCount Current retry count
 * @param config Retry configuration
 * @returns Delay in milliseconds
 */
export function createExponentialBackoff(retryCount: number, config: RetryConfig): number {
  if (!config.exponentialBackoff) {
    return config.retryDelay;
  }

  // Calculate exponential backoff with jitter
  const delay = Math.min(
    config.retryDelay * Math.pow(2, retryCount),
    config.maxRetryDelay || 30000
  );
  
  // Add jitter to prevent thundering herd problem
  const jitter = delay * 0.2 * Math.random();
  
  return delay + jitter;
}

/**
 * Check if a request should be retried
 * @param statusCode HTTP status code
 * @param config Retry configuration
 * @returns Whether the request should be retried
 */
export function shouldRetry(statusCode: number | undefined, config: RetryConfig): boolean {
  // Retry on network errors
  if (!statusCode && config.retryNetworkErrors) {
    return true;
  }

  // Retry on specific status codes
  if (statusCode && config.retryStatusCodes.includes(statusCode)) {
    return true;
  }

  return false;
}

/**
 * Create a connection monitor
 * @returns Connection monitor object
 */
export function createConnectionMonitor() {
  let lastSuccessTime = 0;
  let failedRequestCount = 0;
  let consecutiveFailures = 0;
  
  return {
    /**
     * Record a successful connection
     */
    recordSuccess: () => {
      lastSuccessTime = Date.now();
      consecutiveFailures = 0;
    },
    
    /**
     * Record a failed connection
     */
    recordFailure: () => {
      failedRequestCount++;
      consecutiveFailures++;
    },
    
    /**
     * Check if the connection is online
     * @returns Whether the connection is online
     */
    isOnline: () => {
      // Consider offline if no successful connection in the last 30 seconds
      // and at least 2 consecutive failures
      const offlineThreshold = 30000; // 30 seconds
      const timeSinceLastSuccess = Date.now() - lastSuccessTime;
      
      return !(timeSinceLastSuccess > offlineThreshold && consecutiveFailures >= 2);
    },
    
    /**
     * Get time since last successful connection
     * @returns Time in milliseconds
     */
    getTimeSinceLastSuccess: () => {
      return lastSuccessTime ? Date.now() - lastSuccessTime : 0;
    },
    
    /**
     * Get failed request count
     * @returns Number of failed requests
     */
    getFailedRequestCount: () => {
      return failedRequestCount;
    },
    
    /**
     * Get consecutive failures count
     * @returns Number of consecutive failures
     */
    getConsecutiveFailures: () => {
      return consecutiveFailures;
    },
    
    /**
     * Reset the monitor
     */
    reset: () => {
      lastSuccessTime = 0;
      failedRequestCount = 0;
      consecutiveFailures = 0;
    }
  };
}

/**
 * Create diagnostics tracker
 * @returns Diagnostics object
 */
export function createDiagnostics() {
  const requests: Record<string, {
    count: number;
    errors: number;
    lastError?: any;
    lastRequestTime?: number;
    avgResponseTime?: number;
  }> = {};
  
  return {
    /**
     * Record a request
     * @param url Request URL
     * @param config Request config
     */
    recordRequest: (url: string | undefined, config: AxiosRequestConfig) => {
      if (!url) {
        url = 'unknown-endpoint';
      }
      const endpoint = typeof url === 'string' ? url.split('?')[0] : 'unknown-endpoint'; // Remove query params
      
      if (!requests[endpoint]) {
        requests[endpoint] = {
          count: 0,
          errors: 0,
        };
      }
      
      requests[endpoint].count++;
      requests[endpoint].lastRequestTime = Date.now();
    },
    
    /**
     * Record an error
     * @param url Request URL
     * @param error Error object
     */
    recordError: (url: string | undefined, error: any) => {
      if (!url) {
        url = 'unknown-endpoint';
      }
      // Fix the TypeScript error by ensuring url is a string before calling split
      const endpoint = typeof url === 'string' ? url.split('?')[0] : 'unknown-endpoint';
      
      if (!requests[endpoint]) {
        requests[endpoint] = {
          count: 0,
          errors: 0,
        };
      }
      
      requests[endpoint].errors++;
      requests[endpoint].lastError = {
        message: error.message,
        status: error.response?.status,
        time: Date.now(),
      };
    },
    
    /**
     * Get diagnostics information
     * @returns Diagnostics data
     */
    getDiagnostics: () => {
      return {
        endpoints: Object.entries(requests).map(([endpoint, data]) => ({
          endpoint,
          requestCount: data.count,
          errorCount: data.errors,
          errorRate: data.count > 0 ? (data.errors / data.count) * 100 : 0,
          lastError: data.lastError,
          lastRequestTime: data.lastRequestTime,
        })),
        totalRequests: Object.values(requests).reduce((sum, data) => sum + data.count, 0),
        totalErrors: Object.values(requests).reduce((sum, data) => sum + data.errors, 0),
      };
    },
    
    /**
     * Reset diagnostics
     */
    reset: () => {
      Object.keys(requests).forEach((key) => {
        delete requests[key];
      });
    }
  };
}
