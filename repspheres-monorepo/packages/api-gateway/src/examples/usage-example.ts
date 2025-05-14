import { ApiGateway } from '../gateway';
import { ApiGatewayConfig, ApiResponse } from '../types';

/**
 * Example of creating and using the API Gateway
 */
async function apiGatewayExample() {
  // 1. Create a configuration for the API Gateway
  const config: ApiGatewayConfig = {
    baseURL: 'https://osbackend-zl1h.onrender.com',
    timeout: 10000,
    headers: {
      'Authorization': 'Bearer YOUR_TOKEN_HERE',
      'X-Client-Version': '1.0.0',
    },
    debug: true,
    retryConfig: {
      maxRetries: 3,
      retryDelay: 1000,
      retryStatusCodes: [408, 429, 500, 502, 503, 504],
    },
    middleware: {
      request: [
        // Add request timestamp
        (config) => {
          if (config.headers) {
            config.headers['X-Request-Time'] = new Date().toISOString();
          }
          return config;
        },
        // Add correlation ID
        (config) => {
          const correlationId = `req-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
          if (config.headers) {
            config.headers['X-Correlation-ID'] = correlationId;
          }
          return config;
        },
      ],
      response: [
        // Log response time
        (response) => {
          const requestTime = response.config.headers?.['X-Request-Time'];
          if (requestTime) {
            const responseTime = Date.now() - new Date(requestTime as string).getTime();
            console.log(`Request to ${response.config.url} completed in ${responseTime}ms`);
          }
          return response;
        },
      ],
      error: [
        // Handle specific error types
        (error) => {
          if (error.response?.status === 401) {
            console.error('Authentication error - token may have expired');
            // Here you could trigger a token refresh or redirect to login
          }
          return Promise.reject(error);
        },
      ],
    },
  };

  // 2. Create the API Gateway instance
  const apiGateway = new ApiGateway(config);

  // 3. Use the API Gateway to make requests
  try {
    // GET request example
    const getUsersResponse: ApiResponse<any[]> = await apiGateway.get('/api/users', {
      params: {
        limit: 10,
        offset: 0,
      },
    });

    if (getUsersResponse.success) {
      console.log('Users:', getUsersResponse.data);
    } else {
      console.error('Failed to get users:', getUsersResponse.error);
    }

    // POST request example
    const createUserResponse = await apiGateway.post('/api/users', {
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'user',
    });

    if (createUserResponse.success) {
      console.log('User created:', createUserResponse.data);
    } else {
      console.error('Failed to create user:', createUserResponse.error);
    }

    // PUT request example
    const updateUserResponse = await apiGateway.put('/api/users/123', {
      name: 'John Updated',
      role: 'admin',
    });

    if (updateUserResponse.success) {
      console.log('User updated:', updateUserResponse.data);
    } else {
      console.error('Failed to update user:', updateUserResponse.error);
    }

    // DELETE request example
    const deleteUserResponse = await apiGateway.delete('/api/users/123');

    if (deleteUserResponse.success) {
      console.log('User deleted successfully');
    } else {
      console.error('Failed to delete user:', deleteUserResponse.error);
    }

    // 4. Update configuration if needed
    apiGateway.updateConfig({
      baseURL: 'https://new-api-endpoint.example.com',
      headers: {
        'X-New-Header': 'new-value',
      },
    });

    // Make a request with the updated configuration
    const newApiResponse = await apiGateway.get('/api/status');
    console.log('New API status:', newApiResponse.data);

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

/**
 * Example of creating a specialized API client using the API Gateway
 */
class UserApiClient {
  private apiGateway: ApiGateway;

  constructor(baseURL: string, authToken?: string) {
    // Create a specialized configuration for user-related APIs
    const config: ApiGatewayConfig = {
      baseURL,
      timeout: 5000,
      headers: {
        ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
      },
    };

    this.apiGateway = new ApiGateway(config);
  }

  /**
   * Get all users
   */
  async getUsers(limit: number = 10, offset: number = 0): Promise<any[]> {
    const response = await this.apiGateway.get('/api/users', {
      params: { limit, offset },
    });

    if (!response.success) {
      throw new Error(`Failed to get users: ${response.error?.message}`);
    }

    return response.data;
  }

  /**
   * Get a user by ID
   */
  async getUserById(id: string): Promise<any> {
    const response = await this.apiGateway.get(`/api/users/${id}`);

    if (!response.success) {
      throw new Error(`Failed to get user ${id}: ${response.error?.message}`);
    }

    return response.data;
  }

  /**
   * Create a new user
   */
  async createUser(userData: { name: string; email: string; role?: string }): Promise<any> {
    const response = await this.apiGateway.post('/api/users', userData);

    if (!response.success) {
      throw new Error(`Failed to create user: ${response.error?.message}`);
    }

    return response.data;
  }

  /**
   * Update a user
   */
  async updateUser(id: string, userData: Partial<{ name: string; email: string; role: string }>): Promise<any> {
    const response = await this.apiGateway.put(`/api/users/${id}`, userData);

    if (!response.success) {
      throw new Error(`Failed to update user ${id}: ${response.error?.message}`);
    }

    return response.data;
  }

  /**
   * Delete a user
   */
  async deleteUser(id: string): Promise<void> {
    const response = await this.apiGateway.delete(`/api/users/${id}`);

    if (!response.success) {
      throw new Error(`Failed to delete user ${id}: ${response.error?.message}`);
    }
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string): void {
    this.apiGateway.updateConfig({
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }
}

/**
 * Example of using the specialized API client
 */
async function userApiClientExample() {
  try {
    // Create a user API client
    const userClient = new UserApiClient('https://osbackend-zl1h.onrender.com', 'YOUR_AUTH_TOKEN');

    // Get all users
    const users = await userClient.getUsers(20, 0);
    console.log('Users:', users);

    // Get a specific user
    const user = await userClient.getUserById('123');
    console.log('User:', user);

    // Create a new user
    const newUser = await userClient.createUser({
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      role: 'editor',
    });
    console.log('New user created:', newUser);

    // Update the user
    const updatedUser = await userClient.updateUser(newUser.id, {
      role: 'admin',
    });
    console.log('User updated:', updatedUser);

    // Delete the user
    await userClient.deleteUser(newUser.id);
    console.log('User deleted successfully');

  } catch (error) {
    console.error('API client error:', error);
  }
}

// Run the examples
// apiGatewayExample();
// userApiClientExample();

export { apiGatewayExample, userApiClientExample };
