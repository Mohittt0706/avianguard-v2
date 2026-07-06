const prisma = require('../config/database');
const logger = require('../utils/logger');

class SettingService {
  constructor() {
    this._defaults = null;
  }

  _getDefaultThresholds() {
    return {
      temperature_warning: 35,
      temperature_critical: 40,
      ph_min: 6.5,
      ph_max: 8.5,
      tds_limit: 500,
      dissolved_oxygen_min: 5,
      water_level_limit: 80,
    };
  }

  getDefaultSettings() {
    return {
      general: [
        { key: 'system_name', value: 'AvianGuard', label: 'System Name' },
        { key: 'organization', value: 'Gujarat Wetland Authority', label: 'Organization' },
        { key: 'deployment_mode', value: 'production', label: 'Deployment Mode' },
        { key: 'timezone', value: 'Asia/Kolkata', label: 'Timezone' },
        { key: 'language', value: 'English', label: 'Language' },
        { key: 'theme', value: 'dark', label: 'Theme' },
      ],
      ai: [
        { key: 'confidence_threshold', value: 75, label: 'Confidence Threshold' },
        { key: 'auto_detection', value: true, label: 'Auto Detection' },
        { key: 'auto_alert', value: true, label: 'Auto Alert' },
        { key: 'model', value: 'gemini-pro', label: 'AI Model' },
      ],
      'alert-rules': [
        { key: 'temperature_warning', value: 35, label: 'Temperature Warning Threshold' },
        { key: 'temperature_critical', value: 40, label: 'Temperature Critical Threshold' },
        { key: 'ph_min', value: 6.5, label: 'Minimum pH Level' },
        { key: 'ph_max', value: 8.5, label: 'Maximum pH Level' },
        { key: 'tds_limit', value: 500, label: 'TDS Limit (mg/L)' },
        { key: 'dissolved_oxygen_min', value: 5, label: 'Minimum Dissolved Oxygen (mg/L)' },
        { key: 'water_level_limit', value: 80, label: 'Water Level Limit (%)' },
      ],
      notifications: [
        { key: 'sms_enabled', value: true, label: 'SMS Notifications' },
        { key: 'whatsapp_enabled', value: true, label: 'WhatsApp Notifications' },
        { key: 'email_enabled', value: true, label: 'Email Notifications' },
        { key: 'push_enabled', value: false, label: 'Push Notifications' },
        { key: 'auto_notify_citizens', value: true, label: 'Auto Notify Citizens' },
        { key: 'auto_notify_officers', value: true, label: 'Auto Notify Officers' },
      ],
      sensors: [
        { key: 'refresh_interval', value: 30, label: 'Refresh Interval (seconds)' },
        { key: 'offline_timeout', value: 300, label: 'Offline Timeout (seconds)' },
        { key: 'auto_calibration', value: false, label: 'Auto Calibration' },
        { key: 'live_monitoring', value: true, label: 'Live Monitoring' },
      ],
      security: [
        { key: 'session_timeout', value: 60, label: 'Session Timeout (minutes)' },
        { key: 'two_factor_enabled', value: false, label: 'Two-Factor Authentication' },
        { key: 'login_attempts', value: 5, label: 'Max Login Attempts' },
        { key: 'password_min_length', value: 8, label: 'Minimum Password Length' },
      ],
      integrations: [
        { key: 'google_maps', value: 'connected', label: 'Google Maps' },
        { key: 'smtp_email', value: 'configured', label: 'SMTP Email' },
        { key: 'twilio_sms', value: 'not_configured', label: 'Twilio SMS' },
        { key: 'whatsapp_api', value: 'not_configured', label: 'WhatsApp API' },
        { key: 'gemini_api', value: 'configured', label: 'Gemini API' },
      ],
    };
  }

  async seedDefaults() {
    const defaults = this.getDefaultSettings();
    let seeded = 0;

    for (const [category, items] of Object.entries(defaults)) {
      for (const item of items) {
        const existing = await prisma.setting.findUnique({
          where: { key: item.key },
        });
        if (!existing) {
          await prisma.setting.create({
            data: {
              key: item.key,
              value: item.value,
              category,
              label: item.label,
            },
          });
          seeded++;
        }
      }
    }

    logger.info(`SettingService: seeded ${seeded} default settings`);
    return seeded;
  }

  async getSettings(category) {
    const defaults = this.getDefaultSettings();
    const allDefaults = Object.values(defaults).flat();
    if (allDefaults.length === 0 || !this._defaults) {
      this._defaults = defaults;
    }

    let where = {};
    if (category) {
      where = { category };
    }

    let rows = await prisma.setting.findMany({
      where,
      orderBy: { key: 'asc' },
    });

    if (rows.length === 0) {
      await this.seedDefaults();
      rows = await prisma.setting.findMany({
        where,
        orderBy: { key: 'asc' },
      });
    }

    const grouped = {};
    for (const row of rows) {
      const cat = row.category || 'general';
      if (!grouped[cat]) {
        grouped[cat] = [];
      }
      grouped[cat].push({
        key: row.key,
        value: row.value,
        label: row.label,
      });
    }

    if (category && grouped[category]) {
      return { [category]: grouped[category] };
    }

    return grouped;
  }

  async getSetting(key) {
    const row = await prisma.setting.findUnique({
      where: { key },
    });
    if (!row) {
      const defaults = this.getDefaultSettings();
      for (const items of Object.values(defaults)) {
        const def = items.find((d) => d.key === key);
        if (def) {
          return { key: def.key, value: def.value, label: def.label };
        }
      }
      return null;
    }
    return { key: row.key, value: row.value, label: row.label };
  }

