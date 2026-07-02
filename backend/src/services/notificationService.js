class NotificationService {
  async sendSMS(recipient, message) {
    throw new Error('sendSMS not implemented');
  }

  async sendWhatsApp(recipient, message) {
    throw new Error('sendWhatsApp not implemented');
  }

  async sendEmail(recipient, subject, message) {
    throw new Error('sendEmail not implemented');
  }

  async sendPush(userId, title, message) {
    throw new Error('sendPush not implemented');
  }

  async createNotification(data) {
    throw new Error('createNotification not implemented');
  }

  async getNotifications(query) {
    throw new Error('getNotifications not implemented');
  }

  async markAsRead(notificationId) {
    throw new Error('markAsRead not implemented');
  }

  async broadcastAlert(alertId) {
    throw new Error('broadcastAlert not implemented');
  }

  async sendTestAlert(citizenId, channel) {
    throw new Error('sendTestAlert not implemented');
  }
}

module.exports = new NotificationService();
