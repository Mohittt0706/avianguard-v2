import apiClient from './apiClient';
import type { User, UserWithDetails, UserStats, LoginHistory, AuditLog } from '@/types/auth';

export interface UserListResponse {
  success: boolean;
  data: {
    users: User[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface UserResponse {
  success: boolean;
  data: { user: UserWithDetails };
  message?: string;
}

export interface UserStatsResponse {
  success: boolean;
  data: UserStats;
}

export const userApi = {
  getAll(params?: Record<string, string>): Promise<UserListResponse> {
    return apiClient.get('/users', { params }).then(r => r.data);
  },

  getById(id: string): Promise<UserResponse> {
    return apiClient.get(`/users/${id}`).then(r => r.data);
  },

  create(data: {
    name: string;
    email: string;
    password: string;
    role: string;
    district?: string;
    taluka?: string;
    assignedWetland?: string;
    phone?: string;
    employeeId?: string;
    department?: string;
    designation?: string;
    address?: string;
    accountStatus?: string;
    permissions?: Record<string, string[]>;
  }): Promise<{ success: boolean; data: { user: User }; message: string }> {
    return apiClient.post('/users', data).then(r => r.data);
  },

  update(id: string, data: Partial<User>): Promise<{ success: boolean; data: { user: User }; message: string }> {
    return apiClient.patch(`/users/${id}`, data).then(r => r.data);
  },

  delete(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete(`/users/${id}`).then(r => r.data);
  },

  bulkAction(ids: string[], action: string, data?: Record<string, string>): Promise<{ success: boolean; data: { affected: number } }> {
    return apiClient.post('/users/bulk', { ids, action, data }).then(r => r.data);
  },

  resetPassword(id: string): Promise<{ success: boolean; data: { tempPassword: string; email: string; name: string } }> {
    return apiClient.post(`/users/${id}/reset-password`).then(r => r.data);
  },

  toggleStatus(id: string): Promise<{ success: boolean; data: { user: User } }> {
    return apiClient.patch(`/users/${id}/toggle-status`).then(r => r.data);
  },

  uploadAvatar(id: string, file: File): Promise<{ success: boolean; data: { id: string; avatar: string } }> {
    const formData = new FormData();
    formData.append('avatar', file);
    return apiClient.post(`/users/${id}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },

  getStats(): Promise<UserStatsResponse> {
    return apiClient.get('/users/stats').then(r => r.data);
  },

  getLoginHistory(id: string): Promise<{ success: boolean; data: LoginHistory[] }> {
    return apiClient.get(`/users/${id}/login-history`).then(r => r.data);
  },

  getAuditLogs(id: string): Promise<{ success: boolean; data: AuditLog[] }> {
    return apiClient.get(`/users/${id}/audit-logs`).then(r => r.data);
  },

  getDepartments(): Promise<{ success: boolean; data: string[] }> {
    return apiClient.get('/users/departments').then(r => r.data);
  },
};
