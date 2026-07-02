const prisma = require('./database');
const logger = require('../utils/logger');
const { connectMongoose } = require('./mongoose');

async function connectDatabase() {
  try {
    await prisma.$connect();
    logger.info('PostgreSQL connected via Prisma');

    try {
      await connectMongoose();
    } catch {
      logger.warn('MongoDB connection failed — dashboard features may be limited');
    }

    return prisma;
  } catch (error) {
    logger.error('Failed to connect to database:', error.message);
    process.exit(1);
  }
}

module.exports = connectDatabase;
