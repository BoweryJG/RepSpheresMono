import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiGatewayConfig, RequestOptions, ApiResponse, CacheConfig } from './types';
import { applyMiddleware } from './middleware';
import { ResponseCache, createExponentialBackoff, shouldRetry, createConnectionMonitor, createDiagnostics } from './utils';

/**
 * API Gateway class to handle all API requests
 * Provides a unified interface for making requests to different backends
 */
export class ApiGateway {
  private axiosInstance: AxiosInstance;
  private config: ApiGatewayConfig;
  private cache: ResponseCache;
  private connectionMonitor: ReturnType<typeof createConnectionMonitor>;
  private diagnostics: ReturnType<typeof createDiagnostics>;

  constructor(config: ApiGatewayConfig) {
    this.config = config;
    
    // Initialize cache with default config if not provided
    const cacheConfig: CacheConfig = {
      enabled: true,
      ttl: 60000, // 1 minute default TTL
      maxSize: 100,
      cacheNonGetRequests: false
    };
    
    this.cache = new ResponseCache(cacheConfig);
    this.connectionMonitor = createConnectionMonitor();
    this.diagnostics = createDiagnostics();
    
    // Create axios instance with default config
    this.axiosInstance = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
    });

    // Apply request interceptors
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Check cache first for GET requests
        if (config.method?.toUpperCase() === 'GET') {
          const cachedResponse = this.cache.get(config);
          if (cachedResponse) {
            // Create a new resolved promise with the cached response
            // This will be caught by the response interceptor
            config.adapter = () => Promise.resolve(cachedResponse);
          }
        }
        
        // Record request for diagnostics
        if (this.config.debug) {
          this.diagnostics.recordRequest(config.url || '', config);
        }
        
        // Apply middleware to request
        if (this.config.middleware?.request && this.config.middleware.request.length > 0) {
          return this.config.middleware.request.reduce(
            (acc, middleware) => middleware(acc),
            config
          );
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Apply response interceptors
    this.axiosInstance.interceptors.response.use(
      (response) => {
        // Record successful connection
        this.connectionMonitor.recordSuccess();
        
        // Cache the response if it's cacheable
        this.cache.set(response.config, response);
        
        // Apply middleware to response
        if (this.config.middleware?.response && this.config.middleware.response.length > 0) {
          return this.config.middleware.response.reduce(
            (acc, middleware) => middleware(acc),
            response
          );
        }
        return response;
      },
      async (error) => {
        // Record error for diagnostics
        if (this.config.debug && error.config?.url) {
          this.diagnostics.recordError(error.config.url, error);
        }
        
        // Record connection failure
        this.connectionMonitor.recordFailure();
        
        // Handle errors with enhanced retry logic if configured
        if (this.config.retryConfig && error.config && !error.config.__isRetry) {
          const retryConfig = this.config.retryConfig;
          const statusCode = error.response?.status;
          
          // Initialize retry count
          error.config.__retryCount = (error.config.__retryCount || 0) + 1;
          
          if (
            error.config.__retryCount <= retryConfig.maxRetries &&
            shouldRetry(statusCode, retryConfig)
          ) {
            error.config.__isRetry = true;
            
            // Calculate delay with exponential backoff if enabled
            const delay = createExponentialBackoff(
              error.config.__retryCount - 1,
              retryConfig
            );
            
            // Wait for the calculated delay
            await new Promise(resolve => setTimeout(resolve, delay));
            
            // Log retry attempt if debug is enabled
            if (this.config.debug) {
              console.log(`Retrying request to ${error.config.url} (attempt ${error.config.__retryCount}/${retryConfig.maxRetries})`);
            }
            
            // Retry the request
            return this.axiosInstance(error.config);
          }
        }
        
        // Apply error middleware
        if (this.config.middleware?.error && this.config.middleware.error.length > 0) {
          return this.config.middleware.error.reduce(
            (acc, middleware) => middleware(acc),
            error
          );
        }
        
        return Promise.reject(error);
      }
    );
  }

  /**
   * Make a GET request
   * @param endpoint API endpoint
   * @param options Request options
   * @returns Promise with response data
   */
  async get<T = any>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    try {
      const config: AxiosRequestConfig = {
        params: options?.params,
        headers: options?.headers,
      };
      
      const response: AxiosResponse<T> = await this.axiosInstance.get(endpoint, config);
      
      return {
        data: response.data,
        status: response.status,
        headers: response.headers,
        success: true,
      };
    } catch (error: any) {
      return this.handleError<T>(error);
    }
  }

  /**
   * Make a POST request
   * @param endpoint API endpoint
   * @param data Request payload
   * @param options Request options
   * @returns Promise with response data
   */
  async post<T = any>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    try {
      const config: AxiosRequestConfig = {
        params: options?.params,
        headers: options?.headers,
      };
      
      const response: AxiosResponse<T> = await this.axiosInstance.post(endpoint, data, config);
      
      return {
        data: response.data,
        status: response.status,
        headers: response.headers,
        success: true,
      };
    } catch (error: any) {
      return this.handleError<T>(error);
    }
  }

  /**
   * Make a PUT request
   * @param endpoint API endpoint
   * @param data Request payload
   * @param options Request options
   * @returns Promise with response data
   */
  async put<T = any>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    try {
      const config: AxiosRequestConfig = {
        params: options?.params,
        headers: options?.headers,
      };
      
      const response: AxiosResponse<T> = await this.axiosInstance.put(endpoint, data, config);
      
      return {
        data: response.data,
        status: response.status,
        headers: response.headers,
        success: true,
      };
    } catch (error: any) {
      return this.handleError<T>(error);
    }
  }

  /**
   * Make a DELETE request
   * @param endpoint API endpoint
   * @param options Request options
   * @returns Promise with response data
   */
  async delete<T = any>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    try {
      const config: AxiosRequestConfig = {
        params: options?.params,
        headers: options?.headers,
      };
      
      const response: AxiosResponse<T> = await this.axiosInstance.delete(endpoint, config);
      
      return {
        data: response.data,
        status: response.status,
        headers: response.headers,
        success: true,
      };
    } catch (error: any) {
      return this.handleError<T>(error);
    }
  }

  /**
   * Handle API errors
   * @param error Error object
   * @returns Standardized error response
   */
  private handleError<T>(error: any): ApiResponse<T> {
    const response: ApiResponse<T> = {
      data: null,
      status: error.response?.status || 500,
      headers: error.response?.headers || {},
      success: false,
      error: {
        message: error.message || 'Unknown error occurred',
        code: error.response?.data?.code || 'UNKNOWN_ERROR',
        details: error.response?.data || {},
      },
    };

    // Log error if debug mode is enabled
    if (this.config.debug) {
      console.error('API Gateway Error:', {
        endpoint: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        status: response.status,
        message: response.error?.message,
      });
    }

    return response;
  }

  /**
   * Update the API gateway configuration
   * @param config New configuration
   * @param cacheConfig Optional cache configuration
   */
  updateConfig(config: Partial<ApiGatewayConfig>, cacheConfig?: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...config };
    
    // Update axios instance with new config
    this.axiosInstance.defaults.baseURL = this.config.baseURL;
    this.axiosInstance.defaults.timeout = this.config.timeout || 30000;
    
    // Update headers
    if (this.config.headers) {
      Object.entries(this.config.headers).forEach(([key, value]) => {
        this.axiosInstance.defaults.headers.common[key] = value;
      });
    }
    
    // Update cache config if provided
    if (cacheConfig) {
      this.cache.updateConfig(cacheConfig);
    }
  }
  
  /**
   * Get connection status information
   * @returns Connection status object
   */
  getConnectionStatus() {
    return {
      isOnline: this.connectionMonitor.isOnline(),
      timeSinceLastSuccess: this.connectionMonitor.getTimeSinceLastSuccess(),
      failedRequestCount: this.connectionMonitor.getFailedRequestCount()
    };
  }
  
  /**
   * Get diagnostic information
   * @returns Diagnostic information object
   */
  getDiagnostics() {
    return this.diagnostics.getDiagnostics();
  }
  
  /**
   * Clear the response cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}
