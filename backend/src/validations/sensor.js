const { z } = require('zod');

const SENSOR_STATUSES = ['online', 'offline', 'warning', 'maintenance'];

const createSensorSchema = z.object({
  body: z.object({
    sensorId: z.string().trim().min(1, 'Sensor ID is required'),
    name: z.string().trim().min(1, 'Name is required').max(200),
    location: z.string().trim().optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    wetland: z.string().trim().optional(),
    status: z.enum(SENSOR_STATUSES).optional(),
    temperature: z.number().optional(),
    ph: z.number().optional(),
    tds: z.number().optional(),
    dissolvedOxygen: z.number().optional(),
    waterLevel: z.number().optional(),
    battery: z.number().min(0).max(100).optional(),
    signalStrength: z.number().min(0).max(100).optional(),
    lastReading: z.number().optional(),
    lastSeen: z.string().datetime().optional(),
  }),
});

const updateSensorSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).max(200).optional(),
    location: z.string().trim().optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    wetland: z.string().trim().optional(),
    status: z.enum(SENSOR_STATUSES).optional(),
    temperature: z.number().optional(),
    ph: z.number().optional(),
    tds: z.number().optional(),
    dissolvedOxygen: z.number().optional(),
    waterLevel: z.number().optional(),
    battery: z.number().min(0).max(100).optional(),
    signalStrength: z.number().min(0).max(100).optional(),
    lastReading: z.number().optional(),
    lastSeen: z.string().datetime().optional(),
  }),
});

const updateSensorStatusSchema = z.object({
  body: z.object({
    status: z.enum(SENSOR_STATUSES),
  }),
});

module.exports = {
  createSensorSchema,
  updateSensorSchema,
  updateSensorStatusSchema,
};
