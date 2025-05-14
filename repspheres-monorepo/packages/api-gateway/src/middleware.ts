import { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { ApiGatewayConfig, MiddlewareFunction, ErrorHandlerFunction, ApiResponse } from './types';

/**
 * Apply middleware to request config
 * @param config Request config
 * @param middlewares Middleware functions
 * @returns Processed request config
 */
export const applyMiddleware = (
  config: AxiosRequestConfig,
  middlewares: MiddlewareFunction[]
): AxiosRequestConfig => {
  return middlewares.reduce((acc, middleware) => middleware(acc), config);
};

/**
 * Setup axios interceptors
 * @param axiosInstance Axios instance
 * @param config API Gateway configuration
 */
export const setupInterceptors = (axiosInstance: AxiosInstance, config: ApiGatewayConfig): void => {
  // Add request interceptors
  axiosInstance.interceptors.request.use(
    addRequestHeaders(config),
    handleRequestError(config)
  );

  // Add response interceptors
  axiosInstance.interceptors.response.use(
    handleResponseSuccess(config),
    handleResponseError(config)
  );
};

/**
 * Add request headers middleware
 * @param config API Gateway configuration
 * @returns Middleware function
 */
const addRequestHeaders = (config: ApiGatewayConfig): MiddlewareFunction => {
  return (requestConfig: AxiosRequestConfig): AxiosRequestConfig => {
    // Add default headers
    if (config.headers) {
      requestConfig.headers = {
        ...requestConfig.headers,
        ...config.headers,
      };
    }

    // Add timestamp for debugging
    if (config.debug) {
      requestConfig.headers = {
        ...requestConfig.headers,
        'X-Request-Time': new Date().toISOString(),
      };
    }

    return requestConfig;
  };
};

/**
 * Handle request error middleware
 * @param config API Gateway configuration
 * @returns Error handler function
 */
const handleRequestError = (config: ApiGatewayConfig): any => {
  return (error: AxiosError): Promise<AxiosError> => {
    if (config.debug) {
      console.error('API Gateway Request Error:', error);
    }
    return Promise.reject(error);
  };
};

/**
 * Handle response success middleware
 * @param config API Gateway configuration
 * @returns Middleware function
 */
const handleResponseSuccess = (config: ApiGatewayConfig): MiddlewareFunction => {
  return (response: any): any => {
    if (config.debug) {
      console.log('API Gateway Response:', {
        status: response.status,
        data: response.data,
        headers: response.headers,
      });
    }
    return response;
  };
};

/**
 * Handle response error middleware
 * @param config API Gateway configuration
 * @returns Error handler function
 */
const handleResponseError = (config: ApiGatewayConfig): any => {
  return async (error: AxiosError): Promise<any> => {
    if (config.debug) {
      console.error('API Gateway Response Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    }

    // Retry logic for failed requests
    const request = error.config;
    if (!request) {
      return Promise.reject(error);
    }

    return Promise.reject(error);
  };
};
