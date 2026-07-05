const prisma = require('../config/database');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const notificationService = require('./notificationService');

class CitizenService {
  async getCitizens(filters = {}) {
    const where = {};

    if (filters.status) where.status = filters.status;
    if (filters.district) where.district = filters.district;
    if (filters.taluka) where.taluka = filters.taluka;
    if (filters.village) where.village = filters.village;
    if (filters.nearbyWetland || filters.wetland) where.nearbyWetland = filters.nearbyWetland || filters.wetland;
    if (filters.riskLevel) where.riskLevel = filters.riskLevel;
    if (filters.gender) where.gender = filters.gender;
    if (filters.language) where.language = filters.language;
    if (filters.isActive !== undefined) where.isActive = filters.isActive === 'true';

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo);
    }

    if (filters.search) {
      where.OR = [
        { fullName: { contains: filters.search, mode: 'insensitive' } },
        { mobile: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { district: { contains: filters.search, mode: 'insensitive' } },
        { village: { contains: filters.search, mode: 'insensitive' } },
        { nearbyWetland: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const page = Math.max(1, parseInt(filters.page, 10) || 1);
    const limit = Math.min(Math.max(1, parseInt(filters.limit, 10) || 20), 100);
    const skip = (page - 1) * limit;

    const [citizens, total] = await Promise.all([
      prisma.citizen.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.citizen.count({ where }),
    ]);

    return {
      citizens,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  async getCitizenById(id) {
    const citizen = await prisma.citizen.findUnique({ where: { id } });
    if (!citizen) throw new AppError('Citizen not found', 404);

    const [notifications, auditLogs, notificationsCount, alertsSent] = await Promise.all([
      prisma.citizenAlertNotification.findMany({
        where: { citizenId: id },
        orderBy: { sentAt: 'desc' },
        take: 50,
      }),
      prisma.citizenAuditLog.findMany({
        where: { citizenId: id },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.citizenAlertNotification.count({ where: { citizenId: id } }),
      prisma.citizenAlertNotification.count({ where: { citizenId: id, deliveryStatus: 'delivered' } }),
    ]);

    return {
      ...citizen,
      notifications,
      auditLogs,
      stats: { notificationsCount, alertsSent },
    };
  }

  async createCitizen(data) {
    if (data.mobile) {
      const existing = await prisma.citizen.findFirst({ where: { mobile: data.mobile } });
      if (existing) throw new AppError('A citizen with this mobile number already exists', 409);
    }

    const citizen = await prisma.citizen.create({
      data: {
        fullName: data.fullName,
        mobile: data.mobile,
        whatsapp: data.whatsapp || null,
        email: data.email || null,
        dateOfBirth: data.dateOfBirth || null,
        gender: data.gender || null,
        state: data.state || 'Gujarat',
        district: data.district,
        taluka: data.taluka || null,
        village: data.village || null,
        pincode: data.pincode || null,
        nearbyWetland: data.nearbyWetland,
        gpsLocation: data.gpsLocation || null,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        distanceFromWetland: data.distanceFromWetland || null,
        occupation: data.occupation || null,
        occupationOther: data.occupationOther || null,
        alertMethods: data.alertMethods || [],
        alertTypes: data.alertTypes || [],
        language: data.language || 'Hindi',
        emergencyName: data.emergencyName || null,
        emergencyMobile: data.emergencyMobile || null,
        emergencyRelationship: data.emergencyRelationship || null,
        agree: data.agree ?? false,
        status: data.status || 'PENDING',
        riskLevel: data.riskLevel || 'safe',
      },
    });

    await this.auditLog(citizen.id, 'create', 'citizen', { fullName: citizen.fullName, mobile: citizen.mobile });
    logger.info(`[CITIZEN] Created citizen: ${citizen.fullName} (${citizen.mobile}) id=${citizen.id}`);

    return citizen;
  }

  async updateCitizen(id, data) {
    const citizen = await prisma.citizen.findUnique({ where: { id } });
    if (!citizen) throw new AppError('Citizen not found', 404);

    if (data.mobile && data.mobile !== citizen.mobile) {
      const existing = await prisma.citizen.findFirst({ where: { mobile: data.mobile, NOT: { id } } });
      if (existing) throw new AppError('A citizen with this mobile number already exists', 409);
    }

    const updateData = {};
    const fields = [
      'fullName', 'mobile', 'whatsapp', 'email', 'dateOfBirth', 'gender',
      'state', 'district', 'taluka', 'village', 'pincode', 'nearbyWetland',
      'gpsLocation', 'latitude', 'longitude', 'distanceFromWetland',
      'occupation', 'occupationOther', 'alertMethods', 'alertTypes',
      'language', 'emergencyName', 'emergencyMobile', 'emergencyRelationship',
      'agree', 'riskLevel', 'rejectionReason', 'adminNotes',
    ];

    for (const field of fields) {
      if (data[field] !== undefined) updateData[field] = data[field];
    }

    if (data.status !== undefined) updateData.status = data.status;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const updated = await prisma.citizen.update({ where: { id }, data: updateData });

    await this.auditLog(id, 'update', 'citizen', { fields: Object.keys(updateData), previousStatus: citizen.status, newStatus: updated.status });
    logger.info(`[CITIZEN] Updated citizen: ${updated.fullName} (${updated.mobile}) id=${id}`);

    return updated;
  }

  async deleteCitizen(id) {
    const citizen = await prisma.citizen.findUnique({ where: { id } });
    if (!citizen) throw new AppError('Citizen not found', 404);

    await this.auditLog(id, 'delete', 'citizen', { fullName: citizen.fullName, mobile: citizen.mobile });
    await prisma.citizen.delete({ where: { id } });

    logger.info(`[CITIZEN] Deleted citizen: ${citizen.fullName} (${citizen.mobile}) id=${id}`);
  }

  async updateStatus(id, status, reason) {
    const validStatuses = ['ACTIVE', 'REJECTED', 'DISABLED', 'PENDING', 'PENDING_VERIFICATION'];
    if (!validStatuses.includes(status)) throw new AppError('Invalid status value', 400);

    const citizen = await prisma.citizen.findUnique({ where: { id } });
    if (!citizen) throw new AppError('Citizen not found', 404);

    const updateData = { status };

    if (status === 'REJECTED') {
      updateData.rejectionReason = reason || null;
    }

    await this.auditLog(id, 'status_change', 'citizen', {
      previousStatus: citizen.status,
      newStatus: status,
      reason: reason || null,
    });

    const updated = await prisma.citizen.update({ where: { id }, data: updateData });

    logger.info(`[CITIZEN] Status changed for ${citizen.fullName}: ${citizen.status} -> ${status}`);

    return updated;
  }

  async bulkAction(ids, action, data = {}) {
    if (!ids || !ids.length) throw new AppError('No citizen IDs provided', 400);

    const citizens = await prisma.citizen.findMany({ where: { id: { in: ids } } });
    if (!citizens.length) throw new AppError('No citizens found', 404);

    const validActions = ['approve', 'reject', 'disable', 'enable', 'delete'];
    if (!validActions.includes(action)) throw new AppError('Invalid bulk action', 400);

    let result;

    switch (action) {
      case 'approve':
        result = await prisma.citizen.updateMany({ where: { id: { in: ids } }, data: { status: 'ACTIVE' } });
        break;
      case 'reject':
        result = await prisma.citizen.updateMany({ where: { id: { in: ids } }, data: { status: 'REJECTED', rejectionReason: data.reason || null } });
        break;
      case 'disable':
        result = await prisma.citizen.updateMany({ where: { id: { in: ids } }, data: { status: 'DISABLED', isActive: false } });
        break;
      case 'enable':
        result = await prisma.citizen.updateMany({ where: { id: { in: ids } }, data: { status: 'ACTIVE', isActive: true } });
        break;
      case 'delete':
        result = await prisma.citizen.deleteMany({ where: { id: { in: ids } } });
        break;
    }

    for (const citizen of citizens) {
      try {
        await this.auditLog(citizen.id, `bulk_${action}`, 'citizen', { citizenName: citizen.fullName });
      } catch (err) {
        logger.error(`[CITIZEN] Failed to log audit for bulk action on citizen ${citizen.id}`, err);
      }
    }

    logger.info(`[CITIZEN] Bulk ${action} performed on ${ids.length} citizens`);

    return { affected: ids.length, action };
  }

  async getStats() {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      total, pending, active, rejected, disabled, pendingVerification,
      registeredToday, alertsSentToday,
      byDistrict, byWetland, byLanguage, byRiskLevel,
    ] = await Promise.all([
      prisma.citizen.count(),
      prisma.citizen.count({ where: { status: 'PENDING' } }),
      prisma.citizen.count({ where: { status: 'ACTIVE' } }),
      prisma.citizen.count({ where: { status: 'REJECTED' } }),
      prisma.citizen.count({ where: { status: 'DISABLED' } }),
      prisma.citizen.count({ where: { status: 'PENDING_VERIFICATION' } }),
      prisma.citizen.count({ where: { createdAt: { gte: startOfDay } } }),
      prisma.citizenAlertNotification.count({ where: { sentAt: { gte: startOfDay } } }),
      prisma.citizen.groupBy({ by: ['district'], _count: true, orderBy: { _count: { district: 'desc' } } }),
      prisma.citizen.groupBy({ by: ['nearbyWetland'], _count: true, orderBy: { _count: { nearbyWetland: 'desc' } } }),
      prisma.citizen.groupBy({ by: ['language'], _count: true, orderBy: { _count: { language: 'desc' } } }),
      prisma.citizen.groupBy({ by: ['riskLevel'], _count: true, orderBy: { _count: { riskLevel: 'desc' } } }),
    ]);

    return {
      total, pending, active, rejected, disabled, pendingVerification,
      registeredToday, alertsSentToday,
      byDistrict: byDistrict.map(r => ({ district: r.district, count: r._count })),
      byWetland: byWetland.map(r => ({ wetland: r.nearbyWetland, count: r._count })),
      byLanguage: byLanguage.map(r => ({ language: r.language, count: r._count })),
      byRiskLevel: byRiskLevel.map(r => ({ riskLevel: r.riskLevel, count: r._count })),
    };
  }

  async sendAlert(citizenId, data) {
    const citizen = await prisma.citizen.findUnique({ where: { id: citizenId } });
    if (!citizen) throw new AppError('Citizen not found', 404);
    if (citizen.status !== 'ACTIVE') throw new AppError('Citizen is not active and cannot receive alerts', 400);

    if (!data.title || !data.message) throw new AppError('Title and message are required', 400);

    const deliveryMethod = data.deliveryMethod || 'SMS';
    let pushStatus = 'not_sent';

    if (deliveryMethod === 'Push' || deliveryMethod === 'All') {
      if (citizen.fcmToken) {
        const result = await notificationService.sendPushNotification(citizen.fcmToken, {
          title: data.title,
          body: data.message,
          data: {
            alertType: data.alertType || 'alert',
            severity: data.severity || 'LOW',
            wetland: data.wetland || citizen.nearbyWetland || '',
            description: data.description || data.message,
            recommendedAction: data.recommendedAction || '',
            timestamp: new Date().toISOString(),
            clickUrl: `/notifications?mobile=${encodeURIComponent(citizen.mobile)}`,
          },
        });
        pushStatus = result.success ? 'delivered' : 'failed';
        if (result.shouldCleanup) {
          await prisma.citizen.update({ where: { id: citizenId }, data: { fcmToken: null, fcmTokenUpdatedAt: null } });
        }
      } else {
        pushStatus = 'no_token';
      }
    }

    const notification = await prisma.citizenAlertNotification.create({
      data: {
        citizenId,
        title: data.title,
        severity: data.severity || 'LOW',
        message: data.message,
        wetland: data.wetland || citizen.nearbyWetland,
        alertType: data.alertType || null,
        description: data.description || null,
        recommendedAction: data.recommendedAction || null,
        clickUrl: `/notifications?mobile=${encodeURIComponent(citizen.mobile)}`,
        deliveryMethod,
        deliveryStatus: deliveryMethod === 'Push' ? pushStatus : 'sent',
        language: data.language || citizen.language,
        sentBy: data.sentBy || null,
      },
    });

    await prisma.citizen.update({ where: { id: citizenId }, data: { lastAlertAt: new Date() } });

    await this.auditLog(citizenId, 'send_alert', 'notification', {
      notificationId: notification.id,
      title: data.title,
      severity: data.severity,
      deliveryMethod,
      pushStatus,
    });

    logger.info(`[CITIZEN] Alert sent to ${citizen.fullName} (${citizen.mobile}): ${data.title} [push=${pushStatus}]`);

    return notification;
  }

  async emergencyBroadcast(wetland, data) {
    if (!wetland) throw new AppError('Wetland is required', 400);
    if (!data.title || !data.message) throw new AppError('Title and message are required', 400);

    const citizens = await prisma.citizen.findMany({
      where: { nearbyWetland: wetland, status: 'ACTIVE', isActive: true },
    });

    if (!citizens.length) throw new AppError('No active citizens found for this wetland', 404);

    let sent = 0;
    let failed = 0;
    const deliveryStats = { SMS: 0, WhatsApp: 0, Email: 0, Push: 0 };

    const pushTokens = citizens.filter(c => c.fcmToken).map(c => c.fcmToken);
    let pushResults = { successCount: 0, failureCount: 0, invalidTokens: [] };

    if (pushTokens.length > 0 && (data.deliveryMethod === 'Push' || data.deliveryMethod === 'All')) {
      pushResults = await notificationService.sendBulkNotifications(pushTokens, {
        title: data.title,
        body: data.message,
        data: {
          alertType: data.alertType || 'emergency',
          severity: data.severity || 'HIGH',
          wetland,
          description: data.description || data.message,
          recommendedAction: data.recommendedAction || '',
          timestamp: new Date().toISOString(),
          clickUrl: `/notifications?mobile=`,
        },
      });

      if (pushResults.invalidTokens.length > 0) {
        await prisma.citizen.updateMany({
          where: { fcmToken: { in: pushResults.invalidTokens } },
          data: { fcmToken: null, fcmTokenUpdatedAt: null },
        });
        logger.info(`[CITIZEN] Cleaned up ${pushResults.invalidTokens.length} invalid FCM tokens`);
      }
    }

    for (const citizen of citizens) {
      try {
        const method = data.deliveryMethod || (citizen.alertMethods.length > 0 ? citizen.alertMethods[0] : 'SMS');
        let pushStatus = 'not_sent';

        if ((method === 'Push' || method === 'All') && citizen.fcmToken) {
          const isValid = !pushResults.invalidTokens.includes(citizen.fcmToken);
          pushStatus = isValid ? 'delivered' : 'failed';
        }

        await prisma.citizenAlertNotification.create({
          data: {
            citizenId: citizen.id,
            title: data.title,
            severity: data.severity || 'HIGH',
            message: data.message,
            wetland,
            alertType: data.alertType || 'emergency',
            description: data.description || data.message,
            recommendedAction: data.recommendedAction || null,
            clickUrl: `/notifications?mobile=${encodeURIComponent(citizen.mobile)}`,
            deliveryMethod: method,
            deliveryStatus: method === 'Push' ? pushStatus : 'sent',
            language: data.language || citizen.language,
            sentBy: data.sentBy || null,
          },
        });

        await prisma.citizen.update({ where: { id: citizen.id }, data: { lastAlertAt: new Date() } });

        deliveryStats[method] = (deliveryStats[method] || 0) + 1;
        sent++;
      } catch (err) {
        failed++;
        logger.error(`[CITIZEN] Failed to send emergency alert to ${citizen.id}: ${err.message}`);
      }
    }

    if (data.deliveryMethod === 'Push' || data.deliveryMethod === 'All') {
      deliveryStats.Push = pushResults.successCount;
    }

    logger.info(`[CITIZEN] Emergency broadcast to wetland "${wetland}": total=${citizens.length} sent=${sent} failed=${failed} push_success=${pushResults.successCount}`);

    return { total: citizens.length, sent, failed, deliveryStats };
  }

  async getNotificationHistory(citizenId, limit = 50) {
    const citizen = await prisma.citizen.findUnique({ where: { id: citizenId } });
    if (!citizen) throw new AppError('Citizen not found', 404);

    const notifications = await prisma.citizenAlertNotification.findMany({
      where: { citizenId },
      orderBy: { sentAt: 'desc' },
      take: Math.min(Math.max(1, limit), 200),
    });

    return notifications;
  }

  async getAnalytics() {
    const [byDistrict, byWetland, byLanguage, riskDistribution] = await Promise.all([
      prisma.citizen.groupBy({ by: ['district'], _count: true, orderBy: { _count: { district: 'desc' } } }),
      prisma.citizen.groupBy({ by: ['nearbyWetland'], _count: true, orderBy: { _count: { nearbyWetland: 'desc' } } }),
      prisma.citizen.groupBy({ by: ['language'], _count: true, orderBy: { _count: { language: 'desc' } } }),
      prisma.citizen.groupBy({ by: ['riskLevel'], _count: true, orderBy: { _count: { riskLevel: 'desc' } } }),
    ]);

    const [totalCitizens, totalNotifications, deliveredNotifications] = await Promise.all([
      prisma.citizen.count(),
      prisma.citizenAlertNotification.count(),
      prisma.citizenAlertNotification.count({ where: { deliveryStatus: 'delivered' } }),
    ]);

    const alertResponseRate = totalNotifications > 0 ? Math.round((deliveredNotifications / totalNotifications) * 100) : 0;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentNotifications = await prisma.citizenAlertNotification.findMany({
      where: { sentAt: { gte: thirtyDaysAgo } },
      orderBy: { sentAt: 'desc' },
      select: { sentAt: true, severity: true, deliveryStatus: true },
    });

    const activityByDay = {};
    for (const n of recentNotifications) {
      const day = n.sentAt.toISOString().split('T')[0];
      if (!activityByDay[day]) activityByDay[day] = { total: 0, delivered: 0 };
      activityByDay[day].total++;
      if (n.deliveryStatus === 'delivered') activityByDay[day].delivered++;
    }

    return {
      byDistrict: byDistrict.map(r => ({ district: r.district, count: r._count })),
      byWetland: byWetland.map(r => ({ wetland: r.nearbyWetland, count: r._count })),
      byLanguage: byLanguage.map(r => ({ language: r.language, count: r._count })),
      riskDistribution: riskDistribution.map(r => ({ riskLevel: r.riskLevel, count: r._count })),
      alertResponseRate,
      totalCitizens,
      totalNotifications,
      deliveredNotifications,
      recentActivity: activityByDay,
    };
  }

  async exportCitizens(format = 'csv', filters = {}) {
    const where = {};

    if (filters.status) where.status = filters.status;
    if (filters.district) where.district = filters.district;
    if (filters.taluka) where.taluka = filters.taluka;
    if (filters.nearbyWetland || filters.wetland) where.nearbyWetland = filters.nearbyWetland || filters.wetland;

    const citizens = await prisma.citizen.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, fullName: true, mobile: true, whatsapp: true, email: true,
        gender: true, state: true, district: true, taluka: true, village: true,
        pincode: true, nearbyWetland: true, occupation: true, language: true,
        status: true, riskLevel: true, createdAt: true,
      },
    });

    if (format === 'csv') {
      const headers = [
        'ID', 'Full Name', 'Mobile', 'WhatsApp', 'Email', 'Gender',
        'State', 'District', 'Taluka', 'Village', 'Pincode',
        'Nearby Wetland', 'Occupation', 'Language', 'Status', 'Risk Level', 'Created At',
      ];

      const rows = citizens.map(c => [
        c.id, c.fullName, c.mobile, c.whatsapp || '', c.email || '',
        c.gender || '', c.state, c.district, c.taluka || '', c.village || '',
        c.pincode || '', c.nearbyWetland, c.occupation || '', c.language,
        c.status, c.riskLevel, c.createdAt.toISOString(),
      ]);

      const csvContent = [headers.join(','), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
      return { format: 'csv', content: csvContent, count: citizens.length };
    }

    if (format === 'json') {
      return { format: 'json', data: citizens, count: citizens.length };
    }

    return { format, data: citizens, count: citizens.length };
  }

  async auditLog(citizenId, action, target, details, performedBy) {
    try {
      await prisma.citizenAuditLog.create({
        data: {
          citizenId,
          action,
          target: target || null,
          details: details || null,
          performedBy: performedBy || null,
        },
      });
    } catch (err) {
      logger.error(`[CITIZEN] Failed to create audit log: citizenId=${citizenId} action=${action}`, err);
    }
  }

  async saveFcmToken(mobile, token) {
    if (!mobile || !token) throw new AppError('Mobile and FCM token are required', 400);

    const citizen = await prisma.citizen.findFirst({ where: { mobile } });
    if (!citizen) throw new AppError('Citizen not found with this mobile number', 404);

    const updated = await prisma.citizen.update({
      where: { id: citizen.id },
      data: { fcmToken: token, fcmTokenUpdatedAt: new Date() },
    });

    logger.info(`[CITIZEN] FCM token saved for ${citizen.fullName} (${citizen.mobile})`);
    return { citizenId: updated.id, fcmToken: token };
  }

  async saveFcmTokenByCitizenId(citizenId, token) {
    if (!citizenId || !token) throw new AppError('Citizen ID and FCM token are required', 400);

    const citizen = await prisma.citizen.findUnique({ where: { id: citizenId } });
    if (!citizen) throw new AppError('Citizen not found', 404);

    await prisma.citizen.update({
      where: { id: citizenId },
      data: { fcmToken: token, fcmTokenUpdatedAt: new Date() },
    });

    logger.info(`[CITIZEN] FCM token saved for citizen ${citizenId}`);
    return { citizenId, fcmToken: token };
  }

  async getDeliveryStats() {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const [
      totalPushTokens,
      totalNotifications,
      todayNotifications,
      deliveredCount,
      failedCount,
      readCount,
      acknowledgedCount,
      byMethod,
      bySeverity,
    ] = await Promise.all([
      prisma.citizen.count({ where: { fcmToken: { not: null }, status: 'ACTIVE' } }),
      prisma.citizenAlertNotification.count(),
      prisma.citizenAlertNotification.count({ where: { sentAt: { gte: startOfDay } } }),
      prisma.citizenAlertNotification.count({ where: { deliveryStatus: 'delivered' } }),
      prisma.citizenAlertNotification.count({ where: { deliveryStatus: 'failed' } }),
      prisma.citizenAlertNotification.count({ where: { readAt: { not: null } } }),
      prisma.citizenAlertNotification.count({ where: { acknowledgedAt: { not: null } } }),
      prisma.citizenAlertNotification.groupBy({ by: ['deliveryMethod'], _count: true }),
      prisma.citizenAlertNotification.groupBy({ by: ['severity'], _count: true }),
    ]);

    return {
      totalPushTokens,
      totalNotifications,
      todayNotifications,
      deliveredCount,
      failedCount,
      readCount,
      acknowledgedCount,
      deliveryRate: totalNotifications > 0 ? Math.round((deliveredCount / totalNotifications) * 100) : 0,
      readRate: totalNotifications > 0 ? Math.round((readCount / totalNotifications) * 100) : 0,
      byMethod: byMethod.map(r => ({ method: r.deliveryMethod, count: r._count })),
      bySeverity: bySeverity.map(r => ({ severity: r.severity, count: r._count })),
    };
  }

  async getNotificationInbox(mobile) {
    if (!mobile) throw new AppError('Mobile number is required', 400);

    const citizen = await prisma.citizen.findFirst({ where: { mobile } });
    if (!citizen) throw new AppError('Citizen not found with this mobile number', 404);

    const notifications = await prisma.citizenAlertNotification.findMany({
      where: { citizenId: citizen.id },
      orderBy: { sentAt: 'desc' },
      take: 100,
      select: {
        id: true, title: true, severity: true, message: true, wetland: true,
        alertType: true, description: true, recommendedAction: true, clickUrl: true,
        deliveryMethod: true, deliveryStatus: true, language: true,
        sentAt: true, readAt: true, acknowledgedAt: true,
      },
    });

    return {
      citizen: { id: citizen.id, fullName: citizen.fullName, mobile: citizen.mobile, nearbyWetland: citizen.nearbyWetland },
      notifications,
      unreadCount: notifications.filter(n => !n.readAt).length,
    };
  }

  async markNotificationAsRead(notificationId) {
    const notification = await prisma.citizenAlertNotification.findUnique({ where: { id: notificationId } });
    if (!notification) throw new AppError('Notification not found', 404);

    const updated = await prisma.citizenAlertNotification.update({
      where: { id: notificationId },
      data: { readAt: notification.readAt || new Date() },
    });

    return updated;
  }

  async acknowledgeNotification(notificationId) {
    const notification = await prisma.citizenAlertNotification.findUnique({ where: { id: notificationId } });
    if (!notification) throw new AppError('Notification not found', 404);

    const updated = await prisma.citizenAlertNotification.update({
      where: { id: notificationId },
      data: {
        readAt: notification.readAt || new Date(),
        acknowledgedAt: new Date(),
      },
    });

    return updated;
  }
}

module.exports = new CitizenService();
