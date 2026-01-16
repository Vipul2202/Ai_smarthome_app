import { authStorage } from './storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';

interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await authStorage.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async uploadFile<T>(endpoint: string, file: any, additionalData?: any): Promise<ApiResponse<T>> {
    try {
      const token = await authStorage.getToken();
      const formData = new FormData();
      
      formData.append('file', {
        uri: file.uri,
        type: file.type || 'image/jpeg',
        name: file.name || 'upload.jpg',
      } as any);

      if (additionalData) {
        Object.keys(additionalData).forEach(key => {
          formData.append(key, additionalData[key]);
        });
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('File upload failed:', error);
      throw error;
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// Specific API endpoints
export const api = {
  // Auth endpoints
  auth: {
    login: (email: string, password: string) =>
      apiClient.post('/auth/login', { email, password }),
    register: (name: string, email: string, password: string) =>
      apiClient.post('/auth/register', { name, email, password }),
    logout: () => apiClient.post('/auth/logout'),
    refreshToken: () => apiClient.post('/auth/refresh'),
    forgotPassword: (email: string) =>
      apiClient.post('/auth/forgot-password', { email }),
    resetPassword: (token: string, password: string) =>
      apiClient.post('/auth/reset-password', { token, password }),
  },

  // User endpoints
  user: {
    getProfile: () => apiClient.get('/user/profile'),
    updateProfile: (data: any) => apiClient.put('/user/profile', data),
    uploadAvatar: (file: any) => apiClient.uploadFile('/user/avatar', file),
    deleteAccount: () => apiClient.delete('/user/account'),
  },

  // Upload endpoints
  upload: {
    image: (file: any, metadata?: any) =>
      apiClient.uploadFile('/upload/image', file, metadata),
    receipt: (file: any) => apiClient.uploadFile('/upload/receipt', file),
    avatar: (file: any) => apiClient.uploadFile('/upload/avatar', file),
  },

  // OCR endpoints
  ocr: {
    processReceipt: (file: any) => apiClient.uploadFile('/ocr/receipt', file),
    processInventory: (file: any) => apiClient.uploadFile('/ocr/inventory', file),
  },

  // Barcode endpoints
  barcode: {
    lookup: (barcode: string) => apiClient.get(`/barcode/${barcode}`),
    scan: (file: any) => apiClient.uploadFile('/barcode/scan', file),
  },

  // Health check
  health: () => apiClient.get('/health'),
};

// Error handling utilities
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const handleApiError = (error: any): ApiError => {
  if (error instanceof ApiError) {
    return error;
  }

  if (error.response) {
    // Server responded with error status
    return new ApiError(
      error.response.data?.message || 'Server error',
      error.response.status,
      error.response.data?.code,
      error.response.data
    );
  }

  if (error.request) {
    // Network error
    return new ApiError('Network error', 0, 'NETWORK_ERROR');
  }

  // Other error
  return new ApiError(error.message || 'Unknown error', 0, 'UNKNOWN_ERROR');
};

// Request interceptors for common functionality
export const setupApiInterceptors = () => {
  // Add request/response interceptors here if needed
  // This could include automatic token refresh, error handling, etc.
};