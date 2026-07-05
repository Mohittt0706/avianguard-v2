import apiClient from './apiClient';

export interface RegisterTokenResponse {
  success: boolean;
  message: string;
  data: { citizenId: string; fcmToken: string };
}

export interface SendNotificationResponse {
  success: boolean;
  message: string;
  data: {
    notification: {
      id: string;
      citizenId: string;
      title: string;
      severity: string;
      message: string;
      deliveryMethod: string;
      deliveryStatus: string;
      sentAt: string;
    } | null;
    pushStatus: string;
    messageId: string | null;
  };
}

export interface SendNotificationPayload {
  title: string;
  body: string;
  citizenId?: string;
  data?: {
    alertType?: string;
    severity?: string;
    wetland?: string;
    description?: string;
    recommendedAction?: string;
    clickUrl?: string;
    alertId?: string;
  };
}

export const notificationApi = {
  registerToken(data: { token: string; citizenId?: string; mobile?: string }): Promise<RegisterTokenResponse> {
    return apiClient.post('/notifications/register-token', data).then(r => r.data);
  },

  sendNotification(payload: SendNotificationPayload): Promise<SendNotificationResponse> {
    return apiClient.post('/notifications/send', payload).then(r => r.data);
  },
};
