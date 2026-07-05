export interface CitizenNotification {
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
  createdAt: string;
}

export interface CitizenNotificationStats {
  total: number;
  sent: number;
  delivered: number;
  failed: number;
}

export interface CitizenNotificationListResponse {
  success: boolean;
  data: {
    notifications: CitizenNotification[];
    pagination: { page: number; limit: number; total: number; pages: number };
  };
}

export interface CitizenNotificationResponse {
  success: boolean;
  data: {
    notification: CitizenNotification;
  };
  message?: string;
}

export interface CitizenNotificationStatsResponse {
  success: boolean;
  data: CitizenNotificationStats;
}
