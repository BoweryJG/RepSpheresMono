import type { AxiosRequestConfig, AxiosResponse, AxiosInstance } from 'axios';

/**
 * Extended Axios Instance with all required methods
 */
export interface ExtendedAxiosInstance extends AxiosInstance {
  getUri(config?: AxiosRequestConfig): string;
  options<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
}

/**
 * API Gateway configuration
 */
export interface ApiGatewayConfig {
  /**
   * Base URL for API requests
   */
  baseUrl: string;
  
  /**
   * Default request timeout in milliseconds
   */
  timeout?: number;
  
  /**
   * Default headers to include with all requests
   */
  headers?: Record<string, string>;
  
  /**
   * Number of times to retry failed requests
   */
  retries?: number;
  
  /**
   * Whether to enable debug logging
   */
  debug?: boolean;
}

/**
 * API Gateway options
 */
export interface ApiGatewayOptions {
  /**
   * API Gateway configuration
   */
  config: ApiGatewayConfig;
  
  /**
   * Middleware to apply to requests and responses
   */
  middlewares?: ApiMiddleware[];
}

/**
 * API request configuration
 */
export interface ApiRequestConfig {
  /**
   * Request path (appended to baseUrl)
   */
  path: string;
  
  /**
   * HTTP method
   */
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  
  /**
   * Query parameters
   */
  params?: Record<string, any>;
  
  /**
   * Request body data
   */
  data?: any;
  
  /**
   * Request headers
   */
  headers?: Record<string, string>;
  
  /**
   * Request timeout in milliseconds
   */
  timeout?: number;
  
  /**
   * Internal flag for cached responses
   */
  __fromCache?: boolean;
  
  /**
   * Internal storage for cached data
   */
  __cachedData?: any;

  /**
   * Internal retry count for axios-retry
   */
  __retryCount?: number;
}

/**
 * API response
 */
export interface ApiResponse<T = any> {
  /**
   * Response data
   */
  data: T;
  
  /**
   * HTTP status code
   */
  status: number;
  
  /**
   * Response headers
   */
  headers: Record<string, string>;
  
  /**
   * Original request configuration
   */
  config: ApiRequestConfig;
}

/**
 * API error
 */
export interface ApiError {
  /**
   * Error message
   */
  message: string;
  
  /**
   * HTTP status code (if available)
   */
  status?: number;
  
  /**
   * Error code
   */
  code?: string;
  
  /**
   * Original request configuration
   */
  config: ApiRequestConfig;
  
  /**
   * Original error object
   */
  originalError: any;
}

/**
 * API middleware for intercepting requests, responses, and errors
 */
export interface ApiMiddleware {
  /**
   * Process request before sending
   * @param config Request configuration
   * @returns Modified request configuration
   */
  onRequest?: (config: ApiRequestConfig) => Promise<ApiRequestConfig> | ApiRequestConfig;
  
  /**
   * Process response before returning
   * @param response API response
   * @returns Modified API response
   */
  onResponse?: <T>(response: ApiResponse<T>) => Promise<ApiResponse<T>> | ApiResponse<T>;
  
  /**
   * Process error before throwing
   * @param error API error
   * @returns Modified API error or API response (to recover from error)
   */
  onError?: <T>(error: ApiError) => Promise<ApiError | ApiResponse<T>> | ApiError | ApiResponse<T>;
}

/**
 * API Gateway interface
 */
export interface ApiGatewayInterface {
  /**
   * Makes an API request with the specified configuration
   * @param config Request configuration
   * @returns Promise resolving to the API response
   */
  request<T = any>(config: ApiRequestConfig): Promise<ApiResponse<T>>;
  
  /**
   * Makes a GET request to the specified path
   * @param path API endpoint path
   * @param params Query parameters
   * @param config Additional request configuration
   * @returns Promise resolving to the response data
   */
  get<T = any>(
    path: string,
    params?: Record<string, any>,
    config?: Partial<ApiRequestConfig>
  ): Promise<T>;
  
  /**
   * Makes a POST request to the specified path
   * @param path API endpoint path
   * @param data Request body data
   * @param config Additional request configuration
   * @returns Promise resolving to the response data
   */
  post<T = any>(
    path: string,
    data?: any,
    config?: Partial<ApiRequestConfig>
  ): Promise<T>;
  
  /**
   * Makes a PUT request to the specified path
   * @param path API endpoint path
   * @param data Request body data
   * @param config Additional request configuration
   * @returns Promise resolving to the response data
   */
  put<T = any>(
    path: string,
    data?: any,
    config?: Partial<ApiRequestConfig>
  ): Promise<T>;
  
  /**
   * Makes a DELETE request to the specified path
   * @param path API endpoint path
   * @param config Additional request configuration
   * @returns Promise resolving to the response data
   */
  delete<T = any>(
    path: string,
    config?: Partial<ApiRequestConfig>
  ): Promise<T>;
  
  /**
   * Makes a PATCH request to the specified path
   * @param path API endpoint path
   * @param data Request body data
   * @param config Additional request configuration
   * @returns Promise resolving to the response data
   */
  patch<T = any>(
    path: string,
    data?: any,
    config?: Partial<ApiRequestConfig>
  ): Promise<T>;
}
