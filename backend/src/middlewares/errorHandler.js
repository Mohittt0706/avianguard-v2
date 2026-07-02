const { Prisma } = require('@prisma/client');
const logger = require('../utils/logger');
const AppError = require('../utils/AppError');

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
    response.stack = error.stack;
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
