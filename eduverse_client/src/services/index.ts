/* eslint-disable */
import { ApiResponse } from "../types/types";
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

declare global {
  interface Window {
    __APP_AREA?: string;
  }
}

export class ApiService {
  private static instance: ApiService;
  public api: AxiosInstance;

  private constructor() {
    this.api = axios.create({
      baseURL:
        process.env.NEXT_PUBLIC_API_URL + '/api' || 'http://localhost:3000/api',
      timeout: 0, // Không giới hạn thời gian chờ
    });

    this.api.interceptors.request.use((config) => {
      config.headers['x-client-area'] = window.__APP_AREA || 'dashboard';
      return config;
    });

    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('AccessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        const area = window.__APP_AREA || 'dashboard';
        if (area == 'dashboard' && error.response?.status === 401) {
          localStorage.removeItem('AccessToken');
          // store.dispatch(setShowLoginPopup(true));
          window.location.href = '/auth/login';
        }
        if (error.response?.status === 403) {
          window.location.href = '/frobiden';
          return;
        }
        return Promise.reject(error.response.data.title);
      }
    );
  }

  public static get api(): AxiosInstance {
    return this.api;
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  // Các phương thức API với kiểu dữ liệu trả về
  public async get<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.api.get(
      url,
      config
    );
    return response.data;
  }

  public async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.api.post(
      url,
      data,
      config
    );
    return response.data;
  }

  public async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.api.put(
      url,
      data,
      config
    );
    return response.data;
  }

  public async delete<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.api.delete(
      url,
      config
    );
    return response.data;
  }

  public async getBlob(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<Blob> {
    const response: AxiosResponse<Blob> = await this.api.get(url, {
      ...config,
      responseType: 'blob',
    });
    return response.data;
  }
}

export const apiService = ApiService.getInstance();
