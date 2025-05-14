import { ApiMiddleware, ApiRequestConfig, ApiResponse, ApiError } from './types';

/**
 * Middleware for handling authentication
 * @param getToken Function that returns the authentication token
 * @param tokenType Type of token (e.g., 'Bearer', 'Basic')
 */
export function createAuthMiddleware(
  getToken: () => string | Promise<string>,
  tokenType: string = 'Bearer'
): ApiMiddleware {
  return {
    onRequest: async (config: ApiRequestConfig) => {
      const token = await getToken();
      
      if (!token) {
        return config;
      }

      const headers = {
        ...config.headers,
        Authorization: `${tokenType} ${token}`,
      };

      return {
        ...config,
        headers,
      };
    },
  };
}

/**
 * Middleware for handling request/response caching
 * @param cacheTime Time in milliseconds to cache responses
 */
export function createCacheMiddleware(cacheTime: number = 5 * 60 * 1000): ApiMiddleware {
  const cache = new Map<string, { data: any; timestamp: number }>();

  return {
    onRequest: (config: ApiRequestConfig) => {
      // Only cache GET requests
      if (config.method !== 'GET') {
        return config;
      }

      const cacheKey = `${config.method}:${config.path}:${JSON.stringify(config.params || {})}`;
      const cachedItem = cache.get(cacheKey);

      if (cachedItem && Date.now() - cachedItem.timestamp < cacheTime) {
        // Add a flag to indicate this is a cached response
        return {
          ...config,
          __fromCache: true,
          __cachedData: cachedItem.data,
        } as any;
      }

      return config;
    },
    onResponse: <T>(response: ApiResponse<T>) => {
      // Only cache GET requests
      if (response.config.method !== 'GET') {
        return response;
      }

      const cacheKey = `${response.config.method}:${response.config.path}:${JSON.stringify(
        response.config.params || {}
      )}`;

      cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now(),
      });

      return response;
    },
  };
}

/**
 * Middleware for handling retries on failure
 * @param maxRetries Maximum number of retry attempts
 * @param retryDelay Base delay between retries in milliseconds
 * @param retryableStatusCodes HTTP status codes that should trigger a retry
 */
export function createRetryMiddleware(
  maxRetries: number = 3,
  retryDelay: number = 300,
  retryableStatusCodes: number[] = [408, 429, 500, 502, 503, 504]
): ApiMiddleware {
  return {
    onError: async (error: ApiError) => {
      const config = error.config;
      
      if (!config) {
        return error;
      }

      // Get current retry count or initialize to 0
      const currentRetries = config.__retryCount || 0;

      // Check if we should retry
      const shouldRetry =
        currentRetries < maxRetries &&
        (error.status ? retryableStatusCodes.includes(error.status) : true);

      if (!shouldRetry) {
        return error;
      }

      // Increase retry count
      config.__retryCount = currentRetries + 1;

      // Calculate exponential backoff delay
      const delay = retryDelay * Math.pow(2, currentRetries);

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));

      // Return the config to trigger a retry
      return {
        __retryRequest: true,
        config,
      } as any;
    },
  };
}

/**
 * Middleware for adding common headers to all requests
 * @param headers Headers to add to all requests
 */
export function createHeadersMiddleware(headers: Record<string, string>): ApiMiddleware {
  return {
    onRequest: (config: ApiRequestConfig) => {
      return {
        ...config,
        headers: {
          ...headers,
          ...config.headers,
        },
      };
    },
  };
}

/**
 * Middleware for logging requests and responses
 * @param logger Custom logger function
 */
export function createLoggingMiddleware(
  logger: (message: string, data?: any) => void = console.log
): ApiMiddleware {
  return {
    onRequest: (config: ApiRequestConfig) => {
      logger(`API Request: ${config.method} ${config.path}`, {
        params: config.params,
        data: config.data,
      });
      return config;
    },
    onResponse: <T>(response: ApiResponse<T>) => {
      logger(`API Response: ${response.status} ${response.config.method} ${response.config.path}`, {
        data: response.data,
      });
      return response;
    },
    onError: (error: ApiError) => {
      logger(`API Error: ${error.status || 'Unknown'} ${error.message}`, {
        config: error.config,
        code: error.code,
      });
      return error;
    },
  };
}

/**
 * Combines multiple middleware into a single middleware
 * @param middlewares Array of middleware to combine
 */
export function combineMiddlewares(middlewares: ApiMiddleware[]): ApiMiddleware {
  return {
    onRequest: async (config: ApiRequestConfig) => {
      let currentConfig = { ...config };
      
      for (const middleware of middlewares) {
        if (middleware.onRequest) {
          currentConfig = await middleware.onRequest(currentConfig);
        }
      }
      
      return currentConfig;
    },
    
    onResponse: async <T>(response: ApiResponse<T>) => {
      let currentResponse = { ...response };
      
      // Apply middleware in reverse order for responses
      for (const middleware of [...middlewares].reverse()) {
        if (middleware.onResponse) {
          currentResponse = await middleware.onResponse(currentResponse);
        }
      }
      
      return currentResponse;
    },
    
    onError: async (error: ApiError) => {
      let currentError = { ...error };
      
      // Apply middleware in reverse order for errors
      for (const middleware of [...middlewares].reverse()) {
        if (middleware.onError) {
          const result = await middleware.onError(currentError);
          
          // Check if the middleware returned a response instead of an error
          if (result && 'data' in result && 'status' in result) {
            return result as ApiResponse<any>;
          }
          
          currentError = result as ApiError;
        }
      }
      
      return currentError;
    },
  };
}
