const { Prisma } = require('@prisma/client');
const logger = require('../utils/logger');
const AppError = require('../utils/AppError');

function extractLocation(stack) {
  if (!stack) return null;
  const lines = stack.split('\n');
  for (const line of lines) {
    const match = line.match(/at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/);
    if (match) {
      return { function: match[1], file: match[2].replace(/\\/g, '/').split('/').pop(), fullPath: match[2], line: parseInt(match[3]), col: parseInt(match[4]) };
    }
    const match2 = line.match(/at\s+(.+?):(\d+):(\d+)/);
    if (match2) {
      return { function: '<anonymous>', file: match2[1].replace(/\\/g, '/').split('/').pop(), fullPath: match2[1], line: parseInt(match2[2]), col: parseInt(match2[3]) };
    }
  }
  return null;
}

function errorHandler(err, req, res, _next) {
  let error = { ...err, message: err.message, stack: err.stack };

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        const field = err.meta?.target?.[0] || 'field';
        error = new AppError(`Duplicate value for ${field}. Please use another value.`, 409);
        break;
      case 'P2025':
        error = new AppError('Resource not found', 404);
        break;
      case 'P2003':
        error = new AppError('Referenced resource does not exist', 400);
        break;
      case 'P2014':
        error = new AppError('Constraint violation', 400);
        break;
      default:
        error = new AppError('Database error', 500);
        break;
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    error = new AppError('Invalid data provided', 400);
  }

  const statusCode = error.statusCode || 500;
  const isDev = process.env.NODE_ENV === 'development';

  const response = {
    success: false,
    status: statusCode,
    message: error.message || 'Internal server error',
  };

  if (isDev) {
    const loc = extractLocation(err.stack);
    response.debug = {
      stack: err.stack,
      file: loc ? loc.file : null,
      line: loc ? loc.line : null,
      function: loc ? loc.function : null,
      cause: err.cause || null,
    };
  }

  if (statusCode === 500) {
    logger.error('Unhandled error:', {
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
    });
  }

  res.status(statusCode).json(response);
}

module.exports = errorHandler;
