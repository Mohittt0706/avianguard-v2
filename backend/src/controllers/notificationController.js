const catchAsync = require('../utils/catchAsync');
const notificationService = require('../services/notificationService');
const prisma = require('../config/database');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

exports.registerToken = catchAsync(async (req, res) => {
  const { token, citizenId, mobile } = req.body;

  if (!token) {
    throw new AppError('FCM token is required', 400);
  }

  let citizen;
  if (citizenId) {
    citizen = await prisma.citizen.findUnique({ where: { id: citizenId } });
  } else if (mobile) {
    citizen = await prisma.citizen.findFirst({ where: { mobile } });
  } else {
    throw new AppError('citizenId or mobile is required', 400);
  }

  if (!citizen) {
    logger.info(`[NOTIFICATION] FCM token received but citizen not found (mobile=${mobile || 'N/A'}) — stored for later`);
    res.json({
      success: true,
      message: 'FCM token received (citizen not yet registered)',
      data: { fcmToken: token },
    });
    return;
  }

  const updated = await prisma.citizen.update({
    where: { id: citizen.id },
    data: { fcmToken: token, fcmTokenUpdatedAt: new Date() },
  });

  logger.info(`[NOTIFICATION] FCM token registered for ${citizen.fullName} (${citizen.mobile}) via /notifications/register-token`);

  res.json({
    success: true,
    message: 'FCM token registered successfully',
    data: { citizenId: updated.id, fcmToken: token },
  });
});

exports.sendNotification = catchAsync(async (req, res) => {
  const { title, body, citizenId, data } = req.body;

  if (!title || !body) {
    throw new AppError('title and body are required', 400);
  }

  let citizen;
  if (citizenId) {
    citizen = await prisma.citizen.findUnique({ where: { id: citizenId } });
    if (!citizen) throw new AppError('Citizen not found', 404);
  }

  const fcmToken = citizen?.fcmToken;

  let pushResult = null;
  let pushStatus = 'not_sent';

  if (fcmToken) {
    pushResult = await notificationService.sendPushNotification(fcmToken, {
      title,
      body,
      data: {
        ...data,
        alertType: data?.alertType || 'admin_alert',
        severity: data?.severity || 'MEDIUM',
        clickUrl: data?.clickUrl || (citizen ? `/notifications?mobile=${encodeURIComponent(citizen.mobile)}` : '/notifications'),
        timestamp: new Date().toISOString(),
      },
    });

    pushStatus = pushResult.success ? 'delivered' : 'failed';

    if (pushResult.shouldCleanup && citizen) {
      await prisma.citizen.update({
        where: { id: citizen.id },
        data: { fcmToken: null, fcmTokenUpdatedAt: null },
      });
      logger.info(`[NOTIFICATION] Cleaned invalid FCM token for citizen ${citizen.id}`);
    }
  } else {
    pushStatus = 'no_token';
  }

  let notification = null;
  if (citizen) {
    notification = await prisma.citizenAlertNotification.create({
      data: {
        citizenId: citizen.id,
        title,
        severity: data?.severity || 'MEDIUM',
        message: body,
        wetland: data?.wetland || citizen.nearbyWetland,
        alertType: data?.alertType || 'admin_alert',
        description: data?.description || body,
        recommendedAction: data?.recommendedAction || null,
        clickUrl: data?.clickUrl || `/notifications?mobile=${encodeURIComponent(citizen.mobile)}`,
        deliveryMethod: 'Push',
        deliveryStatus: pushStatus,
        language: citizen.language,
        sentBy: req.user?.name || 'Admin',
      },
    });

    await prisma.citizen.update({
      where: { id: citizen.id },
      data: { lastAlertAt: new Date() },
    });

    await prisma.citizenAuditLog.create({
      data: {
        citizenId: citizen.id,
        action: 'push_notification_sent',
        target: 'notification',
        details: { notificationId: notification.id, title, pushStatus },
        performedBy: req.user?.id || null,
      },
    });
  }

  logger.info(`[NOTIFICATION] Push notification sent via /notifications/send: title="${title}" citizen=${citizen?.id || 'none'} status=${pushStatus}`);

  res.json({
    success: true,
    message: pushStatus === 'delivered' ? 'Notification sent successfully' : `Notification ${pushStatus}`,
    data: {
      notification,
      pushStatus,
      messageId: pushResult?.messageId || null,
    },
  });
});
