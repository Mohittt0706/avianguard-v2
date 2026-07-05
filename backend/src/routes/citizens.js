const express = require('express');
const router = express.Router();
const citizenController = require('../controllers/citizenController');
const { authenticate } = require('../middlewares/auth');
const { authorizePermission } = require('../middlewares/permission');

router.post('/fcm-token', citizenController.saveFcmToken);
router.post('/notifications/inbox', citizenController.getNotificationInbox);
router.post('/public-register', citizenController.publicRegister);

router.use(authenticate);

router.get('/stats', authorizePermission('citizens', 'read'), citizenController.getCitizenStats);
router.get('/analytics', authorizePermission('citizens', 'read'), citizenController.getAnalytics);
router.get('/delivery-stats', authorizePermission('citizens', 'read'), citizenController.getDeliveryStats);
router.post('/export', authorizePermission('citizens', 'export'), citizenController.exportCitizens);
router.post('/bulk-status', authorizePermission('citizens', 'update'), citizenController.bulkUpdateStatus);
router.post('/emergency-broadcast', authorizePermission('citizens', 'create'), citizenController.emergencyBroadcast);

router.route('/')
  .get(authorizePermission('citizens', 'read'), citizenController.getCitizens)
  .post(authorizePermission('citizens', 'create'), citizenController.createCitizen);

router.route('/:id')
  .get(authorizePermission('citizens', 'read'), citizenController.getCitizen)
  .put(authorizePermission('citizens', 'update'), citizenController.updateCitizen)
  .delete(authorizePermission('citizens', 'delete'), citizenController.deleteCitizen);

router.patch('/:id/status', authorizePermission('citizens', 'update'), citizenController.updateCitizenStatus);
router.patch('/:id/read', citizenController.markAsRead);
router.patch('/:id/acknowledge', citizenController.acknowledgeNotification);
router.post('/:id/send-alert', authorizePermission('citizens', 'create'), citizenController.sendAlert);
router.post('/:id/test-alert', authorizePermission('citizens', 'update'), citizenController.sendTestAlert);
router.post('/:id/request-info', authorizePermission('citizens', 'update'), citizenController.requestInfo);
router.get('/:id/notifications', authorizePermission('citizens', 'read'), citizenController.getNotificationHistory);

module.exports = router;
