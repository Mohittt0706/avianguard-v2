const prisma = require('../config/database');

const THRESHOLDS = {
  ph: { min: 6.5, max: 8.5 },
  temperature: { max: 35 },
  tds: { max: 500 },
  dissolvedOxygen: { min: 5 },
  waterLevel: { max: 9 },
  battery: { min: 20 },
};

function calculateRiskScore(alerts, sensors) {
  const severityWeights = { CRITICAL: 40, HIGH: 25, MEDIUM: 15, LOW: 5 };
  let score = 0;
  for (const a of alerts) {
    score += severityWeights[a.severity] || 0;
  }
  const offlineCount = sensors.filter(s => s.status === 'offline').length;
  score += offlineCount * 10;
  return Math.min(100, score);
}

function calculateConfidence(sensors, alerts) {
  if (sensors.length === 0) return 0;
  const onlineRatio = sensors.filter(s => s.status === 'online').length / sensors.length;
  const recentCount = sensors.filter(s => {
    if (!s.lastSeen) return false;
    return Date.now() - new Date(s.lastSeen).getTime() < 3600000;
  }).length;
  const recencyRatio = recentCount / sensors.length;
  const alertPenalty = alerts.filter(a => a.severity === 'CRITICAL' || a.severity === 'HIGH').length * 2;
  let confidence = Math.round((onlineRatio * 50 + recencyRatio * 50) - alertPenalty);
  return Math.max(0, Math.min(100, confidence));
}

