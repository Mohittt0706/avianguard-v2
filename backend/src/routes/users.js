const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/role');
const { authorizePermission } = require('../middlewares/permission');
const { validate } = require('../middlewares/validate');
const { createUserSchema, updateUserSchema } = require('../validations/auth');
const upload = require('../middlewares/upload');

router.use(authenticate);

router.get('/stats', authorizePermission('users', 'read'), userController.getStats);
router.get('/departments', authorizePermission('users', 'read'), userController.getDepartments);

router.post('/bulk', authorizePermission('users', 'update'), userController.bulkAction);

router.route('/')
  .get(authorizePermission('users', 'read'), userController.getUsers)
  .post(authorizePermission('users', 'create'), validate(createUserSchema), userController.createUser);

router.route('/:id')
  .get(authorizePermission('users', 'read'), userController.getUser)
  .patch(authorizePermission('users', 'update'), validate(updateUserSchema), userController.updateUser)
  .delete(authorizePermission('users', 'delete'), userController.deleteUser);

router.post('/:id/reset-password', authorizePermission('users', 'update'), userController.resetPassword);
router.patch('/:id/toggle-status', authorizePermission('users', 'update'), userController.toggleStatus);
router.post('/:id/avatar', authorizePermission('users', 'update'), upload.single('avatar'), userController.uploadAvatar);
router.get('/:id/login-history', authorizePermission('users', 'read'), userController.getLoginHistory);
router.get('/:id/audit-logs', authorizePermission('users', 'read'), userController.getAuditLogs);

module.exports = router;
