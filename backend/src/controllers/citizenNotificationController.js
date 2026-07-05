const catchAsync = require('../utils/catchAsync');
const citizenNotificationService = require('../services/citizenNotificationService');
const alertService = require('../services/alertService');

exports.createNotification = catchAsync(async (req, res) => {
  const notification = await citizenNotificationService.create({
    ...req.body,
    sentBy: req.user?.name || 'System',
  });

  if (req.body.alertId) {
    try {
      await alertService.markCitizenNotified(req.body.alertId, req.user?.name || 'System');
    } catch (_) {}
  }

  res.status(201).json({ success: true, message: 'Citizen notification sent', data: { notification } });
});

exports.getNotifications = catchAsync(async (req, res) => {
  const result = await citizenNotificationService.getAll(req.query);
  res.json({ success: true, data: result });
});

exports.getNotification = catchAsync(async (req, res) => {
  const notification = await citizenNotificationService.getById(req.params.id);
  res.json({ success: true, data: { notification } });
});

exports.getStats = catchAsync(async (req, res) => {
  const stats = await citizenNotificationService.getStats();
  res.json({ success: true, data: stats });
});