function getRiskLabel(score) {
  if (score >= 70) return { label: 'Critical', color: 'text-red-400', bg: 'bg-red-500/10' };
  if (score >= 40) return { label: 'High', color: 'text-orange-400', bg: 'bg-orange-500/10' };
  if (score >= 20) return { label: 'Moderate', color: 'text-amber-400', bg: 'bg-amber-500/10' };
  return { label: 'Low', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
}

function getSeverityCounts(alerts) {
  const counts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  for (const a of alerts) {
    if (counts[a.severity] !== undefined) counts[a.severity]++;
  }
  return counts;
}

function compareReadings(readings) {
  if (readings.length < 2) return 'stable';
  const sorted = [...readings].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const half = Math.floor(sorted.length / 2);
  const firstHalf = sorted.slice(0, half);
  const secondHalf = sorted.slice(half);
  const avgFirst = firstHalf.reduce((s, r) => s + (r.value || 0), 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((s, r) => s + (r.value || 0), 0) / secondHalf.length;
  const diff = avgSecond - avgFirst;
  if (diff > 0.1) return 'rising';
  if (diff < -0.1) return 'falling';
  return 'stable';
}

function generateSummary(alerts, sensors, riskScore, riskLabel) {
  const severityCounts = getSeverityCounts(alerts);
  const onlineCount = sensors.filter(s => s.status === 'online').length;
  const totalSensors = sensors.length;

  if (alerts.length === 0 && totalSensors > 0) {
    return `All ${onlineCount}/${totalSensors} sensors are operating within normal parameters. No environmental threats detected across any monitored wetland.`;
  }

  const critical = severityCounts.CRITICAL;
  const high = severityCounts.HIGH;
  const parts = [];

  if (critical > 0) {
    parts.push(`${critical} critical threat${critical > 1 ? 's' : ''} detected requiring immediate intervention.`);
  }
  if (high > 0) {
    parts.push(`${high} high-severity condition${high > 1 ? 's' : ''} require${high === 1 ? 's' : ''} prompt attention.`);
  }
  const medium = severityCounts.MEDIUM;
  const low = severityCounts.LOW;
  if (medium > 0 || low > 0) {
    parts.push(`${medium + low} medium/low priority alert${medium + low > 1 ? 's' : ''} under observation.`);
  }
  parts.push(`Overall risk level is ${riskLabel.label.toLowerCase()} (${riskScore}/100).`);
  parts.push(`${onlineCount}/${totalSensors} sensors currently online.`);

  return parts.join(' ');
}

function generateRecommendation(alerts, sensors) {
  const severityCounts = getSeverityCounts(alerts);
  if (alerts.length === 0) {
    return 'Continue standard monitoring protocol. All systems are operating within normal parameters.';
  }

  const steps = [];
  if (severityCounts.CRITICAL > 0) {
    steps.push('ACTIVATE EMERGENCY PROTOCOL: Dispatch rapid response teams to affected wetlands immediately.');
  }
  if (severityCounts.HIGH > 0) {
    steps.push('ESCALATE: Notify regional pollution control boards and schedule advanced diagnostics.');
  }
  if (severityCounts.MEDIUM > 0 || severityCounts.LOW > 0) {
    steps.push('MONITOR: Increase sampling frequency at flagged locations and review trend data.');
  }
  const offlineSensors = sensors.filter(s => s.status === 'offline');
  if (offlineSensors.length > 0) {
    steps.push(`MAINTENANCE: Schedule service for ${offlineSensors.length} offline sensor${offlineSensors.length > 1 ? 's' : ''}.`);
  }
  return steps.join(' ');
}

function generateTrendAnalysis(alerts) {
  if (alerts.length === 0) {
    return 'No significant trends detected. All parameters remain within expected ranges.';
  }
  const types = {};
  for (const a of alerts) {
    types[a.alertType] = (types[a.alertType] || 0) + 1;
  }
  const sorted = Object.entries(types).sort((a, b) => b[1] - a[1]);
  const topType = sorted[0];
  if (!topType) return 'Insufficient data for trend analysis.';
  return `${topType[0]} is the most frequent anomaly type (${topType[1]} occurrence${topType[1] > 1 ? 's' : ''}), suggesting a pattern that requires investigation.`;
}

function generatePossibleCause(alerts, sensors) {
  if (alerts.length === 0) {
    return 'No anomalies detected. Current environmental conditions are within normal operational parameters.';
  }
  const types = {};
  for (const a of alerts) {
    types[a.alertType] = (types[a.alertType] || 0) + 1;
  }
  const sorted = Object.entries(types).sort((a, b) => b[1] - a[1]);
  const causes = {
    pH: 'Possible industrial discharge or acid rain influx affecting water chemistry.',
    temperature: 'Likely thermal pollution from nearby industrial activity or extreme weather conditions.',
    tds: 'Potential untreated runoff, industrial effluent, or natural mineral leaching.',
    dissolvedOxygen: 'Organic pollution loading from sewage or agricultural runoff depleting oxygen levels.',
    waterLevel: 'Abnormal hydrological changes due to upstream damming, excessive withdrawal, or heavy rainfall.',
    battery: 'Sensor maintenance required — batteries nearing end of operational life.',
    offline: 'Sensor communication failure — possible physical damage, power loss, or network outage.',
  };
  const cause = causes[sorted[0][0]];
  return cause || 'Multiple environmental factors detected. Further investigation recommended.';
}

function generateSuggestedAction(alerts) {
  if (alerts.length === 0) {
    return 'No action required. Continue routine monitoring and data collection.';
  }
  const severityCounts = getSeverityCounts(alerts);
  if (severityCounts.CRITICAL > 0) {
    return 'Immediate intervention required. Deploy emergency response teams, notify regulatory authorities, and issue public advisories.';
  }
  if (severityCounts.HIGH > 0) {
    return 'Schedule enhanced monitoring and notify relevant stakeholders. Prepare contingency plans.';
  }
  if (severityCounts.MEDIUM > 0) {
    return 'Increase monitoring frequency and conduct trend analysis. Schedule preventive maintenance.';
  }
  return 'Continue standard monitoring. No immediate action required.';
}

class AIService {
  async getAnalysis() {
    const [sensors, activeAlerts, recentReadings] = await Promise.all([
      prisma.sensor.findMany({ orderBy: { lastSeen: 'desc' } }),
      prisma.alert.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.sensorReading.findMany({
        take: 100,
        orderBy: { timestamp: 'desc' },
        include: { sensor: { select: { name: true, wetland: true } } },
      }),
    ]);

    const riskScore = calculateRiskScore(activeAlerts, sensors);
    const riskLabel = getRiskLabel(riskScore);
    const confidenceScore = calculateConfidence(sensors, activeAlerts);

    const recentReadingsBySensor = {};
    for (const r of recentReadings) {
      if (!recentReadingsBySensor[r.sensorId]) {
        recentReadingsBySensor[r.sensorId] = [];
      }
      recentReadingsBySensor[r.sensorId].push({
        timestamp: r.timestamp,
        value: r.temperature || r.ph || r.tds || r.dissolvedOxygen || r.waterLevel,
      });
    }

    const trends = {};
    for (const [sensorId, readings] of Object.entries(recentReadingsBySensor)) {
      trends[sensorId] = compareReadings(readings);
    }

    const trendSummary = Object.values(trends).length > 0
      ? (() => {
          const counts = { rising: 0, falling: 0, stable: 0 };
          for (const t of Object.values(trends)) counts[t]++;
          const total = Object.values(counts).reduce((a, b) => a + b, 0);
          if (total === 0) return 'Insufficient data for trend analysis.';
          return `${Math.round(counts.rising / total * 100)}% of sensors showing rising trends, ${Math.round(counts.falling / total * 100)}% declining, ${Math.round(counts.stable / total * 100)}% stable.`;
        })()
      : 'No trend data available.';

    const summary = generateSummary(activeAlerts, sensors, riskScore, riskLabel);
    const recommendation = generateRecommendation(activeAlerts, sensors);
    const trendAnalysis = generateTrendAnalysis(activeAlerts);
    const possibleCause = generatePossibleCause(activeAlerts, sensors);
    const suggestedAction = generateSuggestedAction(activeAlerts);

    const cards = activeAlerts.length > 0
      ? activeAlerts.map((alert, index) => {
          const sensor = sensors.find(s => s.id === alert.sensorId);
          return {
            id: alert.id,
            severity: alert.severity,
            alertType: alert.alertType,
            sensorName: alert.sensorName || sensor?.name || 'Unknown Sensor',
            sensorLocation: alert.wetland || sensor?.wetland || 'Unknown Location',
            currentValue: alert.currentValue,
            safeRange: alert.safeRange,
            description: alert.description,
            timestamp: alert.createdAt.toISOString(),
            status: alert.status,
            confidenceScore: Math.max(50, confidenceScore - index * 5),
            summary: `Alert #${index + 1}: ${alert.alertType} anomaly detected at ${alert.sensorName || 'unknown sensor'}.`,
            possibleCause: generatePossibleCause([alert], sensors),
            suggestedAction: generateSuggestedAction([alert]),
          };
        })
      : [];

    return {
      riskScore,
      riskLabel,
      confidenceScore,
      summary,
      recommendation,
      trendAnalysis,
      possibleCause,
      suggestedAction,
      trendSummary,
      totalAlerts: activeAlerts.length,
      totalSensors: sensors.length,
      onlineSensors: sensors.filter(s => s.status === 'online').length,
      totalWetlands: [...new Set(sensors.map(s => s.wetland).filter(Boolean))].length,
      cards,
    };
  }
}

module.exports = new AIService();
