import axios from 'axios';
import axiosRetry from 'axios-retry';
import type { AxiosResponse, AxiosRequestConfig } from 'axios';
import { ExtendedAxiosInstance } from './types';
import {
  ApiGatewayConfig,
  ApiGatewayInterface,
  ApiGatewayOptions,
  ApiMiddleware,
  ApiRequestConfig,
  ApiResponse,
  ApiError,
} from './types';
import { createApiError, createApiResponse, logApiOperation } from './utils';

/**
 * API Gateway implementation
 * Provides a unified interface for making API requests with middleware support
 */
export class ApiGateway implements ApiGatewayInterface {
  private axios: ExtendedAxiosInstance;
  private config: ApiGatewayConfig;
  private middlewares: ApiMiddleware[];

  /**
   * Creates a new API Gateway instance
   * @param options Configuration options for the API Gateway
   */
  constructor(options: ApiGatewayOptions) {
    this.config = options.config;
    this.middlewares = options.middlewares || [];

    // Create axios instance with default config
    this.axios = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout || 30000,
      headers: this.config.headers || {},
    }) as unknown as ExtendedAxiosInstance;

    // Configure retry behavior if specified
    if (this.config.retries && this.config.retries > 0) {
      axiosRetry(this.axios, {
        retries: this.config.retries,
        retryDelay: axiosRetry.exponentialDelay,
        retryCondition: (error: any) => {
          // Retry on network errors or 5xx server errors
          return (
            axiosRetry.isNetworkError(error) ||
            (error.response && error.response.status >= 500)
          );
        },
      });
    }
  }

  /**
   * Makes an API request with the specified configuration
   * @param config Request configuration
   * @returns Promise resolving to the API response
   */
  public async request<T = any>(config: ApiRequestConfig): Promise<ApiResponse<T>> {
    try {
      // Log request if debug mode is enabled
      logApiOperation('request', { ...config, baseUrl: this.config.baseUrl }, this.config.debug);

      // Apply request middleware
      let processedConfig = { ...config };
      for (const middleware of this.middlewares) {
        if (middleware.onRequest) {
          processedConfig = await middleware.onRequest(processedConfig);
        }
      }

      // Check if response is from cache (set by middleware)
      if (processedConfig.__fromCache && processedConfig.__cachedData) {
        const cachedResponse: ApiResponse<T> = {
          data: processedConfig.__cachedData,
          status: 200,
          headers: {},
          config: processedConfig,
        };

        // Apply response middleware
        let processedResponse = cachedResponse;
        for (const middleware of [...this.middlewares].reverse()) {
          if (middleware.onResponse) {
            processedResponse = await middleware.onResponse(processedResponse);
          }
        }

        return processedResponse;
      }

      // Convert to axios request config
      const axiosConfig: AxiosRequestConfig = {
        url: processedConfig.path,
        method: processedConfig.method.toLowerCase(),
        params: processedConfig.params,
        data: processedConfig.data,
        headers: processedConfig.headers,
        timeout: processedConfig.timeout || this.config.timeout,
      };

      // Make the request
      const axiosResponse: AxiosResponse<T> = await this.axios.request<T>(axiosConfig);

      // Create standardized response
      const response = createApiResponse<T>(axiosResponse, processedConfig);

      // Log response if debug mode is enabled
      logApiOperation('response', response, this.config.debug);

      // Apply response middleware
      let processedResponse = response;
      for (const middleware of [...this.middlewares].reverse()) {
        if (middleware.onResponse) {
          processedResponse = await middleware.onResponse(processedResponse);
        }
      }

      return processedResponse;
    } catch (error) {
      // Create standardized error
      const apiError = createApiError(error, config);

      // Log error if debug mode is enabled
      logApiOperation('error', apiError, this.config.debug);

      // Apply error middleware
      let processedError = apiError;
      for (const middleware of [...this.middlewares].reverse()) {
        if (middleware.onError) {
          const result = await middleware.onError(processedError);
          
          // Check if middleware returned a response instead of an error
          if (result && 'data' in result && 'status' in result) {
            return result as ApiResponse<T>;
          }
          
          processedError = result as ApiError;
        }
      }

      throw processedError;
    }
  }

  /**
   * Makes a GET request to the specified path
   * @param path API endpoint path
   * @param params Query parameters
   * @param config Additional request configuration
   * @returns Promise resolving to the response data
   */
  public async get<T = any>(
    path: string,
    params?: Record<string, any>,
    config?: Partial<ApiRequestConfig>
  ): Promise<T> {
    const response = await this.request<T>({
      path,
      method: 'GET',
      params,
      ...config,
    });
    return response.data;
  }

  /**
   * Makes a POST request to the specified path
   * @param path API endpoint path
   * @param data Request body data
   * @param config Additional request configuration
   * @returns Promise resolving to the response data
   */
  public async post<T = any>(
    path: string,
    data?: any,
    config?: Partial<ApiRequestConfig>
  ): Promise<T> {
    const response = await this.request<T>({
      path,
      method: 'POST',
      data,
      ...config,
    });
    return response.data;
  }

  /**
   * Makes a PUT request to the specified path
   * @param path API endpoint path
   * @param data Request body data
   * @param config Additional request configuration
   * @returns Promise resolving to the response data
   */
  public async put<T = any>(
    path: string,
    data?: any,
    config?: Partial<ApiRequestConfig>
  ): Promise<T> {
    const response = await this.request<T>({
      path,
      method: 'PUT',
      data,
      ...config,
    });
    return response.data;
  }

  /**
   * Makes a DELETE request to the specified path
   * @param path API endpoint path
   * @param config Additional request configuration
   * @returns Promise resolving to the response data
   */
  public async delete<T = any>(
    path: string,
    config?: Partial<ApiRequestConfig>
  ): Promise<T> {
    const response = await this.request<T>({
      path,
      method: 'DELETE',
      ...config,
    });
    return response.data;
  }

  /**
   * Makes a PATCH request to the specified path
   * @param path API endpoint path
   * @param data Request body data
   * @param config Additional request configuration
   * @returns Promise resolving to the response data
   */
  public async patch<T = any>(
    path: string,
    data?: any,
    config?: Partial<ApiRequestConfig>
  ): Promise<T> {
    const response = await this.request<T>({
      path,
      method: 'PATCH',
      data,
      ...config,
    });
    return response.data;
  }
}

/**
 * Creates a new API Gateway instance
 * @param options Configuration options for the API Gateway
 * @returns API Gateway instance
 */
export function createApiGateway(options: ApiGatewayOptions): ApiGatewayInterface {
  return new ApiGateway(options);
}
