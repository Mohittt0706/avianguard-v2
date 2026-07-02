const fs = require('fs');
const path = require('path');
const env = require('../config/env');

const levels = { error: 0, warn: 1, info: 2, debug: 3 };

const currentLevel = env.NODE_ENV === 'production' ? 'info' : 'debug';

function formatMessage(level, message, meta) {
  const timestamp = new Date().toISOString();
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
}

function writeToFile(message) {
  try {
    if (!fs.existsSync(env.LOG_DIR)) {
      fs.mkdirSync(env.LOG_DIR, { recursive: true });
    }
    const date = new Date().toISOString().split('T')[0];
    const filePath = path.join(env.LOG_DIR, `${date}.log`);
    fs.appendFileSync(filePath, `${message}\n`);
  } catch {
  }
}

const logger = {
  error(message, meta) {
    if (levels[currentLevel] >= levels.error) {
      const msg = formatMessage('ERROR', message, meta);
      console.error(msg);
      writeToFile(msg);
    }
  },

  warn(message, meta) {
    if (levels[currentLevel] >= levels.warn) {
      const msg = formatMessage('WARN', message, meta);
      console.warn(msg);
      writeToFile(msg);
    }
  },

  info(message, meta) {
    if (levels[currentLevel] >= levels.info) {
      const msg = formatMessage('INFO', message, meta);
      console.log(msg);
      writeToFile(msg);
    }
  },

  debug(message, meta) {
    if (levels[currentLevel] >= levels.debug) {
      const msg = formatMessage('DEBUG', message, meta);
      console.log(msg);
      writeToFile(msg);
    }
  },
};

module.exports = logger;
