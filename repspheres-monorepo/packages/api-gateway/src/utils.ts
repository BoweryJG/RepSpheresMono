import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { ApiGatewayResponse, HealthCheckResponse } from './types';

/**
 * Generate a unique request ID
 */
export const generateRequestId = (): string => {
  return uuidv4();
};

/**
 * Format an API Gateway response
 */
export const formatResponse = (
  data: any,
  status: number,
  error?: string,
  responseTime?: number
): ApiGatewayResponse => {
  const requestId = generateRequestId();
  
  return {
    data,
    status,
    headers: {},
    requestId,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Handle API errors
 */
export const handleApiError = (error: AxiosError | Error): ApiGatewayResponse => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    const status = axiosError.response?.status || 500;
    const errorMessage = axiosError.response?.data && typeof axiosError.response.data === 'object' && 'message' in axiosError.response.data 
      ? (axiosError.response.data as any).message 
      : axiosError.message;
    
    return formatResponse(undefined, status, errorMessage);
  }
  
  return formatResponse(undefined, 500, error.message);
};

/**
 * Check if a URL is valid
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Create a health check response
 */
export const createHealthCheckResponse = (
  backendStatus: 'up' | 'down' | 'degraded',
  responseTime?: number,
  error?: string,
  circuitBreakerStatus?: 'closed' | 'open' | 'half-open',
  failures?: number
): HealthCheckResponse => {
  let status: 'healthy' | 'degraded' | 'unhealthy';
  
  if (backendStatus === 'up' && (!circuitBreakerStatus || circuitBreakerStatus === 'closed')) {
    status = 'healthy';
  } else if (backendStatus === 'down' || circuitBreakerStatus === 'open') {
    status = 'unhealthy';
  } else {
    status = 'degraded';
  }
  
  const response: HealthCheckResponse = {
    status,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    backend: {
      status: backendStatus,
      responseTime,
      error,
    },
  };
  
  if (circuitBreakerStatus) {
    response.circuitBreaker = {
      status: circuitBreakerStatus,
      failures,
    };
  }
  
  return response;
};

/**
 * Retry a function with exponential backoff
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 300
): Promise<T> => {
  let retries = 0;
  
  while (true) {
    try {
      return await fn();
    } catch (error) {
      if (retries >= maxRetries) {
        throw error;
      }
      
      const delayMs = baseDelayMs * Math.pow(2, retries);
      retries++;
      
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
};

/**
 * Measure execution time of a function
 */
export const measureExecutionTime = async <T>(fn: () => Promise<T>): Promise<[T, number]> => {
  const startTime = Date.now();
  const result = await fn();
  const endTime = Date.now();
  
  return [result, endTime - startTime];
};
