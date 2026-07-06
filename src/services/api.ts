import type { Citizen } from '@/types/citizen';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function placeholderRequest<T>(description: string): Promise<T> {
  console.log(`[API] ${description}`);
  return Promise.resolve({} as T);
}

export const citizenApi = {
  getAll(): Promise<Citizen[]> {
    return placeholderRequest(`GET ${BASE_URL}/citizens — Fetching all citizens`);
  },

  getById(id: string): Promise<Citizen> {
    return placeholderRequest(`GET ${BASE_URL}/citizens/${id} — Fetching citizen ${id}`);
  },

  update(id: string, data: Partial<Citizen>): Promise<Citizen> {
    return placeholderRequest(`PUT ${BASE_URL}/citizens/${id} — Updating citizen ${id}`);
  },

  remove(id: string): Promise<void> {
    return placeholderRequest(`DELETE ${BASE_URL}/citizens/${id} — Deleting citizen ${id}`);
  },

  patchStatus(id: string, status: string): Promise<void> {
    return placeholderRequest(`PATCH ${BASE_URL}/citizens/${id}/status — Setting status to ${status}`);
  },

  approve(citizen: Citizen): Promise<void> {
    return placeholderRequest(`POST ${BASE_URL}/citizens/${citizen.id}/approve — Approving ${citizen.fullName}`);
  },

  reject(citizen: Citizen, reason: string): Promise<void> {
    return placeholderRequest(`POST ${BASE_URL}/citizens/${citizen.id}/reject — Rejecting ${citizen.fullName}: ${reason}`);
  },

  requestInfo(citizen: Citizen, message: string): Promise<void> {
    return placeholderRequest(`POST ${BASE_URL}/citizens/${citizen.id}/request-info — Requesting info from ${citizen.fullName}: ${message}`);
  },

  addToDirectory(citizen: Citizen): Promise<void> {
    return placeholderRequest(`POST ${BASE_URL}/citizen-directory — Adding ${citizen.fullName} to citizen directory`);
  },

  restore(citizen: Citizen): Promise<void> {
    return placeholderRequest(`POST ${BASE_URL}/citizens/${citizen.id}/restore — Restoring ${citizen.fullName} to pending`);
  },

  disable(id: string): Promise<void> {
    return placeholderRequest(`POST ${BASE_URL}/citizens/${id}/disable — Disabling citizen ${id}`);
  },

  enable(id: string): Promise<void> {
    return placeholderRequest(`POST ${BASE_URL}/citizens/${id}/enable — Enabling citizen ${id}`);
  },

  sendTestAlert(id: string, methods: string[]): Promise<void> {
    return placeholderRequest(`POST ${BASE_URL}/citizens/${id}/test-alert — Sending test alert via ${methods.join(', ')}`);
  },

  fetchStats(): Promise<void> {
    return placeholderRequest(`GET ${BASE_URL}/citizens/stats — Fetching dashboard statistics`);
  },

  search(query: string): Promise<void> {
    return placeholderRequest(`GET ${BASE_URL}/citizens/search?q=${query} — Searching citizens`);
  },

  bulkApprove(ids: string[]): Promise<void> {
    return placeholderRequest(`POST ${BASE_URL}/citizens/bulk-approve — Approving ${ids.length} citizens`);
  },

  bulkReject(ids: string[], reason: string): Promise<void> {
    return placeholderRequest(`POST ${BASE_URL}/citizens/bulk-reject — Rejecting ${ids.length} citizens`);
  },

  bulkStatus(ids: string[], status: string): Promise<void> {
    return placeholderRequest(`POST ${BASE_URL}/citizens/bulk-status — Setting ${ids.length} citizens to ${status}`);
  },

  bulkTestAlert(ids: string[]): Promise<void> {
    return placeholderRequest(`POST ${BASE_URL}/citizens/bulk-test-alert — Sending test alerts to ${ids.length} citizens`);
  },

  exportCsv(ids: string[]): Promise<Blob> {
    return placeholderRequest(`GET ${BASE_URL}/citizens/export/csv?ids=${ids.join(',')} — Exporting ${ids.length} citizens as CSV`);
  },

  exportPdf(ids: string[]): Promise<Blob> {
    return placeholderRequest(`GET ${BASE_URL}/citizens/export/pdf?ids=${ids.join(',')} — Exporting ${ids.length} citizens as PDF`);
  },

  exportExcel(ids: string[]): Promise<Blob> {
    return placeholderRequest(`GET ${BASE_URL}/citizens/export/excel?ids=${ids.join(',')} — Exporting ${ids.length} citizens as Excel`);
  },
};

export const notificationApi = {
  sendSms(mobile: string, message: string): Promise<void> {
    return placeholderRequest(`POST ${BASE_URL}/notifications/sms — SMS to ${mobile}: "${message}"`);
  },

  sendEmail(email: string, subject: string, body: string): Promise<void> {
    return placeholderRequest(`POST ${BASE_URL}/notifications/email — Email to ${email}: "${subject}"`);
  },
};
