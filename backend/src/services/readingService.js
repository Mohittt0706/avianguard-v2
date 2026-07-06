const prisma = require('../config/database');
const AppError = require('../utils/AppError');
const { emitSensorReading } = require('../socket');
const alertService = require('./alertService');
const logger = require('../utils/logger');

class ReadingService {
  _calculateStatus(reading) {
    const DANGER_TEMP = 35;
    const WARN_TEMP = 30;
    const DANGER_PH_LOW = 6.0;
    const DANGER_PH_HIGH = 9.0;
    const WARN_PH_LOW = 6.5;
    const WARN_PH_HIGH = 8.5;
    const DANGER_DO = 2;
    const WARN_DO = 4;
    const DANGER_TDS = 500;
    const WARN_TDS = 300;
    const DANGER_WATER = 9;
    const WARN_WATER = 7;

    const isCritical =
      reading.temperature >= DANGER_TEMP ||
      reading.ph <= DANGER_PH_LOW ||
      reading.ph >= DANGER_PH_HIGH ||
      reading.dissolvedOxygen <= DANGER_DO ||
      reading.tds >= DANGER_TDS ||
      reading.waterLevel >= DANGER_WATER ||
      (reading.battery != null && reading.battery < 10);

    if (isCritical) return 'warning';

    const isWarning =
      reading.temperature >= WARN_TEMP ||
      reading.ph <= WARN_PH_LOW ||
      reading.ph >= WARN_PH_HIGH ||
      reading.dissolvedOxygen <= WARN_DO ||
      reading.tds >= WARN_TDS ||
      reading.waterLevel >= WARN_WATER ||
      (reading.battery != null && reading.battery < 20) ||
      (reading.signalStrength != null && reading.signalStrength < 30);

    if (isWarning) return 'warning';

    return 'online';
  }

  async createReading(sensorId, data) {
    const sensor = await prisma.sensor.findUnique({ where: { id: sensorId } });
    if (!sensor) throw new AppError('Sensor not found', 404);

    logger.info(`[READING] Creating reading for sensor ${sensor.sensorId} (${sensor.name})`);

    const reading = await prisma.sensorReading.create({
      data: {
        sensorId,
        temperature: data.temperature,
        ph: data.ph,
        tds: data.tds,
        dissolvedOxygen: data.dissolvedOxygen,
        waterLevel: data.waterLevel,
        battery: data.battery ?? null,
        signalStrength: data.signalStrength ?? null,
        timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
      },
    });

    logger.info(`[READING] Reading saved: id=${reading.id}, temp=${data.temperature}, pH=${data.ph}, TDS=${data.tds}, DO=${data.dissolvedOxygen}, waterLevel=${data.waterLevel}, battery=${data.battery}`);

    const status = this._calculateStatus(data);

    const updatedSensor = await prisma.sensor.update({
      where: { id: sensorId },
      data: {
        temperature: data.temperature,
        ph: data.ph,
        tds: data.tds,
        dissolvedOxygen: data.dissolvedOxygen,
        waterLevel: data.waterLevel,
        battery: data.battery ?? null,
        signalStrength: data.signalStrength ?? null,
        lastReading: data.tds,
        lastSeen: new Date(),
        status,
      },
    });

    logger.info(`[SENSOR] Sensor ${sensor.sensorId} updated with status=${status}`);

    try {
      logger.info(`[THRESHOLD] Evaluating alerts for reading on sensor ${sensor.sensorId}`);
      const alerts = await alertService.evaluateAndCreateAlerts(sensorId, { ...data, status });
      if (alerts.length > 0) {
        logger.info(`[ALERT] Created ${alerts.length} alert(s) from reading: ${alerts.map(a => `${a.alertType}=${a.severity}`).join(', ')}`);
      }
    } catch (err) {
      logger.error(`[ALERT] Failed to evaluate alerts from reading: ${err.message}`);
    }

    try {
      emitSensorReading({
        sensorId,
        sensorName: sensor.name,
        ...data,
        status,
      });
    } catch (_) {}

    return { reading, sensor: updatedSensor };
  }

  async getReadings(sensorId, query = {}) {
    const sensor = await prisma.sensor.findUnique({ where: { id: sensorId } });
    if (!sensor) throw new AppError('Sensor not found', 404);

    const where = { sensorId };
    if (query.startDate || query.endDate) {
      where.timestamp = {};
      if (query.startDate) where.timestamp.gte = new Date(query.startDate);
      if (query.endDate) where.timestamp.lte = new Date(query.endDate);
    }

    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(Math.max(1, parseInt(query.limit, 10) || 50), 500);
    const skip = (page - 1) * limit;

    const [readings, total] = await Promise.all([
      prisma.sensorReading.findMany({
        where,
        skip,
        take: limit,
        orderBy: { timestamp: 'desc' },
      }),
      prisma.sensorReading.count({ where }),
    ]);

    return {
      readings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getLiveReadings() {
    const sensors = await prisma.sensor.findMany({
      orderBy: { lastSeen: 'desc' },
    });

    return sensors.map((s) => ({
      id: s.id,
      sensorId: s.sensorId,
      name: s.name,
      location: s.location,
      wetland: s.wetland,
      status: s.status,
      temperature: s.temperature,
      ph: s.ph,
      tds: s.tds,
      dissolvedOxygen: s.dissolvedOxygen,
      waterLevel: s.waterLevel,
      battery: s.battery,
      signalStrength: s.signalStrength,
      lastReading: s.lastReading,
      lastSeen: s.lastSeen,
    }));
  }
}

module.exports = new ReadingService();
