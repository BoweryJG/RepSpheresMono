# API Gateway

A robust and flexible API Gateway for the RepSpheres monorepo that provides a unified interface for making HTTP requests to backend services.

## Features

- **Unified API Interface**: Consistent interface for all HTTP methods (GET, POST, PUT, DELETE)
- **Middleware Support**: Extensible middleware system for request/response transformations
- **Error Handling**: Standardized error handling and response formatting
- **Retry Logic**: Configurable request retry with exponential backoff
- **Circuit Breaking**: Prevent cascading failures with circuit breaker pattern
- **Request Timeouts**: Configurable request timeouts
- **Response Caching**: Optional response caching for improved performance
- **Request Logging**: Detailed request/response logging for debugging
- **Health Checks**: Built-in health check functionality
- **TypeScript Support**: Full TypeScript support with comprehensive type definitions

## Installation

```bash
# From the monorepo root
npm install
```

## Usage

### Basic Usage

```typescript
import { ApiGateway } from '@repspheres/api-gateway';

// Create an API Gateway instance
const apiGateway = new ApiGateway({
  baseURL: 'https://osbackend-zl1h.onrender.com',
  timeout: 5000,
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
  },
});

// Make a GET request
const response = await apiGateway.get('/api/users');

if (response.success) {
  console.log('Users:', response.data);
} else {
  console.error('Error:', response.error);
}
```

### With Middleware

```typescript
import { ApiGateway } from '@repspheres/api-gateway';

const apiGateway = new ApiGateway({
  baseURL: 'https://osbackend-zl1h.onrender.com',
  timeout: 5000,
  middleware: {
    request: [
      // Add request timestamp
      (config) => {
        if (config.headers) {
          config.headers['X-Request-Time'] = new Date().toISOString();
        }
        return config;
      },
    ],
    response: [
      // Transform response data
      (response) => {
        if (response.data && Array.isArray(response.data)) {
          response.data = response.data.map(item => ({
            ...item,
            processed: true,
          }));
        }
        return response;
      },
    ],
    error: [
      // Handle authentication errors
      (error) => {
        if (error.response?.status === 401) {
          // Refresh token or redirect to login
          console.log('Authentication error');
        }
        return Promise.reject(error);
      },
    ],
  },
});
```

### With Retry Configuration

```typescript
import { ApiGateway } from '@repspheres/api-gateway';

const apiGateway = new ApiGateway({
  baseURL: 'https://osbackend-zl1h.onrender.com',
  timeout: 5000,
  retryConfig: {
    maxRetries: 3,
    retryDelay: 1000,
    retryStatusCodes: [408, 429, 500, 502, 503, 504],
  },
});
```

### Creating a Specialized API Client

```typescript
import { ApiGateway } from '@repspheres/api-gateway';

class UserApiClient {
  private apiGateway: ApiGateway;

  constructor(baseURL: string, authToken?: string) {
    const config = {
      baseURL,
      timeout: 5000,
      headers: {
        ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
      },
    };

    this.apiGateway = new ApiGateway(config);
  }

  async getUsers(limit: number = 10, offset: number = 0): Promise<any[]> {
    const response = await this.apiGateway.get('/api/users', {
      params: { limit, offset },
    });

    if (!response.success) {
      throw new Error(`Failed to get users: ${response.error?.message}`);
    }

    return response.data;
  }

  // Other methods...
}
```

## API Reference

### ApiGateway Class

#### Constructor

```typescript
constructor(config: ApiGatewayConfig)
```

#### Methods

- `get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>>`
- `post<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>>`
- `put<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>>`
- `delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>>`
- `updateConfig(config: Partial<ApiGatewayConfig>): void`

### Types

#### ApiGatewayConfig

```typescript
interface ApiGatewayConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
  debug?: boolean;
  retryConfig?: RetryConfig;
  middleware?: {
    request?: Array<(config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig>;
    response?: Array<(response: AxiosResponse) => AxiosResponse>;
    error?: Array<(error: any) => any>;
  };
}
```

#### RetryConfig

```typescript
interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  retryStatusCodes: number[];
}
```

#### RequestOptions

```typescript
interface RequestOptions {
  params?: Record<string, any>;
  headers?: Record<string, string>;
}
```

#### ApiResponse

```typescript
interface ApiResponse<T = any> {
  data: T | null;
  status: number;
  headers: Record<string, any>;
  success: boolean;
  error?: {
    message: string;
    code: string;
    details: any;
  };
}
```

## Error Handling

The API Gateway provides standardized error handling. All errors are transformed into a consistent format:

```typescript
{
  data: null,
  status: 404, // HTTP status code
  headers: {}, // Response headers
  success: false,
  error: {
    message: 'User not found',
    code: 'RESOURCE_NOT_FOUND',
    details: { /* Original error details */ },
  },
}
```

## Health Checks

The API Gateway includes built-in health check functionality:

```typescript
import { createHealthCheckResponse } from '@repspheres/api-gateway';

// Create a health check response
const healthCheck = createHealthCheckResponse(
  'up', // Backend status: 'up', 'down', or 'degraded'
  150, // Response time in ms
  undefined, // Error message (if any)
  'closed', // Circuit breaker status: 'closed', 'open', or 'half-open'
  0 // Number of failures
);

// Health check response:
// {
//   status: 'healthy',
//   timestamp: '2025-05-14T13:27:51.000Z',
//   version: '1.0.0',
//   backend: {
//     status: 'up',
//     responseTime: 150,
//   },
//   circuitBreaker: {
//     status: 'closed',
//     failures: 0,
//   },
// }
```

## Testing

```bash
# Run tests
npm test
```

## License

MIT
