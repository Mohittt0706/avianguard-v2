const catchAsync = require('../utils/catchAsync');
const readingService = require('../services/readingService');

exports.createReading = catchAsync(async (req, res) => {
  const result = await readingService.createReading(req.params.id, req.body);
  res.status(201).json({
    success: true,
    message: 'Reading recorded successfully',
    data: result,
  });
});

exports.getReadings = catchAsync(async (req, res) => {
  const result = await readingService.getReadings(req.params.id, req.query);
  res.json({ success: true, data: result });
});

exports.getLiveReadings = catchAsync(async (req, res) => {
  const readings = await readingService.getLiveReadings();
  res.json({ success: true, data: { sensors: readings } });
});
