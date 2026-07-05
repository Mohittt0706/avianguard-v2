const prisma = require('./database');
const logger = require('../utils/logger');

async function connectDatabase() {
  try {
    await prisma.$connect();
    logger.info('PostgreSQL connected via Prisma');
    return prisma;
  } catch (error) {
    logger.error('Failed to connect to database:', {
      message: error.message,
      stack: error.stack,
      cause: 'PostgreSQL may not be running, or DATABASE_URL is wrong in .env',
      fix: 'Start PostgreSQL and verify DATABASE_URL in backend/.env matches your database',
    });
    throw error;
  }
}

module.exports = connectDatabase;
