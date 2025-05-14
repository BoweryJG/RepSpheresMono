import type { AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * Custom Axios Instance interface that matches the structure we need
 */
export interface CustomAxiosInstance {
  defaults: {
    headers: {
      common: Record<string, string>;
      delete: Record<string, string>;
      get: Record<string, string>;
      head: Record<string, string>;
      post: Record<string, string>;
      put: Record<string, string>;
      patch: Record<string, string>;
      [key: string]: any;
    };
    [key: string]: any;
  };
  interceptors: {
    request: any;
    response: any;
  };
  request<T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  head<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  options<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  getUri(config?: AxiosRequestConfig): string;
}
