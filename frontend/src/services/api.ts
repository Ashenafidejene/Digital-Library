import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL;

// Debug logging
console.log('🔧 API Configuration:', {
  REACT_APP_API_URL: process.env.REACT_APP_API_URL,
  API_BASE_URL,
  NODE_ENV: process.env.NODE_ENV
});

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  //timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    console.log('--- Request Interceptor ---');
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Token added to request headers.');
    } else {
      console.log('No token found in localStorage.');
    }
    console.log('Request Config:', config);
    return config;
  },
  (error) => {
    console.error('Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('--- Response Interceptor ---');
    console.log('Response:', response);
    return response;
  },
  async (error) => {
    console.log('--- Response Interceptor Error ---');
    console.error('Response Error:', error.response);
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log('401 Error: Attempting to refresh token.');

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          console.log('Found refreshToken, sending to /auth/refresh.');
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });
          console.log('Token refresh response:', response);

          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          localStorage.setItem('accessToken', accessToken);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }
          console.log('New accessToken and refreshToken stored.');

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          console.log('Retrying original request with new token.');
          return api(originalRequest);
        } else {
          console.log('No refreshToken found. Redirecting to login.');
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Paginated response structure (for endpoints that return paginated data)
export interface PaginatedApiResponse<T = any> {
  success: boolean;
  message: string;
  data: {
    data: T[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

// Generic API methods
export const apiService = {
  // GET request
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await api.get<ApiResponse<T>>(url, config);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  },

  // POST request
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const headers: any = { ...config?.headers };
      if (data instanceof FormData) {
        headers['Content-Type'] = 'multipart/form-data';
      }
      const response = await api.post<ApiResponse<T>>(url, data, { ...config, headers });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  },

  // PUT request
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const headers: any = { ...config?.headers };
      if (data instanceof FormData) {
        headers['Content-Type'] = 'multipart/form-data';
      }
      const response = await api.put<ApiResponse<T>>(url, data, { ...config, headers });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  },

  // DELETE request
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await api.delete<ApiResponse<T>>(url, config);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  },

  // Error handler
  handleError(error: any): ApiError {
    if (error.response) {
      // Server responded with error status
      return {
        message: error.response.data?.message || 'An error occurred',
        errors: error.response.data?.errors,
        statusCode: error.response.status,
      };
    } else if (error.request) {
      // Network error - redirect to connection error page
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/connection-error')) {
        window.location.href = '/connection-error';
      }
      return {
        message: 'Network error. Please check your connection.',
        statusCode: 0,
      };
    } else {
      // Other error
      return {
        message: error.message || 'An unexpected error occurred',
      };
    }
  },
};

// Generic API request function for backward compatibility
export const apiRequest = async <T>(
  url: string,
  options: { method?: string; body?: string } = {}
): Promise<ApiResponse<T>> => {
  const { method = 'GET', body } = options;

  try {
    let response;
    const parsedBody = body ? JSON.parse(body) : undefined;
    switch (method.toUpperCase()) {
      case 'GET':
        response = await api.get<ApiResponse<T>>(url);
        break;
      case 'POST':
        response = await api.post<ApiResponse<T>>(url, parsedBody);
        break;
      case 'PUT':
        response = await api.put<ApiResponse<T>>(url, parsedBody);
        break;
      case 'DELETE':
        response = await api.delete<ApiResponse<T>>(url);
        break;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }
    return response.data;
  } catch (error: any) {
    throw apiService.handleError(error);
  }
};

export default api;
