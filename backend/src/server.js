const http = require('http');
const app = require('./app');
const env = require('./config/env');
const connectDatabase = require('./config/db');
const { initializeSocket } = require('./socket');
const { registerHandlers } = require('./socket/handlers');
const logger = require('./utils/logger');

const server = http.createServer(app);

const io = initializeSocket(server);
registerHandlers(io);

async function startServer() {
  try {
    await connectDatabase();

    server.listen(env.PORT, () => {
      logger.info(`AvianGuard server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
      logger.info(`API available at http://localhost:${env.PORT}/api/v1`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

const prisma = require('./config/database');

async function gracefulShutdown(signal) {
  logger.info(`${signal} received. Shutting down gracefully...`);
  server.close(() => {
    logger.info('HTTP server closed');
  });
  await prisma.$disconnect();
  logger.info('Prisma disconnected');
  process.exit(0);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

startServer();
