const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/role');
const { authorizePermission } = require('../middlewares/permission');
const { validate } = require('../middlewares/validate');
const { createReportSchema, updateReportSchema } = require('../validations/report');

router.use(authenticate);

router.get('/stats', authorizePermission('reports', 'read'), reportController.getReportStats);
router.get('/activity', authorizePermission('reports', 'read'), reportController.getRecentActivity);

router.route('/')
  .get(authorizePermission('reports', 'read'), reportController.getReports)
  .post(authorizePermission('reports', 'create'), validate(createReportSchema), reportController.createReport);

router.get('/share/:token', reportController.getReportByShareToken);

router.route('/:id')
  .get(authorizePermission('reports', 'read'), reportController.getReport)
  .patch(authorizePermission('reports', 'update'), validate(updateReportSchema), reportController.updateReport)
  .delete(authorizePermission('reports', 'delete'), reportController.deleteReport);

router.post('/:id/share', authorizePermission('reports', 'update'), reportController.shareReport);
router.get('/:id/csv', authorizePermission('reports', 'export'), reportController.getCsvData);

module.exports = router;
