const authService = require('../services/authService');
const catchAsync = require('../utils/catchAsync');

exports.register = catchAsync(async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: result,
  });
});

exports.login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  res.json({
    success: true,
    message: 'Login successful',
    data: result,
  });
});

exports.refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      message: 'Refresh token is required',
    });
  }
  const result = await authService.refreshAccessToken(refreshToken);
  res.json({
    success: true,
    message: 'Token refreshed successfully',
    data: result,
  });
});

exports.logout = catchAsync(async (req, res) => {
  await authService.logout(req.user.id);
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

exports.getMe = catchAsync(async (req, res) => {
  const user = await authService.getMe(req.user.id);
  res.json({
    success: true,
    data: { user },
  });
});

exports.changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await authService.changePassword(req.user.id, currentPassword, newPassword);
  res.json({
    success: true,
    message: 'Password changed successfully. Please log in again.',
  });
});
