const catchAsync = require('../utils/catchAsync');
const sensorService = require('../services/sensorService');

exports.getSensors = catchAsync(async (req, res) => {
  const result = await sensorService.getSensors(req.query);
  res.json({ success: true, data: result });
});

exports.getSensor = catchAsync(async (req, res) => {
  const sensor = await sensorService.getSensor(req.params.id);
  res.json({ success: true, data: { sensor } });
});

exports.createSensor = catchAsync(async (req, res) => {
  const sensor = await sensorService.createSensor(req.body);
  res.status(201).json({ success: true, message: 'Sensor created successfully', data: { sensor } });
});

exports.updateSensor = catchAsync(async (req, res) => {
  const sensor = await sensorService.updateSensor(req.params.id, req.body);
  res.json({ success: true, message: 'Sensor updated successfully', data: { sensor } });
});

exports.deleteSensor = catchAsync(async (req, res) => {
  await sensorService.deleteSensor(req.params.id);
  res.json({ success: true, message: 'Sensor deleted successfully' });
});

exports.updateSensorStatus = catchAsync(async (req, res) => {
  const sensor = await sensorService.updateSensorStatus(req.params.id, req.body.status);
  res.json({ success: true, message: 'Sensor status updated', data: { sensor } });
});

exports.getSensorStats = catchAsync(async (req, res) => {
  const stats = await sensorService.getSensorStats();
  res.json({ success: true, data: stats });
});
