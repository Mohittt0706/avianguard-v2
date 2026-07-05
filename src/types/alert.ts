export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';

export interface AlertSensor {
  id: string;
  sensorId: string;
  name: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  wetland: string | null;
  status: string;
  temperature: number | null;
  ph: number | null;
  tds: number | null;
  dissolvedOxygen: number | null;
  waterLevel: number | null;
  battery: number | null;
  signalStrength: number | null;
  lastSeen: string | null;
}

export interface CitizenNotificationRecord {
  id: string;
  alertId: string | null;
  alertTitle: string | null;
  severity: string | null;
  wetland: string | null;
  sensorName: string | null;
  description: string | null;
  parameterValues: Record<string, unknown> | null;
  aiSummary: string | null;
  riskLevel: string | null;
  recommendedActions: string | null;
  sentBy: string | null;
  sentAt: string;
  deliveryStatus: string;
}

export interface Alert {
  id: string;
  sensorId: string | null;
  sensorName: string | null;
  wetland: string | null;
  alertType: string;
  severity: AlertSeverity;
  currentValue: number | null;
  safeRange: string | null;
  description: string;
  status: AlertStatus;
  citizenNotified?: boolean;
  citizenNotifiedAt?: string | null;
  createdAt: string;
  resolvedAt: string | null;
  resolvedBy: string | null;
  sensor?: AlertSensor | null;
  citizenNotifications?: CitizenNotificationRecord[];
}

export interface AlertStats {
  total: number;
  active: number;
  acknowledged: number;
  resolved: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface AlertPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface AlertListResponse {
  success: boolean;
  data: {
    alerts: Alert[];
    pagination: AlertPagination;
  };
}

export interface AlertResponse {
  success: boolean;
  data: {
    alert: Alert;
  };
  message?: string;
}

export interface AlertStatsResponse {
  success: boolean;
  data: AlertStats;
}
