const { z } = require('zod');

const ROLES = ['SUPER_ADMIN', 'ADMIN', 'OPERATOR', 'VIEWER'];

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must not exceed 128 characters');

const emailSchema = z
  .string()
  .email('Invalid email format')
  .toLowerCase()
  .trim();

const registerSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must not exceed 100 characters'),
    email: emailSchema,
    password: passwordSchema,
    role: z.enum(ROLES).optional(),
    district: z.string().trim().optional(),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required'),
  }),
});

const createUserSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must not exceed 100 characters'),
    email: emailSchema,
    password: passwordSchema,
    role: z.enum(ROLES),
    district: z.string().trim().optional(),
    assignedWetland: z.string().trim().optional(),
  }),
});

const updateUserSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100).optional(),
    email: emailSchema.optional(),
    role: z.enum(ROLES).optional(),
    district: z.string().trim().optional(),
    assignedWetland: z.string().trim().optional(),
    isActive: z.boolean().optional(),
  }),
});

const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
  }),
});

const forgotPasswordSchema = z.object({
  body: z.object({
    email: emailSchema,
  }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Reset token is required'),
    password: passwordSchema,
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
  createUserSchema,
  updateUserSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  ROLES,
};
