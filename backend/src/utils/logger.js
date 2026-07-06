const fs = require('fs');
const path = require('path');
const env = require('../config/env');

const levels = { error: 0, warn: 1, info: 2, debug: 3 };
const currentLevel = env.NODE_ENV === 'production' ? 'info' : 'debug';

function extractLocation(stack) {
  if (!stack) return null;
  const lines = stack.split('\n');
  for (const line of lines) {
    const match = line.match(/at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/);
    if (match) {
      return { function: match[1], file: path.basename(match[2]), fullPath: match[2], line: parseInt(match[3]), col: parseInt(match[4]) };
    }
    const match2 = line.match(/at\s+(.+?):(\d+):(\d+)/);
    if (match2) {
      return { function: '<anonymous>', file: path.basename(match2[1]), fullPath: match2[1], line: parseInt(match2[2]), col: parseInt(match2[3]) };
    }
  }
  return null;
}

function formatMessage(level, message, meta) {
  const timestamp = new Date().toISOString();
  let extra = '';
  if (meta && typeof meta === 'object') {
    const { stack: _s, ...rest } = meta;
    const loc = extractLocation(meta.stack);
    if (loc) {
      extra = ` [${loc.file}:${loc.line} in ${loc.function}]`;
    }
    const metaStr = Object.keys(rest).length > 0 ? ` ${JSON.stringify(rest)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}]${extra} ${message}${metaStr}`;
  }
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}]${extra} ${message}${metaStr}`;
}

function writeToFile(message) {
  try {
    if (!fs.existsSync(env.LOG_DIR)) {
      fs.mkdirSync(env.LOG_DIR, { recursive: true });
    }
    const date = new Date().toISOString().split('T')[0];
    const filePath = path.join(env.LOG_DIR, `${date}.log`);
    fs.appendFileSync(filePath, `${message}\n`);
  } catch { /* ignore file write errors */ }
}

const logger = {
  error(message, meta) {
    if (levels[currentLevel] >= levels.error) {
      const msg = formatMessage('ERROR', message, meta);
      console.error(msg);
      if (meta && meta.stack) {
        console.error(meta.stack);
      }
      writeToFile(msg);
      if (meta && meta.stack) writeToFile(meta.stack);
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
