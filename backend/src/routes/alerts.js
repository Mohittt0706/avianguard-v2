const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/role');
const { authorizePermission } = require('../middlewares/permission');
const { validate } = require('../middlewares/validate');
const { createAlertSchema, resolveAlertSchema, alertQuerySchema } = require('../validations/alert');

router.use(authenticate);

router.get('/stats', authorizePermission('alerts', 'read'), alertController.getAlertStats);

router.route('/')
  .get(authorizePermission('alerts', 'read'), validate(alertQuerySchema), alertController.getAlerts)
  .post(authorizePermission('alerts', 'create'), validate(createAlertSchema), alertController.createAlert);

router.route('/:id')
  .get(authorizePermission('alerts', 'read'), alertController.getAlert)
  .delete(authorizePermission('alerts', 'delete'), alertController.deleteAlert);

router.patch('/:id/acknowledge', authorizePermission('alerts', 'update'), alertController.acknowledgeAlert);
router.patch('/:id/resolve', authorizePermission('alerts', 'update'), validate(resolveAlertSchema), alertController.resolveAlert);
router.patch('/:id/citizen-notify', authorizePermission('alerts', 'update'), alertController.markCitizenNotified);

module.exports = router;
