// Configuration constants
const API_CONFIG = {
  baseUrl: 'https://osbackend-zl1h.onrender.com',
  timeout: 30000,
  retries: 3,
  debug: false,
};

// Mock API Gateway types until we have proper package imports
interface ApiRequestConfig {
  path: string;
  method: string;
  params?: Record<string, any>;
  data?: any;
  headers?: Record<string, string>;
  timeout?: number;
  __fromCache?: boolean;
  __cachedData?: any;
  __retryCount?: number;
  [key: string]: any;
}

interface ApiResponse<T = any> {
  data: T;
  status: number;
  headers: Record<string, string>;
  config: ApiRequestConfig;
}

interface ApiError {
  message: string;
  status?: number;
  config: ApiRequestConfig;
  response?: ApiResponse;
}

interface ApiMiddleware {
  onRequest?: (config: ApiRequestConfig) => Promise<ApiRequestConfig>;
  onResponse?: <T>(response: ApiResponse<T>) => Promise<ApiResponse<T>>;
  onError?: <T>(error: ApiError) => Promise<ApiError | ApiResponse<T>>;
}

interface ApiGatewayConfig {
  baseUrl: string;
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
  debug?: boolean;
}

interface ApiGatewayOptions {
  config: ApiGatewayConfig;
  middlewares?: ApiMiddleware[];
}

interface ApiGatewayInterface {
  request<T = any>(config: ApiRequestConfig): Promise<ApiResponse<T>>;
  get<T = any>(path: string, params?: Record<string, any>, config?: Partial<ApiRequestConfig>): Promise<T>;
  post<T = any>(path: string, data?: any, config?: Partial<ApiRequestConfig>): Promise<T>;
  put<T = any>(path: string, data?: any, config?: Partial<ApiRequestConfig>): Promise<T>;
  delete<T = any>(path: string, config?: Partial<ApiRequestConfig>): Promise<T>;
  patch<T = any>(path: string, data?: any, config?: Partial<ApiRequestConfig>): Promise<T>;
}

