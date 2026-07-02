import apiClient from './apiClient';
import type {
  SensorListResponse,
  SensorResponse,
  SensorStatsResponse,
  LiveReadingResponse,
  SensorReadingListResponse,
  CreateReadingResponse,
  Sensor,
} from '@/types/sensor';

export const sensorApi = {
  getAll(params?: Record<string, string>): Promise<SensorListResponse> {
    return apiClient.get('/sensors', { params }).then(r => r.data);
  },

  getById(id: string): Promise<SensorResponse> {
    return apiClient.get(`/sensors/${id}`).then(r => r.data);
  },

  create(data: Partial<Sensor>): Promise<SensorResponse> {
    return apiClient.post('/sensors', data).then(r => r.data);
  },

  update(id: string, data: Partial<Sensor>): Promise<SensorResponse> {
    return apiClient.patch(`/sensors/${id}`, data).then(r => r.data);
  },

  delete(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete(`/sensors/${id}`).then(r => r.data);
  },

  updateStatus(id: string, status: string): Promise<SensorResponse> {
    return apiClient.patch(`/sensors/${id}/status`, { status }).then(r => r.data);
  },

  getStats(): Promise<SensorStatsResponse> {
    return apiClient.get('/sensors/stats').then(r => r.data);
  },

  getLive(): Promise<LiveReadingResponse> {
    return apiClient.get('/sensors/live').then(r => r.data);
  },

  getReadings(id: string, params?: Record<string, string>): Promise<SensorReadingListResponse> {
    return apiClient.get(`/sensors/${id}/readings`, { params }).then(r => r.data);
  },

  createReading(id: string, data: {
    temperature: number;
    ph: number;
    tds: number;
    dissolvedOxygen: number;
    waterLevel: number;
    battery?: number;
    signalStrength?: number;
    timestamp?: string;
  }): Promise<CreateReadingResponse> {
    return apiClient.post(`/sensors/${id}/reading`, data).then(r => r.data);
  },
};
