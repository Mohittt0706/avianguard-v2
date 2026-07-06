const { z } = require('zod');

const REPORT_TYPES = ['daily-water', 'pollution-trend', 'emergency', 'ai-prediction', 'compliance', 'custom'];
const REPORT_FORMATS = ['pdf', 'csv', 'excel'];

const createReportSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, 'Title is required').max(500),
    type: z.string().trim().min(1, 'Type is required'),
    format: z.enum(REPORT_FORMATS).optional(),
    district: z.string().trim().optional(),
    taluka: z.string().trim().optional(),
    wetland: z.string().trim().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    includeCharts: z.boolean().optional(),
    includeSensors: z.boolean().optional(),
    includeAI: z.boolean().optional(),
    includeCitizens: z.boolean().optional(),
  }),
});

const updateReportSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1).max(500).optional(),
    district: z.string().trim().optional(),
    taluka: z.string().trim().optional(),
    wetland: z.string().trim().optional(),
    scheduledFrequency: z.enum(['daily', 'weekly', 'monthly']).nullable().optional(),
    scheduledEnabled: z.boolean().optional(),
    scheduledRecipients: z.array(z.string()).optional(),
  }),
});

const reportQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    type: z.string().optional(),
    status: z.string().optional(),
    district: z.string().optional(),
    wetland: z.string().optional(),
    search: z.string().optional(),
  }),
});

module.exports = {
  createReportSchema,
  updateReportSchema,
  reportQuerySchema,
};
