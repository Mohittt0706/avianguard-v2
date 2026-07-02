const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { createUserSchema, updateUserSchema } = require('../validations/auth');
const { authorize } = require('../middlewares/role');

router.use(authenticate);

router.route('/')
  .get(authorize('SUPER_ADMIN', 'ADMIN'), userController.getUsers)
  .post(authorize('SUPER_ADMIN'), validate(createUserSchema), userController.createUser);

router.route('/:id')
  .get(authorize('SUPER_ADMIN', 'ADMIN'), userController.getUser)
  .patch(authorize('SUPER_ADMIN'), validate(updateUserSchema), userController.updateUser)
  .delete(authorize('SUPER_ADMIN'), userController.deleteUser);

module.exports = router;
