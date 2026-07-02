const authService = require('../services/authService');
const catchAsync = require('../utils/catchAsync');

exports.getUsers = catchAsync(async (req, res) => {
  const result = await authService.getUsers(req.query);
  res.json({
    success: true,
    data: result,
  });
});

exports.getUser = catchAsync(async (req, res) => {
  const user = await authService.getUserById(req.params.id);
  res.json({
    success: true,
    data: { user },
  });
});

exports.createUser = catchAsync(async (req, res) => {
  const user = await authService.createUser(req.body);
  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: { user },
  });
});

exports.updateUser = catchAsync(async (req, res) => {
  const user = await authService.updateUser(req.params.id, req.body);
  res.json({
    success: true,
    message: 'User updated successfully',
    data: { user },
  });
});

exports.deleteUser = catchAsync(async (req, res) => {
  await authService.deleteUser(req.params.id);
  res.json({
    success: true,
    message: 'User deleted successfully',
  });
});
