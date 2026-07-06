const prisma = require('../config/database');
const alertService = require('./alertService');

class DashboardService {
  async getDashboardStats() {
    const [alertStats, alertActivity, citizenNotifStats] = await Promise.all([
      alertService.getStats(),
      alertService.getRecentActivity(10),
      this._getCitizenNotificationStats(),
    ]);

    const [sensors, total, online, offline, warning] = await Promise.all([
      prisma.sensor.findMany({ orderBy: { lastSeen: 'desc' }, take: 200 }),
      prisma.sensor.count(),
      prisma.sensor.count({ where: { status: 'online' } }),
      prisma.sensor.count({ where: { status: 'offline' } }),
      prisma.sensor.count({ where: { status: 'warning' } }),
    ]);

    const paramAgg = { temperature: [], ph: [], tds: [], dissolvedOxygen: [], waterLevel: [] };
    for (const s of sensors) {
      for (const key of Object.keys(paramAgg)) {
        if (s[key] != null) paramAgg[key].push(s[key]);
      }
    }
    const sensorReadings = [];
    const typeMap = { temperature: 'temperature', ph: 'ph', tds: 'tds', dissolvedOxygen: 'dissolved_oxygen', waterLevel: 'water_level' };
    for (const [key, type] of Object.entries(typeMap)) {
      const vals = paramAgg[key];
      if (vals.length > 0) {
        const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
        sensorReadings.push({ type, value: parseFloat(avg.toFixed(1)), sensorId: 'aggregate' });
      }
    }

    const aiConfidence = this._calculateConfidence(total, online, sensors);

    return {
      totalSensorStations: total,
      activeSensorStations: online,
      offlineSensorStations: offline,
      warningSensorStations: warning,
      totalSensors: total,
      activeSensors: online,
      faultySensors: 0,
      activeAlerts: alertStats.active,
      criticalAlerts: alertStats.critical,
      highAlerts: alertStats.high,
      totalCitizens: 0,
      totalReports: 0,
      citizenNotificationsSent: citizenNotifStats.total,
      pendingNotifications: citizenNotifStats.sent,
      deliveredNotifications: citizenNotifStats.delivered,
      failedNotifications: citizenNotifStats.failed,
      aiRecommendation: this._generateAiRecommendation(total, online, alertStats.active, 0),
      aiConfidence,
      sensorReadings,
      recentActivity: alertActivity,
    };
  }

  _generateAiRecommendation(totalStations, activeStations, activeAlerts, faultySensors) {
    const offlineCount = totalStations - activeStations;
    const parts = [];

    if (activeAlerts > 0) {
      parts.push(`⚠️ ${activeAlerts} active alert${activeAlerts > 1 ? 's' : ''} require immediate attention.`);
    } else {
      parts.push('✅ No active alerts. All systems operating within normal parameters.');
    }

    if (offlineCount > 0) {
      parts.push(`🔧 ${offlineCount} sensor station${offlineCount > 1 ? 's are' : ' is'} offline. Schedule maintenance check.`);
    }

    if (faultySensors > 0) {
      parts.push(`🛠️ ${faultySensors} sensor${faultySensors > 1 ? 's' : ''} reported faulty. Recommend inspection and recalibration.`);
    }

    if (totalStations > 0 && activeStations === totalStations && activeAlerts === 0) {
      parts.push('📊 All stations healthy. Continue standard monitoring schedule.');
    }

    return parts.join(' ');
  }

  async _getCitizenNotificationStats() {
    const [total, sent, delivered, failed] = await Promise.all([
      prisma.citizenNotification.count(),
      prisma.citizenNotification.count({ where: { deliveryStatus: 'sent' } }),
      prisma.citizenNotification.count({ where: { deliveryStatus: 'delivered' } }),
      prisma.citizenNotification.count({ where: { deliveryStatus: 'failed' } }),
    ]);
    return { total, sent, delivered, failed };
  }

  _calculateConfidence(totalSensors, onlineSensors, sensors) {
    if (totalSensors === 0) return 0;
    const onlineRatio = onlineSensors / totalSensors;
    const recentCount = sensors.filter(s => {
      if (!s.lastSeen) return false;
      return Date.now() - new Date(s.lastSeen).getTime() < 3600000;
    }).length;
    const recencyRatio = recentCount / totalSensors;
    return Math.round((onlineRatio * 50 + recencyRatio * 50));
  }
}

module.exports = new DashboardService();
