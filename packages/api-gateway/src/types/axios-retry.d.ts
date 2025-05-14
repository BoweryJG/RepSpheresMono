declare module 'axios-retry' {
  import { AxiosInstance, AxiosError } from 'axios';

  export interface IAxiosRetryConfig {
    /**
     * The number of times to retry the request
     */
    retries?: number;
    /**
     * A callback to further control if a request should be retried
     */
    retryCondition?: (error: AxiosError) => boolean;
    /**
     * A callback to determine the delay between retry requests
     */
    retryDelay?: (retryCount: number, error: AxiosError) => number;
    /**
     * A callback to determine if we should retry with an alternative baseURL for ECONNREFUSED errors
     */
    shouldResetTimeout?: boolean;
    /**
     * Defines if the timeout should be reset between retries
     */
    retryableError?: (error: AxiosError) => boolean;
  }

  // Main function and its properties
  function axiosRetry(
    axios: AxiosInstance,
    config?: IAxiosRetryConfig
  ): void;

  // Add properties to the function
  namespace axiosRetry {
    export function isNetworkError(error: AxiosError): boolean;
    export function isRetryableError(error: AxiosError): boolean;
    export function isSafeRequestError(error: AxiosError): boolean;
    export function isIdempotentRequestError(error: AxiosError): boolean;
    export function isNetworkOrIdempotentRequestError(error: AxiosError): boolean;
    export function exponentialDelay(retryNumber: number): number;
  }

  export = axiosRetry;
}
