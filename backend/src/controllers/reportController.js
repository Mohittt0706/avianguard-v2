const catchAsync = require('../utils/catchAsync');
const reportService = require('../services/reportService');

exports.getReports = catchAsync(async (req, res) => {
  const result = await reportService.getReports(req.query);
  res.json({ success: true, data: result });
});

exports.getReport = catchAsync(async (req, res) => {
  const report = await reportService.getReport(req.params.id);
  res.json({ success: true, data: { report } });
});

exports.getReportByShareToken = catchAsync(async (req, res) => {
  const report = await reportService.getReportByShareToken(req.params.token);
  res.json({ success: true, data: { report } });
});

exports.createReport = catchAsync(async (req, res) => {
  const report = await reportService.createReport({
    ...req.body,
    generatedBy: req.user?.name || 'System',
  });
  res.status(201).json({ success: true, message: 'Report generation started', data: { report } });
});

exports.updateReport = catchAsync(async (req, res) => {
  const report = await reportService.updateReport(req.params.id, req.body);
  res.json({ success: true, message: 'Report updated', data: { report } });
});

exports.deleteReport = catchAsync(async (req, res) => {
  await reportService.deleteReport(req.params.id);
  res.json({ success: true, message: 'Report deleted' });
});

exports.shareReport = catchAsync(async (req, res) => {
  const report = await reportService.shareReport(req.params.id);
  res.json({ success: true, data: { shareToken: report.shareToken } });
});

exports.getReportStats = catchAsync(async (req, res) => {
  const stats = await reportService.getStats();
  res.json({ success: true, data: stats });
});

exports.getCsvData = catchAsync(async (req, res) => {
  const data = await reportService.getCsvData(req.params.id);
  res.json({ success: true, data });
});

exports.getRecentActivity = catchAsync(async (req, res) => {
  const activity = await reportService.getRecentActivity(parseInt(req.query.limit, 10) || 10);
  res.json({ success: true, data: activity });
});