  async updateSetting(key, value, userId, userName) {
    const existing = await prisma.setting.findUnique({ where: { key } });

    const data = {
      value,
      updatedAt: new Date(),
    };

    if (!existing) {
      const defaults = this.getDefaultSettings();
      for (const [cat, items] of Object.entries(defaults)) {
        const def = items.find((d) => d.key === key);
        if (def) {
          data.category = cat;
          data.label = def.label;
          break;
        }
      }
    } else {
      data.category = existing.category;
      data.label = existing.label;
    }

    const setting = await prisma.setting.upsert({
      where: { key },
      create: {
        key,
        value,
        category: data.category || 'general',
        label: data.label || key,
      },
      update: {
        value,
        label: data.label,
        category: data.category,
        updatedAt: new Date(),
      },
    });

    await this.logAudit(
      'update',
      'settings',
      { key, value },
      userId,
      userName
    );

    return { key: setting.key, value: setting.value, label: setting.label };
  }

  async bulkUpdate(settings, userId, userName) {
    const keys = [];

    for (const { key, value } of settings) {
      const existing = await prisma.setting.findUnique({ where: { key } });

      if (existing) {
        await prisma.setting.update({
          where: { key },
          data: { value, updatedAt: new Date() },
        });
      } else {
        const defaults = this.getDefaultSettings();
        let category = 'general';
        let label = key;

        for (const [cat, items] of Object.entries(defaults)) {
          const def = items.find((d) => d.key === key);
          if (def) {
            category = cat;
            label = def.label;
            break;
          }
        }

        await prisma.setting.create({
          data: { key, value, category, label },
        });
      }

      keys.push(key);
    }

    await this.logAudit(
      'bulk_update',
      'settings',
      { keys },
      userId,
      userName
    );

    return { count: settings.length };
  }

  async resetSetting(key) {
    const defaults = this.getDefaultSettings();
    let defaultVal = null;

    for (const items of Object.values(defaults)) {
      const def = items.find((d) => d.key === key);
      if (def) {
        defaultVal = def;
        break;
      }
    }

    if (!defaultVal) {
      throw new Error(`No default value found for setting: ${key}`);
    }

    const setting = await prisma.setting.upsert({
      where: { key },
      create: {
        key,
        value: defaultVal.value,
        category: defaultVal.category || 'general',
        label: defaultVal.label,
      },
      update: {
        value: defaultVal.value,
        updatedAt: new Date(),
      },
    });

    return { key: setting.key, value: setting.value, label: setting.label };
  }

  async getAlertThresholds() {
    const rows = await prisma.setting.findMany({
      where: { category: 'alert-rules' },
    });

    if (rows.length === 0) {
      await this.seedDefaults();
      const defaults = this.getDefaultSettings();
      const items = defaults['alert-rules'] || [];
      const result = {};
      for (const item of items) {
        result[item.key] = item.value;
      }
      return result;
    }

    const result = {};
    for (const row of rows) {
      result[row.key] = row.value;
    }
    return result;
  }

  async updateAlertThresholds(thresholds, userId, userName) {
    const keys = [];

    for (const [key, value] of Object.entries(thresholds)) {
      const existing = await prisma.setting.findUnique({ where: { key } });

      if (existing) {
        await prisma.setting.update({
          where: { key },
          data: { value, category: 'alert-rules', updatedAt: new Date() },
        });
      } else {
        await prisma.setting.create({
          data: {
            key,
            value,
            category: 'alert-rules',
            label: key
              .replace(/_/g, ' ')
              .replace(/\b\w/g, (c) => c.toUpperCase()),
          },
        });
      }

      keys.push(key);
    }

    await this.logAudit(
      'bulk_update',
      'alert-rules',
      { keys, thresholds },
      userId,
      userName
    );

    return { count: Object.keys(thresholds).length };
  }

  async getSystemHealth() {
    const health = {
      backend: {
        status: 'online',
        message: 'Running',
        uptime: Math.floor(process.uptime()),
      },
      postgres: {
        status: 'offline',
        message: 'Disconnected',
        latency: 0,
      },
      mongodb: {
        status: 'offline',
        message: 'Not configured',
      },
      socketio: {
        status: 'online',
        message: 'Active connections: 0',
      },
      ai_engine: {
        status: 'online',
        message: 'Model loaded',
      },
    };

    try {
      const start = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      const latency = Date.now() - start;
      health.postgres = {
        status: 'online',
        message: 'Connected',
        latency,
      };
    } catch (err) {
      health.postgres = {
        status: 'offline',
        message: err.message || 'Connection failed',
        latency: 0,
      };
    }

    try {
      if (global.io) {
        const connections = global.io.engine
          ? global.io.engine.clientsCount
          : 0;
        health.socketio = {
          status: 'online',
          message: `Active connections: ${connections}`,
        };
      }
    } catch (_) {
      // keep default
    }

    return health;
  }

  async getAuditLogs(limit = 50, offset = 0) {
    const logs = await prisma.systemAuditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await prisma.systemAuditLog.count();

    return { logs, total, limit, offset };
  }

  async logAudit(action, category, details, userId, userName, ipAddress) {
    try {
      await prisma.systemAuditLog.create({
        data: {
          action,
          category,
          details: details || {},
          userId: userId || null,
          user_name: userName || null,
          ipAddress: ipAddress || null,
        },
      });
    } catch (err) {
      logger.error('Failed to create audit log:', err.message);
    }
  }
}

module.exports = new SettingService();
