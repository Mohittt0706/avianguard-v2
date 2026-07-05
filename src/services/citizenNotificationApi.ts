import apiClient from './apiClient';
import type {
  CitizenNotificationListResponse,
  CitizenNotificationResponse,
  CitizenNotificationStatsResponse,
} from '@/types/citizenNotification';

export const citizenNotificationApi = {
  getAll(params?: Record<string, string>): Promise<CitizenNotificationListResponse> {
    return apiClient.get('/citizen-notifications', { params }).then(r => r.data);
  },

  getById(id: string): Promise<CitizenNotificationResponse> {
    return apiClient.get(`/citizen-notifications/${id}`).then(r => r.data);
  },

  create(data: {
    alertId?: string;
    alertTitle?: string;
    severity?: string;
    wetland?: string;
    sensorName?: string;
    description?: string;
    parameterValues?: Record<string, unknown>;
    aiSummary?: string;
    riskLevel?: string;
    recommendedActions?: string;
  }): Promise<CitizenNotificationResponse> {
    return apiClient.post('/citizen-notifications', data).then(r => r.data);
  },

  getStats(): Promise<CitizenNotificationStatsResponse> {
    return apiClient.get('/citizen-notifications/stats').then(r => r.data);
  },
};
