export type ReportType = 'daily-water' | 'pollution-trend' | 'emergency' | 'ai-prediction' | 'compliance' | 'custom';
export type ReportFormat = 'pdf' | 'csv' | 'excel';
export type ReportStatus = 'generating' | 'ready' | 'failed' | 'archived';
export type ScheduleFrequency = 'daily' | 'weekly' | 'monthly';

export interface ReportChartData {
  date: string;
  temperature: number | null;
  ph: number | null;
  tds: number | null;
  dissolvedOxygen: number | null;
  waterLevel: number | null;
}

export interface ReportSensor {
  id: string;
  sensorId: string;
  name: string;
  wetland: string | null;
  status: string;
  temperature: number | null;
  ph: number | null;
  tds: number | null;
  dissolvedOxygen: number | null;
  waterLevel: number | null;
  battery: number | null;
  signalStrength: number | null;
}

export interface ReportAlert {
  id: string;
  alertType: string;
  severity: string;
  currentValue: number | null;
  safeRange: string | null;
  description: string;
  status: string;
  createdAt: string;
}

export interface ReportReading {
  id: string;
  sensorId: string;
  temperature: number;
  ph: number;
  tds: number;
  dissolvedOxygen: number;
  waterLevel: number;
  battery: number | null;
  signalStrength: number | null;
  timestamp: string;
}

export interface ReportSensorHealth {
  online: number;
  warning: number;
  offline: number;
  maintenance: number;
}

export interface ReportSummary {
  totalSensors: number;
  onlineSensors: number;
  totalAlerts: number;
  criticalAlerts: number;
  highAlerts: number;
  overallHealth: number;
  highestRiskWetland: string;
  avgTemperature: number | null;
  avgPh: number | null;
  avgTds: number | null;
  avgDissolvedOxygen: number | null;
  avgWaterLevel: number | null;
  citizenNotificationsSent: number;
}

export interface ReportAiAnalysis {
  healthScore: number;
  riskLevel: string;
  confidence: number;
  rootCause: string;
  recommendations: string[];
  environmentalImpact: string;
  trendAnalysis: string;
}

export interface ReportData {
  sensors: ReportSensor[];
  alerts: ReportAlert[];
  readings: ReportReading[];
  chartData: ReportChartData[];
  sensorHealth: ReportSensorHealth;
  alertGroupByType: Record<string, number>;
  severityCounts: Record<string, number>;
  citizenNotificationCount: number;
}

export interface Report {
  id: string;
  title: string;
  type: string;
  format: string;
  district: string | null;
  taluka: string | null;
  wetland: string | null;
  generatedBy: string;
  status: ReportStatus;
  fileSize: string | null;
  shareToken: string | null;
  dateFrom: string | null;
  dateTo: string | null;
  includeCharts: boolean;
  includeSensors: boolean;
  includeAI: boolean;
  includeCitizens: boolean;
  data: ReportData | null;
  summary: ReportSummary | null;
  aiAnalysis: ReportAiAnalysis | null;
  scheduledFrequency: string | null;
  scheduledEnabled: boolean;
  scheduledRecipients: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ReportPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ReportListResponse {
  success: boolean;
  data: {
    reports: Report[];
    pagination: ReportPagination;
  };
}

export interface ReportResponse {
  success: boolean;
  data: {
    report: Report;
  };
  message?: string;
}

export interface ReportStatsResponse {
  success: boolean;
  data: {
    total: number;
    ready: number;
    generating: number;
    failed: number;
    todayCount: number;
    scheduledCount: number;
  };
}

export interface ReportActivity {
  id: string;
  message: string;
  timestamp: string;
  type: string;
}

export interface CsvRow {
  sensorId: string;
  sensorName: string;
  wetland: string;
  temperature: number;
  ph: number;
  tds: number;
  dissolvedOxygen: number;
  waterLevel: number;
  battery: number | null;
  signalStrength: number | null;
  timestamp: string;
}
