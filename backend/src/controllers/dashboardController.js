const catchAsync = require('../utils/catchAsync');
const dashboardService = require('../services/dashboardService');

exports.getDashboard = catchAsync(async (req, res) => {
  const data = await dashboardService.getDashboardStats();
  res.json({ success: true, data });
});
