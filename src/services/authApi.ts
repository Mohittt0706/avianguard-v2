import apiClient from './apiClient';
import type { LoginCredentials, LoginResponse, User } from '@/types/auth';

export const authApi = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await apiClient.post('/auth/login', {
        email: credentials.email,
        password: credentials.password,
      });
      return {
        user: response.data.data.user,
        token: response.data.data.accessToken,
        refreshToken: response.data.data.refreshToken,
      };
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      const message = axiosError?.response?.data?.message || 'Login failed. Please check your credentials.';
      throw new Error(message);
    }
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  async refreshSession(): Promise<LoginResponse> {
    const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    return {
      user: response.data.data.user,
      token: response.data.data.accessToken,
      refreshToken: response.data.data.refreshToken,
    };
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get('/auth/me');
    return response.data.data.user;
  },

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post('/auth/forgot-password', { email });
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await apiClient.post('/auth/reset-password', { token, password });
  },

  checkPermission(user: User, resource: string, action: string): boolean {
    const required = `${resource}:${action}`;
    return user.permissions.length === 0 || user.permissions.includes(required);
  },
};
