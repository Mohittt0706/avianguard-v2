const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/sensorController');
const readingController = require('../controllers/readingController');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/role');
const { authorizePermission } = require('../middlewares/permission');
const { validate } = require('../middlewares/validate');
const { createSensorSchema, updateSensorSchema, updateSensorStatusSchema } = require('../validations/sensor');
const { createReadingSchema, readingQuerySchema } = require('../validations/reading');
const { ROLES } = require('../utils/constants');

router.use(authenticate);

router.get('/stats', authorizePermission('sensors', 'read'), sensorController.getSensorStats);

router.get('/live', authorizePermission('sensors', 'read'), readingController.getLiveReadings);

router.route('/')
  .get(authorizePermission('sensors', 'read'), sensorController.getSensors)
  .post(authorizePermission('sensors', 'create'), validate(createSensorSchema), sensorController.createSensor);

router.post('/:id/reading', authorizePermission('sensors', 'update'), validate(createReadingSchema), readingController.createReading);
router.get('/:id/readings', authorizePermission('sensors', 'read'), validate(readingQuerySchema), readingController.getReadings);

router.route('/:id')
  .get(authorizePermission('sensors', 'read'), sensorController.getSensor)
  .patch(authorizePermission('sensors', 'update'), validate(updateSensorSchema), sensorController.updateSensor)
  .delete(authorizePermission('sensors', 'delete'), sensorController.deleteSensor);

router.patch('/:id/status', authorizePermission('sensors', 'update'), validate(updateSensorStatusSchema), sensorController.updateSensorStatus);

module.exports = router;
