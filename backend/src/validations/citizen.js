const { z } = require('zod');

const createCitizenSchema = z.object({
  body: z.object({
    fullName: z.string().trim().min(2).max(100),
    mobile: z.string().trim().min(10).max(15),
    whatsapp: z.string().trim().optional(),
    email: z.string().email().optional().or(z.literal('')),
    dateOfBirth: z.string().optional(),
    gender: z.string().optional(),
    state: z.string().optional().default('Gujarat'),
    district: z.string().trim().min(1),
    taluka: z.string().optional(),
    village: z.string().optional(),
    pincode: z.string().optional(),
    nearbyWetland: z.string().trim().min(1),
    gpsLocation: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    distanceFromWetland: z.string().optional(),
    occupation: z.string().optional(),
    occupationOther: z.string().optional(),
    alertMethods: z.array(z.string()).optional().default([]),
    alertTypes: z.array(z.string()).optional().default([]),
    language: z.string().optional().default('Hindi'),
    emergencyName: z.string().optional(),
    emergencyMobile: z.string().optional(),
    emergencyRelationship: z.string().optional(),
    agree: z.boolean().optional(),
  }),
});

const updateCitizenSchema = z.object({
  body: z.object({
    fullName: z.string().trim().min(2).max(100).optional(),
    mobile: z.string().trim().min(10).max(15).optional(),
    whatsapp: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    dateOfBirth: z.string().optional(),
    gender: z.string().optional(),
    state: z.string().optional(),
    district: z.string().optional(),
    taluka: z.string().optional(),
    village: z.string().optional(),
    pincode: z.string().optional(),
    nearbyWetland: z.string().optional(),
    gpsLocation: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    distanceFromWetland: z.string().optional(),
    occupation: z.string().optional(),
    occupationOther: z.string().optional(),
    alertMethods: z.array(z.string()).optional(),
    alertTypes: z.array(z.string()).optional(),
    language: z.string().optional(),
    emergencyName: z.string().optional(),
    emergencyMobile: z.string().optional(),
    emergencyRelationship: z.string().optional(),
    status: z.enum(['PENDING', 'ACTIVE', 'REJECTED', 'PENDING_VERIFICATION', 'DISABLED']).optional(),
    riskLevel: z.string().optional(),
    rejectionReason: z.string().optional(),
    adminNotes: z.string().optional(),
  }),
  params: z.object({
    id: z.string().min(1),
  }),
});

const sendAlertSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1).max(200),
    severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    message: z.string().trim().min(1).max(2000),
    wetland: z.string().optional(),
    language: z.string().optional().default('Hindi'),
    deliveryMethod: z.string().optional().default('SMS'),
    alertType: z.string().optional(),
    description: z.string().optional(),
    recommendedAction: z.string().optional(),
  }),
  params: z.object({
    id: z.string().min(1),
  }),
});

const emergencyBroadcastSchema = z.object({
  body: z.object({
    wetland: z.string().trim().min(1),
    title: z.string().trim().min(1).max(200),
    severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    message: z.string().trim().min(1).max(2000),
    language: z.string().optional().default('Hindi'),
    deliveryMethod: z.string().optional().default('SMS'),
    alertType: z.string().optional(),
    description: z.string().optional(),
    recommendedAction: z.string().optional(),
  }),
});

const fcmTokenSchema = z.object({
  body: z.object({
    mobile: z.string().trim().min(10).max(15).optional(),
    citizenId: z.string().optional(),
    token: z.string().min(1),
  }).refine(data => data.mobile || data.citizenId, {
    message: 'Either mobile or citizenId is required',
  }),
});

const notificationInboxSchema = z.object({
  body: z.object({
    mobile: z.string().trim().min(10).max(15),
  }),
});

module.exports = {
  createCitizenSchema,
  updateCitizenSchema,
  sendAlertSchema,
  emergencyBroadcastSchema,
  fcmTokenSchema,
  notificationInboxSchema,
};
