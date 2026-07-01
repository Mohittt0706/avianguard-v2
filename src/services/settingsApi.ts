const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function placeholder<T>(msg: string): Promise<T> {
  console.log(`[API] ${msg}`);
  return Promise.resolve({} as T);
}

export const settingsApi = {
  saveGeneral(data: Record<string, string>): Promise<void> {
    return placeholder(`PUT ${BASE_URL}/settings/general — Saving general settings: ${JSON.stringify(data)}`);
  },
  getAiConfig(): Promise<void> {
    return placeholder(`GET ${BASE_URL}/settings/ai — Fetching AI configuration`);
  },
  toggleAi(enabled: boolean): Promise<void> {
    return placeholder(`POST ${BASE_URL}/settings/ai/toggle — ${enabled ? 'Enabling' : 'Disabling'} AI`);
  },
  updateAiThresholds(data: Record<string, number>): Promise<void> {
    return placeholder(`PUT ${BASE_URL}/settings/ai/thresholds — Updating AI thresholds: ${JSON.stringify(data)}`);
  },
  resetAiSettings(): Promise<void> {
    return placeholder(`POST ${BASE_URL}/settings/ai/reset — Resetting AI settings to defaults`);
  },
  generateTestPrediction(): Promise<void> {
    return placeholder(`POST ${BASE_URL}/settings/ai/test-prediction — Generating test prediction`);
  },
  getAlertRules(): Promise<void> {
    return placeholder(`GET ${BASE_URL}/settings/alert-rules — Fetching alert rules`);
  },
  saveAlertRules(data: Record<string, { warning: number; critical: number }>): Promise<void> {
    return placeholder(`PUT ${BASE_URL}/settings/alert-rules — Saving alert rules: ${JSON.stringify(data)}`);
  },
  resetAlertRules(): Promise<void> {
    return placeholder(`POST ${BASE_URL}/settings/alert-rules/reset — Resetting alert rules to defaults`);
  },
  saveNotificationSettings(data: Record<string, unknown>): Promise<void> {
    return placeholder(`PUT ${BASE_URL}/settings/notifications — Saving notification settings: ${JSON.stringify(data)}`);
  },
  testSms(phone: string): Promise<void> {
    return placeholder(`POST ${BASE_URL}/settings/notifications/test-sms — Sending test SMS to ${phone}`);
  },
  testWhatsApp(phone: string): Promise<void> {
    return placeholder(`POST ${BASE_URL}/settings/notifications/test-whatsapp — Sending test WhatsApp to ${phone}`);
  },
  testEmail(email: string): Promise<void> {
    return placeholder(`POST ${BASE_URL}/settings/notifications/test-email — Sending test email to ${email}`);
  },
  saveSensorConfig(data: Record<string, unknown>): Promise<void> {
    return placeholder(`PUT ${BASE_URL}/settings/sensors — Saving sensor configuration: ${JSON.stringify(data)}`);
  },
  restartAllSensors(): Promise<void> {
    return placeholder(`POST ${BASE_URL}/settings/sensors/restart — Restarting all sensors`);
  },
  testSensorConnection(): Promise<void> {
    return placeholder(`POST ${BASE_URL}/settings/sensors/test — Testing sensor connection`);
  },
  resyncSensorNetwork(): Promise<void> {
    return placeholder(`POST ${BASE_URL}/settings/sensors/resync — Resyncing sensor network`);
  },
  saveSecuritySettings(data: Record<string, unknown>): Promise<void> {
    return placeholder(`PUT ${BASE_URL}/settings/security — Saving security settings: ${JSON.stringify(data)}`);
  },
  forceLogoutAll(): Promise<void> {
    return placeholder(`POST ${BASE_URL}/settings/security/force-logout — Force logging out all users`);
  },
  generateApiToken(): Promise<{ token: string }> {
    return placeholder(`POST ${BASE_URL}/settings/security/generate-token — Generating API token`);
  },
  revokeTokens(): Promise<void> {
    return placeholder(`POST ${BASE_URL}/settings/security/revoke-tokens — Revoking all API tokens`);
  },
  refreshSystemHealth(): Promise<Record<string, string>> {
    return placeholder(`GET ${BASE_URL}/settings/system/health — Refreshing system health status`);
  },
  createBackup(): Promise<void> {
    return placeholder(`POST ${BASE_URL}/settings/backup/create — Creating system backup`);
  },
  downloadBackup(): Promise<Blob> {
    return placeholder(`GET ${BASE_URL}/settings/backup/download — Downloading backup`);
  },
  restoreBackup(): Promise<void> {
    return placeholder(`POST ${BASE_URL}/settings/backup/restore — Restoring from backup`);
  },
  resetSystem(): Promise<void> {
    return placeholder(`POST ${BASE_URL}/settings/system/reset — Resetting system`);
  },
  exportConfig(): Promise<Blob> {
    return placeholder(`GET ${BASE_URL}/settings/config/export — Exporting configuration`);
  },
  importConfig(): Promise<void> {
    return placeholder(`POST ${BASE_URL}/settings/config/import — Importing configuration`);
  },
  getAuditLogs(): Promise<void> {
    return placeholder(`GET ${BASE_URL}/settings/audit-logs — Fetching audit logs`);
  },
};
