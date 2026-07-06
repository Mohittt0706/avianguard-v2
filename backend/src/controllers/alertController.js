const catchAsync = require('../utils/catchAsync');
const alertService = require('../services/alertService');

exports.getAlerts = catchAsync(async (req, res) => {
  const result = await alertService.getAlerts(req.query);
  res.json({ success: true, data: result });
});

exports.getAlert = catchAsync(async (req, res) => {
  const alert = await alertService.getAlert(req.params.id);
  res.json({ success: true, data: { alert } });
});

exports.createAlert = catchAsync(async (req, res) => {
  const alert = await alertService.createAlert(req.body);
  res.status(201).json({ success: true, message: 'Alert created successfully', data: { alert } });
});

exports.acknowledgeAlert = catchAsync(async (req, res) => {
  const alert = await alertService.acknowledgeAlert(req.params.id);
  res.json({ success: true, message: 'Alert acknowledged', data: { alert } });
});

exports.resolveAlert = catchAsync(async (req, res) => {
  const alert = await alertService.resolveAlert(req.params.id, req.body.resolvedBy || req.user?.name || 'Unknown');
  res.json({ success: true, message: 'Alert resolved', data: { alert } });
});

exports.markCitizenNotified = catchAsync(async (req, res) => {
  const alert = await alertService.markCitizenNotified(req.params.id, req.user?.name || 'System');
  res.json({ success: true, message: 'Citizen notified', data: { alert } });
});

exports.deleteAlert = catchAsync(async (req, res) => {
  await alertService.deleteAlert(req.params.id);
  res.json({ success: true, message: 'Alert deleted' });
});

exports.getAlertStats = catchAsync(async (req, res) => {
  const stats = await alertService.getStats();
  res.json({ success: true, data: stats });
});
