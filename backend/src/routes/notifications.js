const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const { authorizePermission } = require('../middlewares/permission');
const notificationController = require('../controllers/notificationController');

router.post('/register-token', notificationController.registerToken);

router.post('/send', authenticate, authorizePermission('citizens', 'create'), notificationController.sendNotification);

module.exports = router;
