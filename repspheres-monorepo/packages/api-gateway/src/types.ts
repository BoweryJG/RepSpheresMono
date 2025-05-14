import { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

/**
 * Middleware function type
 */
export type MiddlewareFunction<T = any> = (value: T) => T;

/**
 * Error handler function type
 */
export type ErrorHandlerFunction = (error: any) => any;

/**
 * API Error interface
 */
export interface ApiError {
  message: string;
  code: string;
  details?: any;
  status?: number;
}

/**
 * Health check response
 */
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy' | 'up' | 'down';
  version: string;
  timestamp: string;
  backend?: {
    status: 'healthy' | 'degraded' | 'unhealthy' | 'up' | 'down';
    message?: string;
    responseTime?: number;
    error?: any;
  };
  services?: Record<string, {
    status: 'healthy' | 'degraded' | 'unhealthy' | 'up' | 'down';
    message?: string;
  }>;
  circuitBreaker?: {
    status: 'open' | 'closed' | 'half-open';
    failureCount?: number;
    failures?: number;
    lastFailure?: string;
  };
}

/**
 * Configuration for the API Gateway
 */
export interface ApiGatewayConfig {
  /**
   * Base URL for the API
   */
  baseURL: string;
  
  /**
   * Request timeout in milliseconds
   */
  timeout?: number;
  
  /**
   * Default headers to include with every request
   */
  headers?: Record<string, string>;
  
  /**
   * Enable debug mode for detailed logging
   */
  debug?: boolean;
  
  /**
   * Configuration for request retries
   */
  retryConfig?: RetryConfig;
  
  /**
   * Middleware configuration
   */
  middleware?: {
    /**
     * Request middleware functions
     */
    request?: Array<(config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig>;
    
    /**
     * Response middleware functions
     */
    response?: Array<(response: AxiosResponse) => AxiosResponse>;
    
    /**
     * Error middleware functions
     */
    error?: Array<(error: any) => any>;
  };
}

/**
 * Configuration for request retries
 */
export interface RetryConfig {
  /**
   * Maximum number of retry attempts
   */
  maxRetries: number;
  
  /**
   * Delay between retries in milliseconds
   */
  retryDelay: number;
  
  /**
   * HTTP status codes that should trigger a retry
   */
  retryStatusCodes: number[];
}

/**
 * Options for API requests
 */
export interface RequestOptions {
  /**
   * Query parameters
   */
  params?: Record<string, any>;
  
  /**
   * Request headers
   */
  headers?: Record<string, string>;
}

/**
 * Standardized API response
 */
export interface ApiResponse<T = any> {
  /**
   * Response data
   */
  data: T | null;
  
  /**
   * HTTP status code
   */
  status: number;
  
  /**
   * Response headers
   */
  headers: Record<string, any>;
  
  /**
   * Whether the request was successful
   */
  success: boolean;
  
  /**
   * Error information (if success is false)
   */
  error?: {
    /**
     * Error message
     */
    message: string;
    
    /**
     * Error code
     */
    code: string;
    
    /**
     * Additional error details
     */
    details: any;
  };
}

/**
 * API Gateway factory function options
 */
export interface ApiGatewayOptions extends ApiGatewayConfig {
  /**
   * Name of the API gateway instance
   */
  name?: string;
}

/**
 * API Gateway response format
 */
export interface ApiGatewayResponse {
  /**
   * Response data
   */
  data: any;
  
  /**
   * HTTP status code
   */
  status: number;
  
  /**
   * Response headers
   */
  headers: Record<string, any>;
  
  /**
   * Unique request ID
   */
  requestId: string;
  
  /**
   * Response timestamp
   */
  timestamp: string;
}
