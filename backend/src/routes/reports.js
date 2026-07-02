const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/role');
const { ROLES } = require('../utils/constants');

router.use(authenticate);

router.route('/')
  .get(authorize(ROLES.SUPER_ADMIN, ROLES.DISTRICT_OFFICER, ROLES.OPERATOR), reportController.getReports)
  .post(authorize(ROLES.SUPER_ADMIN, ROLES.DISTRICT_OFFICER), reportController.createReport);

router.route('/:id')
  .get(reportController.getReport)
  .delete(authorize(ROLES.SUPER_ADMIN), reportController.deleteReport);

router.get('/:id/download', reportController.downloadReport);

module.exports = router;
