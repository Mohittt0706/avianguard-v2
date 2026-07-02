const express = require('express');
const router = express.Router();
const citizenController = require('../controllers/citizenController');
const { authenticate } = require('../middlewares/auth');
const { validate, updateCitizenSchema } = require('../middlewares/validate');
const { authorize } = require('../middlewares/role');
const { ROLES } = require('../utils/constants');

router.use(authenticate);

router.get('/stats', authorize(ROLES.SUPER_ADMIN, ROLES.DISTRICT_OFFICER, ROLES.OPERATOR), citizenController.getCitizenStats);
router.post('/export', authorize(ROLES.SUPER_ADMIN, ROLES.DISTRICT_OFFICER), citizenController.exportCitizens);
router.post('/bulk-status', authorize(ROLES.SUPER_ADMIN, ROLES.DISTRICT_OFFICER), citizenController.bulkUpdateStatus);

router.route('/')
  .get(authorize(ROLES.SUPER_ADMIN, ROLES.DISTRICT_OFFICER, ROLES.OPERATOR), citizenController.getCitizens)
  .post(authorize(ROLES.SUPER_ADMIN, ROLES.DISTRICT_OFFICER), citizenController.createCitizen);

router.route('/:id')
  .get(citizenController.getCitizen)
  .put(authorize(ROLES.SUPER_ADMIN, ROLES.DISTRICT_OFFICER), validate(updateCitizenSchema), citizenController.updateCitizen)
  .delete(authorize(ROLES.SUPER_ADMIN), citizenController.deleteCitizen);

router.patch('/:id/status', authorize(ROLES.SUPER_ADMIN, ROLES.DISTRICT_OFFICER), citizenController.updateCitizenStatus);
router.post('/:id/test-alert', authorize(ROLES.SUPER_ADMIN, ROLES.DISTRICT_OFFICER), citizenController.sendTestAlert);
router.post('/:id/request-info', authorize(ROLES.SUPER_ADMIN, ROLES.DISTRICT_OFFICER), citizenController.requestInfo);
router.get('/:id/notifications', citizenController.getNotificationHistory);

module.exports = router;