// Mock implementation of createApiGateway
function createApiGateway(options: ApiGatewayOptions): ApiGatewayInterface {
  const { config, middlewares = [] } = options;
  
  return {
    async request<T = any>(requestConfig: ApiRequestConfig): Promise<ApiResponse<T>> {
      // Apply request middleware
      let processedConfig = { ...requestConfig };
      for (const middleware of middlewares) {
        if (middleware.onRequest) {
          processedConfig = await middleware.onRequest(processedConfig);
        }
      }
      
      // Check if response is from cache
      if (processedConfig.__fromCache && processedConfig.__cachedData) {
        const cachedResponse: ApiResponse<T> = {
          data: processedConfig.__cachedData,
          status: 200,
          headers: {},
          config: processedConfig,
        };
        
        // Apply response middleware
        let processedResponse = cachedResponse;
        for (const middleware of [...middlewares].reverse()) {
          if (middleware.onResponse) {
            processedResponse = await middleware.onResponse(processedResponse);
          }
        }
        
        return processedResponse;
      }
      
      try {
        // Make the actual request
        const url = `${config.baseUrl}${processedConfig.path}`;
        console.log(`[API] ${processedConfig.method.toUpperCase()} ${url}`);
        
        // In a real implementation, this would use fetch or axios
        // For now, we'll just mock a successful response
        const mockResponse: ApiResponse<T> = {
          data: { success: true } as unknown as T,
          status: 200,
          headers: {},
          config: processedConfig,
        };
        
        // Apply response middleware
        let processedResponse = mockResponse;
        for (const middleware of [...middlewares].reverse()) {
          if (middleware.onResponse) {
            processedResponse = await middleware.onResponse(processedResponse);
          }
        }
        
        return processedResponse;
      } catch (error) {
        // Create error object
        const apiError: ApiError = {
          message: error instanceof Error ? error.message : 'Unknown error',
          status: 500,
          config: processedConfig,
        };
        
        // Apply error middleware
        let processedError = apiError;
        for (const middleware of [...middlewares].reverse()) {
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
    },
    
    async get<T = any>(path: string, params?: Record<string, any>, config?: Partial<ApiRequestConfig>): Promise<T> {
      const response = await this.request<T>({
        path,
        method: 'GET',
        params,
        ...config,
      });
      return response.data;
    },
    
    async post<T = any>(path: string, data?: any, config?: Partial<ApiRequestConfig>): Promise<T> {
      const response = await this.request<T>({
        path,
        method: 'POST',
        data,
        ...config,
      });
      return response.data;
    },
    
    async put<T = any>(path: string, data?: any, config?: Partial<ApiRequestConfig>): Promise<T> {
      const response = await this.request<T>({
        path,
        method: 'PUT',
        data,
        ...config,
      });
      return response.data;
    },
    
    async delete<T = any>(path: string, config?: Partial<ApiRequestConfig>): Promise<T> {
      const response = await this.request<T>({
        path,
        method: 'DELETE',
        ...config,
      });
      return response.data;
    },
    
    async patch<T = any>(path: string, data?: any, config?: Partial<ApiRequestConfig>): Promise<T> {
      const response = await this.request<T>({
        path,
        method: 'PATCH',
        data,
        ...config,
      });
      return response.data;
    },
  };
}

/**
 * Market Insights API client types
 */
export interface MarketData {
  id: string;
  name: string;
  category: string;
  growth: number;
  marketSize: number;
  region?: string;
  year?: number;
}

export interface ProcedureData {
  id: string;
  name: string;
  category: string;
  description: string;
  averageCost: number;
  popularity: number;
  growthRate: number;
}

export interface CompanyData {
  id: string;
  name: string;
  ticker?: string;
  marketCap?: number;
  revenue?: number;
  employees?: number;
  founded?: number;
  headquarters?: string;
  website?: string;
  description?: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  summary?: string;
  imageUrl?: string;
  category?: string;
  relevance?: number;
}

/**
 * Cache middleware for Market Insights API
 */
const cacheMiddleware: ApiMiddleware = {
  onRequest: async (config) => {
    // Only cache GET requests
    if (config.method !== 'GET') {
      return config;
    }

    const cacheKey = `market-insights-api:${config.path}:${JSON.stringify(config.params || {})}`;
    
    try {
      // Check if we have a cached response
      const cachedData = localStorage.getItem(cacheKey);
      
      if (cachedData) {
        const { data, expiry } = JSON.parse(cachedData);
        
        // Check if cache is still valid
        if (expiry > Date.now()) {
          console.log(`[Cache] Using cached data for ${config.path}`);
          
          // Return cached data
          return {
            ...config,
            __fromCache: true,
            __cachedData: data,
          };
        } else {
          // Cache expired, remove it
          localStorage.removeItem(cacheKey);
        }
      }
    } catch (error) {
      console.error('[Cache] Error reading from cache:', error);
    }
    
    return config;
  },
  
  onResponse: async (response) => {
    // Only cache successful GET requests
    if (response.config.method !== 'GET' || response.status !== 200) {
      return response;
    }
    
    // Don't cache if it's already from cache
    if (response.config.__fromCache) {
      return response;
    }
    
    const cacheKey = `market-insights-api:${response.config.path}:${JSON.stringify(response.config.params || {})}`;
    
    try {
      // Cache the response for 5 minutes
      const cacheData = {
        data: response.data,
        expiry: Date.now() + 5 * 60 * 1000, // 5 minutes
      };
      
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      console.log(`[Cache] Cached data for ${response.config.path}`);
    } catch (error) {
      console.error('[Cache] Error writing to cache:', error);
    }
    
    return response;
  }
};

/**
 * Error handling middleware for Market Insights API
 */
const errorHandlingMiddleware: ApiMiddleware = {
  onError: async (error) => {
    // Log the error
    console.error('[Market Insights API]', error.message, error.config);
    
    // Add custom error handling here
    if (error.status === 401) {
      // Handle unauthorized error
      console.log('User is not authenticated, redirecting to login...');
      // Could trigger a redirect or auth refresh here
    }
    
    return error;
  }
};

/**
 * Market Insights API client
 */
export class MarketInsightsApi {
  private apiClient: ApiGatewayInterface;
  
  constructor() {
    this.apiClient = createApiGateway({
      config: API_CONFIG,
      middlewares: [
        cacheMiddleware,
        errorHandlingMiddleware,
      ],
    });
  }
  
  /**
   * Get market data for a specific category
   * @param category Category name
   * @returns Promise resolving to market data
   */
  async getMarketData(category?: string): Promise<MarketData[]> {
    const params = category ? { category } : undefined;
    return this.apiClient.get<MarketData[]>('/api/market/data', params);
  }
  
  /**
   * Get procedure data
   * @param id Optional procedure ID
   * @returns Promise resolving to procedure data
   */
  async getProcedures(id?: string): Promise<ProcedureData | ProcedureData[]> {
    if (id) {
      return this.apiClient.get<ProcedureData>(`/api/procedures/${id}`);
    }
    return this.apiClient.get<ProcedureData[]>('/api/procedures');
  }
  
  /**
   * Get procedure categories
   * @returns Promise resolving to procedure categories
   */
  async getCategories(): Promise<string[]> {
    return this.apiClient.get<string[]>('/api/procedures/categories');
  }
  
  /**
   * Get company data
   * @param id Optional company ID
   * @returns Promise resolving to company data
   */
  async getCompanies(id?: string): Promise<CompanyData | CompanyData[]> {
    if (id) {
      return this.apiClient.get<CompanyData>(`/api/companies/${id}`);
    }
    return this.apiClient.get<CompanyData[]>('/api/companies');
  }
  
  /**
   * Get news articles
   * @param category Optional category filter
   * @param limit Optional limit
   * @returns Promise resolving to news articles
   */
  async getNews(category?: string, limit?: number): Promise<NewsArticle[]> {
    const params: Record<string, any> = {};
    if (category) params.category = category;
    if (limit) params.limit = limit;
    
    return this.apiClient.get<NewsArticle[]>('/api/news', params);
  }
  
  /**
   * Search across all data
   * @param query Search query
   * @returns Promise resolving to search results
   */
  async search(query: string): Promise<any> {
    return this.apiClient.get('/api/search', { query });
  }
  
  /**
   * Check API status
   * @returns Promise resolving to API status
   */
  async checkStatus(): Promise<{ status: string; version: string }> {
    return this.apiClient.get('/api/status');
  }
}

/**
 * Create a new Market Insights API client instance
 * @returns Market Insights API client
 */
export function createMarketInsightsApi(): MarketInsightsApi {
  return new MarketInsightsApi();
}

// Export a singleton instance
export const marketInsightsApi = createMarketInsightsApi();

export default marketInsightsApi;
