import apiClient from './apiClient';
import type { DashboardResponse } from '@/types/dashboard';

export const dashboardApi = {
  async getStats(): Promise<DashboardResponse> {
    const response = await apiClient.get<DashboardResponse>('/dashboard');
    return response.data;
  },
};
