const prisma = require('../config/database');
const logger = require('../utils/logger');

class CitizenNotificationService {
  async create(data) {
    logger.info(`[CITIZEN] Sending citizen notification for alert ${data.alertId}: ${data.alertTitle}`);

    const notification = await prisma.citizenNotification.create({
      data: {
        alertId: data.alertId,
        alertTitle: data.alertTitle,
        severity: data.severity,
        wetland: data.wetland,
        sensorName: data.sensorName || null,
        description: data.description,
        parameterValues: data.parameterValues || null,
        aiSummary: data.aiSummary || null,
        riskLevel: data.riskLevel || null,
        recommendedActions: data.recommendedActions || null,
        sentBy: data.sentBy || 'System',
        sentAt: new Date(),
        deliveryStatus: 'sent',
      },
    });

    logger.info(`[CITIZEN] Notification saved: id=${notification.id}`);

    return notification;
  }

  async getAll(query = {}) {
    const where = {};
    if (query.severity) where.severity = query.severity;
    if (query.wetland) where.wetland = query.wetland;
    if (query.deliveryStatus) where.deliveryStatus = query.deliveryStatus;
    if (query.search) {
      where.OR = [
        { alertTitle: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { wetland: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(Math.max(1, parseInt(query.limit, 10) || 50), 200);
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      prisma.citizenNotification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { sentAt: 'desc' },
      }),
      prisma.citizenNotification.count({ where }),
    ]);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getStats() {
    const [total, sent, delivered, failed] = await Promise.all([
      prisma.citizenNotification.count(),
      prisma.citizenNotification.count({ where: { deliveryStatus: 'sent' } }),
      prisma.citizenNotification.count({ where: { deliveryStatus: 'delivered' } }),
      prisma.citizenNotification.count({ where: { deliveryStatus: 'failed' } }),
    ]);

    return { total, sent, delivered, failed };
  }

  async getById(id) {
    const notification = await prisma.citizenNotification.findUnique({ where: { id } });
    if (!notification) {
      const AppError = require('../utils/AppError');
      throw new AppError('Citizen notification not found', 404);
    }
    return notification;
  }

  async updateDeliveryStatus(id, status) {
    const notification = await prisma.citizenNotification.update({
      where: { id },
      data: { deliveryStatus: status },
    });
    return notification;
  }
}

module.exports = new CitizenNotificationService();
