const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/sensorController');
const readingController = require('../controllers/readingController');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/role');
const { validate } = require('../middlewares/validate');
const { createSensorSchema, updateSensorSchema, updateSensorStatusSchema } = require('../validations/sensor');
const { createReadingSchema, readingQuerySchema } = require('../validations/reading');
const { ROLES } = require('../utils/constants');

router.use(authenticate);

router.get('/stats', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.OPERATOR), sensorController.getSensorStats);

router.get('/live', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.OPERATOR), readingController.getLiveReadings);

router.route('/')
  .get(authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.OPERATOR), sensorController.getSensors)
  .post(authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), validate(createSensorSchema), sensorController.createSensor);

router.post('/:id/reading', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.OPERATOR), validate(createReadingSchema), readingController.createReading);
router.get('/:id/readings', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.OPERATOR), validate(readingQuerySchema), readingController.getReadings);

router.route('/:id')
  .get(sensorController.getSensor)
  .patch(authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), validate(updateSensorSchema), sensorController.updateSensor)
  .delete(authorize(ROLES.SUPER_ADMIN), sensorController.deleteSensor);

router.patch('/:id/status', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.OPERATOR), validate(updateSensorStatusSchema), sensorController.updateSensorStatus);

module.exports = router;
