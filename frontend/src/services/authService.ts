import { apiService, ApiResponse } from './api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  status: 'active' | 'blocked' | 'pending';
  phoneNumber?: string;
  address?: string;
  membershipType?: string;
  joinDate: string;
  lastActive?: string;
  preferences?: {
    favoriteCategories: string[];
    notifications: {
      email: boolean;
      sms: boolean;
      overdue: boolean;
    };
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
  address?: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export const authService = {
  // Login
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>('/auth/login', credentials);
    console.log('Login response:', response.data);
    
    // Store tokens and user data
    localStorage.setItem('accessToken', response.data.tokens.accessToken);
    localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    return response.data;
  },

  // Register
  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>('/auth/register', userData);
    
    // Store tokens and user data
    localStorage.setItem('accessToken', response.data.tokens.accessToken);
    localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    return response.data;
  },

  // Logout
  async logout(): Promise<void> {
    try {
      await apiService.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API call failed:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  // Logout from all devices
  async logoutAll(): Promise<void> {
    try {
      await apiService.post('/auth/logout-all');
    } catch (error) {
      console.error('Logout all API call failed:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  // Refresh token
  async refreshToken(): Promise<AuthTokens> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiService.post<AuthTokens>('/auth/refresh', {
      refreshToken,
    });

    // Update stored tokens
    localStorage.setItem('accessToken', response.data.accessToken);
    localStorage.setItem('refreshToken', response.data.refreshToken);

    return response.data;
  },

  // Get current user profile
  async getProfile(): Promise<User> {
    const response = await apiService.get<User>('/auth/profile');
    
    // Update stored user data
    localStorage.setItem('user', JSON.stringify(response.data));
    
    return response.data;
  },

  // Update profile
  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await apiService.put<User>('/users/profile', userData);
    
    // Update stored user data
    localStorage.setItem('user', JSON.stringify(response.data));
    
    return response.data;
  },

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiService.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  },

  // Verify token
  async verifyToken(): Promise<boolean> {
    try {
      await apiService.get('/auth/verify');
      return true;
    } catch (error) {
      return false;
    }
  },

  // Get stored user
  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
    return null;
  },

  // Get stored token
  getStoredToken(): string | null {
    return localStorage.getItem('accessToken');
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getStoredToken();
    const user = this.getStoredUser();
    return !!(token && user);
  },

  // Check if user is admin
  isAdmin(): boolean {
    const user = this.getStoredUser();
    return user?.role === 'admin';
  },

  // Check if user account is active
  isActive(): boolean {
    const user = this.getStoredUser();
    return user?.status === 'active';
  },

  // Forgot password
  async forgotPassword(email: string): Promise<void> {
    await apiService.post('/auth/forgot-password', { email });
  },

  // Reset password
  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiService.post('/auth/reset-password', { token, newPassword });
  },
};

export default authService;
