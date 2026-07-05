const prisma = require('../config/database');
const AppError = require('../utils/AppError');
const alertService = require('./alertService');
const logger = require('../utils/logger');
const { emitEvent } = require('../socket');

class SensorService {
  async getSensors(query = {}) {
    const where = {};
    if (query.status) where.status = query.status;
    if (query.wetland) where.wetland = query.wetland;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { sensorId: { contains: query.search, mode: 'insensitive' } },
        { location: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(Math.max(1, parseInt(query.limit, 10) || 50), 200);
    const skip = (page - 1) * limit;

    const [sensors, total] = await Promise.all([
      prisma.sensor.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.sensor.count({ where }),
    ]);

    return {
      sensors,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getSensor(id) {
    const sensor = await prisma.sensor.findUnique({ where: { id } });
    if (!sensor) throw new AppError('Sensor not found', 404);
    return sensor;
  }

  async createSensor(data) {
    const existing = await prisma.sensor.findUnique({ where: { sensorId: data.sensorId } });
    if (existing) throw new AppError('Sensor ID already exists', 409);

    logger.info(`[SENSOR] Creating sensor: ${JSON.stringify({ sensorId: data.sensorId, name: data.name })}`);

    const sensor = await prisma.sensor.create({
      data: {
        sensorId: data.sensorId,
        name: data.name,
        location: data.location || null,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        wetland: data.wetland || null,
        status: data.status || 'online',
        temperature: data.temperature ?? null,
        ph: data.ph ?? null,
        tds: data.tds ?? null,
        dissolvedOxygen: data.dissolvedOxygen ?? null,
        waterLevel: data.waterLevel ?? null,
        battery: data.battery ?? null,
        signalStrength: data.signalStrength ?? null,
        lastReading: data.lastReading ?? null,
        lastSeen: data.lastSeen ? new Date(data.lastSeen) : null,
      },
    });

    logger.info(`[SENSOR] Sensor created: ${sensor.id} (${data.sensorId})`);

    logger.info(`[THRESHOLD] Evaluating thresholds for sensor ${sensor.sensorId}: temp=${data.temperature}, pH=${data.ph}, TDS=${data.tds}, DO=${data.dissolvedOxygen}, waterLevel=${data.waterLevel}, battery=${data.battery}`);

    try {
      const alerts = await alertService.evaluateAndCreateAlerts(sensor.id, data);
      if (alerts.length > 0) {
        logger.info(`[ALERT] Created ${alerts.length} alert(s) for sensor ${sensor.sensorId}: ${alerts.map(a => `${a.alertType}=${a.severity}`).join(', ')}`);
      } else {
        logger.info(`[ALERT] No alerts triggered for sensor ${sensor.sensorId} — all values within safe thresholds`);
      }
    } catch (err) {
      logger.error(`[ALERT] Failed to evaluate alerts for sensor ${sensor.sensorId}: ${err.message}`);
    }

    try {
      emitEvent('sensor:updated', { sensorId: sensor.id });
    } catch (_) {}

    return sensor;
  }

  async updateSensor(id, data) {
    const sensor = await prisma.sensor.findUnique({ where: { id } });
    if (!sensor) throw new AppError('Sensor not found', 404);

    if (data.sensorId && data.sensorId !== sensor.sensorId) {
      const existing = await prisma.sensor.findUnique({ where: { sensorId: data.sensorId } });
      if (existing) throw new AppError('Sensor ID already in use', 409);
    }

    logger.info(`[SENSOR] Updating sensor ${sensor.sensorId} (${id}): ${JSON.stringify(data)}`);

    const updateData = {};
    const fields = [
      'sensorId', 'name', 'location', 'latitude', 'longitude', 'wetland',
      'status', 'temperature', 'ph', 'tds', 'dissolvedOxygen', 'waterLevel',
      'battery', 'signalStrength', 'lastReading',
    ];
    for (const field of fields) {
      if (data[field] !== undefined) updateData[field] = data[field];
    }
    if (data.lastSeen !== undefined) updateData.lastSeen = new Date(data.lastSeen);
    if (data.status !== undefined) updateData.status = data.status;

    const updated = await prisma.sensor.update({
      where: { id },
      data: updateData,
    });

    logger.info(`[SENSOR] Sensor ${sensor.sensorId} updated successfully`);

    logger.info(`[THRESHOLD] Evaluating thresholds for sensor ${sensor.sensorId}: temp=${data.temperature}, pH=${data.ph}, TDS=${data.tds}, DO=${data.dissolvedOxygen}, waterLevel=${data.waterLevel}, battery=${data.battery}`);

    try {
      const alerts = await alertService.evaluateAndCreateAlerts(id, data);
      if (alerts.length > 0) {
        logger.info(`[ALERT] Created ${alerts.length} alert(s) for sensor ${sensor.sensorId}: ${alerts.map(a => `${a.alertType}=${a.severity}`).join(', ')}`);
      } else {
        logger.info(`[ALERT] No alerts triggered for sensor ${sensor.sensorId} — all values within safe thresholds`);
      }
    } catch (err) {
      logger.error(`[ALERT] Failed to evaluate alerts for sensor ${sensor.sensorId}: ${err.message}`);
    }

    try {
      emitEvent('sensor:updated', { sensorId: id });
    } catch (_) {}

    return updated;
  }

  async deleteSensor(id) {
    const sensor = await prisma.sensor.findUnique({ where: { id } });
    if (!sensor) throw new AppError('Sensor not found', 404);

    logger.info(`[SENSOR] Deleting sensor ${sensor.sensorId} (${id})`);

    const deletedAlerts = await prisma.alert.deleteMany({ where: { sensorId: id } });
    logger.info(`[SENSOR] Deleted ${deletedAlerts.count} alert(s) for sensor ${sensor.sensorId}`);

    await prisma.sensor.delete({ where: { id } });

    logger.info(`[SENSOR] Sensor ${sensor.sensorId} (${id}) deleted successfully`);

    try {
      emitEvent('sensor:updated', { sensorId: id });
    } catch (_) {}
  }

  async updateSensorStatus(id, status) {
    const sensor = await prisma.sensor.findUnique({ where: { id } });
    if (!sensor) throw new AppError('Sensor not found', 404);

    const updated = await prisma.sensor.update({
      where: { id },
      data: {
        status,
        lastSeen: status === 'online' ? new Date() : sensor.lastSeen,
      },
    });

    logger.info(`[SENSOR] Status updated for ${sensor.sensorId}: ${status}`);

    return updated;
  }

  async getSensorStats() {
    const [total, online, offline, warning, maintenance] = await Promise.all([
      prisma.sensor.count(),
      prisma.sensor.count({ where: { status: 'online' } }),
      prisma.sensor.count({ where: { status: 'offline' } }),
      prisma.sensor.count({ where: { status: 'warning' } }),
      prisma.sensor.count({ where: { status: 'maintenance' } }),
    ]);

    return { total, online, offline, warning, maintenance };
  }
}

module.exports = new SensorService();
