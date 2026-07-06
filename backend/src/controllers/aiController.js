const catchAsync = require('../utils/catchAsync');
const aiService = require('../services/aiService');

exports.getAnalysis = catchAsync(async (req, res) => {
  const data = await aiService.getAnalysis();
  res.json({ success: true, data });
});
