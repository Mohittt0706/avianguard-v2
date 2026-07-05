const { z } = require('zod');

const ALERT_SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const ALERT_STATUSES = ['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'];

const createAlertSchema = z.object({
  body: z.object({
    sensorId: z.string().optional(),
    sensorName: z.string().optional(),
    wetland: z.string().optional(),
    alertType: z.string().min(1, 'Alert type is required'),
    severity: z.enum(ALERT_SEVERITIES),
    currentValue: z.number().optional(),
    safeRange: z.string().optional(),
    description: z.string().min(1, 'Description is required'),
  }),
});

const resolveAlertSchema = z.object({
  body: z.object({
    resolvedBy: z.string().min(1, 'Resolved by is required'),
  }),
});

const alertQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    status: z.string().optional(),
    severity: z.string().optional(),
    wetland: z.string().optional(),
    search: z.string().optional(),
  }),
});

module.exports = {
  createAlertSchema,
  resolveAlertSchema,
  alertQuerySchema,
  ALERT_SEVERITIES,
  ALERT_STATUSES,
};
