import { ApiGateway } from '../../../../packages/api-gateway/src/gateway';
import { ApiGatewayConfig, RequestOptions } from '../../../../packages/api-gateway/src/types';
import { InternalAxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * Market Insights API Client
 * 
 * This client provides a specialized interface for interacting with the Market Insights API
 * using the shared API Gateway infrastructure.
 */
export class MarketInsightsApiClient {
  private apiGateway: ApiGateway;
  private static instance: MarketInsightsApiClient;

  /**
   * Create a new Market Insights API Client
   * @param config API Gateway configuration
   */
  constructor(config: ApiGatewayConfig) {
    this.apiGateway = new ApiGateway(config);
  }

  /**
   * Get a singleton instance of the Market Insights API Client
   * @param config API Gateway configuration (only used if instance doesn't exist)
   * @returns MarketInsightsApiClient instance
   */
  public static getInstance(config?: ApiGatewayConfig): MarketInsightsApiClient {
    if (!MarketInsightsApiClient.instance) {
      if (!config) {
        throw new Error('Configuration is required when creating the first instance');
      }
      MarketInsightsApiClient.instance = new MarketInsightsApiClient(config);
    }
    return MarketInsightsApiClient.instance;
  }

  /**
   * Update the API client configuration
   * @param config New configuration
   */
  public updateConfig(config: Partial<ApiGatewayConfig>): void {
    this.apiGateway.updateConfig(config);
  }

  /**
   * Set the authentication token
   * @param token JWT token
   */
  public setAuthToken(token: string): void {
    this.apiGateway.updateConfig({
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  /**
   * Clear the authentication token
   */
  public clearAuthToken(): void {
    // Create a new headers object without the Authorization header
    const headers: Record<string, string> = {};
    this.apiGateway.updateConfig({ headers });
  }

  /**
   * Check the health of the API
   * @returns Health check response
   */
  public async checkHealth(): Promise<any> {
    const response = await this.apiGateway.get('/api/health');
    return response.data;
  }

  /**
   * Get all categories
   * @returns List of categories
   */
  public async getCategories(): Promise<any[]> {
    const response = await this.apiGateway.get('/api/categories');
    
    if (!response.success) {
      throw new Error(`Failed to get categories: ${response.error?.message}`);
    }
    
    return response.data;
  }

  /**
   * Get a category by ID
   * @param id Category ID
   * @returns Category data
   */
  public async getCategoryById(id: string): Promise<any> {
    const response = await this.apiGateway.get(`/api/categories/${id}`);
    
    if (!response.success) {
      throw new Error(`Failed to get category ${id}: ${response.error?.message}`);
    }
    
    return response.data;
  }

  /**
   * Get all procedures
   * @param limit Maximum number of procedures to return
   * @param offset Pagination offset
   * @returns List of procedures
   */
  public async getProcedures(limit: number = 20, offset: number = 0): Promise<any[]> {
    const response = await this.apiGateway.get('/api/procedures', {
      params: { limit, offset },
    });
    
    if (!response.success) {
      throw new Error(`Failed to get procedures: ${response.error?.message}`);
    }
    
    return response.data;
  }

  /**
   * Get a procedure by ID
   * @param id Procedure ID
   * @returns Procedure data
   */
  public async getProcedureById(id: string): Promise<any> {
    const response = await this.apiGateway.get(`/api/procedures/${id}`);
    
    if (!response.success) {
      throw new Error(`Failed to get procedure ${id}: ${response.error?.message}`);
    }
    
    return response.data;
  }

  /**
   * Search for procedures
   * @param query Search query
   * @param filters Search filters
   * @returns Search results
   */
  public async searchProcedures(query: string, filters?: Record<string, any>): Promise<any[]> {
    const response = await this.apiGateway.get('/api/procedures/search', {
      params: {
        q: query,
        ...filters,
      },
    });
    
    if (!response.success) {
      throw new Error(`Search failed: ${response.error?.message}`);
    }
    
    return response.data;
  }

  /**
   * Get market growth data
   * @param procedureId Procedure ID
   * @param filters Filters for market growth data
   * @returns Market growth data
   */
  public async getMarketGrowth(procedureId: string, filters?: Record<string, any>): Promise<any> {
    const response = await this.apiGateway.get(`/api/market-growth/${procedureId}`, {
      params: filters,
    });
    
    if (!response.success) {
      throw new Error(`Failed to get market growth data: ${response.error?.message}`);
    }
    
    return response.data;
  }

  /**
   * Get news articles
   * @param limit Maximum number of articles to return
   * @param offset Pagination offset
   * @returns List of news articles
   */
  public async getNews(limit: number = 10, offset: number = 0): Promise<any[]> {
    const response = await this.apiGateway.get('/api/news', {
      params: { limit, offset },
    });
    
    if (!response.success) {
      throw new Error(`Failed to get news: ${response.error?.message}`);
    }
    
    return response.data;
  }

  /**
   * Get news articles by category
   * @param categoryId Category ID
   * @param limit Maximum number of articles to return
   * @param offset Pagination offset
   * @returns List of news articles
   */
  public async getNewsByCategory(categoryId: string, limit: number = 10, offset: number = 0): Promise<any[]> {
    const response = await this.apiGateway.get(`/api/news/category/${categoryId}`, {
      params: { limit, offset },
    });
    
    if (!response.success) {
      throw new Error(`Failed to get news for category ${categoryId}: ${response.error?.message}`);
    }
    
    return response.data;
  }

  /**
   * Get companies
   * @param limit Maximum number of companies to return
   * @param offset Pagination offset
   * @returns List of companies
   */
  public async getCompanies(limit: number = 20, offset: number = 0): Promise<any[]> {
    const response = await this.apiGateway.get('/api/companies', {
      params: { limit, offset },
    });
    
    if (!response.success) {
      throw new Error(`Failed to get companies: ${response.error?.message}`);
    }
    
    return response.data;
  }

  /**
   * Get a company by ID
   * @param id Company ID
   * @returns Company data
   */
  public async getCompanyById(id: string): Promise<any> {
    const response = await this.apiGateway.get(`/api/companies/${id}`);
    
    if (!response.success) {
      throw new Error(`Failed to get company ${id}: ${response.error?.message}`);
    }
    
    return response.data;
  }

  /**
   * Get companies by category
   * @param categoryId Category ID
   * @param limit Maximum number of companies to return
   * @param offset Pagination offset
   * @returns List of companies
   */
  public async getCompaniesByCategory(categoryId: string, limit: number = 20, offset: number = 0): Promise<any[]> {
    const response = await this.apiGateway.get(`/api/companies/category/${categoryId}`, {
      params: { limit, offset },
    });
    
    if (!response.success) {
      throw new Error(`Failed to get companies for category ${categoryId}: ${response.error?.message}`);
    }
    
    return response.data;
  }
}

/**
 * Create and configure the Market Insights API Client
 * @param baseURL API base URL
 * @param token Authentication token (optional)
 * @returns Configured API client
 */
export function createMarketInsightsApiClient(baseURL: string, token?: string): MarketInsightsApiClient {
  const config: ApiGatewayConfig = {
    baseURL,
    timeout: 10000,
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    retryConfig: {
      maxRetries: 3,
      retryDelay: 1000,
      retryStatusCodes: [408, 429, 500, 502, 503, 504],
    },
    middleware: {
      request: [
        // Add request timestamp
        (config: InternalAxiosRequestConfig) => {
          if (config.headers) {
            config.headers['X-Request-Time'] = new Date().toISOString();
          }
          return config;
        },
      ],
      response: [
        // Log response time in development
        (response: AxiosResponse) => {
          if (process.env.NODE_ENV === 'development') {
            const requestTime = response.config.headers?.['X-Request-Time'];
            if (requestTime) {
              const responseTime = Date.now() - new Date(requestTime as string).getTime();
              console.log(`[API] ${response.config.method?.toUpperCase()} ${response.config.url} - ${responseTime}ms`);
            }
          }
          return response;
        },
      ],
      error: [
        // Handle authentication errors
        (error: any) => {
          if (error.response?.status === 401) {
            // Could dispatch an action to redirect to login or refresh token
            console.error('Authentication error - token may have expired');
          }
          return Promise.reject(error);
        },
      ],
    },
  };

  return MarketInsightsApiClient.getInstance(config);
}

// Export a default instance for convenience
export default createMarketInsightsApiClient('https://osbackend-zl1h.onrender.com');
