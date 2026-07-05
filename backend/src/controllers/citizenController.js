const catchAsync = require('../utils/catchAsync');
const citizenService = require('../services/citizenService');

exports.getCitizens = catchAsync(async (req, res) => {
  const result = await citizenService.getCitizens(req.query);
  res.json({ success: true, data: result });
});

exports.getCitizen = catchAsync(async (req, res) => {
  const citizen = await citizenService.getCitizenById(req.params.id);
  res.json({ success: true, data: { citizen } });
});

exports.createCitizen = catchAsync(async (req, res) => {
  const citizen = await citizenService.createCitizen(req.body);
  res.status(201).json({ success: true, message: 'Citizen registered successfully', data: { citizen } });
});

exports.publicRegister = catchAsync(async (req, res) => {
  const citizen = await citizenService.createCitizen({
    ...req.body,
    status: 'PENDING',
  });
  res.status(201).json({ success: true, message: 'Registration submitted successfully', data: { citizen } });
});

exports.updateCitizen = catchAsync(async (req, res) => {
  const citizen = await citizenService.updateCitizen(req.params.id, req.body);
  res.json({ success: true, message: 'Citizen updated successfully', data: { citizen } });
});

exports.deleteCitizen = catchAsync(async (req, res) => {
  await citizenService.deleteCitizen(req.params.id);
  res.json({ success: true, message: 'Citizen deleted successfully' });
});

exports.updateCitizenStatus = catchAsync(async (req, res) => {
  const { status, reason } = req.body;
  const citizen = await citizenService.updateStatus(req.params.id, status, reason);
  res.json({ success: true, message: `Citizen status updated to ${status}`, data: { citizen } });
});

exports.bulkUpdateStatus = catchAsync(async (req, res) => {
  const { ids, action, data } = req.body;
  const result = await citizenService.bulkAction(ids, action, data);
  res.json({ success: true, message: `Bulk ${action} completed`, data: result });
});

exports.getCitizenStats = catchAsync(async (req, res) => {
  const stats = await citizenService.getStats();
  res.json({ success: true, data: stats });
});

exports.sendAlert = catchAsync(async (req, res) => {
  const notification = await citizenService.sendAlert(req.params.id, {
    ...req.body,
    sentBy: req.user?.name || 'Admin',
  });
  res.json({ success: true, message: 'Alert sent successfully', data: { notification } });
});

exports.emergencyBroadcast = catchAsync(async (req, res) => {
  const result = await citizenService.emergencyBroadcast(req.body.wetland, {
    ...req.body,
    sentBy: req.user?.name || 'Admin',
  });
  res.json({ success: true, message: `Broadcast sent to ${result.sent} citizens`, data: result });
});

exports.getNotificationHistory = catchAsync(async (req, res) => {
  const notifications = await citizenService.getNotificationHistory(req.params.id, parseInt(req.query.limit) || 50);
  res.json({ success: true, data: notifications });
});

exports.getAnalytics = catchAsync(async (req, res) => {
  const analytics = await citizenService.getAnalytics();
  res.json({ success: true, data: analytics });
});

exports.exportCitizens = catchAsync(async (req, res) => {
  const { format, ...filters } = req.body;
  const data = await citizenService.exportCitizens(format || 'csv', filters);
  res.json({ success: true, data });
});

exports.sendTestAlert = catchAsync(async (req, res) => {
  const { methods } = req.body;
  const notifications = [];
  for (const method of (methods || ['SMS'])) {
    const n = await citizenService.sendAlert(req.params.id, {
      title: 'Test Alert',
      severity: 'LOW',
      message: 'This is a test alert from AvianGuard.',
      wetland: null,
      language: 'Hindi',
      deliveryMethod: method,
      sentBy: req.user?.name || 'Admin',
    });
    notifications.push(n);
  }
  res.json({ success: true, message: 'Test alerts sent', data: { notifications } });
});

exports.requestInfo = catchAsync(async (req, res) => {
  const { message } = req.body;
  await citizenService.updateStatus(req.params.id, 'PENDING_VERIFICATION', message);
  await citizenService.auditLog(req.params.id, 'request_info', 'citizen', { message }, req.user?.id);
  res.json({ success: true, message: 'Information request sent' });
});

exports.saveFcmToken = catchAsync(async (req, res) => {
  const { mobile, token, citizenId } = req.body;
  if (!token) {
    return res.status(400).json({ success: false, message: 'FCM token is required' });
  }

  try {
    let result;
    if (citizenId) {
      result = await citizenService.saveFcmTokenByCitizenId(citizenId, token);
    } else if (mobile) {
      result = await citizenService.saveFcmToken(mobile, token);
    } else {
      return res.status(400).json({ success: false, message: 'Mobile or citizenId is required' });
    }
    res.json({ success: true, message: 'FCM token saved', data: result });
  } catch (err) {
    if (err.statusCode === 404) {
      res.json({ success: true, message: 'FCM token received (citizen not yet in system)', data: { fcmToken: token } });
    } else {
      throw err;
    }
  }
});

exports.getDeliveryStats = catchAsync(async (req, res) => {
  const stats = await citizenService.getDeliveryStats();
  res.json({ success: true, data: stats });
});

exports.getNotificationInbox = catchAsync(async (req, res) => {
  const { mobile } = req.body;
  if (!mobile) {
    return res.status(400).json({ success: false, message: 'Mobile number is required' });
  }
  const result = await citizenService.getNotificationInbox(mobile);
  res.json({ success: true, data: result });
});

exports.markAsRead = catchAsync(async (req, res) => {
  const notification = await citizenService.markNotificationAsRead(req.params.id);
  res.json({ success: true, message: 'Marked as read', data: { notification } });
});

exports.acknowledgeNotification = catchAsync(async (req, res) => {
  const notification = await citizenService.acknowledgeNotification(req.params.id);
  res.json({ success: true, message: 'Notification acknowledged', data: { notification } });
});
