const http = require('http');
const { execSync } = require('child_process');
const app = require('./app');
const env = require('./config/env');
const connectDatabase = require('./config/db');
const { initializeSocket } = require('./socket');
const { registerHandlers } = require('./socket/handlers');
const logger = require('./utils/logger');

const server = http.createServer(app);

const io = initializeSocket(server);
registerHandlers(io);

function killPortProcess(port) {
  try {
    if (process.platform === 'win32') {
      const result = execSync(
        `for /f "tokens=5" %a in ('netstat -aon ^| findstr :${port} ^| findstr LISTENING') do taskkill /F /PID %a`,
        { stdio: 'pipe', timeout: 5000 }
      );
      return true;
    } else {
      execSync(`lsof -ti:${port} | xargs kill -9 2>/dev/null`, { stdio: 'pipe', timeout: 5000 });
      return true;
    }
  } catch {
    return false;
  }
}

function listenWithRetry(port, retries = 2) {
  server.listen(port, () => {
    logger.info(`AvianGuard server running on port ${port} in ${env.NODE_ENV} mode`);
    logger.info(`API available at http://localhost:${port}/api/v1`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && retries > 0) {
      logger.warn(`Port ${port} is in use. Attempting to free it... (${retries} retries left)`);
      const killed = killPortProcess(port);
      if (killed) {
        setTimeout(() => {
          server.removeAllListeners('error');
          listenWithRetry(port, retries - 1);
        }, 2000);
      } else {
        logger.error(`Could not free port ${port}. Please stop the process manually.`);
        logger.error(`Run: netstat -ano | findstr :${port}`);
        process.exit(1);
      }
    } else {
      logger.error('Server failed to start:', {
        message: err.message,
        code: err.code,
        cause: err.code === 'EADDRINUSE'
          ? `Port ${port} is already in use by another process`
          : 'Unknown error',
        fix: err.code === 'EADDRINUSE'
          ? `Kill the process using port ${port}, or change PORT in .env`
          : 'Check server logs for details',
      });
      process.exit(1);
    }
  });
}

async function startServer() {
  try {
    await connectDatabase();
    listenWithRetry(env.PORT);
  } catch (error) {
    logger.error('Failed to start server:', {
      message: error.message,
      stack: error.stack,
      cause: error.cause || 'Database connection failed',
      fix: 'Check that PostgreSQL is running and DATABASE_URL is correct in .env',
    });
    process.exit(1);
  }
}

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Promise Rejection:', {
    message: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error ? reason.stack : null,
    cause: 'A Promise was rejected without a .catch() handler',
    fix: 'Add .catch() to the Promise or wrap in try/catch with await',
  });
});

process.on('uncaughtException', (error) => {
  if (error.code === 'EADDRINUSE') return;
  logger.error('Uncaught Exception:', {
    message: error.message,
    stack: error.stack,
    file: error.stack ? error.stack.split('\n')[1]?.trim() : 'unknown',
    cause: error.cause || 'An error escaped all error handlers',
    fix: 'Fix the root cause in the file/line shown in the stack trace above',
  });
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
