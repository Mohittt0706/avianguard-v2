const { z } = require('zod');

const createReadingSchema = z.object({
  body: z.object({
    temperature: z.number(),
    ph: z.number().min(0).max(14),
    tds: z.number().min(0),
    dissolvedOxygen: z.number().min(0),
    waterLevel: z.number().min(0),
    battery: z.number().min(0).max(100).optional(),
    signalStrength: z.number().min(0).max(100).optional(),
    timestamp: z.string().datetime().optional(),
  }),
});

const readingQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
});

module.exports = {
  createReadingSchema,
  readingQuerySchema,
};
