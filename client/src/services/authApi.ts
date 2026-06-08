import apiClient from './apiClient';
import { User } from '@/types';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

interface RegisterResponse {
  token: string;
  user: User;
}

export const authApi = {
  // Login
  login: async (credentials: LoginRequest) => {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Register
  register: async (data: RegisterRequest) => {
    try {
      const response = await apiClient.post<RegisterResponse>('/auth/register', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Verify token
  verifyToken: async () => {
    try {
      const response = await apiClient.get<User>('/auth/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Logout (clears token on backend if needed)
  logout: async () => {
    try {
      return await apiClient.post('/auth/logout', {});
    } catch (error) {
      throw error;
    }
  },

  // Forgot password
  forgotPassword: async (email: string) => {
    try {
      return await apiClient.post('/auth/forgot-password', { email });
    } catch (error) {
      throw error;
    }
  },

  // Reset password
  resetPassword: async (token: string, password: string) => {
    try {
      return await apiClient.post('/auth/reset-password', { token, password });
    } catch (error) {
      throw error;
    }
  },
};
