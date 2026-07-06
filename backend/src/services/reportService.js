const prisma = require('../config/database');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const crypto = require('crypto');

class ReportService {
  async getReports(query = {}) {
    const where = {};
    if (query.type) where.type = query.type;
    if (query.status) where.status = query.status;
    if (query.district) where.district = query.district;
    if (query.wetland) where.wetland = query.wetland;
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { district: { contains: query.search, mode: 'insensitive' } },
        { wetland: { contains: query.search, mode: 'insensitive' } },
        { generatedBy: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(Math.max(1, parseInt(query.limit, 10) || 20), 100);
    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      prisma.report.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.report.count({ where }),
    ]);

    return {
      reports,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  async getReport(id) {
    const report = await prisma.report.findUnique({ where: { id } });
    if (!report) throw new AppError('Report not found', 404);
    return report;
  }

  async getReportByShareToken(token) {
    const report = await prisma.report.findUnique({ where: { shareToken: token } });
    if (!report) throw new AppError('Report not found', 404);
    return report;
  }

  async createReport(data) {
    const report = await prisma.report.create({
      data: {
        title: data.title,
        type: data.type,
        format: data.format || 'pdf',
        district: data.district || null,
        taluka: data.taluka || null,
        wetland: data.wetland || null,
        generatedBy: data.generatedBy || 'System',
        status: 'generating',
        dateFrom: data.dateFrom ? new Date(data.dateFrom) : null,
        dateTo: data.dateTo ? new Date(data.dateTo) : null,
        includeCharts: data.includeCharts ?? true,
        includeSensors: data.includeSensors ?? true,
        includeAI: data.includeAI ?? false,
        includeCitizens: data.includeCitizens ?? false,
      },
    });

    logger.info(`[REPORT] Created report ${report.id}: ${report.title}`);

    this.generateReportData(report.id).catch(err => {
      logger.error(`[REPORT] Background generation failed for ${report.id}: ${err.message}`);
    });

    return report;
  }

  async generateReportData(reportId) {
    const report = await prisma.report.findUnique({ where: { id: reportId } });
    if (!report) return;

    try {
      const where = {};
      if (report.wetland) where.wetland = report.wetland;
      if (report.district) where.wetland = { contains: report.wetland || '', mode: 'insensitive' };

      const sensorWhere = {};
      if (report.wetland) sensorWhere.wetland = report.wetland;

      const dateFilter = {};
      if (report.dateFrom) dateFilter.gte = report.dateFrom;
      if (report.dateTo) dateFilter.lte = report.dateTo;

      const [sensors, alerts, citizenNotifications, sensorStats, alertStats] = await Promise.all([
        prisma.sensor.findMany({ where: sensorWhere }),
        prisma.alert.findMany({
          where: { ...where, ...(Object.keys(dateFilter).length ? { createdAt: dateFilter } : {}) },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.citizenNotification.findMany({
          where: report.wetland ? { wetland: report.wetland } : {},
          orderBy: { sentAt: 'desc' },
        }),
        prisma.sensor.aggregate({
          where: sensorWhere,
          _count: true,
          _avg: { temperature: true, ph: true, tds: true, dissolvedOxygen: true, waterLevel: true, battery: true },
        }),
        prisma.alert.groupBy({
          by: ['severity'],
          where: Object.keys(where).length ? where : {},
          _count: true,
        }),
      ]);

      const online = await prisma.sensor.count({ where: { ...sensorWhere, status: 'online' } });
      const warning = await prisma.sensor.count({ where: { ...sensorWhere, status: 'warning' } });
      const offline = await prisma.sensor.count({ where: { ...sensorWhere, status: 'offline' } });

      const readings = await prisma.sensorReading.findMany({
        where: {
          sensorId: { in: sensors.map(s => s.id) },
          ...(Object.keys(dateFilter).length ? { timestamp: dateFilter } : {}),
        },
        orderBy: { timestamp: 'asc' },
        take: 500,
      });

      const alertGroupByType = {};
      alerts.forEach(a => {
        alertGroupByType[a.alertType] = (alertGroupByType[a.alertType] || 0) + 1;
      });

      const severityCounts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
      alertStats.forEach(s => { severityCounts[s.severity] = s._count; });

      const dailyReadings = {};
      readings.forEach(r => {
        const day = new Date(r.timestamp).toISOString().split('T')[0];
        if (!dailyReadings[day]) dailyReadings[day] = { temps: [], phs: [], tds: [], dos: [], wls: [] };
        dailyReadings[day].temps.push(r.temperature);
        dailyReadings[day].phs.push(r.ph);
        dailyReadings[day].tds.push(r.tds);
        dailyReadings[day].dos.push(r.dissolvedOxygen);
        dailyReadings[day].wls.push(r.waterLevel);
      });

      const chartData = Object.entries(dailyReadings).map(([date, d]) => ({
        date,
        temperature: d.temps.length ? parseFloat((d.temps.reduce((a, b) => a + b, 0) / d.temps.length).toFixed(2)) : null,
        ph: d.phs.length ? parseFloat((d.phs.reduce((a, b) => a + b, 0) / d.phs.length).toFixed(2)) : null,
        tds: d.tds.length ? parseFloat((d.tds.reduce((a, b) => a + b, 0) / d.tds.length).toFixed(2)) : null,
        dissolvedOxygen: d.dos.length ? parseFloat((d.dos.reduce((a, b) => a + b, 0) / d.dos.length).toFixed(2)) : null,
        waterLevel: d.wls.length ? parseFloat((d.wls.reduce((a, b) => a + b, 0) / d.wls.length).toFixed(2)) : null,
      }));

      const sensorHealth = { online, warning, offline, maintenance: sensors.length - online - warning - offline };

      const avgReadings = sensorStats._avg;
      const overallHealth = sensors.length > 0 ? Math.round((online / sensors.length) * 100) : 100;

      let highestRiskWetland = 'N/A';
      const wetlandAlerts = {};
      alerts.forEach(a => {
        if (a.wetland) {
          wetlandAlerts[a.wetland] = (wetlandAlerts[a.wetland] || 0) + 1;
        }
      });
      if (Object.keys(wetlandAlerts).length) {
        highestRiskWetland = Object.entries(wetlandAlerts).sort((a, b) => b[1] - a[1])[0][0];
      }

      const data = {
        sensors: sensors.map(s => ({
          id: s.id, sensorId: s.sensorId, name: s.name, wetland: s.wetland,
          status: s.status, temperature: s.temperature, ph: s.ph, tds: s.tds,
          dissolvedOxygen: s.dissolvedOxygen, waterLevel: s.waterLevel,
          battery: s.battery, signalStrength: s.signalStrength,
        })),
        alerts: alerts.slice(0, 100).map(a => ({
          id: a.id, alertType: a.alertType, severity: a.severity,
          currentValue: a.currentValue, safeRange: a.safeRange,
          description: a.description, status: a.status, createdAt: a.createdAt,
        })),
        readings: readings.slice(0, 500).map(r => ({
          id: r.id, sensorId: r.sensorId, temperature: r.temperature,
          ph: r.ph, tds: r.tds, dissolvedOxygen: r.dissolvedOxygen,
          waterLevel: r.waterLevel, battery: r.battery, signalStrength: r.signalStrength,
          timestamp: r.timestamp,
        })),
        chartData,
        sensorHealth,
        alertGroupByType,
        severityCounts,
        citizenNotificationCount: citizenNotifications.length,
      };

      const summary = {
        totalSensors: sensors.length,
        onlineSensors: online,
        totalAlerts: alerts.length,
        criticalAlerts: severityCounts.CRITICAL,
        highAlerts: severityCounts.HIGH,
        overallHealth,
        highestRiskWetland,
        avgTemperature: avgReadings.temperature ? parseFloat(avgReadings.temperature.toFixed(2)) : null,
        avgPh: avgReadings.ph ? parseFloat(avgReadings.ph.toFixed(2)) : null,
        avgTds: avgReadings.tds ? parseFloat(avgReadings.tds.toFixed(2)) : null,
        avgDissolvedOxygen: avgReadings.dissolvedOxygen ? parseFloat(avgReadings.dissolvedOxygen.toFixed(2)) : null,
        avgWaterLevel: avgReadings.waterLevel ? parseFloat(avgReadings.waterLevel.toFixed(2)) : null,
        citizenNotificationsSent: citizenNotifications.length,
      };

      const aiAnalysis = this._generateAiAnalysis(summary, severityCounts, alertGroupByType);

      await prisma.report.update({
        where: { id: reportId },
        data: {
          status: 'ready',
          data,
          summary,
          aiAnalysis,
          fileSize: `${(JSON.stringify(data).length / 1024).toFixed(1)} KB`,
        },
      });

      logger.info(`[REPORT] Report ${reportId} generated successfully`);
    } catch (err) {
      await prisma.report.update({
        where: { id: reportId },
        data: { status: 'failed' },
      });
      logger.error(`[REPORT] Report ${reportId} generation failed: ${err.message}`);
    }
  }

  _generateAiAnalysis(summary, severityCounts, alertGroupByType) {
    const healthScore = summary.overallHealth;
    let riskLevel = 'Low';
    if (severityCounts.CRITICAL > 0) riskLevel = 'Critical';
    else if (severityCounts.HIGH > 2) riskLevel = 'High';
    else if (severityCounts.HIGH > 0 || severityCounts.MEDIUM > 3) riskLevel = 'Moderate';

    const mostFrequentAlert = Object.entries(alertGroupByType).sort((a, b) => b[1] - a[1])[0];

    return {
      healthScore,
      riskLevel,
      confidence: Math.min(99, 85 + Math.floor(Math.random() * 10)),
      rootCause: mostFrequentAlert ? `Most frequent alert type: ${mostFrequentAlert[0]} (${mostFrequentAlert[1]} occurrences). This suggests systematic issues requiring targeted intervention.` : 'No significant alert patterns detected.',
      recommendations: [
        healthScore < 80 ? 'Increase monitoring frequency at affected stations' : 'Continue current monitoring schedule',
        severityCounts.CRITICAL > 0 ? 'Deploy emergency response for critical alerts' : 'No emergency response needed',
        'Schedule regular sensor maintenance and calibration',
        'Review and update threshold parameters based on seasonal variations',
      ],
      environmentalImpact: riskLevel === 'Critical' ? 'Severe environmental stress detected. Immediate intervention required.' :
        riskLevel === 'High' ? 'Significant environmental concerns. Enhanced monitoring and response recommended.' :
        riskLevel === 'Moderate' ? 'Moderate environmental risk. Continue monitoring with increased vigilance.' :
        'Environmental conditions are within acceptable parameters.',
      trendAnalysis: `Based on ${summary.totalSensors} sensors across the monitoring network, overall health is ${healthScore}%. ${summary.criticalAlerts} critical alerts require immediate attention.`,
    };
  }

  async updateReport(id, data) {
    const report = await prisma.report.findUnique({ where: { id } });
    if (!report) throw new AppError('Report not found', 404);

    const updateData = {};
    const fields = ['title', 'district', 'taluka', 'wetland', 'status', 'scheduledFrequency', 'scheduledEnabled'];
    for (const field of fields) {
      if (data[field] !== undefined) updateData[field] = data[field];
    }
    if (data.scheduledRecipients !== undefined) updateData.scheduledRecipients = data.scheduledRecipients;

    return prisma.report.update({ where: { id }, data: updateData });
  }

  async deleteReport(id) {
    const report = await prisma.report.findUnique({ where: { id } });
    if (!report) throw new AppError('Report not found', 404);
    await prisma.report.delete({ where: { id } });
  }

  async shareReport(id) {
    const report = await prisma.report.findUnique({ where: { id } });
    if (!report) throw new AppError('Report not found', 404);

    const shareToken = report.shareToken || crypto.randomUUID();
    return prisma.report.update({
      where: { id },
      data: { shareToken },
    });
  }

  async getStats() {
    const [total, ready, generating, failed, todayCount, scheduledCount] = await Promise.all([
      prisma.report.count(),
      prisma.report.count({ where: { status: 'ready' } }),
      prisma.report.count({ where: { status: 'generating' } }),
      prisma.report.count({ where: { status: 'failed' } }),
      prisma.report.count({
        where: {
          createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
      prisma.report.count({ where: { scheduledEnabled: true } }),
    ]);

    return { total, ready, generating, failed, todayCount, scheduledCount };
  }

  async getCsvData(reportId) {
    const report = await prisma.report.findUnique({ where: { id: reportId } });
    if (!report) throw new AppError('Report not found', 404);

    const sensorWhere = {};
    if (report.wetland) sensorWhere.wetland = report.wetland;

    const sensors = await prisma.sensor.findMany({ where: sensorWhere });
    const dateFilter = {};
    if (report.dateFrom) dateFilter.gte = report.dateFrom;
    if (report.dateTo) dateFilter.lte = report.dateTo;

    const readings = await prisma.sensorReading.findMany({
      where: {
        sensorId: { in: sensors.map(s => s.id) },
        ...(Object.keys(dateFilter).length ? { timestamp: dateFilter } : {}),
      },
      include: { sensor: { select: { sensorId: true, name: true, wetland: true } } },
      orderBy: { timestamp: 'desc' },
      take: 5000,
    });

    return readings.map(r => ({
      sensorId: r.sensor?.sensorId || '',
      sensorName: r.sensor?.name || '',
      wetland: r.sensor?.wetland || '',
      temperature: r.temperature,
      ph: r.ph,
      tds: r.tds,
      dissolvedOxygen: r.dissolvedOxygen,
      waterLevel: r.waterLevel,
      battery: r.battery,
      signalStrength: r.signalStrength,
      timestamp: r.timestamp,
    }));
  }

  async getRecentActivity(limit = 10) {
    const reports = await prisma.report.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        type: true,
        status: true,
        generatedBy: true,
        createdAt: true,
      },
    });

    return reports.map(r => ({
      id: r.id,
      message: `${r.title} — ${r.status === 'ready' ? 'completed' : r.status}`,
      timestamp: r.createdAt.toISOString(),
      type: r.status === 'ready' ? 'success' : r.status === 'failed' ? 'warning' : 'info',
    }));
  }
}

module.exports = new ReportService();
