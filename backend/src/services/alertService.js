const prisma = require('../config/database');
const AppError = require('../utils/AppError');
const { emitAlert } = require('../socket');
const logger = require('../utils/logger');
const notificationService = require('./notificationService');

class AlertService {
  _determineSeverity(type, value) {
    const rules = {
      pH: { low: { warn: 6.5, crit: 6.0 }, high: { warn: 8.5, crit: 9.0 } },
      temperature: { high: { warn: 30, crit: 35 } },
      tds: { high: { warn: 300, crit: 500 } },
      dissolvedOxygen: { low: { warn: 5, crit: 4 } },
      waterLevel: { high: { warn: 7, crit: 9 } },
      battery: { low: { warn: 20, crit: 10 } },
    };

    const rule = rules[type];
    if (!rule) return 'LOW';

    if (rule.low) {
      if (value <= rule.low.crit) return 'CRITICAL';
      if (value <= rule.low.warn) return 'HIGH';
    }
    if (rule.high) {
      if (value >= rule.high.crit) return 'CRITICAL';
      if (value >= rule.high.warn) return 'HIGH';
    }
    return 'LOW';
  }

  _buildAlertDescription(type, value, safeRange, sensorName) {
    const labels = {
      pH: 'pH Level',
      temperature: 'Temperature',
      tds: 'Total Dissolved Solids',
      dissolvedOxygen: 'Dissolved Oxygen',
      waterLevel: 'Water Level',
      battery: 'Battery',
      offline: 'Sensor Offline',
    };
    const label = labels[type] || type;
    const direction = type === 'dissolvedOxygen' || type === 'battery' ? 'below' : 'above';
    return `${sensorName || 'Sensor'}: ${label} is ${value} — ${direction} safe threshold (${safeRange}). ${type === 'offline' ? 'Sensor is not responding. Immediate attention required.' : 'Automated alert generated from sensor reading.'}`;
  }

