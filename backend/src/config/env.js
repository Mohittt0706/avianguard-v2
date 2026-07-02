const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5000,

  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/avianguard',

  JWT_SECRET: process.env.JWT_SECRET || 'avianguard-jwt-secret-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'avianguard-refresh-secret-change-in-production',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',

  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',

  UPLOAD_DIR: path.resolve(__dirname, '../uploads'),
  LOG_DIR: path.resolve(__dirname, '../logs'),
  MAX_FILE_SIZE: 5 * 1024 * 1024,
};

module.exports = env;
