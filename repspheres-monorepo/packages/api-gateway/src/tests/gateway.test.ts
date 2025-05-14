import axios from 'axios';
import { ApiGateway } from '../gateway';
import { ApiGatewayConfig } from '../types';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ApiGateway', () => {
  let gateway: ApiGateway;
  let config: ApiGatewayConfig;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup default config
    config = {
      baseURL: 'https://api.example.com',
      timeout: 5000,
      headers: {
        'X-API-Key': 'test-api-key',
      },
      debug: false,
    };

    // Mock axios create to return a mocked instance
    mockedAxios.create.mockReturnValue(mockedAxios);
    
    // Create gateway instance
    gateway = new ApiGateway(config);
  });

  describe('constructor', () => {
    it('should create an axios instance with the provided config', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://api.example.com',
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'test-api-key',
        },
      });
    });

    it('should set up request and response interceptors', () => {
      expect(mockedAxios.interceptors.request.use).toHaveBeenCalled();
      expect(mockedAxios.interceptors.response.use).toHaveBeenCalled();
    });
  });

  describe('HTTP methods', () => {
    it('should make a GET request', async () => {
      const responseData = { id: 1, name: 'Test' };
      mockedAxios.get.mockResolvedValueOnce({
        data: responseData,
        status: 200,
        headers: {},
        config: {},
        statusText: 'OK',
      });

      const result = await gateway.get('/users/1');

      expect(mockedAxios.get).toHaveBeenCalledWith('/users/1', {
        params: undefined,
        headers: undefined,
      });
      expect(result).toEqual({
        data: responseData,
        status: 200,
        headers: {},
        success: true,
      });
    });

    it('should make a POST request', async () => {
      const requestData = { name: 'New User' };
      const responseData = { id: 1, name: 'New User' };
      mockedAxios.post.mockResolvedValueOnce({
        data: responseData,
        status: 201,
        headers: {},
        config: {},
        statusText: 'Created',
      });

      const result = await gateway.post('/users', requestData);

      expect(mockedAxios.post).toHaveBeenCalledWith('/users', requestData, {
        params: undefined,
        headers: undefined,
      });
      expect(result).toEqual({
        data: responseData,
        status: 201,
        headers: {},
        success: true,
      });
    });

    it('should make a PUT request', async () => {
      const requestData = { name: 'Updated User' };
      const responseData = { id: 1, name: 'Updated User' };
      mockedAxios.put.mockResolvedValueOnce({
        data: responseData,
        status: 200,
        headers: {},
        config: {},
        statusText: 'OK',
      });

      const result = await gateway.put('/users/1', requestData);

      expect(mockedAxios.put).toHaveBeenCalledWith('/users/1', requestData, {
        params: undefined,
        headers: undefined,
      });
      expect(result).toEqual({
        data: responseData,
        status: 200,
        headers: {},
        success: true,
      });
    });

    it('should make a DELETE request', async () => {
      mockedAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 204,
        headers: {},
        config: {},
        statusText: 'No Content',
      });

      const result = await gateway.delete('/users/1');

      expect(mockedAxios.delete).toHaveBeenCalledWith('/users/1', {
        params: undefined,
        headers: undefined,
      });
      expect(result).toEqual({
        data: {},
        status: 204,
        headers: {},
        success: true,
      });
    });
  });

  describe('error handling', () => {
    it('should handle API errors', async () => {
      const errorResponse = {
        response: {
          data: { message: 'Not Found', code: 'RESOURCE_NOT_FOUND' },
          status: 404,
          headers: {},
        },
        message: 'Request failed with status code 404',
        config: { url: '/users/999' },
      };
      mockedAxios.get.mockRejectedValueOnce(errorResponse);

      const result = await gateway.get('/users/999');

      expect(result).toEqual({
        data: null,
        status: 404,
        headers: {},
        success: false,
        error: {
          message: 'Not Found',
          code: 'RESOURCE_NOT_FOUND',
          details: { message: 'Not Found', code: 'RESOURCE_NOT_FOUND' },
        },
      });
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network Error');
      mockedAxios.get.mockRejectedValueOnce(networkError);

      const result = await gateway.get('/users/1');

      expect(result).toEqual({
        data: null,
        status: 500,
        headers: {},
        success: false,
        error: {
          message: 'Network Error',
          code: 'UNKNOWN_ERROR',
          details: {},
        },
      });
    });
  });

  describe('updateConfig', () => {
    it('should update the API gateway configuration', () => {
      gateway.updateConfig({
        baseURL: 'https://new-api.example.com',
        timeout: 10000,
        headers: {
          'X-New-Header': 'new-value',
        },
      });

      expect(mockedAxios.defaults.baseURL).toBe('https://new-api.example.com');
      expect(mockedAxios.defaults.timeout).toBe(10000);
    });
  });

  describe('middleware', () => {
    it('should apply request middleware', async () => {
      const requestMiddleware = jest.fn((config) => {
        config.headers = { ...config.headers, 'X-Custom': 'custom-value' };
        return config;
      });

      const customConfig: ApiGatewayConfig = {
        ...config,
        middleware: {
          request: [requestMiddleware],
        },
      };

      const customGateway = new ApiGateway(customConfig);
      mockedAxios.get.mockResolvedValueOnce({
        data: {},
        status: 200,
        headers: {},
        config: {},
        statusText: 'OK',
      });

      await customGateway.get('/test');
      
      expect(requestMiddleware).toHaveBeenCalled();
    });

    it('should apply response middleware', async () => {
      const responseMiddleware = jest.fn((response) => {
        response.data = { ...response.data, modified: true };
        return response;
      });

      const customConfig: ApiGatewayConfig = {
        ...config,
        middleware: {
          response: [responseMiddleware],
        },
      };

      const customGateway = new ApiGateway(customConfig);
      mockedAxios.get.mockResolvedValueOnce({
        data: { original: true },
        status: 200,
        headers: {},
        config: {},
        statusText: 'OK',
      });

      await customGateway.get('/test');
      
      expect(responseMiddleware).toHaveBeenCalled();
    });
  });
});
