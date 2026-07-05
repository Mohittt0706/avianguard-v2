const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const userRoutes = require('./users');
const dashboardRoutes = require('./dashboard');
const sensorRoutes = require('./sensors');
const alertRoutes = require('./alerts');
const citizenRoutes = require('./citizens');
const reportRoutes = require('./reports');
const aiRoutes = require('./ai');
const citizenNotificationRoutes = require('./citizenNotifications');
const settingsRoutes = require('./settings');
const notificationsRoutes = require('./notifications');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/sensors', sensorRoutes);
router.use('/alerts', alertRoutes);
router.use('/citizens', citizenRoutes);
router.use('/reports', reportRoutes);
router.use('/ai', aiRoutes);
router.use('/citizen-notifications', citizenNotificationRoutes);
router.use('/settings', settingsRoutes);
router.use('/notifications', notificationsRoutes);

router.get('/health', (_req, res) => {
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

module.exports = router;
