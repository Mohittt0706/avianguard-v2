const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const { authenticate } = require('../middlewares/auth');
const { authorizePermission } = require('../middlewares/permission');

router.use(authenticate);

router.get('/health', authorizePermission('settings', 'read'), settingController.getSystemHealth);
router.get('/audit-logs', authorizePermission('settings', 'read'), settingController.getAuditLogs);
router.post('/audit-log', authorizePermission('settings', 'read'), settingController.logAudit);

router.get('/alert-thresholds', authorizePermission('settings', 'read'), settingController.getAlertThresholds);
router.put('/alert-thresholds', authorizePermission('settings', 'update'), settingController.updateAlertThresholds);

router.post('/backup', authorizePermission('settings', 'update'), settingController.backupDatabase);
router.post('/restore', authorizePermission('settings', 'update'), settingController.restoreDatabase);

router.post('/change-password', authorizePermission('settings', 'update'), settingController.changePassword);

router.route('/')
  .get(authorizePermission('settings', 'read'), settingController.getSettings)
  .put(authorizePermission('settings', 'update'), settingController.bulkUpdateSettings);

router.route('/:key')
  .get(authorizePermission('settings', 'read'), settingController.getSetting)
  .put(authorizePermission('settings', 'update'), settingController.updateSetting)
  .delete(authorizePermission('settings', 'update'), settingController.resetSetting);

module.exports = router;
