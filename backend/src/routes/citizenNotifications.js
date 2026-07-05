const express = require('express');
const router = express.Router();
const citizenService = require('../services/citizenService');
const { authenticate } = require('../middlewares/auth');
const { authorizePermission } = require('../middlewares/permission');
const catchAsync = require('../utils/catchAsync');

router.use(authenticate);

router.get('/stats', authorizePermission('citizens', 'read'), catchAsync(async (req, res) => {
  const stats = await citizenService.getStats();
  res.json({ success: true, data: stats });
}));

router.post('/emergency-broadcast', authorizePermission('citizens', 'create'), catchAsync(async (req, res) => {
  const result = await citizenService.emergencyBroadcast(req.body.wetland, req.body);
  res.json({ success: true, message: `Broadcast sent to ${result.sent} citizens`, data: result });
}));

module.exports = router;
