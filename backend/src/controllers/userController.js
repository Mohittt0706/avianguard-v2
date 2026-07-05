const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const userService = require('../services/userService');

function auditLog(userId, action, target, details) {
  userService.logAudit(userId, action, target, details).catch(() => {});
}

exports.getUsers = catchAsync(async (req, res) => {
  const result = await userService.getUsers(req.query);
  res.json({ success: true, data: result });
});

exports.getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  res.json({ success: true, data: { user } });
});

exports.createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  auditLog(req.user.id, 'create', `user:${user.id}`, { name: user.name, email: user.email, role: user.role });
  res.status(201).json({ success: true, message: 'User created successfully', data: { user } });
});

exports.updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body);
  auditLog(req.user.id, 'update', `user:${user.id}`, { name: user.name, fields: Object.keys(req.body) });
  res.json({ success: true, message: 'User updated successfully', data: { user } });
});

exports.deleteUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  await userService.deleteUser(req.params.id);
  auditLog(req.user.id, 'delete', `user:${req.params.id}`, { name: user.name, email: user.email });
  res.json({ success: true, message: 'User deleted successfully' });
});

exports.bulkAction = catchAsync(async (req, res) => {
  const { ids, action, data } = req.body;
  const result = await userService.bulkAction(ids, action, data);
  auditLog(req.user.id, 'bulk_action', 'users', { action, count: ids.length, data });
  res.json({ success: true, message: `Bulk ${action} completed`, data: result });
});

exports.resetPassword = catchAsync(async (req, res) => {
  const result = await userService.resetPassword(req.params.id);
  auditLog(req.user.id, 'reset_password', `user:${req.params.id}`, { email: result.email });
  res.json({ success: true, message: 'Password reset successfully', data: result });
});

exports.toggleStatus = catchAsync(async (req, res) => {
  const user = await userService.toggleStatus(req.params.id);
  auditLog(req.user.id, 'toggle_status', `user:${user.id}`, { name: user.name, newStatus: user.accountStatus });
  res.json({ success: true, message: 'Status toggled', data: { user } });
});

exports.uploadAvatar = catchAsync(async (req, res) => {
  if (!req.file) throw new AppError('No file uploaded', 400);
  const user = await userService.uploadAvatar(req.params.id, `/uploads/${req.file.filename}`);
  auditLog(req.user.id, 'update', `user:${req.params.id}`, { action: 'avatar_upload' });
  res.json({ success: true, message: 'Avatar uploaded', data: user });
});

exports.getStats = catchAsync(async (req, res) => {
  const stats = await userService.getStats();
  res.json({ success: true, data: stats });
});

exports.getLoginHistory = catchAsync(async (req, res) => {
  const history = await userService.getLoginHistory(req.params.id);
  res.json({ success: true, data: history });
});

exports.getAuditLogs = catchAsync(async (req, res) => {
  const logs = await userService.getAuditLogs(req.params.id);
  res.json({ success: true, data: logs });
});

exports.getDepartments = catchAsync(async (req, res) => {
  const departments = await userService.getDepartments();
  res.json({ success: true, data: departments });
});
