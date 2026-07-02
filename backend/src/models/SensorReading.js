const mongoose = require('mongoose');

const sensorReadingSchema = new mongoose.Schema(
  {
    sensor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sensor',
      required: true,
    },
    station: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SensorStation',
      required: true,
    },
    wetland: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wetland',
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    unit: { type: String, default: '' },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
    metadata: {
      batteryLevel: Number,
      signalStrength: Number,
      firmwareVersion: String,
    },
  },
  {
    timestamps: true,
  }
);

sensorReadingSchema.index({ sensor: 1, timestamp: -1 });
sensorReadingSchema.index({ station: 1, timestamp: -1 });
sensorReadingSchema.index({ wetland: 1, timestamp: -1 });
sensorReadingSchema.index({ timestamp: -1 });
sensorReadingSchema.index(
  { sensor: 1, timestamp: 1 },
  { expireAfterSeconds: 2592000 }
);

module.exports = mongoose.model('SensorReading', sensorReadingSchema);
