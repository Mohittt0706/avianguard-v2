const { Server } = require('socket.io');
const logger = require('../utils/logger');
const env = require('../config/env');

let io = null;

function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: env.CORS_ORIGIN,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;

    if (!token) {
      return next(new Error('Authentication required'));
    }

    socket.token = token;
    next();
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    socket.on('subscribe:wetland', (wetlandId) => {
      socket.join(`wetland:${wetlandId}`);
      logger.debug(`Socket ${socket.id} joined wetland:${wetlandId}`);
    });

    socket.on('subscribe:alerts', () => {
      socket.join('alerts');
      logger.debug(`Socket ${socket.id} joined alerts room`);
    });

    socket.on('subscribe:sensors', (stationId) => {
      if (stationId) {
        socket.join(`sensors:${stationId}`);
      } else {
        socket.join('sensors');
      }
    });

    socket.on('unsubscribe:wetland', (wetlandId) => {
      socket.leave(`wetland:${wetlandId}`);
    });

    socket.on('unsubscribe:alerts', () => {
      socket.leave('alerts');
    });

    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected: ${socket.id} (${reason})`);
    });
  });

  logger.info('Socket.io initialized');
  return io;
}

function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}

function emitAlert(alert) {
  if (io) {
    io.to('alerts').emit('alert:new', alert);
    if (alert.wetland) {
      io.to(`wetland:${alert.wetland}`).emit('alert:new', alert);
    }
  }
}

function emitSensorReading(reading) {
  if (io) {
    io.to('sensors').emit('sensor:reading', reading);
    if (reading.station) {
      io.to(`sensors:${reading.station}`).emit('sensor:reading', reading);
    }
  }
}

function emitEvent(event, data) {
  if (io) {
    io.emit(event, data);
  }
}

module.exports = {
  initializeSocket,
  getIO,
  emitAlert,
  emitSensorReading,
  emitEvent,
};
