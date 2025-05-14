import { createApiGateway } from '../gateway';
import type { ApiGatewayInterface, ApiMiddleware, ApiError, ApiResponse } from '../types';

/**
 * Example middleware for authentication
 */
const authMiddleware: ApiMiddleware = {
  onRequest: async (config) => {
    // Add authentication headers
    return {
      ...config,
      headers: {
        ...config.headers,
        'Authorization': `Bearer ${process.env.API_TOKEN || 'demo-token'}`,
      },
    };
  }
};

/**
 * Example middleware for logging
 */
const loggingMiddleware: ApiMiddleware = {
  onRequest: async (config) => {
    console.log(`[API Request] ${config.method} ${config.path}`);
    return config;
  },
  onResponse: async (response) => {
    console.log(`[API Response] ${response.status} ${response.config.method} ${response.config.path}`);
    return response;
  },
  onError: async (error) => {
    console.error(`[API Error] ${error.status || 'Unknown'} ${error.message}`);
    return error;
  }
};

/**
 * Example middleware for retrying failed requests
 */
const retryMiddleware: ApiMiddleware = {
  onError: async <T>(error: ApiError): Promise<ApiError | ApiResponse<T>> => {
    // Only retry on network errors or 5xx server errors
    if (!error.status || error.status >= 500) {
      const retryCount = error.config.__retryCount || 0;
      
      if (retryCount < 3) {
        console.log(`Retrying request (${retryCount + 1}/3)...`);
        
        // Increment retry count
        const newConfig = {
          ...error.config,
          __retryCount: retryCount + 1,
        };
        
        // Create a new API gateway instance for the retry
        const tempGateway = createApiGateway({
          config: {
            baseUrl: 'https://osbackend-zl1h.onrender.com',
            timeout: 30000,
          },
          middlewares: [],
        });
        
        try {
          // Retry the request
          return await tempGateway.request<T>(newConfig);
        } catch (retryError) {
          return retryError as ApiError;
        }
      }
    }
    
    return error;
  }
};

/**
 * Create an API Gateway instance for the Render backend
 */
export function createRenderBackendClient(): ApiGatewayInterface {
  return createApiGateway({
    config: {
      baseUrl: 'https://osbackend-zl1h.onrender.com',
      timeout: 30000,
      retries: 3,
      debug: process.env.NODE_ENV !== 'production',
    },
    middlewares: [
      authMiddleware,
      loggingMiddleware,
      retryMiddleware,
    ],
  });
}

/**
 * Example usage of the Render backend client
 */
async function exampleUsage() {
  const apiClient = createRenderBackendClient();
  
  try {
    // Get market data
    const marketData = await apiClient.get('/api/market/insights');
    console.log('Market data:', marketData);
    
    // Get procedure details
    const procedureId = '123';
    const procedureDetails = await apiClient.get(`/api/procedures/${procedureId}`);
    console.log('Procedure details:', procedureDetails);
    
    // Create a new record
    const newRecord = await apiClient.post('/api/records', {
      name: 'New Record',
      category: 'Test',
      value: 100,
    });
    console.log('New record created:', newRecord);
    
    // Update a record
    const updatedRecord = await apiClient.put(`/api/records/${newRecord.id}`, {
      value: 200,
    });
    console.log('Record updated:', updatedRecord);
    
    // Delete a record
    await apiClient.delete(`/api/records/${newRecord.id}`);
    console.log('Record deleted');
    
  } catch (error) {
    console.error('API error:', error);
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  exampleUsage().catch(console.error);
}
