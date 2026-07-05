import apiClient from './apiClient';
import type {
  ReportListResponse,
  ReportResponse,
  ReportStatsResponse,
  ReportActivity,
  CsvRow,
} from '@/types/report';

export const reportApi = {
  getAll(params?: Record<string, string>): Promise<ReportListResponse> {
    return apiClient.get('/reports', { params }).then(r => r.data);
  },

  getById(id: string): Promise<ReportResponse> {
    return apiClient.get(`/reports/${id}`).then(r => r.data);
  },

  getByShareToken(token: string): Promise<ReportResponse> {
    return apiClient.get(`/reports/share/${token}`).then(r => r.data);
  },

  create(data: {
    title: string;
    type: string;
    format?: string;
    district?: string;
    taluka?: string;
    wetland?: string;
    dateFrom?: string;
    dateTo?: string;
    includeCharts?: boolean;
    includeSensors?: boolean;
    includeAI?: boolean;
    includeCitizens?: boolean;
  }): Promise<ReportResponse> {
    return apiClient.post('/reports', data).then(r => r.data);
  },

  update(id: string, data: {
    title?: string;
    district?: string;
    taluka?: string;
    wetland?: string;
    scheduledFrequency?: string | null;
    scheduledEnabled?: boolean;
    scheduledRecipients?: string[];
  }): Promise<ReportResponse> {
    return apiClient.patch(`/reports/${id}`, data).then(r => r.data);
  },

  delete(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete(`/reports/${id}`).then(r => r.data);
  },

  share(id: string): Promise<{ success: boolean; data: { shareToken: string } }> {
    return apiClient.post(`/reports/${id}/share`).then(r => r.data);
  },

  getStats(): Promise<ReportStatsResponse> {
    return apiClient.get('/reports/stats').then(r => r.data);
  },

  getCsvData(id: string): Promise<{ success: boolean; data: CsvRow[] }> {
    return apiClient.get(`/reports/${id}/csv`).then(r => r.data);
  },

  getActivity(limit?: number): Promise<{ success: boolean; data: ReportActivity[] }> {
    return apiClient.get('/reports/activity', { params: { limit: String(limit || 10) } }).then(r => r.data);
  },
};
