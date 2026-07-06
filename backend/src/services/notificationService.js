const { getMessaging } = require('../config/firebase');
const logger = require('../utils/logger');

class NotificationService {
  async sendPushNotification(fcmToken, payload) {
    const messaging = getMessaging();
    if (!messaging) {
      logger.warn('[NOTIFICATION] Firebase not initialized, skipping push');
      return { success: false, error: 'Firebase not initialized' };
    }

    if (!fcmToken) {
      return { success: false, error: 'No FCM token provided' };
    }

    try {
      const message = {
        token: fcmToken,
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: payload.data || {},
        webpush: {
          headers: {
            TTL: '86400',
          },
          notification: {
            title: payload.title,
            body: payload.body,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: payload.data?.alertType || 'general',
            requireInteraction: payload.data?.severity === 'CRITICAL' || payload.data?.severity === 'HIGH',
            actions: [
              { action: 'open', title: 'View Details' },
              { action: 'dismiss', title: 'Dismiss' },
            ],
          },
          fcmOptions: payload.data?.clickUrl ? { link: payload.data.clickUrl } : undefined,
        },
      };

      const response = await messaging.send(message);
      logger.info(`[NOTIFICATION] Push sent successfully: ${response}`);
      return { success: true, messageId: response };
    } catch (err) {
      if (err.code === 'messaging/registration-token-not-registered' ||
          err.code === 'messaging/invalid-registration-token') {
        logger.warn(`[NOTIFICATION] Invalid FCM token, should be cleaned up: ${fcmToken.substring(0, 20)}...`);
        return { success: false, error: 'invalid_token', shouldCleanup: true };
      }
      logger.error(`[NOTIFICATION] Push failed: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  async sendBulkNotifications(tokens, payload) {
    const messaging = getMessaging();
    if (!messaging) {
      logger.warn('[NOTIFICATION] Firebase not initialized, skipping bulk push');
      return { successCount: 0, failureCount: tokens.length, invalidTokens: [] };
    }

    if (!tokens.length) {
      return { successCount: 0, failureCount: 0, invalidTokens: [] };
    }

    const message = {
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data || {},
      webpush: {
        headers: { TTL: '86400' },
        notification: {
          title: payload.title,
          body: payload.body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: payload.data?.alertType || 'general',
          requireInteraction: payload.data?.severity === 'CRITICAL' || payload.data?.severity === 'HIGH',
          actions: [
            { action: 'open', title: 'View Details' },
            { action: 'dismiss', title: 'Dismiss' },
          ],
        },
        fcmOptions: payload.data?.clickUrl ? { link: payload.data.clickUrl } : undefined,
      },
    };

    try {
      const response = await messaging.sendEachForMulticast({ ...message, tokens });
      const invalidTokens = [];

      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const errCode = resp.error?.code || '';
          if (errCode === 'messaging/registration-token-not-registered' ||
              errCode === 'messaging/invalid-registration-token') {
            invalidTokens.push(tokens[idx]);
          }
        }
      });

      logger.info(`[NOTIFICATION] Bulk push: success=${response.successCount} failed=${response.failureCount}`);
      return {
        successCount: response.successCount,
        failureCount: response.failureCount,
        invalidTokens,
      };
    } catch (err) {
      logger.error(`[NOTIFICATION] Bulk push failed: ${err.message}`);
      return { successCount: 0, failureCount: tokens.length, invalidTokens: tokens };
    }
  }
}

module.exports = new NotificationService();
