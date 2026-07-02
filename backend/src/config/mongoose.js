const mongoose = require('mongoose');
const logger = require('../utils/logger');

async function connectMongoose() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/avianguard';
  try {
    await mongoose.connect(uri, { bufferCommands: false });
    logger.info('MongoDB connected via Mongoose');
  } catch (error) {
    logger.error('Failed to connect to MongoDB:', error.message);
    throw error;
  }
}

module.exports = { connectMongoose };
