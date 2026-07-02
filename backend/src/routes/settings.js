const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/role');
const { ROLES } = require('../utils/constants');

router.use(authenticate);

router.route('/')
  .get(authorize(ROLES.SUPER_ADMIN, ROLES.DISTRICT_OFFICER, ROLES.OPERATOR), settingController.getSettings)
  .put(authorize(ROLES.SUPER_ADMIN), settingController.bulkUpdateSettings);

router.route('/:key')
  .get(settingController.getSetting)
  .put(authorize(ROLES.SUPER_ADMIN), settingController.updateSetting)
  .delete(authorize(ROLES.SUPER_ADMIN), settingController.resetSetting);

module.exports = router;
