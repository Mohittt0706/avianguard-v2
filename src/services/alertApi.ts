import apiClient from './apiClient';
import type {
  AlertListResponse,
  AlertResponse,
  AlertStatsResponse,
  AlertStats,
} from '@/types/alert';

export const alertApi = {
  getAll(params?: Record<string, string>): Promise<AlertListResponse> {
    return apiClient.get('/alerts', { params }).then(r => r.data);
  },

  getById(id: string): Promise<AlertResponse> {
    return apiClient.get(`/alerts/${id}`).then(r => r.data);
  },

  create(data: {
    sensorId?: string;
    sensorName?: string;
    wetland?: string;
    alertType: string;
    severity: string;
    currentValue?: number;
    safeRange?: string;
    description: string;
  }): Promise<AlertResponse> {
    return apiClient.post('/alerts', data).then(r => r.data);
  },

  acknowledge(id: string): Promise<AlertResponse> {
    return apiClient.patch(`/alerts/${id}/acknowledge`).then(r => r.data);
  },

  resolve(id: string, resolvedBy: string): Promise<AlertResponse> {
    return apiClient.patch(`/alerts/${id}/resolve`, { resolvedBy }).then(r => r.data);
  },

  markCitizenNotified(id: string): Promise<AlertResponse> {
    return apiClient.patch(`/alerts/${id}/citizen-notify`).then(r => r.data);
  },

  delete(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete(`/alerts/${id}`).then(r => r.data);
  },

  getStats(): Promise<AlertStatsResponse> {
    return apiClient.get('/alerts/stats').then(r => r.data);
  },
};
