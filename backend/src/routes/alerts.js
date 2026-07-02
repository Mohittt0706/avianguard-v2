const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const { authenticate } = require('../middlewares/auth');
const { validate, createAlertSchema } = require('../middlewares/validate');
const { authorize } = require('../middlewares/role');
const { ROLES } = require('../utils/constants');

router.use(authenticate);

router.get('/stats', authorize(ROLES.SUPER_ADMIN, ROLES.DISTRICT_OFFICER, ROLES.OPERATOR), alertController.getAlertStats);

router.route('/')
  .get(authorize(ROLES.SUPER_ADMIN, ROLES.DISTRICT_OFFICER, ROLES.OPERATOR), alertController.getAlerts)
  .post(authorize(ROLES.SUPER_ADMIN, ROLES.DISTRICT_OFFICER), validate(createAlertSchema), alertController.createAlert);

router.route('/:id')
  .get(alertController.getAlert);

router.patch('/:id/acknowledge', authorize(ROLES.SUPER_ADMIN, ROLES.DISTRICT_OFFICER, ROLES.OPERATOR), alertController.acknowledgeAlert);
router.patch('/:id/resolve', authorize(ROLES.SUPER_ADMIN, ROLES.DISTRICT_OFFICER), alertController.resolveAlert);
router.patch('/:id/dismiss', authorize(ROLES.SUPER_ADMIN, ROLES.DISTRICT_OFFICER), alertController.dismissAlert);

module.exports = router;
