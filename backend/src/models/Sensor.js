const mongoose = require('mongoose');

const sensorSchema = new mongoose.Schema(
  {
    sensorId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    station: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SensorStation',
      required: true,
    },
    type: {
      type: String,
      enum: ['temperature', 'humidity', 'water_level', 'ph', 'tds', 'turbidity', 'dissolved_oxygen', 'rainfall', 'wind_speed', 'wind_direction', 'solar_radiation'],
      required: true,
    },
    unit: { type: String, default: '' },
    model: { type: String, default: '' },
    manufacturer: { type: String, default: '' },
    status: {
      type: String,
      enum: ['active', 'inactive', 'faulty', 'calibrating'],
      default: 'active',
    },
    isActive: { type: Boolean, default: true },
    lastReading: {
      value: Number,
      recordedAt: Date,
    },
    calibrationDate: Date,
    nextCalibrationDate: Date,
    installedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

sensorSchema.index({ station: 1 });
sensorSchema.index({ type: 1 });
sensorSchema.index({ status: 1 });
sensorSchema.index({ sensorId: 1 });

module.exports = mongoose.model('Sensor', sensorSchema);
