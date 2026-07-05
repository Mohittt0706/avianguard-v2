const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/role');
const { ROLES } = require('../utils/constants');

router.use(authenticate);

router.get('/analysis', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.OPERATOR), aiController.getAnalysis);

module.exports = router;
