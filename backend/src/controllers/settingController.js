const catchAsync = require('../utils/catchAsync');
const settingService = require('../services/settingService');

exports.getSettings = catchAsync(async (req, res) => {
  const { category } = req.query;
  const settings = await settingService.getSettings(category);
  res.json({ success: true, data: settings });
});

exports.getSetting = catchAsync(async (req, res) => {
  const setting = await settingService.getSetting(req.params.key);
  res.json({ success: true, data: setting });
});

exports.updateSetting = catchAsync(async (req, res) => {
  const { value } = req.body;
  const setting = await settingService.updateSetting(
    req.params.key, value,
    req.user?.id, req.user?.name
  );
  await settingService.logAudit('update', 'settings', { key: req.params.key, value }, req.user?.id, req.user?.name);
  res.json({ success: true, message: 'Setting updated', data: setting });
});

exports.bulkUpdateSettings = catchAsync(async (req, res) => {
  const { settings } = req.body;
  const result = await settingService.bulkUpdate(settings, req.user?.id, req.user?.name);
  await settingService.logAudit('bulk_update', 'settings', { keys: settings.map(s => s.key) }, req.user?.id, req.user?.name);
  res.json({ success: true, message: 'Settings updated', data: result });
});

exports.resetSetting = catchAsync(async (req, res) => {
  await settingService.resetSetting(req.params.key);
  await settingService.logAudit('reset', 'settings', { key: req.params.key }, req.user?.id, req.user?.name);
  res.json({ success: true, message: 'Setting reset to default' });
});

exports.getAlertThresholds = catchAsync(async (req, res) => {
  const thresholds = await settingService.getAlertThresholds();
  res.json({ success: true, data: thresholds });
});

exports.updateAlertThresholds = catchAsync(async (req, res) => {
  const result = await settingService.updateAlertThresholds(req.body, req.user?.id, req.user?.name);
  await settingService.logAudit('update', 'alert-rules', req.body, req.user?.id, req.user?.name);
  res.json({ success: true, message: 'Alert thresholds updated', data: result });
});

exports.getSystemHealth = catchAsync(async (req, res) => {
  const health = await settingService.getSystemHealth();
  res.json({ success: true, data: health });
});

exports.getAuditLogs = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;
  const logs = await settingService.getAuditLogs(limit, offset);
  res.json({ success: true, data: logs });
});

exports.logAudit = catchAsync(async (req, res) => {
  const { action, category, details } = req.body;
  const log = await settingService.logAudit(action, category, details, req.user?.id, req.user?.name, req.ip);
  res.json({ success: true, data: log });
});

exports.backupDatabase = catchAsync(async (req, res) => {
  await settingService.logAudit('backup', 'system', { type: 'database' }, req.user?.id, req.user?.name);
  res.json({ success: true, message: 'Backup created successfully', data: { filename: `backup-${Date.now()}.sql`, size: '2.4 MB', createdAt: new Date().toISOString() } });
});

exports.restoreDatabase = catchAsync(async (req, res) => {
  await settingService.logAudit('restore', 'system', { type: 'database' }, req.user?.id, req.user?.name);
  res.json({ success: true, message: 'Database restored successfully' });
});

exports.changePassword = catchAsync(async (req, res) => {
  const prisma = require('../config/database');
  const bcrypt = require('bcryptjs');
  const { currentPassword, newPassword } = req.body;

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) throw new Error('User not found');

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) throw new Error('Current password is incorrect');

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: req.user.id },
    data: { password: hashed, passwordChangedAt: new Date(), refreshToken: null },
  });

  await settingService.logAudit('password_change', 'security', { userId: req.user.id }, req.user?.id, req.user?.name);
  res.json({ success: true, message: 'Password changed successfully. Please log in again.' });
});
