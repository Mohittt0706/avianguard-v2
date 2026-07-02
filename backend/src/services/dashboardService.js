const prisma = require('../config/database');
const SensorStation = require('../models/SensorStation');
const Sensor = require('../models/Sensor');
const Alert = require('../models/Alert');
const Citizen = require('../models/Citizen');
const Report = require('../models/Report');

const mongoose = require('mongoose');

function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}

class DashboardService {
  async getDashboardStats() {
    if (!isMongoConnected()) {
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

      const recentActivity = sensors
        .filter((s) => s.lastSeen)
        .slice(0, 10)
        .map((s) => ({
          id: s.id,
          type: 'sensor_reading',
          message: `${s.name} reported TDS: ${s.tds ?? 'N/A'}, pH: ${s.ph ?? 'N/A'}`,
          timestamp: s.lastSeen.toISOString(),
          severity: s.status === 'warning' ? 'warning' : 'info',
          status: s.status,
        }));

      return {
        totalSensorStations: total,
        activeSensorStations: online,
        offlineSensorStations: offline,
        warningSensorStations: warning,
        totalSensors: total,
        activeSensors: online,
        faultySensors: 0,
        activeAlerts: warning > 0 ? warning : 0,
        totalCitizens: 0,
        totalReports: 0,
        aiRecommendation: this._generateAiRecommendation(total, online, warning, 0),
        sensorReadings,
        recentActivity,
      };
    }

    const [
      totalStations,
      activeStations,
      offlineStations,
      warningStations,
      totalSensors,
      activeSensors,
      faultySensors,
      activeAlerts,
      totalCitizens,
      totalReports,
      recentAlerts,
      sensorReadings,
    ] = await Promise.all([
      SensorStation.countDocuments({ isActive: true }),
      SensorStation.countDocuments({ status: 'online', isActive: true }),
      SensorStation.countDocuments({ status: 'offline', isActive: true }),
      SensorStation.countDocuments({ status: 'warning', isActive: true }),
      Sensor.countDocuments(),
      Sensor.countDocuments({ status: 'active', isActive: true }),
      Sensor.countDocuments({ status: 'faulty' }),
      Alert.countDocuments({ status: 'active' }),
      Citizen.countDocuments(),
      Report.countDocuments(),
      Alert.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('wetland', 'name')
        .lean(),
      Sensor.aggregate([
        { $match: { status: 'active', isActive: true, 'lastReading.value': { $exists: true } } },
        { $group: { _id: '$type', value: { $last: '$lastReading.value' }, sensorId: { $last: '$sensorId' } } },
        { $project: { _id: 0, type: '$_id', value: 1, sensorId: 1 } },
      ]),
    ]);

    const recentActivity = recentAlerts.map((a) => ({
      id: a._id.toString(),
      type: a.type,
      message: a.title,
      timestamp: a.createdAt,
      severity: a.severity,
      status: a.status,
    }));

    const aiRecommendation = this._generateAiRecommendation(
      totalStations,
      activeStations,
      activeAlerts,
      faultySensors,
    );

    return {
      totalSensorStations: totalStations,
      activeSensorStations: activeStations,
      offlineSensorStations: offlineStations,
      warningSensorStations: warningStations,
      totalSensors,
      activeSensors,
      faultySensors,
      activeAlerts,
      totalCitizens,
      totalReports,
      aiRecommendation,
      sensorReadings,
      recentActivity,
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
}

module.exports = new DashboardService();
