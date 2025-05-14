import { AxiosError, AxiosResponse } from 'axios';
import { ApiRequestConfig, ApiResponse, ApiError } from './types';

/**
 * Creates a standardized API response from an Axios response
 * @param axiosResponse Axios response object
 * @param config Original request configuration
 * @returns Standardized API response
 */
export function createApiResponse<T>(
  axiosResponse: AxiosResponse<T>,
  config: ApiRequestConfig
): ApiResponse<T> {
  return {
    data: axiosResponse.data,
    status: axiosResponse.status,
    headers: axiosResponse.headers as Record<string, string>,
    config,
  };
}

/**
 * Creates a standardized API error from an Axios error or any other error
 * @param error Original error
 * @param config Original request configuration
 * @returns Standardized API error
 */
export function createApiError(error: any, config: ApiRequestConfig): ApiError {
  if (error.isAxiosError) {
    const axiosError = error as AxiosError;
    return {
      message: axiosError.message,
      status: axiosError.response?.status,
      code: axiosError.code,
      config,
      originalError: axiosError,
    };
  }

  return {
    message: error.message || 'Unknown error',
    config,
    originalError: error,
  };
}

/**
 * Formats URL query parameters
 * @param params Query parameters object
 * @returns Formatted query string
 */
export function formatQueryParams(params: Record<string, any>): string {
  if (!params || Object.keys(params).length === 0) {
    return '';
  }

  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach(item => {
          queryParams.append(`${key}[]`, String(item));
        });
      } else if (typeof value === 'object') {
        queryParams.append(key, JSON.stringify(value));
      } else {
        queryParams.append(key, String(value));
      }
    }
  });

  return queryParams.toString();
}

/**
 * Formats a URL with path and query parameters
 * @param baseUrl Base URL
 * @param path Path to append
 * @param params Query parameters
 * @returns Formatted URL
 */
export function formatUrl(
  baseUrl: string,
  path: string,
  params?: Record<string, any>
): string {
  // Ensure baseUrl doesn't end with a slash and path doesn't start with a slash
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Combine base URL and path
  let url = `${normalizedBaseUrl}/${normalizedPath}`;
  
  // Add query parameters if provided
  if (params && Object.keys(params).length > 0) {
    const queryString = formatQueryParams(params);
    url = `${url}?${queryString}`;
  }
  
  return url;
}

/**
 * Logs API operation details if debug mode is enabled
 * @param type Operation type (request, response, error)
 * @param data Operation data
 * @param debug Whether debug mode is enabled
 */
export function logApiOperation(
  type: 'request' | 'response' | 'error',
  data: any,
  debug?: boolean
): void {
  if (!debug) {
    return;
  }

  const timestamp = new Date().toISOString();
  
  switch (type) {
    case 'request':
      console.log(`[${timestamp}] API Request:`, data);
      break;
    case 'response':
      console.log(`[${timestamp}] API Response:`, data);
      break;
    case 'error':
      console.error(`[${timestamp}] API Error:`, data);
      break;
  }
}
