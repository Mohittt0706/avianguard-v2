const mongoose = require('mongoose');

const sensorStationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Station name is required'],
      trim: true,
    },
    stationId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    wetland: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wetland',
      required: true,
    },
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    altitude: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['online', 'offline', 'warning', 'maintenance'],
      default: 'offline',
    },
    firmwareVersion: { type: String, default: '' },
    batteryLevel: { type: Number, min: 0, max: 100, default: 100 },
    lastPingAt: Date,
    isActive: { type: Boolean, default: true },
    installedAt: { type: Date, default: Date.now },
    maintainedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

sensorStationSchema.index({ wetland: 1 });
sensorStationSchema.index({ status: 1 });
sensorStationSchema.index({ stationId: 1 });

module.exports = mongoose.model('SensorStation', sensorStationSchema);
