const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const env = require('./config/env');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const logger = require('./utils/logger');

const app = express();

app.use(helmet());

app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev', {
    stream: { write: (message) => logger.info(message.trim()) },
  }));
}

app.use(express.static(path.resolve(__dirname, '../public')));

app.use('/api/v1', routes);

app.get('/', (_req, res) => {
  res.json({
    name: 'AvianGuard API',
    version: '1.0.0',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

app.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    status: 404,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

app.use(errorHandler);

module.exports = app;
