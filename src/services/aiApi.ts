import apiClient from './apiClient';

export interface AICard {
  id: string;
  severity: string;
  alertType: string;
  sensorName: string;
  sensorLocation: string;
  currentValue: number | null;
  safeRange: string | null;
  description: string;
  timestamp: string;
  status: string;
  confidenceScore: number;
  summary: string;
  possibleCause: string;
  suggestedAction: string;
}

export interface AIAnalysisResponse {
  success: boolean;
  data: {
    riskScore: number;
    riskLabel: { label: string; color: string; bg: string };
    confidenceScore: number;
    summary: string;
    recommendation: string;
    trendAnalysis: string;
    possibleCause: string;
    suggestedAction: string;
    trendSummary: string;
    totalAlerts: number;
    totalSensors: number;
    onlineSensors: number;
    totalWetlands: number;
    cards: AICard[];
  };
}

export const aiApi = {
  getAnalysis(): Promise<AIAnalysisResponse> {
    return apiClient.get('/ai/analysis').then(r => r.data);
  },
};
