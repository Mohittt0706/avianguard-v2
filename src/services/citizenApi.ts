import apiClient from './apiClient';
import type { Citizen, CitizenWithDetails, CitizenStats, CitizenAnalytics, CitizenAlertNotification, EmergencyBroadcastResult, DeliveryStats, NotificationInboxResponse } from '@/types/citizen';

export interface CitizenListResponse {
  success: boolean;
  data: {
    citizens: Citizen[];
    pagination: { page: number; limit: number; total: number; pages: number };
  };
}

export interface CitizenResponse {
  success: boolean;
  data: { citizen: CitizenWithDetails };
}

export const citizenApi = {
  getAll(params?: Record<string, string>): Promise<CitizenListResponse> {
    return apiClient.get('/citizens', { params }).then(r => r.data);
  },

  getById(id: string): Promise<CitizenResponse> {
    return apiClient.get(`/citizens/${id}`).then(r => r.data);
  },

  create(data: Partial<Citizen>): Promise<{ success: boolean; data: { citizen: Citizen }; message: string }> {
    return apiClient.post('/citizens', data).then(r => r.data);
  },

  publicRegister(data: Partial<Citizen>): Promise<{ success: boolean; data: { citizen: Citizen }; message: string }> {
    return apiClient.post('/citizens/public-register', data).then(r => r.data);
  },

  update(id: string, data: Partial<Citizen>): Promise<{ success: boolean; data: { citizen: Citizen }; message: string }> {
    return apiClient.put(`/citizens/${id}`, data).then(r => r.data);
  },

  delete(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete(`/citizens/${id}`).then(r => r.data);
  },

  updateStatus(id: string, status: string, reason?: string): Promise<{ success: boolean; data: { citizen: Citizen }; message: string }> {
    return apiClient.patch(`/citizens/${id}/status`, { status, reason }).then(r => r.data);
  },

  bulkAction(ids: string[], action: string, data?: Record<string, string>): Promise<{ success: boolean; data: { affected: number } }> {
    return apiClient.post('/citizens/bulk-status', { ids, action, data }).then(r => r.data);
  },

  getStats(): Promise<{ success: boolean; data: CitizenStats }> {
    return apiClient.get('/citizens/stats').then(r => r.data);
  },

  getAnalytics(): Promise<{ success: boolean; data: CitizenAnalytics }> {
    return apiClient.get('/citizens/analytics').then(r => r.data);
  },

  getDeliveryStats(): Promise<{ success: boolean; data: DeliveryStats }> {
    return apiClient.get('/citizens/delivery-stats').then(r => r.data);
  },

  sendAlert(id: string, data: { title: string; severity: string; message: string; wetland?: string; language?: string; deliveryMethod?: string; alertType?: string; description?: string; recommendedAction?: string }): Promise<{ success: boolean; data: { notification: CitizenAlertNotification }; message: string }> {
    return apiClient.post(`/citizens/${id}/send-alert`, data).then(r => r.data);
  },

  sendTestAlert(id: string, methods: string[]): Promise<{ success: boolean; message: string }> {
    return apiClient.post(`/citizens/${id}/test-alert`, { methods }).then(r => r.data);
  },

  requestInfo(id: string, message: string): Promise<{ success: boolean; message: string }> {
    return apiClient.post(`/citizens/${id}/request-info`, { message }).then(r => r.data);
  },

  getNotifications(id: string, limit?: number): Promise<{ success: boolean; data: CitizenAlertNotification[] }> {
    return apiClient.get(`/citizens/${id}/notifications`, { params: { limit } }).then(r => r.data);
  },

  emergencyBroadcast(data: { wetland: string; title: string; severity: string; message: string; language?: string; deliveryMethod?: string; alertType?: string; description?: string; recommendedAction?: string }): Promise<{ success: boolean; data: EmergencyBroadcastResult; message: string }> {
    return apiClient.post('/citizens/emergency-broadcast', data).then(r => r.data);
  },

  exportData(format: string, filters?: Record<string, string>): Promise<{ success: boolean; data: { data: Citizen[]; format: string } }> {
    return apiClient.post('/citizens/export', { format, ...filters }).then(r => r.data);
  },

  saveFcmToken(data: { mobile?: string; citizenId?: string; token: string }): Promise<{ success: boolean; message: string }> {
    return apiClient.post('/citizens/fcm-token', data).then(r => r.data);
  },

  getNotificationInbox(mobile: string): Promise<{ success: boolean; data: NotificationInboxResponse }> {
    return apiClient.post('/citizens/notifications/inbox', { mobile }).then(r => r.data);
  },

  markAsRead(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient.patch(`/citizens/${id}/read`).then(r => r.data);
  },

  acknowledgeNotification(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient.patch(`/citizens/${id}/acknowledge`).then(r => r.data);
  },
};
