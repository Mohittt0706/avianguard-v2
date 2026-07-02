const logger = require('../utils/logger');

function registerHandlers(io) {
  io.on('connection', (socket) => {
    logger.debug(`Handler registered for socket: ${socket.id}`);

    socket.on('alert:acknowledge', async (data) => {
      try {
        logger.info('Alert acknowledge requested', { alertId: data.alertId, socketId: socket.id });
      } catch (error) {
        logger.error('Failed to acknowledge alert via socket', { error: error.message });
      }
    });

    socket.on('sensor:request-latest', async (data) => {
      try {
        logger.debug('Latest sensor data requested', { wetlandId: data.wetlandId, socketId: socket.id });
      } catch (error) {
        logger.error('Failed to get latest sensor data', { error: error.message });
      }
    });
  });
}

module.exports = { registerHandlers };
