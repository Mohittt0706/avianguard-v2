export interface SensorReadingSummary {
  type: string;
  value: number;
  sensorId: string;
}

export interface DashboardStats {
  totalSensorStations: number;
  activeSensorStations: number;
  offlineSensorStations: number;
  warningSensorStations: number;
  totalSensors: number;
  activeSensors: number;
  faultySensors: number;
  activeAlerts: number;
  criticalAlerts?: number;
  highAlerts?: number;
  totalCitizens: number;
  totalReports: number;
  aiRecommendation: string;
  aiConfidence?: number;
  sensorReadings: SensorReadingSummary[];
  recentActivity: RecentActivity[];
}

export interface RecentActivity {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  severity: string;
  status: string;
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardStats;
}
