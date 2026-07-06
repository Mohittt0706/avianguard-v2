import apiClient from './apiClient';

export interface SettingEntry {
  key: string;
  value: unknown;
  label: string | null;
}

export interface SettingsByCategory {
  [category: string]: SettingEntry[];
}

export interface SystemHealth {
  [service: string]: { status: string; message: string; latency?: number; uptime?: number };
}

export interface AuditLogEntry {
  id: string;
  action: string;
  category: string;
  details: Record<string, unknown> | null;
  user_name: string | null;
  ipAddress: string | null;
  createdAt: string;
}

export const settingsApi = {
  getAll(category?: string): Promise<{ success: boolean; data: SettingsByCategory }> {
    return apiClient.get('/settings', { params: category ? { category } : {} }).then(r => r.data);
  },

  get(key: string): Promise<{ success: boolean; data: SettingEntry }> {
    return apiClient.get(`/settings/${key}`).then(r => r.data);
  },

  update(key: string, value: unknown): Promise<{ success: boolean; data: SettingEntry; message: string }> {
    return apiClient.put(`/settings/${key}`, { value }).then(r => r.data);
  },

  bulkUpdate(settings: { key: string; value: unknown }[]): Promise<{ success: boolean; message: string }> {
    return apiClient.put('/settings', { settings }).then(r => r.data);
  },

  reset(key: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete(`/settings/${key}`).then(r => r.data);
  },

  getAlertThresholds(): Promise<{ success: boolean; data: Record<string, number> }> {
    return apiClient.get('/settings/alert-thresholds').then(r => r.data);
  },

  updateAlertThresholds(thresholds: Record<string, number>): Promise<{ success: boolean; message: string }> {
    return apiClient.put('/settings/alert-thresholds', thresholds).then(r => r.data);
  },

  getSystemHealth(): Promise<{ success: boolean; data: SystemHealth }> {
    return apiClient.get('/settings/health').then(r => r.data);
  },

  getAuditLogs(limit?: number, offset?: number): Promise<{ success: boolean; data: AuditLogEntry[] }> {
    return apiClient.get('/settings/audit-logs', { params: { limit, offset } }).then(r => r.data);
  },

  logAudit(action: string, category: string, details?: Record<string, unknown>): Promise<{ success: boolean }> {
    return apiClient.post('/settings/audit-log', { action, category, details }).then(r => r.data);
  },

  saveGeneral(data: Record<string, unknown>): Promise<{ success: boolean; message: string }> {
    const settings = Object.entries(data).map(([key, value]) => ({ key, value }));
    return apiClient.put('/settings', { settings }).then(r => r.data);
  },

  saveAiConfig(data: Record<string, unknown>): Promise<{ success: boolean; message: string }> {
    const settings = Object.entries(data).map(([key, value]) => ({ key, value }));
    return apiClient.put('/settings', { settings }).then(r => r.data);
  },

  saveNotificationSettings(data: Record<string, unknown>): Promise<{ success: boolean; message: string }> {
    const settings = Object.entries(data).map(([key, value]) => ({ key, value }));
    return apiClient.put('/settings', { settings }).then(r => r.data);
  },

  saveSensorConfig(data: Record<string, unknown>): Promise<{ success: boolean; message: string }> {
    const settings = Object.entries(data).map(([key, value]) => ({ key, value }));
    return apiClient.put('/settings', { settings }).then(r => r.data);
  },

  saveSecuritySettings(data: Record<string, unknown>): Promise<{ success: boolean; message: string }> {
    const settings = Object.entries(data).map(([key, value]) => ({ key, value }));
    return apiClient.put('/settings', { settings }).then(r => r.data);
  },

  saveIntegrations(data: Record<string, unknown>): Promise<{ success: boolean; message: string }> {
    const settings = Object.entries(data).map(([key, value]) => ({ key, value }));
    return apiClient.put('/settings', { settings }).then(r => r.data);
  },

  changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    return apiClient.post('/settings/change-password', { currentPassword, newPassword }).then(r => r.data);
  },

  createBackup(): Promise<{ success: boolean; data: { filename: string; size: string; createdAt: string }; message: string }> {
    return apiClient.post('/settings/backup').then(r => r.data);
  },

  restoreBackup(): Promise<{ success: boolean; message: string }> {
    return apiClient.post('/settings/restore').then(r => r.data);
  },

  testSms(phone: string): Promise<{ success: boolean; message: string }> {
    return apiClient.post('/settings/test-sms', { phone }).then(r => r.data);
  },

  testEmail(email: string): Promise<{ success: boolean; message: string }> {
    return apiClient.post('/settings/test-email', { email }).then(r => r.data);
  },
};