  _formatValue(value) {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'number') return value.toFixed(2);
    return String(value);
  }

  async _hasActiveAlert(sensorId, alertType) {
    const existing = await prisma.alert.findFirst({
      where: {
        sensorId,
        alertType,
        status: 'ACTIVE',
      },
    });
    return existing !== null;
  }

  async evaluateAndCreateAlerts(sensorId, data) {
    const sensor = await prisma.sensor.findUnique({ where: { id: sensorId } });
    if (!sensor) {
      logger.warn(`[ALERT] Sensor ${sensorId} not found — skipping alert evaluation`);
      return [];
    }

    logger.info(`[THRESHOLD] Evaluating sensor ${sensor.sensorId} (${sensor.name}): pH=${this._formatValue(data.ph)}, temp=${this._formatValue(data.temperature)}, TDS=${this._formatValue(data.tds)}, DO=${this._formatValue(data.dissolvedOxygen)}, waterLevel=${this._formatValue(data.waterLevel)}, battery=${this._formatValue(data.battery)}`);

    const alerts = [];
    const checks = [
      { type: 'pH', value: data.ph, safe: '6.5 — 8.5', condition: (v) => v != null && (v < 6.5 || v > 8.5) },
      { type: 'temperature', value: data.temperature, safe: '< 35°C', condition: (v) => v != null && v > 35 },
      { type: 'tds', value: data.tds, safe: '< 500 ppm', condition: (v) => v != null && v > 500 },
      { type: 'dissolvedOxygen', value: data.dissolvedOxygen, safe: '> 5 mg/L', condition: (v) => v != null && v < 5 },
      { type: 'waterLevel', value: data.waterLevel, safe: '< 9 m', condition: (v) => v != null && v > 9 },
      { type: 'battery', value: data.battery, safe: '> 20%', condition: (v) => v != null && v < 20 },
    ];

    for (const check of checks) {
      const triggered = check.condition(check.value);
      logger.info(`[THRESHOLD]   ${check.type}: value=${this._formatValue(check.value)} safe=${check.safe} → ${triggered ? 'VIOLATED' : 'OK'}`);

      if (!triggered) continue;

      const hasActive = await this._hasActiveAlert(sensor.id, check.type);
      if (hasActive) {
        logger.info(`[ALERT]   Skipping ${check.type} — active alert already exists for sensor ${sensor.sensorId}`);
        continue;
      }

      const severity = this._determineSeverity(check.type, check.value);
      const description = this._buildAlertDescription(check.type, check.value, check.safe, sensor.name);

      logger.info(`[ALERT]   Creating ${severity} alert for ${check.type} on sensor ${sensor.sensorId} (value=${this._formatValue(check.value)})`);

      const alert = await prisma.alert.create({
        data: {
          sensorId: sensor.id,
          sensorName: sensor.name,
          wetland: sensor.wetland,
          alertType: check.type,
          severity,
          currentValue: check.value,
          safeRange: check.safe,
          description,
        },
      });

      logger.info(`[ALERT]   Alert created in DB: id=${alert.id}, severity=${severity}, type=${check.type}`);

      alerts.push(alert);

      try {
        emitAlert({
          id: alert.id,
          severity: alert.severity,
          alertType: alert.alertType,
          sensorName: alert.sensorName,
          wetland: alert.wetland,
          description: alert.description,
          currentValue: alert.currentValue,
          createdAt: alert.createdAt,
          status: alert.status,
        });
        logger.info(`[ALERT]   Alert ${alert.id} emitted via socket`);
      } catch (err) {
        logger.warn(`[ALERT]   Socket emit failed for alert ${alert.id}: ${err.message}`);
      }
    }

    if (data.status === 'offline' || data.status === 'maintenance') {
      const hasOffline = await this._hasActiveAlert(sensor.id, 'offline');
      if (!hasOffline) {
        const desc = this._buildAlertDescription('offline', null, '', sensor.name);
        logger.info(`[ALERT]   Creating HIGH alert for offline sensor ${sensor.sensorId}`);
        const alert = await prisma.alert.create({
          data: {
            sensorId: sensor.id,
            sensorName: sensor.name,
            wetland: sensor.wetland,
            alertType: 'offline',
            severity: 'HIGH',
            description: desc,
          },
        });
        alerts.push(alert);
        logger.info(`[ALERT]   Offline alert created: id=${alert.id}`);
      } else {
        logger.info(`[ALERT]   Skipping offline alert — active alert already exists for sensor ${sensor.sensorId}`);
      }
    }

    logger.info(`[ALERT] Evaluation complete for sensor ${sensor.sensorId}: ${alerts.length} alert(s) created`);

    return alerts;
  }

  async getAlerts(query = {}) {
    const where = {};
    if (query.status) where.status = query.status;
    if (query.severity) where.severity = query.severity;
    if (query.wetland) where.wetland = query.wetland;
    if (query.search) {
      where.OR = [
        { description: { contains: query.search, mode: 'insensitive' } },
        { sensorName: { contains: query.search, mode: 'insensitive' } },
        { wetland: { contains: query.search, mode: 'insensitive' } },
        { alertType: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(Math.max(1, parseInt(query.limit, 10) || 50), 200);
    const skip = (page - 1) * limit;

    const [alerts, total] = await Promise.all([
      prisma.alert.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.alert.count({ where }),
    ]);

    return {
      alerts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getAlert(id) {
    const alert = await prisma.alert.findUnique({
      where: { id },
      include: {
        sensor: {
          select: {
            id: true,
            sensorId: true,
            name: true,
            location: true,
            latitude: true,
            longitude: true,
            wetland: true,
            status: true,
            temperature: true,
            ph: true,
            tds: true,
            dissolvedOxygen: true,
            waterLevel: true,
            battery: true,
            signalStrength: true,
            lastSeen: true,
          },
        },
      },
    });
    if (!alert) throw new AppError('Alert not found', 404);

    const citizenNotifications = await prisma.citizenNotification.findMany({
      where: { alertId: id },
      orderBy: { sentAt: 'desc' },
    });

    return { ...alert, sensor: alert.sensor || null, citizenNotifications };
  }

  async createAlert(data) {
    const alert = await prisma.alert.create({
      data: {
        sensorId: data.sensorId || null,
        sensorName: data.sensorName || null,
        wetland: data.wetland || null,
        alertType: data.alertType,
        severity: data.severity,
        currentValue: data.currentValue ?? null,
        safeRange: data.safeRange || null,
        description: data.description,
      },
    });

    if (data.notifyCitizens && data.wetland) {
      try {
        const citizens = await prisma.citizen.findMany({
          where: { nearbyWetland: data.wetland, status: 'ACTIVE', isActive: true, fcmToken: { not: null } },
        });

        if (citizens.length > 0) {
          const tokens = citizens.map(c => c.fcmToken);
          const pushResult = await notificationService.sendBulkNotifications(tokens, {
            title: data.title || `Alert: ${data.alertType}`,
            body: data.description || `${data.severity} alert for ${data.wetland}`,
            data: {
              alertType: data.alertType || 'sensor_alert',
              severity: data.severity || 'MEDIUM',
              wetland: data.wetland,
              alertId: alert.id,
              clickUrl: `/dashboard/alerts/${alert.id}`,
              timestamp: new Date().toISOString(),
            },
          });

          if (pushResult.invalidTokens && pushResult.invalidTokens.length > 0) {
            await prisma.citizen.updateMany({
              where: { fcmToken: { in: pushResult.invalidTokens } },
              data: { fcmToken: null, fcmTokenUpdatedAt: null },
            });
          }

          logger.info(`[ALERT] Push notifications sent for alert ${alert.id}: success=${pushResult.successCount} failed=${pushResult.failureCount}`);
        }
      } catch (err) {
        logger.error(`[ALERT] Failed to push notifications for alert ${alert.id}: ${err.message}`);
      }
    }

    return alert;
  }

  async acknowledgeAlert(id) {
    const alert = await prisma.alert.findUnique({ where: { id } });
    if (!alert) throw new AppError('Alert not found', 404);

    return prisma.alert.update({
      where: { id },
      data: { status: 'ACKNOWLEDGED' },
    });
  }

  async resolveAlert(id, resolvedBy) {
    const alert = await prisma.alert.findUnique({ where: { id } });
    if (!alert) throw new AppError('Alert not found', 404);

    return prisma.alert.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        resolvedAt: new Date(),
        resolvedBy,
      },
    });
  }

  async markCitizenNotified(id, sentBy) {
    const alert = await prisma.alert.findUnique({ where: { id } });
    if (!alert) throw new AppError('Alert not found', 404);

    return prisma.alert.update({
      where: { id },
      data: {
        citizenNotified: true,
        citizenNotifiedAt: new Date(),
      },
    });
  }

  async deleteAlert(id) {
    const alert = await prisma.alert.findUnique({ where: { id } });
    if (!alert) throw new AppError('Alert not found', 404);

    await prisma.alert.delete({ where: { id } });
  }

  async getStats() {
    const [total, byStatus, bySeverity] = await Promise.all([
      prisma.alert.count(),
      Promise.all([
        prisma.alert.count({ where: { status: 'ACTIVE' } }),
        prisma.alert.count({ where: { status: 'ACKNOWLEDGED' } }),
        prisma.alert.count({ where: { status: 'RESOLVED' } }),
      ]),
      Promise.all([
        prisma.alert.count({ where: { severity: 'CRITICAL' } }),
        prisma.alert.count({ where: { severity: 'HIGH' } }),
        prisma.alert.count({ where: { severity: 'MEDIUM' } }),
        prisma.alert.count({ where: { severity: 'LOW' } }),
      ]),
    ]);

    return {
      total,
      active: byStatus[0],
      acknowledged: byStatus[1],
      resolved: byStatus[2],
      critical: bySeverity[0],
      high: bySeverity[1],
      medium: bySeverity[2],
      low: bySeverity[3],
    };
  }

  async getRecentActivity(limit = 10) {
    const alerts = await prisma.alert.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        alertType: true,
        description: true,
        createdAt: true,
        severity: true,
        status: true,
      },
    });

    return alerts.map((a) => ({
      id: a.id,
      type: a.alertType,
      message: a.description,
      timestamp: a.createdAt.toISOString(),
      severity: a.severity.toLowerCase(),
      status: a.status.toLowerCase(),
    }));
  }
}

module.exports = new AlertService();
